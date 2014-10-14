if(typeof view==="undefined"){view={};}
if(typeof view.axi==="undefined"){view.axi={};}
$.extend(view.axi,{
    tips:{up:"Zvýšit",down:"Snížit",select:"Změnit osy",auto:"Automatická osa"},
    autosrc:["manual","semiauto","auto"],
    div:{},
    template:"",
    xwidth:40,
    ywidth:50,
    zwidth:55,
    zheight:40,
    needRedraw:true,
    needArrange:true,
    rendered:false,
    init:function(){
        $.get("templates/axi.html",$.proxy(this.loaded,this),"text");
    },
    loaded:function(template){
        if(template){
            this.template=template;
        }
        this.render();
        this.bind();
    },
    render:function(){
        var template=this.template;
        this.div.$cancont=$("#canvas_cont");
        this.div.$main_cont=$("#main_cont");
        var autoset=control.settings.axi_auto.get();
        //var rendered=Mustache.render(template,$.extend({},this.tips,{autoset:autoset?"on":""}));
        var rendered=Mustache.render(template,$.extend({},this.tips,{autoset:this.autosrc[autoset]}));
        this.div.$main_cont.html(rendered);
        this.div.$x=$("#axi_x");
        this.div.$y=$("#axi_y");
        this.div.$select=$("#axi_select");
        this.div.$z_auto=$("#axi_z_auto");
        this.div.$z_cont=$("#axi_z_cont");
        this.div.$z=$("#axi_z");
        this.div.$z_up=$("#axi_z_up");
        this.div.$z_down=$("#axi_z_down");
        this.div.$x.before(this.div.$cancont);
        //if(this.div.$cancont.children().length <= 0){manage.console.warning("Canvas not appended");}
        //if(this.div.$cancont.children().length <= 0){draw.drawer.appendCans();}
        this.rendered=true;
    },
    arrange:function(zaxi){
        if(!this.rendered){return;}
        var zwidth=this.zwidth;
        if(!zaxi){
            zwidth=0;
            this.div.$z_cont.hide();
            this.div.$z_auto.css({top:"100%",width:this.ywidth+"px",height:this.zheight+"px",left:"0px"}).css({top:"-="+(this.xwidth)+"px"});
            this.div.$select.hide();
        }else{
            this.div.$z_cont.show();
            this.div.$z_auto.css({top:"100%",width:this.zwidth+"px",height:this.zheight+"px",left:"100%"}).css({top:"-="+(this.zheight)+"px",left:"-="+this.zwidth+"px"});
            this.div.$select.show();
        }
        this.div.$y.css({top:"0px",left:"0px",height:"100%",width:this.ywidth+"px"}).css({height:"-="+this.xwidth+"px"});
        this.div.$select.css({top:"100%",left:"0px",height:this.xwidth+"px",width:this.ywidth+"px"}).css({top:"-="+this.xwidth+"px"});
        this.div.$cancont.css({top:"5px",left:(this.ywidth+5)+"px",height:"100%",width:"100%"}).css({height:"-="+(this.xwidth+10)+"px",width:"-="+(this.ywidth+zwidth+10)+"px"});
        this.div.$x.css({top:"100%",left:this.ywidth+"px",height:this.xwidth+"px",width:"100%"}).css({top:"-="+this.xwidth+"px",width:"-="+(this.ywidth+zwidth)+"px"});
        this.div.$z_cont.css({top:"0px",left:"100%",height:"100%",width:zwidth+"px"}).css({left:"-="+zwidth+"px",height:"-="+this.xwidth});
        this.div.$z_up.css({top:"0px",width:this.zwidth+"px",height:this.zheight+"px"});
        this.div.$z.css({top:this.zheight+"px",width:this.zwidth+"px",height:"100%"}).css({height:"-="+(2*this.zheight)+"px"});
        this.div.$z_down.css({top:"100%",width:this.zwidth+"px",height:this.zheight+"px"}).css({top:"-="+(this.zheight)+"px"});
        
        draw.drawer.resize();
        this.needRedraw=true;
        this.needArrange=false;
        //manage.console.debug("Axis resized");
    },
    drawAxes:function(){
        if(this.needArrange){
            this.arrange(control.settings.ncv.get()>1);
        }
        if(!this.needRedraw){return;}
        if(!compute.sum_hill.haveData()){
            return false;
        }
        var ncv=control.settings.ncv.get();
        if(ncv===0){
            manage.console.warning("Axi_view: ncv not set");
        }else if(ncv===1){
            this.drawAxes1();
        }else{
            this.drawAxes2();
        }
    },
    drawAxes1:function(){
        //X-AXI
        var can=this.div.$x;
        var width=can.width();
        var height=can.height();
        can.attr({width:width,height:height});
        var ctx=can[0].getContext("2d");
        ctx.strokeStyle="black";
        ctx.beginPath();
        ctx.moveTo(5,1);
        ctx.lineTo(width-5,1);
        var min=compute.axi.getMin(true);
        var max=compute.axi.getMax(true);
        var diff=max-min;
        var limits=this.natureRange(min,max,10,false);
        var range=this.drange(limits);
        var dec=this.getDec(limits[2]);
        for(var i=0;i<range.length;i++){
            var pos=5+(range[i]-min)/diff*(width-10);
            ctx.moveTo(pos,1);
            ctx.lineTo(pos,10);
            ctx.fillText(this.toPrecision(range[i],dec),pos-10,20);
        }
        ctx.stroke();
        var text=compute.axi.getName(true);
        ctx.fillText(text,width/2-10,35);
        
        //Y-AXI
        var can=this.div.$y;
        var width=can.width();
        var height=can.height();
        can.attr({width:width,height:height});
        var ctx=can[0].getContext("2d");
        ctx.strokeStyle="black";
        ctx.beginPath();
        ctx.moveTo(width-1,5);
        ctx.lineTo(width-1,height-5);
        var min=0;
        var max=compute.axi.zmax;
        var diff=max-min;
        var limits=this.natureRange(min,max,10,false);
        var range=this.drange(limits);
        var dec=this.getDec(limits[2]);
        for(var i=0;i<range.length;i++){
            var pos=height-5-(range[i]-min)/diff*(height-10);
            ctx.moveTo(width-1,pos);
            ctx.lineTo(width-5,pos);
            ctx.fillText(this.toPrecision(range[i],dec),width-30,pos+5);
        }
        ctx.stroke();
        ctx.save();
        ctx.rotate(3*Math.PI/2);
        var text="kJ/mol";
        ctx.fillText(text,-height/2-15,10);
        ctx.restore();
    },
    drawAxes2:function(){
        var pow=control.settings.zoompow();
        // X-AXI
        var can=this.div.$x;
        var width=can.width();
        var height=can.height();
        can.attr({width:width,height:height});
        var ctx=can[0].getContext("2d");
        ctx.strokeStyle="black";
        ctx.beginPath();
        ctx.moveTo(5,1);
        ctx.lineTo(width-5,1);
        var min=compute.axi.getMin(true);
        var max=compute.axi.getMax(true);
        var posx=control.settings.frameposx.get();
        var diff=max-min;
        max=min+diff*(-posx)+diff/pow;
        min=min+diff*(-posx);
        diff=max-min;
        var limits=this.natureRange(min,max,10,false);
        var range=this.drange(limits);
        var dec=this.getDec(limits[2]);
        for(var i=0;i<range.length;i++){
            var pos=5+(range[i]-min)/diff*(width-10);
            ctx.moveTo(pos,1);
            ctx.lineTo(pos,10);
            ctx.fillText(this.toPrecision(range[i],dec),pos-10,20);
        }
        ctx.stroke();
        var text=compute.axi.getName(true);
        ctx.fillText(text,width/2-10,35);
        
        // Y-AXI
        var can=this.div.$y;
        var width=can.width();
        var height=can.height();
        can.attr({width:width,height:height});
        var ctx=can[0].getContext("2d");
        ctx.strokeStyle="black";
        ctx.beginPath();
        ctx.moveTo(width-1,5);
        ctx.lineTo(width-1,height-5);
        var min=compute.axi.getMin(false);
        var max=compute.axi.getMax(false);
        var diff=max-min;
        var posy=control.settings.frameposy.get();
        max=min+diff*(-posy)+diff/pow;
        min=min+diff*(-posy);
        diff=max-min;
        limits=this.natureRange(min,max,10,false);
        range=this.drange(limits);
        dec=this.getDec(limits[2]);
        for(var i=0;i<range.length;i++){
            var pos=height-5-(range[i]-min)/diff*(height-10);
            //var pos=5+(range[i]-min)/diff*(height-10);
            ctx.moveTo(width-1,pos);
            ctx.lineTo(width-5,pos);
            ctx.fillText(this.toPrecision(range[i],dec),width-30,pos+5);
        }
        ctx.stroke();
        var text=compute.axi.getName(false);
        //ctx.fillText(text,5,height/2-15);
        ctx.save();
        ctx.rotate(3*Math.PI/2);
        ctx.fillText(text,-height/2-15,10);
        ctx.restore();
        
        // Z-AXI
        var margin=7;
        var can=this.div.$z;
        var width=can.width();
        var height=can.height();
        can.attr({width:width,height:height});
        var ctx=can[0].getContext("2d");
        ctx.strokeStyle="black";
        var barwid=15;
        ctx.beginPath();
        ctx.moveTo(1,margin);
        ctx.lineTo(1,height-margin);
        ctx.lineTo(barwid,height-margin);
        ctx.lineTo(barwid,margin);
        ctx.lineTo(1,margin);
        var bar=this.bar.get(height-2*margin);
        ctx.putImageData(bar,1,margin);
        var max=compute.axi.zmax;
        limits=this.natureRange(0,max,10,false);
        range=this.drange(limits);
        dec=this.getDec(limits[2]);
        for(var i=0;i<range.length;i++){
            var pos=margin+(1-range[i]/max)*(height-2*margin);
            ctx.moveTo(barwid,pos);
            ctx.lineTo(barwid+5,pos);
            ctx.fillText(this.toPrecision(range[i],dec),barwid+7,pos+5);
        }
        ctx.stroke();
        ctx.save();
        ctx.rotate(3*Math.PI/2);
        var text="kJ/mol";
        ctx.fillText(text,-height/2-15,width-5);
        ctx.restore();
        
        this.needRedraw=false;
    },
    bind:function (){
        //var thisctrl=this;
        this.div.$main_cont
        .on("click","div.ctrl",$.proxy(function(event){
            var ctrl=event.currentTarget.getAttribute("data-ctrl");
            //alert(ctrl);
            if(ctrl==="auto"){
                var autoset=control.settings.axi_auto.cycle(3);
                this.div.$z_auto.children("img").attr("src","img/new/"+this.autosrc[autoset]+".png");

                /*if(autoset){
                    this.div.$z_auto.addClass("on");
                }else{
                    this.div.$z_auto.removeClass("on");
                }*/
                //this.div.$z_auto.children("img").attr("src","img/new/auto"+(this.autoset?"_on":"")+".png");
            }else{
            }
        },this));
        view.ctrl.bindTips(this.div.$main_cont,this.tips);
    },
    natureRange:function(start,end,nopti,allin){
        if(start>=end){return false;}
        var coefs=[2,2.5,2];
        var i=0;
        var step=1;
        var fstep=1;
        var diff=end-start;
        if(diff>nopti){
            var rising=1;
        }else{
            rising=-1;
        }
        while(rising*diff>nopti*fstep*rising){
            step=fstep;
            fstep*=Math.pow(coefs[i%3],rising);
            i++;
        }
        if(rising*(diff/step-nopti)>rising*(nopti-diff/fstep)){
            step=fstep;
        }
        if(allin){
            start=Math.floor(start/step)*step;
            end=Math.ceil(end/step)*step;
        }else{
            start=Math.ceil(start/step)*step;
            end=Math.floor(end/step)*step;
        }
        return [start,end,step];
    },
    drange:function(start,end,step){
        if($.isArray(start)){
            end=start[1];
            step=start[2];
            start=start[0];
        }
        var r=start;
        var arr=[];
        while(r<=end+step/2){
            arr.push(r);
            r+=step;
        }
        return arr;
    },
    getDec:function(step){
        if(step>=1000||step<0.001){return -1;}
        var dec=0;
        while(step*Math.pow(10,dec)<1){
            dec++;
        }
        return dec;
    },
    toPrecision:function(val,dec){
        if(dec===-1){
            return val.toPrecision(2);
        }
        return val.toFixed(dec);
    }
});
view.axi.bar={
    lastHei:null,
    lastBar:null,
    ctx:null,
    get:function(height){
        if(height===this.lastHei){
            return this.lastBar;
        }
        var wid=15;
        if(this.ctx===null){
            var can=$("<canvas>").attr({width:wid,height:height});
            this.ctx=can[0].getContext("2d");
        }
        var imd=this.ctx.createImageData(wid, height);
        var sigma=1000.0;
        var hei = 380.0;
        for(var i=0;i<height;i++){
            var red=Math.min(Math.max(hei-Math.abs(i/height-0.77)*sigma,0),255);
            var green=Math.min(Math.max(hei-Math.abs(i/height-0.51)*sigma,0),255);
            var blue=Math.min(Math.max(hei-Math.abs(i/height-0.23)*sigma,0),255);
            for(var j=0;j<wid;j++){
                var ind=4*(i*wid+j);
                imd.data[ind]=red;
                imd.data[ind+1]=green;
                imd.data[ind+2]=blue;
                imd.data[ind+3]=255;
            }
        }
        this.lastHei=height;
        this.lastBar=imd;
        return imd;
    }
};
        /*min(max(hei-abs(d-0.23)*sigma,0.0),1.0),
        min(max(hei-abs(d-0.49)*sigma,0.0),1.0),
        min(max(hei-abs(d-0.77)*sigma,0.0),1.0),
        1*/