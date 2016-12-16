/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
 * Copyright (C) 2014  Petr Hošek
 */
window.control = window.control || {};
control.measure = {
  inited: false,
  needRedraw: true,
  visible: false,
  chillsOn: false,
  diffOn: false,
  diffDrawing: false,
  extremesOn: false,
  data: {
    chills: [],
    xaxi: 0,
    yaxi: 0,
    ene: 0,
    src: 0,
    extremes: []
  },
  div: {},
  onload: function () {
    control.settings.measure.subscribe(this, "on");
  },
  init: function () {
    var $cont = $('<div id="measure_cont"></div>'),
        sett = control.settings;
    this.div.$cont = $cont;
    $("#side").append($cont);
    /*cont.on("click",".button",$.proxy(function(e){
     this.chillsOn=!this.chillsOn;
     this.needRedraw=true;
     },this));*/
    this.template = '\
    <div id=measure_NW" class="measure_NESW" style="float:left">\n\
        <div id="measure_ene_title">{{eneTitle}}: </div>\n\
        <div id="measure_xaxi_title">{{CV1}}: </div>\n\
        {{#yaxi}}<div id="measure_yaxi_title">{{CV2}}: </div>{{/yaxi}}\n\
    </div>\n\
    <div id="measure_NE" class="measure_NESW" style="float:left">\n\
        <div id="measure_ene"><span id=measure_ene_value">{{data.ene}}</span><span id="measure_ene_units"> {{units}}</span></div>\n\
        <div id="measure_xaxi">{{data.xaxi}}</div>\n\
        {{#yaxi}}<div id="measure_yaxi">{{data.yaxi}}</div>{{/yaxi}}\n\
    </div>\n\
    <div id="measure_chills_button" class="ctrl button lclear{{chillsOn}}" data-ctrl="closest_hills">{{chil_title}}</div>\n\
    {{#chillsOn}}\n\
      <div id="measure_chills"><ol class="nomargin">\n\
      {{#data.chills}}\
        <li>{{.}} ps</li>\n\
      {{/data.chills}}\
      </ol></div>\n\
      {{^data.chills}}\n\
        {{chil_help}}\n\
      {{/data.chills}}\n\
    {{/chillsOn}}\
    <div id="measure_extremes_button" class="ctrl button lclear{{extremesOn}}" data-ctrl="extremes">{{extremeTitle}}</div>\n\
';
    draw.path.init();
    control.control.everysec(this, "render");
    sett.ncv.subscribe(this, "draw");
    sett.enunit.subscribe(this, "draw");
    sett.lang.subscribe(this, "draw");
    this.bindEvents($cont);
    this.inited = true;
  },
  bindEvents: function ($cont) {
    var self = this;
    $cont.on('click', "#measure_chills_button", function () {
      self.chillsOn = !self.chillsOn;
      self.notify("draw");
    });
    $cont.on('click', "#measure_extremes_button", function () {
      self.extremesOn = !self.extremesOn;
      if (self.extremesOn) {
        self.data.extremes = [{x: 0.5, y: 0.5}];
      } else {
        self.data.extremes = [];
      }
      draw.path.reset();
      self.drawExtremes();
      self.notify("draw");
    });
  },
  isOn: function () {
    return control.settings.measure.get();
  },
  render: function () {
    var rendered;
    if (!this.visible) return;
    if (!this.needRedraw) return;

    rendered = Mustache.render(this.template, {
      units: control.settings.enunit.get() === 0 ? "kJ/mol" : "kcal/mol",
      yaxi: control.settings.ncv.get() > 1,
      CV1: compute.axi.getName(true),
      CV2: compute.axi.getName(false),
      chillsOn: this.chillsOn ? " on" : "",
      extremesOn: this.extremesOn ? " on" : "",
      eneTitle: !this.diffOn ? Lang("Bias") : Lang("Difference"),
      chil_title: Lang("Closest hills"),
      extremeTitle: Lang("Extremes"),
      chil_help: Lang("Click at point you want to find closest hills to"),
      data: this.data
    });
    this.div.$cont.html(rendered);
    /*this.div.$energy=cont.children("#measure_energy");
     this.div.$xaxi=cont.children("#measure_xaxi");
     this.div.$yaxi=cont.children("#measure_yaxi");
     this.div.$chbutton=cont.children("#measure_chills_button");
     this.div.$chills=cont.children("#measure_chills");*/
    this.needRedraw = false;
  },
  show: function () {
    this.visible = true;
    if (!this.inited) {
      this.init();
    }
    control.gestures.measureOverride = true;
    this.div.$cont.show();
  },
  hide: function () {
    if (!this.inited) return;
    control.gestures.measureOverride = false;
    this.visible = false;
    this.div.$cont.hide();
  },
  toggle: function () {
    if (control.settings.measure.get()) {
      this.show();
    } else {
      this.hide();
    }
  },
  click: function (pos) {
    // if (!this.isOn()) return;
    if (this.chillsOn) {
      pos.y = 1 - pos.y;
      this.data.chills = this.findChills([pos.x, pos.y]);
      this.needRedraw = true;
    }
    this.unsetDiff();
    this.measure(pos);
  },
  drawExtremes: function () {
    if (!this.extremesOn) return;
    var extremes = this.data.extremes;
    for (var i = 0; i < extremes.length; i++) {
      var extreme = extremes[i];
      draw.path.addPath([[extreme.x, extreme.y]]);
    }
  },
  drawDiff: function (endPos) {
    var data = this.data;
    if (control.settings.ncv.get() === 1) {
      var x = data.start[0];
      draw.path.addPath([[x, 0], [x, 1], [endPos.x, 1], [endPos.x, 0], [x, 0]]);
    } else {
      draw.path.addPath([data.start, [endPos.x, endPos.y]]);
    }
  },
  measure: function (pos) {
    var val, data, override, ncv, x;
    // if (!this.isOn()) return false;
    if (!this.diffOn || this.diffDrawing) {
      val = this.getValueAt(pos);
    } else {
      val = this.getValueAt(this.data.end);
    }
    if (val === null) return false;
    ncv = control.settings.ncv.get();
    data = this.data;
    override = false;
    draw.path.reset();
    this.drawExtremes();
    if (this.diffOn) {
      val -= data.src;
      override = true;
      this.drawDiff(this.data.end || pos);
    } else {
      if (ncv === 1) {
        draw.path.addPath([[pos.x, -val / compute.axi.zmax]]);
      } else {
        draw.path.addPath([[pos.x, pos.y]]);
      }
    }
    data.xaxi = compute.axi.getCVval(true, pos.x).toPrecision(3);
    if (ncv > 1) {
      data.yaxi = compute.axi.getCVval(false, 1 - pos.y).toPrecision(3);
    }
    data.ene = val.toFixed(2);
    this.needRedraw = true;
    //$("#measure_ctrl_value").html(val.toFixed(1)+" kJ/mol");
    return override;
  },
  setDiff: function (pos) {
    var val;
    // if (!this.isOn()) return;
    this.data.end = null;
    val = this.getValueAt(pos);
    draw.path.reset();
    this.drawExtremes();
    draw.path.addPath([[pos.x, pos.y]]);
    if (val === null) return false;
    this.data.src = val;
    this.data.ene = 0;
    this.data.start = [pos.x, pos.y];
    this.diffOn = true;
    this.diffDrawing = true;
    this.needRedraw = true;
    // manage.console.debug("diff","on");
  },
  setEndDiff: function (pos) {
    if (!pos) {
      if (this.diffDrawing) {
        this.unsetDiff();
      }
      return;
    }
    this.diffDrawing = false;
    this.data.end = pos;
    // manage.console.debug("diff","end");
  },
  unsetDiff: function () {
    // if (!this.isOn()) return;
    this.data.start = null;
    this.data.end = null;
    this.diffOn = false;
    this.diffDrawing = false;
    this.needRedraw = true;
    draw.path.reset();
    this.drawExtremes();
    // manage.console.debug("diff","off");
  },
  getValueAt: function (pos) {
    var trans, resol, ncv, x, y = 0, val;
    trans = manage.manager.getTransformed();
    if (trans === null) return null;
    resol = control.settings.resol.get();
    ncv = control.settings.ncv.get();
    if (ncv === 2) {
      x = Math.floor(pos.x * resol);
      y = Math.floor((1 - pos.y) * resol);
    } else if (ncv === 1) {
      x = Math.floor(pos.x * resol);
    }
    val = trans[x + y * resol];
    if (!val) return 0;
    return -val;
  },
  findChills: function (cvs) {
    var ihills, ret, i;
    if (!compute.sum_hill.haveData()) return [];
    ihills = compute.sum_hill.findClosestHills(cvs, 3);
    ret = [];
    for (i = 0; i < ihills.length; i += 1) {
      ret.push((compute.sum_hill.artime[ihills[i]]).toFixed(2));
    }
    return ret;
  },
  notify: function (args) {
    if (args === "on") {
      this.toggle();
    }
    if (args === "draw") {
      this.needRedraw = true;
    }
    if (args === "render") {
      this.render();
    }
  }
};
// @license-end
