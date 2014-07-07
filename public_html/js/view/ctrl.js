if(typeof view==="undefined"){view={};}
if(typeof view.ctrl==="undefined"){view.ctrl={};}
$.extend(view.ctrl,{
    template:"",
    div:null,
    tooltipdiv:null,
    tooldelay:false,
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
            }else{
                this.settings[ctrl]=!this.settings[ctrl];
            }
            this.render();
        },this))
        .on("mouseover","div.ctrl",$.proxy(function(event){
            var ctrl=$(event.currentTarget).attr("data-ctrl");
            this.tooldelay=setTimeout(function(){
                view.ctrl.showTooltip(event.currentTarget);
            },1000);
        },this))
        .on("mouseout","div.ctrl",$.proxy(function(event){
            if(this.tooldelay!==false){clearTimeout(this.tooldelay);}
            this.tooldelay=false;
            this.tooltipdiv.hide();
    
        },this));
    },
    showTooltip:function(ctrldiv){
        var ctrl=$(ctrldiv).attr("data-ctrl");
        var off = $(ctrldiv).offset();
        this.tooltipdiv.css({"left":(off.left)+"px","top":(off.top+25)+"px"});
        this.tooltipdiv.html(this.tips[ctrl]);
        this.tooltipdiv.show();
        
    }
});
