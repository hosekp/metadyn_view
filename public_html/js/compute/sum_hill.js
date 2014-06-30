if(typeof compute==="undefined"){compute={};}
if(typeof compute.sum_hill==="undefined"){compute.sum_hill={};}
$.extend(compute.sum_hill,{
    arhei:null,
    arcvs:[],
    arsigma:[],
    artime:[],
    ncv:2,
    nbody:0,
    msi:4,  // const - multiple of sigma 
    createSpace:function(nbins){
        var space=$.extend({},compute.sum_hill.tspace);
        space.init(nbins,this.ncv);
        return space;
    },
    createBlob:function(nbins,params){
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
        var sigmas8=[];
        for(var i=0;i<this.ncv;i++){
            sigmas[i]=sigmas[i]*nbins/params.cvs[i].diff;
            sigmas8.push(sigmas[i]*8);
        }
        var space=this.createSpace(sigmas8);
        
        
        
        
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
            this.dims=nbins[i];
            this.coefs[i]=nwhole;
            nwhole*=nbins[i];
        }
        this.spacearr=new Float32Array(nwhole);
    },
    set:function(cvs,value){
        var ndx=0;
        for(var i=0;i<this.ncv;i++){
            ndx+=cvs[i]*this.coefs[i];
        }
        this.spacearr[ndx]=value;
    }
};

