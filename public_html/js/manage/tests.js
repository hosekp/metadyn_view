/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(window.manage===undefined){var manage={};}
if(manage.tests===undefined){manage.tests={};}
$.extend(manage.tests,{
    active:0,
    tests:[],
    inited:false,
    onload:function(){
      control.settings.tests.subscribe(this,"run");
    },
    run:function(){
        if(!this.inited){
            this.createTests();this.inited=true;
        }
        if(this.active>=this.tests.length){return;}
        if(!this.tests[this.active].inited){return;}
        this.tests[this.active].start();
    },
    nextTest:function(){
        this.active+=1;
        this.run();
    },
    createTests:function(){
        var testnames=[],i,testname;
        testnames=["langReader","loopHash","raster_ala_exp","1d_hills","webgl_amber_exp"];
        if(control.settings.tests.get()>1){
            testnames=["webgl_bench","raster_bench","bugus"];
            //testnames=["sum_bench","gl_sum_bench","raster_bench","webgl_bench"];
        }
        //testnames=["raster_ala_exp"];
        //testnames=["bugus"];
        if(testnames.length===0){return;}
        control.settings.loglvl.set(2.5);
        for(i=0;i<testnames.length;i+=1){
            testname=testnames[i];
            this.tests.push($.extend({name:testname},manage.tests.prototest));
            this.getTest(testname,i);
        }
    },
    getTest:function(testname,index){
        $.get("tests/"+testname+".tst",$.proxy(function(data){
            this.tests[index].compileTest(data);
        },this),"text");
    },
    notify:function(args){
        var istest;
        if(args==="run"){
            istest=control.settings.tests.get();
            if(istest>0){
                this.run();
            }
        }
    }
});
manage.tests.perf={
        ncyc:0,
        suma:0,
        last:null,
        start:function(){
            this.last=window.performance.now();
        },
        end:function(){
            this.ncyc+=1;
            this.suma+=window.performance.now()-this.last;
        },
        reset:function(){
            this.ncyc=0;
            this.suma=0;
        }
    };
