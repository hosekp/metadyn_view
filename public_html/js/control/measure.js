/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(window.control===undefined){var control={};}
control.measure={
    inited:false,
    needRedraw:true,
    visible:false,
    chillsOn:true,
    diffOn:false,
    data:{
        chills:[],
        xaxi:0,
        yaxi:0,
        ene:0,
        src:0
    },
    onload:function(){
        control.settings.measure.subscribe(this,"on");
    },
    init:function(){
        var cont=$('<div id="measure_cont"></div>'),
        sett=control.settings;
        this.div.$cont=cont;
        $("#side").append(cont);
        /*cont.on("click",".button",$.proxy(function(e){
            this.chillsOn=!this.chillsOn;
            this.needRedraw=true;
        },this));*/
        this.template='\
    <div id=measure_NW" class="measure_NESW" style="float:left">\n\
        <div id="measure_ene_title">{{eneTitle}}: </div>\n\
        <div id="measure_xaxi_title">{{CV1}}: </div>\n\
        {{#yaxi}}<div id="measure_yaxi_title">{{CV2}}: </div>{{/yaxi}}\n\
    </div>\n\
    <div id="measure_NE" class="measure_NESW" style="float:left">\n\
        <div id="measure_ene"><span id=measure_ene_value">{{data.ene}}</span><span id="measure_ene_units"> {{units}}</span></div>\n\
        <div id="measure_xaxi">{{data.xaxi}}</div>\n\
        {{#yaxi}}<div id="measure_yaxi">{{data.yaxi}}</div>{{/yaxi}}\n\
    </div>\n\
    <div id="measure_chills_button" class="ctrl button lclear{{chillsOn}}" data-ctrl="closest_hills">{{chil_title}}</div>\n\
    {{#chillsOn}}\n\
    <div id="measure_chills"><ol class="nomargin">\n\
    {{#data.chills}}\
    <li>{{.}} ps</li>\n\
    {{/data.chills}}\
    </ol></div>\n\
    {{^data.chills}}\n\
    {{chil_help}}\n\
    {{/data.chills}}\n\
    {{/chillsOn}}\
';
        control.control.everysec(this,"render");
        sett.ncv.subscribe(this,"draw");
        sett.enunit.subscribe(this,"draw");
        sett.lang.subscribe(this,"draw");
        draw.path.init();
        this.inited=true;
    },
    div:{},
    render:function(){
        var rendered;
        if(!this.visible){return;}
        if(!this.needRedraw){return;}
        
        rendered=Mustache.render(this.template,{
            units:control.settings.enunit.get()===0?"kJ/mol":"kcal/mol",
            yaxi:control.settings.ncv.get()>1,
            CV1:compute.axi.getName(true),
            CV2:compute.axi.getName(false),
            chillsOn:this.chillsOn?" on":"",
            eneTitle:!this.diffOn?Lang("Bias"):Lang("Difference"),
            chil_title:Lang("Closest hills"),
            chil_help:Lang("Click at point you want to find closest hills to"),
            data:this.data
        });
        this.div.$cont.html(rendered);
        /*this.div.$energy=cont.children("#measure_energy");
        this.div.$xaxi=cont.children("#measure_xaxi");
        this.div.$yaxi=cont.children("#measure_yaxi");
        this.div.$chbutton=cont.children("#measure_chills_button");
        this.div.$chills=cont.children("#measure_chills");*/
        this.needRedraw=false;
    },
    show:function(){
        this.visible=true;
        if(!this.inited){this.init();}
        this.div.$cont.show();
    },
    hide:function(){
        if(!this.inited){return;}
        this.visible=false;
        this.div.$cont.hide();
    },
    toggle:function(){
        if(control.settings.measure.get()){
            this.show();
        }else{
            this.hide();
        }
    },
    click:function(pos){
        if(!control.settings.measure.get()){return;}
        if(!this.chillsOn){return;}
        pos.y=1-pos.y;
        this.data.chills=this.findChills([pos.x,pos.y]);
        this.needRedraw=true;
    },
    measure:function(pos){
        var val,data,override,ncv,x;
        if(!control.settings.measure.get()){return false;}
        val=this.getValueAt(pos);
        if(val===null){return false;}
        ncv=control.settings.ncv.get();
        data=this.data;
        override=false;
        if(this.diffOn){
            val-=data.src;override=true;
            if(ncv===1){
                x=data.start[0];
                draw.path.setPath([[x,0],[x,1],[pos.x,1],[pos.x,0],[x,0]]);
            }else{
                draw.path.setPath([data.start,[pos.x,pos.y]]);
            }
        }else{
            if(ncv===1){
                draw.path.setPath([[pos.x,-val/compute.axi.zmax]]);
            }else{
                draw.path.setPath([[pos.x,pos.y]]);
            }
        }
        data.xaxi=compute.axi.getCVval(true,pos.x).toPrecision(3);
        if(ncv>1){
            data.yaxi=compute.axi.getCVval(false,1-pos.y).toPrecision(3);
        }
        data.ene=val.toFixed(2);
        this.needRedraw=true;
        //$("#measure_ctrl_value").html(val.toFixed(1)+" kJ/mol");
        return override;
    },
    setDiff:function(pos){
        var val;
        if(!control.settings.measure.get()){return;}
        val=this.getValueAt(pos);
        draw.path.setPath([[pos.x,pos.y]]);
        if(val===null){return false;}
        this.data.src=val;
        this.data.ene=0;
        this.data.start=[pos.x,pos.y];
        this.diffOn=true;
        this.needRedraw=true;
        //manage.console.debug("diff","on");
    },
    unsetDiff:function(){
        if(!control.settings.measure.get()){return;}
        this.diffOn=false;
        this.needRedraw=true;
        draw.path.setPath([]);
        //manage.console.debug("diff","off");
    },
    getValueAt:function(pos){
        var trans,resol,ncv,x,y=0,val;
        trans=manage.manager.getTransformed();
        if(trans===null){return null;}
        resol=control.settings.resol.get();
        ncv=control.settings.ncv.get();
        if(ncv===2){
            x=Math.floor(pos.x*resol);
            y=Math.floor((1-pos.y)*resol);
        }else if(ncv===1){
            x=Math.floor(pos.x*resol);
        }
        val=trans[x+y*resol];
        if(!val){return 0;}
        return -val;
    },
    findChills:function(cvs){
        var ihills,ret,i;
        if(!compute.sum_hill.haveData()){return [];}
        ihills=compute.sum_hill.findClosestHills(cvs,3);
        ret=[];
        for(i=0;i<ihills.length;i+=1){
            ret.push((compute.sum_hill.artime[ihills[i]]).toFixed(2));
        }
        return ret;
    },
    notify:function(args){
        if(args==="on"){this.toggle();}
        if(args==="draw"){this.needRedraw=true;}
        if(args==="render"){this.render();}
    }
};
// @license-end