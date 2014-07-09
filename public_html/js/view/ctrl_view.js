if(typeof view==="undefined"){view={};}
if(typeof view.ctrl==="undefined"){view.ctrl={};}
$.extend(view.ctrl,{
    template:"",
    div:null,
    tooltipdiv:null,
    tooldelay:false,
    width:600,
    resizing:false,  // event 
    temp:{resizepos:false},
    tips:{play:"Play",stop:"Stop",measure:"Measure",loop:"Loop",resize:"Resize",resol:"Resolution",reset:"Reset",pict:"Picture",slider:"Slider"},
    //settings:{play:false,measure:false,loop:true,resize:false,resol:100},  // temporary
    init:function(){
        this.div=$("#ctrl_cont");
        this.tooltipdiv=$("#tooltip");
        $.get("templates/ctrl.html",$.proxy(function(data){
            this.template=data;
            this.render();
            this.bind();
            this.slide.init();
        },this));
    },
    getSettings:function(){
        var sett=control.settings;
        return {play:sett.play.get(),measure:sett.measure.get(),loop:sett.loop.get(),resol:sett.resol.get(),resize:!!this.temp.resizepos,slider:this.slide.left};
    },
    render:function(){
        var vars={sett:this.getSettings()};
        var rendered=Mustache.render(this.template,vars);
        this.div.html(rendered);
    },
    bind:function (){
        //var thisctrl=this;
        this.div
        .on("click","div.ctrl",$.proxy(function(event){
            var ctrl=event.currentTarget.getAttribute("data-ctrl");
            //alert(ctrl);
            if(ctrl==="resol"){
                var val=control.settings.resol.get();
                //this.settings.resol+=100;
                //if(this.settings.resol===600){this.settings.resol=100;}
                control.settings.resol.set((val)%500+100);
            }else if(ctrl==="resize"){
                
            }else if(ctrl==="loop" || ctrl==="measure" || ctrl==="play"){
                control.settings[ctrl].toggle();
            }
            this.render();
        },this))
        .on("mousedown","#resize_ctrl",$.proxy(function(event){
            //this.settings.resize=true;
            this.stopTip();
            var div=$("#main_cont");
            this.temp.resizepos={x:event.pageX-div.width(),y:event.pageY-div.height()};
            this.render();
            $("body").on("mousemove",$.proxy(function(event){
                this.resize(event);
                this.stopTip();
            },this));
            $("body").on("mouseup",$.proxy(function(event){
                //this.settings.resize=false;
                this.temp.resizepos=false;
                this.render();
                this.resize(event);
                $("body").off("mousemove");
                $("body").off("mouseup");
                $("body").off("mouseout");
            },this));
            /*$("body").on("mouseout",$.proxy(function(event){
                this.render();
                this.resize(event);
                this.settings.resize=false;
                $("body").off("mousemove");
                $("body").off("mouseup");
                $("body").off("mouseout");
            },this));*/
            this.render();
            
            
        },this));
        this.bindTips(this.div,this.tips);
    },
    resize:function(event){
        /*$("#cont").css({width:Math.max(400,event.pageX-this.temp.resizepos.x)+"px"});
        $("#main_cont").css({height:Math.max(300,event.pageY-this.temp.resizepos.y)+"px"});
        view.axi.arrange();*/
        if(this.resizing===false){
            setTimeout($.proxy(function(){
                var wid=Math.max(400,this.resizing.pageX-this.temp.resizepos.x)+"px";
                this.width=wid;
                $("#cont").css({width:wid});
                $("#main_cont").css({height:Math.max(300,this.resizing.pageY-this.temp.resizepos.y)+"px"});
                view.axi.arrange();
                this.resizing=false;
            },this),50);
        }
        this.resizing=event;
    },
    bindTips:function(div,tips){
        div
        .on("mouseover","div.ctrl",$.proxy(function(event){
            //var ctrl=$(event.currentTarget).attr("data-ctrl");
            var tar=event.currentTarget;
            //manage.console.debug("CTRL="+$(tar).attr("id"));
            this.tooldelay=setTimeout(function(){
                //manage.console.debug("showtip="+$(div).attr("id"));
                view.ctrl.showTooltip(tar,tips);
            },1500);
        },this))
        .on("mouseout","div.ctrl",$.proxy(this.stopTip,this));
        
    },
    showTooltip:function(ctrldiv,tips){
        var $ctrl=$(ctrldiv);
        if($ctrl.is(":hidden")){return;}
        if(!tips){tips=this.tips;}
        //manage.console.debug("caller is " + arguments.callee.caller.toString());
        //manage.console.debug("CTRL="+$(ctrldiv).attr("id"));
        var ctrl=$ctrl.attr("data-ctrl");
        var off = $ctrl.offset();
        this.tooltipdiv.css({"left":(off.left)+"px","top":(off.top+25)+"px"});
        this.tooltipdiv.html(tips[ctrl]);
        this.tooltipdiv.show();
    },
    stopTip:function(){
        if(this.tooldelay!==false){
            clearTimeout(this.tooldelay);
            this.tooldelay=false;
            this.tooltipdiv.hide();
        }
    }
});
view.ctrl.slide={
    eventpos:null,
    ctrl:view.ctrl,
    left:100,
    init:function(){
        this.bind();
    },
    byratio:function(val){
        var lft=((this.width-10)*val);
        this.move(lft);
    },
    bind:function(){
        this.ctrl.div
        .on("mousedown","#slider",$.proxy(function(event){
            this.eventpos=event.pageX-$("#slider").position().left;
            $("body").on("mousemove",$.proxy(function(event){
                //manage.console.debug("mouse.which="+event.which);
                //if(event.which!==1){this.mouseup(event);}
                this.move(event.pageX-this.eventpos);
                //$("#slider").css("left",Math.max(Math.min(event.pageX-this.eventpos,this.ctrl.width-10),0));
            },this));
            $("body").on("mouseup",$.proxy(this.mouseup,this));
        },this));
    },
    mouseup:function(event){
        $("body").off("mousemove");
        $("body").off("mouseup");
        $("body").off("mouseout");
        this.eventpos=false;
        
    },
    move:function(lft){
        //manage.console.debug("left="+left);
        this.left=lft;
        //div.css("left",lft);
        $("#slider").css("left",Math.max(Math.min(lft,this.ctrl.width-20),0));
    }
};
