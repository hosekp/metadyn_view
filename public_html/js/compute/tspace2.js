/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(window.compute===undefined){var compute={};}
if(compute.tspacer===undefined){compute.tspacer={};}
if(compute.tspacer.tspace===undefined){compute.tspacer.tspace={};}
compute.tspacer.tspace.gl2={
    i8arr:null,
    i32arr:null,
    dims:null,
    coefs:null,
    ncv:2,
    nbins:0,
    resol:1,
    nwhole:0,
    ratio:0,
    id:0,
    comp:null,
    init:function(nbins){
        var ncv=this.ncv,nwh=1,i;
        this.nbins=nbins;
        this.dims=[0,0];
        this.coefs=[0,0];
        for(i=0;i<ncv;i+=1){
            this.dims[i]=nbins[i];
            this.coefs[i]=nwh;
            nwh*=nbins[i];
        }
        this.nwhole=nwh;
        this.createArrays(nwh);
    },
    createArrays:function(len){
        this.i8arr=new Uint8Array(len*4);
        this.i32arr=new Uint32Array(this.i8arr.buffer);
    },
    copy:function(hei){
        var space,len,spi32arr,thi32arr,i;
        space=$.extend(true,{},this);
        space.id=compute.tspace.lastid++;
        space.createArrays(this.nwhole);
        if(hei !== undefined){
            len=this.i32arr.length;
            spi32arr=space.i32arr;
            thi32arr=this.i32arr;
            for(i=0;i<len;i+=1){
                spi32arr[i]=thi32arr[i]*hei;
            }
            space.i32arr=spi32arr;
        }else{
            space.i32arr.set(this.i32arr);
        }
        //if(this.spacearr===space.spacearr){manage.console.warning("Storage: Arrays are same");}
        return space;
    },
    set:function(space){
        if(this.ncv!==space.ncv){manage.console.error("Space2: Incompatible arrays");return;}
        if(this.nwhole!==space.nwhole){manage.console.error("Space2: Incompatible arrays");return;}
        this.i8arr.set(space.i8arr);
        this.ratio=space.ratio;
        //if(this.spacearr===space.spacearr){manage.console.warning("Storage: Arrays are same");}
    },
    reset:function(){
        this.ratio=-1;
        this.createArrays(this.nwhole);
        if(this.i32arr[0]!==0){
            manage.console.error("Tspace2: not reseted");
        }
    },
    /*add:function(inds,space){
        if(this.res!==space.res){
            manage.console.error("Space.add: Variable resolution not implemented");
            return;
        }
        var tdims=this.dims;
        var bdims=space.dims;
        var divis=[false,false,false,false];
        if(!this.templims){
            this.templims=new Float32Array(2*(2+1));
        }
        var lims=this.templims;
        for(var i=0;i<2;i+=1){
            var icv=3*i;
            lims[icv]=Math.floor(inds[i]*tdims[i])-(bdims[i]-1)/2;
            lims[icv+1]=Math.floor(inds[i]*tdims[i])+(bdims[i]-1)/2+1;
            lims[icv+2]=0;
            if(lims[icv]<0){lims[icv+2]=-lims[icv];lims[icv]=0;divis[i*2]=true;}
            if(lims[icv+1]>tdims[i]){lims[icv+1]=tdims[i];divis[i*2+1]=true;}
        }
        //var lims=this.computeLims(inds,space);
        var len0=lims[1]-lims[0];
        var len1=lims[4]-lims[3];
        if(len0<1||len1<1){return;}
        var tcoef=this.coefs;var bcoef=space.coefs;
        var tp=lims[0]*tcoef[0]+lims[3]*tcoef[1];
        var bp=lims[2]*bcoef[0]+lims[5]*bcoef[1];
        var tp1,bp1;
        for(var j=0;j<len1;j+=1){
            tp1=tp+tcoef[1]*j;
            bp1=bp+bcoef[1]*j;
            for(var i=0;i<len0;i+=1){
                //this.spacearr[tcoef[0]*(lims[0]+i)+tcoef[1]*(lims[3]+j)]+=space.spacearr[bcoef[0]*(lims[2]+i)+bcoef[1]*(lims[5]+j)];
                this.spacearr[tp1+tcoef[0]*i]+=space.spacearr[bp1+bcoef[0]*i];
            }
        }
        return divis;
    },*/
    add:function(inds){
        if(this.comp===null){
            this.comp={};
            this.comp.inds=[];
            this.comp.counter=0;
        }
        //inds[2]=1; //##########################
        this.comp.inds.push(new Float32Array(inds));
        //this.comp.inds.push(new Float32Array([0,0,1]));
        this.comp.counter+=1;
        //compute.gl_summer.add(this,space);
        return [inds[0]<0.5,inds[0]>0.5,inds[1]<0.5,inds[1]>0.5];
    },
    blob:function(sigmastep,hei){
        //var dim20=Math.floor((this.dims[0]-1)/2);
        //var dim21=Math.floor((this.dims[1]-1)/2);
        var dim0,dim1,i,j,val,offset;
        dim0=this.dims[0];
        dim1=this.dims[1];
        for(i=0;i<dim0;i+=1){
            for(j=0;j<dim1;j+=1){
                val=hei*Math.exp((-Math.pow((i-dim0/2)/sigmastep[0],2)-Math.pow((j-dim1/2)/sigmastep[1],2))/2);
                offset=i*this.coefs[0]+j*this.coefs[1];
                this.i32arr[offset]=val*16384;
                /*if(packed[1]>50){
                    manage.console.debug("Packed: ["+this.packedarr[offset+0]+","+this.packedarr[offset+1]+","+this.packedarr[offset+2]+","+this.packedarr[offset+3]+"] offset: "+offset);
                }*/
            }
        }
    },
    /*pack:function(val){
        var bytes = [0,0,0,0];
        if (val===0){return bytes;}
        var intval=val*(1024*16);
        for(var i=0;i<4;i+=1){
            bytes[i]=Math.floor(intval%256);
            intval/=256;
        }
        return bytes;
    },*/
    compute:function(space,periods){
        var inds,i;
        if(this.comp===null){return;}
        compute.gl_summer.preadd(this,space,periods);
        inds=this.comp.inds;
        for(i=0;i<this.comp.counter;i+=1){
            compute.gl_summer.add(inds[i]);
            //compute.gl_summer.add([0.5,0.5]);
        }
        compute.gl_summer.postadd(this);
        this.comp.inds=[];
        this.comp.counter=0;
    },
    getArr:function(len){
        if(len===32){
            return this.i32arr;
        }
        return this.i8arr;
    },
    print:function(){
        var canvas,len,ctx,data,i,imageData;
        canvas=$("<canvas>").attr({width:this.dims[0],height:this.dims[1]});
        len=this.nwhole;
        ctx=canvas[0].getContext("2d");
        data=new Uint8Array(len*4);
        //var hei=1;var sig=0.03;
        //manage.console.warning("Print: len="+len);
        for(i=0;i<len*4;i+=1){
            data[i]=this.i8arr[i];
            /*if(this.packedarr[i]>0){
                manage.console.debug("Print: na "+i+" je "+data[i]);
            }*/
        }
        for(i=0;i<len;i+=1){
            
            /*data[4*i]=255*Math.exp(-Math.pow(this.spacearr[i]/hei-0.8,2)/sig);
            data[4*i+1]=255*Math.exp(-Math.pow(this.spacearr[i]/hei-0.5,2)/sig);
            data[4*i+2]=255*Math.exp(-Math.pow(this.spacearr[i]/hei-0.2,2)/sig);*/
            data[4*i+3]=255;
        }
        imageData=ctx.createImageData(this.dims[0],this.dims[1]);
        imageData.data.set(data);
        ctx.putImageData(imageData,0,0);
        return canvas;
    },
    sum:function(){
        var i,s=0,len=4*this.nwhole;
        for(i=0;i<len;i+=1){
            s+=this.i8arr[i];
        }
        return s;
    },
    isEmpty:function(){
        var len=this.nwhole,i;
        for(i=0;i<len;i+=1){
            if(this.i32arr!==0){return false;}
        }
        return true; 
    },
    getDrawable:function(){
        return new Uint8Array(this.nwhole*4);
    }
};
// @license-end