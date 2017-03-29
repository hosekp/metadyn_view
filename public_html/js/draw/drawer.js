/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(window.draw===undefined){var draw={};}
if(draw.drawer===undefined){draw.drawer={};}
$.extend(draw.drawer,{
    $can:null,
    engine:null,
    inited:false,
    onload:function(){
        view.axi.subscribe(this,"resize");
    },
    appendCanvas:function(){
        var newcan=this.getCan(),
        oldcan=this.$can;
        if(newcan===oldcan){return;}
        this.$can_cont=$("#canvas_cont").removeClass("empty");
        if(oldcan!==null){
            oldcan.replaceWith(newcan);
        }else{
            this.$can_cont.children("div").remove();
            this.$can_cont.append(newcan);
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
        var ncv,webgl;
        if(!eng){
            ncv=control.settings.ncv.get();
            webgl=control.settings.webgl();
            if(ncv===1){eng="liner";}else
            if(webgl){eng="gl";}else{eng="raster";}
        }
        if(this.engine&&eng===this.engine.engine){return;}
        this.engine=draw[eng];
        if(!this.getCan()){
            this.engine.init();
        }
        view.axi.arrange();
        this.appendCanvas();
        //control.gestures.needRecompute=true;
        
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
        var $can,width,height;
        if(!this.$can_cont){return;}
        if(!this.engine){return;}
        $can=this.getCan();
        if(!$can){return;}
        width=this.$can_cont.width();
        height=this.$can_cont.height();
        $can.width(width);
        $can.height(height);
        $can.attr({width:width,height:height});
//        this.$can[0].width=width;
//        this.$can[0].height=height;
        //var resol=control.settings.resol.get();
//        this.g1.viewportWidth = resol;
//        this.g1.viewportHeight = resol;
        if(this.engine.resize){this.engine.resize(width,height);}
        
    },
    draw:function(drawable,zmax){
        if(this.engine){this.engine.draw(drawable,zmax===0?1:zmax);}
        //manage.console.debug("Drawer: draw");
    },
    reset:function(){
        draw.engine.inited=false;
    },
    notify:function(args){
        if(args==="switch"){this.switchTo();}
        if(args==="resize"){this.resize();}
    }
    
    /*,
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
// @license-end
