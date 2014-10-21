if(typeof compute==="undefined"){compute={};}
if(typeof compute.tspace==="undefined"){compute.tspace={};}
if(typeof compute.tspacer.tspace==="undefined"){compute.tspacer.tspace={};}
compute.tspacer.tspace[1]={
    spacearr:null,
    dim:0,  // number of pins in one row
    coef:0, // stride 
    ncv:1,
    res:1,
    nwhole:0,
    ratio:0,
    init:function(nbins){
        this.nbins=nbins;
        var nwh=1;
        this.coef=1;
        this.dim=nbins[0];
        this.nwhole=this.dim;
        this.spacearr=new Float32Array(this.nwhole);
    },
    copy:function(){
        var space=$.extend(true,{},this);
        this.id=compute.tspace.lastid++;
        space.spacearr=this.copyFloat32Array(this.spacearr);
        //if(this.spacearr===space.spacearr){manage.console.warning("Storage: Arrays are same");}
        return space;
    },
    copyFloat32Array:function(array){
        var nar=new Float32Array(array.length);
        nar.set(array);
        return nar;
    },
    set:function(space){
        if(this.ncv!==space.ncv){manage.console.error("Storage: Incompatible arrays");return;}
        if(this.nwhole!==space.nwhole){manage.console.error("Storage: Incompatible arrays");return;}
        this.spacearr.set(space.spacearr);
        this.ratio=space.ratio;
        //if(this.spacearr===space.spacearr){manage.console.warning("Storage: Arrays are same");}
    },
    reset:function(){
        this.ratio=-1;
        this.spacearr=new Float32Array(this.nwhole);
    },
    add:function(inds,space){
        var rdif=space.resol/this.resol;
        var tcoef0=this.coef;
        var bcoef0=space.coef*rdif;
        var tdims0=this.dim;
        var bdims0=space.dim;
        var bres=space.resol;
        var hei=inds[1];
        var divis=[false,false];
        var b2=Math.floor((bdims0)/2);
        var gtmid0=Math.round(inds[0]*bres);
        var gtmin0=gtmid0-b2;
        var gtmax0=gtmid0+b2;
        var tmin0;
        if(gtmin0<0){tmin0=0,divis[0]=true;}else{tmin0=Math.ceil(gtmin0/rdif);}
        var bmin0=tmin0*rdif-gtmin0;
        var atmax0=gtmax0/rdif;
        if(atmax0>tdims0){atmax0=tdims0;divis[1]=true;}
        var len=atmax0-tmin0;
        for(var i=0;i<len;i++){
            this.spacearr[tmin0+tcoef0*i]+=hei*space.spacearr[bmin0+bcoef0*i];
        }
        return divis;
    },
    /*sum:function(space){
        var len=space.nwhole;
        for(var i=0;i<len;i++){
            this.spacearr[i]+=space.spacearr[i];
        }
        return this; 
    },*/
    blob:function(sigmastep,hei){
        var dim2=Math.floor((this.dim)/2);
        var sigma=sigmastep[0];
        for(var i=-dim2;i<dim2;i++){
            var val=Math.pow(i/sigma,2);
            this.spacearr[i+dim2]=hei*Math.exp(-val/2);
        }
    },
    getArr:function(){
        return this.spacearr;
    },
    compute:function(){},
    getDrawable:function(){
        return new Float32Array(this.nwhole);
    },
    isEmpty:function(){
        for(var i=0;i<this.nwhole;i++){
            if(this.spacearr[i]!==0){
                return false;
            }
        }
        return true;
    }
};