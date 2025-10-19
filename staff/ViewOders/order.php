<?php
// order.php - PHIÊN BẢN CẬP NHẬT ĐẦY ĐỦ

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "la_cuisine_ngot";

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

if ($conn->connect_error) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => 'Connection failed: ' . $conn->connect_error]);
    die();
}

$method = $_SERVER['REQUEST_METHOD'];

// GET - Lấy danh sách đơn hàng
if ($method === 'GET') {
    $sql = "SELECT id, customerName, DATE_FORMAT(orderDate, '%d/%m/%Y') AS date, total, status, phone, address, paymentMethod, cancelReason FROM orders ORDER BY orderDate DESC";
    $result = $conn->query($sql);
    $orders = array();
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $orders[] = $row;
        }
    }
    header('Content-Type: application/json');
    echo json_encode($orders);
} 
// POST - Cập nhật trạng thái đơn hàng (confirm/cancel)
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $orderId = $data['id'];
    $newStatus = $data['status'];
    $reason = isset($data['reason']) ? $data['reason'] : null;

    if ($reason !== null && $newStatus === 'failed') {
        $stmt = $conn->prepare("UPDATE orders SET status = ?, cancelReason = ? WHERE id = ?");
        $stmt->bind_param("sss", $newStatus, $reason, $orderId);
    } else {
        $stmt = $conn->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $stmt->bind_param("ss", $newStatus, $orderId);
    }

    header('Content-Type: application/json');
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Cập nhật thành công']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Cập nhật thất bại: ' . $conn->error]);
    }
    $stmt->close();
}
// PUT - Cập nhật thông tin đơn hàng
elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    $orderId = $data['id'];
    $customerName = $data['customerName'];
    $phone = isset($data['phone']) ? $data['phone'] : null;
    $address = isset($data['address']) ? $data['address'] : null;
    $total = isset($data['total']) ? $data['total'] : 0;
    $paymentMethod = isset($data['paymentMethod']) ? $data['paymentMethod'] : null;

    $stmt = $conn->prepare("UPDATE orders SET customerName = ?, phone = ?, address = ?, total = ?, paymentMethod = ? WHERE id = ?");
    $stmt->bind_param("sssiss", $customerName, $phone, $address, $total, $paymentMethod, $orderId);

    header('Content-Type: application/json');
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Cập nhật đơn hàng thành công']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Cập nhật thất bại: ' . $conn->error]);
    }
    $stmt->close();
}

$conn->close();
?>