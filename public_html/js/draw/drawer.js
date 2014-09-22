if(typeof draw==="undefined"){draw={};}
if(typeof draw.drawer==="undefined"){draw.drawer={};}
$.extend(draw.drawer,{
    $can:null,
    active:0,
    inited:false,
    drawer:null,
    init:function(){
        this.$can_cont=$("#canvas_cont");
        this.$can=$("<canvas>").attr({id:"main_can"});
        this.appendCans();
        //this.initRenderer(true);
    },
    isInited:function(){
        if(this.inited){return true;}
        if(this.active>1){
            var ret=draw.gl.isInited();
            if(ret){this.inited=true;}
            return ret;
        }
    },
    appendCans:function(){
        if(!this.$can_cont){return;}
        this.$can_cont.append(this.$can);
        this.resize();
    },
    switchTo:function(){
        var ncv=control.settings.ncv.get();
        if(ncv>1){
            if(this.active>1){return;}
        }else{
            if(this.active===1){return;}
        }
        this.inited=false;
        this.init();
        if(ncv>1){
            draw.gl.init();
            this.drawer=draw.gl;
        }else{
            var ret=draw.liner.init();
            this.inited=ret;
            this.drawer=draw.liner;
        }
        this.active=ncv;
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
    },
    getImageData:function(){
        //if(this.drawer)this.drawer.getImageData();
        var ncv=control.settings.ncv.get();
        if(ncv>1){
            this.$can[0];
        }else{
            if(this.active===1){return;}
        }
    }
});
