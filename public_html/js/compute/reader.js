if(typeof compute==="undefined"){compute={};}
compute.reader={
    template:null,
    inited:false,
    read:function(event){
        var $filer=$(event.target);
        var files=$filer[0].files;
        if(!files){
            manage.console.error("Reader: není files property");
            return;
        }else if(!files[0]){
            manage.console.error("Reader: No file");
            return;
        }else{
            manage.manager.purge();
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
        var $file_cont=$("#file_cont");
        $file_cont
        .on("change","input",compute.reader.read)
        .on("click","button",function(event){
            var tar=event.currentTarget;
            var path=tar.getAttribute("data-path");
            $.get(path,function(data){
                manage.manager.purge();
                compute.parser.parse(data);
            },"text");
        });
        
    },
    init:function(){
        this.initEvents();
        $.get("templates/examples.html",$.proxy(function(data){
            this.template=data;
            this.render();
            this.inited=true;
        },this),"text");
    },
    render:function(){
        var obj={examples:[
            {id:"HILLS.amber03",name:"2D HILLS v2.0"},
            {id:"1D_HILLS_1.3",name:"1D HILLS v1.3"},
            //{id:"HILLS_2.0",name:"HILLS_2.0 krátký"},
            {id:"HILLS_1.3",name:"2D HILLS v1.3"}
        ]};
        var rendered=Mustache.render(this.template,obj);
        $("#file_cont").html(rendered);
    }
};


