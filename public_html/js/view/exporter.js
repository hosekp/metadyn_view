/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
 * Copyright (C) 2014  Petr Hošek
 */
if (window.view === undefined) {
  var view = {};
}
if (view.exporter === undefined) {
  view.exporter = {};
}
$.extend(view.exporter, {
  inited: false,
  $modal: null,
  $modalCont: null,
  onload: function () {
    control.settings.export.subscribe(this, "export");
  },
  init: function () {
    var template = '\
    <div id="export_modal">\
    <div id="export_modal_inner">\
      <div id="export_modal_content"></div>\
        <div id="export_modal_bottom">\
          <button id="export_modal_close">{{Close}}</button>\
        </div>\
      </div>\
    </div>\
    ';
    var $modal = $(Mustache.render(template, {Close: Lang("Close")}));
    this.$modal = $modal;
    this.$modalCont = this.$modal.find("#export_modal_content");
    this.$modal.find("#export_modal_close").click(function (e) {
      $modal.hide();
    });
    $("#all").prepend(this.$modal);
    this.inited = true;
  },
  exportPng: function () {
    var $main_cont;
    if (!$(".main_can")[0]) {
      manage.console.warning("Exporter:", "Nothing to draw");
      return;
    }
    // this.$cont.show();
    var $canvas = $("<canvas></canvas>");
    var ctx = $canvas[0].getContext("2d");
    $main_cont = $("#main_cont");
    this.resizeCanvas($canvas, $main_cont.width(), $main_cont.height());
    this.redrawCanvas(ctx, $main_cont);
    // $("#cont").hide();
    $canvas[0].toBlob(function(blob){saveAs(blob,'plot.png')});
  },
  resizeCanvas: function ($canvas, width, height) {
    $canvas.width(width).height(height).attr({width: width, height: height});
  },
  redrawCanvas: function (ctx, $main_can) {
    var $axi_z, $axi_x, ncv, $axi_y,
        y_width, z_width, z_height;
    $axi_z = $("#axi_z");
    $axi_x = $("#axi_x");
    $main_can = $(".main_can");
    z_height = $axi_z.height();
    z_width = $axi_z.width();
    ncv = control.settings.ncv.get();
    if (ncv > 1) {
      $axi_y = $("#axi_y");
      y_width = $axi_y.width();
      ctx.drawImage($axi_y[0], 0, 0);
      ctx.drawImage($axi_z[0], y_width + $axi_x.width(), 0);
    } else {
      y_width = z_width;
      ctx.drawImage($axi_z[0], 0, 0);
    }
    ctx.drawImage($axi_x[0], y_width, z_height);
    ctx.drawImage($main_can[0], y_width + 5, 5);

  },
  exportTxt: function () {
    var space = manage.manager.getTransformed();
    if (!space) {
      manage.console.warning("Exporter:", "Nothing to draw");
      return;
    }
    var resol = control.settings.resol.get();
    var arr = [];
    var xs = [];
    for (var i = 0; i < resol; i++) {
      xs.push(compute.axi.getCVval(true, i / resol));
    }
    var len = space.length;
    if (control.settings.ncv.get() === 2) {
      var ys = [];
      for (i = 0; i < resol; i++) {
        ys.push(compute.axi.getCVval(false, i / resol));
      }
      var iy = 0;
      var ix = 0;
      for (i = 0; i < len; i++) {
        arr.push(xs[ix].toPrecision(5) + " " + ys[iy].toPrecision(5) + " " + space[i].toPrecision(5));
        ix++;
        if (ix === xs.length) {
          ix = 0;
          iy++;
        }
      }
    } else {
      for (i = 0; i < len; i++) {
        arr.push(xs[i].toPrecision(5) + " " + space[i].toPrecision(5));
      }
    }
    var link = document.createElement("a");
    var blob = new Blob([arr.join("\n")], {type: 'text;charset=utf-8;'});
    var url = URL.createObjectURL(blob);
    this.$modalCont.empty().append(link);
    link.setAttribute("href", url);
    link.setAttribute("target", "_blank");
    link.setAttribute("download", "bias.txt");
    link.click();
  },
  exportSvg: function (svg) {
    if (!svg) return;
    var link = document.createElement("a");
    var header = '<?xml version="1.0" standalone="no"?>\
        \n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
    var blob = new Blob([header,svg.outerHTML], {type: 'image/svg+xml'});
    var url = URL.createObjectURL(blob);
    this.$modalCont.empty().append(link);
    link.setAttribute("href", url);
    link.setAttribute("target", "_blank");
    link.setAttribute("download", "plot.svg");
    link.setAttribute("href-lang", 'image/svg+xml');
    link.click();
  },
  notify: function (args) {
    if (args === "export") {
      if (!this.inited) {
        this.init();
      }
      var value = control.settings.export.get();
      if (value === "TXT") {
        this.exportTxt();
      }
      if (value === "PNG") {
        this.exportPng();
      }
      if (value === "SVG") {
        var svg = view.axi.prepareSvg();
        this.exportSvg(svg);
      }
      control.settings.export.set(null);
    }
  }
});
// @license-end
