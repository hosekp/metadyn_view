<?php
$author=$_POST["author"];
$text=$_POST["text"];

include("MyTXT.php");
#$mytxt = new MyTXT();
#$mytxt->delimiter = ":|:";
#$mytxt->read("notes.dtb");

$mytxt = new MyTXT("notes.dtb",":|:",["author","text"]);
$mytxt->add_row(array($author,$text));
if($mytxt->rows!=="."){
    print(json_encode($mytxt->rows));
    $mytxt->save("notes.dtb");
}else{
    print("[]");
}
$mytxt->close();
?>
