/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
 * Copyright (C) 2014  Petr Hošek
 */
if (window.manage === undefined) {
  var manage = {};
}
if (manage.manager === undefined) {
  manage.manager = {};
}
$.extend(manage.manager, {
  lastSpace: null,
  lastDrawable: null,
  counter: 0,
  lastTransformed: null,
  onesecratio: 0,
  init: function () {
    control.settings.resol.subscribe(this, "resol");
    control.settings.glwant.subscribe(this, "loaded");
  },
  /*draw_text:function(rat){
   var resol,array,i,j;
   if(!draw.gl.inited){return false;}
   resol=control.settings.resol.get();
   array=new Uint8Array(resol*resol);
   for(i=0;i<resol;i+=1){
   for(j=0;j<resol;j+=1){
   array[j+resol*i]=255*Math.pow(Math.sin(i/resol*Math.PI)*Math.sin((j/resol+rat)*Math.PI),2);
   }
   }
   draw.gl.draw(array);
   return true;
   },*/
  draw: function (rat) {
    var ret, lrat, storaging = false;
    //if(!draw.gl.inited){return false;}
    //manage.console.debug("Manager: drawing "+rat);
    if (!compute.sum_hill.haveData()) {
      return false;
    }
    ret = draw.drawer.isInited();
    if (this.lastSpace === null) {
      ret = this.initSpace() && ret;
    }
    if (!ret) {
      return false;
    }
    lrat = this.lastSpace.ratio;
    //if(rat===0){rat=-1;}
    if (rat < lrat) {
      this.reset();
      lrat = -1;
    }
    //var nar=this.lastSpace;
    if (rat !== lrat) {
      if (storaging) {
        manage.storage.load(this.lastSpace, rat);
      }
      /*if(isload){
       manage.console.log("Is loaded at "+this.lastSpace.ratio);
       }*/
      //manage.console.debug("Manager: summing "+this.lastSpace.ratio+" to "+rat);
      if (this.onesecratio === 0) {
        this.onesecratio = this.estimate1sec();
      }
      if (lrat >= 0 && rat >= 0 && rat > lrat + this.onesecratio) {
        rat = lrat + this.onesecratio;
        //manage.console.debug("Manager: ratio reduced to "+rat);
      }
      //manage.console.debug("Manager: summing "+this.lastSpace.ratio+" to "+rat);
      compute.sum_hill.add(this.lastSpace, rat);
      if (storaging) {
        manage.storage.save(this.lastSpace);
      }
      //manage.console.debug("Add from "+this.lastRat+" to "+rat);
      this.counter += 1;
      compute.axi.transform(this.lastSpace, this.lastDrawable);
      this.lastTransformed = null;
    }
    draw.drawer.draw(this.lastDrawable, compute.axi.zmax);
    if(control.measure.isOn()) control.measure.measure(null);
    return rat;
  },
  initSpace: function () {
    //var resol=control.settings.resol.get();
    this.lastSpace = compute.tspacer.createSpace();
    if (!this.lastSpace) {
      return false;
    }
    this.lastDrawable = this.lastSpace.getDrawable();
    return true;
  },
  setResol: function () {
    //this.reset();
    this.lastSpace = null;
    this.lastDrawable = null;
    this.lastTransformed = null;
    manage.storage.reset();
    compute.axi.lastRatio = -1;
    this.onesecratio = 0;
  },
  reset: function () {
    manage.console.debug("Counter:", this.counter);
    this.counter = 0;
    if (this.lastSpace) {
      this.lastSpace.reset();
    }
    control.control.needRedraw = true;
  },
  purge: function () {
    compute.sum_hill.purge();
    //this.reset();
    control.settings.progress.set(0);
    this.setResol();
    view.axi.needRedraw = true;
    compute.axi.reset();
    manage.storage.reset();
  },
  getSpace: function () {
    return this.lastSpace;
  },
  getTransformed: function () {
    if (this.lastTransformed === null) {
      if (this.lastSpace !== null) {
        this.lastTransformed = compute.axi.transform(this.lastSpace, null, "float32");
      }
    }
    return this.lastTransformed;
  },
  dataLoaded: function () {
    if (!compute.sum_hill.haveData()) {
      return;
    }
    this.lastSpace = null;
    this.lastDrawable = null;
    control.settings.ncv.set(compute.sum_hill.ncv);
    this.reset();
    compute.sum_hill.purgeBlobs();
    draw.drawer.switchTo();
  },
  estimate1sec: function () {
    var nbody = compute.sum_hill.nbody,
        resol = control.settings.resol.get();
    return 1000 / nbody * 256 * 256 / resol / resol;
  },
  refine1sec: function (ratio, time) {
    this.onesecratio = (this.onesecratio + (ratio * 1000 / time)) / 2;
  },
  notify: function (args) {
    if (args === "resol") {
      this.setResol();
    }
    if (args === "loaded") {
      this.dataLoaded();
    }
  }
});
// ############################################################xx
// Allrunner
$(function () {
  control.settings.onload();
  control.control.init();
  view.ctrl.init();
  view.axi.init();
  control.gestures.init();
  compute.reader.init();
  manage.manager.init();
  control.measure.onload();
  view.exporter.onload();
  view.sett_view.onload();
  manage.tests.onload();
  control.settings.init();
  view.panel.init();
  draw.drawer.onload();
});
// @license-end
