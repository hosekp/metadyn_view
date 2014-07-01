if(typeof compute==="undefined"){compute={};}
if(typeof compute.sum_hill==="undefined"){compute.sum_hill={};}
$.extend(compute.sum_hill,{
    arhei:null,
    arcvs:[],
    arsigma:[],
    artime:[],
    ncv:2,
    nbody:0,
    msi:2,  // const - multiple of sigma
    blob:null,
    load:function(arrs,params){
        this.arhei=arrs["height"];
        this.arcvs=arrs["cvs"];
        this.arsigma=arrs["sigma"];
        this.artime=arrs["time"];
        this.nbody=this.arhei.length;
        this.ncv=this.arcvs.length;
        this.blob=this.createBlob(500,params);
    },
    createSpace:function(nbins){
        var space=$.extend({},compute.sum_hill.tspace);
        space.init(nbins,this.ncv);
        return space;
    },
    createBlob:function(nbins,params){
        //var sigmas=this.checkSigmaConst();
        var sigmas=[0.3,0.3,0.3];
        this.ncv=params.ncv;
        var sigmas8=[];
        var sigmas1=[];
        for(var i=0;i<params.ncv;i++){
            var cvstep=nbins/params.cvs[i].diff;
            sigmas1.push(sigmas[i]*cvstep);
            sigmas8.push(Math.floor(sigmas1[i])*this.msi+1);
        }
        var space=this.createSpace(sigmas8);
        //space.all(1);
        space.blob(sigmas1);
        return space;
    },
    checkSigmaConst:function(){
        var sigmas=[];
        var valid=true;
        for(var i=0;i<this.ncv;i++){
            var sig=this.arsigma[i][0];
            sigmas.push(sig);
            if(sig!==this.arsigma[i][math.floor(this.nbody/4)]){valid=false;break;}
            if(sig!==this.arsigma[i][math.floor(this.nbody/2)]){valid=false;break;}
            if(sig!==this.arsigma[i][math.floor(this.nbody/4*3)]){valid=false;break;}
            if(sig!==this.arsigma[i][this.nbody-1]){valid=false;break;}
        }
        if(!valid){
            manage.console.warning("Warning: Variable sigma is not implemented");
        }
        return sigmas;
        
    }
});
compute.sum_hill.tspace={
    spacearr:null,
    dims:null,
    coefs:null,
    ncv:0,
    nbins:0,
    init:function(nbins,ncv){
        this.ncv=ncv;
        if(nbins.length){
            if(nbins.length===ncv){
                this.nbins=nbins;
            }else{
                manage.console.error("Error: Tspace: wrong length of nbins");
            }
        }else{
            this.nbins=[];
            for(var i=0;i<ncv;i++){
                this.nbins.push(nbins);
            }
        }
        var nwhole=1;
        this.coefs=new Int32Array(ncv);
        this.dims=new Int32Array(ncv);
        for(var i=0;i<ncv;i++){
            this.dims[i]=nbins[i];
            this.coefs[i]=nwhole;
            nwhole*=nbins[i];
        }
        this.nwhole=nwhole;
        this.spacearr=new Float32Array(nwhole);
        if(ncv===1){
            this.plane=this.plane1;
        }else if(ncv===2){
            this.plane=this.plane2;
        }else if(ncv===3){
            this.plane=this.plane3;
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

