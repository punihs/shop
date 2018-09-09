<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require 'lib.php';

extract($_REQUEST);

$key = "FC36C5D9E2DC28856FEB90DAD5E84C66";
//print_r($EncDataResp);

$ciphertext_base64 = $EncDataResp;
$ciphertext_dec = tdecrypt($ciphertext_base64, $key);

$pos = strrpos($ciphertext_dec, "::");
if ($pos !== false) {
    $ciphertext_dec = substr_replace($ciphertext_dec, "", $pos, strlen("::"));
}

$array_data_string = explode("::", $ciphertext_dec);

$result = array();
if ($array_data_string) {
    foreach ($array_data_string as $value) {
        $temp_array = explode("||", $value);
        $result[$temp_array[0]] = $temp_array[1];
    }
}

if (isset($result) && !empty($result)) {
    echo json_encode([ 'status' => 'success', 'status_code' => $result['vpc_TxnResponseCode'], 'data' => $result]);
} else {
    echo json_encode([ 'status' => 'failure', 'status_code' => $result['vpc_TxnResponseCode'], 'data' => $result]);
}

