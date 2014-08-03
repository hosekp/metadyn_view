if(typeof control==="undefined"){control={};}
if(typeof control.settings==="undefined"){control.settings={};}
$.extend(control.settings,{
    hashRequested:false,
    init:function(){
        this.play=this.create(false);
        this.measure=this.create(false);
        this.speed=this.create(0.3);
        this.resol=this.create(100);
        this.loop=this.create(true);
        
        this.height=this.create(1);
        this.ncv=this.create(0);
        this.loglvl=this.create(4);
        this.axi_x=this.create(0);
        this.axi_y=this.create(1);
        this.axi_auto=this.create(true);
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
        this.measure.call=function(){
            if(control.settings.measure.value){
                control.measure.bind();
            }else{
                control.measure.unbind();
            }
        };
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
            if(hash["axx"]){this.axi_x.set(parseInt(hash["axx"]));}
            if(hash["axy"]){this.axi_y.set(parseInt(hash["axy"]));}
            if(hash["axa"]){this.axi_auto.set(hash["axa"]==="true");}
            if(hash["hei"]){this.height.set(parseFloat(hash["hei"]));}
            if(hash["spd"]){this.speed.set(parseFloat(hash["spd"]));}
            //if(hash["mes"]){this.measure.set(hash["mes"]==="true");}
            if(hash["res"]){this.resol.set(parseFloat(hash["res"]));}
            if(hash["lop"]){this.loop.set(hash["lop"]==="true");}
            if(hash["log"]){this.loglvl.set(parseInt(hash["log"]));}
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
        if(!this.speed.isdef()){ret+="&spd="+this.speed.value;}
        if(!this.resol.isdef()){ret+="&res="+this.resol.value;}
        if(!this.loop.isdef()){ret+="&lop="+this.loop.value;}
        if(!this.loglvl.isdef()){ret+="&log="+this.loglvl.value;}
        if(!this.height.isdef()){ret+="&hei="+this.height.value;}
        if(!this.axi_x.isdef()){ret+="&axx="+this.axi_x.value;}
        if(!this.axi_y.isdef()){ret+="&axy="+this.axi_y.value;}
        if(!this.axi_auto.isdef()){ret+="&axa="+this.axi_auto.value;}
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
    create:function(def){
        var s=$.extend({},this.template,{def:def});
        s.set(def);
        return s;
    }
});
control.settings.template={
    value:false,
    def:false,
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
    }
};
            