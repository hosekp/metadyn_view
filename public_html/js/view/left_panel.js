/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(window.view===undefined){var view={};}
if(view.panel===undefined){view.panel={};}
$.extend(view.panel,{
    templates:{
        eng:null,
        cze:null
    },
    $left:null,
    needRender:true,
    init:function(){
        control.control.everysec(this,"render");
        control.settings.lang.subscribe(this,"draw");
        this.$left=$("#leftp").on("click",".button",function(event){
            var href=event.currentTarget.getAttribute("data-href");
            window.open(href,"_blank");
        });
    },
    redraw:function(){
        this.needRender=true;
    },
    render:function(){
        var lang,template,obj,rendered,millis;
        if(!this.needRender){return;}
        lang=control.settings.lang.get();
        template=this.templates[lang];
        if(template===null){
            $.get("templates/panel_"+lang+".html",$.proxy(function(data){
                this.templates[lang]=data;
                this.render();
            },this),"text")
            .fail(function(){
                this.needRender=false;
            });
            this.templates[lang]="";
            return;
        }
        if(template===""){return;}
        //millis=new Date().getTime()-new Date(2014,12-1,11).getTime();
        //obj={count:Math.round(millis/(24*60*60*1000)*12)};
        obj={count:this.count};
        rendered=Mustache.render(template,obj);
        this.$left.html(rendered);
        
        
        
        this.needRender=false;
    },
    notify:function(args){
        if(args==="render"){this.render();}
        if(args==="draw"){this.redraw();}
    }
});