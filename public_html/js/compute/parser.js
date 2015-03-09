/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(window.compute===undefined){var compute={};}
if(compute.parser===undefined){compute.parser={};}
$.extend(compute.parser,{
    mintime:0,
    parse:function(toparse){
        var lines,i,params,header,body,data;
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
        lines=toparse.split("\n");
        i=0;
        while(lines[i].startsWith("#!")){
            i+=1;
        }
        params={filetype:"HILLS_1"};
        if(i>0){
            params.filetype="HILLS_2";
            header=lines.slice(0,i);
            params=this.parseHeader(header,params);
        }else{
            params=this.implicitHeader(lines[0],params);
        }
        if(params.ncv>2){
            manage.console.error("Parser:","3 and more CVs","not implemented");
        }else{
            body=lines.slice(i);
            if(body[body.length-1].length<3){
                body.pop();
            }
            data=this.parseBody(body,params);
            manage.console.log("Parser:",params.nbody,"lines successfully parsed");
            compute.sum_hill.load(data,params);
        }
    },
    //parseCOLVAR:function(){},
    parseHeader:function(header,params){
        var line,cvs=[],p=3,cv,i,rest,val;
        line=header[0].match(/[^ ]+/g);
        params.timepos=0;
        params.clockpos=0;
        while(!line[p].startsWith("sigma")){
            cv=$.extend({},compute.parser.tcv,{name:line[p],pos:p-2});
            cvs.push(cv);
            p+=1;
        }
        while(line[p].startsWith("sigma")){
            rest=line[p].slice(6);
            cv=this.getCVByName(cvs,rest);
            cv.sigmapos=p-2;
            p+=1;
        }
        params.heipos=p-2;
        while(p<line.length){
            if(line[p].endsWith(".bias")||line[p].startsWith("height")){
                params.heipos=p-2;
            }
            if(line[p].startsWith("clock")){
                params.clockpos=p-2;
            }
            p+=1;
        }
        params.fulllen=line.length-2;
        for(i=1;i<header.length;i+=1){
            line=header[i].match(/[^ ]+/g);
            if(line[1]==="SET"){
                if(line[2].startsWith("min")){
                    rest=line[2].slice(4);
                    cv=this.getCVByName(cvs,rest);
                    val=line[3];
                    if(val.startsWith("-pi")){
                        cv.min=-Math.PI;cv.periodic=true;
                    }else{
                        cv.min=parseFloat(val);
                    }
                }else if(line[2].startsWith("max")){
                    rest=line[2].slice(4);
                    cv=this.getCVByName(cvs,rest);
                    val=line[3];
                    if(val.startsWith("pi")){
                        cv.max=Math.PI;cv.periodic=true;
                    }else{
                        cv.max=parseFloat(val);
                    }
                }else{
                    manage.console.warning("Parser:","Unknown parameter:",line[2]);
                }
            }
        }
        params.cvs=cvs;
        params.ncv=cvs.length;
        return params;
    },
    implicitHeader:function(firstline,params){
        var line,nelem,ncv,cvs,i;
        line=firstline.match(/[^ ]+/g);
        nelem=line.length;
        params.timepos=0;
        params.clockpos=0;
        if(nelem===0){
            manage.console.error("Parser:","Empty file");
            return;
        }
            nelem-=1;
        ncv=Math.floor((nelem-2)/2);
        params.heipos=2*ncv+1;
        cvs=[];
        for(i=1;i<=ncv;i+=1){
            cvs.push($.extend({},compute.parser.tcv,{name:"CV_"+i,pos:i,sigmapos:ncv+i,defsigma:parseFloat(line[ncv+i])}));
        }
        params.cvs=cvs;
        params.ncv=ncv;
        params.fulllen=nelem;
        return params;
    },
    parseBody:function(body,params){
        //var data={time:null,cvs:[],hei:null,sigma:[]};
        var nbody=body.length,
        cvbuffer=new ArrayBuffer(4*nbody*params.ncv),
        sigmabuffer=new ArrayBuffer(4*nbody*params.ncv),
        restbuffer=new ArrayBuffer(4*nbody*3),
        time,hei,i,j,pcv,cvs=[],sigma=[],clock;
        for(i=0;i<params.ncv;i+=1){
            cvs.push(new Float32Array(cvbuffer,4*i*nbody,nbody));
            sigma.push(new Float32Array(sigmabuffer,4*i*nbody,nbody));
        }
        time=new Float32Array(restbuffer,0,nbody);
        hei=new Float32Array(restbuffer,4*nbody,nbody);
        clock=new Float32Array(restbuffer,8*nbody,nbody);
        var line,timepos=params.timepos,heipos=params.heipos,clockpos=params.clockpos,
        pcvs=params.cvs,ncv=params.ncv,fulllen=params.fulllen,len=0;
        //manage.console.debug("length: "+nbody);
        var clockslope=0;
        var deltaclock=0;
        var lastclock=0;
        var nowclock;
        var step;
        var chunklen=0;
        var deltanum=0;
        var ratio;
        var sorting=control.settings.sort.get();
        for(i=0;i<nbody;i+=1){
            if(body[i].startsWith("#!")){continue;}
            line=body[i].match(/[^ ]+/g);
            if(!line||line.length<fulllen){manage.console.debug("Line:",body[i]);continue;}
            time[len]=parseFloat(line[timepos]);
            if(sorting){
                nowclock=parseFloat(line[clockpos]);
                step=nowclock-lastclock;
                chunklen+=1;
                if(chunklen<11){
                    clockslope+=step*0.1;
                    //if(chunklen===10){manage.console.warning("clockslope="+clockslope);}
                }else{
                    ratio=nowclock/(lastclock+clockslope);
                    if(ratio>1.5){
                        deltaclock+=step;
                        //manage.console.debug("Parser:","delta increased by",step,"at i="+i,nowclock+">1.5*"+(lastclock+clockslope));
                        chunklen=0;clockslope=0;
                        deltanum++;
                    }else if(ratio<0.5){
                        deltaclock+=step;
                        //manage.console.debug("Parser:","delta decreased by",-step,"at i="+i,nowclock+"<0.5*"+(lastclock+clockslope));
                        chunklen=0;clockslope=0;
                        deltanum++;
                    }else{
                        clockslope=clockslope*0.9+step*0.1;
                        //manage.console.debug("Parser:","at i="+i,"clockslope=",clockslope);
                    }
                }
                clock[len]=nowclock-deltaclock;
            }else{
                clock[len]=len;
            }
            hei[len]=parseFloat(line[heipos]);
            for(j=0;j<ncv;j+=1){
                pcv=pcvs[j];
                cvs[j][len]=parseFloat(line[pcv.pos]);
                sigma[j][len]=parseFloat(line[pcv.sigmapos]);
            }
            lastclock=nowclock;
            len+=1;
            //manage.console.debug("Line: "+body[i]);
        }
        if(deltanum>0){
            manage.console.debug("Parser:","number of delta jumps =",deltanum);
        }
        params.nbody=len;
        //manage.console.debug("length: "+len);
        if(len!==nbody){
            for(i=0;i<params.ncv;i+=1){
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
        for(i=0;i<cvs.length;i+=1){
            this.findLimits(cvs[i],pcvs[i]);
        }
        if(sorting){
            var sorter=$.extend({},this.TAsorter),
            sorted=sorter.sort(clock);
            for(i=0;i<ncv;i+=1){
                cvs[i]=sorter.rearrange(cvs[i],sorted);
                sigma[i]=sorter.rearrange(sigma[i],sorted);
            }
            time=sorter.rearrange(time,sorted);
            clock=sorter.rearrange(clock,sorted);
            /*var textarea=$("<textarea>");
            var outArr=[];
            for(var i=0;i<len;i++){
                outArr.push(clock[i]+" "+sorted[i]);
            }
            textarea.html(outArr.join("\n"));
            
            $("body").append(textarea);*/
            hei=sorter.rearrange(hei,sorted);
        }
        return {time:time,cvs:cvs,height:hei,sigma:sigma,clock:clock}; // data
    },
    findLimits:function(array,cv){
        var max,min,nbody,i,d;
        if(cv.min>=cv.max){
            max=cv.max;min=cv.min;
            nbody=array.length;
            if(min===100000000&&max===-100000000){
                for(i=0;i<nbody;i+=1){
                    if(array[i]<min){min=array[i];}
                    if(array[i]>max){max=array[i];}
                }
            }else
            if(min===100000000) {
                for(i=0;i<nbody;i+=1){
                    if (array[i] < min) {min = array[i];}
                }
            } else {
                for(i=0;i<nbody;i+=1){
                    if (array[i] > max) {max = array[i];}
                }
            }
            cv.min=min;cv.max=max;
            cv.diff=cv.max-cv.min;
            d=Math.abs(cv.diff-2*Math.PI);
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
        var i;
        for(i=0;i<cvs.length;i+=1){
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
    nsplits:0,
    nshortsplits:0,
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
        var array,span,middle,i,len=end-start;
        if (len>2){
            array=this.array;
            span=Math.floor((len-2)/2);
            middle=start+span;
            //manage.console.log("SplitPoint at "+middle);
            if(!this.compare(array[middle],array[middle+1])){
                return middle+1;
            }
            for(i=0;i<span;i+=1){
                if(!this.compare(array[middle+i+1],array[middle+i+2])){
                    return middle+i+2;
                }
                if(!this.compare(array[middle-i-1],array[middle-i])){
                    return middle-i;
                }
            }
            if(span*2!==len-2){
                if(!this.compare(array[end-2],array[end-1])){
                    return end-1;
                }
            }
            //manage.console.error("Error: no SplitPoint");
        }else if(len===2){
            if(!this.compare(this.array[start],this.array[start+1])){
                return start+1;
            }
        }
        //manage.console.debug("Sorter:","Array["+start+":"+end+"] is sorted");
        return -1;
    },
    split:function(start,end){
        var middle=this.findSplitPoint(start,end);
        //if(middle===-1&&!this.issorted(start,end)){manage.console.error("Pole","["+start+":"+end+"]","neuspořádáno");}
        if(middle===-1){return [start,end];}
        if(end-start===2){
            var temp=this.array[start];
            this.array[start]=this.array[start+1];
            this.array[start+1]=temp;
            this.nshortsplits+=1;
            return [start,end];
        }
        this.nsplits+=1;
        //manage.console.debug("Split: ["+start+":"+middle+":"+end+"]");
        //console.log("Split: ["+start+":"+middle+":"+end+"]");
        //manage.console.log("Split on "+splpoint);
        return this.merge(this.split(start,middle),this.split(middle,end));
    },
    merge:function(larray1,larray2){
        var narray=this.workarray,array=this.array,
        start=larray1[0],end=larray2[1],middle=larray1[1],
        i1,i2,nsum,i;
        //manage.console.debug("Merge: ["+start+":"+middle+":"+end+"]");
        if(middle!==larray2[0]){
            manage.console.error("Sorter:","Wrong middle point");
        }
        //manage.console.log("array1="+array1);
        //manage.console.log("array2="+array2);
        i1=start;i2=middle;nsum=end-start;
        for(i=0;i<nsum;i+=1){
            if( i2 === end || ( i1 !== middle && this.compare(array[i1],array[i2])) ){
                narray[i]=(array[i1]);i1+=1;
            }else{
                narray[i]=(array[i2]);i2+=1;
            }
        }
        for(i=0;i<nsum;i+=1){
            array[start+i]=narray[i];
        }
        //manage.console.debug("Merge: ["+start+":"+middle+":"+end+"]");
        //console.log("Merge: ["+start+":"+middle+":"+end+"]");
        return [start,end];
    },
    sort:function(array){
        var arlen,indices,i;
        this.arraytosort=array;
        arlen=array.length;
        indices=new Float32Array(arlen);
        for(i=0;i<arlen;i+=1){
            indices[i]=i;
        }
        this.array=indices;
        this.nsplits=0;
        //this.array=array;
        this.workarray=new Float32Array(arlen);
        this.split(0,arlen);
        manage.console.log("Sorter:","Data sorted,",this.nsplits+"+"+this.nshortsplits,"reorderings");
        return this.array;
    },
    rearrange:function(array,mustr){
        var arlen=array.length,narr,i;
        if(arlen!==mustr.length){
            manage.console.error("Sorter:","Cannot rearrange array, wrong length");
        }
        narr=new Float32Array(arlen);
        for(i=0;i<arlen;i+=1){
            narr[i]=array[mustr[i]];
        }
        return narr;
    }
};
// @license-end