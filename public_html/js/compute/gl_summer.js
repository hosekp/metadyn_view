/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if (window.compute === undefined) {var compute = {};}
if (compute.gl_summer === undefined) {compute.gl_summer = {};}
$.extend(compute.gl_summer, {
    initstart:false,
    inited: false,
    periods:[false,false],
    last:{
        width:-1,
        height:-1,
        blobarr:null
    },
    g1: null,
    init: function() {
        if(this.inited){return true;}
        if(this.initstart){return false;}
        this.initstart=true;
        this.inited = false;
        var ret = this.initGL();
        if (!ret) {
            return false;
        }
        this.getShader("add2-vertex", "vertex");
        this.getShader("add2-fragment", "fragment");
        return false;
    },
    initGL: function() {
        var gl,can = $("<canvas>");
        try {
            gl = can[0].getContext("webgl",{premultipliedAlpha:false}) || can[0].getContext("experimental-webgl",{premultipliedAlpha:false});
            //gl = getWebGLContext(main.div.canvas[0]);
        } catch (e) {
            this.loadFailed(e);
            return false;
        }
        if (!gl) {
            this.loadFailed("Gl_summer:","Could not initialize","WebGL");
            return false;
        }
        //gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.g1 = gl;
        this.$can=can;
        //this.resize();
        return true;
    },
    resize:function(width,height){
        if(!this.$can){return;}
        //var width=this.$can_cont.width();
        //var height=this.$can_cont.height();
        this.$can.width(width);
        this.$can.height(height);
        this.$can.attr({width:width,height:height});
        if(this.g1){
            this.g1.viewport(0, 0, width, height);
        }
        this.last.width=width;
        this.last.height=height;
    },
    getShader: function(id, typ) {
        $.get("shaders/" + id+".shd", $.proxy(function(str) {
            this.initShader(str, typ);
        }, this), "text");
    },
    initShader: function(str, typ) {
        var gl = this.g1,shader;
        if (typ === "vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else if (typ === "fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else {
            return null;
        }
        gl.shaderSource(shader, str);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            this.loadFailed(gl.getShaderInfoLog(shader));
            return null;
        }
        //manage.console.debug(typ+"Shader parsed and compiled");
        if (typ === "vertex") {
            this.vertex = shader;
        } else if (typ === "fragment") {
            this.fragment = shader;
        } else {
            return null;
        }
        if (this.vertex && this.fragment) {
            this.initProgram();
        }
    },
    initProgram: function() {
        var gl = this.g1,progr;
        progr = gl.createProgram();
        this.program = progr;
        gl.attachShader(progr, this.vertex);
        gl.attachShader(progr, this.fragment);
        gl.linkProgram(progr);
        if (!gl.getProgramParameter(progr, gl.LINK_STATUS)) {
            this.loadFailed("Gl_summer:","Linker: "+gl.getProgramInfoLog(progr));
            return false;
        }
        gl.useProgram(progr);
        this.initParam();
        this.initBuffers();
        return true;
    },
    initParam: function() {
        var gl = this.g1,progr;
        progr = this.program;
        progr.positionLocation = gl.getAttribLocation(progr, "a_position");
        gl.enableVertexAttribArray(progr.positionLocation);

        progr.texCoordLocation = gl.getAttribLocation(progr, "a_texCoord");
        gl.enableVertexAttribArray(progr.texCoordLocation);

        progr.mainTexLoc = gl.getUniformLocation(progr, "mainTex");
        progr.blobTexLoc = gl.getUniformLocation(progr, "blobTex");
        progr.periodsLoc = gl.getUniformLocation(progr, "periods");
        //progr.canvasWidthLoc = gl.getUniformLocation(progr, "canvasWidth");
        //progr.canvasHeightLoc = gl.getUniformLocation(progr, "canvasHeight");
        progr.posLoc = gl.getUniformLocation(progr,"pos");

    },
    initBuffers: function() {
        var gl = this.g1;
        this.coordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
        //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0,  1.0, -1.0,  1.0, 1.0, -1.0, 1.0,  1.0]), gl.STATIC_DRAW);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
        this.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
        //gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1.0,-1.0,1.0,-1.0,-1.0,1.0,-1.0,1.0,1.0,-1.0,1.0,1.0]),gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        this.initTextures();
        //this.test();
    },
    initTextures:function(){
        this.leftTexture=this.createTexture();
        this.rightTexture=this.createTexture();
        this.frameTexture=this.createTexture();
        this.frameTexture2=this.createTexture();
        //this.test();
        manage.console.log("GL_summer:","loaded");
        this.inited = true;
        
    },
    loadFailed:function(error){
        manage.console.warning(error);
        control.settings.glcan.set(false);
    },
    /*createTexture:function(width, height, srcarr, bytesPerValue) {
        var packValue = function(value, bytesPerValue) {
            var bytes = []
            var radixMax = 0.0;
            var place = 0;
            for (var i = bytesPerValue; i > 0; --i) {
                radixMax = Math.pow(256.0, i - 1);
                place = (bytesPerValue - i);
                if (value >= radixMax) {
                    bytes[place] = Math.floor(value / radixMax);
                    value = value % radixMax;
                } else {
                    bytes[place] = 0;
                }
            }
            if (value > 0)
                throw "overflow in packValue to texture"
            //last byte, alpha value has to be 255					
            bytes.push(255);
            return bytes;
        };
        var pack = function(val) {
            var intval=val*(1024*16);
            var bytes = [0,0,0,0];
            for(var i=0;i<4;i++){
                bytes[3-i]=Math.floor(intval%256);
                intval/=256;
            }
            return bytes;
        };

        var array=new Uint8Array(width*height*4);
        for(var i=0;i<height;i++){
            //var row = elements[i];
            var rowOffset = (i * width);
            for(var j=0;j<width;j++){
                var offset = rowOffset + j;
                var packed=pack(srcarr[offset],bytesPerValue);
                for(var k=0;k<4;k++){
                    array[4*offset+k]=packed[k];
                }
            }
        }
        return this.createTextureTA(array,width,height);
    },*/
    createTexture: function() {
        var gl = this.g1,texture;
        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        //manage.console.debug("createTexture: arg is type "+(typeof typedArray));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    },
    updateTexture: function(texture,typedArray,width,height){
        var gl = this.g1;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,width,height,0, gl.RGBA, gl.UNSIGNED_BYTE, typedArray);
        gl.bindTexture(gl.TEXTURE_2D, null);
    },
    /*creaupdateTexture:function(typedArray,width,height){
        var gl = this.g1;
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        //manage.console.debug("createTexture: arg is type "+(typeof typedArray));
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,width,height,0, gl.RGBA, gl.UNSIGNED_BYTE, typedArray);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    },*/
    createFramebuffer: function(texture, width, height) {
        var gl = this.g1,
        globalRenderBufferId = gl.createRenderbuffer(),
        globalFbo = gl.createFramebuffer();

        gl.bindRenderbuffer(gl.RENDERBUFFER, globalRenderBufferId);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.isRenderbuffer(globalRenderBufferId);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        gl.bindFramebuffer(gl.FRAMEBUFFER, globalFbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, globalRenderBufferId);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        
        return globalFbo;
    },
    /*unpackTexture: function(pixels, width, height, bytesPerValue) {
        var unnpack = function(bytes) {
            var value = 0.0;
            //ignore final byte which is always 255
            for (var i = 0; i < bytes.length; ++i) {
                value += bytes[i] * Math.pow(256, (bytes.length - 1) - i);
            }
            return value;
        };
        var unpack = function(bytes) {
                var value = (bytes[0]*65536+bytes[1]*256+bytes[2])*256+bytes[3];
                return value/(1024*16);
            };
        var desarr=new Float32Array(width*height);
        for (var i = 0; i < height; i++) {
            for (var k = 0; k < width; k++) {
                var begin = (i * width +k) * bytesPerValue;
                var end = begin + bytesPerValue;
                if ("length" in pixels) {
                    if (!(end <= pixels.length))
                        throw "dimensions wrong in unpackTexture";
                    desarr[i*width+k]=unpack([pixels[begin],pixels[begin+1],pixels[begin+2],pixels[begin+3]]);
                }else{
                    manage.console.error("No length");
                }
            }
            
        }
        return desarr;
    },*/
    preadd:function(space1,space2,periods){
        //var gl = this.g1,
        var width,height;
        if(!this.inited){return false;}
        this.periods=periods;
        width=space1.dims[0];
        height=space1.dims[1];
        if(width!==this.last.width||height!==this.last.height){
            manage.console.debug("Gl_summer:","resize conducted");
            this.resize(width,height);
            this.pixels = new Uint8Array(width* height * 4);
            this.updateTexture(this.frameTexture,this.pixels,width,height);
            this.updateTexture(this.frameTexture2,this.pixels,width,height);
            this.framebuffer = this.createFramebuffer(this.frameTexture, width, height); 
            this.framebuffer2 = this.createFramebuffer(this.frameTexture2, width, height); 
        }
        this.updateTexture(this.frameTexture,space1.getArr(),width,height);
        if(this.last.rightarr!==space2.getArr()){
            width=space2.dims[0];
            height=space2.dims[1];
            this.updateTexture(this.rightTexture,space2.getArr(),width,height);
            this.last.rightarr=space2.getArr();
        }
        this.tick=true;
        //gl.bindFramebuffer( gl.FRAMEBUFFER, this.framebuffer);
        
    },
    add:function(pos){
        //var gl = this.g1;
        /*if(!this.inited){return null;}
        var width=space1.dims[0];
        var height=space1.dims[1];
        if(width!==this.last.width||height!==this.last.height){
            manage.console.debug("Gl_summer: resize conducted");
            this.resize(width,height);
            this.pixels = new Uint8Array(width* height * 4);
            this.updateTexture(this.frameTexture,this.pixels,width,height);
            this.framebuffer = this.createFramebuffer(this.frameTexture, width, height); 
        
        }
        this.updateTexture(this.leftTexture,space1.getArr(),width,height);
        if(this.last.rightarr!==space2.getArr()){
            this.updateTexture(this.rightTexture,space2.getArr(),width,height);
            this.last.rightarr=space2.getArr();
        }*/
        //var leftTexture = this.createTexture(width, height, space1.spacearr);
        //var rightTexture = this.createTexture(width, height, space2.spacearr);
        
        if(this.tick){
            this.calculateFrame(this.framebuffer2, this.frameTexture, this.rightTexture,pos);
        }else{
            this.calculateFrame(this.framebuffer, this.frameTexture2, this.rightTexture,pos);
        }
        this.tick=!this.tick;
        /*gl.bindFramebuffer( gl.FRAMEBUFFER, this.framebuffer);
        gl.readPixels(0, 0, this.last.width, this.last.height, gl.RGBA, gl.UNSIGNED_BYTE, this.pixels);
        gl.bindFramebuffer( gl.FRAMEBUFFER, null);
        this.updateTexture(this.frameTexture,this.pixels,this.last.width, this.last.height);*/
        return;
        //return this.unpackTexture(pixels, width, height, 4);
    },
    postadd:function(space1){
        var gl = this.g1,
        width,height;
        //gl.bindFramebuffer( gl.FRAMEBUFFER, null);
        width=space1.dims[0];
        height=space1.dims[1];
        if(this.tick){
            gl.bindFramebuffer( gl.FRAMEBUFFER, this.framebuffer);
        }else{
            gl.bindFramebuffer( gl.FRAMEBUFFER, this.framebuffer2);
        }
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, space1.getArr());
        gl.bindFramebuffer( gl.FRAMEBUFFER, null);
        
    },
    calculateFrame: function(framebuffer, textureOne, textureTwo,pos) {
        var gl = this.g1;
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
        gl.vertexAttribPointer(this.program.positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.vertexAttribPointer(this.program.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureOne);
        gl.uniform1i(this.program.mainTexLoc, 0);
        //gl.uniform1f(this.program.randomUniform, 1);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textureTwo);
        gl.uniform1i(this.program.blobTexLoc, 1);
        
        //manage.console.debug(pos);
        //manage.console.error("prepos: "+gl.getError());
        gl.uniform3fv(this.program.posLoc,pos);
        /*var errcode=gl.getError();
        for(var prop in gl){
            if(gl[prop]===errcode){
                manage.console.error("Pos: "+prop);
                break;
            }
        }*/
        gl.uniform2f(this.program.periodsLoc,this.periods[0],this.periods[1]);
        //gl.uniform1f(this.program.canvasWidthLoc, canvasWidth);
        //gl.uniform1f(this.program.canvasHeightLoc, canvasHeight);

        //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, BUFFERS.cubeVertexIndexBuffer);
        //gl.drawElements(gl.TRIANGLES, BUFFERS.cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);


        //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    /*test:function(){
        var width=32*8;
        var height=width;
        var space1=compute.sum_hill.createSpace([width,height],2); 
        var space2=compute.sum_hill.createSpace([width,height],2);
        for(var i=0;i<width*height;i++){
            //space1.spacearr[i]=Math.floor(Math.random()*255);
            space1.spacearr[i]=100000;
            space2.spacearr[i]=i;
        }
        $("#all").append(this.$can);
        if(false){
            this.resize(width,height);
            var gl = this.g1;
            
            var resarr=new Uint8Array(4*width*height);
            var framebuffer = this.createFramebuffer(this.createTextureFromCanvas(resarr,width,height) , width, height);
            var pixels = new Uint8Array(width* height * 4);
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
            gl.vertexAttribPointer(this.program.positionLocation, 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
            gl.vertexAttribPointer(this.program.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            var texture1=this.createTexture(width,height,space1.spacearr,3);
            var texture2=this.createTexture(width,height,space2.spacearr,3);
            //var texture=this.createTexture(2,2,new Uint32Array([0,254,50000,10000000]),3);
            gl.bindTexture(gl.TEXTURE_2D, texture1);
            gl.uniform1i(this.program.srcUniformLoc, 0);
            gl.uniform1f(this.program.randomUniform, 1);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, texture2);
            gl.uniform1i(this.program.randLoc, 1);

            gl.uniform1f(this.program.canvasWidthLoc, width);
            gl.uniform1f(this.program.canvasHeightLoc, height);

            //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, BUFFERS.cubeVertexIndexBuffer);
            //gl.drawElements(gl.TRIANGLES, BUFFERS.cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer);
            gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            gl.bindFramebuffer( gl.FRAMEBUFFER, null);
            result=this.unpackTexture(pixels, width, height, 4);
            //result=pixels;
        }
        if(false){
            var unpack = function(bytes) {
                var value = (bytes[0]*65536+bytes[1]*256+bytes[2])/Math.pow(10,bytes[3]-127);
                return value;
            };
            var pack = function(value) {
                var dec=getDecim(value);
                var bytes = [0,0,0,0];
                var intval=Math.floor(value*Math.pow(10,dec));
                bytes[0]=Math.floor(intval/65536);
                intval-=bytes[0]*65536;
                bytes[1]=Math.floor(intval/256);
                intval-=bytes[1]*256;
                bytes[2]=Math.floor(intval);
                bytes[3]=dec+127;
                return bytes;
            };
            var getDecim=function(value){
                var limit=256.0*65536.0;
                //return 0;
                for(var d=0;d<120;d++){
                    if(value>limit){return d-1;}
                    value*=10.0;
                }
                return 0;
            };
            var vals=[255,1256,12589,352658,17171717,12.125,0.0002,0.00000001];
            for(var i=0;i<vals.length;i++){
                var val=vals[i];
                var packed=pack(val);
                manage.console.debug(val+" = "+unpack(packed)+" ["+packed+"]");
            }
        }
        var but=$("<button>")
        .click(function(){
            result=compute.sum_hill_gl.add_gl(space1,space2,1000);
            manage.console.debug("Test was done");
        })
        .html("Test");
        $("#all").append(but);
    }*/
    /*test:function(){
        var but,key,canvas;
        but=$("<button>")
        .click(function(){
            for(key in compute.sum_hill.blobs){
                canvas=compute.sum_hill.blobs[key].print();
                $("#all").append(canvas);
            }
        })
        .html("Test");
        $("#all").append(but);
    }*/
});
// @license-end