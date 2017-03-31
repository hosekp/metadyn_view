/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(window.manage===undefined){var manage={};}
if(manage.console===undefined){manage.console={};}
$.extend(manage.console,{
    $console:null,
    constext:[],
    //loglevel:2,
    /* 0= nic
     * 1= pouze errory
     * 2= i warningy
     * 2.5 = i successy
     * 3= i logy
     * 4= i debug
     */
    init:function(){
        this.$console=$("#cons").show();
    },
    addText:function(string,loglvl){
        var txt;
        if(control.settings.loglvl.get()<loglvl){return;}
        if(this.$console===null){this.init();}
        txt=this.constext;
        txt.push("<div class='cons_text_level_"+loglvl+"'>"+string+"</div>");
        if(txt.length>20){
            txt.shift();
        }
        this.$console.html(txt.join(""));
    },
    debug:function(){this.addText(Lang.apply(null,arguments),4);},
    log:function(){this.addText(Lang.apply(null,arguments),3);},
    warning:function(){this.addText(Lang.apply(null,arguments),2);},
    error:function(){this.addText(Lang.apply(null,arguments),1);},
    success:function(){this.addText(Lang.apply(null,arguments),2.5);}
});
// @license-end

