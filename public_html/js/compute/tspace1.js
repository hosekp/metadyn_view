if(typeof compute==="undefined"){compute={};}
if(typeof compute.tspace==="undefined"){compute.tspace={};}
compute.tspace[1]={
    spacearr:null,
    dim:0,
    coef:0,
    ncv:1,
    nbins:0,
    res:1,
    nwhole:0,
    ratio:0,
    init:function(nbins){
        this.id=compute.tspace.lastid++;
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
        if(this.res!==space.res){
            manage.console.error("Space.add: Variable resolution not implemented");
            return;
        }
        var divis=[false,false];
        var tdims0=this.dim;   var bdims0=space.dim;
        var tmin0=Math.floor(inds[0]*tdims0)-(bdims0)/2;
        var tmax0=Math.floor(inds[0]*tdims0)+(bdims0)/2;
        var bmin0=0;
        //var bmax=space.dims[0];
        if(tmin0<0){bmin0=-tmin0;tmin0=0;divis[0]=true;}
        //if(tmax>tdims0){bmax=tdims0-tmax+bdims0;tmax=tdims0;}
        if(tmax0>tdims0){tmax0=tdims0;divis[1]=true;}
        var len=tmax0-tmin0;
        var tcoef0=this.coef;
        var bcoef0=space.coef;
        for(var i=0;i<len;i++){
            this.spacearr[tcoef0*(tmin0+i)]+=space.spacearr[bcoef0*(bmin0+i)];
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
    blob:function(sigmastep){
        var dim2=Math.floor((this.dim)/2);
        var sigma=sigmastep[0];
        for(var i=-dim2;i<dim2;i++){
            var val=Math.pow(i/sigma,2);
            this.spacearr[i+dim2]=Math.exp(-val/2);
        }
    },
    getArr:function(){
        return this.spacearr;
    },
    compute:function(){}
};