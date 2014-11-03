if(typeof view==="undefined"){view={};}
if(typeof view.lang==="undefined"){view.lang={};}
$.extend(view.lang,{
    cze:{
        "Nothing to draw":"Nic k vykreslení",
        "opened":"otevřeno",
        "Close":"Zavřít",
        "To get the picture, just press right mouse button over it and select Save image as..":"Klikněte pravým tlačítkem myši na obrázek a dejte Uložit jako ..",
        "Choose files":"Vyber soubory",
        "Examples":"Příklady",
        "Drop yours HILLS files here":"Upusť zde soubory"
    }
});
Lang=function(){
    var lan=control.settings.lang.get();
    if(lan==="eng"){
        //if(!args.pop){
        //}
        var args=Array.prototype.slice.call(arguments);
        return args.join(" ");
    }
    var args=arguments;
    var dict=view.lang[lan];
    var ret=[];var nel;
    for(var i=0;i<args.length;i++){
        nel=dict[args[i]];
        if(typeof nel==="undefined"){
            nel=args[i];
        }
        ret.push(nel);
    }
    return ret.join(" ");
};