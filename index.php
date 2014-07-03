<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link href="style/style.css" rel="stylesheet" type="text/css" media="screen" />
        <!--<link rel="shortcut icon" href="img/erbs/ico3.ico" />-->
        <!--<script type="text/javascript" src="js/lib/closure-library/closure/goog/base.js"></script>-->
        <script type="text/javascript" src="js/lib/jquery_v2.1.1.js"></script>
        <script type="text/javascript" src="js/lib/stats.js"></script>
        <script type="text/javascript" src="js/lang.js"></script>
        <script type="text/javascript" src="js/main.js"></script>
        <script type="text/javascript" src="js/graf.js"></script>
        <!--<script type="text/javascript" src="js/menu.js"></script>-->
        <title></title>
    </head>
    <body>
        <div id="content">
            <div id="inputs">
                <input type="file" id="file" />
                <input id="start" type="button" value="Start" />
                <input id="reset" type="button" value="Reset" />
                <!--<input id="walker" type="button" value="Reset" />-->
            </div>
            <canvas id="canvas" width="500" height="500"></canvas>
            <canvas id="lincan" width="500" height="500"></canvas>
            <canvas id="axis" width="530" height="530"></canvas>
            <div id="console"></div>
            <div id="slider"></div>
            <div id="left">
                <div id="measure"></div>
                <div id="settings"></div>
                <div id="examples"></div>
            </div>
        </div>
        <script id="2d-vertex-shader" type="x-shader/x-vertex">
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            //uniform vec2 u_resolution;
            varying vec2 v_texCoord;
            void main() {
                gl_Position = vec4((a_position*2.0-1.0)*vec2(1,-1), 0, 1);
                v_texCoord = a_texCoord;
            }
        </script>
        <script id="2d-fragment-shader" type="x-shader/x-fragment">
            precision mediump float;
            uniform sampler2D u_image;
            //uniform vec2 u_sigmas;
            //uniform vec3 u_data;
            //uniform vec2 u_textureSize;
            varying vec2 v_texCoord;
            vec4 colorScale(float d){
                //d=1.0-d;
                /*if(d<0.5){
                    if(d<0.25){return vec4(0,4.0*d,1,1);}else{return vec4(0,1,2.0-d*4.0,1);}
                }else{
                    if(d<0.75){return vec4(d*4.0-2.0,1,0,1);}else{return vec4(1,4.0-d*4.0,0,1);}
                }*/
                //d=d/255.0;
                float sigma=1000.0/255.0;
                float hei = 380.0/255.0;
                //return vec4(max(1.0-(0.9-d)*(0.9-d)*sigma,0.0),max(1.0-(0.5-d)*(0.5-d)*sigma,0.0),max(1.0-(0.1-d)*(0.1-d)*sigma,0.0),1);
                return vec4(
                  min(max(hei-abs(d-0.23)*sigma,0.0),1.0),
                  min(max(hei-abs(d-0.49)*sigma,0.0),1.0),
                  min(max(hei-abs(d-0.77)*sigma,0.0),1.0),
                  1);
            }
            void main() {
                //vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
                gl_FragColor = colorScale(texture2D(u_image,v_texCoord)[3]);
                //gl_FragColor = texture2D(u_image,v_texCoord);
                //gl_FragColor = vec4(1.0,0.0,0.0,1.0);
            }
        </script>
        <script type="text/javascript">
            main.init();
        </script>
    </body>
</html>
