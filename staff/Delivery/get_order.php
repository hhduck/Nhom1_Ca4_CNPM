<?php
/**
 * LOCATION: pages/staff/Delivery/get_order.php
 */

// Load database từ api/config
require_once __DIR__ . '/../../../api/config/database.php';

enableCORS();

$database = new Database();
$db = $database->getConnection();

// Kiểm tra method
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method không hỗ trợ'], JSON_UNESCAPED_UNICODE);
    exit();
}

// Lấy orderId từ URL
$orderId = isset($_GET['orderId']) ? sanitizeInput($_GET['orderId']) : null;

if (!$orderId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Thiếu mã đơn hàng'], JSON_UNESCAPED_UNICODE);
    exit();
}

try {
    $query = "SELECT 
                o.OrderCode,
                o.CustomerName,
                o.CustomerPhone,
                o.ShippingAddress,
                o.Ward,
                o.District,
                o.City,
                o.DeliveryDate,
                o.Note,
                o.OrderStatus,
                o.CancellationReason
              FROM Orders o
              WHERE o.OrderCode = ?";
    
    $stmt = $db->prepare($query);
    $stmt->execute([$orderId]);
    $order = $stmt->fetch();
    
    if (!$order) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Không tìm thấy đơn hàng'], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    // Format địa chỉ
    $address = $order['ShippingAddress'];
    if ($order['Ward']) $address .= ', ' . $order['Ward'];
    if ($order['District']) $address .= ', ' . $order['District'];
    if ($order['City']) $address .= ', ' . $order['City'];
    
    // Format ngày
    $date = !empty($order['DeliveryDate']) ? date('d/m/Y', strtotime($order['DeliveryDate'])) : '';
    
    // Map status
    $statusMap = [
        'pending' => 'Pending',
        'confirmed' => 'Confirmed',
        'preparing' => 'Preparing',
        'shipping' => 'Shipping',
        'completed' => 'Delivered',
        'cancelled' => 'Returned'
    ];
    
    $status = $statusMap[$order['OrderStatus']] ?? $order['OrderStatus'];
    $returnToWarehouse = ($order['OrderStatus'] === 'cancelled' && !empty($order['CancellationReason'])) ? 1 : 0;
    
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'orderId' => $order['OrderCode'],
        'customerName' => $order['CustomerName'],
        'phoneNumber' => $order['CustomerPhone'],
        'deliveryAddress' => $address,
        'deliveryDate' => $date,
        'note' => $order['Note'] ?? '',
        'status' => $status,
        'returnReason' => $order['CancellationReason'] ?? '',
        'returnToWarehouse' => $returnToWarehouse
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Lỗi server'], JSON_UNESCAPED_UNICODE);
}
?>