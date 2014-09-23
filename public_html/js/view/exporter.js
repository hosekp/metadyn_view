if(typeof view==="undefined"){view={};}
if(typeof view.exporter==="undefined"){view.exporter={};}
$.extend(view.exporter,{
    inited:false,
    $canvas:null,
    ctx:null,
    init:function(){
        var template='\
<div id="export_cont">\n\
    <canvas id="export_can" width="600px" height="400px"></canvas>\n\
    <div id="export_help">\n\
        <div id="export_close" onclick="view.exporter.close()">\n\
            <img alt="Close" src="img/play.png">\n\
        </div>\n\
        To get the picture, just press right mouse button over it and select Save image as.. \n\
    </div>\n\
    <div id="export_adjust"></div>\n\
</div>';
        $("#all").append($(template));
        this.$canvas=$("#export_can");
        this.$cont=$("#export_cont");
        this.inited=true;
    },
    open:function(){
        if(!this.inited){this.init();}
        this.$cont.show();
        this.ctx=this.$canvas[0].getContext("2d");
        var $main_cont=$("#main_cont");
        this.resize($main_cont.width(),$main_cont.height());
        this.redraw();
        $("#cont").hide();
    },
    resize:function(width,height){
        this.$canvas.width(width).height(height).attr({width:width,height:height});
    },
    close:function(){
        this.$cont.hide();
        $("#cont").show();
        //control.settings.png.set(false);
    },
    redraw:function(){
        var ctx=this.ctx;
        var $axi_y=$("#axi_y");
        var $axi_x=$("#axi_x");
        var $main_can=$("#main_can");
        var ncv=control.settings.ncv.get();
        ctx.drawImage($axi_y[0],0,0);
        ctx.drawImage($axi_x[0],$axi_y.width(),$axi_y.height());
        if(ncv>1){
            var $axi_z=$("#axi_z");
            ctx.drawImage($axi_z[0],$axi_y.width()+$axi_x.width(),($axi_y.height()-$axi_z.height())/2);
            /*draw.drawer.drawer.getBuffer(function(buffer){
                var imageData=ctx.getImageData(0,0,$main_can.width(),$main_can.height());
                imageData.data.set(buffer);
                ctx.putImageData(imageData,$axi_y.width(),0);
            });*/
        }else{
        }
        ctx.drawImage($main_can[0],$axi_y.width()+5,5);
    },
});