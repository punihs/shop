<?php

extract($_REQUES);
include 'lib.php';

$data = array(
    "vpc_Version" => "1",
    "vpc_AccessCode" => "YIAX9875",
    "vpc_Command" => "pay",
    "vpc_MerchTxnRef" => $MerchTxnRef."-".time(),
    "vpc_MerchantId" => "13I000000000978",
    "vpc_Amount" => round($finalAmount) * 100,
    "vpc_OrderInfo" => $orderInfo,
    "vpc_ReturnURL" => $redirectUrl
);

//------ store original data
$posted_data = $data;

//------- sort on keys
ksort($data);

$SECURE_SECRET = "7BB594D45D47D87893121FDD7CC7672A";  //Add secure secret here
if($data){
    $str = $SECURE_SECRET;
    foreach($data as $key => $val){
        $str = $str . $val;
    }
}

$str = hash('sha256', utf8_encode($str));

$posted_data["vpc_SecureHash"] = $str;

ksort($posted_data);

$processed_data = $posted_data;
if($processed_data){
    $str = "";
    foreach($processed_data as $key => $val){
        $str .= $key."=".$val."::";
    }
    // remove last occurrence of ::
    $pos = strrpos($str, "::");
    if($pos !== false){
        $str = substr_replace($str, "", $pos, strlen("::"));
    }
}

$key = "FC36C5D9E2DC28856FEB90DAD5E84C66";

$ciphertext_base64 = encrypt($str, $key);

$encrypted_data = array();
$encrypted_data["vpc_MerchantId"] = $posted_data["vpc_MerchantId"];
$encrypted_data["encrypted_data"] = $ciphertext_base64;

echo json_encode($encrypted_data);
