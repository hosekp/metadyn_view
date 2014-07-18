if(typeof control==="undefined"){control={};}
if(typeof control.measure==="undefined"){control.measure={};}
$.extend(control.measure,{
    $cancont:null,
    lastVal:0,
    height:0,
    width:0,
    top:0,
    left:0,
    needRecompute:true,
    init:function(){
        this.$cancont=$("#canvas_cont");
    },
    bind:function(){
        //manage.console.debug("Measure: binded");
        this.$cancont.on("mousemove",$.proxy(this.mousemove,this));
    },
    unbind:function(){
        this.$cancont.off("mousemove");
    },
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
        var val=this.getValueAt(pos);
        $("#measure_ctrl_value").html(val.toFixed(1)+" kJ/mol");
    },
    getValueAt:function(pos){
        var trans=manage.manager.getTransformed();
        if(trans===null){return 0;}
        var resol=control.settings.resol.get();
        var x=Math.floor(pos.x*resol);
        var y=Math.floor(pos.y*resol);
        return trans[x+y*resol];
        
    }
});