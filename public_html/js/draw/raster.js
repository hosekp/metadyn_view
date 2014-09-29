if(typeof draw==="undefined"){draw={};}
if(typeof draw.raster==="undefined"){draw.raster={};}
$.extend(draw.raster,{
    inited:false,
    engine:"raster",
    $can:null,
    init:function(){
        var can=$("<canvas>").attr({id:"main_can_raster"});
        this.$can=can;
    },
    draw:function(array,zmax){
        
    },
    isInited:function(){
        return this.inited;
    }
});