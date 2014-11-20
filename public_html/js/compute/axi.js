/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(typeof compute==="undefined"){compute={};}
if(typeof compute.axi==="undefined"){compute.axi={};}
$.extend(compute.axi,{
    zmax:0,
    zmin:0,
    lastRatio:-1,
    temp:{},
    profiler:{
        vals:[0,0,0,0],
        nvals:[0,0,0,0],
        lasttime:null,
        init:function(){this.lasttime=window.performance.now();},
        time:function(ind){
            var now=window.performance.now();
            //this.vals[ind]+=now-this.lasttime;
            //this.nvals[ind]++;
            this.vals[ind]=now-this.lasttime;
            this.lasttime=now;
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
3: "+(this.vals[3].toFixed(2))+"\
");
        }
    },
    findMaxMin:function(array,alsomin){
        var max,min=0;
        var len=array.length;
        if(len<124000){
            max=Math.max.apply(null,array);
            if(alsomin){
                min=Math.min.apply(null,array);
            }
        }else{
            var maxs=[];
            var mins=[];
            if(this.temp.buffer!==array.buffer){
                this.temp.subarrs=[];
            }
            for(var i=0;i<len/124000;i++){
                if(this.temp.subarrs.length>i){
                    var subarr=this.temp.subarrs[i];
                }else{
                    subarr=array.subarray(i*124000,(i+1)*124000);
                    this.temp.subarrs.push(subarr);
                }
                maxs.push(Math.max.apply(null,subarr));
                if(alsomin){
                    mins.push(Math.min.apply(null,subarr));
                }
            }
            max=Math.max.apply(null,maxs);
            if(alsomin){
                min=Math.min.apply(null,mins);
            }
        }
        return [max,min];
    },
    transform:function(space,nar,type){
        var max,min=0;
        this.profiler.init();
        var webgl=control.settings.webgl();
        /*if(space.isEmpty()){
            manage.console.debug("Axi: Nothing to transform");
            return nar;
        }*/
        if(webgl){
            var array=space.getArr(32);
        }else{
            var array=space.getArr();
        }
        var len=array.length;
        var autoset=control.settings.axi_auto.get();
        if(this.lastRatio<space.ratio||autoset===2){
            var limits=this.findMaxMin(array,autoset===2);
            max=limits[0];
            min=limits[1];
            if(webgl){
                if(max>this.zmax*16384){
                    this.setZmax(max/16384.0);
                }
                if(min!==this.zmin*16384){
                    this.setZmin(min/16384.0);
                }
            }else{
                if(max>this.zmax){
                    this.setZmax(max);
                }
                if(min!==this.zmin){
                    this.setZmin(min);
                }
            }
            this.lastRatio=space.ratio;
        }else{
            max=this.zmax;
            min=this.zmin;
        }
        if(webgl){
            if(!nar&&type==="float32"){
                nar=new Float32Array(len);
                for (var i=0;i<len;i++){
                    nar[i]=array[i]/16384.0;
                }
            }else{
                var i8=space.getArr();
                nar.set(i8);
            }
            //this.profiler.time(3);
            //this.profiler.print();
        }else{
            /*nar=new Float32Array(len);
            nar.set(array);*/
            //manage.console.debug("axi_zmax="+max);
            if(!nar){
                nar=new Float32Array(len);
            }
            nar.set(array);
        }
        return nar;
    },
    /*getDrawable:function(space){
        if(webgl){
            return new Uint8Array(len*4);
        }else{
            return new Float32Array(len);
        }
    },*/
    getLimits:function(xaxi,visible){
        var cv=this.getCVindex(xaxi);
        if(visible){
            var max=compute.sum_hill.maxs[cv];
            var min=compute.sum_hill.mins[cv];
            var diff=max-min;
            var pow=control.settings.zoompow();
            if(xaxi){
                var posx=control.settings.frameposx.get();
                max=min+diff*(-posx)+diff/pow;
                min=min+diff*(-posx);
            }else{
                var posy=control.settings.frameposy.get();
                min=max+diff*(+posy)-diff/pow;
                max=max+diff*(+posy);
            }
            return [min,max];
        }else{
            return [compute.sum_hill.mins[cv],compute.sum_hill.maxs[cv]];
        }
    },
    getCVval:function(xaxi,ratio){
        if(!compute.sum_hill.haveData()){return 0;}
        var cv=this.getCVindex(xaxi);
        var min=compute.sum_hill.mins[cv];
        return min+ratio*(compute.sum_hill.maxs[cv]-min);
    },
    /*getMin:function(xaxi){
        var cv=this.getCVindex(xaxi);
        return compute.sum_hill.mins[cv];
    },
    getMax:function(xaxi){
        var cv=this.getCVindex(xaxi);
        return compute.sum_hill.maxs[cv];
    },*/
    getName:function(xaxi){
        if(control.settings.ncv.get()===1&&!xaxi){
            return "";
        }
        var cv=this.getCVindex(xaxi);
        if(compute.sum_hill.haveData()){
            return compute.sum_hill.params.cvs[cv].name;
        }else{
            return "";
        }
    },
    setName:function(xaxi,val){
        var cv=this.getCVindex(xaxi);
        compute.sum_hill.params.cvs[cv].name=val;
        //view.axi.needArrange=true;
        view.axi.needRedraw=true;
        control.measure.needRedraw=true;
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
    setZmin:function(zm){
        this.zmin=zm;
        view.axi.needRedraw=true;
        //manage.console.debug("Zmax set to "+zm);
    },
    reset:function(){
        this.zmax=0;
        this.zmin=0;
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
// @license-end