/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(window.control===undefined){var control={};}
if(control.feedback===undefined){control.feedback={};}
$.extend(control.feedback,{
    init:function(){
        this.cont=$("#feed_cont");
        this.template='\
        {{#notes}}\n\
            <div id="feed_notes_{{id}}" class="feed_note">\n\
                <span class="feed_note_author" style="color:{{color}}">{{author}}:</span>\n\
                {{#long}}\n\
                    <span class="feed_note_short">{{short}}...</span>\n\
                {{/long}}\n\
                <span class="feed_note_{{long}}text">{{text}}</span>\n\
            </div>\
        {{/notes}}\n\
        ';
        var endtempl='\
        <div id="feed_note_cont"></div>\n\
        <div id="feed_inarea">\n\
            <input id="feed_author" class="feed_input" />\n\
            <textarea id="feed_text" class="feed_input" />\n\
            <button id="feed_send" >Send</button>\n\
        </div>\n';
        this.cont.html(endtempl);
        this.input_author=$("#feed_author");
        this.input_text=$("#feed_text");
        this.input_send=$("#feed_send").on("click",$.proxy(this.send,this));
        this.notecont=$('#feed_note_cont').on("click",".feed_note",function(){
            $(this).children(".feed_note_longtext, .feed_note_short").toggle();
        });
        this.render([]);
        this.watermark();
        this.getData();
    },
    render:function(obj){
        var rendered=Mustache.render(this.template,this.prerenderData(obj));
        this.notecont.html(rendered);
    },
    watermark:function(){
        this.input_author.Watermark("Author");
        this.input_text.Watermark("Your suggestion");
    },
    getData:function(){
        $.ajax({
            url:"../database/getData.php",
            type:"post",
            dataType:"json"
        })
        .done(function(data){
            control.feedback.render(data);
        });
    },
    send:function(){
        $.ajax({
            url:"../database/addLine.php",
            type:"post",
            dataType:"json",
            data:{
                author:this.input_author.val(),
                text:this.input_text.val()
            }
        })
        .done(function(data){
            control.feedback.render(data);
        });
        this.input_author.val("");
        this.input_text.val("");
        this.watermark();
        
    },
    prerenderData:function(data){
        for(var i=0;i<data.length;i++){
            data[i].color=this.getColor(data[i].author);
            data[i].id=i;
            if(data[i].shrt){data[i].long="long";}else{}
        }
        return {notes:data};
    },
    getColor:function(name){
        function hashCode(str) { // java String#hashCode
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
               hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            return hash;
        }
        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }
        var i=hashCode(name);
        return "#"+componentToHex((i>>16)&0xFF) + 
               componentToHex((i>>8)&0xFF) + 
               componentToHex(i&0xFF);

    }
});
// @license-end