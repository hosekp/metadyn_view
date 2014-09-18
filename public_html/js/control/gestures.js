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
    init:function(){
        this.$cancont=$("#canvas_cont");
        this.bind();
    },
    bind:function(){
        //manage.console.debug("Measure: binded");
        $("#main_cont").on("mousemove","#canvas_cont",$.proxy(this.mousemove,this));
        $("#main_cont").on("mousedown","#canvas_cont",$.proxy(this.mousedown,this));
        $("#main_cont").on("mouseup mouseout","#canvas_cont",$.proxy(this.mouseend,this));
        $("#main_cont").on("mousewheel DOMMouseScroll","#canvas_cont",$.proxy(this.mousewheel,this));
    },
    /*unbind:function(){
        this.$cancont.off("mousemove");
    },*/
    mousemove:function(event){
        this.recompute();
        var pos={x:(event.pageX-this.left)/this.width,y:(event.pageY-this.top)/this.height};
        //manage.console.debug("Pos ["+pos.x+","+pos.y+"]");
        if(this.lastPos!==null){
            var newzoom=control.settings.zoom.get();
            var zoomcoef=control.settings.zoomcoef.get();
            var pow=Math.pow(zoomcoef,newzoom);
            var npos={x:(pos.x-this.lastMousepos.x)/pow+this.lastPos.x,y:(pos.y-this.lastMousepos.y)/pow+this.lastPos.y};
            /*control.settings.frameposx.set(Math.floor(npos.x*1000)/1000);
            control.settings.frameposy.set(Math.floor(npos.y*1000)/1000);*/
            this.setFramepos(npos.x,npos.y,pow);
        }
        //manage.console.debug("Pos ["+pos.x+","+pos.y+"]");
        this.measure.measure(pos);
        this.nowPos=pos;
    },
    mousedown:function(event){
        this.recompute();
        //manage.console.debug("Mousedown");
        event.preventDefault();
        this.lastMousepos={x:(event.pageX-this.left)/this.width,y:(event.pageY-this.top)/this.height};
        this.lastPos={x:control.settings.frameposx.get(),y:control.settings.frameposy.get()};
        this.getCoord(this.lastMousepos);
    },
    mouseend:function(event){
        event.preventDefault();
        //manage.console.debug("Mouseup");
        this.lastMousepos=null;
        this.lastPos=null;
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
        this.setFramepos(frameposx-delta*pos.x,frameposy-delta*pos.y,pow);
        //control.settings.frameposx.set(frameposx-delta*pos.x);
        //control.settings.frameposy.set(frameposy-delta*pos.y);
        control.settings.zoom.set(newzoom);
        //manage.console.debug("Wheeling: "+(event.originalEvent.wheelDelta > 0));
    },
    setFramepos:function(posx,posy,pow){
        if(!pow){
            /*var newzoom=control.settings.zoom.get();
            var zoomcoef=control.settings.zoomcoef.get();
            var pow=Math.pow(zoomcoef,newzoom);*/
            var pow = control.settings.zoompow();
        }
        posx=Math.min(posx,0);
        posx=Math.max(posx,-1+1/pow);
        posy=Math.min(posy,0);
        posy=Math.max(posy,-1+1/pow);
        control.settings.frameposx.set(Math.floor(posx*1000)/1000);
        control.settings.frameposy.set(Math.floor(posy*1000)/1000);
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
        //manage.console.debug("Coord=["+ret.x+","+ret.y+"]");
    }
});
control.gestures.measure={
    measure:function(pos){
        if(control.settings.measure.get()){
            var val=this.getValueAt(pos);
            $("#measure_ctrl_value").html(val.toFixed(1)+" kJ/mol");
        }
    },
    getValueAt:function(pos){
        var trans=manage.manager.getTransformed();
        if(trans===null){return 0;}
        var resol=control.settings.resol.get();
        var ncv=control.settings.ncv.get();
        var x,y=0;
        if(ncv===2){
            x=Math.floor(pos.x*resol);
            y=Math.floor(pos.y*resol);
        }else if(ncv===1){
            x=Math.floor(pos.x*resol);
        }
        return trans[x+y*resol];
    }
    
};