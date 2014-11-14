do control.settings.loop.set(false)
not control.settings.loop.get()
do control.settings.glwant.set(false)
not control.settings.glwant.get()
do $("#examples_button").click()
sleep 1
is $("#examples").is(":visible")
== $("#example_HILLS_1\\.3").length 1
do $("#example_HILLS_1\\.3").click()
not compute.sum_hill.haveData()
sleep 1
wait compute.sum_hill.haveData()
== draw.drawer.engine.engine "raster"
== compute.sum_hill.nbody 20000
wait draw.drawer.isInited()
is draw.raster.isInited()
do control.settings.resol.set(64)
do control.settings.speed.set(10)
== control.settings.speed.get() 10
do control.settings.measure.set(false)
do control.settings.play.set(true)
wait control.settings.play.get()==false
> compute.axi.zmax 167.28
< compute.axi.zmax 167.29
== manage.manager.lastSpace.ratio 1
do control.settings.png.set(true)
var canvas $("#export_can")
var width $$canvas.width()
var height $$canvas.height()
var ctx $$canvas[0].getContext("2d")
var imdadata $$ctx.getImageData(0,0,$$width,$$height).data
== $$imdadata.length 1080000
== $$imdadata[2563]+$$imdadata[253547]+$$imdadata[786126]+$$imdadata[869457] 510
do control.settings.png.set(false)
do control.control.reset()




