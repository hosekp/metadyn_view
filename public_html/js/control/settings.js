if(typeof control==="undefined"){control={};}
if(typeof control.settings==="undefined"){control.settings={};}
$.extend(control.settings,{
    hashRequested:false,
    lastHash:false,
    shortdict:{},
    onload:function(){
        this.play=this.create(false);
        this.measure=this.create(false,"mes");
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
        this.enunit=this.create(0,"eun");  // 0=kJ/mol,  1=kcal/mol
        this.zoom=this.create(0,"zom");
        this.frameposx=this.create(0,"pox");
        this.frameposy=this.create(0,"poy");
        this.zoomcoef=this.create(2);
        this.png=this.create(false);
        this.lang=this.create("eng","lan");
        
        this.zoompow=function(){
            if(this.zoom.value===0){return 1;}
            return Math.pow(this.zoomcoef.value,this.zoom.value);
        };
        this.maxresol=function(){return 512;};
    },
    init:function(){
        this.readHash();
        control.control.subscribe(this,"newHash");
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
        for(var s in this.shortdict){
            ret=this.shortdict[s].printout(ret);
        }
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
        s.listeners=[];
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
    listeners:null,
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
    subscribe:function(ctx,args){
        var list=this.listeners;
        for(var i=0;i<list.length;i++){
            if(list[i]===ctx){return;}
        }
        list.push({ctx:ctx,args:args});
    },
    call:function(){
        var list=this.listeners;
        for(var i=0;i<list.length;i++){
            var lis=list[i];
            lis.ctx.notify(lis.args);
        }
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
        //manage.console.debug("Settings: type of "+str+" is string");
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
