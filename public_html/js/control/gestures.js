if(typeof control==="undefined"){control={};}
if(typeof control.gestures==="undefined"){control.gestures={};}
$.extend(control.gestures,{
    $cancont:null,
    height:0,
    width:0,
    top:0,
    left:0,
    needRecompute:true,
    lastPos:null,
    lastMousepos:null,
    nowPos:null,
    button:0,
    lease:true,
    init:function(){
        this.$cancont=$("#canvas_cont");
        this.bind();
    },
    bind:function(){
        //manage.console.debug("Measure: binded");
        $("#main_cont").on("mousemove","#canvas_cont",$.proxy(this.mousemove,this));
        $("#main_cont").on("mousedown","#canvas_cont",$.proxy(this.mousedown,this));
        $("#main_cont").on("mouseup mouseout","#canvas_cont",$.proxy(this.mouseend,this));
//        $("#main_cont").on("click","#canvas_cont",$.proxy(this.mouseclick,this));
        $("#main_cont").on("mousewheel DOMMouseScroll","#canvas_cont",$.proxy(this.mousewheel,this));
        $("#main_cont").on("contextmenu","#canvas_cont",function(){return false;});
    },
    /*unbind:function(){
        this.$cancont.off("mousemove");
    },*/
    mousemove:function(event){
        event.preventDefault();
        this.recompute();
        var mousepos={x:(event.pageX-this.left)/this.width,y:(event.pageY-this.top)/this.height};
        //manage.console.debug("Pos ["+pos.x+","+pos.y+"]");
        if(this.button===0){
            var coord=this.getCoord(mousepos);
            control.measure.measure(coord);
        }
        if(this.button===1){
            if(this.lease===false){
                if(Math.abs(mousepos.x-this.lastMousepos.x)>5/this.width||Math.abs(mousepos.y-this.lastMousepos.y)>5/this.height){
                    this.mouselease(event);
                    manage.console.debug("Gestures: Leasen");
                }else{
                    return;
                }
            }
            var coord=this.getCoord(mousepos);
            var override=control.measure.measure(coord);
        }
        if(this.button===3){
            if(this.lastMousepos!==null){  // LMB pressed
                var newzoom=control.settings.zoom.get();
                var zoomcoef=control.settings.zoomcoef.get();
                var pow=Math.pow(zoomcoef,newzoom);
                var nposx=(mousepos.x-this.lastMousepos.x)/pow+this.lastPos.x;
                var nposy=(mousepos.y-this.lastMousepos.y)/pow+this.lastPos.y;
                this.setFramepos(nposx,nposy);
            }
        }
        //manage.console.debug("Pos ["+pos.x+","+pos.y+"]");
        this.nowPos=mousepos;
        return false;
    },
    mouselease:function(event){
        this.lease=true;
        var coord=this.getCoord(this.lastMousepos);
        control.measure.setDiff(coord);
    },
    mousedown:function(event){
        event.preventDefault();
        this.recompute();
        //manage.console.debug("Mousedown");
        event.preventDefault();
        this.lastMousepos={x:(event.pageX-this.left)/this.width,y:(event.pageY-this.top)/this.height};
        this.lastPos={x:control.settings.frameposx.get(),y:control.settings.frameposy.get()};
        this.lease=false;
        this.button=event.which;
        /*this.getCoord(this.lastMousepos);*/
    },
    mouseend:function(event){
        event.preventDefault();
        //manage.console.debug("Mouseup");
        this.lastMousepos=null;
        this.lastPos=null;
        this.button=0;
        if(this.lease===false){
            this.mouseclick(event);
            this.lease=true;
        }
        control.measure.unsetDiff();
    },
    mousewheel:function(event){
        this.recompute();
        event.preventDefault();
        var wheelup=event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0;
        //manage.console.debug("Wheeling: "+(wheelup?"up":"down"));
        var newzoom=control.settings.zoom.get();
        var zoomcoef=control.settings.zoomcoef.get();
        var oldpow=Math.pow(zoomcoef,newzoom);
        if(wheelup){
            newzoom=Math.min(newzoom+1,6);
        }else{
            newzoom=Math.max(newzoom-1,0);
        }
        var pos=this.nowPos;
        var pow=Math.pow(zoomcoef,newzoom);
        var frameposx=control.settings.frameposx.get();
        var frameposy=control.settings.frameposy.get();
        var delta=1/oldpow-1/pow;
        //manage.console.debug("Wheeling: ["+pos.x+","+pos.y+"] delta="+delta);
        control.settings.zoom.set(newzoom);
        this.setFramepos(frameposx-delta*pos.x,frameposy-delta*pos.y);
        //control.settings.frameposx.set(frameposx-delta*pos.x);
        //control.settings.frameposy.set(frameposy-delta*pos.y);
        //manage.console.debug("Wheeling: "+(event.originalEvent.wheelDelta > 0));
    },
    mouseclick:function(event){
        var mousepos={x:(event.pageX-this.left)/this.width,y:(event.pageY-this.top)/this.height};
        var coord=this.getCoord(mousepos);
        control.measure.click(coord);
    },
    setFramepos:function(nposx,nposy){
        var pow=control.settings.zoompow();
        nposx=Math.min(nposx,0);
        nposx=Math.max(nposx,-1+1/pow);
        nposy=Math.min(nposy,0);
        nposy=Math.max(nposy,-1+1/pow);
        control.settings.frameposx.set(Math.floor(nposx*1000)/1000);
        control.settings.frameposy.set(Math.floor(nposy*1000)/1000);
    },
    recompute:function(){
        if(this.needRecompute){
            var off=this.$cancont.offset();
            this.top=off.top;
            this.left=off.left;
            this.height=this.$cancont.height();
            this.width=this.$cancont.width();
            this.needRecompute=false;
        }
    },
    getCoord:function(pos){
        var zoompow=control.settings.zoompow();
        var frameposx=control.settings.frameposx.get();
        var frameposy=control.settings.frameposy.get();
        var ret={};
        ret.x=-frameposx+pos.x/zoompow;
        ret.y=-frameposy+pos.y/zoompow;
        return ret;
        //manage.console.debug("Coord=["+ret.x+","+ret.y+"]");
    }
});
