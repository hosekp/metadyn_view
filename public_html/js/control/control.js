if(typeof control==="undefined"){control={};}
if(typeof control.control==="undefined"){control.control={};}
$.extend(control.control,{
    ratio:0,
    stats:null,
    needRedraw:true,
    running:false,
    lasttime:0,
    RAFprefix:null,
    init:function(){
        var stt=new Stats();
        stt.setMode(0);
        $("#all").append(stt.domElement);
        this.stats=stt;
        this.cycle(this.lasttime);
    },
    start:function(){
        if(this.ratio===1){this.reset();}
        this.running=true;
        this.lasttime=window.performance.now();
    },
    /*cycle:function(stamp){
        var cont=control.control;
        if(cont.running){
            var dt = stamp - cont.lasttime;
            var nratio=cont.ratio+dt*control.settings.speed.get()/10000;
            if(nratio>1){
                if(control.settings.loop.get()){
                    nratio=cont.reset();
                    compute.axi.firstloop=false;
                }else{
                    control.settings.play.set(false);
                    cont.set(1);
                }
            }else{
                cont.set(nratio);
            }
        }
        cont.stats.begin();
        control.settings.newHash();
        view.ctrl.redraw();
        view.ctrl.resize();
        view.axi.drawAxes();
        cont.draw();
        cont.stats.end();
        //var now = window.performance.now();
        //var newtime=this.time+dt*control.settings.speed.get()/1000;
        //graf.draw(this.set(newtime));
        cont.lasttime = stamp;
        requestAnimationFrame(cont.cycle);
    },*/
    cycle:function(stamp){
        if(this.running){
            var dt = stamp - this.lasttime;
            var nratio=this.ratio+dt*control.settings.speed.get()/10000;
            if(nratio>1){
                if(control.settings.loop.get()){
                    nratio=this.reset();
                }else{
                    control.settings.play.set(false);
                    this.set(1);
                }
            }else{
                this.set(nratio);
            }
        }
        this.stats.begin();
        control.settings.newHash();
        view.ctrl.redraw();
        view.ctrl.resize();
        view.axi.drawAxes();
        this.draw();
        this.stats.end();
        //var now = window.performance.now();
        //var newtime=this.time+dt*control.settings.speed.get()/1000;
        //graf.draw(this.set(newtime));
        this.lasttime = stamp;
        this.requestAnimFrame(function(stamp){
            control.control.cycle(stamp);
        });
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
                manage.console.error("Control: RequestAnimationFrame not supported");
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
            this.needRedraw=!manage.manager.draw(this.ratio);
        }
        //manage.console.debug("drawing "+this.ratio);
    },
    stop:function(){
        this.running=false;
    },
    reset:function(){
        this.set(0);
        //manage.console.debug("reseted");
        return 0;
    },
    set:function(rat){
        if(this.ratio===rat){return;}
        this.ratio=rat;
        view.ctrl.slide.byratio(rat);
        this.needRedraw=true;
    }
});