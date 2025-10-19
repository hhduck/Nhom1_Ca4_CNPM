<?php

/**
 * FILE: update.php
 * MỤC ĐÍCH:
 * 1. Nếu là yêu cầu GET: Kết nối CSDL, truy vấn và trả về danh sách tất cả đơn hàng dưới dạng JSON.
 * 2. (Chưa dùng) Nếu là yêu cầu POST: Nhận dữ liệu và cập nhật trạng thái của một đơn hàng cụ thể.
 */

// BƯỚC 1: THÔNG TIN KẾT NỐI CƠ SỞ DỮ LIỆU
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "la_cuisine_ngot";

// BƯỚC 2: TẠO KẾT NỐI VÀ KIỂM TRA
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

if ($conn->connect_error) {
    // Trả về lỗi dưới dạng JSON để front-end có thể bắt được
    header('Content-Type: application/json');
    http_response_code(500); // Lỗi server
    echo json_encode(['error' => 'Connection failed: ' . $conn->connect_error]);
    die();
}

// BƯỚC 3: XỬ LÝ YÊU CẦU
// Kiểm tra phương thức yêu cầu (GET, POST, etc.)
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Xử lý yêu cầu lấy danh sách đơn hàng
    getAllOrders($conn);
} elseif ($method === 'POST') {
    // Xử lý yêu cầu cập nhật đơn hàng (bạn có thể phát triển phần này)
    // updateOrderStatus($conn);
    // Tạm thời trả về thông báo
    header('Content-Type: application/json');
    echo json_encode(['message' => 'Chức năng cập nhật đang được phát triển.']);
}

// BƯỚC 4: ĐÓNG KẾT NỐI
$conn->close();


/**
 * Hàm truy vấn và trả về tất cả đơn hàng.
 * @param mysqli $conn - Đối tượng kết nối CSDL.
 */
function getAllOrders($conn) {
    // Câu lệnh SQL để lấy các trường cần thiết.
    // Giả sử bảng 'orders' của bạn có các cột này.
    // DATE_FORMAT để định dạng ngày tháng cho đẹp.
    $sql = "
        SELECT 
            id, 
            customerName, 
            phone,
            address,
            DATE_FORMAT(orderDate, '%d/%m/%Y') AS orderDate, 
            total,
            paymentMethod,
            status, 
            notes,
            updatedBy,
            DATE_FORMAT(updateTime, '%d/%m/%Y %H:%i') AS updateTime
        FROM 
            orders 
        ORDER BY 
            updateTime DESC
    ";

    $result = $conn->query($sql);

    $orders = array();

    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $orders[] = $row;
        }
    }

    // Trả kết quả về cho client dưới dạng chuỗi JSON
    header('Content-Type: application/json');
    echo json_encode($orders);
}

?>