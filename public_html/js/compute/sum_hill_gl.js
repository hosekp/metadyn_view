if (typeof compute === "undefined") {
    compute = {};
}
if (typeof compute.sum_hill === "undefined") {
    compute.sum_hill = {};
}
$.extend(compute.sum_hill, {
    msi: 2.8, // const - multiple of sigma   2=95%
    blobs: {},
    inited: false,
    g1: null,
    init: function() {
        var ret = this.initGL();
        if (!ret) {
            return false;
        }
        this.getShader("add2-vertex.shd", "vertex");
        this.getShader("add2-fragment.shd", "fragment");

        this.inited = false;
    },
    initGL: function() {
        var $can = $("<canvas>");
        try {
            var gl = $can[0].getContext("webgl") || $can[0].getContext("experimental-webgl");
            //gl = getWebGLContext(main.div.canvas[0]);
        } catch (e) {
            manage.console.error(e);
            return false;
        }
        if (!gl) {
            manage.console.error("Could not initialise WebGL, sorry :-( ");
            return false;
        }
        //gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.g1 = gl;
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
    },
    add: function(space, torat) {
        var resol = control.settings.resol.get();
        if (!this.blobs[resol]) {
            this.blobs[resol] = this.createBlob(resol);
        }
        var blob = this.blobs[resol];
        var ncv = this.ncv;
        var last = this.locate(space.ratio);
        var to = this.locate(torat);
        var periods = this.isPeriodic();
        //manage.console.debug("Add from "+last+" to "+to);
        var anyperiod = false;
        for (var i = 0; i < this.ncv; i++) {
            if (periods[i]) {
                anyperiod = true;
                break;
            }
        }
        var inds;
        var divis;
        if (anyperiod) {
            for (var i = last; i < to; i++) {
                inds = this.toIndices(i);
                divis = space.add(inds, blob);
                if (this.ncv === 1) {
                    var ind1 = inds[0];
                    if (divis[0]) {
                        space.add([ind1 - 1], blob);
                    }
                    if (divis[1]) {
                        space.add([ind1 + 1], blob);
                    }
                } else if (this.ncv === 2) {
                    var ind1 = inds[0];
                    var ind2 = inds[1];
                    if (divis[0]) {
                        space.add([ind1 + 1, ind2], blob);
                        if (divis[2]) {
                            space.add([ind1, ind2 + 1], blob);
                            space.add([ind1 + 1, ind2 + 1], blob);
                        } else
                        if (divis[3]) {
                            space.add([ind1, ind2 - 1], blob);
                            space.add([ind1 + 1, ind2 - 1], blob);
                        }
                    } else
                    if (divis[1]) {
                        space.add([ind1 - 1, ind2], blob);
                        if (divis[2]) {
                            space.add([ind1, ind2 + 1], blob);
                            space.add([ind1 - 1, ind2 + 1], blob);
                        } else
                        if (divis[3]) {
                            space.add([ind1, ind2 - 1], blob);
                            space.add([ind1 - 1, ind2 - 1], blob);
                        }
                    } else {
                        if (divis[2]) {
                            space.add([ind1, ind2 + 1], blob);
                        } else
                        if (divis[3]) {
                            space.add([ind1, ind2 - 1], blob);
                        }
                    }
                } else if (this.ncv === 3) {
                    manage.console.warning("Sum_hills: Add3 not implemented");
                } else {

                }
            }
        } else {
            for (var i = last; i < to; i++) {
                var inds = this.toIndices(i);
                space.add(inds, blob);
            }
        }
        space.ratio = torat;
        //manage.console.debug("Added "+(to-last)+" frames");
        return space;
    },
    getShader: function(id, typ) {
        $.get("shaders/" + id, $.proxy(function(str) {
            this.initShader(str, typ);
        }, this), "text");
    },
    initShader: function(str, typ) {
        var gl = this.g1;
        if (typ === "vertex") {
            var shader = gl.createShader(gl.VERTEX_SHADER);
        } else if (typ === "fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else {
            return null;
        }
        gl.shaderSource(shader, str);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            manage.console.error(gl.getShaderInfoLog(shader));
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
        var gl = this.g1;
        var progr = gl.createProgram();
        this.program = progr;
        gl.attachShader(progr, this.vertex);
        gl.attachShader(progr, this.fragment);
        gl.linkProgram(progr);
        if (!gl.getProgramParameter(progr, gl.LINK_STATUS)) {
            manage.console.error("Unable to initialize the shader program.");
            return false;
        }
        gl.useProgram(progr);
        this.initParam();
        this.initBuffers();
        return true;
    },
    initParam: function() {
        var gl = this.g1;
        var progr = this.program;
        progr.positionLocation = gl.getAttribLocation(progr, "a_position");
        gl.enableVertexAttribArray(progr.positionLocation);

        progr.texCoordLocation = gl.getAttribLocation(progr, "a_texCoord");
        gl.enableVertexAttribArray(progr.texCoordLocation);

        progr.srcUniformLoc = gl.getUniformLocation(progr, "src");
        progr.randomUniformLoc = gl.getUniformLocation(progr, "randomOffset");
        progr.randLoc = gl.getUniformLocation(progr, "rand");
        progr.canvasWidthLoc = gl.getUniformLocation(progr, "canvasWidth");
        progr.canvasHeightLoc = gl.getUniformLocation(progr, "canvasHeight");

    },
    initBuffers: function() {
        var gl = this.g1;
        this.coordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
        //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0,  1.0, -1.0,  1.0, 1.0, -1.0, 1.0,  1.0]), gl.STATIC_DRAW);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
        this.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
        //gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1.0,-1.0,1.0,-1.0,-1.0,1.0,-1.0,1.0,1.0,-1.0,1.0,1.0]),gl.STATIC_DRAW);
        this.initTextures();
    },
    initTextures: function() {
        var gl = this.g1;
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
        this.inited = true;
    },
    calculateFrame: function(framebuffer, textureOne, textureTwo, canvasWidth, canvasHeight) {
        var gl = this.g1;
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
        gl.vertexAttribPointer(this.program.positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.vertexAttribPointer(this.program.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureOne);
        gl.uniform1i(this.program.srcUniformLoc, 0);
        gl.uniform1f(this.program.randomUniform, 1);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textureTwo);
        gl.uniform1i(this.program.randLoc, 1);

        gl.uniform1f(this.program.canvasWidthLoc, canvasWidth);
        gl.uniform1f(this.program.canvasHeightLoc, canvasHeight);

        //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, BUFFERS.cubeVertexIndexBuffer);
        //gl.drawElements(gl.TRIANGLES, BUFFERS.cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);


        //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },
    createtexture:function(width, height, srcarr, bytesPerValue) {
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
        var array=new Uint8Array(width*height*4);
        for(var i=0;i<height;i++){
            //var row = elements[i];
            var rowOffset = (i * width);
            for(var j=0;j<width;j++){
                var offset = rowOffset + j;
                var packed=packValue(srcarr[offset],bytesPerValue);
                for(var k=0;k<4;k++){
                    array[4*offset+k]=packed[k];
                }
            }
        }
        return this.createTextureFromCanvas(array);
    },
    /*createTexture: function(canvasWidth, canvasHeight, elements, bytesPerValue) {
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
            bytes.push(255)
            return bytes;
        }
        var overwrite = function(dest, offset, src) {
            for (var i = 0; i < src.length; ++i) {
                dest[offset + i] = src[i];
            }
        }

        var canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        var ctx = canvas.getContext("2d");
        var imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)

        for (var i = 0; i < elements.length; ++i) {
            var row = elements[i];
            var rowOffset = (i * row.length * 4)
            for (var k = 0; k < row.length; ++k) {
                var offset = rowOffset + (k * 4);
                overwrite(imgData.data, offset, packValue(row[k], bytesPerValue));
            }
        }
        ctx.putImageData(imgData, 0, 0);

        return this.createTextureFromCanvas(canvas);
    },*/
    createTextureFromCanvas: function(canvas) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    },
    createFramebuffer: function(texture, width, height) {
        var globalRenderBufferId = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, globalRenderBufferId);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.isRenderbuffer(globalRenderBufferId);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);


        var globalFbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, globalFbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, globalRenderBufferId);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);


        return globalFbo;
    },
    unpackTexture: function(pixels, width, height, bytesPerValue) {
        var unpack = function(bytes) {
            var value = 0.0;
            //ignore final byte which is always 255
            for (var i = 0; i < bytes.length - 1; ++i) {
                value += bytes[i] * Math.pow(256, (bytes.length - 2) - i);
            }
            return value;
        };

        var desarr=new Float32Array(width*height);
        for (var i = 0; i < height; i++) {
            for (var k = 0; k < width; k++) {
                var begin = (i * width +k) * bytesPerValue;
                var end = begin + bytesPerValue;
                if ("length" in pixels) {
                    if (!(end <= pixels.length))
                        throw "dimensions wrong in unpackTexture";
                    desarr[i*width+k]=unpack([pixels[begin],pixels[begin+1],pixels[begin+2]]);
                }else{
                    manage.console.error("No length");
                }
            }
            
        }
        return desarr;
    },
    multiply:function(space1,space2){
        if(!this.inited){return null;}
        var width=space1.dims[0];
        var height=space1.dims[1];
        this.resize(width,height);
        var resarr=new Uint8Array(4*width*height);
        var framebuffer = this.createFramebuffer(this.createTextureFromCanvas(resarr) , width, height); 
        var leftMatrix = this.createTexture(width, height, space1.spacearr, 3);
        var rightMatrix = matrix.createTexture(matrix.cols(), matrix.rows(), matrix.elements, 3);
    
        var pixels = new Uint8Array(fbcanvas.width* fbcanvas.height * 4);
        this.calculateFrame(framebuffer, leftMatrix, rightMatrix, fbcanvas.width, fbcanvas.height);
        Matrix.gl.bindFramebuffer( Matrix.gl.FRAMEBUFFER, framebuffer);
        Matrix.gl.readPixels(0, 0, fbcanvas.width, fbcanvas.height, Matrix.gl.RGBA, Matrix.gl.UNSIGNED_BYTE, pixels);
        Matrix.gl.bindFramebuffer( Matrix.gl.FRAMEBUFFER, null);

        elements = this.unpackTexture(pixels, fbcanvas.width, fbcanvas.height, 4);
    }
});
