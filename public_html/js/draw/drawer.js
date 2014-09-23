if(typeof draw==="undefined"){draw={};}
if(typeof draw.drawer==="undefined"){draw.drawer={};}
$.extend(draw.drawer,{
    $can:null,
    engine:null,
    inited:false,
    drawer:null,
    init:function(){
        this.$can_cont=$("#canvas_cont");
        var oldcan=this.$can;
        this.$can=$("<canvas>").attr({id:"main_can"});
        if(oldcan!==null){
            oldcan.replaceWith(this.$can);
        }else{
            this.$can_cont.append(this.$can);
        }
        this.resize();
    },
    isInited:function(){
        if(this.inited){return true;}
        if(this.drawer){
            this.inited=this.drawer.isInited();
        }
        return this.inited;
    },
    switchTo:function(eng){
        if(!eng){
            var ncv=control.settings.ncv.get();
            var webgl=control.settings.webgl.get();
            if(ncv===1){eng="liner";}else
            if(webgl){eng="gl";}else{eng="raster";}
        }
        if(eng===this.engine){return;}
        this.inited=false;
        this.init();
        this.drawer=draw[eng];
        this.drawer.init();
        this.engine=eng;
        control.gestures.needRecompute=true;
    },
    getCan:function(){
        if(!this.$can){
            this.init();
        }
        return this.$can;
    },
    resize:function(){
        if(!this.$can_cont){return;}
        var width=this.$can_cont.width();
        var height=this.$can_cont.height();
        this.$can.width(width);
        this.$can.height(height);
        this.$can.attr({width:width,height:height});
//        this.$can[0].width=width;
//        this.$can[0].height=height;
        //var resol=control.settings.resol.get();
//        this.g1.viewportWidth = resol;
//        this.g1.viewportHeight = resol;
        draw.gl.resize(width,height);
        
    },
    draw:function(drawable,zmax){
        if(this.drawer)this.drawer.draw(drawable,zmax);
        //manage.console.debug("Drawer: draw");
    },
    reset:function(){
        draw.drawer.inited=false;
    }/*,
    getImageData:function(){
        //if(this.drawer)this.drawer.getImageData();
        var ncv=control.settings.ncv.get();
        if(ncv>1){
            this.$can[0];
        }else{
            if(this.active===1){return;}
        }
    }*/
});
