if(typeof compute==="undefined"){compute={};}
if(typeof compute.sum_hill==="undefined"){compute.sum_hill={};}
$.extend(compute.sum_hill,{
    arhei:null,
    arcvs:null,
    arsigma:null,
    artime:null,
    ncv:1,
    nbody:0,
    msi:2.3,  // const - multiple of sigma   2=95%
    blobs:{},
    params:null,
    loaded:false,
    load:function(arrs,params){
        if(this.arhei===null){
            this.arhei=arrs["height"];
            this.arcvs=arrs["cvs"];
            this.arsigma=arrs["sigma"];
            this.artime=arrs["time"];
            this.arclock=arrs["clock"];
            this.nbody=params.nbody;
            this.ncv=this.arcvs.length;
            //this.nbins=this.multibin(50);
            this.params=params;
        }else{
            var ncv=this.ncv;
            if(ncv!==arrs["cvs"].length){
                manage.console.error("Sum_hill: Load: wrong number of CV");
                return;
            }
            var sorter=$.extend({},compute.parser.TAsorter);
            var nartime=this.join(this.artime,arrs["clock"]);
            var sorted=sorter.sort(nartime);
            this.artime=sorter.rearrange(nartime,sorted);
            this.arhei=sorter.rearrange(this.join(this.arhei,arrs["height"]),sorted);
            for(var i=0;i<ncv;i++){
                this.arcvs[i]=sorter.rearrange(this.join(this.arcvs[i],arrs["cvs"][i]),sorted);
                this.arsigma[i]=sorter.rearrange(this.join(this.arsigma[i],arrs["sigma"][i]),sorted);
            }
            this.nbody+=params.nbody;
            this.params=this.joinParams(this.params,params);
        }
        this.setRealLimits();
        this.loaded=true;
        //this.blob=this.createBlob();
        manage.console.log("Sum_hills: loaded");
    },
    join:function(TA1,TA2){
        var lenTA1=TA1.length;
        var lenTA2=TA2.length;
        var nar=new Float32Array(lenTA1+lenTA2);
        for(var i=0;i<lenTA1;i++){
            nar[i]=TA1[i];
        }
        //var sumlen=lenTA1+lenTA2;
        for(var i=0;i<lenTA2;i++){
            nar[i+lenTA1]=TA2[i];
        }
        return nar;
    },
    joinParams:function(par1,par2){
        for(var i=0;i<this.ncv;i++){
            par1.cvs[i].min=Math.min(par1.cvs[i].min,par2.cvs[i].min);
            par1.cvs[i].max=Math.max(par1.cvs[i].max,par2.cvs[i].max);
            par1.cvs[i].diff=par1.cvs[i].max-par1.cvs[i].min;
        }
        return par1;
    },
    purge:function(){
        this.arhei=null;
        this.arcvs=null;
        this.arsigma=null;
        this.artime=null;
        this.blobs={};
        this.loaded=false;
    },
    setRealLimits:function(){
        var params=this.params;
        this.mins=[];
        this.maxs=[];
        this.diffs=[];
        for(var i=0;i<this.ncv;i++){
            this.mins.push(params.cvs[i].min);
            this.maxs.push(params.cvs[i].max);
            this.diffs.push(params.cvs[i].max-params.cvs[i].min);
        }
    },
    createSpace:function(resol){
        if(typeof resol==="undefined"){resol=control.settings.resol.get();}
        var space=$.extend({},compute.sum_hill.tspace);
        space.init(this.multibin(resol),this.ncv);
        return space;
    },
    createBlob:function(resol){
        if(typeof resol==="undefined"){resol=control.settings.resol.get();}
        var sigmas=this.checkSigmaConst();
        //var sigmas=[0.3,0.3,0.3];
        var sigmas8=[];
        var sigmas1=[];
        for(var i=0;i<this.ncv;i++){
            var cvstep=resol/this.diffs[i];
            sigmas1.push(sigmas[i]*cvstep);
            sigmas8.push(Math.floor(sigmas1[i]*this.msi)*2+1);
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
            var quarter=Math.floor(this.nbody/4);
            if(sig!==this.arsigma[i][quarter]){valid=false;/*manage.console.debug("Sigma"+i+" "+sig+"!="+this.arsigma[i][quarter]+" at 1/4");*/}
            if(sig!==this.arsigma[i][quarter*2]){valid=false;}
            if(sig!==this.arsigma[i][quarter*3]){valid=false;}
            if(sig!==this.arsigma[i][this.nbody-1]){valid=false;}
            //manage.console.debug(this.arcvs[i][this.nbody-1]+" "+this.arhei[this.nbody-1]);
            
        }
        if(!valid){
            manage.console.warning("Warning: Variable sigma is not implemented");
        }
        return sigmas;
    },
    /*toIndices:function(pos){
        var inds=[];
        for(var i=0;i<this.ncv;i++){
            inds.push((pos[i]-this.mins[i])/this.diffs[i]);
        }
        return inds;
    },*/
    toIndices:function(line){
        var inds = new Float32Array(this.ncv);
        //var inds=[];
        for(var i=0;i<this.ncv;i++){
            inds[i]=((this.arcvs[i][line]-this.mins[i])/this.diffs[i]);
        }
        return inds;
    },
    singleadd:function(space,blob,pos){
        var inds=this.toIndices(pos);
        return space.add(inds,blob);
    },
    add:function(space,torat){
        var resol=control.settings.resol.get();
        if(!this.blobs[resol]){
            this.blobs[resol]=this.createBlob(resol);
        }
        var blob=this.blobs[resol];
        var ncv=this.ncv;
        var last=this.locate(space.ratio);
        var to=this.locate(torat);
        //manage.console.debug("Add from "+last+" to "+to);
        for(var i=last;i<to;i++){
            var inds=this.toIndices(i);
            space.add(inds,blob);
        }
        space.ratio=torat;
        //manage.console.debug("Added "+(to-last)+" frames");
        return space;
        
    },
    locate:function(rat){
        if(rat<0){return 0;}
        var t0=this.artime[0];
        var t1=this.artime[this.nbody-1];
        var tr=t0+rat*(t1-t0);
        var lower=0;
        //manage.console.debug("Locate from "+t0+" to "+t1+" through "+tr);
        var higher=this.nbody;
        /*var exp=this.nbody*rat-1;
        var lexp=Math.max(exp-5,lower);
        var hexp=Math.min(exp+5,higher);
        if(tr>=this.artime[lexp]){
            lower=lexp;
        }
        if(tr<this.artime[hexp]){
            higher=hexp;
        }*/
        while (lower+1!==higher){
            //manage.console.debug("Locate from "+lower+" to "+higher);
            var middle=Math.floor((lower+higher)/2);
            if(tr>=this.artime[middle]){lower=middle;}else{higher=middle;}
        }
        return higher;
        
    },
    haveData:function(){return this.loaded;}
    
});
