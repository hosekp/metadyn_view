if(typeof compute==="undefined"){compute={};}
if(typeof compute.parser==="undefined"){compute.parser={};}
$.extend(compute.parser,{
    parse:function(toparse){
        if (typeof String.prototype.startsWith !== 'function') {
            String.prototype.startsWith = function(str) {
                return this.slice(0, str.length) === str;
            };
        }
        var lines=toparse.split("\n");
        var i=0;
        while(lines[i].startsWith("#!")){
            i++;
        }
        var params={filetype:"HILLS_1"};
        if(i>0){
            params.filetype="HILLS_2";
            var header=lines.slice(0,i);
            params=this.parseHeader(header,params);
        }else{
            params=this.analyzeFirstLine(lines[0],params);
        }
        var body=lines.slice(i+1);
        this.parseBody(body,params);
        manage.console.log("parsovano");
    },
    //parseCOLVAR:function(){},
    parseHeader:function(header,params){
        var line;
        line=header[0].match(/[^ ]+/g);
        params.timepos=0;
        var cvs=[];
        var p=2;
        while(!line[p].contains("sigma")){
            cvs.push($.extend({},compute.parser.tcv,{name:line[p],pos:p-2}));
            p++;
        }
        while(line[p].contains("sigma")){
            var elspl=line[p].split("_");
            var cv=this.getCVByName(cvs,elspl[1]);
            cv.sigmapos=p-2;
            p++;
        }
        params.heipos=p-2;
        for(;p<line.length;p++){
            if(line[p].contains(".bias")||line[p].contains("height")){
                params.heipos=p-2;
            }
        }
        for(var i=1;i<header.length;i++){
            line=header[i].match(/[^ ]+/g);
            if(line[1]==="SET"){
                if(line[2].startsWith("min")){
                    var elspl=line[p].split("_");
                    var cv=this.getCVByName(cvs,elspl[1]);
                    var val=line[3].replace("pi","3.14159");
                    cv.min=parseFloat(val);
                }else if(line[2].startsWith("min")){
                    var elspl=line[p].split("_");
                    var cv=this.getCVByName(cvs,elspl[1]);
                    var val=line[3].replace("pi","3.14159");
                    cv.min=parseFloat(val);
                }else{
                    manage.console.log("Unknown parameter "+line[2]);
                }
            }
        }
        params.cvs=cvs;
    },
    analyzeFirstLine:function(line,params){
        
    },
    parseBody:function(body,params){
        
    },
    ask:function(toparse){},
    getCVByName:function(cvs,name){
        //var cvs=params.cvs;
        for(var i=0;i<cvs.length;i++){
            if(cvs[i].name===name){return cvs[i];}
        }
    }
});
compute.parser.tcv={
    name:null,
    min:null,
    max:null,
    pos:null,
    sigmapos:null,
    periodic:false,
    defsigma:null
};