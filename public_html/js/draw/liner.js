/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(window.draw===undefined){var draw={};}
if(draw.liner===undefined){draw.liner={};}
$.extend(draw.liner,{
    $can:null,
    engine:"liner",
    init:function(){
        var can=$("<canvas>").attr({id:"main_can_liner"}).addClass("main_can");
        this.$can=can;
        this.ctx=this.$can[0].getContext("2d");
        if(this.ctx){
            this.inited=true;
        }else{
            this.inited=false;
        }
    },
    isInited:function(){
        return this.inited;
    },
    draw:function(drawable,zmax){
        var height,width,ctx,resol,step,i;
        if(!zmax){zmax=1;}
        height=this.$can.height();
        width=this.$can.width();
        ctx=this.ctx;
        ctx.clearRect(0,0,width,height);
        ctx.beginPath();
        ctx.moveTo(0,height);
        ctx.strokeStyle="black";
        ctx.fillStyle="red";
        resol=control.settings.resol.get();
        step=width/(resol-1);
        for(i=0;i<resol;i+=1){
            ctx.lineTo(i*step,1+drawable[i]*(height-5)/zmax);
        }
        ctx.lineTo(width,height);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }
});
// @license-end