if(typeof draw==="undefined"){draw={};}
if(typeof draw.gl==="undefined"){draw.gl={};}
$.extend(draw.gl,{
    g1:null,
    vertex:null,
    fragment:null,
    inited:false,
    program:null,
    init:function(){
        //if(this.inited){return true;}
        if(!this.initGL()){return false;}
        this.getShader("2d-vertex.shd","vertex");
        this.getShader("2d-fragment.shd","fragment");
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
        var $can=draw.drawer.getCan();
        try {
            var gl = $can[0].getContext("webgl") || $can[0].getContext("experimental-webgl");
            //gl = getWebGLContext(main.div.canvas[0]);
        } catch(e) {manage.console.error(e);return false;}
        if (!gl) {
            manage.console.error("Could not initialise WebGL, sorry :-( ");
            return false;}
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.g1=gl;
        //this.resize();
        return true;
    },
    initProgram:function(){
        var gl=this.g1;
        var progr = gl.createProgram();
        this.program=progr;
        gl.attachShader(progr,this.vertex);
        gl.attachShader(progr,this.fragment);
        gl.linkProgram(progr);
        if (!gl.getProgramParameter(progr, gl.LINK_STATUS)) {
            manage.console.error("Unable to initialize the shader program.");
            return false;
        }
        this.initParam();
        gl.useProgram(progr);
        this.initBuffers();
        return true;
    },
    initParam:function(){
        var gl=this.g1;
        var progr=this.program;
        progr.vertexPositionAttribute = gl.getAttribLocation(progr, "a_position");
        gl.enableVertexAttribArray(progr.vertexPositionAttribute);

        progr.texCoordLocation=gl.getAttribLocation(progr,"a_texCoord");
        gl.enableVertexAttribArray(progr.texCoordLocation);

        //program.texCoordLocation=texCoordLocation;

    },
    initBuffers:function(){
        var gl=this.g1;
        this.coordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
        //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0,  1.0, -1.0,  1.0, 1.0, -1.0, 1.0,  1.0]), gl.STATIC_DRAW);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]), gl.STATIC_DRAW);
        this.texCoordBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]), gl.STATIC_DRAW);
        //gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1.0,-1.0,1.0,-1.0,-1.0,1.0,-1.0,1.0,1.0,-1.0,1.0,1.0]),gl.STATIC_DRAW);
        this.initTextures();
    },
    initTextures:function(){
        var gl=this.g1;
        //var textureSizeLocation = gl.getUniformLocation(this.program, "u_textureSize");
        //gl.uniform2f(textureSizeLocation, main.width, main.height);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        manage.console.log("WebGL loaded");
        this.inited=true;
    },
    draw:function(array){
        //if(!this.inited){this.init();}
        var gl=this.g1;
        //manage.console.debug("drawing");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
        gl.vertexAttribPointer(this.program.positionLocation,2,gl.FLOAT,false,0,0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.vertexAttribPointer(this.program.texCoordLocation,2,gl.FLOAT,false,0,0);
        /*var arrBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,arrBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,graf.arrbuf,gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.program.arrBuffLocation,1,gl.FLOAT,false,0,0);*/
        //graf.compArr();
        //main.cons(graf.bytearr.length);
        var resol=control.settings.resol.get();
        
        if(resol*resol!==array.length){
            manage.console.error("Error: Wrong length of texture array");
        }
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA,resol,resol,0,gl.ALPHA,gl.UNSIGNED_BYTE,array);
        //array=new Uint8Array([0,80,160,240]);
        //gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA,2,2,0,gl.ALPHA,gl.UNSIGNED_BYTE,array);
        //texImage2D (ulong target, long level, ulong intformat, ulong width, ulong height, long border, ulong format, ulong type, Object data )
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
    getShader:function(id,typ) {
        $.get("shaders/"+id,$.proxy(function(str){
            this.initShader(str,typ);
        },this),"text");
    },
    initShader:function(str,typ){
        var gl=this.g1;
        if(typ==="vertex"){
            var shader=gl.createShader(gl.VERTEX_SHADER); 
        }else if(typ==="fragment"){
            shader=gl.createShader(gl.FRAGMENT_SHADER);
        }else{return null;}
        gl.shaderSource(shader, str);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            manage.console.error(gl.getShaderInfoLog(shader));
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
    }
});