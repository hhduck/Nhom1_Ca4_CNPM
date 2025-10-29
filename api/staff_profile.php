<?php
/**
 * API Cập nhật Thông tin & Mật khẩu Nhân viên (GỘP)
 * FILE: api/staff_profile.php
 * Xử lý:
 * - PUT /api/staff_profile.php/{id} -> Cập nhật thông tin (Tên, SĐT, Địa chỉ)
 * - POST /api/staff_profile.php     -> Đổi mật khẩu (cho người dùng đã đăng nhập)
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);

// Yêu cầu các file cấu hình và xác thực
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/auth/middleware.php'; //

enableCORS(); // Hàm này từ config/database.php

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// ======================================================
// XỬ LÝ PUT: CẬP NHẬT THÔNG TIN (TÊN, SĐT, ĐỊA CHỈ)
// ======================================================
if ($method === 'PUT') {
    
    // Lấy ID nhân viên từ URL (ví dụ: /api/staff_profile.php/5)
    $url_parts = explode('/', $_SERVER['REQUEST_URI']);
    $resourceUserId = (int) end($url_parts);

    if ($resourceUserId === 0) {
        sendJsonResponse(false, null, "Thiếu ID nhân viên trên URL", 400);
        exit;
    }

    // BƯỚC 1: XÁC THỰC VÀ ỦY QUYỀN (Phải là chủ sở hữu hoặc admin)
    try {
        // Hàm này từ middleware.php kiểm tra token VÀ quyền sở hữu
        $loggedInUser = requireOwnerOrAdmin($resourceUserId); 
    } catch (Exception $e) {
        sendJsonResponse(false, null, $e->getMessage(), $e->getCode() ?: 403);
        exit;
    }

    // BƯỚC 2: NHẬN VÀ GIẢI MÃ DỮ LIỆU
    $data = json_decode(file_get_contents("php://input"));
    if (json_last_error() !== JSON_ERROR_NONE || empty($data)) {
        sendJsonResponse(false, null, "Dữ liệu JSON không hợp lệ", 400);
        exit;
    }

    if (empty(trim($data->full_name))) {
         sendJsonResponse(false, null, "Họ và Tên không được để trống", 400);
         exit;
    }

    // BƯỚC 3: CẬP NHẬT CƠ SỞ DỮ LIỆU
    // Cập nhật các trường Tên, SĐT, Địa chỉ trong bảng Users
    $query = "UPDATE Users SET
                FullName = :fullname,
                Phone = :phone,
                Address = :address,
                UpdatedAt = NOW()
              WHERE UserID = :id";
    
    try {
        $stmt = $db->prepare($query);

        $fullName = htmlspecialchars(strip_tags(trim($data->full_name)));
        $phone = htmlspecialchars(strip_tags(trim($data->phone)));
        $address = htmlspecialchars(strip_tags(trim($data->address)));

        $stmt->bindParam(':fullname', $fullName);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':address', $address);
        $stmt->bindParam(':id', $resourceUserId, PDO::PARAM_INT);

        if (!$stmt->execute()) {
            throw new Exception("Lỗi khi cập nhật cơ sở dữ liệu.");
        }

        // BƯỚC 4: LẤY LẠI DỮ LIỆU MỚI GỬI VỀ FRONTEND
        // (JavaScript cần dữ liệu mới này để cập nhật localStorage)
        $selectQuery = "SELECT UserID as id, Username as username, Email as email, FullName as full_name, Phone as phone, Address as address, Role as role, Status as status
                        FROM Users 
                        WHERE UserID = :id"; //
        $selectStmt = $db->prepare($selectQuery);
        $selectStmt->bindParam(':id', $resourceUserId, PDO::PARAM_INT);
        $selectStmt->execute();
        $updatedUser = $selectStmt->fetch(PDO::FETCH_ASSOC);

        // Gửi về response thành công (khớp với cấu trúc JS mong đợi)
        sendJsonResponse(true, ['user' => $updatedUser], "Cập nhật hồ sơ thành công");

    } catch (Exception $e) {
        error_log("Update Staff Error: " . $e->getMessage());
        sendJsonResponse(false, null, "Lỗi máy chủ nội bộ: " . $e->getMessage(), 500);
    }

// ======================================================
// XỬ LÝ POST: ĐỔI MẬT KHẨU
// ======================================================
} elseif ($method === 'POST') {
    
    try {
        // BƯỚC 1: XÁC THỰC NGƯỜI DÙNG (Chỉ cần đăng nhập)
        // Hàm này từ middleware.php chỉ kiểm tra token
        $loggedInUser = requireAuth(); 
        $userId = $loggedInUser['id'];

        // BƯỚC 2: NHẬN VÀ GIẢI MÃ DỮ LIỆU
        $data = json_decode(file_get_contents("php://input"));

        if (json_last_error() !== JSON_ERROR_NONE || empty($data) || empty($data->oldPassword) || empty($data->newPassword)) {
            sendJsonResponse(false, null, "Dữ liệu không hợp lệ. Vui lòng cung cấp mật khẩu cũ và mới.", 400);
            exit;
        }

        $oldPassword = $data->oldPassword;
        $newPassword = $data->newPassword;

        if (strlen($newPassword) < 6) {
            sendJsonResponse(false, null, "Mật khẩu mới phải có ít nhất 6 ký tự.", 400);
            exit;
        }

        // BƯỚC 3: KIỂM TRA MẬT KHẨU CŨ
        $query = "SELECT PasswordHash FROM Users WHERE UserID = :id"; //
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $userRow = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$userRow) {
            sendJsonResponse(false, null, "Không tìm thấy người dùng.", 404);
            exit;
        }

        // So sánh mật khẩu cũ người dùng nhập với mật khẩu đã băm trong CSDL
        if (!password_verify($oldPassword, $userRow['PasswordHash'])) {
            sendJsonResponse(false, null, "Mật khẩu hiện tại không chính xác.", 401);
            exit;
        }

        // BƯỚC 4: BĂM VÀ CẬP NHẬT MẬT KHẨU MỚI
        $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);
        
        $updateQuery = "UPDATE Users SET PasswordHash = :new_hash, UpdatedAt = NOW() WHERE UserID = :id"; //
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':new_hash', $newPasswordHash);
        $updateStmt->bindParam(':id', $userId, PDO::PARAM_INT);

        if ($updateStmt->execute()) {
            sendJsonResponse(true, null, "Đổi mật khẩu thành công.");
        } else {
            throw new Exception("Lỗi khi cập nhật mật khẩu vào cơ sở dữ liệu.");
        }

    } catch (Exception $e) {
        $statusCode = ($e->getCode() >= 400) ? $e->getCode() : 500;
        sendJsonResponse(false, null, "Lỗi máy chủ: " . $e->getMessage(), $statusCode);
    }

// ======================================================
// XỬ LÝ CÁC PHƯƠNG THỨC KHÁC
// ======================================================
} else {
    sendJsonResponse(false, null, "Phương thức không được hỗ trợ", 405);
}

?>