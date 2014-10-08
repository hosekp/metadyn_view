if(typeof draw==="undefined"){draw={};}
if(typeof draw.raster==="undefined"){draw.raster={};}
$.extend(draw.raster,{
    inited:false,
    engine:"raster",
    $can:null,
    init:function(){
        if(!this.$can){
            this.$can=$("<canvas>").attr({id:"main_can_raster"});
        }
        this.ctx=this.$can[0].getContext("2d");
        this.inited=true;
    },
    draw:function(array,zmax){
        var ctx=this.ctx;
        //var resol=control.settings.resol.get();
        array=[0,1,2,3,1,2,3,4,2,3,4,5,3,4,5,6];
        zmax=6;
        var resol=4;
        var resol1=resol-1;
        var gw=this.width/resol1;
        var gh=this.height/resol1;
        var hwh=0;
        var wh,ww,hww,hwh,iw,ih,h0w0,h0w1,h1w0,h1w1,sw,sh,inter,fr=0;
        h0w1=array[fr]/zmax;
        h1w1=array[fr+resol]/zmax;
        for(sh=0;sh<resol;sh++){
            hww=0;
            sw=0;
            /*h0w0=array[sw+sh*resol]/zmax;
            h1w0=array[sw+sh*resol+resol]/zmax;
            h0w1=array[sw+1+sh*resol]/zmax;
            h1w1=array[sw+1+sh*resol+resol]/zmax;*/
            for(;sw<resol1;sw++){
                h0w0=h0w1;
                h1w0=h1w1;
                h0w1=array[fr+1]/zmax;
                h1w1=array[fr+1+resol]/zmax;
                //var h0w0=array[sh*resol+sw]/zmax;
                for(wh=hwh;wh<(sh+1)*gh;wh++){
                    for(ww=hww;ww<(sw+1)*gw;ww++){
                        iw=ww/gw-sw;
                        ih=wh/gh-sh;
                        inter=this.interpolate(h0w0,h0w1,h1w0,h1w1,iw,ih);
                        //inter=h0w0*(1-iw)*(1-ih)+h0w1*iw*(1-ih)+h1w0*(1-iw)*ih+h1w1*iw*ih;
                        this.work32[ww+wh*this.width]=this.colorScale(inter);
                        //this.colorScale((ww*2+wh)/(this.width*2+this.height),ww+wh*this.width,this.workarr);
                    }
                }
                fr++;
                hww=ww;
            }
            fr++;
            h0w1=array[fr]/zmax;
            h1w1=array[fr+resol]/zmax;
            hwh=wh;
        } 
        /*for(var h=0;h<this.height;h++){
            for(var w=0;w<this.width;w++){
                this.colorScale((w+h)/(this.width+this.height),w+h*this.width,this.workarr);
            }
        }*/
        this.imageData.data.set(this.work8);
        this.ctx.putImageData(this.imageData,0,0);
        manage.console.debug("Raster draw");
    },
    resize:function(width,height){
        this.width=width;
        this.height=height;
        this.buffer=new ArrayBuffer(width*height*4);
        this.work8=new Uint8ClampedArray(this.buffer);
        this.work32=new Uint32Array(this.buffer);
        this.imageData=this.ctx.getImageData(0, 0, width, height);
    },
    isInited:function(){
        return this.inited;
    },
    interpolate:function(h0w0,h0w1,h1w0,h1w1,w,h){
        return h0w0*(1-w)*(1-h)+h0w1*w*(1-h)+h1w0*(1-w)*h+h1w1*w*h;
    },
    colorScale:function(d){
        var sigma=1000.0;
        var hei = 380.0;
        return (255 << 24) |
            (Math.min(Math.max(hei-Math.abs(d-0.77)*sigma,0.0),255.0) << 16) |
            (Math.min(Math.max(hei-Math.abs(d-0.49)*sigma,0.0),255.0) << 8) |
             Math.min(Math.max(hei-Math.abs(d-0.23)*sigma,0.0),255.0);
    }
});