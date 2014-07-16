if(typeof compute==="undefined"){compute={};}
compute.reader={
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
        var $filer=$("#file");
        if(!$filer.ebind){
            $filer.change(this.read);
            $filer.ebind=true;
        }
        
    }
};


