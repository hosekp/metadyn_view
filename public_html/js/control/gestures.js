if(typeof control==="undefined"){control={};}
if(typeof control.gestures==="undefined"){control.gestures={};}
$.extend(control.gestures,{
    $cancont:null,
    height:0,
    width:0,
    top:0,
    left:0,
    needRecompute:true,
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
        if(this.needRecompute){
            var off=this.$cancont.offset();
            this.top=off.top;
            this.left=off.left;
            this.height=this.$cancont.height();
            this.width=this.$cancont.width();
            this.needRecompute=false;
        }
        var pos={x:(event.pageX-this.left)/this.width,y:(event.pageY-this.top)/this.height};
        //manage.console.debug("Pos ["+pos.x+","+pos.y+"]");
        this.measure.measure(pos);
    },
    mousedown:function(event){
        manage.console.debug("Mousedown");
    },
    mouseend:function(event){
        manage.console.debug("Mouseup");
    },
    mousewheel:function(event){
        event.preventDefault();
        var wheelup=event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0;
        manage.console.debug("Wheeling: "+(wheelup?"up":"down"));
        //manage.console.debug("Wheeling: "+(event.originalEvent.wheelDelta > 0));
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