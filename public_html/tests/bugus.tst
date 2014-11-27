do control.settings.loop.set(false)
not control.settings.loop.get()
do control.settings.glwant.set(true)
is control.settings.glwant.get()
do view.ctrl.resize(800,600)
do $("#examples_button").click()
sleep 1
is $("#examples").is(":visible")
== $("#example_HILLS\\.amber03").length 1
do $("#example_HILLS\\.amber03").click()
not compute.sum_hill.haveData()
sleep 1
wait compute.sum_hill.haveData()
== compute.sum_hill.nbody 25000
wait draw.drawer.isInited()
is draw.gl.isInited()
do control.settings.measure.set(false)

do control.settings.resol.set(64)
do control.settings.speed.set(1)
sleep 1
var count 0
goto target
bench perf manage.manager.draw(1)
do $$count++
goto $$count<100 23
bench out 1000
# contourOff(101->148)

do control.control.reset();