/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
 * Copyright (C) 2014  Petr Hošek
 */
if (window.view === undefined) {
  var view = {};
}
if (view.lang === undefined) {
  view.lang = {};
}
$.extend(view.lang, {
  cze: {
    "Data matrix": "Matice dat",
    "Download plot": "Stáhnout graf",
    "Nothing to draw": "Nic k vykreslení",
    "opened": "otevřeno",
    "Close": "Zavřít",
    // "To get the picture, just press right mouse button over it and select Save image as..": "Klikněte pravým tlačítkem myši na obrázek a dejte Uložit obrázek jako ..",
    //"To get the picture, just press right mouse button over it and select Save image as..":"Klikněte pravým tlačítkem myši na obrázek a dejte Uložit jako ..",
    "CHOOSE FILES": "VYBERTE SOUBORY",
    "Examples": "Příklady",
    "Drop yours HILLS files here": "Upusť zde soubory",
    "Counter": "Počítadlo:",
    "Play": "Přehrát",
    "Stop": "Zastavit",
    "Measure": "Měřidlo",
    "Loop": "Smyčka",
    "Resize": "Změnit velikost",
    "Resolution": "Rozlišení",
    "Picture": "Obrázek",
    "Slider": "Jezdec",
    "Speed": "Rychlost",
    "Bias": "Potenciál",
    "Difference": "Rozdíl",
    "Closest hills": "Nejbližší kopce",
    "Click at point you want to find closest hills to": "Klikni na bod, ke kterému chceš najít nejbližší kopce",
    "ncv not set": "ncv nenastaveno",
    Increase: "Zvýšit",
    Decrease: "Snížit",
    "Change axis": "Změnit osy",
    "Automatic Z axi": "Automatická Z osa",
    "Change energy units": "Změn jednotky",
    "Energy unit": "Jednotka energie",
    "not supported": "nepodporován",
    "not implemented": "neimplementováno",
    "Could not initialise": "Nepodařil se inicializovat",
    //"the shader program":"",
    "loaded": "nahráno",
    "Wrong length of texture array": "Špatná délka pole pro texturu",
    "Released": "Uvolněn",
    "3 and more CVs": "tři a více CV",
    "lines successfully parsed": "řádků úspěšně nahráno",
    "Unknown parameter:": "Neznámý parametr:",
    "Empty file": "Prázdný soubor",
    "Cannot rearrange array, wrong length": "Nelze setřídit pole, špatná délka",
    "Wrong middle point": "Špatný středový bod",
    "Data sorted,": "Data seřazena,",
    "reorderings": "přemístění",
    "Wrong number of CV": "Špatný počet CV",
    "Variable sigma is not supported": "Proměnná velikost sigmy není podporována",
    "resize conducted": "Provedena změna velikosti",
    "Drop your HILLS files here": "Přesuňte sem HILLS soubory",
    "Extremes": "Extrémy",
    "Settings": "Nastavení",
    "Text size": "Velikost textu",
    "Export": "Export",
    "Export as": "Exportovat jako",
    "Current resolution of plot": "Současná velikost grafu"
  }
});
var Lang = function (arg1) {
  var args, dict, ret, i, nel,
      lan = control.settings.lang.get();
  if (lan === "eng") {
    if (arg1.pop) {
      ret = arg1;
    } else {
      ret = Array.prototype.slice.call(arguments);
    }
  } else {
    if (arg1.pop) {
      args = arg1;
    } else {
      args = arguments;
    }
    dict = view.lang[lan];
    ret = [];
    for (i = 0; i < args.length; i += 1) {
      nel = dict[args[i]];
      if (nel === undefined) {
        nel = args[i];
      }
      ret.push(nel);
    }
  }
  return ret.join(" ");
};
// @license-end
