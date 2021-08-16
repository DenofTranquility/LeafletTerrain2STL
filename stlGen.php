<?php
//Be sure to handle cors if necessary

// json handling from https://thisinterestsme.com/receiving-json-post-data-via-php/
if(strcasecmp($_SERVER['REQUEST_METHOD'], 'POST') != 0){
    throw new Exception('Request method must be POST!');
}


$content = trim(file_get_contents("php://input"));
$decoded = json_decode($content, true);

//If json_decode failed, the JSON is invalid.
if(!is_array($decoded)){
    throw new Exception('Received content contained invalid JSON!');
}
$arcSecondEquator = 30.87; // in metres
$rotation = 0;
$vScale = 1;
$waterDrop = 2;
$baseHeight = 3;
$boxScale = 1;
$form = $_POST;
$NWlat = $decoded['NWlat'];
$NWlng = $decoded['NWlng'];
// $width = $decoded['width'];
$height = $decoded['height'];

// Aspect ratio doesn't translate to the same view for some reason, this more closely approximates the correct size of box to be processed.
$width = $height * 2.33; 

$height = $height * $arcSecondEquator;
$width = $width * $arcSecondEquator;

$location = number_format($NWlat, 3) . 'N' . number_format($NWlng, 3) . 'E';

$zipname  = "./stls/terrain_". $location;
$filename = "./stls/rawmodel_". $location . ".stl";


$command = "./celevstl" . " " . escapeshellarg($NWlat) . " " . escapeshellarg($NWlng) . " " . escapeshellarg($width/3) . " "
. escapeshellarg($height/3) . " " . escapeshellarg($vScale) . " " . escapeshellarg($rotation) . " " . escapeshellarg($waterDrop) . " " .
escapeshellarg($baseHeight) . " " . escapeshellarg($boxScale) . " " . escapeshellarg($filename);
// $command .= "; zip -q " . $zipname . " " . $filename;


$startTime = date("Y-m-d H:i:s");

$paramLog = $startTime."\t".$NWlat."\t".$NWlng.
"\t".$width."\t".$height."\t".$vScale."\t".
$rotation."\t".$waterDrop."\t".$baseHeight."\t".$boxScale."\t";

print_r($command);
exec($command);

?>
