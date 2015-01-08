/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(window.compute===undefined){var compute={};}
if(compute.tspacer===undefined){compute.tspacer={};}
$.extend(compute.tspacer,{
    lastId:1,
    msi:2.8,  // const - multiple of sigma   2=95%
    //tspace:null,
    createSpace:function(bins,ncv){   // spacer
        var space;
        if(!ncv){ncv=control.settings.ncv.get();}
        if(bins===undefined){bins=control.settings.resol.get();}
        if(control.settings.webgl()){
            if(!compute.gl_summer.init()){return null;}
            space=$.extend({},this.tspace["gl"+ncv]);
        }else{
            space=$.extend({},this.tspace[ncv]);
        }
        $.extend(space,{id:this.lastId++,resol:bins});
        space.init(this.multibin(bins,ncv));
        return space;
    },
    createBlob:function(resol,hei){   // spacer
        var sigmas,sigmas1,sigmas8,ncv,i,space;
        if(resol===undefined){resol=control.settings.resol.get();}
        sigmas=compute.sum_hill.checkSigmaConst();
        sigmas8=[];
        sigmas1=[];
        ncv=control.settings.ncv.get();
        for(i=0;i<ncv;i+=1){
            sigmas1.push(sigmas[i]*resol/compute.sum_hill.diffs[i]);
            sigmas8.push(Math.floor(sigmas1[i]*this.msi)*2+1);
        }
        if(ncv===1||control.settings.webgl()){
            space=this.createSpace(resol);
        }else{
            space=this.createSpace(sigmas8);
        }
        space.resol=resol;
        space.blob(sigmas1,hei);
        return space;
    },
    multibin:function(nbins,ncv){   // spacer
        var bins,i;
        if(nbins.length){
            if(nbins.length!==ncv){
                manage.console.error("Error: Tspace: wrong length of nbins");
            }
            return nbins;
        }
        bins=[];
        for(i=0;i<ncv;i+=1){
            bins.push(nbins);
        }
        return bins;
    }
});
if(compute.tspacer.tspace===undefined){compute.tspacer.tspace={};}
compute.tspacer.tspace[2]={
    id:0,
    dims:null,
    coefs:null,
    ncv:2,
    resol:0,
    nwhole:0,
    ratio:0,
    init:function(nbins){
        var ncv=this.ncv,nwh=1,i;
        this.id=compute.tspacer.lastId++;
        this.coefs=new Int32Array(ncv);
        this.dims=new Int32Array(ncv);
        for(i=0;i<ncv;i+=1){
            this.dims[i]=nbins[i];
            this.coefs[i]=nwh;
            nwh*=nbins[i];
        }
        this.nwhole=nwh;
        this.spacearr=new Float32Array(nwh);
    },
    copy:function(hei){
        var space,copyInt32Array,copyFloat32Array;
        space=$.extend(true,{},this);
        this.id=compute.tspacer.lastId++;
        //space.init(this.nbins,this.ncv);
        copyInt32Array=function(array){
            var nar;
            if(!array){return null;}
            nar=new Int32Array(array.length);
            nar.set(array);
            return nar;
        };
        copyFloat32Array=function(array,hei){
            var nar,i,len;
            if(!array){return null;}
            len=array.length;
            nar=new Float32Array(len);
            if(hei === undefined || hei === 1){
                nar.set(array);
            }else{
                for(i=0;i<len;i++){
                    nar[i]=array[i]*hei;
                }
            }
            return nar;
        };
        space.coefs=copyInt32Array(this.coefs);
        space.dims=copyInt32Array(this.dims);
        space.spacearr=copyFloat32Array(this.spacearr,hei);
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
    /*all:function(value,typ){
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
    },*/
    plane:function(value,axi,axival,typ){
        var raxi,c0,axiin,coe0,i;
        raxi=this.restaxi(axi);
        c0=raxi[0];
        axiin=axival*this.coefs[axi];
        coe0=this.coefs[c0];
        if(typ==="add"){
            for(i=0;i<this.dims[c0];i+=1){
                this.spacearr[axiin+i*coe0]+=value;
            }
        }else
        if(typ==="multiply"){
            for(i=0;i<this.dims[c0];i+=1){
                this.spacearr[axiin+i*coe0]*=value;
            }
        }else
        {
            for(i=0;i<this.dims[c0];i+=1){
                this.spacearr[axiin+i*coe0]=value;
            }
        }
    },
    oldadd:function(inds,space){
        var tdims,bdims,divis,lims,i,icv,hei,len0,len1,tcoef,bcoef,tp,bp,tp1,bp1,j;
        if(this.resol!==space.resol){
            manage.console.error("Space.add: Variable resolution not implemented");
            return;
        }
        tdims=this.dims;
        bdims=space.dims;
        divis=[false,false,false,false];
        lims=this.templims;
        if(!lims){
            this.templims=new Float32Array(2*(2+1));
            lims=this.templims;
        }
        for(i=0;i<2;i+=1){
            icv=3*i;
            lims[icv]=Math.floor(inds[i]*tdims[i])-(bdims[i]-1)/2;
            lims[icv+1]=Math.floor(inds[i]*tdims[i])+(bdims[i]-1)/2+1;
            lims[icv+2]=0;
            if(lims[icv]<0){lims[icv+2]=-lims[icv];lims[icv]=0;divis[i*2]=true;}
            if(lims[icv+1]>tdims[i]){lims[icv+1]=tdims[i];divis[i*2+1]=true;}
        }
        hei=inds[2];
        //var lims=this.computeLims(inds,space);
        len0=lims[1]-lims[0];
        len1=lims[4]-lims[3];
        if(len0<1||len1<1){return;}
        tcoef=this.coefs;bcoef=space.coefs;
        tp=lims[0]*tcoef[0]+lims[3]*tcoef[1];
        bp=lims[2]*bcoef[0]+lims[5]*bcoef[1];
        for(j=0;j<len1;j+=1){
            tp1=tp+tcoef[1]*j;
            bp1=bp+bcoef[1]*j;
            for(i=0;i<len0;i+=1){
                //this.spacearr[tcoef[0]*(lims[0]+i)+tcoef[1]*(lims[3]+j)]+=space.spacearr[bcoef[0]*(lims[2]+i)+bcoef[1]*(lims[5]+j)];
                this.spacearr[tp1+tcoef[0]*i]+=hei*space.spacearr[bp1+bcoef[0]*i];
            }
        }
        return divis;
    },
    add:function(inds,space){
        var rdif,tdims,bdims,divis,lims,i,j,icv,b2,gtmid,gtmin,gtmax,tmin,bmin,atmax,len0,len1,
        tcoef,bcoef,hei,tp,bp,bc0rd,tp1,bp1;
        rdif=space.resol/this.resol;
        tdims=this.dims;
        bdims=space.dims;
        divis=[false,false,false,false];  // is overflowing on [left,right,top,bottom]
        lims=this.templims;
        if(!lims){
            this.templims=new Int32Array(2*(2+1));
            lims=this.templims;
        }
        for(i=0;i<2;i+=1){
            icv=3*i;
            b2=Math.floor((bdims[i])/2);
            gtmid=Math.round(inds[i]*space.resol); // this.mid in greater resolution
            gtmin=gtmid-b2;                        // this.min in greater resolution (partially floored)
            gtmax=gtmid+b2;                        // this.max in greater resolution (partially floored)
            if(gtmin<0){tmin=0;divis[i*2]=true;}else{tmin=Math.ceil(gtmin/rdif);} // this.min floored
            bmin=tmin*rdif-gtmin;                                                 // offset of space.min
            atmax=gtmax/rdif;                                                     // this.max (not floored)
            if(atmax>tdims[i]){atmax=tdims[i];divis[i*2+1]=true;}
            lims[icv]=tmin;
            lims[icv+1]=Math.floor(atmax);
            lims[icv+2]=bmin;
        }
        len0=lims[1]-lims[0];
        len1=lims[4]-lims[3];
        if(len0<1||len1<1){
            return divis;
        }
        tcoef=this.coefs;bcoef=space.coefs;
        hei=inds[2];
        tp=lims[0]*tcoef[0]+lims[3]*tcoef[1]; // i,j-invariable part of indices for this
        bp=lims[2]*bcoef[0]+lims[5]*bcoef[1]; // i,j-invariable part of indices for space
        bc0rd=bcoef[0]*rdif;
        for(j=0;j<len1;j+=1){
            tp1=tp+tcoef[1]*j;      // i-invariable part of tp
            bp1=bp+bcoef[1]*j*rdif; // i-invariable part of bp
            for(i=0;i<len0;i+=1){
                //this.spacearr[tcoef[0]*(lims[0]+i)+tcoef[1]*(lims[3]+j)]+=hei*space.spacearr[bcoef[0]*(lims[2]+i*rdif)+bcoef[1]*(lims[5]+j*rdif)];
                this.spacearr[tp1+tcoef[0]*i]+=hei*space.spacearr[bp1+bc0rd*i];
            }
        }
        //manage.console.debug(divis);
        return divis;
    },
    sum:function(space){
        var len=space.length,i;
        for(i=0;i<len;i+=1){
            this.spacearr[i]+=space.spacearr[i];
        }
        return this; 
    },
    isEmpty:function(){
        var len=this.nwhole,i;
        for(i=0;i<len;i+=1){
            if(this.spacearr[i]!==0){return false;}
        }
        return true; 
    },
    restaxi:function(axi){
        var raxi=[],i;
        for(i=0;i<this.ncv;i+=1){
            if(i!==axi){raxi.push(i);}
        }
        return raxi;
    },
    blob:function(sigmastep,hei){
        var c,dim2,sigma,i,val,len;
        for(c=0;c<this.ncv;c+=1){
            dim2=Math.floor((this.dims[c]-1)/2);
            sigma=sigmastep[c];
            for(i=-dim2;i<=dim2;i+=1){
                val=Math.pow(i/sigma,2);
                this.plane(val,c,i+dim2,"add");
            }
        }
        len=this.nwhole;
        for(i=0;i<len;i+=1){
            this.spacearr[i]=hei*Math.exp(-this.spacearr[i]/2);
        }
    },
    /*print:function(){
        var canvas=$("<canvas>").attr({width:this.dims[0],height:this.dims[1]});
        var len=this.nwhole;
        var data=new Uint8ClampedArray(len*4);
        var hei=1;var sig=0.03;
        var ctx=canvas[0].getContext("2d");
        //var data=imageData.data;
        for(var i=0;i<len;i+=1){
            
            data[4*i]=255*Math.exp(-Math.pow(this.spacearr[i]/hei-0.8,2)/sig);
            data[4*i+1]=255*Math.exp(-Math.pow(this.spacearr[i]/hei-0.5,2)/sig);
            data[4*i+2]=255*Math.exp(-Math.pow(this.spacearr[i]/hei-0.2,2)/sig);
            data[4*i+3]=255;
        }
        var imageData=ctx.createImageData(this.dims[0],this.dims[1]);
        imageData.data.set(data);
        ctx.putImageData(imageData,0,0);
        return canvas;
    },*/
    getArr:function(){
        return this.spacearr;
    },
    getDrawable:function(){
        return new Float32Array(this.nwhole);
    },
    compute:function(){return;} // Not used in this Tspace, but in others 
};
compute.tspacer.tspace[3]={
    init:function(){
        manage.console.error("Error: More than 2 CVs is not implemented");
    }
};
// @license-end
