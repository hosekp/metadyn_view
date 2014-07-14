if(typeof view==="undefined"){view={};}
if(typeof view.axi==="undefined"){view.axi={};}
$.extend(view.axi,{
    tips:{up:"Zvýšit",down:"Snížit",select:"Změnit osy",auto:"Automatická osa"},
    div:{},
    template:"",
    menuwidth:40,
    autoset:true,
    init:function(){
        $.get("templates/axi.html",$.proxy(this.loaded,this),"text");
    },
    loaded:function(template){
        if(template){
            this.template=template;
        }
        this.render();
        this.bind();
    },
    render:function(){
        var template=this.template;
        this.div.$cancont=$("#canvas_cont");
        this.div.$main_cont=$("#main_cont");
        var rendered=Mustache.render(template,$.extend({},this.tips,{autoset:this.autoset?"on":""}));
        this.div.$main_cont.html(rendered);
        this.div.$x=$("#axi_x");
        this.div.$y=$("#axi_y");
        this.div.$select=$("#axi_select");
        this.div.$z_auto=$("#axi_z_auto");
        this.div.$z_cont=$("#axi_z_cont");
        this.div.$z=$("#axi_z");
        this.div.$z_up=$("#axi_z_up");
        this.div.$z_down=$("#axi_z_down");
        this.div.$x.before(this.div.$cancont);
        this.arrange();
    },
    arrange:function(){
        this.div.$y.css({top:"0px",left:"0px",height:"100%",width:this.menuwidth+"px"}).css({height:"-="+this.menuwidth+"px"});
        this.div.$select.css({top:"100%",left:"0px",height:this.menuwidth+"px",width:this.menuwidth+"px"}).css({top:"-="+this.menuwidth+"px"});
        this.div.$cancont.css({top:"0px",left:this.menuwidth+"px",height:"100%",width:"100%"}).css({height:"-="+this.menuwidth+"px",width:"-="+(2*this.menuwidth)+"px"});
        this.div.$x.css({top:"100%",left:this.menuwidth+"px",height:this.menuwidth+"px",width:"100%"}).css({top:"-="+this.menuwidth+"px",width:"-="+(2*this.menuwidth)+"px"});
        this.div.$z_cont.css({top:"0px",left:"100%",height:"100%",width:this.menuwidth+"px"}).css({left:"-="+this.menuwidth+"px"});
        this.div.$z_up.css({top:"0px",width:this.menuwidth+"px",height:this.menuwidth+"px"});
        this.div.$z.css({top:this.menuwidth+"px",width:this.menuwidth+"px",height:"100%"}).css({height:"-="+(3*this.menuwidth)+"px"});
        this.div.$z_down.css({top:"100%",width:this.menuwidth+"px",height:this.menuwidth+"px"}).css({top:"-="+(2*this.menuwidth)+"px"});
        this.div.$z_auto.css({top:"100%",width:this.menuwidth+"px",height:this.menuwidth+"px"}).css({top:"-="+(this.menuwidth)+"px"});
        draw.gl.resize();
    },
    bind:function (){
        //var thisctrl=this;
        this.div.$main_cont
        .on("click","div.ctrl",$.proxy(function(event){
            var ctrl=event.currentTarget.getAttribute("data-ctrl");
            //alert(ctrl);
            if(ctrl==="auto"){
                this.autoset=!this.autoset;
                if(this.autoset){
                    this.div.$z_auto.addClass("on");
                }else{
                    this.div.$z_auto.removeClass("on");
                }
                //this.div.$z_auto.children("img").attr("src","img/new/auto"+(this.autoset?"_on":"")+".png");
            }else{
            }
        },this));
        view.ctrl.bindTips(this.div.$main_cont,this.tips);
    }
});