if(typeof view==="undefined"){view={};}
if(typeof view.ctrl==="undefined"){view.ctrl={};}
$.extend(view.ctrl,{
    template:"",
    div:null,
    tooltipdiv:null,
    tooldelay:false,
    resizing:false,  // event 
    temp:{},
    tips:{play:"Play",stop:"Stop",measure:"Measure",loop:"Loop",resize:"Resize",resol:"Resolution",reset:"Reset",pict:"Picture"},
    settings:{play:false,measure:false,loop:true,resize:false,resol:100},  // temporary
    init:function(){
        this.div=$("#ctrl_cont");
        this.tooltipdiv=$("#tooltip");
        $.get("templates/ctrl.html",$.proxy(function(data){
            this.template=data;
            this.render();
            this.bind();
        },this));
    },
    getSettings:function(){
        return this.settings;
    },
    render:function(){
        var rendered=Mustache.render(this.template,{sett:this.getSettings()});
        this.div.html(rendered);
    },
    bind:function (){
        //var thisctrl=this;
        this.div
        .on("click","div.ctrl",$.proxy(function(event){
            var ctrl=event.currentTarget.getAttribute("data-ctrl");
            //alert(ctrl);
            if(ctrl==="resol"){
                this.settings.resol+=100;
                if(this.settings.resol===600){this.settings.resol=100;}
            }else if(ctrl==="resize"){
                
            }else{
                this.settings[ctrl]=!this.settings[ctrl];
            }
            this.render();
        },this))
        .on("mousedown","#resize_ctrl",$.proxy(function(event){
            this.settings.resize=true;
            this.stopTip();
            var div=$("#main_cont");
            this.temp.resizepos={x:event.pageX-div.width(),y:event.pageY-div.height()};
            $("body").on("mousemove",$.proxy(function(event){
                this.stopTip();
                this.resize(event);
            },this));
            $("body").on("mouseup",$.proxy(function(event){
                this.settings.resize=false;
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
                $("#cont").css({width:Math.max(400,this.resizing.pageX-this.temp.resizepos.x)+"px"});
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
            this.tooldelay=setTimeout(function(){
                view.ctrl.showTooltip(event.currentTarget,tips);
            },1500);
        },this))
        .on("mouseout","div.ctrl",$.proxy(this.stopTip,this));
        
    },
    showTooltip:function(ctrldiv,tips){
        if(!tips){tips=this.tips;}
        var ctrl=$(ctrldiv).attr("data-ctrl");
        var off = $(ctrldiv).offset();
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
