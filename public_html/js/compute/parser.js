if(typeof compute==="undefined"){compute={};}
if(typeof compute.parser==="undefined"){compute.parser={};}
$.extend(compute.parser,{
    mintime:null,
    parse:function(toparse){
        if (typeof String.prototype.startsWith !== 'function') {
            String.prototype.startsWith = function(str) {
                return this.slice(0, str.length) === str;
            };
        }
        if (typeof String.prototype.endsWith !== 'function') {
            String.prototype.endsWith = function(str) {
                return this.slice(-str.length) === str;
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
            params=this.implicitHeader(lines[0],params);
        }
        var body=lines.slice(i);
        var data=this.parseBody(body,params);
        manage.console.log("parsovano");
        compute.sum_hill.load(data,params);
        //runit();
    },
    //parseCOLVAR:function(){},
    parseHeader:function(header,params){
        var line;
        line=header[0].match(/[^ ]+/g);
        params.timepos=0;
        params.clockpos=0;
        var cvs=[];
        var p=3;
        while(!line[p].startsWith("sigma")){
            var cv=$.extend({},compute.parser.tcv,{name:line[p],pos:p-2});
            cvs.push(cv);
            p++;
        }
        while(line[p].startsWith("sigma")){
            var elspl=line[p].split("_");
            var cv=this.getCVByName(cvs,elspl[1]);
            cv.sigmapos=p-2;
            p++;
        }
        params.heipos=p-2;
        for(;p<line.length;p++){
            if(line[p].endsWith(".bias")||line[p].startsWith("height")){
                params.heipos=p-2;
            }
            if(line[p].startsWith("clock")){
                params.clockpos=p-2;
            }
        }
        params.fulllen=line.length-2;
        for(var i=1;i<header.length;i++){
            line=header[i].match(/[^ ]+/g);
            if(line[1]==="SET"){
                if(line[2].startsWith("min")){
                    var elspl=line[2].split("_");
                    var cv=this.getCVByName(cvs,elspl[1]);
                    var val=line[3];
                    if(val.startsWith("-pi")){
                        cv.min=-Math.PI;cv.periodic=true;
                    }else{
                        cv.min=parseFloat(val);
                    }
                }else if(line[2].startsWith("max")){
                    var elspl=line[2].split("_");
                    var cv=this.getCVByName(cvs,elspl[1]);
                    var val=line[3];
                    if(val.startsWith("pi")){
                        cv.max=Math.PI;cv.periodic=true;
                    }else{
                        cv.max=parseFloat(val);
                    }
                }else{
                    manage.console.warning("Unknown parameter "+line[2]);
                }
            }
        }
        params.cvs=cvs;
        params.ncv=cvs.length;
        return params;
    },
    implicitHeader:function(firstline,params){
        var line=firstline.match(/[^ ]+/g);
        params.timepos=0;
        params.clockpos=0;
        var nelem=line.length;
        if(nelem===0){
            manage.console.error("Error: Parser: Empty file");
            return;
        }
            nelem--;
        var ncv=Math.floor((nelem-2)/2);
        params.heipos=2*ncv+1;
        var cvs=[];
        for(var i=1;i<=ncv;i++){
            cvs.push($.extend({},compute.parser.tcv,{name:"CV_"+i,pos:i,sigmapos:ncv+i,defsigma:parseFloat(line[ncv+i])}));
        }
        params.cvs=cvs;
        params.ncv=ncv;
        params.fulllen=nelem;
        return params;
    },
    parseBody:function(body,params){
        //var data={time:null,cvs:[],hei:null,sigma:[]};
        var nbody=body.length;
        if(body[nbody-1].length<3){
            body.pop();nbody-=1;
        }
        var cvbuffer=new ArrayBuffer(4*nbody*params.ncv);
        var sigmabuffer=new ArrayBuffer(4*nbody*params.ncv);
        var restbuffer=new ArrayBuffer(4*nbody*3);
        var time,hei,cvs=[],sigma=[],clock;
        for(var i=0;i<params.ncv;i++){
            cvs.push(new Float32Array(cvbuffer,4*i*nbody,nbody));
            sigma.push(new Float32Array(sigmabuffer,4*i*nbody,nbody));
        }
        time=new Float32Array(restbuffer,0,nbody);
        hei=new Float32Array(restbuffer,4*nbody,nbody);
        clock=new Float32Array(restbuffer,8*nbody,nbody);
        var line,timepos=params.timepos,heipos=params.heipos,clockpos=params.clockpos;
        var pcvs=params.cvs;
        var ncv=params.ncv;
        var fulllen=params.fulllen;
        var len=0;
        manage.console.debug("length: "+nbody);
        for(var i=0;i<nbody;i++){
            line=body[i].match(/[^ ]+/g);
            if(!line||line.length<fulllen){manage.console.debug("Line: "+body[i]);continue;}
            time[len]=parseFloat(line[timepos]);
            if(this.mintime===null){
                this.mintime=line[clockpos];
            }
            clock[len]=parseFloat(line[clockpos]-this.mintime);
            hei[len]=parseFloat(line[heipos]);
            for(var j=0;j<ncv;j++){
                var pcv=pcvs[j];
                cvs[j][len]=parseFloat(line[pcv.pos]);
                sigma[j][len]=parseFloat(line[pcv.sigmapos]);
            }
            len++;
            //manage.console.debug("Line: "+body[i]);
        }
        params.nbody=len;
        //manage.console.debug("length: "+len);
        if(len!==nbody){
            for(var i=0;i<params.ncv;i++){
                cvs[i]=new Float32Array(cvbuffer,4*i*nbody,len);
                sigma[i]=new Float32Array(sigmabuffer,4*i*nbody,len);
            }
            time=new Float32Array(restbuffer,0,len);
            hei=new Float32Array(restbuffer,4*nbody,len);
            clock=new Float32Array(restbuffer,8*nbody,len);
        }
        /*for(var i=4;i>=1;i--){
            manage.console.debug("last: "+body[params.nbody-i]+""+cvs[0][params.nbody-i]+" "+hei[params.nbody-i]);
        }*/
        for(var c=0;c<cvs.length;c++){
            this.findLimits(cvs[c],pcvs[c]);
        }
        var sorting=true;
        if(sorting){
            var sorter=$.extend({},this.TAsorter);
            //var sorted=sorter.sort(time);
            if(isNaN(clock[0])){
                var sorted=sorter.sort(time);
            }else{
                var sorted=sorter.sort(clock);
            }
            for(var i=0;i<ncv;i++){
                cvs[i]=sorter.rearrange(cvs[i],sorted);
                sigma[i]=sorter.rearrange(sigma[i],sorted);
            }
            time=sorter.rearrange(time,sorted);
            clock=sorter.rearrange(clock,sorted);
            hei=sorter.rearrange(hei,sorted);
        }
        var data={time:time,cvs:cvs,height:hei,sigma:sigma,clock:clock};
        return data;
    },
    findLimits:function(array,cv){
        if(cv.min>=cv.max){
            var max=cv.max,min=cv.min;
            var nbody=array.length;
            if(min===100000000&&max===-100000000){
                for(var i=0;i<nbody;i++){
                    if(array[i]<min){min=array[i];}
                    if(array[i]>max){max=array[i];}
                }
            }else
            if(min===100000000) {
                for(var i=0;i<nbody;i++){
                    if (array[i] < min) {min = array[i];}
                }
            } else {
                for(var i=0;i<nbody;i++){
                    if (array[i] > max) {max = array[i];}
                }
            }
            cv.min=min;cv.max=max;
            cv.diff=cv.max-cv.min;
            var d=Math.abs(cv.diff-2*Math.PI);
            if(d<0.3){
                cv.periodic=true;
                cv.max=Math.PI;
                cv.min=-Math.PI;
            }else{
                cv.min-=3*cv.defsigma;
                cv.max+=3*cv.defsigma;
                cv.diff=cv.max-cv.min;
            }
        }
        
    },
    getCVByName:function(cvs,name){
        //var cvs=params.cvs;
        for(var i=0;i<cvs.length;i++){
            if(cvs[i].name===name){return cvs[i];}
        }
    }
});
compute.parser.tcv={
    name:null,
    min:100000000,
    max:-100000000,
    pos:null,
    sigmapos:null,
    periodic:false,
    defsigma:null
};
compute.parser.TAsorter={
    arraytosort:null,
    array:null,
    workarray:null,
//    issorted:function(start,end){
//        var array=this.array;
//        if(end-start<=1){manage.console.log("Array["+start+":"+end+"] is sorted");return true;}
//        for(var i=start+1;i<end;i++){
//            if(!this.compare(array[i-1],array[i])){return false;}
//        }
//        manage.console.debug("Array["+start+":"+end+"] is sorted");
//        return true;
//    },
    compare:function(a,b){
        //return a<=b;
        return this.arraytosort[a]<=this.arraytosort[b];
    },
    findSplitPoint:function(start,end){
        var len=end-start;
        if (len>2){
            var array=this.array;
            var span=Math.floor((len-1)/2);
            var middle=start+span;
            //manage.console.log("SplitPoint at "+middle);
            for(var i=0;i<span;i++){
                if(!this.compare(array[middle+i],array[middle+i+1])){
                    return middle+i+1;
                }
                if(!this.compare(array[middle-i-1],array[middle-i])){
                    return middle-i+1;
                }
            }
            if(span*2===len-1){
                if(!this.compare(array[end-2],array[end-1])){return end-1;}
            }
            //manage.console.error("Error: no SplitPoint");
        }
        manage.console.debug("Array["+start+":"+end+"] is sorted");
        return -1;
    },
    split:function(start,end){
        var middle=this.findSplitPoint(start,end);
        if(middle===-1){return [start,end];}
        manage.console.debug("Split: ["+start+":"+middle+":"+end+"]");
        //manage.console.log("Split on "+splpoint);
        return this.merge(this.split(start,middle),this.split(middle,end));
    },
    merge:function(larray1,larray2){
        var narray=this.workarray;
        var array=this.array;
        var start=larray1[0];
        var end=larray2[1];
        var middle=larray1[1];
        manage.console.debug("Merge: ["+start+":"+middle+":"+end+"]");
        if(middle!==larray2[0]){
            manage.console.error("Sort: Wrong middle point");
        }
        //manage.console.log("array1="+array1);
        //manage.console.log("array2="+array2);
        var i1=start,i2=middle,nsum=end-start;
        for(var i=0;i<nsum;i++){
            if( i2 === end || i1 !== middle && this.compare(array[i1],array[i2]) ){
                narray[i]=(array[i1]);i1++;
            }else{
                narray[i]=(array[i2]);i2++;
            }
        }
        for(var i=0;i<nsum;i++){
            array[start+i]=narray[i];
        }
        return [start,end];
    },
    sort:function(array){
        this.arraytosort=array;
        var arlen=array.length;
        var indices=new Float32Array(arlen);
        for(var i=0;i<arlen;i++){
            indices[i]=i;
        }
        this.array=indices;
        //this.array=array;
        this.workarray=new Float32Array(arlen);
        this.split(0,arlen);
        //manage.console.log("Sorted");
        return this.array;
    },
    rearrange:function(array,mustr){
        var arlen=array.length;
        if(arlen!==mustr.length){
            manage.console.error("Sort: Cannot rearrange array, wrong length");
        }
        var narr=new Float32Array(arlen);
        for(var i=0;i<arlen;i++){
            narr[i]=array[mustr[i]];
        }
        return narr;
    }
};
/*compute.parser.sorter={
    issorted:function(array){
        var len=array.length;
        if(len===1){return true;}
        for(var i=1;i<len;i++){
            if(!this.compare(array[i-1],array[i])){return false;}
        }
        return true;
    },
    compare:function(a,b){
        return a<=b;
    },
    findSplitPoint:function(array){
        var len=array.length;
        var middle=Math.floor(len/2);
        manage.console.debug("SplitPoint from "+middle+" in <"+array+">");
        for(var i=0;i<middle;i++){
            if(!this.compare(array[middle+i],array[middle+i+1])){return middle+i+1;}
            if(!this.compare(array[middle-i-1],array[middle-i])){return middle-i+1;}
        }
        if(middle*2===len){
            if(!this.compare(array[len-2],array[len-1])){return len-1;}
        }
        manage.console.error("Error: no SplitPoint");
        return -1;
    },
    split:function(array){
        if(this.issorted(array)){
            return array;
        }else{
            var splpoint=this.findSplitPoint(array);
            if(splpoint===-1){return array;}
            //manage.console.log("Split on "+splpoint);
            var array1=array.slice(0,splpoint);
            var array2=array.slice(splpoint,array.length);
            return this.merge(this.split(array1),this.split(array2));
        }
    },
    merge:function(array1,array2){
        var narray=[];
        //manage.console.log("array1="+array1);
        //manage.console.log("array2="+array2);
        var i1=0,i2=0,nsum=array1.length+array2.length;
        for(var i=0;i<nsum;i++){
            if(this.compare(array1[i1],array2[i2])){
                narray.push(array1[i1]);i1++;
            }else{
                narray.push(array2[i2]);i2++;
            }
            if(i1===array1.length){
                for(var i=i2;i<array2.length;i++){
                    narray.push(array2[i]);
                }
                break;
            }
            if(i2===array2.length){
                for(var i=i1;i<array1.length;i++){
                    narray.push(array1[i]);
                }
                break;
            }
        }
        return narray;
    },
    sort:function(array){
        return this.split(array);
    }
};*/