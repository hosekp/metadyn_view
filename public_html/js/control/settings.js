/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(window.control===undefined){var control={};}
if(control.settings===undefined){control.settings={};}
$.extend(control.settings,{
    hashRequested:false,
    lastHash:false,
    zmpw:1,
    shortdict:{},
    onload:function(){
        this.play=this.create(false);
        this.measure=this.create(false,"mes");
        this.speed=this.create(0.3,"spd");
        this.resol=this.create(128,"res");
        this.loop=this.create(false,"lop");
        
        //this.height=this.create(1,"hei");
        this.tests=this.create(0,"tst");
        this.sort=this.create(true,"sort");
        this.ncv=this.create(0);
        this.glcan=this.create(true);
        this.glwant=this.create(true,"wgl");
        this.loglvl=this.create(3,"log");
        this.axi_x=this.create(0);
        this.axi_y=this.create(1);
        this.axi_auto=this.create(1,"axa");
        this.enunit=this.create(0,"eun");  // 0=kJ/mol,  1=kcal/mol
        this.textSize=this.create(10,"txt");
        this.zoom=this.create(0,"zom");
        this.frameposx=this.create(0,"pox");
        this.frameposy=this.create(0,"poy");
        //this.zoomcoef=this.create(2);
        this.sett_view=this.create(false);
        this.export=this.create(false);
        this.lang=this.create("eng","lan");
        this.progress=this.create(0,"prg");
        this.hills=this.create(null,"hil");
        this.webgl=function(){
            if(!this.glwant.value){return false;}
            if(!this.glcan.value){return false;}
            if(this.ncv.get()===1){return false;}
            return true;
        };
        this.enhanceSpecial();
    },
    zoompow:function(){
        return this.zmpw;
    },
    maxresol:function(){return 512;},
    init:function(){
        this.readHash();
        control.control.everysec(this,"newHash");
        this.zoom.subscribe(this,"zoompow");
    },
    readHash:function(){
        var hashstr=window.location.hash,i,hash,hashspl,hsspl,key;
        if(hashstr){
            hash={};
            hashstr=hashstr.substring(1);
            hashspl=hashstr.split("&");
            for(i=0;i<hashspl.length;i+=1){
                hsspl=hashspl[i].split("=");
                if(hsspl.length>1){
                    hash[hsspl[0]]=hsspl[1];
                }
            }
            for(key in hash){
                if(this.shortdict[key]){
                    this.shortdict[key].parse(hash[key]);
                }
            }
            this.hashRequested=true;
        }
    },
    newHash:function(){
        var ret,s;
        //compute.axi.profiler.init();
        if(window.location.hash!=="#"+this.lastHash){
            this.readHash();
        }
        if(!this.hashRequested){return;}
        //compute.axi.profiler.time(1);
        ret="";
        //if(this.play.value!==this.play.def){ret+="&run="+this.play.value;}
        //if(!this.measure.isdef()){ret+="&mes="+this.measure.value;}
        for(s in this.shortdict){
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
        //manage.console.debug("newHash created");
    },
    requestNewHash:function(){
        if(this.hashRequested){return;}
        this.hashRequested=true;
        //setTimeout($.proxy(this.newHash,this),100);
    },
    create:function(def,shrt){
        var s=$.extend({},this.template,{def:def,shrt:shrt});
        s.listeners=[];
        s.set(def);
        if(shrt){
            this.shortdict[shrt]=s;
        }
        return s;
    },
    notify:function(args){
        if(args==="newHash"){this.newHash();}
        if(args==="zoompow"){if(this.zoom.value===0){this.zmpw=1;return;} this.zmpw=Math.pow(2,this.zoom.value);}
    },
    enhanceSpecial:function () {
      this.progress.get = function () {
        var value = this.value;
        if(value>1) return 1;
        if(value<0) return 0;
        return value;
      };
    }
});
control.settings.template={
    value:false,
    def:false,
    shrt:"tmpl",
    lastprintout:"",
    listeners:null,
    set:function(val){
        if(this.value===val){return;}
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
        this.value+=1;
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
        var list=this.listeners,i;
        for(i=0;i<list.length;i+=1){
            if(list[i]===ctx){return;}
        }
        list.push({ctx:ctx,args:args});
    },
    call:function(){
        var list=this.listeners,
        i,lis;
        for(i=0;i<list.length;i+=1){
            lis=list[i];
            lis.ctx.notify(lis.args);
        }
    },
    isdef:function(){
        return this.value===this.def;
    },
    parse:function(str){
        var parsed;
        if(str==="true" ||str==="false"){
            this.set(str==="true");
            return;
        }
        parsed=parseFloat(str);
        if(! isNaN(parsed)){
            this.set(parsed);
            return;
        }
        //manage.console.debug("Settings: type of "+str+" is string");
        this.set(str);
    },
    printout:function(string){
        if(this.lastprintout===false){
            if(!this.isdef()){this.lastprintout= /*"&"+*/this.shrt+"="+this.value;}else{
                this.lastprintout="";
                return string;
            }
        }
        if(this.lastprintout===""){return string;}
        if(string===""){
            return this.lastprintout;
        }
        return string+("&"+this.lastprintout);
    }
};
// @license-end
