<?php
include("MyTXT.php");
$mytxt = new MyTXT("notes.dtb",":|:",["author","text"]);
if($mytxt->rows!=="."){
    print(json_encode($mytxt->rows));
}else{
    print("[]");
}
$mytxt->close();
?>
