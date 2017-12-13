/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(window.compute===undefined){var compute={};}
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
        var text,f,fr,file,onerror;
        if(!files){manage.console.error("Reader: není files property");return;}
        if(!files[0]){manage.console.error("Reader: No file");return;}
        manage.manager.purge();
        if(files.length>1){text=files.length+" files";}
        else{text=files[0].name;}
        compute.reader.setChosed(text);
        onerror=function(){manage.console.error("Reader: Reading failed");};
        for(f=0;f<files.length;f+=1){
            file=files[f];
            fr=new FileReader();
            fr.onload = compute.reader.readed;
            fr.onerror = onerror;
            fr.readAsText(file);
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
            var dt=event.originalEvent.dataTransfer,
            files=dt.files;
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
            var $filer=$(event.target),
            files=$filer[0].files;
            if(!files){manage.console.warning("Reader:","no files to read");return;}
            compute.reader.read(files);
        },this))
        .on("click","#examples_button",$.proxy(function(){
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
            var langs=["eng","cze"],i,
            lang=control.settings.lang.get();
            for(i=0;i<langs.length;i+=1){
                if(lang===langs[i]){break;}
            }
            if(i>=langs.length){i=0;manage.console.warning("Unknown language");}
            i+=1;
            if(i>=langs.length){i=0;}
            control.settings.lang.set(langs[i]);
        })
        .on("click",".example",$.proxy(function(event){
            var path=event.currentTarget.getAttribute("data-path");
            manage.manager.purge();
            $.get(path,function(data){
                compute.parser.parse(data);
            },"text");
            this.exaopen=false;
            this.$exasel.hide();
            this.setChosed(path);
        },this));
        
        
    },
    readFromUrl:function () {
        var url = control.settings.hills.get();
        if(!url) return;
        if ((url.indexOf("http://") > -1 || url.indexOf("https://")>-1)&& url.indexOf("metadyn.vscht.cz")===-1){
            url = "https://cors-anywhere.herokuapp.com/" + url
        }
        $.ajax({
            url: url,
            type: "GET",
            crossDomain: true,
            dataType: "text",
            success: function (data) {
              manage.manager.purge();
              compute.parser.parse(data);
            },
            error: function (xhr, status) {
              alert("Wrong URL "+status);
            }
        });
    },
    init:function(){
        this.template='\
<div class="right file_cont_half">\
    <div id="examples_button" class="ctrl ctrl_link unselect {{exa}}">{{exa_but_text}}</div>\
    <div id="lang_sel" class="ctrl lang_select">\
      <img alt="{{lang}}" width="30px" height="30px" src="img/{{lang}}.png" />\
    </div>\
</div>\
<div class="file_cont_half">\
    <div class="metadyn_name"><span class="metadyn_name_first">Metadyn</span><span class="metadyn_name_second">View</span></div>\
    <input id="file" type="file" multiple style="display:none"/>\
    <div id="file_but" class="ctrl button on">{{chs_but_text}}</div>\
    <div id="file_seld">{{fchosed}}</div>\
</div>\
<div class="lclear">\
';
        this.seltempl='\
<div id="examples" class="examples_select">\
    {{#examples}}\
    <div id="example_{{id}}" class="example ctrl button text" data-path="data/{{id}}">{{name}}</div>\
    {{/examples}}\
</div>\
';
        this.render();
        this.inited=true;
        this.initEvents();
        control.settings.hills.subscribe(this,"hillsUrl");
        control.settings.lang.subscribe(this,"redraw");
        control.control.everysec(this,"render");
    },
    render:function(){
        var obj,rendered;
        if(this.needRender===0){return;}
        if(this.needRender===2){
            obj={examples:[
                //{id:"HILLS.amber03",name:"2D HILLS v2.0"},
                //{id:"1D_HILLS_1.3",name:"1D phantom"},
                {id:"HILLS_AceProProNH2",name:"1D AceProProNH2"},
                {id:"HILLS_helicen.txt",name:"2D helicen"},
                //{id:"HILLS_2.0",name:"HILLS_2.0 krátký"},
                {id:"HILLS_1.3",name:"2D AceAlaNMe"}
            ]};
            rendered=Mustache.render(this.seltempl,obj);
            this.$exasel=$(rendered);
            //$("#file_cont").append(this.$exasel);
        }
        obj={
            lang:control.settings.lang.get(),
            exa:this.exaopen?" on":"",
            fchosed:this.chosed,
            chs_but_text:Lang("CHOOSE FILES"),
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
        if(args==="hillsUrl"){this.readFromUrl();}
    },
    setChosed:function(string){
        this.chosed=string;
        this.redraw();
    }
};
// @license-end

