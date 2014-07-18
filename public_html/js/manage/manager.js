if(typeof manage==="undefined"){manage={};}
if(typeof manage.manager==="undefined"){manage.manager={};}
$.extend(manage.manager,{
    lastSpace:null,
    lastDrawable:null,
    lastTransformed:null,
    lastRat:-1,
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
        if(!draw.gl.inited){return false;}
        if(!compute.sum_hill.haveData()){return false;}
        if(rat<this.lastRat){
            this.reset();
        }
        if(this.lastSpace===null){
            this.initSpace();
        }
        //var nar=this.lastSpace;
        if(rat!==this.lastRat){
            this.lastSpace=compute.sum_hill.add(this.lastSpace,this.lastRat,rat);
            //manage.console.debug("Add from "+this.lastRat+" to "+rat);
            this.lastRat=rat;
        }
        this.lastDrawable=compute.axi.transform(this.lastSpace);
        this.lastTransformed=null;
        draw.gl.draw(this.lastDrawable);
        return true;
    },
    initSpace:function(){
        //var resol=control.settings.resol.get();
        this.lastSpace=compute.sum_hill.createSpace();
    },
    setResol:function(){
        this.reset();
    },
    reset:function(){
        this.lastSpace=null;
        this.lastRat=-1;
        this.lastDrawable=null;
        control.control.needRedraw=true;
    },
    purge:function(){
        compute.sum_hill.purge();
        this.reset();
        view.axi.needRedraw=true;
        compute.axi.reset();
    },
    getSpace:function(){
        return this.lastSpace;
    },
    getTransformed:function(){
        if(this.lastTransformed===null){
            if(this.lastSpace!==null){
                this.lastTransformed=compute.axi.transform(this.lastSpace,true);
            }
        }
        return this.lastTransformed;
    }
    
});


