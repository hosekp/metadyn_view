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
  drawing: true, // actualize energy on mousemove
  extremesOn: false,
  data: {
    chills: [],
    xaxi: 0,
    yaxi: 0,
    ene: 0,
    src: 0,
    startPos: null,
    endPos: null,
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
    {{^data.ene}}\
      <div id="measure_ene_header">{{eneTitle}}</div>\
    {{/data.ene}}\
    {{#data.ene}}\
      <div id="measure_NW" class="measure_NESW">\
          <div id="measure_ene_title">{{eneTitle}}: </div>\
          <div id="measure_xaxi_title">{{CV1}}: </div>\
          {{#yaxi}}<div id="measure_yaxi_title">{{CV2}}: </div>{{/yaxi}}\
      </div>\
      <div id="measure_NE" class="measure_NESW">\
          <div id="measure_ene"><span id=measure_ene_value">{{data.ene}}</span><span id="measure_ene_units"> {{units}}</span></div>\
          <div id="measure_xaxi">{{data.xaxi}}</div>\
          {{#yaxi}}<div id="measure_yaxi">{{data.yaxi}}</div>{{/yaxi}}\
      </div>\
    {{/data.ene}}\
    <div id="measure_chills_button" class="ctrl button lclear{{chillsOn}}" data-ctrl="closest_hills">{{chil_title}}</div>\
    {{#chillsOn}}\
      <div id="measure_chills"><ol class="nomargin">\
      {{#data.chills}}\
        <li>{{.}} ps</li>\
      {{/data.chills}}\
      </ol></div>\
      {{^data.chills}}\
        {{chil_help}}\
      {{/data.chills}}\
    {{/chillsOn}}\
    <div id="measure_extremes_button" class="ctrl button lclear{{extremesOn}}" data-ctrl="extremes">{{extremeTitle}}</div>\
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
        self.data.extremes = self.findExtremes();
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
      units: this.data.ene === null ? "" : control.settings.enunit.get() === 0 ? "kJ/mol" : "kcal/mol",
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
    this.div.$cont.css("display", "inline-block");
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
      this.data.chills = this.findChills([pos.x, 1 - pos.y]);
    }
    if (this.data.endPos && this.isCloseToPos(pos, this.data.endPos)) {
      this.unsetDiff();
      this.measure(pos);
    } else {
      this.unsetDiff();
      this.setEndDiff(pos);
      this.measure();
    }
    this.needRedraw = true;
  },
  mouseEnd: function (pos) {
    if (!pos && this.drawing) {
      return this.unsetDiff();
    }
    if (this.diffOn && this.drawing) {
      this.setEndDiff(pos);
    }
  },
  drawExtremes: function () {
    var extremes;
    if (!this.extremesOn) return;
    extremes = this.data.extremes;
    for (var i = 0; i < extremes.length; i++) {
      draw.path.addPath(extremes[i]);
    }
  },
  drawDiff: function (endPos) {
    var data = this.data, startPos = data.startPos;
    if (control.settings.ncv.get() === 1) {
      var x = startPos.x;
      draw.path.addPath([[x, 0], [x, 1], [endPos.x, 1], [endPos.x, 0], [x, 0]]);
    } else {
      draw.path.addPath([[startPos.x, startPos.y], [endPos.x, endPos.y]]);
    }
  },
  drawPoint: function (pos, val) {
    if (control.settings.ncv.get() === 1) {
      draw.path.addPath([[pos.x, -val / compute.axi.zmax]]);
    } else {
      draw.path.addPath([[pos.x, pos.y]]);
    }
  },
  measure: function (pos) {
    var val, data, ncv;
    // if (!this.isOn()) return false;

    if (this.data.endPos) {
      pos = this.data.endPos;
    }
    if (!pos) return false;
    val = this.getValueAt(pos);
    if (this.data.startPos) {
      val -= this.getValueAt(this.data.startPos);
    }
    if (val === null) return false;
    ncv = control.settings.ncv.get();
    data = this.data;
    // override = false;
    draw.path.reset();
    this.drawExtremes();
    if (this.diffOn) {
      // override = true;
      this.drawDiff(pos);
    } else {
      this.drawPoint(pos, val);
    }
    data.xaxi = compute.axi.getCVval(true, pos.x).toPrecision(3);
    if (ncv > 1) {
      data.yaxi = compute.axi.getCVval(false, 1 - pos.y).toPrecision(3);
    }
    data.ene = val.toFixed(2);
    this.needRedraw = true;
    //$("#measure_ctrl_value").html(val.toFixed(1)+" kJ/mol");
    return true;//override;
  },
  setDiff: function (pos) {
    var val;
    // if (!this.isOn()) return;
    this.data.endPos = null;
    val = this.getValueAt(pos);
    draw.path.reset();
    this.drawExtremes();
    draw.path.addPath([[pos.x, pos.y]]);
    if (val === null) return false;
    this.data.ene = 0;
    this.data.startPos = pos;
    this.diffOn = true;
    this.drawing = true;
    this.needRedraw = true;
    // manage.console.debug("diff","on");
  },
  setEndDiff: function (pos) {
    if (!pos) {
      if (this.diffOn && this.drawing) {
        this.unsetDiff();
      }
      return;
    }
    this.drawing = false;
    this.data.endPos = pos;
    // manage.console.debug("diff","end");
  },
  unsetDiff: function () {
    this.clearData();
    this.drawExtremes();
    // manage.console.debug("diff","off");
  },
  clearData: function () {
    this.data.startPos = null;
    this.data.endPos = null;
    this.diffOn = false;
    this.drawing = true;
    this.data.xaxi = null;
    this.data.yaxi = null;
    this.data.ene = null;
    this.needRedraw = true;
    draw.path.reset();
  },
  isCloseToPos: function (pos, second) {
    // var distance2 = Math.pow(pos.x - point.x, 2) + Math.pow(pos.y - point.y, 2);
    // manage.console.log("Distance: "+distance2);
    // return distance2 < 0.00025;
    return Math.pow(pos.x - second.x, 2) + Math.pow(pos.y - second.y, 2) < 0.0003;
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
  findExtremes: function () {
    var resol = control.settings.resol.get();
    var ncv = control.settings.ncv.get();
    var ix, iy = 0;
    var extremes = [];
    var iExtremes = [];
    if (ncv === 2) {
      iExtremes.push({x: resol - 1, y: resol - 1});
      for (var x = 0.05; x < 1; x += 0.1) {
        for (var y = 0.05; y < 1; y += 0.1) {
          ix = Math.floor(x * resol);
          iy = Math.floor((1 - y) * resol);
          var ipos = this.iterateExtreme2(ix, iy, iExtremes);
          if (!ipos) continue;
          iExtremes.push(ipos);
          extremes.push([[
            ipos.x / resol,
            1 - ipos.y / resol
          ]]);
        }
      }
    } else if (ncv === 1) {
      iExtremes.push(resol - 1);
      for (x = 0.05; x < 1; x += 0.1) {
        ix = Math.floor(x * resol);
        ix = this.iterateExtreme1(ix, iExtremes);
        if (ix === null) continue;
        iExtremes.push(ix);
        extremes.push([[ix / resol, 0], [ix / resol, 1]]);
      }
    }
    return extremes;
  },
  iterateExtreme1: function (ix, others) {
    var trans, resol, val;
    trans = manage.manager.lastSpace.getArr(32);
    if (trans === null) return null;
    resol = control.settings.resol.get();
    var nextVal = trans[ix];
    while (true) {
      val = nextVal;
      if (ix > 0) {
        nextVal = trans[ix - 1];
        if (nextVal > val) {
          ix--;
          continue;
        }
      }
      if (ix < resol - 1) {
        nextVal = trans[ix + 1];
        if (nextVal >= val) {
          ix++;
          continue;
        }
      }
      break;
    }
    for (var i = 0; i < others.length; i++) {
      if (others[i] === ix) return null;
    }
    return ix;
  },
  iterateExtreme2: function (ix, iy, others) {
    var trans, resol, val;
    trans = manage.manager.lastSpace.getArr(32);
    if (trans === null) return null;
    resol = control.settings.resol.get();
    var nextVal = trans[ix + iy * resol];
    while (true) {
      val = nextVal;
      if (ix > 0) {
        nextVal = trans[ix - 1 + iy * resol];
        if (nextVal > val) {
          ix--;
          continue;
        }
      }
      if (ix < resol - 1) {
        nextVal = trans[ix + 1 + iy * resol];
        if (nextVal >= val) {
          ix++;
          continue;
        }
      }
      if (iy > 0) {
        nextVal = trans[ix + (iy - 1) * resol];
        if (nextVal > val) {
          iy--;
          continue;
        }
      }
      if (iy < resol - 1) {
        nextVal = trans[ix + (iy + 1) * resol];
        if (nextVal >= val) {
          iy++;
          continue
        }
      }
      break;
    }
    for (var i = 0; i < others.length; i++) {
      var other = others[i];
      if (other.x === ix && other.y === iy) return null;
    }
    return {x: ix, y: iy};
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
