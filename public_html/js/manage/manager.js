if(typeof manage==="undefined"){manage={};}
if(typeof manage.manager==="undefined"){manage.manager={};}
$.extend(manage.manager,{
    lastSpace:null,
    lastDrawable:null,
    counter:0,
    lastTransformed:null,
    onesecratio:0,
    draw_text:function(rat){
        if(!draw.gl.inited){return false;}
        var resol=control.settings.resol.get();
        var array=new Uint8Array(resol*resol);
        for(var i=0;i<resol;i++){
            for(var j=0;j<resol;j++){
                array[j+resol*i]=255*Math.pow(Math.sin(i/resol*Math.PI)*Math.sin((j/resol+rat)*Math.PI),2);
            }
        }
        draw.gl.draw(array);
        return true;
    },
    draw:function(rat){
        //if(!draw.gl.inited){return false;}
        if(!compute.sum_hill.haveData()){return false;}
        if(!draw.drawer.isInited()){
            return false;
        }
        if(this.lastSpace===null){
            this.initSpace();
        }
        var lrat=this.lastSpace.ratio;
        //if(rat===0){rat=-1;}
        if(rat<lrat){
            this.reset();
            lrat=0;
        }
        var storaging=false;
        //var nar=this.lastSpace;
        if(rat!==lrat){
            if(storaging){
                var isload=manage.storage.load(this.lastSpace,rat);
            }
            /*if(isload){
                manage.console.log("Is loaded at "+this.lastSpace.ratio);
            }*/
            //manage.console.debug("Manager: summing "+this.lastSpace.ratio+" to "+rat);
            if(this.onesecratio===0){
                this.onesecratio=this.estimate1sec();
            }
            if(lrat>=0&&rat>=0&&rat>lrat+this.onesecratio){
                rat=lrat+this.onesecratio;
                //manage.console.debug("Manager: ratio reduced to "+rat);
            }
            //manage.console.debug("Manager: summing "+this.lastSpace.ratio+" to "+rat);
            compute.sum_hill.add(this.lastSpace,rat);
            if(storaging){
                manage.storage.save(this.lastSpace);
            }
            //manage.console.debug("Add from "+this.lastRat+" to "+rat);
            this.counter++;
            compute.axi.transform(this.lastSpace,this.lastDrawable);
            this.lastTransformed=null;
        }
        draw.drawer.draw(this.lastDrawable,compute.axi.zmax);
        return rat;
    },
    initSpace:function(){
        //var resol=control.settings.resol.get();
        this.lastSpace=compute.sum_hill.createSpace();
        this.lastDrawable=compute.axi.getDrawable(this.lastSpace.nwhole);
    },
    setResol:function(){
        //this.reset();
        this.lastSpace=null;
        this.lastDrawable=null;
        this.lastTransformed=null;
        manage.storage.reset();
        control.control.needRedraw=true;
        this.onesecratio=0;
    },
    resetSpace:
    reset:function(){
        manage.console.debug("Counter: "+this.counter);
        this.counter=0;
        if(this.lastSpace){
            this.lastSpace.reset();
        }
        control.control.needRedraw=true;
    },
    purge:function(){
        compute.sum_hill.purge();
        //this.reset();
        this.setResol();
        view.axi.needRedraw=true;
        compute.axi.reset();
        manage.storage.reset();
    },
    getSpace:function(){
        return this.lastSpace;
    },
    getTransformed:function(){
        if(this.lastTransformed===null){
            if(this.lastSpace!==null){
                this.lastTransformed=compute.axi.transform(this.lastSpace,null,"float32");
            }
        }
        return this.lastTransformed;
    },
    dataLoaded:function(){
        this.lastSpace=null;
        this.lastDrawable=null;
        control.settings.ncv.set(compute.sum_hill.ncv);
        this.reset();
        draw.drawer.switchTo();
    },
    estimate1sec:function(){
        var nbody=compute.sum_hill.nbody;
        var resol=control.settings.resol.get();
        return 1000/nbody*256*256/resol/resol;
    },
    refine1sec:function(ratio,time){
        this.onesecratio=(this.onesecratio+(ratio*1000/time))/2;
    }
    
});


