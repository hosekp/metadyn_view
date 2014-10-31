if(typeof draw==="undefined"){draw={};}
if(typeof draw.drawer==="undefined"){draw.drawer={};}
$.extend(draw.drawer,{
    $can:null,
    engine:null,
    inited:false,
    appendCanvas:function(){
        var newcan=this.getCan();
        var oldcan=this.$can;
        if(newcan===oldcan){return;}
        this.$can_cont=$("#canvas_cont");
        if(oldcan!==null){
            oldcan.replaceWith(newcan);
        }else{
            this.$can_cont.empty().append(newcan);
        }
        this.$can=newcan;
        //this.engine.$can=$can;
        this.resize();
    },
    isInited:function(){
        //if(this.inited){return true;}
        if(this.engine){
            return this.engine.isInited();
        }
        return false;
    },
    switchTo:function(eng){
        if(!eng){
            var ncv=control.settings.ncv.get();
            var webgl=control.settings.webgl.get();
            if(ncv===1){eng="liner";}else
            if(webgl){eng="gl";}else{eng="raster";}
        }
        if(this.engine&&eng===this.engine.engine){return;}
        this.engine=draw[eng];
        if(!this.getCan()){
            this.engine.init();
        }
        this.appendCanvas();
        control.gestures.needRecompute=true;
    },
    /*getCan:function(){
        if(!this.$can){
            this.init();
        }
        return this.$can;
    },*/
    getCan:function(){
        if(!this.engine){return null;}
        return this.engine.$can;
    },
    resize:function(){
        if(!this.$can_cont){return;}
        if(!this.engine){return;}
        var $can=this.getCan();
        if(!$can){return;}
        var width=this.$can_cont.width();
        var height=this.$can_cont.height();
        $can.width(width);
        $can.height(height);
        $can.attr({width:width,height:height});
//        this.$can[0].width=width;
//        this.$can[0].height=height;
        //var resol=control.settings.resol.get();
//        this.g1.viewportWidth = resol;
//        this.g1.viewportHeight = resol;
        if(this.engine.resize){this.engine.resize(width,height);}
        control.control.needRedraw=true;
        
    },
    draw:function(drawable,zmax){
        if(this.engine)this.engine.draw(drawable,zmax);
        //manage.console.debug("Drawer: draw");
    },
    reset:function(){
        draw.engine.inited=false;
    }/*,
    getImageData:function(){
        //if(this.engine)this.engine.getImageData();
        var ncv=control.settings.ncv.get();
        if(ncv>1){
            this.$can[0];
        }else{
            if(this.active===1){return;}
        }
    }*/
});
