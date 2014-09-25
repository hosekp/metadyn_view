if(typeof draw==="undefined"){draw={};}
if(typeof draw.raster==="undefined"){draw.raster={};}
$.extend(draw.raster,{
    inited:false,
    engine:"raster",
    isInited:function(){
        return this.inited;
    }
});