if(typeof compute==="undefined"){compute={};}
if(typeof compute.sum_hill==="undefined"){compute.sum_hill={};}
compute.sum_hill.tspace={
    spacearr:null,
    dims:null,
    coefs:null,
    ncv:0,
    nbins:0,
    res:1,
    nwhole:0,
    init:function(nbins,ncv){
        this.ncv=ncv;
        this.nbins=nbins;
        var nwh=1;
        this.coefs=new Int32Array(ncv);
        this.dims=new Int32Array(ncv);
        for(var i=0;i<ncv;i++){
            this.dims[i]=nbins[i];
            this.coefs[i]=nwh;
            nwh*=nbins[i];
        }
        this.nwhole=nwh;
        this.spacearr=new Float32Array(nwh);
        if(ncv===1){
            this.plane=this.plane1;
            this.add=this.add1;
        }else if(ncv===2){
            this.plane=this.plane2;
            this.add=this.add2;
        }else if(ncv===3){
            this.plane=this.plane3;
            this.add=this.add3;
        }
    },
    set:function(cvs,value){
        var ndx=0;
        for(var i=0;i<this.ncv;i++){
            ndx+=cvs[i]*this.coefs[i];
        }
        this.spacearr[ndx]=value;
    },
    all:function(value,typ){
        var len=this.nwhole;
        if(typ==="add"){
            for(var i=0;i<len;i++){
                this.spacearr[i]+=value;
            }
        }else
        if(typ==="multiply"){
            for(var i=0;i<len;i++){
                this.spacearr[i]*=value;
            }
        }else{
            for(var i=0;i<len;i++){
                this.spacearr[i]=value;
            }
        }
    },
    plane1:function(value,axi,axival,typ){
        if(typ==="add"){
            this.spacearr[this.coefs[axi]*axival]+=value;
        }else if(typ==="multiply"){
            this.spacearr[this.coefs[axi]*axival]*=value;
        }else{
            this.spacearr[this.coefs[axi]*axival]=value;
        }
    },
    plane2:function(value,axi,axival,typ){
        var raxi=this.restaxi(axi);
        var c0=raxi[0];
        var axiin=axival*this.coefs[axi];
        var coe0=this.coefs[c0];
        if(typ==="add"){
            for(var i=0;i<this.dims[c0];i++){
                this.spacearr[axiin+i*coe0]+=value;
            }
        }else
        if(typ==="multiply"){
            for(var i=0;i<this.dims[c0];i++){
                this.spacearr[axiin+i*coe0]*=value;
            }
        }else
        {
            for(var i=0;i<this.dims[c0];i++){
                this.spacearr[axiin+i*coe0]=value;
            }
        }
    },
    plane3:function(value,axi,axival,typ){
        var raxi=this.restaxi(axi);
        var c0=raxi[0];
        var c1=raxi[1];
        var axiin=axival*this.coefs[axi];
        var coe0=this.coefs[c0];
        var coe1=this.coefs[c1];
        if(typ==="add"){
            for(var i=0;i<this.dims[c0];i++){
                for(var j=0;j<this.dims[c1];j++){
                    this.spacearr[axiin+i*coe0+j*coe1]+=value;
                }
            }
        }else
        if(typ==="multiply"){
            for(var i=0;i<this.dims[c0];i++){
                for(var j=0;j<this.dims[c1];j++){
                    this.spacearr[axiin+i*coe0+j*coe1]*=value;
                }
            }
        }else
        {
            for(var i=0;i<this.dims[c0];i++){
                for(var j=0;j<this.dims[c1];j++){
                    this.spacearr[axiin+i*coe0+j*coe1]=value;
                }
            }
        }
    },
    add1:function(inds,space){
        if(this.res!==space.res){
            manage.console.error("Space.add: Variable resolution not implemented");
            return;
        }
        var tdims0=this.dims[0];   var bdims0=space.dims[0];
        var tmin0=Math.floor(inds[0]*tdims0)-(bdims0-1)/2;
        var tmax0=Math.floor(inds[0]*tdims0)+(bdims0-1)/2+1;
        var bmin0=0;
        //var bmax=space.dims[0];
        if(tmin0<0){bmin0=-tmin0;tmin0=0;}
        //if(tmax>tdims0){bmax=tdims0-tmax+bdims0;tmax=tdims0;}
        if(tmax0>tdims0){tmax0=tdims0;}
        var len=tmax0-tmin0;
        var tcoef0=this.coefs[0];
        var bcoef0=space.coefs[0];
        for(var i=0;i<len;i++){
            this.spacearr[tcoef0*(tmin0+i)]+=space.spacearr[bcoef0*(bmin0+i)];
        }
    },
    add2:function(inds,space){
        if(this.res!==space.res){
            manage.console.error("Space.add: Variable resolution not implemented");
            return;
        }
        var tdims=this.dims;
        var bdims=space.dims;
        var lims=new Float32Array(2*(2+1));
        for(var i=0;i<2;i++){
            var icv=3*i;
            lims[icv]=Math.floor(inds[i]*tdims[i])-(bdims[i]-1)/2;
            lims[icv+1]=Math.floor(inds[i]*tdims[i])+(bdims[i]-1)/2+1;
            lims[icv+2]=0;
            if(lims[icv]<0){lims[icv+2]=-lims[icv];lims[icv]=0;}
            if(lims[icv+1]>tdims[i]){lims[icv+1]=tdims[i];}
        }
        var len0=lims[1]-lims[0];
        var len1=lims[3+1]-lims[3];
        var tcoef=this.coefs;var bcoef=space.coefs;
        for(var i=0;i<len0;i++){
            for(var j=0;j<len1;j++){
                this.spacearr[tcoef[0]*(lims[0]+i)+tcoef[1]*(lims[3]+j)]+=space.spacearr[bcoef[0]*(lims[2]+i)+bcoef[1]*(lims[5]+j)];
            }
        }
        
    },
    add3:function(inds,space){
        if(this.res!==space.res){
            manage.console.error("Space.add: Variable resolution not implemented");
            return;
        }
        var tdims=this.dims;
        var bdims=space.dims;
        var lims=new Float32Array(3*(2+1));
        for(var i=0;i<3;i++){
            var icv=3*i;
            lims[icv]=Math.floor(inds[i]*tdims[i])-(bdims[i]-1)/2;
            lims[icv+1]=Math.floor(inds[i]*tdims[i])+(bdims[i]-1)/2+1;
            lims[icv+2]=0;
            if(lims[icv]<0){lims[icv+2]=-lims[icv];lims[icv]=0;}
            if(lims[icv+1]>tdims[i]){lims[icv+1]=tdims[i];}
        }
        var len0=lims[1]-lims[0];
        var len1=lims[3+1]-lims[3];
        var len2=lims[6+1]-lims[6];
        var tcoef=this.coefs;var bcoef=space.coefs;
        for(var i=0;i<len0;i++){
            for(var j=0;j<len1;j++){
                for(var k=0;k<len2;k++){
                    this.spacearr[tcoef[0]*(lims[0]+i)+tcoef[1]*(lims[3]+j)+tcoef[2]*(lims[6]+k)]+=space.spacearr[bcoef[0]*(lims[2]+i)+bcoef[1]*(lims[5]+j)+bcoef[2]*(lims[8]+k)];
                }
            }
        }
        
    },
    sum:function(space){
        var len=space.length;
        for(var i=0;i<len;i++){
            this.spacearr[i]+=space.spacearr[i];
        }
        return this; 
    },
    restaxi:function(axi){
        var raxi=[];
        for(var i=0;i<this.ncv;i++){
            if(i!==axi){raxi.push(i);}
        }
        return raxi;
    },
    blob:function(sigmastep){
        for(var c=0;c<this.ncv;c++){
            var dim2=(this.dims[c]-1)/2;
            var sigma=sigmastep[c];
            for(var i=-dim2;i<=dim2;i++){
                var val=Math.pow(i/sigma,2);
                this.plane(val,c,i+dim2,"add");
            }
        }
        var len=this.nwhole;
        for(var i=0;i<len;i++){
            this.spacearr[i]=Math.exp(-this.spacearr[i]/2);
        }
    }
};

