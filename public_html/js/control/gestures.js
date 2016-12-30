/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
 * Copyright (C) 2014  Petr Hošek
 */
if (window.control === undefined) {
  var control = {};
}
if (control.gestures === undefined) {
  control.gestures = {};
}
$.extend(control.gestures, {
  $cancont: null,
  height: 0,
  width: 0,
  top: 0,
  left: 0,
  needRecompute: true,
  lastPos: null,
  lastMousepos: null,
  nowPos: null,
  button: 0,
  lease: true,
  measureOverride: false,
  init: function () {
    this.$cancont = $("#canvas_cont");
    this.bind();
    view.axi.subscribe(this, "resize");
  },
  bind: function () {
    //manage.console.debug("Measure: binded");
    $("#main_cont")
        .on("mousemove", "#canvas_cont", $.proxy(this.mousemove, this))
        .on("mousedown", "#canvas_cont", $.proxy(this.mousedown, this))
        .on("mouseup mouseout", "#canvas_cont", $.proxy(this.mouseend, this))
        //        $("#main_cont").on("click","#canvas_cont",$.proxy(this.mouseclick,this));
        .on("mousewheel DOMMouseScroll", "#canvas_cont", $.proxy(this.mousewheel, this))
        .on("contextmenu", "#canvas_cont", function () {
          return false;
        });
  },
  /*unbind:function(){
   this.$cancont.off("mousemove");
   },*/
  mousemove: function (event) {
    var mousepos, coord, pow, nposx, nposy;
    event.preventDefault();
    this.recompute();
    mousepos = {x: (event.pageX - this.left) / this.width, y: (event.pageY - this.top) / this.height};
    //manage.console.debug("Pos ["+pos.x+","+pos.y+"]");
    if (this.button === 0 && this.measureOverride) {
      coord = this.getCoord(mousepos);
      control.measure.measure(coord);
    }
    if (this.button === 1 && this.measureOverride) {
      if (this.lease === false) {
        if (Math.abs(mousepos.x - this.lastMousepos.x) > 5 / this.width || Math.abs(mousepos.y - this.lastMousepos.y) > 5 / this.height) {
          this.mouselease(event);
          //manage.console.debug("Gestures:","Released");
        } else {
          return;
        }
      }
      coord = this.getCoord(mousepos);
      control.measure.measure(coord);
    }
    if (this.button === 3 || this.button === 1 && !this.measureOverride) {
      if (this.lastMousepos !== null) {  // RMB pressed
        pow = control.settings.zoompow();
        nposx = (mousepos.x - this.lastMousepos.x) / pow + this.lastPos.x;
        nposy = (mousepos.y - this.lastMousepos.y) / pow + this.lastPos.y;
        this.setFramepos(nposx, nposy);
      }
    }
    //manage.console.debug("Pos ["+pos.x+","+pos.y+"]");
    this.nowPos = mousepos;
    return false;
  },
  mouselease: function (event) {
    this.lease = true;
    if (this.measureOverride) {
      var coord = this.getCoord(this.lastMousepos);
      control.measure.setDiff(coord);
    }
  },
  mousedown: function (event) {
    event.preventDefault();
    this.recompute();
    //manage.console.debug("Mousedown");
    event.preventDefault();
    this.lastMousepos = {x: (event.pageX - this.left) / this.width, y: (event.pageY - this.top) / this.height};
    this.lastPos = {x: control.settings.frameposx.get(), y: control.settings.frameposy.get()};
    this.lease = false;
    this.button = event.which;
    /*this.getCoord(this.lastMousepos);*/
  },
  mouseend: function (event) {
    event.preventDefault();
    //manage.console.debug("Gestures:",event.type);
    this.lastMousepos = null;
    this.lastPos = null;
    this.button = 0;
    if (this.lease === false) {
      this.mouseclick(event);
      this.lease = true;
    }
    if (this.measureOverride) {
      if (event.type === "mouseup") {
        var mousepos = {x: (event.pageX - this.left) / this.width, y: (event.pageY - this.top) / this.height};
        var coord = this.getCoord(mousepos);
      }
      control.measure.mouseEnd(coord);
    }
  },
  mousewheel: function (event) {
    var wheelup, newzoom, oldpow, pos, pow, frameposx, frameposy, delta, sett;
    sett = control.settings;
    this.recompute();
    event.preventDefault();
    wheelup = event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0;
    //manage.console.debug("Wheeling: "+(wheelup?"up":"down"));
    newzoom = sett.zoom.get();
    //zoomcoef=sett.zoomcoef.get();
    oldpow = sett.zoompow();
    if (wheelup) {
      newzoom = Math.min(newzoom + 1, 6);
    } else {
      newzoom = Math.max(newzoom - 1, 0);
    }
    pos = this.nowPos;
    if (!pos) {
      return;
    }
    sett.zoom.set(newzoom);
    pow = sett.zoompow();
    frameposx = sett.frameposx.get();
    frameposy = sett.frameposy.get();
    delta = 1 / oldpow - 1 / pow;
    //manage.console.debug("Wheeling: ["+pos.x+","+pos.y+"] delta="+delta);
    this.setFramepos(frameposx - delta * pos.x, frameposy - delta * pos.y);
    //control.settings.frameposx.set(frameposx-delta*pos.x);
    //control.settings.frameposy.set(frameposy-delta*pos.y);
    //manage.console.debug("Wheeling: "+(event.originalEvent.wheelDelta > 0));
  },
  mouseclick: function (event) {
    if (this.measureOverride) {
      var coord = this.getCoord({x: (event.pageX - this.left) / this.width, y: (event.pageY - this.top) / this.height}); // mousepos as argument
      control.measure.click(coord);
    }
  },
  setFramepos: function (nposx, nposy) {
    var sett = control.settings,
        pow = sett.zoompow();
    nposx = Math.min(nposx, 0);
    nposx = Math.max(nposx, -1 + 1 / pow);
    nposy = Math.min(nposy, 0);
    nposy = Math.max(nposy, -1 + 1 / pow);
    sett.frameposx.set(Math.floor(nposx * 1000) / 1000);
    sett.frameposy.set(Math.floor(nposy * 1000) / 1000);
  },
  recompute: function (force) {
    var off;
    if (this.needRecompute || force) {
      off = this.$cancont.offset();
      this.top = off.top;
      this.left = off.left;
      this.height = this.$cancont.height();
      this.width = this.$cancont.width();
      this.needRecompute = false;
    }
  },
  getCoord: function (pos) {
    var zoompow, frameposx, frameposy, ret = {},
        sett = control.settings;
    zoompow = sett.zoompow();
    frameposx = sett.frameposx.get();
    frameposy = sett.frameposy.get();
    ret.x = -frameposx + pos.x / zoompow;
    ret.y = -frameposy + pos.y / zoompow;
    return ret;
    //manage.console.debug("Coord=["+ret.x+","+ret.y+"]");
  },
  notify: function (args) {
    if (args === "resize") {
      return this.recompute(true);
    }
  }
});
// @license-end
