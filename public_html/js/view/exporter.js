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
        $("#cont").hide();
        control.control.kill();
    },
    close:function(){
        this.$cont.hide();
        $("#cont").show();
        control.control.revive();
        //control.settings.png.set(false);
    }
});