/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(window.compute===undefined){var compute={};}
if(compute.sum_hill===undefined){compute.sum_hill={};}
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
            this.arhei=arrs.height;
            this.arcvs=arrs.cvs;
            this.arsigma=arrs.sigma;
            this.artime=arrs.time;
            this.arclock=arrs.clock;
            this.nbody=params.nbody;
            this.ncv=this.arcvs.length;
            //this.nbins=this.multibin(50);
            this.params=params;
        }else{
            var ncv=this.ncv,sorter,narclock,sorted,i;
            if(ncv!==arrs.cvs.length){
                manage.console.error("Sum_hill:","Wrong number of CV");
                return;
            }
            sorter=$.extend({},compute.parser.TAsorter);
            if(control.settings.sort.get()){
                narclock=this.join(this.arclock,arrs.clock);
                sorted=sorter.sort(narclock);
                this.arclock=sorter.rearrange(narclock,sorted);
                this.arhei=sorter.rearrange(this.join(this.arhei,arrs.height),sorted);
                this.artime=sorter.rearrange(this.join(this.artime,arrs.time),sorted);
                for(i=0;i<ncv;i+=1){
                    this.arcvs[i]=sorter.rearrange(this.join(this.arcvs[i],arrs.cvs[i]),sorted);
                    this.arsigma[i]=sorter.rearrange(this.join(this.arsigma[i],arrs.sigma[i]),sorted);
                }
            }else{
                this.arclock=this.join(this.arclock,arrs.clock,123);
                this.arhei=this.join(this.arhei,arrs.height);
                this.artime=this.join(this.artime,arrs.time);
                for(i=0;i<ncv;i+=1){
                    this.arcvs[i]=this.join(this.arcvs[i],arrs.cvs[i]);
                    this.arsigma[i]=this.join(this.arsigma[i],arrs.sigma[i]);
                }
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
    join:function(TA1,TA2,special){    // data
        var lenTA1=TA1.length,lenTA2=TA2.length,nar,i;
        nar=new Float32Array(lenTA1+lenTA2);
        if(special===123){
            for(i=0;i<lenTA1+lenTA2;i+=1){
                nar[i]=i+1;
            }
        }else{
            for(i=0;i<lenTA1;i+=1){
                nar[i]=TA1[i];
            }
            for(i=0;i<lenTA2;i+=1){
                nar[i+lenTA1]=TA2[i];
            }
        }
        return nar;
    },
    joinParams:function(par1,par2){    // data
        var i;
        for(i=0;i<this.ncv;i+=1){
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
    purgeBlobs:function(){this.blobs={};},
    setRealLimits:function(){   // data
        var params=this.params,i,norcv,arcv,min,diff,j,lmins=[],lmaxs=[],ldiffs=[],lncv=this.ncv; 
        for(i=0;i<lncv;i+=1){
            lmins.push(params.cvs[i].min);
            lmaxs.push(params.cvs[i].max);
            ldiffs.push(params.cvs[i].max-params.cvs[i].min);
        }
        this.mins=lmins;this.maxs=lmaxs;this.diffs=ldiffs;
        this.norcvs=[];
        for(i=0;i<lncv;i+=1){
            norcv=new Float32Array(this.nbody);
            arcv=this.arcvs[i];
            min=lmins[i];
            diff=ldiffs[i];
            for(j=0;j<this.nbody;j+=1){
                norcv[j]=(arcv[j]-min)/diff;
            }
            this.norcvs.push(norcv);
        }
    },
    checkSigmaConst:function(){   // data
        var sigmas=[],valid=true,i,quarter,sig;
        for(i=0;i<this.ncv;i+=1){
            sig=this.arsigma[i][0];
            sigmas.push(sig);
            quarter=Math.floor(this.nbody/4);
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
        for(var i=0;i<this.ncv;i+=1){
            inds.push((pos[i]-this.mins[i])/this.diffs[i]);
        }
        return inds;
    },*/
    checkHeights:function(from,to){
        var last,i;
        if(to-from<3){
            //manage.console.warning("CheckHeights:","too short",to-from)
            return false;}
        last=this.arhei[from];
        for(i=from+1;i<to;i+=1){
            if(last!==this.arhei[i]){
                return false;
            }
        }
        return last;
    },
    toIndices:function(line,hei){   // sum
        var inds,i;
        if(!this.tempind){
            this.tempind = new Float32Array(this.ncv+1);
        }
        inds=this.tempind;
        for(i=0;i<this.ncv;i+=1){
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
        var ncv=this.ncv,last,to,hei,blob,periods,anyperiod,i,inds,divis,webgl;
        //var resol=control.settings.resol.get();
        webgl=control.settings.webgl();
        last=this.locate(space.ratio);
        to=this.locate(torat);
        hei=this.checkHeights(last,to);
        if(hei===false){
            hei=1;
        }
        if(!this.blobs[1]){this.blobs[1]=compute.tspacer.createBlob(512,1);}
        if(!this.blobs[hei]){
            this.blobs[hei]=this.blobs[1].copy(hei);
            /*var len=0;
            for(var i in this.blobs){
                len+=1;
            }
            manage.console.warning("Tspacer:","blob created.","hei=",hei,"len=",len);*/
        }
        blob=this.blobs[hei];
        periods=this.isPeriodic();
        //manage.console.debug("Add from",last,"(",space.ratio,")","to",to,"(",torat,")");
        anyperiod=false;
        for(i=0;i<ncv;i+=1){
            if(periods[i]){
                anyperiod=true;break;
            }
        }
        if(anyperiod){
            for(i=last;i<to;i+=1){
                inds=this.toIndices(i,hei);
                divis=space.add(inds,blob);
                if(ncv===1){
                    if(divis[0]){inds[0]+=1;space.add(inds,blob);}
                    if(divis[1]){inds[0]-=1;space.add(inds,blob);}
                }else if(ncv===2){
                    if(!webgl){
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
                }else{
                    manage.console.warning("Sum_hills:","Add3 and more","not implemented");
                }
            }
        }else{
            for(i=last;i<to;i+=1){
                inds=this.toIndices(i,hei);
                space.add(inds,blob);
            }
        }
        space.compute(blob,periods);
        space.ratio=torat;
        //manage.console.debug("Added "+(to-last)+" frames");
        return space;
    },
    isPeriodic:function(){   // data
        var ret=[],i;
        for(i=0;i<this.ncv;i+=1){
            ret.push(this.params.cvs[i].periodic);
        }
        return ret;
    },
    locate:function(rat){    // data
        var t0,t1,tr,lower=0,higher,middle;
        if(rat<=0){return 0;}
        t0=this.arclock[0];
        t1=this.arclock[this.nbody-1];
        tr=t0+rat*(t1-t0);
        //manage.console.debug("Locate from "+t0+" to "+t1+" through "+tr);
        if(isNaN(tr)){manage.console.error("Sum_hills:","middlepoint is",tr);}
        higher=this.nbody;
        while (lower+1!==higher){
            //manage.console.debug("Locate from "+lower+" to "+higher);
            middle=Math.floor((lower+higher)/2);
            if(tr>=this.arclock[middle]){lower=middle;}else{higher=middle;}
        }
        return higher;
    },
    getRatioByClock:function(clock){
      var lower=0,higher=this.nbody-1,middle=Math.floor(this.nbody/2);
      if(this.arclock[0]>clock) return this.arclock[0];
      if(this.arclock[higher]<clock) return this.arclock[higher];
      while (lower+1!==higher){
        middle=Math.floor((lower+higher)/2);
        if(clock>=this.arclock[middle]){lower=middle;}else{higher=middle;}
      }
      return lower/this.nbody;
    },
    getClockByRatio:function(ratio){
      if(!this.arclock) return 0;
      return this.arclock[this.locate(ratio)-1] || 0;
    },
    haveData:function(){return this.loaded;},   // data
    findClosestHills:function(cvs,num){
        var wins,dists,ld=10000000000,arcvs,distance2,dist,j,i,w;
        if(!this.loaded){return [];}
        wins=[];
        dists=[];
        arcvs=this.norcvs;
        if(this.ncv===1){
            distance2=function(pos,ihill){
                return Math.pow(pos[0]-arcvs[0][ihill],2);
            };
        }else if(this.ncv===2){
            distance2=function(pos,ihill){
                return Math.pow(pos[0]-arcvs[0][ihill],2)+Math.pow(pos[1]-arcvs[1][ihill],2);
            };
        }else{
            manage.console.error("Sum_hill:","3 and more CVs","not implemented");
            return [];
        }
        for(j=0;j<num;j+=1){
            if(j===this.nbody){return wins;}
            dist=distance2(cvs,j);
            wins.push(j);
            dists.push(dist);
        }
        ld=Math.max.apply("",dists);
        for(i=j;i<this.nbody;i+=1){
            dist=distance2(cvs,i);
            if(dist<ld){
                for(w=0;w<dists.length;w+=1){
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
