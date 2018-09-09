<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require 'lib.php';

extract($_REQUEST);

//print_r([
//$vpc_access_code,
//$payment_id,
//$merchant_id,
//$final_amount,
//$redirect_url
//]);
//
//exit;

$data = array(
    "vpc_Version" => "1",
    "vpc_AccessCode" => $vpc_access_code,
    "vpc_Command" => "pay",
    "vpc_MerchTxnRef" => "SHIP" . $payment_id . "-" . time(),
    "vpc_MerchantId" => $merchant_id,
    "vpc_Amount" => round(20) * 100,
    "vpc_OrderInfo" => "DPAYMENT# " . $payment_id,
    "vpc_ReturnURL" => $redirect_url,
);

//------ store original data
$posted_data = $data;

//------- sort on keys
ksort($data);

if ($data) {
    $str = $secure_secret;
    foreach ($data as $key => $val) {
        $str = $str . $val;
    }
}

$str = hash('sha256', utf8_encode($str));

$posted_data["vpc_SecureHash"] = $str;

ksort($posted_data);

$processed_data = $posted_data;
if ($processed_data) {
    $str = "";
    foreach ($processed_data as $key => $val) {
        $str .= $key . "=" . $val . "::";
    }
    // remove last occurrence of ::
    $pos = strrpos($str, "::");
    if ($pos !== false) {
        $str = substr_replace($str, "", $pos, strlen("::"));
    }
}

$ciphertext_base64 = tencrypt($str, $axis_key);

$encrypted_data = array();
$encrypted_data["vpc_MerchantId"] = $posted_data["vpc_MerchantId"];
$encrypted_data["encrypted_data"] = $ciphertext_base64;

echo "<!DOCTYPE html>
  <html>
  <head>
      <title>Payment Gateway Redirecting - Please Wait</title>
  </head>
  <body>
    <center><h1>Please do not refresh this page...</h1></center>
      <form name=\"redirect\" action=\"https://geniusepay.in/VAS/DCC/doEnc.action\" method=\"post\" accept-charset=\"ISO-8859-1\" align=\"center\">
          <input type=\"hidden\" name=\"vpc_MerchantId\" value=\"" . $encrypted_data["vpc_MerchantId"] . "\" />
           <input type=\"hidden\" name=\"EncData\" value=\"" . $encrypted_data["encrypted_data"] . "\" />
      </form>
  <script language='javascript'>document.redirect.submit();</script>
  </body>
  </html>";
