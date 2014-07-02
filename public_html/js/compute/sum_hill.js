if(typeof compute==="undefined"){compute={};}
if(typeof compute.sum_hill==="undefined"){compute.sum_hill={};}
$.extend(compute.sum_hill,{
    arhei:null,
    arcvs:[],
    arsigma:[],
    artime:[],
    ncv:1,
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
        this.setRealLimits(params);
    },
    setRealLimits:function(params){
        this.mins=[];
        this.maxs=[];
        this.diffs=[];
        for(var i=0;i<this.ncv;i++){
            this.mins.push(params.cvs[i].min);
            this.maxs.push(params.cvs[i].max);
            this.diffs.push(params.cvs[i].diff);
        }
    },
    createSpace:function(nbins){
        //this.nbins=nbins;
        nbins=this.multibin(nbins);
        var space=$.extend({},compute.sum_hill.tspace);
        space.init(nbins,this.ncv);
        return space;
    },
    createBlob:function(nbins,params){
        //var sigmas=this.checkSigmaConst();
        nbins=this.multibin(nbins);
        var sigmas=[0.3,0.3,0.3];
        var sigmas8=[];
        var sigmas1=[];
        for(var i=0;i<params.ncv;i++){
            var cvstep=nbins[i]/params.cvs[i].diff;
            sigmas1.push(sigmas[i]*cvstep);
            sigmas8.push(Math.floor(sigmas1[i])*this.msi+1);
        }
        var space=this.createSpace(sigmas8);
        //space.all(1);
        space.blob(sigmas1);
        return space;
    },
    multibin:function(nbins){
        if(nbins.length){
            if(nbins.length===this.ncv){
                return nbins;
            }else{
                manage.console.error("Error: Tspace: wrong length of nbins");
            }
        }else{
            var bins=[];
            for(var i=0;i<this.ncv;i++){
                bins.push(nbins);
            }
            return bins;
        }
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
        
    },
    toIndices:function(pos){
        var inds=[];
        for(var i=0;i<this.ncv;i++){
            inds.push((pos[i]-this.mins[i])/this.diffs[i]);
        }
        return inds;
    },
    add:function(space,blob,pos){
        var inds=this.toIndices(pos);
        return space.add(inds,blob);
    }
    
});
