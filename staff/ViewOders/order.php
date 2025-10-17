<?php

/**
 * FILE: order.php
 * MỤC ĐÍCH: Kết nối đến cơ sở dữ liệu, truy vấn tất cả đơn hàng từ bảng 'orders',
 * và trả về kết quả dưới dạng JSON để phía front-end (JavaScript) có thể sử dụng.
 */

// BƯỚC 1: THÔNG TIN KẾT NỐI CƠ SỞ DỮ LIỆU ------------------------------------
$servername = "localhost";        // Địa chỉ máy chủ CSDL, thường là 'localhost'
$username = "root";               // Tên người dùng CSDL mặc định của XAMPP
$password = "";                   // Mật khẩu CSDL mặc định của XAMPP là rỗng
$dbname = "la_cuisine_ngot";    // Tên cơ sở dữ liệu bạn đã tạo

// BƯỚC 2: TẠO KẾT NỐI ĐẾN MYSQL --------------------------------------------
// Sử dụng MySQLi để tạo một đối tượng kết nối mới
$conn = new mysqli($servername, $username, $password, $dbname);

// Đặt bảng mã kết nối là UTF-8 để hỗ trợ tiếng Việt
$conn->set_charset("utf8");

// Kiểm tra nếu kết nối không thành công, dừng chương trình và báo lỗi
if ($conn->connect_error) {
    // die() sẽ dừng ngay lập tức việc thực thi mã PHP
    die("Connection failed: " . $conn->connect_error);
}

// BƯỚC 3: TRUY VẤN VÀ LẤY DỮ LIỆU -------------------------------------------
// Viết câu lệnh SQL để lấy tất cả các cột cần thiết từ bảng 'orders'
// DATE_FORMAT() được dùng để định dạng ngày tháng thành 'dd/mm/yyyy' cho dễ đọc
$sql = "SELECT id, customerName, DATE_FORMAT(orderDate, '%d/%m/%Y') AS date, total, status FROM orders";

// Thực thi câu lệnh SQL và lưu kết quả vào biến $result
$result = $conn->query($sql);

// Chuẩn bị một mảng trống để chứa tất cả các đơn hàng lấy được
$orders = array();

// Kiểm tra xem câu lệnh truy vấn có trả về kết quả nào không
if ($result && $result->num_rows > 0) {
    // Nếu có, lặp qua từng dòng kết quả
    // fetch_assoc() lấy một dòng kết quả dưới dạng một mảng kết hợp (tên cột => giá trị)
    while ($row = $result->fetch_assoc()) {
        // Thêm dòng dữ liệu (đơn hàng) vào mảng $orders
        $orders[] = $row;
    }
}

// BƯỚC 4: TRẢ KẾT QUẢ DƯỚI DẠNG JSON ---------------------------------------
// Thiết lập HTTP header để thông báo cho trình duyệt rằng nội dung trả về là JSON
// Điều này rất quan trọng để hàm fetch() trong JavaScript có thể xử lý đúng
header('Content-Type: application/json');

// Sử dụng json_encode() để chuyển đổi mảng PHP ($orders) thành một chuỗi JSON
// và in chuỗi đó ra. Đây chính là dữ liệu mà JavaScript sẽ nhận được.
echo json_encode($orders);

// BƯỚC 5: ĐÓNG KẾT NỐI -----------------------------------------------------
// Giải phóng bộ nhớ và tài nguyên bằng cách đóng kết nối đến CSDL
$conn->close();
