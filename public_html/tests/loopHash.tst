do control.settings.loop.set(false)
not control.settings.loop.get()
sleep 1
var hash window.location.hash;
> $$hash.indexOf("lop=false") 0 
do $("#loop_ctrl").click();
is control.settings.loop.get()