<?php
/**
 * File: api/auth/register.php
 * API để xử lý đăng ký tài khoản mới - Lưu vào CSDL.
 * *** PHIÊN BẢN ĐÃ SỬA LỖI VÀ HOÀN CHỈNH ***
 */

ini_set('display_errors', 1); // Bật hiển thị lỗi để debug
error_reporting(E_ALL);

// *** CHÚ Ý: Đảm bảo các đường dẫn require_once này đúng ***
require_once __DIR__ . '/../config/database.php'; // Đi ra ngoài 1 cấp để vào config
require_once __DIR__ . '/middleware.php';        // File middleware cùng cấp

enableCORS(); // Hàm này giả định có trong database.php hoặc middleware.php

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// Chỉ chấp nhận phương thức POST
if ($method !== 'POST') {
    sendJsonResponse(false, null, 'Method không được hỗ trợ', 405);
    exit;
}

// --- Bắt đầu xử lý đăng ký ---
try {
    // Đọc dữ liệu JSON gửi từ register.js
    $data = json_decode(file_get_contents("php://input"));

    // --- 1. Validate dữ liệu đầu vào ---
    // Kiểm tra các trường bắt buộc từ register.js gửi lên
    if (
        !isset($data->username) || empty(trim($data->username)) ||
        !isset($data->email) || empty(trim($data->email)) ||
        !isset($data->password) || empty($data->password) ||
        !isset($data->firstName) || empty(trim($data->firstName)) || // Sửa: Dùng firstName
        !isset($data->lastName) || empty(trim($data->lastName))      // Sửa: Dùng lastName
    ) {
        throw new Exception('Thiếu thông tin đăng ký bắt buộc', 400);
    }

    // Gán biến và làm sạch (trim)
    $username = trim($data->username);
    $email = trim($data->email);
    $firstName = trim($data->firstName);
    $lastName = trim($data->lastName);
    $phone = isset($data->phone) ? trim($data->phone) : null;
    $address = isset($data->address) ? trim($data->address) : null;

    // Validate định dạng và độ dài
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
         throw new Exception('Địa chỉ email không hợp lệ', 400);
    }
    if (strlen($data->password) < 6) {
         throw new Exception('Mật khẩu phải có ít nhất 6 ký tự', 400);
    }
    if (strlen($username) < 3) {
         throw new Exception('Tên đăng nhập phải có ít nhất 3 ký tự', 400);
    }
    // (Thêm) Validate tên họ
     if (strlen($firstName) < 1) { // Ít nhất 1 ký tự
         throw new Exception('Họ không được để trống', 400);
    }
     if (strlen($lastName) < 1) { // Ít nhất 1 ký tự
         throw new Exception('Tên không được để trống', 400);
    }

    // --- 2. Kiểm tra Username hoặc Email đã tồn tại chưa ---
    $checkQuery = "SELECT UserID FROM Users WHERE Username = :username OR Email = :email";
    $checkStmt = $db->prepare($checkQuery);
    // Dùng biến đã trim() để kiểm tra
    $checkStmt->bindParam(':username', $username);
    $checkStmt->bindParam(':email', $email);
    $checkStmt->execute();

    if ($checkStmt->fetch(PDO::FETCH_ASSOC)) {
        // Kiểm tra cụ thể cái nào bị trùng để báo lỗi rõ hơn
        $checkStmt->execute(); // Chạy lại để fetch lại
        $existingUser = $checkStmt->fetch(PDO::FETCH_ASSOC);

        // Fetch lại xem username hay email trùng
        $checkUserStmt = $db->prepare("SELECT UserID FROM Users WHERE Username = :username");
        $checkUserStmt->bindParam(':username', $username);
        $checkUserStmt->execute();
        if ($checkUserStmt->fetch()) {
             throw new Exception('Tên đăng nhập đã tồn tại', 409); // 409 Conflict
        }

        $checkEmailStmt = $db->prepare("SELECT UserID FROM Users WHERE Email = :email");
        $checkEmailStmt->bindParam(':email', $email);
        $checkEmailStmt->execute();
         if ($checkEmailStmt->fetch()) {
             throw new Exception('Email đã được sử dụng', 409); // 409 Conflict
        }
        // Trường hợp hi hữu khác
        throw new Exception('Tên đăng nhập hoặc Email đã tồn tại (lỗi không xác định)', 409);
    }

    // --- 3. Băm mật khẩu (Bắt buộc phải làm) ---
    $passwordHash = password_hash($data->password, PASSWORD_DEFAULT);
    if ($passwordHash === false) {
        throw new Exception('Lỗi khi băm mật khẩu', 500);
    }

    // --- 4. Tạo FullName từ firstName và lastName ---
    $fullName = $firstName . ' ' . $lastName;

    // --- 5. Chạy lệnh INSERT vào CSDL ---
    // UserID sẽ được CSDL tự động tạo (AUTO_INCREMENT)
    // Role luôn là 'customer', Status luôn là 'active' cho người mới đăng ký
    $query = "INSERT INTO Users
              (Username, Email, PasswordHash, FullName, Phone, Address, Role, Status, CreatedAt, UpdatedAt)
              VALUES
              (:username, :email, :password, :fullname, :phone, :address, 'customer', 'active', NOW(), NOW())";

    $stmt = $db->prepare($query);

    // Bind các giá trị đã được làm sạch và validate
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $passwordHash); // Lưu hash, không lưu pass gốc
    $stmt->bindParam(':fullname', $fullName);    // Dùng fullName đã ghép
    $stmt->bindParam(':phone', $phone);          // Dùng phone đã trim (hoặc null)
    $stmt->bindParam(':address', $address);      // Dùng address đã trim (hoặc null)

    // Thực thi lệnh INSERT
    if ($stmt->execute()) {
        // Lấy ID của user vừa tạo
        $userId = $db->lastInsertId();
        // Gửi phản hồi thành công về cho register.js
        sendJsonResponse(true, ['user_id' => $userId], 'Đăng ký tài khoản thành công', 201); // 201 Created
    } else {
        // Nếu INSERT thất bại
        error_log("Register API SQL Error: " . implode(";", $stmt->errorInfo())); // Ghi log lỗi SQL chi tiết
        throw new Exception('Không thể tạo tài khoản do lỗi máy chủ cơ sở dữ liệu', 500);
    }

} catch (Exception $e) {
    // Bắt tất cả các lỗi (validate, trùng lặp, CSDL...) và gửi về dạng JSON
    $statusCode = ($e->getCode() >= 400 && $e->getCode() < 600) ? $e->getCode() : 500;
    // Gửi message lỗi cụ thể về cho frontend để hiển thị
    sendJsonResponse(false, ['error_details' => $e->getMessage()], $e->getMessage(), $statusCode);
}
?>