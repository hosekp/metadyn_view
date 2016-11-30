/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(window.draw===undefined){var draw={};}
if(draw.gl===undefined){draw.gl={};}
$.extend(draw.gl,{
    g1:null,
    vertex:null,
    fragment:null,
    inited:false,
    engine:"gl",
    $can:null,
    needUpdCoord:false,
    program:null,
    init:function(){
        var sett=control.settings;
        if(this.inited){return true;}
        if(!this.initGL()){return false;}
        this.getShader("2d-vertex","vertex");
        this.getShader("2d-fragment","fragment");
        sett.zoom.subscribe(this,"upco");
        sett.frameposx.subscribe(this,"upco");
        sett.frameposy.subscribe(this,"upco");
        return false;
        //if(!this.initShaders()){return false;}
        //this.initBuffers();
        //this.initParam();
        //this.initTextures();
        //var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        //gl.uniform2f(resolutionLocation, main.width, main.height);
    },
    isInited:function(){
        return this.inited;
    },
    resize:function(width,height){
        if(this.g1){
            this.g1.viewport(0, 0, width, height);
        }
    },
    initGL:function(){
        var can,params,gl;
        can=$("<canvas>").attr({id:"main_can_gl"}).addClass("main_can");
        this.$can=can;
        //draw.drawer.appendCanvas();
        try {
            params={premultipliedAlpha:false,preserveDrawingBuffer:true};
            gl = can[0].getContext("webgl",params) 
                  || can[0].getContext("experimental-webgl",params);
            //var gl = can[0].getContext("webgl");
            //gl = getWebGLContext(main.div.canvas[0]);
        } catch(e) {this.loadFailed(e);return false;}
        if (!gl) {
            manage.console.warning("WebGL:","Could not initialize","WebGL context");
            this.loadFailed();
            return false;}
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.g1=gl;
        //this.resize();
        return true;
    },
    initProgram:function(){
        var gl=this.g1,
        progr = gl.createProgram();
        this.program=progr;
        gl.attachShader(progr,this.vertex);
        gl.attachShader(progr,this.fragment);
        gl.linkProgram(progr);
        if (!gl.getProgramParameter(progr, gl.LINK_STATUS)) {
            manage.console.warning("WebGL:","Could to initialize","shader program");
            this.loadFailed();
            return false;
        }
        this.initParam();
        gl.useProgram(progr);
        this.initBuffers();
        return true;
    },
    initParam:function(){
        var gl=this.g1,
        progr=this.program;
        progr.positionLocation = gl.getAttribLocation(progr, "a_position");
        gl.enableVertexAttribArray(progr.positionLocation);

        progr.texCoordLocation=gl.getAttribLocation(progr,"a_texCoord");
        gl.enableVertexAttribArray(progr.texCoordLocation);
        
        progr.zmaxLoc = gl.getUniformLocation(progr, "u_zmax");
        progr.stepLoc = gl.getUniformLocation(progr, "u_step");
        progr.cmarginLoc = gl.getUniformLocation(progr, "u_cmargin");

        //program.texCoordLocation=texCoordLocation;

    },
    initBuffers:function(){
        var gl=this.g1;
        this.coordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
        //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0,  1.0, -1.0,  1.0, 1.0, -1.0, 1.0,  1.0]), gl.STATIC_DRAW);
        this.coordarr=new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]);
        gl.bufferData(gl.ARRAY_BUFFER,this.coordarr, gl.STATIC_DRAW);
        this.texCoordBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.texCoordBuffer);
        //gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]), gl.STATIC_DRAW);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,1,1,1,0,0,0,0,1,1,1,0]), gl.STATIC_DRAW);
        //gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1.0,-1.0,1.0,-1.0,-1.0,1.0,-1.0,1.0,1.0,-1.0,1.0,1.0]),gl.STATIC_DRAW);
        this.initTextures();
    },
    initTextures:function(){
        var gl=this.g1,
        texture = gl.createTexture();
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        manage.console.log("WebGL:","loaded");
        this.inited=true;
    },
    draw:function(array,zmax){
        var gl=this.g1,nat,resol;
        nat=view.axi.natureRange(0,zmax,10,false);
        //manage.console.debug("step="+nat[2]);
        //manage.console.debug("drawing");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
        //this.updateCoord();
        gl.bufferData(gl.ARRAY_BUFFER,this.coordarr, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.program.positionLocation,2,gl.FLOAT,false,0,0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.vertexAttribPointer(this.program.texCoordLocation,2,gl.FLOAT,false,0,0);
        gl.uniform1f(this.program.zmaxLoc,zmax*64);
        gl.uniform1f(this.program.stepLoc,nat[2]*64);
        gl.uniform1f(this.program.cmarginLoc,0.003/control.settings.zoompow());
        /*var arrBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,arrBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,graf.arrbuf,gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.program.arrBuffLocation,1,gl.FLOAT,false,0,0);*/
        //graf.compArr();
        //main.cons(graf.bytearr.length);
        resol=control.settings.resol.get();
        
        if(resol*resol*4!==array.length){
            manage.console.error("WebGL:","Wrong length of texture array");
        }
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,resol,resol,0,gl.RGBA,gl.UNSIGNED_BYTE,array);
        //var err=gl.getError();if(err!==gl.NO_ERROR){manage.console.error("WebGL texture error: ",err);}
        //array=new Uint8Array([0,80,160,240]);
        //gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA,2,2,0,gl.ALPHA,gl.UNSIGNED_BYTE,array);
        //texImage2D (ulong target, long level, ulong intformat, ulong width, ulong height, long border, ulong format, ulong type, Object data )
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        //var err=gl.getError();if(err!==gl.NO_ERROR){manage.console.error("WebGL draw error: ",err);}
    },
    updateCoord:function(){
        var zoompow,posx,posy,xlow,xhigh,ylow,yhigh,mustr,i,arr,
        sett=control.settings;
        posx=sett.frameposx.get();
        posy=sett.frameposy.get();
        zoompow=sett.zoompow();
        xlow=posx*zoompow;
        xhigh=zoompow+posx*zoompow;
        ylow=posy*zoompow;
        yhigh=zoompow+posy*zoompow;
        //arr[0]=xlow;
        arr=this.coordarr;
        mustr=[xlow,ylow, xhigh,ylow, xlow,yhigh, xlow,yhigh, xhigh,ylow, xhigh,yhigh];
        for(i=0;i<12;i+=1){
            arr[i]=mustr[i];
        }
        //[0,0, 1,0, 0,1, 0,1, 1,0, 1,1]
        
    },
    getShader:function(id,typ) {
        $.get("shaders/"+id+".shd",$.proxy(function(str){
            this.initShader(str,typ);
        },this),"text");
    },
    initShader:function(str,typ){
        var gl=this.g1,shader;
        if(typ==="vertex"){
            shader=gl.createShader(gl.VERTEX_SHADER); 
        }else if(typ==="fragment"){
            shader=gl.createShader(gl.FRAGMENT_SHADER);
        }else{return null;}
        gl.shaderSource(shader, str);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            this.loadFailed(gl.getShaderInfoLog(shader));
            return null;
        }
        //manage.console.debug(typ+"Shader parsed and compiled");
        if(typ==="vertex"){
            this.vertex=shader;
        }else if(typ==="fragment"){
            this.fragment=shader;
        }else{return null;}
        if(this.vertex && this.fragment){
            this.initProgram();
        }
    },
    loadFailed:function(){
        control.settings.glcan.set(false);
        draw.drawer.switchTo("raster");
    },
    notify:function(args){
        if(args==="upco"){this.updateCoord();}
    }
});
// @license-end
