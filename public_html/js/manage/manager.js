if(typeof manage==="undefined"){manage={};}
if(typeof manage.manager==="undefined"){manage.manager={};}
$.extend(manage.manager,{
    lastSpace:null,
    lastRat:-1,
    draw_text:function(rat){
        if(!draw.gl.inited){return false;}
        var resol=control.settings.resol.get();
        var array=new Uint8Array(resol*resol);
        for(var i=0;i<resol;i++){
            for(var j=0;j<resol;j++){
                array[j+resol*i]=255*Math.pow(Math.sin(i/resol*Math.PI)*Math.sin((j/resol+rat)*Math.PI),2);
            }
        }
        draw.gl.draw(array);
        return true;
    },
    draw:function(rat){
        if(!draw.gl.inited){return false;}
        if(!compute.sum_hill.haveData()){return false;}
        if(rat<this.lastRat){
            this.lastRat=-1;
            this.lastSpace=null;
        }
        if(this.lastSpace===null){
            this.initSpace();
        }
        //var nar=this.lastSpace;
        if(rat!==this.lastRat){
            this.lastSpace=compute.sum_hill.add(this.lastSpace,this.lastRat,rat);
            manage.console.debug("Add from "+this.lastRat+" to "+rat);
            this.lastRat=rat;
        }
        var arr=this.lastSpace.spacearr;
        draw.gl.draw(this.touint(arr));
        return true;
        
    },
    initSpace:function(){
        //var resol=control.settings.resol.get();
        this.lastSpace=compute.sum_hill.createSpace();
    },
    setResol:function(){
        this.lastSpace=null;
        this.lastRat=-1;
        control.control.needRedraw=true;
    },
    purge:function(){
        this.lastSpace=null;
        compute.sum_hill.purge();
    },
    touint:function(array){
        var len=array.length;
        var nar=new Uint8Array(len);
        for (var i=0;i<len;i++){
            nar[i]=array[i];
        }
        return nar;
    }
});


