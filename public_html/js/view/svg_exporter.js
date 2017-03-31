/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
 * Copyright (C) 2016  Petr Hošek
 */
if (window.view === undefined) {
  var view = {};
}
if (view.axi === undefined) {
  view.axi = {};
}
$.extend(view.axi, {
  svgNamespace: "http://www.w3.org/2000/svg",
  prepareSvg: function () {
    var $main_can = $(".main_can");
    if (!$main_can[0]) {
      manage.console.warning("Exporter:", "Nothing to draw");
      return;
    }
    var width, height;
    var svgElement = document.createElementNS(this.svgNamespace, "svg");
    var $main_cont = $("#main_cont");
    width = $main_cont.width();
    height = $main_cont.height();
    svgElement.setAttribute("width", width.toString());
    svgElement.setAttribute("height", height.toString());
    svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgElement.setAttribute("version", "1.1");
    var $axi_z, $axi_x, ncv, $axi_y,
        x_width, y_width, z_width, z_height,
        axisX, axisY, axisZ;
    $axi_z = $("#axi_z");
    $axi_x = $("#axi_x");
    z_height = $axi_z.height();
    z_width = $axi_z.width();
    x_width = $axi_x.width();
    ncv = control.settings.ncv.get();
    if (ncv > 1) {
      $axi_y = $("#axi_y");
      y_width = $axi_y.width();
      axisY = this.drawSvgAxisY(y_width, z_height);
      svgElement.appendChild(axisY);
      axisZ = this.drawSvgAxisZ(false, z_width, z_height);
      // ctx.drawImage($axi_y[0], 0, 0);
      // ctx.drawImage($axi_z[0], y_width + $axi_x.width(), 0);
      axisZ.setAttribute("transform", 'translate(' + (y_width + x_width) + ',0)');
      svgElement.appendChild(axisZ);
    } else {
      y_width = z_width;
      axisZ = this.drawSvgAxisZ(true, z_width, z_height);
      svgElement.appendChild(axisZ);
      // ctx.drawImage($axi_z[0], 0, 0);
    }
    axisX = this.drawSvgAxisX(ncv === 1, x_width, 50);
    axisX.setAttribute("transform", 'translate(' + y_width + ',' + z_height + ')');
    // axisX.setAttribute("x",y_width);
    // axisX.setAttribute("y",z_height);
    svgElement.appendChild(axisX);
    // ctx.drawImage($axi_x[0], y_width, z_height);
    var centralImage = document.createElementNS(this.svgNamespace, "image");
    // <image width="100" height="100" xlink:href="data:image/png;base64,...">
    centralImage.setAttribute("width", $main_can.width());
    centralImage.setAttribute("height", $main_can.height());
    centralImage.setAttribute("x", y_width + 5);
    centralImage.setAttribute("y", "5");
    centralImage.setAttribute("xlink:href", $main_can[0].toDataURL('image/png'));
    svgElement.appendChild(centralImage);
    return svgElement;
  },
  //####################################################################################################################
  drawSvgAxisX: function (noY, width, height) {
    var limits, min, max, diff, range, dec, i, pos, text;
    var axis = document.createElementNS(this.svgNamespace, "g");
    axis.setAttribute("id", "CV1_axis");
    var lineColor = "black";
    var lineWidth = "2";
    var pathPath = 'M 5 1 L ' + (width - 5) + ' 1';
    var textGroup = document.createElementNS(this.svgNamespace, "g");
    textGroup.setAttribute("style", "fill:black;font-size:13px");
    textGroup.setAttribute("text-anchor", "middle");
    limits = compute.axi.getLimits(true, true);
    min = limits[0];
    max = limits[1];
    diff = max - min;
    limits = this.natureRange(min, max, 10, false);
    range = this.drange(limits);
    dec = this.getDec(limits[2]);
    for (i = 0; i < range.length; i += 1) {
      pos = 5 + (range[i] - min) / diff * (width - 10);
      pathPath += ' M ' + pos + ' 1 l 0 9';
      var tickText = document.createElementNS(this.svgNamespace, "text");
      tickText.textContent = this.toPrecision(range[i], dec);
      tickText.setAttribute("x", pos.toString());
      tickText.setAttribute("y", "21");
      textGroup.appendChild(tickText);
    }
    text = "axis X";
    var axiLabel = document.createElementNS(this.svgNamespace, "text");
    axiLabel.textContent = text;
    axiLabel.setAttribute("text-anchor","middle");
    axiLabel.setAttribute("x", (width / 2).toString());
    axiLabel.setAttribute("y", "36");
    textGroup.appendChild(axiLabel);
    var path = document.createElementNS(this.svgNamespace, "path");
    path.setAttribute("d", pathPath);
    path.setAttribute("stroke", lineColor);
    path.setAttribute("stroke-width", lineWidth);
    axis.appendChild(path);
    axis.appendChild(textGroup);
    return axis;
  },
  drawSvgAxisY: function (width, height) {
    var limits, min, max, diff, range, dec, i, pos, text;
    var axis = document.createElementNS(this.svgNamespace, "g");
    axis.setAttribute("id", "CV2_axis");
    var lineColor = "black";
    var lineWidth = "2";
    var pathPath = 'M ' + (width - 1) + ' 5 L ' + (width - 1) + ' ' + (height - 5);
    var textGroup = document.createElementNS(this.svgNamespace, "g");
    textGroup.setAttribute("style", "fill:black;font-size:13px");
    textGroup.setAttribute("text-anchor", "end");
    limits = compute.axi.getLimits(false, true);
    min = limits[0];
    max = limits[1];
    diff = max - min;
    limits = this.natureRange(min, max, 10, false);
    range = this.drange(limits);
    dec = this.getDec(limits[2]);
    for (i = 0; i < range.length; i += 1) {
      pos = 5 + (max - range[i]) / diff * (height - 10);
      pathPath += ' M ' + (width - 1) + ' ' + pos + ' l -4 0';
      var tickText = document.createElementNS(this.svgNamespace, "text");
      tickText.textContent = this.toPrecision(range[i], dec);
      tickText.setAttribute("x", (width - 7).toString());
      tickText.setAttribute("y", (pos + 5).toString());
      textGroup.appendChild(tickText);
    }
    text = compute.axi.getName(false);
    var axiLabel = document.createElementNS(this.svgNamespace, "text");
    axiLabel.textContent = text;
    axiLabel.setAttribute("transform", "rotate(-90)");
    axiLabel.setAttribute("text-anchor","middle");
    axiLabel.setAttribute("x", (-height / 2).toString());
    axiLabel.setAttribute("y", "10");
    textGroup.appendChild(axiLabel);
    var path = document.createElementNS(this.svgNamespace, "path");
    path.setAttribute("d", pathPath);
    path.setAttribute("stroke", lineColor);
    path.setAttribute("stroke-width", lineWidth);
    axis.appendChild(path);
    axis.appendChild(textGroup);
    return axis;
  },
  drawSvgAxisZ: function (noY, width, height) {
    var limits, min, max, diff, range, dec, i, pos, text, margin, bar, barwid;
    var lineColor = "black";
    var lineWidth = "2";

    var axis = document.createElementNS(this.svgNamespace, "g");
    var textGroup = document.createElementNS(this.svgNamespace, "g");
    axis.setAttribute("id", "Energy_axis");
    textGroup.setAttribute("style", "fill:black;font-size:13px");
    var axiLabel = document.createElementNS(this.svgNamespace, "text");
    axiLabel.setAttribute("text-anchor","middle");
    text = this.unitsrc[control.settings.enunit.get()];
    axiLabel.textContent = text;

    if (noY) {
      // LEFT ENERGY AXIS
      textGroup.setAttribute("text-anchor", "end");
      var pathPath = 'M ' + (width - 1) + ' 5 l 0 ' + (height - 10);
      min = 0;
      max = compute.axi.zmax;
      diff = max - min;
      limits = this.natureRange(min, max, 10, false);
      range = this.drange(limits);
      dec = this.getDec(limits[2]);
      for (i = 0; i < range.length; i += 1) {
        pos = 6 + (range[i] - min) / diff * (height - 10);
        pathPath += ' M ' + (width - 1) + ' ' + pos + ' l -4 0';
        tickText = document.createElementNS(this.svgNamespace, "text");
        tickText.textContent = this.toPrecision(-range[i], dec);
        tickText.setAttribute("x", (width - 7).toString());
        tickText.setAttribute("y", (pos + 5).toString());
        textGroup.appendChild(tickText);
      }
      axiLabel.setAttribute("transform", "rotate(-90)");
      axiLabel.setAttribute("y", "10");

    } else {
      // RIGHT ENERGY AXIS
      pathPath = "";
      var colorScaleDefs = document.getElementById("ColorScaleDefs").cloneNode(true);
      axis.appendChild(colorScaleDefs);
      margin = 7;
      barwid = 15;
      var barLen = height - 2 * margin;
      bar = document.createElementNS(this.svgNamespace, "rect");
      bar.setAttribute("x", "1");
      bar.setAttribute("y", margin.toString());
      bar.setAttribute("width", barwid.toString());
      bar.setAttribute("height", barLen.toString());
      bar.setAttribute("stroke", lineColor);
      bar.setAttribute("stroke-width", lineWidth);
      bar.setAttribute("fill", "url(#ColorScale)");
      axis.appendChild(bar);
      max = compute.axi.zmax;
      limits = this.natureRange(0, max, 10, false);
      range = this.drange(limits);
      dec = this.getDec(limits[2]);
      for (i = 0; i < range.length; i += 1) {
        pos = margin + (range[i] / max) * (height - 2 * margin);
        pathPath += ' M ' + barwid + ' ' + pos + ' l 5 0';
        var tickText = document.createElementNS(this.svgNamespace, "text");
        tickText.textContent = this.toPrecision(-range[i], dec);
        tickText.setAttribute("x", (barwid + 7).toString());
        tickText.setAttribute("y", (pos + 3).toString());
        textGroup.appendChild(tickText);
      }
      axiLabel.setAttribute("transform", "rotate(-90)");
      axiLabel.setAttribute("y", (width - 3).toString());

    }
    axiLabel.setAttribute("x", (-height / 2).toString());
    textGroup.appendChild(axiLabel);
    var path = document.createElementNS(this.svgNamespace, "path");
    path.setAttribute("d", pathPath);
    path.setAttribute("stroke", lineColor);
    path.setAttribute("stroke-width", lineWidth);
    axis.appendChild(path);
    axis.appendChild(textGroup);
    return axis;
  }
});
// @license-end
