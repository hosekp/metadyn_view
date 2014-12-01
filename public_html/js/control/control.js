/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(typeof control==="undefined"){control={};}
if(typeof control.control==="undefined"){control.control={};}
$.extend(control.control,{
    actratio:0,
    wantedratio:0,
    stats:null,
    needRedraw:true,
    running:false,
    lasttime:0,
    fastObser:[],
    slowObser:[],
    RAFprefix:null,
    lastSlow:1000000,
    init:function(){
        var stt=new Stats();
        stt.setMode(0);
        $("#all").append(stt.domElement);
        this.stats=stt;
        this.findRAF();
        this.cycle(this.lasttime);
        control.settings.zoom.subscribe(this,null);
        control.settings.frameposx.subscribe(this,null);
        control.settings.frameposy.subscribe(this,null);
        control.settings.resol.subscribe(this,null);
        control.settings.play.subscribe(this,"toggle");
    },
    start:function(){
        if(this.actratio>=1){this.reset();}
        this.running=true;
    },
    cycle:function(stamp){
        if(typeof stamp === "undefined"){
            stamp=new Date().getTime();
        }
        var dt = stamp - this.lasttime;
        if(this.running){
            var nratio=this.wantedratio+dt*control.settings.speed.get()/10000;
            if(nratio>1){
                nratio=1;
            }
            if(this.actratio===1){
                if(control.settings.loop.get()){
                    nratio=this.reset();
                }else{
                    control.settings.play.set(false);
                }
            }
            this.setWanted(nratio);
        }
        //manage.console.debug("Control:","cycle");
        this.stats.begin();
        for(var is=0;is<this.fastObser.length;is++){
            var lis=this.fastObser[is];
            lis.ctx.notify(lis.call);
        }
        if(this.lastSlow>100){
            for(var is=0;is<this.slowObser.length;is++){
                var lis=this.slowObser[is];
                lis.ctx.notify(lis.call);
            }
            this.lastSlow=0;
        }
        this.lastSlow+=dt;
        var rat=this.draw();
        this.set(rat);
        this.stats.end();
        this.lasttime = stamp;
        window.requestAnimationFrame(function(stamp){
            control.control.cycle(stamp);
        });
    },
    everytick:function(obj,func){
        this.fastObser.push({ctx:obj,call:func});
    },
    everysec:function(obj,func){
        this.slowObser.push({ctx:obj,call:func});
    },
    unsubscribe:function(obj,func){
        for(var i=0;i<this.fastObser.length;i++){
            var lis=this.fastObser[i];
            if(lis.ctx===obj&&lis.call===func){
                this.fastObser.pop(i);
                return;
            }
        }
        for(var i=0;i<this.slowObser.length;i++){
            var lis=this.slowObser[i];
            if(lis.ctx===obj&&lis.call===func){
                this.slowObser.pop(i);
                return;
            }
        }
        manage.console.warning("Control:","Unsubscription of",func,"failed");
    },
    findRAF:function(){
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        if(!window.requestAnimationFrame){
            for(var i = 0; i < vendors.length;i++) {
                var vRAF=window[vendors[i]+'RequestAnimationFrame'];
                if(vRAF){
                    window.requestAnimationFrame = vRAF;
                    break;
                }
            }
        }else{
            //this.requestAnimFrame = window.requestAnimationFrame;
        }
        if(!window.requestAnimationFrame){
            manage.console.warning("Control:","RequestAnimationFrame","not supported");
            window.requestAnimationFrame=function(call){
                window.setTimeout(call,10);
            };
        }
        //manage.console.debug("RAF:","new RAF selected");
    },
    draw:function(){
        if(this.needRedraw){
            var rat=manage.manager.draw(this.wantedratio);
            if(rat===false){
                this.needRedraw=true;
                return false;
            }else{
                this.needRedraw=(rat!==this.wantedratio);
                return rat;
            }
        }
        return false;
        //manage.console.debug("drawing "+this.ratio);
    },
    stop:function(){
        this.running=false;
        this.wantedratio=this.actratio;
    },
    toggle:function(){
        if(control.settings.play.get()){this.start();}else{this.stop();}
    },
    reset:function(){
        this.set(0);
        this.setWanted(0);
        //manage.console.debug("reseted");
        return 0;
    },
    set:function(rat){
        if(rat===false){return;}
        if(this.actratio===rat){return;}
        this.actratio=rat;
        view.ctrl.slide.byratio(rat);
        this.needRedraw=true;
        //manage.console.debug("Control: Actual set to "+rat);
    },
    setWanted:function(rat){
        if(this.wantedratio===rat){return;}
        this.wantedratio=rat;
        //view.ctrl.slide.byratio(rat);
        this.needRedraw=true;
        //manage.console.debug("Control: Wanted set to "+rat);
    },
    notify:function(args){
        if(args==="toggle"){return this.toggle();}
        this.needRedraw=true;
    }
});
// @license-end