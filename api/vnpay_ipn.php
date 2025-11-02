<?php
// Tệp: api/vnpay_ipn.php
// Đây là file VNPay server sẽ gọi "bí mật"
require_once __DIR__ . '/vnpay_config.php';
require_once __DIR__ . '/config/database.php';

// Ghi log để debug (quan trọng khi dùng ngrok)
// Bạn có thể xem log này trong thư mục /api/ipn.log
error_log("IPN: Nhận được yêu cầu từ VNPay lúc " . date('Y-m-d H:i:s') . "\n", 3, __DIR__ . '/ipn.log');
error_log("IPN Data: " . file_get_contents('php://input') . "\n", 3, __DIR__ . '/ipn.log');
error_log("IPN Params: " . http_build_query($_REQUEST) . "\n", 3, __DIR__ . '/ipn.log');


// Lấy thông tin từ VNPay
$inputData = array();
$returnData = array();
$data = $_REQUEST; // VNPay gửi IPN qua cả GET và POST

foreach ($data as $key => $value) {
    if (substr($key, 0, 4) == "vnp_") {
        $inputData[$key] = $value;
    }
}

global $vnp_HashSecret;
$vnp_SecureHash = $inputData['vnp_SecureHash'];
unset($inputData['vnp_SecureHash']);
ksort($inputData);
$i = 0;
$hashData = "";
foreach ($inputData as $key => $value) {
    if ($i == 1) {
        $hashData = $hashData . '&' . urlencode($key) . "=" . urlencode($value);
    } else {
        $hashData = $hashData . urlencode($key) . "=" . urlencode($value);
        $i = 1;
    }
}

$secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);
$vnp_TxnRef = $inputData['vnp_TxnRef']; // Mã đơn hàng (OrderCode)
$vnp_ResponseCode = $inputData['vnp_ResponseCode']; // Mã phản hồi
$vnp_TransactionStatus = $inputData['vnp_TransactionStatus']; // Trạng thái GD
$vnp_Amount = $inputData['vnp_Amount'] / 100; // Số tiền

try {
    // Kết nối CSDL
    $database = new Database();
    $db = $database->getConnection();

    // 1. Kiểm tra chữ ký (secureHash)
    if ($secureHash == $vnp_SecureHash) {

        // 2. Tìm đơn hàng trong CSDL
        $orderQuery = "SELECT OrderID, FinalAmount, OrderStatus FROM Orders WHERE OrderCode = :order_code";
        $stmt = $db->prepare($orderQuery);
        $stmt->execute([':order_code' => $vnp_TxnRef]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($order != null) {
            // 3. Kiểm tra số tiền
            if ($order['FinalAmount'] == $vnp_Amount) {
                // 4. Chỉ cập nhật nếu đơn hàng đang là 'pending'
                if ($order['OrderStatus'] == 'pending') {

                    $newStatus = 'pending';
                    $paymentStatus = 'failed';

                    if ($vnp_ResponseCode == '00' && $vnp_TransactionStatus == '00') {
                        // Trạng thái thanh toán thành công
                        $newStatus = 'order_received'; // Cập nhật thành 'Đã tiếp nhận'
                        $paymentStatus = 'paid';
                    } else {
                        // Thanh toán thất bại
                        $newStatus = 'delivery_failed'; // Hoặc 'cancelled'
                        $paymentStatus = 'failed';
                    }

                    // 5. CẬP NHẬT CSDL
                    $updateQuery = "UPDATE Orders 
                                    SET OrderStatus = :order_status, PaymentStatus = :payment_status, UpdatedAt = NOW() 
                                    WHERE OrderID = :order_id";
                    $updateStmt = $db->prepare($updateQuery);
                    $updateStmt->execute([
                        ':order_status' => $newStatus,
                        ':payment_status' => $paymentStatus,
                        ':order_id' => $order['OrderID']
                    ]);

                    error_log("IPN: Cập nhật CSDL thành công cho " . $vnp_TxnRef . " sang " . $newStatus . "\n", 3, __DIR__ . '/ipn.log');
                    $returnData['RspCode'] = '00';
                    $returnData['Message'] = 'Confirm Success';
                } else {
                    error_log("IPN: Đơn hàng đã được xác nhận trước đó: " . $vnp_TxnRef . "\n", 3, __DIR__ . '/ipn.log');
                    $returnData['RspCode'] = '02';
                    $returnData['Message'] = 'Order already confirmed';
                }
            } else {
                error_log("IPN: Sai số tiền. CSDL: " . $order['FinalAmount'] . " vs VNPay: " . $vnp_Amount . "\n", 3, __DIR__ . '/ipn.log');
                $returnData['RspCode'] = '04';
                $returnData['Message'] = 'Invalid amount';
            }
        } else {
            error_log("IPN: Không tìm thấy đơn hàng: " . $vnp_TxnRef . "\n", 3, __DIR__ . '/ipn.log');
            $returnData['RspCode'] = '01';
            $returnData['Message'] = 'Order not found';
        }
    } else {
        error_log("IPN: Sai chữ ký (Invalid Checksum)\n", 3, __DIR__ . '/ipn.log');
        $returnData['RspCode'] = '97';
        $returnData['Message'] = 'Invalid Checksum';
    }

} catch (Exception $e) {
    error_log("IPN: Lỗi không xác định: " . $e->getMessage() . "\n", 3, __DIR__ . '/ipn.log');
    $returnData['RspCode'] = '99';
    $returnData['Message'] = 'Unknown error';
}

// Trả về kết quả cho VNPay server
echo json_encode($returnData);
?>