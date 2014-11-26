/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(typeof compute==="undefined"){compute={};}
if(typeof compute.sum_hill==="undefined"){compute.sum_hill={};}
$.extend(compute.sum_hill,{
    arhei:null,
    arcvs:null,
    norcvs:null,
    arsigma:null,
    artime:null,
    ncv:1,
    nbody:0,
    blobs:{},
    params:null,
    loaded:false,
    load:function(arrs,params){   // data
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
                manage.console.error("Sum_hill:","Wrong number of CV");
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
        manage.manager.dataLoaded();
        //this.blob=this.createBlob();
        //manage.console.log("Sum_hills:","loaded");
    },
    join:function(TA1,TA2){    // data
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
    joinParams:function(par1,par2){    // data
        for(var i=0;i<this.ncv;i++){
            par1.cvs[i].min=Math.min(par1.cvs[i].min,par2.cvs[i].min);
            par1.cvs[i].max=Math.max(par1.cvs[i].max,par2.cvs[i].max);
            par1.cvs[i].diff=par1.cvs[i].max-par1.cvs[i].min;
        }
        return par1;
    },
    purge:function(){    // data
        this.arhei=null;
        this.arcvs=null;
        this.arsigma=null;
        this.artime=null;
        this.blobs={};
        this.loaded=false;
        this.tempind=null;
        this.loaded=false;
        compute.parser.mintime=null;
    },
    setRealLimits:function(){   // data
        var params=this.params;
        this.mins=[];
        this.maxs=[];
        this.diffs=[];
        for(var i=0;i<this.ncv;i++){
            this.mins.push(params.cvs[i].min);
            this.maxs.push(params.cvs[i].max);
            this.diffs.push(params.cvs[i].max-params.cvs[i].min);
        }
        this.normalize();
    },
    normalize:function(){   // data
        this.norcvs=[];
        for(var i=0;i<this.ncv;i++){
            var norcv=new Float32Array(this.nbody);
            var arcv=this.arcvs[i];
            var min=this.mins[i];
            var diff=this.diffs[i];
            for(var j=0;j<this.nbody;j++){
                norcv[j]=(arcv[j]-min)/diff;
            }
            this.norcvs.push(norcv);
        }
    },
    checkSigmaConst:function(){   // data
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
            manage.console.warning("Sum_hills:","Variable sigma is not supported");
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
    checkHeights:function(from,to){
        var last=this.arhei[from];
        for(var i=from+1;i<to;i++){
            if(last!==this.arhei[i]){
                return false;
            }
        }
        return last;
    },
    toIndices:function(line,hei){   // sum
        if(!this.tempind){
            this.tempind = new Float32Array(this.ncv+1);
        }
        var inds=this.tempind;
        for(var i=0;i<this.ncv;i++){
            inds[i]=this.norcvs[i][line];
        }
        if(hei===1){
            inds[this.ncv]=this.arhei[line];
        }else{
            inds[this.ncv]=1;
        }
        return inds;
    },
    add:function(space,torat){    // sum
        var resol=control.settings.resol.get();
        var ncv=this.ncv;
        var last=this.locate(space.ratio);
        var to=this.locate(torat);
        var hei=this.checkHeights(last,to);
        if(hei===false){
            hei=1;
        }
        if(!this.blobs[1]){this.blobs[1]=compute.tspacer.createBlob(512,hei);};
        if(!this.blobs[hei]){
            this.blobs[hei]=this.blobs[1].copy(hei);
            /*var len=0;
            for(var i in this.blobs){
                len++;
            }
            manage.console.warning("Tspacer:","blob created.","hei=",hei,"len=",len);*/
        }
        var blob=this.blobs[hei];
        var periods=this.isPeriodic();
        //manage.console.debug("Add from "+last+" to "+to);
        var anyperiod=false;
        for(var i=0;i<this.ncv;i++){
            if(periods[i]){
                anyperiod=true;break;
            }
        }
        var inds;
        var divis;
        if(anyperiod){
            for(var i=last;i<to;i++){
                inds=this.toIndices(i,hei);
                divis=space.add(inds,blob);
                if(this.ncv===1){
                    var ind1=inds[0];
                    if(divis[0]){space.add([ind1-1],blob);}
                    if(divis[1]){space.add([ind1+1],blob);}
                }else if(this.ncv===2){
                    if(!control.settings.webgl()){
                        if(divis[0]){
                            inds[0]+=1;
                            space.add(inds,blob);
                            if(divis[2]){
                                inds[1]+=1;
                                space.add(inds,blob);
                                inds[0]-=1;
                                space.add(inds,blob);
                            }else if(divis[3]){
                                inds[1]-=1;
                                space.add(inds,blob);
                                inds[0]-=1;
                                space.add(inds,blob);
                            }
                        }else if(divis[1]){
                            inds[0]-=1;
                            space.add(inds,blob);
                            if(divis[2]){
                                inds[1]+=1;
                                space.add(inds,blob);
                                inds[0]+=1;
                                space.add(inds,blob);
                            }else if(divis[3]){
                                inds[1]-=1;
                                space.add(inds,blob);
                                inds[0]+=1;
                                space.add(inds,blob);
                            }
                        }else{
                            if(divis[2]){
                                inds[1]+=1;
                                space.add(inds,blob);
                            }else if(divis[3]){
                                inds[1]-=1;
                                space.add(inds,blob);
                            }
                        }
                    }
                }else if(this.ncv===3){
                    manage.console.warning("Sum_hills:","Add3","not implemented");
                }else{
                }
            }
        }else{
            for(var i=last;i<to;i++){
                var inds=this.toIndices(i,hei);
                space.add(inds,blob);
            }
        }
        space.compute(blob,periods);
        space.ratio=torat;
        //manage.console.debug("Added "+(to-last)+" frames");
        return space;
    },
    isPeriodic:function(){   // data
        var ret=[];
        for(var i=0;i<this.ncv;i++){
            ret.push(this.params.cvs[i].periodic);
        }
        return ret;
    },
    locate:function(rat){    // data
        if(rat<=0){return 0;}
        var t0=this.artime[0];
        var t1=this.artime[this.nbody-1];
        var tr=t0+rat*(t1-t0);
        var lower=0;
        //manage.console.debug("Locate from "+t0+" to "+t1+" through "+tr);
        var higher=this.nbody;
        while (lower+1!==higher){
            //manage.console.debug("Locate from "+lower+" to "+higher);
            var middle=Math.floor((lower+higher)/2);
            if(tr>=this.artime[middle]){lower=middle;}else{higher=middle;}
        }
        return higher;
        
    },
    haveData:function(){return this.loaded;},   // data
    findClosestHills:function(cvs,num){
        if(!this.loaded){return [];}
        var wins=[];
        var dists=[];
        var ld=10000000000;
        var arcvs=this.norcvs;
        if(this.ncv===1){
            var distance2=function(pos,ihill){
                return Math.pow(pos[0]-arcvs[0][ihill],2);
            };
        }else if(this.ncv===2){
            var distance2=function(pos,ihill){
                return Math.pow(pos[0]-arcvs[0][ihill],2)+Math.pow(pos[1]-arcvs[1][ihill],2);
            };
        }else{
            manage.console.error("Sum_hill:","3 and more CVs","not implemented");
            return [];
        }
        var dist;
        for(var j=0;j<num;j++){
            if(j===this.nbody){return wins;}
            dist=distance2(cvs,j);
            wins.push(j);
            dists.push(dist);
        }
        ld=Math.max.apply("",dists);
        for(var i=j;i<this.nbody;i++){
            dist=distance2(cvs,i);
            if(dist<ld){
                for(var w=0;w<dists.length;w++){
                    if(dists[w]===ld){
                        wins[w]=i;
                        dists[w]=dist;
                    }
                }
                ld=Math.max.apply("",dists);
            }
        }
        return wins;
    }
});
// @license-end