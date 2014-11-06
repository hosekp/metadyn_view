if(typeof control==="undefined"){control={};}
if(typeof control.control==="undefined"){control.control={};}
$.extend(control.control,{
    actratio:0,
    wantedratio:0,
    stats:null,
    needRedraw:true,
    running:false,
    lasttime:0,
    listeners:[],
    RAFprefix:null,
    init:function(){
        var stt=new Stats();
        stt.setMode(0);
        $("#all").append(stt.domElement);
        this.stats=stt;
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
        this.lasttime=window.performance.now();
    },
    cycle:function(stamp){
        if(this.running){
            var dt = stamp - this.lasttime;
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
        this.stats.begin();
        for(var is=0;is<this.listeners.length;is++){
            var lis=this.listeners[is];
            lis.ctx.notify(lis.call);
        }
        /*control.settings.newHash();
        view.ctrl.redraw();
        view.ctrl.resize();
        view.axi.drawAxes();
        control.measure.redraw();*/
        var rat=this.draw();
        this.set(rat);
        this.stats.end();
        //var now = window.performance.now();
        //var newtime=this.time+dt*control.settings.speed.get()/1000;
        //graf.draw(this.set(newtime));
        this.lasttime = stamp;
        this.requestAnimFrame(function(stamp){
            control.control.cycle(stamp);
        });
    },
    subscribe:function(obj,func){
        this.listeners.push({ctx:obj,call:func});
    },
    unsubscribe:function(obj,func){
        for(var i=0;i<this.listeners.length;i++){
            var lis=this.listeners[i];
            if(lis.ctx===obj&&lis.call===func){
                this.listeners.pop(i);
                return;
            }
        }
    },
    requestAnimFrame:function(func){
        if(this.RAFprefix===null){
            if(window.requestAnimationFrame){
                this.RAFprefix=0;
            }else if(window.webkitRequestAnimationFrame){
                this.RAFprefix=1;
            }else if(window.mozRequestAnimationFrame){
                this.RAFprefix=2;
            }else{
                this.RAFprefix=3;
                manage.console.error("Control:","RequestAnimationFrame","not supported");
            }
        }
        if(this.RAFprefix===0){
            window.requestAnimationFrame(func);
        }else if(this.RAFprefix===1){
            window.webkitRequestAnimationFrame(func);
        }else if(this.RAFprefix===2){
            window.mozRequestAnimationFrame(func);
        }
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