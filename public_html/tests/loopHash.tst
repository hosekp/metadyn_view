do control.settings.loop.set(false)
not control.settings.loop.get()
sleep 1
var hash window.location.hash;
is $$hash.contains("lop=false") 
do $("#loop_ctrl").click();
is control.settings.loop.get()