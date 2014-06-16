Lang={
  lang:"czech",
  czech:{},
  text:function(text){
    if(this.lang!=="english"){
      var ntext=this[this.lang][text];
      if(ntext){
        text=ntext;
      }
    }
    return this.replace(text,arguments);
  },
  replace:function(text,args){
    if(!args||args.length===0){return text;}
    for (var i = 0; i < arguments.length; i++) {
      text.replace("$"+i,arguments[i]);
    }
  }
};
