<?php
/**
 * LOCATION: pages/staff/Delivery/confirm_delivery.php
 */

require_once __DIR__ . '/../../../api/config/database.php';

enableCORS();

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method không hỗ trợ'], JSON_UNESCAPED_UNICODE);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['orderId'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Thiếu mã đơn hàng'], JSON_UNESCAPED_UNICODE);
    exit();
}

$orderId = sanitizeInput($data['orderId']);

try {
    $db->beginTransaction();
    
    // Kiểm tra đơn hàng
    $checkQuery = "SELECT OrderID, OrderStatus FROM Orders WHERE OrderCode = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$orderId]);
    $order = $checkStmt->fetch();
    
    if (!$order) {
        $db->rollBack();
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Không tìm thấy đơn hàng'], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    if ($order['OrderStatus'] === 'completed') {
        $db->rollBack();
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Đơn hàng đã xác nhận'], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    if ($order['OrderStatus'] === 'cancelled') {
        $db->rollBack();
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Không thể xác nhận đơn đã hủy'], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    // Cập nhật trạng thái
    $updateQuery = "UPDATE Orders SET 
                    OrderStatus = 'completed',
                    CompletedAt = NOW(),
                    UpdatedAt = NOW()
                    WHERE OrderCode = ?";
    
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->execute([$orderId]);
    
    // Thêm lịch sử
    $historyQuery = "INSERT INTO OrderStatusHistory 
                    (OrderID, OldStatus, NewStatus, Note, CreatedAt) 
                    VALUES (?, ?, 'completed', 'Đã xác nhận giao hàng', NOW())";
    
    $historyStmt = $db->prepare($historyQuery);
    $historyStmt->execute([$order['OrderID'], $order['OrderStatus']]);
    
    // Cập nhật số lượng bán
    $updateSoldQuery = "UPDATE Products p
                       INNER JOIN OrderItems oi ON p.ProductID = oi.ProductID
                       SET p.SoldCount = p.SoldCount + oi.Quantity
                       WHERE oi.OrderID = ?";
    
    $updateSoldStmt = $db->prepare($updateSoldQuery);
    $updateSoldStmt->execute([$order['OrderID']]);
    
    $db->commit();
    
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'success', 'message' => 'Xác nhận giao hàng thành công'], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Lỗi server'], JSON_UNESCAPED_UNICODE);
}
?>