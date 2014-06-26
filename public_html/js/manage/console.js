if(typeof manage==="undefined"){manage={};}
if(typeof manage.console==="undefined"){manage.console={};}
$.extend(manage.console,{
    $console:null,
    constext:[],
    init:function(){
        this.$console=$("#cons");
    },
    log:function(string){
        if(this.$console===null){this.init();}
        var txt=this.constext;
        var str="";
        for(var i=19;i>0;i--){
            txt[i]=txt[i-1];
            str=txt[i]+"<br>"+str;
        }
        txt[0]=string;
        this.$console.html(txt[0]+"<br>"+str);
    }
});

