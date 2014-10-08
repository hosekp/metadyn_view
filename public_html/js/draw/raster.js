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
        this.cscale=new Uint32Array(1000);
        for(var i=0;i<1000;i++){
            this.cscale[i]=this.colorScale(i/1000);
        }
    },
    draw:function(array,zmax){
        //this.profiler.init();
        var ctx=this.ctx;
        var resol=control.settings.resol.get();
        if(false){
            var resol=10;
            array=new Float32Array(resol*resol);
            for(var j=0;j<resol;j++){
                for(var i=0;i<resol;i++){
                    array[j*resol+i]=j+i;
                }
            }
            zmax=(resol-1)*2;
        }
        zmax=1;
        var resol1=resol-1;
        var gw=this.width/resol1;
        var gh=this.height/resol1;
        //this.profiler.time(1);
        var wh,ww,hww,hwh=0,iw,ih,h0w0,h0w1,h1w0,h1w1,sw,sh,dinter,inter0,sumhw,fr=0,whxwi,wwl,whl;
        h0w1=array[fr]/zmax;
        h1w1=array[fr+resol]/zmax;
        for(sh=0;sh<resol;sh++){
            hww=0;
            for(sw=0;sw<resol1;sw++){
                h0w0=h0w1;
                h1w0=h1w1;
                h0w1=array[fr+1]/zmax;
                h1w1=array[fr+1+resol]/zmax;
                //var h0w0=array[sh*resol+sw]/zmax;
                sumhw=h0w0-h0w1-h1w0+h1w1;
                whl=(sh+1)*gh;
                for(wh=hwh;wh<whl;wh++){
                    ih=wh/gh-sh;
                    whxwi=wh*this.width;
                    inter0=(h0w0*(1-ih)+h1w0*ih)*1000;
                    //inter1=(h0w1*(1-ih)+h1w1*ih)*1000;
                    //dinter=(h0w1*(1-ih)+h1w1*ih)*1000-inter0;
                    dinter=(h0w1-h0w0+ih*sumhw)*1000;
                    wwl=(sw+1)*gw;
                    for(ww=hww;ww<wwl;ww++){
                        iw=ww/gw-sw;
                        //inter=h0w0*(1-iw)*(1-ih)+h0w1*iw*(1-ih)+h1w0*(1-iw)*ih+h1w1*iw*ih;
                        //this.work32[ww+whxwi]=this.colorScaleWrap(inter);
                        this.work32[ww+whxwi]=this.cscale[Math.floor(inter0+dinter*iw)];
                        //this.work32[ww+whxwi]=this.cscale[Math.floor(inter0*(1-iw)+inter1*iw)];
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
        //this.profiler.time(2);
        this.imageData.data.set(this.work8);
        //this.profiler.time(3);
        this.ctx.putImageData(this.imageData,0,0);
        //manage.console.debug("Raster draw");
        //this.profiler.time(4);
        //this.profiler.print();
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
        /*for(var i=0;i<100;i++){
            var f=i*i;
        }*/
        return (255 << 24) |
            (Math.min(Math.max(hei-Math.abs(d-0.77)*sigma,0.0),255.0) << 16) |
            (Math.min(Math.max(hei-Math.abs(d-0.49)*sigma,0.0),255.0) << 8) |
             Math.min(Math.max(hei-Math.abs(d-0.23)*sigma,0.0),255.0);
    },
    colorScaleWrap:function(d){
        return this.cscale[Math.floor(d*1000)];
    },
    profiler:{
        vals:[0,0,0,0,0],
        nvals:[0,0,0,0,0],
        lasttime:null,
        init:function(){this.lasttime=window.performance.now();},
        time:function(ind){
            var now=window.performance.now();
            //this.vals[ind]+=now-this.lasttime;
            //this.nvals[ind]++;
            this.vals[ind]+=now-this.lasttime;
            this.lasttime=now;
        },
        reset:function(){
            this.vals=[0,0,0,0,0];
            this.nvals=[0,0,0,0,0];
        },
        print:function(){
            /*manage.console.debug("\
1: "+(this.vals[1]/this.nvals[1])+"\n\
2: "+(this.vals[2]/this.nvals[2])+"\n\
3: "+(this.vals[3]/this.nvals[3])+"\
");
        }*/
            manage.console.debug("\
1: "+(this.vals[1].toFixed(2))+"\n\
2: "+(this.vals[2].toFixed(2))+"\n\
3: "+(this.vals[3].toFixed(2))+"\n\
4: "+(this.vals[4].toFixed(2))+"\
");
            this.reset();
        }
    }
});