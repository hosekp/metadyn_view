do control.settings.loop.set(false)
not control.settings.loop.get()
do control.settings.glwant.set(true)
is control.settings.glwant.get()
do $("#examples_button").click()
sleep 1
is $("#examples").is(":visible")
== $("#example_1D_HILLS_1\\.3").length 1
do $("#example_1D_HILLS_1\\.3").click()
wait compute.sum_hill.haveData()
== compute.sum_hill.nbody 2000
wait draw.drawer.isInited()
is draw.liner.isInited()
== $("#canvas_cont").children("canvas").attr("id") "main_can_liner"
do control.settings.speed.set(100)
== control.settings.speed.get() 100
do control.settings.resol.set(64)
do control.settings.measure.set(false)
do control.settings.play.set(true)
wait control.settings.play.get()==false
var space manage.manager.lastSpace
== $$space.ratio 1
> compute.axi.zmax 112.69
< compute.axi.zmax 112.70
do control.settings.png.set(true)
var canvas $("#export_can")
var width $$canvas.width()
var height $$canvas.height()
var ctx $$canvas[0].getContext("2d")
var imdadata $$ctx.getImageData(0,0,$$width,$$height).data
== $$imdadata.length 1080000
== $$imdadata[2563]+$$imdadata[253547]+$$imdadata[786126]+$$imdadata[869457] 0
do control.settings.png.set(false)
do control.control.reset()