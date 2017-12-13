/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
 * Copyright (C) 2014  Petr Hošek
 */
if (window.view === undefined) {
  var view = {};
}
if (view.ctrl === undefined) {
  view.ctrl = {};
}
$.extend(view.ctrl, {
  template: "",
  div: null,
  tooltipdiv: null,
  tooldelay: false,
  ctrlRequested: false,
  width: null,
  height: null,
  listeners: [],
  inited: false,
  resizing: false,  // event
  temp: {
    resizepos: false,
    resoldata: [16, 64, 128, 256, 512],
    speeddata: [0.01, 0.03, 0.1, 0.3, 1, 3, 10, 30, 100]
  },
  tips: {
    play: "Play",
    stop: "Stop",
    settings: "Settings",
    measure: "Measure",
    loop: "Loop",
    resize: "Resize",
    glwant: "WebGL",
    resol: "Resolution",
    reset: "Reset",
    // pict: "Picture",
    slider: "Slider",
    speed: "Speed",
    SVG: ["Export as","SVG"],
    PNG: ["Export as","PNG"],
    TXT: ["Export as","TXT"],
    resolution: "Current resolution of plot"
  },
  //settings:{play:false,measure:false,loop:true,resize:false,resol:100},  // temporary
  init: function () {
    var sett = control.settings;
    this.div = $("#ctrl_cont");
    this.tooltipdiv = $("#tooltip");
    this.slide.init();
    $.get("templates/ctrl.html", $.proxy(function (data) {
      this.template = data;
      this.redraw();
      this.bind();
      var $cont = $("#main_cont");
      this.width = $cont.width();
      this.height = $cont.height();
      this.inited = true;
    }, this), "text");
    control.control.everytick(this, "render");
    control.control.everytick(this, "resize");
    sett.play.subscribe(this, "draw");
    sett.loop.subscribe(this, "draw");
    sett.glwant.subscribe(this, "draw");
    sett.measure.subscribe(this, "draw");
    sett.resol.subscribe(this, "draw");
    sett.speed.subscribe(this, "draw");

  },
  getSettings: function () {
    var sett = control.settings;
    return {
      play: sett.play.get()?" on":"",
      stop: sett.play.get()?"":" on",
      measure: sett.measure.get() ? "on" : "",
      loop: sett.loop.get() ? "on" : "",
      resol: sett.resol.get(),
      resize: (!!this.temp.resizepos) ? "on" : "",
      speed: sett.speed.get(),
      webgl: sett.glwant.get() ? "on" : "",
      settings: sett.sett_view.get() ? " on" : ""
    };
  },
  render: function () {
    if (this.ctrlRequested) {
      var vars = {
          export_lang: Lang("Export"),
          sett: this.getSettings()
        },
        rendered = Mustache.render(this.template, vars);
      this.div.html(rendered);
      this.writeImageDimension();
      //manage.console.debug("CTRL redrawed");
      this.ctrlRequested = false;
    }
  },
  redraw: function () {
    if (this.ctrlRequested) {
      return;
    }
    this.ctrlRequested = true;
  },
  bind: function () {
    //var thisctrl=this;
    this.div
        .on("click", "div.ctrl", $.proxy(function (event) {
          var ctrl, ctrlSel, val, template, data, obj, rendered, sett;
          sett = control.settings;
          ctrl = event.currentTarget.getAttribute("data-ctrl");
          //alert(ctrl);
          if(ctrl=== "resolution"){
            return;
          }else
          if (ctrl === "resol" || ctrl === "speed") {
            ctrlSel = $("#ctrl_select");
            if (ctrlSel.is(":visible")) {
              ctrlSel.hide();
              return;
            }
            this.temp.$ctrlSel = ctrlSel;
            if (ctrl === "resol") {
              val = sett.resol.get();
              template = '{{#poss}}<div class="sel {{sel}}" data-val={{val}}>{{val}}px</div>{{/poss}}';
              data = this.temp.resoldata;
            } else if(ctrl === "speed") {
              val = sett.speed.get();
              template = '{{#poss}}<div class="sel {{sel}}" data-val={{val}}>{{val}} x</div>{{/poss}}';
              data = this.temp.speeddata;
            }
            obj = this.preMustache(data, val);
            //resoldata=$.extend({},this.temp.resoldata);
            rendered = Mustache.render(template, {poss: obj});
            //$(rendered).val(val);
            this.summonSelect(event.currentTarget, rendered, function (event) {
              var picked = event.target.getAttribute("data-val");
              if(ctrl==="speed" || ctrl === "resol"){
                picked = parseFloat(picked);
              }
              sett[ctrl].set(picked);
              $("#ctrl_select").hide();
            });
            //control.settings.resol.set((val)%500+100);
          }else
          if (ctrl === "resize") {
          }else
          if (ctrl === "loop" || ctrl === "measure" || ctrl === "glwant") {
            sett[ctrl].toggle();
          }else
          if(ctrl === "play"){
            sett.play.toggle();
          }else
          if(ctrl === "stop"){
            sett.play.set(false);
          }else
          if(ctrl === "settings"){
            view.sett_view.toggle();
          }else
          if (ctrl === "reset") {
            control.control.reset();
          }else
          if(["PNG","SVG","TXT"].indexOf(ctrl)>-1){
            sett.export.set(ctrl);
          }

        }, this))
        .on("mousedown", "#resize_ctrl", $.proxy(function (event) {
          //this.settings.resize=true;
          var div = $("#main_cont");
          var $overlayDiv = $("<div class='drag-overlay'>").appendTo("body");
          this.stopTip();
          this.temp.resizepos = {x: event.pageX - div.width(), y: event.pageY - div.height()};
          $($overlayDiv)
              //.append($overlayDiv)
              .on("mousemove", $.proxy(function (event) {
                this.resizing = event;
                this.stopTip();
              }, this))
              .on("mouseup", $.proxy(function (event) {
                //this.settings.resize=false;
                this.temp.resizepos = false;
                this.redraw();
                //this.resize(event);
                $("body").off("mousemove").off("mouseup").off("mouseout");
                $overlayDiv.remove();
              }, this));
          /*$("body").on("mouseout",$.proxy(function(event){
           this.render();
           this.resize(event);
           this.settings.resize=false;
           $("body").off("mousemove");
           $("body").off("mouseup");
           $("body").off("mouseout");
           },this));*/
          this.redraw();


        }, this));
    this.bindTips(this.div, this.tips);
  },
  preMustache: function (arr, val) {
    var data = [], i;
    for (i = 0; i < arr.length; i += 1) {
      data.push({val: arr[i], sel: val === arr[i] ? "on" : ""});
    }
    return data;
  },
  summonSelect: function (ctrl, rendered, callback) {
    var div = this.temp.$ctrlSel,
        off = $(ctrl).position();
    div.css({"left": off.left + "px"});
    div.html(rendered);
    div.show();
    div.children("div").click(callback);
  },
  resize: function (optWid, optHei) {
    var wid, hei, sqdif;
    if (optHei === undefined) {
      if (this.resizing === false) {
        return;
      }
      wid = Math.max(400, this.resizing.pageX - this.temp.resizepos.x);
      hei = Math.max(300, this.resizing.pageY - this.temp.resizepos.y);
    } else {
      wid = optWid;
      hei = optHei;
    }
    sqdif = view.axi.isSquare(wid, hei);
    if (sqdif !== 0) {
      wid -= sqdif;
      hei += sqdif;
    }
    this.width = wid;
    this.height = hei;
    $("#cont").css({width: wid + "px"});
    $("#main_cont").css({height: hei + "px"});
    view.axi.notify("arrange");
    this.writeImageDimension();
    //this.call("resize");
    /*view.axi.needArrange=true;
     view.ctrl.slide.render();
     control.gestures.needRecompute=true;
     control.control.needRedraw=true;*/
    this.resizing = false;
  },
  writeImageDimension: function () {
    this.div.find("#image_size_info_numbers").text(this.width+" x "+this.height);
  },
  bindTips: function (div, tips) {
    div
        .on("mouseover", ".tip", $.proxy(function (event) {
          //var ctrl=$(event.currentTarget).attr("data-ctrl");
          var tar = event.currentTarget;
          this.tooldelay = setTimeout(function () {
            view.ctrl.showTooltip(tar, tips);
          }, 1500);
        }, this))
        .on("mouseout", "div.ctrl", $.proxy(this.stopTip, this));

  },
  showTooltip: function (ctrldiv, tips) {
    var ctrl, off,
        $ctrl = $(ctrldiv);
    if ($ctrl.is(":hidden")) {
      return;
    }
    ctrl = $ctrl.attr("data-ctrl");
    off = $ctrl.offset();
    //manage.console.debug(ctrl,"offset=",off.left,off.top);
    this.tooltipdiv.css({"left": Math.floor(off.left) + "px", "top": Math.floor(off.top + 25) + "px"});
    this.tooltipdiv.html(Lang(tips[ctrl]));
    this.tooltipdiv.show();
  },
  stopTip: function () {
    if (this.tooldelay !== false) {
      clearTimeout(this.tooldelay);
      this.tooldelay = false;
      this.tooltipdiv.hide();
    }
  },
  notify: function (args) {
    if (args === "draw") {
      this.ctrlRequested = true;
    }
    if (args === "render") {
      this.render();
    }
    if (args === "resize") {
      this.resize();
    }
  }
});
view.ctrl.slide = {
  eventpos: null,
  ctrl: view.ctrl,
  slider: null,
  $slideFill: null,
  $input: null,
  template: "",
  restWidth: 102,
  ratio: 0.0,
  redrawRequested: true,
  init: function () {
    $.get("templates/slide.html", $.proxy(function (data) {
      var rendered = Mustache.render(data, {left: this.left()});
      this.template = data;
      this.cont = $("#slide_cont").html(rendered);
      //this.render();
      this.slider = $("#slider");
      this.$input = $("#slide_input");
      this.$slideFill = $("#slide_fill");
      // this.cont = $("#slide_cont");
      this.bind();
      control.control.everytick(this, "render");
    }, this), "text");
    view.axi.subscribe(this, "resize");
  },
  left: function () {
    return Math.round((this.ctrl.width - this.restWidth) * this.ratio);
  },
  toratio: function (val) {
    return Math.max(Math.min(val / (this.ctrl.width - this.restWidth), 1), 0);
  },
  byratio: function (val) {
    this.ratio = val;
    this.redraw();
  },
  redraw:function () {
    this.redrawRequested = true;
  },
  render: function () {
    if(!this.redrawRequested) return;
    //manage.console.debug("left="+left);
    //this.left=lft;
    //div.css("left",lft);
    var lft = this.ratio * (this.ctrl.width - this.restWidth);
    //lft = Math.max(Math.min(lft, this.ctrl.width - this.restWidth), 0);
    //manage.console.debug("left="+lft);
    if (this.slider === null) {
      this.slider = $("#slider");
    }
    if (this.$slideFill === null) {
      this.$slideFill = $("#slide_fill");
    }
    this.slider.css("left", lft);
    this.$slideFill.css("width", lft);
    if (this.$input === null) {
      this.$input = $("#slide_input");
    }
    //var ratio = this.toratio(lft);
    var time = compute.sum_hill.getClockByRatio(this.ratio);
    this.$input.val(time + " ps");
    this.redrawRequested = false;
    // this.$input.val(percent + " %");
    // this.move(this.left());
  },
  bind: function () {
    this.cont
        .on("mousedown", "#slider", $.proxy(function (event) {
          this.eventpos = event.pageX - $("#slider").position().left;
          control.settings.play.set(false);
          event.preventDefault();
          //view.ctrl.render();
          $("body")
              .on("mousemove", $.proxy(function (event) {
                //manage.console.debug("mouse.which="+event.which);
                //if(event.which!==1){this.mouseup(event);}
                var lft = event.pageX - this.eventpos,
                    ratio = this.toratio(lft);
                this.byratio(ratio);
                //control.control.set(ratio);
                //this.move(lft);
                //$("#slider").css("left",Math.max(Math.min(event.pageX-this.eventpos,this.ctrl.width-10),0));
              }, this))
              .on("mouseup", $.proxy(this.mouseup, this));
        }, this))
        .on("change", "#slide_input", function (event) {
          var value = $(this).val();
          var parsed = parseFloat($(this).val());
          if (isNaN(parsed)) parsed = 0;
          if (value.substr(-1) === "%") {
            var ratio = Math.min(Math.max(parsed/100, 0), 1);
          } else {
            ratio = compute.sum_hill.getRatioByClock(parsed);
          }
          control.control.setWanted(ratio);
        });
  },
  mouseup: function (event) {
    $("body").off("mousemove").off("mouseup").off("mouseout");
    this.eventpos = false;
    control.control.setWanted(this.ratio);

  },
  notify: function (args) {
    if (args === "resize") {
      this.redraw();
    }
    if(args === "render"){
      this.render();
    }
  }
};
// @license-end