manage.tests.prototest={
    inited:false,
    lines:null,
    active:0,
    bench:null,
    vars:null,
    start:function(){
        manage.console.log(this.name,"executed");
        control.control.everysec(this,"run");
        this.vars={sleeping:0,counting:0};
    },
    run:function(){
        var ret;
        while(this.active<this.lines.length){
            ret=this.executeLine(this.lines[this.active]); // 0=unknown 1=fail 2=pass
            if(ret===0){return;}
            if(ret===1){this.finish(false);return;}
            if(ret===2){this.active+=1;}else{
                manage.console.error("Tests:","Unknown result",ret);
            }
        }
        this.finish(true);
    },
    finish:function(success){
        if(success){
            manage.console.success("Test",this.name,"succeded");
        }else{
            manage.console.error("Test",this.name,"failed");
        }
        control.control.unsubscribe(this,"run");
        manage.tests.nextTest();
    },
    executeLine:function(line){
        var cmd,val,actual,should,varis;
        if(line.length===0){return 2;}
        cmd=line[0];
        if(cmd.length===0){return 2;}
        //manage.console.debug(line.join(" "),"executed");
        varis=this.vars;
        try{
            if(cmd.indexOf("#")===0){return 2;}
            if(cmd==="do"){
                if(line.length===1){this.error("no command to evaluate");return 1;}
                this.evaluate(line[1]);
                return 2;
            }if(cmd==="var"){
                if(line.length<3){this.error("too few arguments");return 1;}
                val=this.evaluate(line[2]);
                varis[line[1]]=val;
                return 2;
            }if(cmd==="!="||cmd==="=="||cmd===">"||cmd==="<"||cmd==="<="||cmd===">="){
                if(line.length<3){this.error("too few arguments");return 1;}
                val=this.evaluate(line[1]+cmd+line[2]);
                if(!val){
                    actual=this.evaluate(line[1]);
                    should=this.evaluate(line[2]);
                    this.error(actual,cmd,should);
                }
                return val?2:1;
            }if(cmd==="is"||cmd==="not"){
                if(line.length<2){this.error("too few arguments");return 1;}
                val=this.evaluate(line[1]);
                should=cmd==="is";
                if(val!==should){this.error(val,"should be",should);}
                return val===should?2:1;
            }if(cmd==="sleep"){
                if(line.length<2){
                    this.error("too few arguments");return 1;
                }
                val=parseInt(line[1],10);
                if(varis.sleeping>=val){
                    varis.sleeping=0;
                    return 2;
                }
                varis.sleeping+=1;
                return 0;
            }if(cmd==="wait"){
                if(line.length<2){this.error("too few arguments");return 1;}
                varis.counting+=1;
                if(varis.counting>200){this.error("Wait","too many iteration");return 1;}
                val=this.evaluate(line[1]);
                return val?2:0;
            }if(cmd==="goto"){
                if(line.length<2){this.error("too few arguments");return 1;}
                if(line[1]==="target"){return 2;}
                varis.counting+=1;
                if(varis.counting>200){this.error("Goto","too many iteration");return 1;}
                val=this.evaluate(line[1]);
                if(val){
                    actual=parseInt(line[2],10)-1;
                    if(this.lines[actual][1]!=="target"){
                        this.error("Goto not pointing to target at",actual);return 1;
                    }
                    this.active=actual;
                }
                return 2;
            }if(cmd==="bench"){
                if(line.length<3){this.error("too few arguments");return 1;}
                actual=window.performance.now();
                if(line[1]==="start"){
                    this.bench={start:actual,finish:actual+parseFloat(line[2])};
                    return 2;
                }if(line[1]==="perf"){
                    if(!this.bench){
                        this.bench=$.extend({},manage.tests.perf);
                    }
                    this.bench.start();
                    this.evaluate(line[2]);
                    this.bench.end();
                    return 2;
                }
                
                //manage.console.debug("now",now,"finish",this.bench.finish);
                if(this.bench.finish){
                    if(actual<this.bench.finish){return 0;}
                    val=this.evaluate(line[1]);
                    val/=(actual-this.bench.start)/parseFloat(line[2]);
                }else{
                    val=this.bench.ncyc/this.bench.suma*parseFloat(line[2]);
                }
                manage.console.success("Benchmark",this.name,":",val.toFixed(1),"points");
                return 2;
            }
            this.error("Unknown command");
            return 1;
        }catch(err){
            this.error(err.toString());
            return 1;
        }
    },
    evaluate:function(cmd){
        var replaced=cmd.replace(/\$\$/g,"this.vars.");
        return eval(replaced);
    },
    compileTest:function(data){
        var i;
        this.lines=data.split("\r\n");
        for(i=0;i<this.lines.length;i+=1){
            this.lines[i]=this.split(this.lines[i]);
        }
        this.inited=true;
        if(manage.tests.tests[manage.tests.active]===this){
            this.start();
        }
    },
    split:function(line){
        var strspl=line.split('"'),
        even=false,i,spcspl;
        for(i=0;i<strspl.length;i+=1){
            if(even){
                strspl[i]=strspl[i].replace(" ","__");
            }
            even=!even;
        }
        line=strspl.join("'");
        spcspl=line.split(" ");
        for(i=0;i<spcspl.length;i+=1){
            spcspl[i]=spcspl[i].replace("__"," ");
        }
        return spcspl;
    },
    error:function(){
        var i,msg=[(this.active+1)+")",'"'+this.lines[this.active].join(" ")+'"',"-"];
        for(i=0;i<arguments.length;i+=1){
            msg.push(arguments[i]);
        }
        manage.console.error.apply(manage.console,msg);
    },
    notify:function(args){
        if(args==="run"){this.run();}
    }
    
};
// @license-end