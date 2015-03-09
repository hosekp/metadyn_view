/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(window.view===undefined){var view={};}
if(view.exporter===undefined){view.exporter={};}
$.extend(view.exporter,{
    inited:false,
    $canvas:null,
    ctx:null,
    tips:{close:"Close",dwnld:"Download plot",text:"Data matrix"},
    onload:function(){
        control.settings.png.subscribe(this,"toggle");
    },
    init:function(){
        var template='\
<div id="export_cont">\n\
    <canvas id="export_can" width="600px" height="400px"></canvas>\n\
    <div id="export_help_cont"></div>\n\
    <div id="export_text" class="export_txt left text"></div>\n\
</div>';
        this.help_template='\
        <div id="export_close" class="ctrl button left tip" onclick="view.exporter.close()" data-ctrl="close">\n\
            <img alt="{{close}}" src="img/close.png">\n\
        </div>\n\
        <a href="#" target="_blank" download="plot.png" id="export_download" class="ctrl button left tip" onclick="view.exporter.download(this)" data-ctrl="dwnld">\n\
            <img alt="{{download}}" src="img/dwnld.png">\n\
        <a/>\n\
        <div id="export_txtbutton" class="ctrl button left tip" onclick="view.exporter.txtgen()" data-ctrl="text">\n\
            <img alt="{{text}}" src="img/txt.png">\n\
        </div>\n\
        <div id="export_help" class="left text">{{helpmsg}}</div>\n\
        ';
        //$("#all").prepend($(template));
        $("#cons").before($(template));
        this.$canvas=$("#export_can");
        this.$cont=$("#export_cont");
        this.$help=$("#export_help_cont");
        this.$output=$("#export_text");
        view.ctrl.bindTips(this.$cont,this.tips);
        this.inited=true;
    },
    open:function(){
        var $main_cont;
        if(!$(".main_can")[0]){
            manage.console.warning("Exporter:","Nothing to draw");return;
        }
        if(!this.inited){this.init();}
        this.$cont.show();
        this.ctx=this.$canvas[0].getContext("2d");
        $main_cont=$("#main_cont");
        this.resize($main_cont.width(),$main_cont.height());
        this.redraw();
        $("#cont").hide();
    },
    resize:function(width,height){
        this.$canvas.width(width).height(height).attr({width:width,height:height});
    },
    close:function(){
        if(this.$cont){
            this.$cont.hide();
        }
        $("#cont").show();
        control.settings.png.set(false);
    },
    download:function(el){
        var dataURL = this.$canvas[0].toDataURL('image/png');
        el.href = dataURL;
    },
    redraw:function(){
        var ctx=this.ctx,$axi_z,$axi_x,$main_can,ncv,$axi_y,rendered,
        y_width,z_width,z_height;
        $axi_z=$("#axi_z");
        $axi_x=$("#axi_x");
        $main_can=$(".main_can");
        z_height=$axi_z.height();
        z_width=$axi_z.width();
        ncv=control.settings.ncv.get();
        if(ncv>1){
            $axi_y=$("#axi_y");
            y_width=$axi_y.width();
            ctx.drawImage($axi_y[0],0,0);
            ctx.drawImage($axi_z[0],y_width+$axi_x.width(),0);
        }else{
            y_width=z_width;
            ctx.drawImage($axi_z[0],0,0);
        }
        ctx.drawImage($axi_x[0],y_width,z_height);
        ctx.drawImage($main_can[0],y_width+5,5);
        
        if(this.$help){
            rendered=Mustache.render(this.help_template,{text:Lang("Data matrix"),download:Lang("Download"),close:Lang("Close"),helpmsg:Lang("To get the picture, just press right mouse button over it and select Save image as..")});
            this.$help.html(rendered);
        }
    },
    txtgen:function(){
        if(!this.$output){return false;}
        var space=manage.manager.getTransformed();
        var resol=control.settings.resol.get();
        var arr=[];
        var xs=[];
        for(var i=0;i<resol;i++){
            xs.push(compute.axi.getCVval(true,i/resol));
        }
        var len=space.length;
        if(control.settings.ncv.get()===2){
            var ys=[];
            for(var i=0;i<resol;i++){
                ys.push(compute.axi.getCVval(false,i/resol));
            }
            var iy=0;
            var ix=0;
            for(var i=0;i<len;i++){
                arr.push(xs[ix].toPrecision(5)+" "+ys[iy].toPrecision(5)+" "+space[i].toPrecision(5));
                ix++;
                if(ix===xs.length){
                    ix=0;
                    iy++;
                }
            }
        }else{
            for(var i=0;i<len;i++){
                arr.push(xs[i].toPrecision(5)+" "+space[i].toPrecision(5));
            }
        }
        this.$output.html("<textarea class=\"export_txt\">"+arr.join("\n")+"</textarea>");
    },
    notify:function(args){
        if(args==="toggle"){
            if(control.settings.png.get()){this.open();}else{this.close();}
        }
    }
});
// @license-end