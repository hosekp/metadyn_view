/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(typeof compute==="undefined"){compute={};}
compute.reader={
    template:null,
    seltempl:null,
    $exasel:null,
    inited:false,
    exaopen:false,
    chosed:null,
    needRender:2,
    $filecont:null,
    read:function(files){
        if(!files){
            manage.console.error("Reader: není files property");
            return;
        }else if(!files[0]){
            manage.console.error("Reader: No file");
            return;
        }else{
            manage.manager.purge();var text;
            if(files.length>1){text=files.length+" files";}
            else{text=files[0].name;}
            compute.reader.setChosed(text);
            for(var f=0;f<files.length;f++){
                var file=files[f];
                var fr=new FileReader();
                //fr.onload = compute.reader.readed;
                fr.onload = compute.reader.readed;
                fr.onerror = function(){manage.console.error("Reader: Reading failed");};
                fr.readAsText(file);
            }
        }
    },
    readed:function(event){
        if(event.target&&event.target.result){
            //alert(event.target.result);
            compute.parser.parse(event.target.result);
        }
    },
    initEvents:function(){
        $("#main_cont")
        .on("drop",function(event){
            var dt    = event.originalEvent.dataTransfer;
            var files = dt.files;
            compute.reader.read(files);
            event.preventDefault();
            event.stopPropagation();
            return false;
        })
        .on("dragover",function(e){e.preventDefault();e.stopPropagation();return false;})
        .on("dragenter",function(e){e.preventDefault();e.stopPropagation();return false;});

        this.$filecont
        .on("click","#file_but",function(){$("#file").click();})
        .on("change","#file",$.proxy(function(event){
            var $filer=$(event.target);
            var files=$filer[0].files;
            compute.reader.read(files);
        },this))
        .on("click","#examples_button",$.proxy(function(event){
            this.exaopen=!this.exaopen;
            if(!this.exaopen){
                this.$exasel.hide();
                this.redraw(false);
            }else{
                this.$exasel.show();
                //this.$filecont.append(exasel);
                $("#examples_button").addClass("on");
            }
        },this))
        .on("click","#lang_sel",function(){
            var langs=["eng","cze"];
            var lang=control.settings.lang.get();
            for(var i=0;i<langs.length;i++){
                if(lang===langs[i]){break;}
            }
            if(i>=langs.length){i=0;manage.console.warning("Unknown language");}
            i++;
            if(i>=langs.length){i=0;}
            control.settings.lang.set(langs[i]);
        })
        .on("click",".example",$.proxy(function(event){
            var tar=event.currentTarget;
            var path=tar.getAttribute("data-path");
            manage.manager.purge();
            $.get(path,function(data){
                compute.parser.parse(data);
            },"text");
            this.exaopen=false;
            this.$exasel.hide();
            this.setChosed(path);
        },this));
        
        
    },
    init:function(){
        this.template='\
<input id="file" type="file" multiple style="display:none"/>\
<div id="file_but" class="ctrl button left text">{{chs_but_text}}</div>\
<div id="file_seld" class="left">{{fchosed}}</div>\
<div id="lang_sel" class="ctrl button right">\
    <img alt="{{lang}}" src="img/{{lang}}.png" />\
</div>\
<div id="examples_button" class="ctrl text unselect button right {{exa}}">{{exa_but_text}}</div>\
<div class="lclear">\
';
        this.seltempl='\
<div id="examples" class="red" style="display:none;position:absolute;">\
    {{#examples}}\
    <div id="example_{{id}}" class="example ctrl button text" style="example" data-path="data/{{id}}">{{name}}</div>\
    {{/examples}}\
</div>\
';
        this.render();
        this.inited=true;
        this.initEvents();
        control.settings.lang.subscribe(this,"redraw");
        control.control.everysec(this,"render");
    },
    render:function(){
        if(this.needRender===0){return;};
        var obj;
        if(this.needRender===2){
            obj={examples:[
                {id:"HILLS.amber03",name:"2D HILLS v2.0"},
                {id:"1D_HILLS_1.3",name:"1D HILLS v1.3"},
                //{id:"HILLS_2.0",name:"HILLS_2.0 krátký"},
                {id:"HILLS_1.3",name:"2D HILLS v1.3"}
            ]};
            var rendered=Mustache.render(this.seltempl,obj);
            this.$exasel=$(rendered);
            //$("#file_cont").append(this.$exasel);
        }
        obj={
            lang:control.settings.lang.get(),
            exa:this.exaopen?" on":"",
            fchosed:this.chosed,
            chs_but_text:Lang("Choose files"),
            exa_but_text:Lang("Examples")
        };
        rendered=Mustache.render(this.template,obj);
        if(!this.$filecont){
            this.$filecont=$("#file_cont");
        }
        $("#middle_can_text").html(Lang("Drop your HILLS files here"));
        this.$filecont.children(":not(#examples)").remove();
        this.$filecont.append($(rendered));
        this.$filecont.append(this.$exasel);
        this.needRender=0;
    },
    redraw:function(both){
        if(this.needRender===2){return;}
        this.needRender=both?2:1;
    },
    notify:function(args){
        if(args==="redraw"){this.needRender=1;}
        if(args==="render"){this.render();}
    },
    setChosed:function(string){
        this.chosed=string;
        this.redraw();
    }
};
// @license-end

