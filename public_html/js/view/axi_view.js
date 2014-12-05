/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(window.view===undefined){var view={};}
if(view.axi===undefined){view.axi={};}
$.extend(view.axi,{
    tips:{up:"Increase",down:"Decrease",select:"Change axis",auto:"Automatic Z axi",units:"Change energy units"},
    autosrc:["manual","semiauto","auto"],
    unitsrc:["Energy [kJ/mol]","Energy [kcal/mol]"],
    div:{},
    template:"",
    xwidth:40,
    ywidth:50,
    zwidth:55,
    zheight:40,
    letterwidth:4.7,
    needRedraw:true,
    needArrange:true,
    rendered:false,
    listeners:[],
    init:function(){
        var sett=control.settings;
        $.get("templates/axi.html",$.proxy(this.loaded,this),"text");
        control.control.everytick(this,"drawAxes");
        //view.ctrl.subscribe(this,"resize");
        sett.zoom.subscribe(this,"draw");
        sett.frameposx.subscribe(this,"draw");
        sett.frameposy.subscribe(this,"draw");
        sett.ncv.subscribe(this,"arrange");
        sett.enunit.subscribe(this,"labels");
    },
    loaded:function(template){
        if(template){
            this.template=template;
        }
        this.render();
        this.arrange();
        this.bind();
    },
    render:function(){
        var template=this.template,
        autoset,rendered,ldiv;
        ldiv=this.div;
        ldiv.$cancont=$("#canvas_cont");
        ldiv.$main_cont=$("#main_cont");
        autoset=control.settings.axi_auto.get();
        //var rendered=Mustache.render(template,$.extend({},this.tips,{autoset:autoset?"on":""}));
        rendered=Mustache.render(template,$.extend({},this.tips,{autoset:this.autosrc[autoset]}));
        ldiv.$main_cont.html(rendered);
        ldiv.$x_cont=$("#axi_x_cont");
        ldiv.$x=$("#axi_x");
        ldiv.$x_text=$("#axi_x_text");
        ldiv.$y_cont=$("#axi_y_cont");
        ldiv.$y=$("#axi_y");
        ldiv.$y_text=$("#axi_y_text");
        ldiv.$select=$("#axi_select");
        ldiv.$z_auto=$("#axi_z_auto");
        ldiv.$z_cont=$("#axi_z_cont");
        ldiv.$z=$("#axi_z");
        ldiv.$z_up=$("#axi_z_up");
        ldiv.$z_down=$("#axi_z_down");
        ldiv.$z_text=$("#axi_z_text");
        ldiv.$x_cont.before(ldiv.$cancont);
        //if(ldiv.$cancont.children().length <= 0){manage.console.warning("Canvas not appended");}
        //if(ldiv.$cancont.children().length <= 0){draw.drawer.appendCans();}
        this.rendered=true;
    },
    arrange:function(){
        var zwidth,xwidth,zheight,ywidth,ldiv;
        if(!this.rendered){return;}
        zwidth=this.zwidth;
        xwidth=this.xwidth;
        zheight=this.zheight;
        ywidth=this.ywidth;
        ldiv=this.div;
        if(control.settings.ncv.get()===1){
            zwidth=0;
            ywidth=this.zwidth;
            ldiv.$y_cont.hide();
            ldiv.$z_auto.css({top:"100%",width:ywidth+"px",height:zheight+"px",left:"0px"}).css({top:"-="+xwidth+"px"});
            ldiv.$select.hide();
            ldiv.$z_cont.css({top:"0px",left:"0px",height:"100%",width:zwidth+"px"}).css({height:"-="+xwidth});
            ldiv.$z_text.css({left:"2px",width:"12px"});
        }else{
            ldiv.$y_cont.show();
            ldiv.$z_auto.css({top:"100%",width:zwidth+"px",height:zheight+"px",left:"100%"}).css({top:"-="+zheight+"px",left:"-="+zwidth+"px"});
            ldiv.$select.show();
            ldiv.$z_cont.css({top:"0px",left:"100%",height:"100%",width:zwidth+"px"}).css({left:"-="+zwidth+"px",height:"-="+xwidth});
            ldiv.$z_text.css({left:(zwidth-14)+"px",width:"12px"});
        }
        ldiv.$y_cont.css({top:"0px",left:"0px",height:"100%",width:ywidth+"px"}).css({height:"-="+xwidth+"px"});
        ldiv.$y.css({top:"0px",left:"0px",height:"100%",width:"100%"});
        ldiv.$y_text.css({left:"2px",width:"12px"});
        ldiv.$select.css({top:"100%",left:"0px",height:xwidth+"px",width:ywidth+"px"}).css({top:"-="+xwidth+"px"});
        ldiv.$cancont.css({top:"5px",left:(ywidth+5)+"px",height:"100%",width:"100%"}).css({height:"-="+(xwidth+10)+"px",width:"-="+(ywidth+zwidth+10)+"px"});
        ldiv.$x_cont.css({top:"100%",left:ywidth+"px",height:xwidth+"px",width:"100%"}).css({top:"-="+xwidth+"px",width:"-="+(ywidth+zwidth)+"px"});
        ldiv.$x.css({top:"0px",left:"0px",height:"100%",width:"100%"});
        ldiv.$x_text.css({top:(xwidth-14)+"px",height:"12px"});
        //ldiv.$z_cont.css({top:"0px",left:"100%",height:"100%",width:zwidth+"px"}).css({left:"-="+zwidth+"px",height:"-="+this.xwidth});
        ldiv.$z_up.css({top:"0px",width:this.zwidth+"px",height:"50%"});
        ldiv.$z.css({top:"0px",width:this.zwidth+"px",height:"100%"});
        ldiv.$z_down.css({top:"50%",width:this.zwidth+"px",height:"50%"});
        //ldiv.$z_text.css({left:(this.zwidth-14)+"px",width:"12px"});
        this.setTextFrames();
        this.needRedraw=true;
        this.needArrange=false;
        this.call("resize");
        //manage.console.debug("Axis resized");
    },
    setTextFrames:function(){
        var textlen;
        textlen=this.letterwidth*compute.axi.getName(false).length;
        this.div.$y_text.css({top:"50%",height:textlen+"px"}).css({top:"-="+(textlen/2)+"px"});  // Y-axi
        textlen=this.letterwidth*compute.axi.getName(true).length;
        this.div.$x_text.css({left:"50%",width:textlen+"px"}).css({left:"-="+(textlen/2)+"px"});  // X-axi
        textlen=this.letterwidth*this.unitsrc[control.settings.enunit.get()].length;
        this.div.$z_text.css({top:"50%",height:textlen+"px"}).css({top:"-="+(textlen/2)+"px"});  // Z-axi
        this.needRedraw=true;
    },
    drawAxes:function(){
        var ncv;
        /*if(this.needArrange){
            this.arrange();
        }
        if(!this.needRedraw){return;}*/
        if(!compute.sum_hill.haveData()){
            return false;
        }
        ncv=control.settings.ncv.get();
        if(ncv===0){
            manage.console.warning("Axi_view:","ncv not set");
        }else if(ncv===1){
            this.drawAxes1();
        }else{
            this.drawAxes2();
        }
    },
    drawAxes1:function(){
        var can,width,height,ctx,limits,min,max,diff,range,dec,i,pos,text;
        //X-AXI
        can=this.div.$x;
        width=can.width();
        height=can.height();
        can.attr({width:width,height:height});
        ctx=can[0].getContext("2d");
        ctx.strokeStyle="black";
        ctx.beginPath();
        ctx.moveTo(5,1);
        ctx.lineTo(width-5,1);
        limits=compute.axi.getLimits(true,false);
        min=limits[0];max=limits[1];
        diff=max-min;
        limits=this.natureRange(min,max,10,false);
        range=this.drange(limits);
        dec=this.getDec(limits[2]);
        for(i=0;i<range.length;i+=1){
            pos=5+(range[i]-min)/diff*(width-10);
            ctx.moveTo(pos,1);
            ctx.lineTo(pos,10);
            ctx.fillText(this.toPrecision(range[i],dec),pos-10,20);
        }
        ctx.stroke();
        text=compute.axi.getName(true);
        ctx.fillText(text,width/2-10,35);
        
        //Y-AXI
        can=this.div.$z;
        width=can.width();
        height=can.height();
        can.attr({width:width,height:height});
        ctx=can[0].getContext("2d");
        ctx.strokeStyle="black";
        ctx.beginPath();
        ctx.moveTo(width-1,5);
        ctx.lineTo(width-1,height-5);
        min=0;
        max=compute.axi.zmax;
        diff=max-min;
        limits=this.natureRange(min,max,10,false);
        range=this.drange(limits);
        dec=this.getDec(limits[2]);
        for(i=0;i<range.length;i+=1){
            pos=6+(range[i]-min)/diff*(height-10);
            ctx.moveTo(width-1,pos);
            ctx.lineTo(width-5,pos);
            ctx.fillText(this.toPrecision(-range[i],dec),width-30,pos+5);
        }
        ctx.stroke();
        ctx.save();
        ctx.rotate(3*Math.PI/2);
        text=this.unitsrc[control.settings.enunit.get()];
        ctx.fillText(text,-(height+text.length*this.letterwidth)/2,10);
        ctx.restore();
    },
    drawAxes2:function(){
        var can,width,height,ctx,limits,min,max,diff,range,dec,i,pos,text,margin,bar,barwid;
        // X-AXI
        can=this.div.$x;
        width=can.width();
        height=can.height();
        can.attr({width:width,height:height});
        ctx=can[0].getContext("2d");
        ctx.strokeStyle="black";
        ctx.beginPath();
        ctx.moveTo(5,1);
        ctx.lineTo(width-5,1);
        limits=compute.axi.getLimits(true,true);
        min=limits[0];
        max=limits[1];
        diff=max-min;
        limits=this.natureRange(min,max,10,false);
        range=this.drange(limits);
        dec=this.getDec(limits[2]);
        for(i=0;i<range.length;i+=1){
            pos=5+(range[i]-min)/diff*(width-10);
            ctx.moveTo(pos,1);
            ctx.lineTo(pos,10);
            ctx.fillText(this.toPrecision(range[i],dec),pos-10,20);
        }
        ctx.stroke();
        text=compute.axi.getName(true);
        ctx.fillText(text,(width-text.length*this.letterwidth)/2,35);
        
        // Y-AXI
        can=this.div.$y;
        width=can.width();
        height=can.height();
        can.attr({width:width,height:height});
        ctx=can[0].getContext("2d");
        ctx.strokeStyle="black";
        ctx.beginPath();
        ctx.moveTo(width-1,5);
        ctx.lineTo(width-1,height-5);
        limits=compute.axi.getLimits(false,true);
        min=limits[0];
        max=limits[1];
        diff=max-min;
        limits=this.natureRange(min,max,10,false);
        range=this.drange(limits);
        dec=this.getDec(limits[2]);
        for(i=0;i<range.length;i+=1){
            //var pos=height-5-(max-range[i])/diff*(height-10);
            pos=5+(max-range[i])/diff*(height-10);
            //var pos=5+(range[i]-min)/diff*(height-10);
            ctx.moveTo(width-1,pos);
            ctx.lineTo(width-5,pos);
            ctx.fillText(this.toPrecision(range[i],dec),width-30,pos+5);
        }
        ctx.stroke();
        text=compute.axi.getName(false);
        //ctx.fillText(text,5,height/2-15);
        ctx.save();
        ctx.rotate(3*Math.PI/2);
        ctx.fillText(text,-(height+text.length*this.letterwidth)/2,10);
        ctx.restore();
        
        // Z-AXI
        margin=7;
        can=this.div.$z;
        width=can.width();
        height=can.height();
        can.attr({width:width,height:height});
        ctx=can[0].getContext("2d");
        ctx.strokeStyle="black";
        barwid=15;
        ctx.beginPath();
        ctx.moveTo(1,margin);
        ctx.lineTo(1,height-margin);
        ctx.lineTo(barwid,height-margin);
        ctx.lineTo(barwid,margin);
        ctx.lineTo(1,margin);
        bar=this.bar.get(height-2*margin);
        ctx.putImageData(bar,1,margin);
        max=compute.axi.zmax;
        limits=this.natureRange(0,max,10,false);
        range=this.drange(limits);
        dec=this.getDec(limits[2]);
        for(i=0;i<range.length;i+=1){
            pos=margin+(range[i]/max)*(height-2*margin);
            ctx.moveTo(barwid,pos);
            ctx.lineTo(barwid+5,pos);
            ctx.fillText(this.toPrecision(-range[i],dec),barwid+7,pos+5);
        }
        ctx.stroke();
        ctx.save();
        ctx.rotate(3*Math.PI/2);
        text=this.unitsrc[control.settings.enunit.get()];
        ctx.fillText(text,-(height+text.length*this.letterwidth)/2,width-5);
        ctx.restore();
        
        this.needRedraw=false;
    },
    bind:function (){
        //var thisctrl=this;
        this.div.$main_cont
        .on("click","div.ctrl",$.proxy(function(event){
            var ctrl,autoset,pos;
            ctrl=event.currentTarget.getAttribute("data-ctrl");
            //alert(ctrl);
            if(ctrl==="auto"){
                autoset=control.settings.axi_auto.cycle(3);
                this.div.$z_auto.children("img").attr("src","img/new/"+this.autosrc[autoset]+".png");

                /*if(autoset){
                    this.div.$z_auto.addClass("on");
                }else{
                    this.div.$z_auto.removeClass("on");
                }*/
                //this.div.$z_auto.children("img").attr("src","img/new/auto"+(this.autoset?"_on":"")+".png");
            }else if(ctrl==="units"){
                control.settings.enunit.cycle(2);
            }else if(ctrl==="x_text"){
                pos=$(event.currentTarget).offset();
                this.renamer.put(pos.left,pos.top,true);
            }else if(ctrl==="y_text"){
                pos=$(event.currentTarget).offset();
                this.renamer.put(pos.left,pos.top,false);
            }
        },this));
        view.ctrl.bindTips(this.div.$main_cont,this.tips);
    },
    natureRange:function(start,end,nopti,allin){
        var coefs=[2,2.5,2],rising,
        i=0,step=1,fstep=1,diff=end-start;
        if(start>=end){return false;}
        if(diff>nopti){
            rising=1;
        }else{
            rising=-1;
        }
        while(rising*diff>nopti*fstep*rising){
            step=fstep;
            fstep*=Math.pow(coefs[i%3],rising);
            i+=1;
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
        var r,arr=[];
        if($.isArray(start)){
            end=start[1];
            step=start[2];
            start=start[0];
        }
        r=start;
        while(r<=end+step/2){
            arr.push(r);
            r+=step;
        }
        return arr;
    },
    getDec:function(step){
        var dec=0;
        if(step>=1000||step<0.001){return -1;}
        while(step*Math.pow(10,dec)<1){
            dec+=1;
        }
        return dec;
    },
    toPrecision:function(val,dec){
        if(dec===-1){
            return val.toPrecision(2);
        }
        return val.toFixed(dec);
    },
    notify:function(args){
        if(args==="draw"){this.needRedraw=true;return;}
        if(args==="drawAxes"){this.drawAxes();return;}
        if(args==="arrange"){this.needArrange=true;return;}
        if(args==="resize"){this.needArrange=true;return;}
        if(args==="labels"){this.setTextFrames();return;}
    },
    isSquare:function(wid,hei){
        hei-=this.xwidth;
        wid-=this.ywidth+this.zwidth;
        if(Math.abs(wid-hei)<25){return (wid-hei)/2;}
        return 0;
    },
    subscribe:function(ctx,args){
        var list=this.listeners,i;
        for(i=0;i<list.length;i+=1){
            if(list[i]===ctx){return;}
        }
        list.push({ctx:ctx,args:args});
    },
    call:function(args){
        var list=this.listeners,
        i,lis;
        for(i=0;i<list.length;i+=1){
            lis=list[i];
            if(lis.args===args){
                lis.ctx.notify(args);
            }
        }
    }
});
view.axi.renamer={
    xaxi:0,
    div:{},
    inited:false,
    init:function(){
        var template='\n\
<div id="axi_rnm_cont" class="axi_all">\n\
    <input id="axi_rnm_input" />\n\
</div>';
        this.div.$cont=$(template);
        this.div.$input=this.div.$cont.children("#axi_rnm_input");
        this.div.$input.on("focusout",$.proxy(this.close,this)).on("keypress",$.proxy(function(e){
            if(e.which === 13){
                this.close();
                e.preventDefault();
                return false;
            }
        },this));
        this.inited=true;
    },
    put:function(left,top,xaxi){
        var name;
        if(!this.inited){
            this.init();
        }
        if(!compute.sum_hill.haveData()){return;}
        name=compute.axi.getName(xaxi);
        this.div.$input.val(name);
        this.xaxi=xaxi;
        this.name=name;
        this.div.$cont.show().css({top:top-20,left:left});
        $("#all").append(this.div.$cont);
        this.div.$input.focus();
    },
    close:function(){
        var name=this.div.$input.val();
        if(name&&name!==this.name){
            compute.axi.setName(this.xaxi,name);
            view.axi.setTextFrames();
        }
        this.name=null;
        this.div.$cont.hide();
    }
    
};
view.axi.bar={
    lastHei:null,
    lastBar:null,
    ctx:null,
    get:function(height){
        var wid=15,can,imd,sigma,hei,i,rat,red,green,blue,j,ind;
        if(height===this.lastHei){
            return this.lastBar;
        }
        if(this.ctx===null){
            can=$("<canvas>").attr({width:wid,height:height});
            this.ctx=can[0].getContext("2d");
        }
        imd=this.ctx.createImageData(wid, height);
        sigma=1000.0;
        hei = 380.0;
        for(i=0;i<height;i+=1){
            rat=1-i/height;
            red=Math.min(Math.max(hei-Math.abs(rat-0.77)*sigma,0),255);
            green=Math.min(Math.max(hei-Math.abs(rat-0.51)*sigma,0),255);
            blue=Math.min(Math.max(hei-Math.abs(rat-0.23)*sigma,0),255);
            for(j=0;j<wid;j+=1){
                ind=4*(i*wid+j);
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
// @license-end