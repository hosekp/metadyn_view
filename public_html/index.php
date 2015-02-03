<!DOCTYPE html>
<?php
if($_SERVER['REMOTE_ADDR'] != "127.0.0.1"){
    require_once('../../counter/conn.php');
    require_once('../../counter/counter.php');
    updateCounter("page name"); // Updates page hits
    updateInfo(); // Updates hit info
}
?>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Metadynamic viewer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="img/favicon.ico" rel="shortcut icon" sizes="16x16 32x32 64x64" type="image/vnd.microsoft.icon">
        <link href="style/style.css" rel="stylesheet" type="text/css" media="screen" />
        <link href="style/leftp.css" rel="stylesheet" type="text/css" media="screen" />
        <link href="style/axictrl.css" rel="stylesheet" type="text/css" media="screen" />
        <script>
        /**
         * @licstart  The following is the entire license notice for the 
         * JavaScript code in this page.
         * 
         * Copyright (C) 2014  Petr Hošek
         * 
         * The JavaScript code in this page is free software: you can
         * redistribute it and/or modify it under the terms of the GNU
         * General Public License (GNU GPL) as published by the Free Software
         * Foundation, either version 3 of the License, or (at your option)
         * any later version.  The code is distributed WITHOUT ANY WARRANTY;
         * without even the implied warranty of MERCHANTABILITY or FITNESS
         * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
         * 
         * As additional permission under GNU GPL version 3 section 7, you
         * may distribute non-source (e.g., minimized or compacted) forms of
         * that code without the copy of the GNU GPL normally required by
         * section 4, provided you include this license notice and a URL
         * through which recipients can access the Corresponding Source.   

         * @licend  The above is the entire license notice
         * for the JavaScript code in this page. 
         */
        </script>
        <script type="text/javascript" src="js/libs/mustache.js/mustache.js"></script>
        <script type="text/javascript" src="js/libs/jquery/jquery-2.1.1.js"></script>
        <script type="text/javascript" src="js/libs/jquery/watermark.js"></script>
        <script type="text/javascript" src="js/libs/stats.js/Stats.js"></script>
        <script type="text/javascript" src="js/compute/reader.js"></script>
        <script type="text/javascript" src="js/compute/parser.js"></script>
        <script type="text/javascript" src="js/compute/sum_hill.js"></script>
        <script type="text/javascript" src="js/compute/tspace.js"></script>
        <script type="text/javascript" src="js/compute/tspace1.js"></script>
        <script type="text/javascript" src="js/compute/tspace2.js"></script>
        <script type="text/javascript" src="js/compute/axi.js"></script>
        <script type="text/javascript" src="js/compute/gl_summer.js"></script>
        <script type="text/javascript" src="js/manage/console.js"></script>
        <script type="text/javascript" src="js/manage/manager.js"></script>
        <script type="text/javascript" src="js/manage/storage.js"></script>
        <script type="text/javascript" src="js/manage/tests.js"></script>
        <script type="text/javascript" src="js/view/ctrl_view.js"></script>
        <script type="text/javascript" src="js/view/axi_view.js"></script>
        <script type="text/javascript" src="js/view/exporter.js"></script>
        <script type="text/javascript" src="js/view/lang.js"></script>
        <script type="text/javascript" src="js/view/left_panel.js"></script>
        <script type="text/javascript" src="js/control/settings.js"></script>
        <script type="text/javascript" src="js/control/control.js"></script>
        <script type="text/javascript" src="js/control/gestures.js"></script>
        <script type="text/javascript" src="js/control/feedback.js"></script>
        <script type="text/javascript" src="js/control/measure.js"></script>
        <script type="text/javascript" src="js/draw/webgl.js"></script>
        <script type="text/javascript" src="js/draw/liner.js"></script>
        <script type="text/javascript" src="js/draw/raster.js"></script>
        <script type="text/javascript" src="js/draw/drawer.js"></script>
        <script type="text/javascript" src="js/draw/path.js"></script>
        <script type="text/javascript">
            if(window.view===undefined){var view={};}
            if(view.panel===undefined){view.panel={};}
            view.panel.count=<?php echo $unique_visitors; ?>;
        </script>
    </head>
    <body>
        <div id="all">
            <a href="docs/licences.html" rel="jslicense" style="display:none">JavaScript License Information</a>
            <div id="leftp">
                
            </div>
            <div id="cont">
                <div id="file_cont" class="incont"></div>
                <div id="main_cont" class="incont">
                    <div id="canvas_cont" class="axi_all">
                        <div id="middle_can_text">
                            <noscript>
 For full functionality of this site it is necessary to enable JavaScript.
 Here are the <a href="http://www.enable-javascript.com/" target="_blank">
 instructions how to enable JavaScript in your web browser</a>.</noscript> 
                        </div>
                    </div>
                </div>
                <div id="slide_cont" class="incont"></div>
                <div id="ctrl_cont" class="incont"></div>
                <div id="tooltip"></div>
            </div>
            <div id="side"></div>
            <!--<div style="width:100%;height:1px;"></div>-->
            <div id="cons"></div>
            <!--<div id="feed_cont"></div>-->
        </div>
    </body>
</html>
