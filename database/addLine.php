<?php
define("TEXTLEN",40);
$author=$_POST["author"];
$text=$_POST["text"];
if(strlen($text)>TEXTLEN){
    $short=substr($text,0,TEXTLEN);
}else{
    $short="";
}
include("MyTXT.php");
#$mytxt = new MyTXT();
#$mytxt->delimiter = ":|:";
#$mytxt->read("notes.dtb");

$mytxt = new MyTXT("notes.dtb",":|:");
$mytxt->add_row(array($author,$short,$text));
if($mytxt->rows!=="."){
    print(json_encode($mytxt->rows));
    $mytxt->save("notes.dtb");
}else{
    print("[]");
}
$mytxt->close();
?>
