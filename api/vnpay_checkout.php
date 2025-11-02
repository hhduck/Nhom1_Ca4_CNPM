<?php
// Tệp: api/vnpay_checkout.php
// API này nhận (order_code, final_amount) và trả về (paymentURL)

require_once __DIR__ . '/vnpay_config.php';
require_once __DIR__ . '/config/database.php'; // Để dùng sendJsonResponse

enableCORS(); // Đảm bảo tệp này cho phép CORS

$method = $_SERVER['REQUEST_METHOD'];

// Cho phép pre-flight
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit();
}

if ($method !== 'POST') {
    sendJsonResponse(false, null, "Method Not Allowed", 405);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['order_code']) || empty($data['final_amount'])) {
    sendJsonResponse(false, null, "Thiếu thông tin đơn hàng", 400);
    exit();
}

// Lấy thông tin từ config
global $vnp_TmnCode, $vnp_HashSecret, $vnp_Url, $vnp_Returnurl;

$vnp_TxnRef = $data['order_code']; // Mã đơn hàng
$vnp_OrderInfo = "Thanh toan don hang " . $vnp_TxnRef;
$vnp_OrderType = 'billpayment';
$vnp_Amount = $data['final_amount'] * 100; // VNPay yêu cầu nhân 100
$vnp_Locale = 'vn';
$vnp_BankCode = ''; // Để trống để khách chọn ngân hàng
$vnp_IpAddr = '8.8.8.8';

$inputData = array(
    "vnp_Version" => "2.1.0",
    "vnp_TmnCode" => $vnp_TmnCode,
    "vnp_Amount" => $vnp_Amount,
    "vnp_Command" => "pay",
    "vnp_CreateDate" => date('YmdHis'),
    "vnp_CurrCode" => "VND",
    "vnp_IpAddr" => $vnp_IpAddr,
    "vnp_Locale" => $vnp_Locale,
    "vnp_OrderInfo" => $vnp_OrderInfo,
    "vnp_OrderType" => $vnp_OrderType,
    "vnp_ReturnUrl" => $vnp_Returnurl,
    "vnp_TxnRef" => $vnp_TxnRef
);

if (isset($vnp_BankCode) && $vnp_BankCode != "") {
    $inputData['vnp_BankCode'] = $vnp_BankCode;
}

ksort($inputData);
$query = "";
$i = 0;
$hashdata = "";
foreach ($inputData as $key => $value) {
    if ($i == 1) {
        $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
    } else {
        $hashdata .= urlencode($key) . "=" . urlencode($value);
        $i = 1;
    }
    $query .= urlencode($key) . "=" . urlencode($value) . '&';
}

$vnp_Url = $vnp_Url . "?" . $query;
if (isset($vnp_HashSecret)) {
    $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
    $vnp_Url .= 'vnp_SecureHash=' . $vnpSecureHash;
}

// Trả về URL thanh toán cho pay.js
sendJsonResponse(true, ["paymentURL" => $vnp_Url], "Tạo link thành công");