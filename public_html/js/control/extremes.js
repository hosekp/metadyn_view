/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
 * Copyright (C) 2014  Petr Hošek
 */
window.control = window.control || {};
control.extremes = {
  extremesOn: false,
  data: {
    extremes: []
  },
  bindEvents: function ($cont) {
    var self = this;
    var measure = control.measure;
    $cont.on('click', "#measure_extremes_button", function () {
      self.extremesOn = !self.extremesOn;
      if (self.extremesOn) {
        self.data.extremes = self.findExtremes();
      } else {
        self.data.extremes = [];
      }
      draw.path.reset();
      self.drawExtremes();
      measure.notify("draw");
    });
  },
  drawExtremes: function () {
    var extremes;
    if (!this.extremesOn) return;
    extremes = this.data.extremes;
    for (var i = 0; i < extremes.length; i++) {
      draw.path.addPath(extremes[i]);
    }
  },
  findExtremes: function () {
    var resol = control.settings.resol.get();
    var ncv = control.settings.ncv.get();
    var ix, iy = 0;
    var extremes = [];
    var iExtremes = [];
    var steps = 20;
    if (ncv === 2) {
      // if (1 === Math.pow(1, 2)) {
      for (ix = 0; ix < steps; ix++) {
        var x = ix / steps;
        for (iy = 0; iy < steps; iy++) {
          var sx = Math.floor(x * resol);
          var sy = resol - Math.floor((iy + 1) / steps * resol);
          var ex = Math.floor((x + 1 / steps) * resol);
          var ey = resol - Math.floor(iy / steps * resol);
          var ipos = this.findBoxedExtremes2(sx, sy, ex, ey);
          if (!ipos) continue;
          extremes.push([[
            (ipos.x + 0.5) / resol,
            1 - (ipos.y + 0.5) / resol
          ]]);
        }
      }
      // } else {
      //   iExtremes.push({x: resol - 1, y: resol - 1});
      //   for (var x = 0.05; x < 1; x += 0.1) {
      //     for (var y = 0.05; y < 1; y += 0.1) {
      //       ix = Math.floor(x * resol);
      //       iy = Math.floor((1 - y) * resol);
      //       var ipos = this.iterateExtreme2(ix, iy, iExtremes);
      //       if (!ipos) continue;
      //       iExtremes.push(ipos);
      //       extremes.push([[
      //         ipos.x / resol,
      //         1 - ipos.y / resol
      //       ]]);
      //     }
      //   }
      // }
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
      if (ix === 0) return null;
      if (ix === resol - 1) return null;
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
      if (ix === 0) return null;
      if (ix === resol - 1) return null;
      if (iy === 0) return null;
      if (iy === resol - 1) return null;
      val = nextVal;
      nextVal = trans[ix - 1 + iy * resol];
      if (nextVal > val) {
        ix--;
        continue;
      }
      nextVal = trans[ix + 1 + iy * resol];
      if (nextVal >= val) {
        ix++;
        continue;
      }
      nextVal = trans[ix + (iy - 1) * resol];
      if (nextVal > val) {
        iy--;
        continue;
      }
      nextVal = trans[ix + (iy + 1) * resol];
      if (nextVal >= val) {
        iy++;
        continue
      }
      nextVal = trans[ix - 1 + (iy - 1) * resol];
      if (nextVal > val) {
        ix--;
        iy--;
        continue;
      }
      nextVal = trans[ix - 1 + (iy + 1) * resol];
      if (nextVal > val) {
        ix--;
        iy++;
        continue
      }
      nextVal = trans[ix + 1 + (iy - 1) * resol];
      if (nextVal > val) {
        ix++;
        iy--;
        continue;
      }
      nextVal = trans[ix + 1 + (iy + 1) * resol];
      if (nextVal >= val) {
        ix++;
        iy++;
        continue
      }
      break;
    }
    for (var i = 0; i < others.length; i++) {
      var other = others[i];
      if (other.x === ix && other.y === iy) return null;
    }
    return {x: ix, y: iy};
  },
  findBoxedExtremes2: function (sx, sy, ex, ey) {
    var trans, resol;
    if (sx === ex || sy === ey) return null;
    trans = manage.manager.lastSpace.getArr(32);
    if (trans === null) return null;
    resol = control.settings.resol.get();
    var maxIndex = 0;
    var max = -Infinity;
    for (var y = sy; y < ey; y++) {
      var end = ex + y * resol;
      for (var i = sx + y * resol; i < end; i++) {
        if (trans[i] > max) {
          maxIndex = i;
          max = trans[i];
        }
      }
    }
    y = Math.floor(maxIndex / resol);
    var x = maxIndex % resol;
    if (y === 0) return null;
    if (y === resol - 1) return null;
    if (x === 0) return null;
    if (x === resol - 1) return null;
    var val = trans[x + y * resol];
    if (x === sx) {
      if (val <= trans[(x - 1) + y * resol]) return null;
      if (y === sy) {
        if (val <= trans[(x - 1) + (y - 1) * resol]) return null;
      }
      if (y === ey - 1) {
        if (val <= trans[(x - 1) + (y + 1) * resol]) return null;
      }
    }
    if (x === ex - 1) {
      if (val <= trans[(x + 1) + y * resol]) return null;
      if (y === sy) {
        if (val <= trans[(x + 1) + (y - 1) * resol]) return null;
      }
      if (y === ey - 1) {
        if (val <= trans[(x + 1) + (y + 1) * resol]) return null;
      }
    }
    if (y === sy) {
      if (val <= trans[x + (y - 1) * resol]) return null;
    }
    if (y === ey - 1) {
      if (val <= trans[x + (y + 1) * resol]) return null;
    }
    return {x: x, y: y};
  }
};
// @license-end
