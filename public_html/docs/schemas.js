function schema(cont_id,data){
    this.step={x:100,y:50};
    this.data=data;
    var elems=[];
    this.elems=elems;
    for(var key in data){
        elems.push(key);
    }
    this.fullData();
    var template='{{#data}}\n\
<div id="{{cont_id}}_{{name}}" class="scitem {{class}}">{{name}}</div>\n\
{{/data}}\n\
<canvas id="{{cont_id}}_can"></canvas>\n\
';
    var obj=this.mustacheObj(cont_id);
    var rendered=Mustache.render(template,obj);
    $("#"+cont_id).html(rendered);
    for(var i=0;i<elems.length;i++){
        var key=elems[i];
        data[key].$div=$("#"+cont_id+"_"+key);
    }
    var $can=$("#"+cont_id+"_can");
    this.setSchemaSize($can);
    var ctx=$can[0].getContext("2d");
    this.setCssPos();
    this.arrows(ctx);
    
}
schema.prototype.mustacheObj=function(cont_id){
    var elems=this.elems;
    var data=this.data;
    var obj=[];
    for(var i=0;i<elems.length;i++){
        obj.push({name:elems[i],class:data[elems[i]].css});
    }
    return {cont_id:cont_id,data:obj};
};
schema.prototype.fullData=function(){
    var elems=this.elems;
    var data=this.data;
    var len=elems.length;
    /*for(var i=0;i<len;i++){
        var key=elems[i];
        data[key].par=[];
    }*/
    /*for(var i=0;i<len;i++){
        var key=elems[i];
        var suc=data[key].suc;
        for(var j=0;j<suc.length;j++){
            if(data[suc[j]]){
                data[suc[j]].par.push(key);
            }
        }
    }*/
    return data;
};
schema.prototype.arrows=function(ctx){
    var data=this.data;
    var elems=this.elems;
    var len=elems.length;
    ctx.beginPath();
    for(var i=0;i<len;i++){
        var key1=elems[i];
        var dato=data[key1];
        if(!dato.suc){continue;}
        for(var j=0;j<dato.suc.length;j++){
            var other=data[dato.suc[j]];
            if(!other){continue;}
            var twoside=other.suc.indexOf(key1);
            this.arrow(dato,other,ctx,twoside>=0);
        }
    }
    ctx.stroke();
    ctx.fill();
};
schema.prototype.arrow=function(dato2,dato1,ctx,twoside){
    var $div1=dato1.$div;
    var pos1=$div1.position();
    var size1x=dato1.size.x/2;
    var size1y=dato1.size.y/2;
    var mid1={x:pos1.left+size1x,y:pos1.top+size1y};
    
    var $div2=dato2.$div;
    var pos2=$div2.position();
    var mid2={x:pos2.left+dato2.size.x/2,y:pos2.top+dato2.size.y/2};
    
    var rotate=function(pos,angle){
        var sin=Math.sin(angle);
        var cos=Math.cos(angle);
        return {x:pos.x*cos-pos.y*sin,y:pos.x*sin+pos.y*cos};
    };
    var diff={x:mid2.x-mid1.x,y:mid2.y-mid1.y};
    var angle=Math.atan2(diff.y,diff.x);
    if(twoside){
        var offset=rotate({x:0,y:-3},angle);
    }else{
        var offset={x:0,y:0};
    }
    var mint=1;
    if(diff.x!==0){
        var t=size1x/Math.abs(diff.x)-offset.x/diff.x;
        if(mint>t){mint=t;}
    }
    if(diff.y!==0){
        var t=size1y/Math.abs(diff.y)-offset.y/diff.y;
        if(mint>t){mint=t;}
    }
    var arrpos={x:mid1.x+diff.x*mint+offset.x,y:mid1.y+diff.y*mint+offset.y};
    
    
    //ctx.moveTo(mid1.x,mid1.y);
    ctx.moveTo(mid2.x+offset.x,mid2.y+offset.y);
    ctx.lineTo(arrpos.x,arrpos.y);
    var head=[{x:10,y:-3},{x:10,y:3}];
    for(var i=0;i<head.length;i++){
        var rotated=rotate(head[i],angle);
        ctx.lineTo(rotated.x+arrpos.x,rotated.y+arrpos.y);
    }
    ctx.lineTo(arrpos.x,arrpos.y);
    
    
};
schema.prototype.setSchemaSize=function(can){
    var elems=this.elems;
    var data=this.data;
    var len=elems.length;
    for(var i=0;i<len;i++){
        var key1=elems[i];
        var dato=data[key1];
        dato.size={x:dato.$div.outerWidth(),y:dato.$div.outerHeight()};
    }
    var width=0,height=0;
    for(var i=0;i<len;i++){
        var key=elems[i];
        var dato=data[key];
        if(dato.pos[0]>width){width=dato.pos[0];}
        if(dato.pos[1]>height){height=dato.pos[1];}
    }
    this.resizeCanvas((width+1)*this.step.x,(height+1)*this.step.y,can);
};
schema.prototype.resizeCanvas=function(width,height,can){
    //var can=this.$can;
    can.width(width).height(height).attr({width:width+"px",height:height+"px"});
};
schema.prototype.setCssPos=function(){
    var data=this.data;
    var elems=this.elems;
    for(var i=0;i<elems.length;i++){
        var key=elems[i];
        var dato=data[key];
        dato.$div.css({left:(dato.pos[0]+0.5)*this.step.x-dato.size.x/2,top:(dato.pos[1]+0.5)*this.step.y-dato.size.y/2});
    }
};
/*schema.prototype.iterate=function(elems,data){
    var len=elems.len;
    var attract=100;
    var repulse=100;
    for(var i=0;i<len;i++){
        var key=elems[i];
        var dato=data[key];
        var oldx=dato.x;
        var oldy=dato.y;
        var newx=dato.x;
        var newy=dato.y;
        for(var j=0;j<len;j++){
            if(j===i){continue;}
            var subkey=elems[i];
            var subdato=data[key];
            
        }
        
    }
};*/