if(typeof control==="undefined"){control={};}
if(typeof control.settings==="undefined"){control.settings={};}
$.extend(control.settings,{
    hashRequested:false,
    shortdict:{},
    init:function(){
        this.play=this.create(false);
        this.measure=this.create(false);
        this.speed=this.create(0.3,"spd");
        this.resol=this.create(128,"res");
        this.loop=this.create(true,"lop");
        
        this.height=this.create(1,"hei");
        this.ncv=this.create(0);
        this.loglvl=this.create(4,"log");
        this.axi_x=this.create(0);
        this.axi_y=this.create(1);
        this.axi_auto=this.create(true,"axa");
        this.zoom=this.create(1,"zom");
        this.frameposx=this.create(1,"pox");
        this.frameposy=this.create(1,"poy");
        this.resol.call=function(){
            manage.manager.setResol();
        };
        this.play.call=function(){
            if(control.settings.play.value){
                control.control.start();
            }else{
                control.control.stop();
            }
        };
        this.loop.call=function(){
        };
        /*this.measure.call=function(){
            if(control.settings.measure.value){
                control.measure.bind();
            }else{
                control.measure.unbind();
            }
        };*/
        this.ncv.call=function(){
            view.axi.needArrange=true;
        };
        this.readHash();
    },
    readHash:function(){
        var hashstr=window.location.hash;
        if(hashstr){
            var hash={};
            hashstr=hashstr.substring(1);
            var hashspl=hashstr.split("&");
            for(var i=0;i<hashspl.length;i++){
                var hsspl=hashspl[i].split("=");
                if(hsspl.length>1){
                    hash[hsspl[0]]=hsspl[1];
                }
            }
            for( var key in hash){
                if(this.shortdict[key]){
                    this.shortdict[key].parse(hash[key]);
                }
            }
            this.hashRequested=true;
        }
    },
    newHash:function(){
        if(!this.hashRequested){return;}
        if(view.ctrl.inited){
            view.ctrl.render();
        }
        var ret="";
        //if(this.play.value!==this.play.def){ret+="&run="+this.play.value;}
        //if(!this.measure.isdef()){ret+="&mes="+this.measure.value;}
        ret+=this.speed.printout();
        ret+=this.resol.printout();
        ret+=this.loop.printout();
        ret+=this.loglvl.printout();
        ret+=this.height.printout();
        ret+=this.axi_auto.printout();
        ret+=this.frameposx.printout();
        ret+=this.frameposy.printout();
        ret+=this.zoom.printout();
        if(ret){
            window.location.hash="#"+ret.substring(1);
        }else{
            window.location.hash="#";
        }
        this.hashRequested=false;
    },
    requestNewHash:function(){
        if(this.hashRequested){return;}
        this.hashRequested=true;
        //setTimeout($.proxy(this.newHash,this),100);
    },
    create:function(def,short){
        var s=$.extend({},this.template,{def:def,short:short});
        s.set(def);
        if(short){
            this.shortdict[short]=s;
        }
        return s;
    }
});
control.settings.template={
    value:false,
    def:false,
    short:"tmpl",
    set:function(val){
        this.value=val;
        if(this.call){
            this.call();
        }
        control.settings.requestNewHash();
    },
    get:function(){
        return this.value;
    },
    add:function(val){
        this.value+=val;
        if(this.call){
            this.call();
        }
        control.settings.requestNewHash();
    },
    toggle:function(){
        this.value=!this.value;
        if(this.call){
            this.call();
        }
        control.settings.requestNewHash();
        return this.value;
    },
    isdef:function(){
        return this.value===this.def;
    },
    parse:function(str){
        if(str==="true" ||str==="false"){
            this.set(str==="true");
            return;
        }
        var parsed=parseFloat(str);
        if(! isNaN(parsed)){
            this.set(parsed);
            return;
        }
        manage.console.warning("Settings: type of "+str+" is string");
        this.set(str);
    },
    printout:function(){
        if(!this.isdef()){return "&"+this.short+"="+this.value;}else{return "";}
    }
};
            