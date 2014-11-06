do control.settings.lang.set("cze")
== control.settings.lang.get() "cze"
sleep 1
var choose $("#file_but").html()
== $$choose "Vyber soubory"
var examples $("#examples_button").html()
== $$examples "Příklady"
do $("#lang_sel").click()
sleep 1
var choose $("#file_but").html()
== $$choose "Choose files"
var examples $("#examples_button").html()
== $$examples "Examples"