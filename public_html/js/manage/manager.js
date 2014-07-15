if(typeof manage==="undefined"){manage={};}
if(typeof manage.manager==="undefined"){manage.manager={};}
$.extend(manage.manager,{
    draw:function(rat){
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
    }
});


