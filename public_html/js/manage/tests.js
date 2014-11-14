if(typeof manage==="undefined"){manage={};}
if(typeof manage.tests==="undefined"){manage.tests={};}
$.extend(manage.tests,{
    active:0,
    tests:[],
    inited:false,
    run:function(){
        if(!this.inited){
            this.createTests();this.inited=true;
        }
        if(this.active>=this.tests.length){return;}
        if(!this.tests[this.active].inited){return;}
        this.tests[this.active].start();
    },
    nextTest:function(){
        this.active++;
        this.run();
    },
    createTests:function(){
        control.settings.loglvl.set(2.5);
        var testnames=[];
        testnames=["langReader","loopHash","raster_ala_exp","1d_hills","webgl_amber_exp"];
        //testnames=["raster_ala_exp"];
        //testnames=["bugus"];
        for(var i=0;i<testnames.length;i++){
            var testname=testnames[i];
            this.tests.push($.extend({name:testname},manage.tests.prototest));
            this.getTest(testname,i);
        }
    },
    getTest:function(testname,index){
        $.get("tests/"+testname+".tst",$.proxy(function(data){
            this.tests[index].compileTest(data);
        },this),"text");
    }
});
manage.tests.prototest={
    inited:false,
    lines:null,
    active:0,
    sleeping:0,
    vars:null,
    start:function(){
        manage.console.log(this.name,"executed");
        control.control.subscribe(this,"run");
        this.vars={};
    },
    run:function(){
        while(this.active<this.lines.length){
            var ret=this.executeLine(this.lines[this.active]); // 0=unknown 1=fail 2=pass
            if(ret===0){return;}
            if(ret===1){this.finish(false);return;}
            if(ret===2){this.active++;}else{
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
        if(line.length===0){return 2;}
        var cmd=line[0];
        if(cmd.length===0){return 2;}
        //manage.console.debug(line.join(" "),"executed");
        try{
            if(cmd.indexOf("#")===0){return 2;}
            else if(cmd==="do"){
                if(line.length===1){this.error("no command to evaluate");return 1;}
                this.evaluate(line[1]);
                return 2;
            }else if(cmd==="var"){
                if(line.length<3){this.error("too few arguments");return 1;}
                var val1=this.evaluate(line[2]);
                this.vars[line[1]]=val1;
                return 2;
            }else if(cmd==="!="||cmd==="=="||cmd===">"||cmd==="<"||cmd==="<="||cmd===">="){
                if(line.length<3){this.error("too few arguments");return 1;}
                var res=this.evaluate(line[1]+cmd+line[2]);
                var var1=this.evaluate(line[1]);
                var var2=this.evaluate(line[2]);
                if(!res){this.error(var1,cmd,var2);}
                return res?2:1;
            }else if(cmd==="is"||cmd==="not"){
                if(line.length<2){this.error("too few arguments");return 1;}
                var res=this.evaluate(line[1]);
                var should=cmd==="is";
                if(res!==should){this.error(res,"should be",should);}
                return res===should?2:1;
            }else if(cmd==="sleep"){
                if(line.length<2){
                    this.error("too few arguments");return 1;
                }
                var num=parseInt(line[1]);
                if(this.sleeping>=num){
                    this.sleeping=0;
                    return 2;
                }else{
                    this.sleeping++;
                    return 0;
                }
            }else if(cmd==="wait"){
                if(line.length<2){this.error("too few arguments");return 1;}
                var val=this.evaluate(line[1]);
                return val?2:0;
            }else{
                this.error("Unknown command");
                return 1;
            }
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
        this.lines=data.split("\r\n");
        for(var i=0;i<this.lines.length;i++){
            this.lines[i]=this.split(this.lines[i]);
        }
        this.inited=true;
        if(manage.tests.tests[manage.tests.active]===this){
            this.start();
        }
    },
    split:function(line){
        var strspl=line.split('"');
        var even=false;
        for(var i=0;i<strspl.length;i++){
            if(even){
                strspl[i]=strspl[i].replace(" ","__");
            }
            even=!even;
        }
        line=strspl.join("'");
        var spcspl=line.split(" ");
        for(var i=0;i<spcspl.length;i++){
            spcspl[i]=spcspl[i].replace("__"," ");
        }
        return spcspl;
    },
    error:function(){
        var msg=[this.active+")",'"'+this.lines[this.active].join(" ")+'"',"-"];
        for(var i=0;i<arguments.length;i++){
            msg.push(arguments[i]);
        }
        manage.console.error.apply(manage.console,msg);
    },
    notify:function(args){
        if(args==="run"){this.run();}
    }
    
};
manage.tests.prototest2={
    result:2, // 0=unknown 1=fail 2=pass
    numtest:0,
    progress:0,
    sleeping:0,
    inited:false,
    run:function(){
        this.numtest=0;
        this.result=2;
        this.body();
        if(this.result===2){
            manage.console.success(this.name,"finished successfully");
        }else if(this.result===1){
            manage.console.error(this.name,"failed");
        }else{
            return false;
        }
        control.control.unsubscribe(this,"run");
        manage.tests.run();
    },
    init:function(){
        manage.console.log(this.name,"executed");
        control.control.subscribe(this,"run");
    },
    assertEqual:function(val1,val2){
        this.numtest++;
        if(this.result!==2||this.progress>=this.numtest){return;}
        if(val1===val2){
        }else{
            manage.console.error("test",this.numtest,"failed","-",val1,"!=",val2);
            this.result=1;
        }
        this.progress++;
    },
    wait:function(bool){
        this.numtest++;
        if(this.result!==2||this.progress>=this.numtest){return;}
        if(!bool){
            this.result=0;
            return;
        }else{
            this.progress++;
        }
    },
    sleep:function(num){
        this.numtest++;
        if(this.result!==2||this.progress>=this.numtest){return;}
        if(this.sleeping>=num){
            this.progress++;
            this.sleeping=0;
        }else{
            this.sleeping++;
            this.result=0;
        }
    },
    notify:function(args){
        if(args==="run"){this.run();}
    }
};