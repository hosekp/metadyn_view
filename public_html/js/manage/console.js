if(typeof manage==="undefined"){manage={};}
if(typeof manage.console==="undefined"){manage.console={};}
$.extend(manage.console,{
    $console:null,
    constext:[],
    //loglevel:2,
    /* 0= nic
     * 1= pouze errory
     * 2= i warningy
     * 3= i logy
     * 4= i debug
     */
    init:function(){
        this.$console=$("#cons").show();
    },
    addText:function(string,loglvl){
        if(control.settings.loglvl.get()<loglvl){return;}
        if(this.$console===null){this.init();}
        var txt=this.constext;
        var colors={1:"red",2:"orange",3:"black",4:"blue"};
        txt.push("<span style='color:"+colors[loglvl]+"'>"+string+"</span>");
        if(txt.length>20){
            txt.shift();
        }
        var str="";
        for(var i=0;i<txt.length;i++){
            str=txt[i]+"<br>"+str;
        }
        this.$console.html(str);
    },
    debug:function(string){this.addText(string,4);},
    log:function(string){this.addText(string,3);},
    warning:function(string){this.addText(string,2);},
    error:function(string){this.addText(string,1);}
});

