if(typeof compute==="undefined"){compute={};}
if(typeof compute.axi==="undefined"){compute.axi={};}
$.extend(compute.axi,{
    zmax:0,
    lastRatio:-1,
    profiler:{
        vals:[0,0,0,0],
        nvals:[0,0,0,0],
        lasttime:null,
        init:function(){this.lasttime=window.performance.now();},
        time:function(ind){
            var now=window.performance.now();
            this.vals[ind]+=now-this.lasttime;
            this.nvals[ind]++;
            this.lasttime=now;
        },
        print:function(){
            manage.console.debug("\
1: "+(this.vals[1]/this.nvals[1])+"\n\
2: "+(this.vals[2]/this.nvals[2])+"\n\
3: "+(this.vals[3]/this.nvals[3])+"\
");
        }
    },
    transform:function(space,nar){
        var array=space.getArr();
        var zm=this.zmax;
        var len=array.length;
        this.profiler.init();
        if(space.ncv===2){
            if(space.isEmpty()){
                manage.console.debug("Axi: Nothing to transform");
                return nar;
            }else{
                //manage.console.debug("Axi: Suma je "+space.sum());
            }
            zm*=16384;
            //var i32=new Uint32Array(array.buffer);
            var i32=space.getArr(32);
            this.profiler.time(1);
            if(this.lastRatio<space.ratio&&control.settings.axi_auto.get()){
                for (var i=0;i<len;i++){
                    if(i32[i]>zm){
                        this.setZmax(i32[i]/16384.0);
                        zm=i32[i];
                    }
                }
                this.lastRatio=space.ratio;
            }
            //manage.console.debug("Axi: zmax set to "+zm);
            this.profiler.time(2);
            if(!nar){
                nar=new Float32Array(len);
                for (var i=0;i<len;i++){
                    nar[i]=i32[i]/16384.0;
                }
            }
            var del=255/zm;
            for (var i=0;i<len;i++){
                nar[i]=i32[i]*del;
                //nar[i]=255;
            }
            this.profiler.time(3);
            //this.profiler.print();
            
            return;
        }
        if(this.firstcycle&&control.settings.axi_auto.get()){
            for (var i=0;i<len;i++){
                if(array[i]>zm){
                    this.setZmax(array[i]);
                    zm=array[i];
                }
            }
        }
        if(space.ncv===2){
            if(!nar){
                nar=new Float32Array(len);
                for (var i=0;i<len;i++){
                    nar[i]=array[i];
                }
            }else{
                for (var i=0;i<len;i++){
                    nar[i]=array[i]/zm*255;
                }
            }
        }else if(space.ncv===1){
            if(!nar){
                nar=new Float32Array(len);
                for (var i=0;i<len;i++){
                    nar[i]=array[i];
                }
            }else{
                for (var i=0;i<len;i++){
                    nar[i]=array[i]/zm;
                }
            }
        }else{
            manage.console.error("Axi: Only 1D and 2D spectra implemented");
        }
        return nar;
    },
    getDrawable:function(len){
        var ncv=control.settings.ncv.get();
        if(ncv>1){
            return new Uint8Array(len);
        }else{
            return new Float32Array(len);
        }
    },
    getMin:function(xaxi){
        var cv=this.getCVindex(xaxi);
        return compute.sum_hill.mins[cv];
    },
    getMax:function(xaxi){
        var cv=this.getCVindex(xaxi);
        return compute.sum_hill.maxs[cv];
    },
    getName:function(xaxi){
        var cv=this.getCVindex(xaxi);
        return compute.sum_hill.params.cvs[cv].name;
    },
    getCVindex:function(xaxi){
        if(xaxi){return control.settings.axi_x.get();
        }else{return control.settings.axi_y.get();}
    },
    setZmax:function(zm){
        this.zmax=zm;
        view.axi.needRedraw=true;
        //manage.console.debug("Zmax set to "+zm);
    },
    reset:function(){
        this.zmax=0;
        this.lastRatio=-1;
    }/*,
    setAxis:function(ncv){
        if(ncv===1){
            control.settings.axi_x.set(0);
            control.settings.axi_y.set(-1);
        }else if(ncv===2){
            control.settings.axi_x.set(0);
            control.settings.axi_y.set(1);
            
        }else{
            manage.console.warning("Axi: More than two CV not implemented");
        }
    }*/
});
