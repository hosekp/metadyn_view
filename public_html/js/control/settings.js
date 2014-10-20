if(typeof control==="undefined"){control={};}
if(typeof control.settings==="undefined"){control.settings={};}
$.extend(control.settings,{
    hashRequested:false,
    lastHash:false,
    shortdict:{},
    init:function(){
        this.play=this.create(false);
        this.measure=this.create(false);
        this.speed=this.create(0.3,"spd");
        this.resol=this.create(128,"res");
        this.loop=this.create(true,"lop");
        
        this.height=this.create(1,"hei");
        this.ncv=this.create(0);
//        this.webgl=this.create(false);
        this.webgl=this.create(true);
        this.loglvl=this.create(4,"log");
        this.axi_x=this.create(0);
        this.axi_y=this.create(1);
        this.axi_auto=this.create(1,"axa");
        this.enunit=this.create(0,"eun");  // 1=kJ/mol,  2=kcal/mol
        this.zoom=this.create(0,"zom");
        this.frameposx=this.create(0,"pox");
        this.frameposy=this.create(0,"poy");
        this.zoomcoef=this.create(2);
        this.png=this.create(false);
        
        this.zoompow=function(){
            if(this.zoom.value===0){return 1;}
            return Math.pow(this.zoomcoef.value,this.zoom.value);
        };
        this.maxresol=function(){return 512;};
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
        this.zoom.call=function(){
            control.control.needRedraw=true;
            view.axi.needRedraw=true;
        };
        this.frameposx.call=function(){
            control.control.needRedraw=true;
            view.axi.needRedraw=true;
        };
        this.frameposy.call=function(){
            control.control.needRedraw=true;
            view.axi.needRedraw=true;
        };
        this.ncv.call=function(){
            view.axi.needArrange=true;
        };
        this.png.call=function(){
            if(!control.settings.play.value){
                view.exporter.open();
            }
        };
        this.enunit.call=function(){
            view.axi.needArrange=true;
            //view.axi.needRedraw=true;
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
        //compute.axi.profiler.init();
        if(!this.hashRequested){return;}
        //compute.axi.profiler.time(1);
        if(view.ctrl.inited){
            view.ctrl.render();
        }
        var ret="";
        //if(this.play.value!==this.play.def){ret+="&run="+this.play.value;}
        //if(!this.measure.isdef()){ret+="&mes="+this.measure.value;}
        ret=this.speed.printout(ret);
        ret=this.resol.printout(ret);
        ret=this.loop.printout(ret);
        ret=this.loglvl.printout(ret);
        ret=this.height.printout(ret);
        //compute.axi.profiler.time(1);
        ret=this.axi_auto.printout(ret);
        ret=this.frameposx.printout(ret);
        ret=this.frameposy.printout(ret);
        ret=this.zoom.printout(ret);
        //compute.axi.profiler.time(1);
        //compute.axi.profiler.time(2);
        if(this.lastHash!==ret){
            this.lastHash=ret;
            window.location.hash="#"+ret;
        }
        //compute.axi.profiler.time(3);
        this.hashRequested=false;
        //compute.axi.profiler.print();
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
    lastprintout:"",
    set:function(val){
        this.value=val;
        if(this.call){
            this.call();
        }
        this.lastprintout=false;
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
        this.lastprintout=false;
        control.settings.requestNewHash();
    },
    toggle:function(){
        this.value=!this.value;
        if(this.call){
            this.call();
        }
        this.lastprintout=false;
        control.settings.requestNewHash();
        return this.value;
    },
    cycle:function(n){
        this.value++;
        if(this.value===n){
            this.value=0;
        }
        if(this.call){
            this.call();
        }
        this.lastprintout=false;
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
    printout:function(string){
        if(this.lastprintout===false){
            if(!this.isdef()){this.lastprintout= /*"&"+*/this.short+"="+this.value;}else{
                this.lastprintout="";
                return string;
            }
        }
        if(this.lastprintout===""){return string;}
        if(string!==""){
            return string+("&"+this.lastprintout);
        }else{
            return this.lastprintout;
        }
    }
};
            
