/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(typeof view==="undefined"){view={};}
if(typeof view.panel==="undefined"){view.panel={};}
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
        if(!this.needRender){return;}
        var lang=control.settings.lang.get();
        var template=this.templates[lang];
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
        var obj={count:2561};
        var rendered=Mustache.render(template,obj);
        this.$left.html(rendered);
        
        
        
        this.needRender=false;
    },
    notify:function(args){
        if(args==="render"){this.render();}
        if(args==="draw"){this.redraw();}
    }
});