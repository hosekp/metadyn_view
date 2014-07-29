if(typeof compute==="undefined"){compute={};}
if(typeof compute.axi==="undefined"){compute.axi={};}
$.extend(compute.axi,{
    zmax:0,
    firstcycle:true,
    transform:function(space,nar){
        var array=space.spacearr;
        var zm=this.zmax;
        if(space.ncv===2){
            var len=array.length;
            //var nar=new Uint8Array(len);
            if(this.firstcycle&&control.settings.axi_auto.get()){
                for (var i=0;i<len;i++){
                    if(array[i]>zm){
                        this.setZmax(array[i]);
                        zm=array[i];
                    }
                }
            }
            for (var i=0;i<len;i++){
                nar[i]=array[i]/zm*255;
            }
            return nar;
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
        this.firstcycle=true;
    }
});