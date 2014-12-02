/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(window.compute===undefined){var compute={};}
if(compute.tspace===undefined){compute.tspace={};}
if(compute.tspacer.tspace===undefined){compute.tspacer.tspace={};}
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
        this.coef=1;
        this.dim=nbins[0];
        this.nwhole=this.dim;
        this.spacearr=new Float32Array(this.nwhole);
    },
    copy:function(){
        var space,array,nar;
        space=$.extend(true,{},this);
        this.id=compute.tspace.lastid++;
        array=this.spacearr;
        nar=new Float32Array(array.length);
        nar.set(array);
        //if(this.spacearr===space.spacearr){manage.console.warning("Storage: Arrays are same");}
        return space;
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
        var rdif,tdims0,bdims0,divis,bres,i,b2,gtmid0,gtmin0,gtmax0,
        tmin0,bmin0,atmax0,len,tcoef0,bcoef0,hei;
        rdif=space.resol/this.resol;
        tcoef0=this.coef;
        bcoef0=space.coef*rdif;
        tdims0=this.dim;
        bdims0=space.dim;
        bres=space.resol;
        hei=inds[1];
        divis=[false,false];
        b2=Math.floor(bdims0/2);
        gtmid0=Math.round(inds[0]*bres);
        gtmin0=gtmid0-b2;
        gtmax0=gtmid0+b2;
        if(gtmin0<0){tmin0=0;divis[0]=true;}else{tmin0=Math.ceil(gtmin0/rdif);}
        bmin0=tmin0*rdif-gtmin0;
        atmax0=gtmax0/rdif;
        if(atmax0>tdims0){atmax0=tdims0;divis[1]=true;}
        len=atmax0-tmin0;
        for(i=0;i<len;i+=1){
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
        var dim2,sigma,i,val;
        dim2=Math.floor((this.dim)/2);
        sigma=sigmastep[0];
        for(i=-dim2;i<dim2;i+=1){
            val=Math.pow(i/sigma,2);
            this.spacearr[i+dim2]=hei*Math.exp(-val/2);
        }
    },
    getArr:function(){
        return this.spacearr;
    },
    compute:function(){return;},
    getDrawable:function(){
        return new Float32Array(this.nwhole);
    },
    isEmpty:function(){
        var i=0;
        while(i<this.nwhole){
            if(this.spacearr[i]!==0){
                return false;
            }
            i+=1;
        }
        return true;
    }
};
// @license-end