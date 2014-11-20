/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(typeof view==="undefined"){view={};}
if(typeof view.exporter==="undefined"){view.exporter={};}
$.extend(view.exporter,{
    inited:false,
    $canvas:null,
    ctx:null,
    onload:function(){
        control.settings.png.subscribe(this,"toggle");
    },
    init:function(){
        var template='\
<div id="export_cont">\n\
    <canvas id="export_can" width="600px" height="400px"></canvas>\n\
    <div id="export_help_cont">\n\
        \
    </div>\n\
</div>';
        this.help_template='\n\
        <div id="export_close" class="ctrl button left" onclick="view.exporter.close()">\n\
            <img alt="{{close}}" src="img/new/close.png">\n\
        </div>\n\
        <div id="export_help" class="left text">{{helpmsg}}</div>\n\
        ';
        $("#all").prepend($(template));
        this.$canvas=$("#export_can");
        this.$cont=$("#export_cont");
        this.$help=$("#export_help_cont");
        this.inited=true;
    },
    open:function(){
        if(!$(".main_can")[0]){
            manage.console.warning("Exporter:","Nothing to draw");return;
        }
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
        var $axi_z=$("#axi_z");
        var $axi_x=$("#axi_x");
        var $main_can=$(".main_can");
        var ncv=control.settings.ncv.get();
        ctx.drawImage($axi_x[0],$axi_z.width(),$axi_z.height());
        if(ncv>1){
            var $axi_y=$("#axi_y");
            ctx.drawImage($axi_y[0],0,0);
            ctx.drawImage($axi_z[0],$axi_z.width()+$axi_x.width(),($axi_z.height()-$axi_z.height())/2);
        }else{
            ctx.drawImage($axi_z[0],0,0);
        }
        ctx.drawImage($main_can[0],$axi_z.width()+5,5);
        
        var rendered=Mustache.render(this.help_template,{close:Lang("Close"),helpmsg:Lang("To get the picture, just press right mouse button over it and select Save image as..")});
        $("#export_help_cont").html(rendered);
    },
    notify:function(args){
        if(args==="toggle"){
            if(control.settings.png.get()){this.open();}else{this.close();}
        }
    }
});
// @license-end