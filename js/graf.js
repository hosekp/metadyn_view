gl=null;
graf={
    data:null,
    databuf:null,
    param:null,
    lencheck:-1,
    //ctx:null,
    byte:{},
    defsett:{
       speed:0.1,height:1,resol:0.2,drawline:false,repet:false
    },
    onthefly:false,
    lastpos:[],
    fallback:false,
    resol:0.2,
    heigkoef:1,
    arr:[],
    drawline:false,
    backup:{
        size:0,
        lasthei:1,
        byte:null,
        bytearr:null,
        data:{},
        clear:function(){this.data={};}
    },
    slide:{
        div:{},
        lasttime:-1,
        last:-2,
        running:false,
        time:0,
        speed:0.1,
        repet:false,
        dragging:false,
        limit:{min:0,max:10000,width:null},
        times:null,  //seznam časů, kdy jsou data - Float32Array
        init:function(){
            this.div.cont=$("#slider");
            this.div.outer=$("<div>").attr({id:"slider_outer"}).css({width:"500px",height:"30px",backgroundColor:"#aaaaaa"});
            this.div.inner=$("<div>").attr({id:"slider_inner"}).css({left:"10px",top:"10px",width:"480px",height:"10px",backgroundColor:"#444444",position:"relative"});
            this.div.mover=$("<div>").attr({id:"slider_mover"}).css({left:"10px",top:"2px",width:"10px",height:"26px",backgroundColor:"#ff3333",position:"absolute"});
            this.div.mover
                .mousedown(function() {
                    $(window).mousemove(function(e) {
                        graf.slide.dragging = true;
                        event=e;
                        var p=e.pageX-20;
                        //main.cons("drag "+p);
                        p=Math.min(Math.max(p,0),470);
                        var frac=p/470;
                        graf.slide.div.mover.css("transform","translate("+p+"px,0px)");
                        graf.slide.byMover(frac);
                        //$(window).unbind("mousemove");
                    }).mouseup(function() {
                    //var wasDragging = graf.slide.dragging;
                    graf.slide.dragging = false;
                    $(window).unbind("mousemove");
                    $(window).unbind("mouseup");
                });;
                });
            this.div.cont.append(this.div.outer.append(this.div.inner,this.div.mover));
        },
        load:function(tim,lim){
            this.times=tim;this.limit=lim;this.limit["width"]=lim.max-lim.min;
        },
        moveMover:function(time){
            this.div.mover.css("transform","translate("+((time-this.limit.min)/(this.limit.width)*470)+"px,0px)");
        },
        byMover:function(frac){
            this.stop();
            this.set(this.limit.min+this.limit.width*frac);
        },
        set:function(ntime){
            this.time=ntime;
            if(ntime>this.limit.max){if(!this.repet){
                    this.stop();this.time=this.limit.max;ntime=this.time;
                }else{
                    this.reset();ntime=this.time;
                }}  // time > maxtime
            var nlast=this.newlast(ntime);
            this.moveMover(ntime);
            if(nlast===this.last){
                return false;
            }
            var ret;
            if(graf.param.moving){
                ret=this.subData(nlast,nlast);
            }else if(nlast>this.last){
                ret=this.subData(this.last+2,nlast);
            }else{
                ret=this.subData(0,nlast);  
            }
            this.last=nlast;
            return ret;
            //this.last nastavuje prepareData
            
        },
        subData:function(old,nlast){
            // vrací subarray mezi pointery old a nlast (včetně, včetně) 
            var start=this.times[old+1];
            var end;
            if(nlast+3>=this.times.length){
                end=graf.data.length;
            }else{
                end=this.times[nlast+3];
            }
            var len=Math.max(end-start,0);
            return new Float32Array(graf.databuf,start*4,len);
            return false;
        },
        newlast:function(ntime){
            var ratio=(ntime-this.limit.min)/this.limit.width;
            var nlast=Math.floor(Math.floor(this.times.length/2)*ratio)*2;
            while(ntime>this.times[nlast]){nlast+=2;}
            while(ntime<this.times[nlast]){nlast-=2;}
            return nlast;
        },
        clock:function(){
            if(!this.running){return;}
            main.stats.begin();
            var now = new Date().getTime();
            var dt = now - this.lasttime;
            this.lasttime = now;
            var newtime=this.time+dt*this.speed*this.limit.width/1000;
            graf.draw(this.set(newtime));
            //this.time=newtime;
            main.stats.end();
            requestAnimationFrame($.proxy(graf.slide.clock,graf.slide));
        },
        start:function(){
            if(this.data===null){alert("no data");return;}
            if(this.time>=this.limit.max){this.reset();}
            main.div.start.val("Stop");
            this.running=true;
            this.lasttime=new Date().getTime();
            this.clock();
        },
        stop:function(){
            if(this.running){
                main.div.start.val("Start");
                this.running=false;
            }
        },
        reset:function(){
            this.time=this.limit.min;
            this.last=-2;
            this.moveMover(this.time);
            graf.linctx.clearRect(0,0,500,500);
            graf.pctx.clearRect(0,0,500,500);
            graf.lastpos=null;
            graf.makeArr();
        }
    },
    shaders:{
        initGL:function(){
            try {
                gl = main.div.canvas[0].getContext("webgl") || main.div.canvas[0].getContext("experimental-webgl");
                //gl = getWebGLContext(main.div.canvas[0]);
            } catch(e) {alert(e);return false;}
            if (!gl) {
                //alert("Could not initialise WebGL, sorry :-( ");
                return false;}
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.viewportWidth = main.width;
            gl.viewportHeight = main.height;
            return true;
        },
        initShaders:function(){
            var vertexShader = this.getShader(gl, "2d-vertex-shader");
            var fragmentShader = this.getShader(gl, "2d-fragment-shader");
            var program = gl.createProgram();
            this.program=program;
            gl.attachShader(program,vertexShader);
            gl.attachShader(program,fragmentShader);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                //alert("Unable to initialize the shader program.");
                return false;
            }
            this.initParam();
            gl.useProgram(program);
            return true;
        },
        initParam:function(){
            var program=this.program;
            program.vertexPositionAttribute = gl.getAttribLocation(program, "a_position");
            gl.enableVertexAttribArray(program.vertexPositionAttribute);
            
            program.texCoordLocation=gl.getAttribLocation(program,"a_texCoord");
            gl.enableVertexAttribArray(program.texCoordLocation);
            
            //program.texCoordLocation=texCoordLocation;
    
        },
        initBuffers:function(){
            var buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0,  1.0, -1.0,  1.0, 1.0, -1.0, 1.0,  1.0]), gl.STATIC_DRAW);
            var texCoordBuffer=gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER,texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0.0,0.0,1.0,0.0,0.0,1.0,0.0,1.0,1.0,0.0,1.0,1.0]),gl.STATIC_DRAW);
            //gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1.0,-1.0,1.0,-1.0,-1.0,1.0,-1.0,1.0,1.0,-1.0,1.0,1.0]),gl.STATIC_DRAW);
            
        },
        initTextures:function(){
            //var textureSizeLocation = gl.getUniformLocation(this.program, "u_textureSize");
            //gl.uniform2f(textureSizeLocation, main.width, main.height);
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
        },
        init:function(){
            if(!this.initGL()){return false;}
            if(!this.initShaders()){return false;}
            this.initBuffers();
            //this.initParam();
            this.initTextures();
            //var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
            //gl.uniform2f(resolutionLocation, main.width, main.height);
        },
        draw:function(){
            //if(!gl){this.init();}
            gl.vertexAttribPointer(this.program.positionLocation, 2, gl.FLOAT, false, 0, 0);
            gl.vertexAttribPointer(this.program.texCoordLocation,2,gl.FLOAT,false,0,0);
            /*var arrBuffer=gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER,arrBuffer);
            gl.bufferData(gl.ARRAY_BUFFER,graf.arrbuf,gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.program.arrBuffLocation,1,gl.FLOAT,false,0,0);*/
            graf.compArr();
            //main.cons(graf.bytearr.length);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA,Math.floor(main.width*graf.resol),Math.floor(main.width*graf.resol),0,gl.ALPHA,gl.UNSIGNED_BYTE,graf.byte.arr);
            //texImage2D (ulong target, long level, ulong intformat, ulong width, ulong height, long border, ulong format, ulong type, Object data )
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        },
        getShader:function(gl, id) {
            var shaderScript = document.getElementById(id);
            if (!shaderScript) {return null;}
            var str = "";
            var k = shaderScript.firstChild;
            while (k) {
                if (k.nodeType === 3)
                    str += k.textContent;
                k = k.nextSibling;
            }
            var shader;
            if (shaderScript.type === "x-shader/x-fragment") {
                shader = gl.createShader(gl.FRAGMENT_SHADER);
            } else if (shaderScript.type === "x-shader/x-vertex") {
                shader = gl.createShader(gl.VERTEX_SHADER);
            } else {return null;}
            gl.shaderSource(shader, str);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert(gl.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        }
    },
    init:function(){
        //this.makeArr();
        //this.speed=main.div.speed.val();
        //this.imageData=this.ctx.createImageData(main.height,main.width);
        var hashstr=window.location.hash;
        this.slide.speed=this.defsett.speed;
        this.heigkoef=this.defsett.height;
        this.resol=this.defsett.resol;
        this.drawline=this.defsett.drawline;
        this.slide.repet=this.defsett.repet;
        if(hashstr){
            var hash={};
            hashstr=hashstr.substring(1);
            var hashspl=hashstr.split("&");
            for(var i=0;i<hashspl.length;i++){
                var hsspl=hashspl[i].split("=");
                if(hsspl.length>1){
                    hash[hsspl[0]]=hsspl[1];
                }
            }
            if(hash["spd"]){this.slide.speed=parseFloat(hash["spd"]);}
            if(hash["hei"]){this.heigkoef=parseFloat(hash["hei"]);}
            if(hash["res"]){this.resol=parseFloat(hash["res"]);}
            if(hash["lns"]){this.drawline=hash["lns"]==="true";}
            if(hash["rpt"]){this.slide.repet=hash["rpt"]==="true";}
        }
        this.precanvas=main.div.precanvas[0];
        this.pctx=this.precanvas.getContext("2d");
        this.lin=main.div.lincan.attr({width:500,height:500});
        //this.lin=$("<canvas>").attr({width:500,height:500});
        this.linctx=this.lin[0].getContext("2d");
        this.linctx.strokeStyle="green";
        this.linctx.lineWidth = 1;
        this.lincanctx=main.div.lincan[0].getContext("2d");
        this.shaders.init();
        if(gl===null){
            this.fallback=true;
            this.mainctx=main.div.canvas[0].getContext("2d");
            this.mainctx.fillStyle="blue";
        }
        this.slide.init();
    },
    makeArr:function(){
        var width=Math.floor(main.width*this.resol);
        var height=Math.floor(main.height*this.resol);
        /*var width=main.width;
        var height=main.height;*/
        if(this.param.cv.length===1){height=1;}
        this.arrbuf=new ArrayBuffer(width*height*4);
        this.backup.size=width*height*4;
        this.maxval=-10000000;
        /*this.arr=[];
        for(var i=0;i<height;i++){
            this.arr.push(new Float32Array(this.arrbuf,i*4*width,width));
        }*/
        this.arrall=new Float32Array(this.arrbuf);
    },
    compArr:function(){
        var width=Math.floor(main.width*this.resol);
        var height=Math.floor(main.height*this.resol);
        var bytebuf=new ArrayBuffer(width*height);
        var byte=new Uint8Array(bytebuf);
        //var max=-10000000;
        //var min=10000000000;
        var maxval=this.maxval*this.heigkoef;
        //if(maxval>255){
            for(var i in byte){
                var val=Math.floor(this.arrall[i]*this.heigkoef);
                if(val>255){byte[i]=0;}else{byte[i]=255-val;}
            }
        /*}else{
            for(var i in byte){
                var val=Math.floor(this.arrall[i]*this.heigkoef);
                //if(val>255){byte[i]=0;}else{byte[i]=255-val;}
                byte[i]=maxval-val;
            }
        }*/
        this.byte.arr=byte;
        //this.byte.max=max;
        //this.byte.min=min;
        
    },
    draw:function(array){
        if(!array){return;}
        if(this.param.moving||array.byteOffset===0){this.makeArr();}
        if(array.length===0){return;}
        var par=this.param;
        /*var nsx=this.param.coosigx;
        var nsx3=Math.floor(nsx*3);
        var nsx6=Math.floor(nsx*6);
        if(this.param.cv===2){
            var nsy=this.param.coosigy;
            var nsy3=Math.floor(nsy*3);
            var nsy6=Math.floor(nsy*6);
        }*/
        var blob=this.blob;
        var arr=this.arrall;
        var width=Math.floor(main.width*this.resol);
        var height=Math.floor(main.height*this.resol);
        //var period=this.param.period;
        /*var width=main.width;
        var height=main.height;*/
        if(this.param.cv.length===1){
            alert("not implemented");
            for(var h=0;h<array.length;h+=2){
                var midd=this.toPos(array,h,1);
                var midx=Math.floor(midd[0]*this.resol);
                //var midy=Math.floor(midd[1]*this.resol);
                var hei=array[h+1];
                //var hei=midd[2]*this.heigkoef;
                for(var x=0;x<nsx6;x++){
                    if(period[0]){var f=(x+midx-nsx3+width)%width;}else{var f=x+midx-nsx3;if(f<0||f>=width){continue;}}
                    //canline[f]=Math.min(canline[f]+hei*blobline[x],255);
                    arr[f]=arr[f]+hei*blob[x];
                }
            }
        }else{
            var val;
            var nsx=par.cv[0].coosig;
            var nsx3=Math.floor(nsx*3);
            var nsx6=Math.floor(nsx*6);
            var nsy=par.cv[1].coosig;
            var nsy3=Math.floor(nsy*3);
            var nsy6=Math.floor(nsy*6);
            var periodx=par.cv[0].period;
            var periody=par.cv[1].period;
            for(var h=0;h<array.length;h+=3){
                var midd=this.toPos(array,h,2);
                var midx=Math.floor(midd[0]*this.resol);
                var midy=Math.floor(midd[1]*this.resol);
                var hei=array[h+2];
                //var hei=midd[2]*this.heigkoef;
                for(var y=0;y<nsy6;y++){
                    var blobline=blob[y];
                    if(periody){var canline=(y+midy-nsy3+height)%height;}else{var canline=y+midy-nsy3;if(canline<0||canline>=height){continue;}}
                    var canline=(y+midy-nsy3+height)%height;
                    //var canline=arr[(y+midy-nsy3+height)%height];
                    for(var x=0;x<nsx6;x++){
                        if(periodx){var f=(x+midx-nsx3+width)%width;}else{var f=x+midx-nsx3;if(f<0||f>=width){continue;}}
                        
                        //canline[f]=Math.min(canline[f]+hei*blobline[x],255);
                        val=arr[canline*width+f]+hei*blobline[x];
                        if(val>this.maxval){this.maxval=val;}
                        arr[canline*width+f]=val;
                    }
                }
            }
        }
        if(this.param.cv===1){
            //this.createPlot(stat);
        }else{
            this.shaders.draw();
            /*if(this.drawline){
                this.createLines(array);
            }*/
        }
        //this.coloring(ctx);
        //main.cons(this.slide.times[stat.frame]);
    },
    placeblob:function(){
        
    },
    loadPar:function(par){
        this.param=par;
        for(var i=0;i<par.cv.length;i++){
            var cv=par.cv[i];
            cv.span=(cv.max-cv.min);
            /*if(i===0){cv.step=(cv.max-cv.min)/main.width;}else{
                cv.step=(cv.max-cv.min)/main.height;
            }*/
        }
        //this.param.height=parseFloat(this.param.height);
        /*var heig=this.param.height;
        if(this.param.height){
            if(this.param.onehill){
                for(var frame in this.data){
                    var dato=this.data[frame];
                    if(frame==="param"){continue;}
                    if(!$.isArray(dato)){
                        alert("not array");
                    }
                    if(dato.length===2){dato.push(heig);}
                    
                    
                }
            }else{
                for(var frame in this.data){
                    var dato=this.data[frame];
                    for(var i=0;i<dato.length;i++){
                        if(dato[i].length===2){dato[i].push(heig);}
                    }
                }
            }
        }*/
        this.createBlob(this.resol);
    },
    createBlob:function(res){
        this.resol=res;
        var par=this.param;
        //if(par.cv.length!==1){par.cv=2;}
        if(par){
            var cv=par.cv[0];
            cv.coosig=cv.sigma/cv.span*this.resol*main.width;
            cv=par.cv[1];
            cv.coosig=cv.sigma/cv.span*this.resol*main.height;
            if(par.cv.length===1){
                var nsx=par.cv[0].coosig;
                var nsx6=Math.floor(nsx*6);
                this.blobbuf=new ArrayBuffer(nsx6*4);
                var blob=new Float32Array(this.blobbuf,0,nsx6);
                for(var x=0;x<nsx6;x++){
                    var add=2*Math.exp(-Math.pow(x/nsx-3,2)/2);
                    blob[x]=add;
                }
                this.blob=blob;
            }else{
                var nsx=par.cv[0].coosig;
                var nsx6=Math.floor(nsx*6);
                var nsy=par.cv[1].coosig;
                var nsy6=Math.floor(nsy*6);
                this.blobbuf=new ArrayBuffer(nsx6*nsy6*4);
                this.blob=[];
                var blob=this.blob;
                for(var y=0;y<nsy6;y++){
                    blob.push(new Float32Array(this.blobbuf,y*4*nsx6,nsx6));
                    for(var x=0;x<nsx6;x++){
                        var add=Math.exp(-Math.pow(x/nsx-3,2)/2-Math.pow(y/nsy-3,2)/2);
                        blob[y][x]=add;
                    }
                }
            }
            this.makeArr();
        }
    },
    toPos:function(arr,i,cv){
        if(!arr){
            main.cons("pos not valid");
            return [0,0];
        }
        var px=(arr[i]-this.param.cv[0].min)/this.param.cv[0].span*main.width;
        if(cv===2){
            var py=(-arr[i+1]+this.param.cv[1].max)/this.param.cv[1].span*main.height;
            return [px,py];
        }
        return [px];
        //return [px,py];
    },
    createLines:function(array){
        var ctx=this.linctx;
        var newdata=this.data[this.slide.frames[stat.frame]];
        if(!this.lastpos){
            this.lastpos=newdata;
            return;}
        //if(!newdata){return;}
        var olddata=this.lastpos;
        if(!olddata||!newdata){return;}
        
        for(var i=0;i<Math.min(newdata.length,3);i++){
            if(!olddata[i]||!newdata[i]){
                //return;
            }
            ctx.beginPath();
            var pos1=this.toPos(olddata[i],2);
            var pos2=this.toPos(newdata[i],2);
            if(pos1[0]===pos2[0]&&pos1[1]===pos2[1]){
                return;
            }
            //main.cons("position of line - start:["+pos1[0]+","+pos1[1]+"] end:["+pos2[0]+","+pos2[1]+"]");
            ctx.moveTo(pos1[0],pos1[1]);
            if(this.param.period){
                if(pos2[0]-pos1[0]>400){
                    ctx.lineTo(pos2[0]-main.width,pos2[1]);
                    ctx.moveTo(pos1[0]+main.width,pos2[1]);
                }
                if(pos1[0]-pos2[0]>400){
                    ctx.lineTo(pos2[0]+main.width,pos2[1]);
                    ctx.moveTo(pos1[0]-main.width,pos2[1]);
                }
                if(pos2[1]-pos1[1]>400){
                    ctx.lineTo(pos2[0],pos2[1]-main.width);
                    ctx.moveTo(pos1[0],pos2[1]+main.width);
                }
                if(pos1[1]-pos2[1]>400){
                    ctx.lineTo(pos2[0],pos2[1]+main.width);
                    ctx.moveTo(pos1[0],pos2[1]-main.width);
                }
            }
            ctx.lineTo(pos2[0],pos2[1]);
            ctx.strokeStyle= "hsl("+(255*i/newdata.length)+",100%,40%)";
            ctx.lineWidth=5;
            ctx.stroke();
        }
        //this.lincanctx.drawImage(this.lin[0],0,0);
        this.lastpos=newdata;
    },
    createPlot:function(stat){
        var ctx=this.linctx;
        ctx.clearRect(0,0,main.height,main.width);
        var dat=this.arrall;
        var datlen=this.arrall.length;
        ctx.beginPath();
        ctx.moveTo(0,main.height-dat[0]*this.heigkoef);
        for(var i=1;i<datlen;i++){
            ctx.lineTo(i/this.resol,main.height-dat[i]*this.heigkoef);
        }
        ctx.strokeStyle= "red";
        ctx.stroke();
    },
    setHeight:function(val){
        this.heigkoef=val;
        if(this.param.cv===1){
            var par=this.param;
            par.dimy[1]=100/val;
            par.dimy[2]=(par.dimy[1]-par.dimy[0])/main.height;
            main.createAxis();
        }else{
            this.shaders.draw();
        }
    },
    getVal:function(x,y){
        if(!this.arrall){
            return x+" "+y;
        }
        if(this.param.cv===2){
            var fx=Math.floor(x*this.resol);
            var fy=Math.floor(y*this.resol);
            var width=main.width*this.resol;
            return this.arrall[fy*width+fx];
        }else{
            var fx=Math.floor(x*this.resol);
            return this.arrall[fx];
        }
    },
    newHash:function(){
        var ret="";
        if(this.slide.speed!==this.defsett.speed){ret+="&spd="+this.slide.speed;}
        if(this.heigkoef!==this.defsett.height){ret+="&hei="+this.heigkoef;}
        if(this.resol!==this.defsett.resol){ret+="&res="+this.resol;}
        if(this.drawline!==this.defsett.drawline){ret+="&lns="+this.drawline;}
        if(this.slide.repet!==this.defsett.repet){ret+="&rpt="+this.slide.repet;}
        if(ret){
            window.location.hash="#"+ret.substring(1);
        }else{
            window.location.hash="";
        }
    }
};

