<?php
/**
 * Users API - ĐÃ TÍCH HỢP TÌM KIẾM NHÂN VIÊN (KHÔNG CẦN ADMIN)
 * LA CUISINE NGỌT
 * FILE: api/users.php
 */

ini_set('display_errors', 1); // Bật hiển thị lỗi để dễ debug
error_reporting(E_ALL);

require_once __DIR__ . '/config/database.php';
// Giả định middleware.php chứa checkAdminPermission()
// và các hàm khác như sanitizeInput() nếu bạn dùng
require_once __DIR__ . '/auth/middleware.php';

enableCORS(); // Giả định hàm này có trong database.php hoặc middleware.php

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// ---- Xử lý Routing ----
$userId = null;
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));
$apiIndex = array_search('api', $pathParts);

// Lấy ID từ URL nếu có (cho PUT, DELETE) ví dụ: /api/users/123
if ($apiIndex !== false && isset($pathParts[$apiIndex + 2]) && is_numeric($pathParts[$apiIndex + 2])) {
    $userId = (int)$pathParts[$apiIndex + 2];
}


try {
    switch($method) {
        case 'GET':
            // *** TÍCH HỢP LOGIC TÌM KIẾM NHÂN VIÊN VÀO ĐÂY ***
            // Kiểm tra xem có phải yêu cầu tìm kiếm nhân viên không?
            if (isset($_GET['role']) && $_GET['role'] === 'staff' && isset($_GET['search'])) {
                // Nếu đúng, gọi hàm tìm kiếm (KHÔNG cần checkAdminPermission)
                findStaffByName($db, $_GET['search']);
            } else {
                // Nếu không, đây là yêu cầu lấy danh sách (cần quyền Admin)
                checkAdminPermission(); // Chỉ kiểm tra quyền ở đây
                getAllUsers($db);
            }
            break;
            // *** KẾT THÚC TÍCH HỢP ***

        case 'POST':
            checkAdminPermission();
            createUser($db);
            break;

        case 'PUT':
            checkAdminPermission();
            if (!$userId) throw new Exception("Thiếu User ID để cập nhật", 400);
            updateUser($db, $userId); // Truyền $userId vào hàm
            break;

        case 'DELETE':
            checkAdminPermission();
            if (!$userId) throw new Exception("Thiếu User ID để xóa", 400);
            deleteUser($db, $userId); // Truyền $userId vào hàm
            break;

        default:
            sendJsonResponse(false, null, "Method không được hỗ trợ", 405);
    }
} catch(Exception $e) {
    // Ghi log lỗi chi tiết hơn
    error_log("Users API Error: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
    $statusCode = ($e->getCode() >= 400 && $e->getCode() < 600) ? $e->getCode() : 500;
    // Chỉ gửi thông báo lỗi chung chung cho client
    sendJsonResponse(false, null, "Có lỗi xảy ra phía máy chủ", $statusCode);
}

// ============================================
// CÁC HÀM XỬ LÝ (Định nghĩa 1 lần)
// ============================================

/**
 * Lấy danh sách tất cả người dùng (yêu cầu Admin)
 */
function getAllUsers($db) {
    $search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : null;
    $role = isset($_GET['role']) ? sanitizeInput($_GET['role']) : null;

    $query = "SELECT
                UserID as id, Username as username, Email as email,
                FullName as full_name, Phone as phone, Address as address,
                Role as role, Status as status, Avatar as avatar, -- Sửa is_active thành status
                CreatedAt as created_at, LastLogin as last_login
              FROM Users
              WHERE 1=1";

    $params = [];

    if ($search) {
        $query .= " AND (Username LIKE :search OR FullName LIKE :search OR Email LIKE :search)";
        $params[':search'] = "%$search%";
    }

    if ($role) {
        $query .= " AND Role = :role";
        $params[':role'] = $role;
    }

    $query .= " ORDER BY CreatedAt DESC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);

    // Dùng FETCH_ASSOC để có mảng kết hợp thay vì cả số và chữ
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Trả về cấu trúc { success: true, data: { users: [...], total: ... } } cho nhất quán
    sendJsonResponse(true, ["users" => $users, "total" => count($users)], "Lấy danh sách người dùng thành công");
}

/**
 * Tìm nhân viên theo tên (KHÔNG yêu cầu Admin)
 * (Không phân biệt hoa/thường, dấu, khoảng trắng)
 */
function findStaffByName($db, $name) {
    // Hàm sanitizeInput giả định có trong middleware.php hoặc database.php
    $name = sanitizeInput($name);

    if (empty(trim($name))) {
        sendJsonResponse(false, null, "Tên tìm kiếm không được rỗng", 400);
        return;
    }

    // --- Chuẩn hóa tên nhập vào ---
    $normalizedInput = mb_strtolower(trim(preg_replace('/\s+/', ' ', $name)), 'UTF-8');
    $searchTerm = str_replace(' ', '', $normalizedInput);

    // --- Chuẩn bị câu truy vấn ---
    $query = "SELECT UserID, FullName
              FROM Users
              WHERE Role = 'staff'
                AND Status = 'active'
                AND LOWER(REPLACE(FullName, ' ', '')) = :searchTerm COLLATE utf8mb4_general_ci";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':searchTerm', $searchTerm);
    $stmt->execute();

    $staffMembers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $count = count($staffMembers);

    if ($count === 1) {
        // Tìm thấy chính xác 1 người -> Trả về thông tin người đó trong 'data'
        sendJsonResponse(true, $staffMembers[0], "Tìm thấy nhân viên");
    } elseif ($count > 1) {
        // Tìm thấy nhiều người (tên bị trùng)
        sendJsonResponse(false, null, "Tên nhân viên không eindeutig, tìm thấy nhiều kết quả.");
    } else {
        // Không tìm thấy
        sendJsonResponse(false, null, "Không tìm thấy nhân viên.");
    }
}


/**
 * Tạo người dùng mới (yêu cầu Admin)
 */
function createUser($db) {
    $data = json_decode(file_get_contents("php://input"), true);

    // Validate dữ liệu đầu vào
    if (empty($data['full_name']) || empty($data['email']) || empty($data['role'])) {
        sendJsonResponse(false, null, "Thiếu thông tin bắt buộc (Họ tên, Email, Vai trò)", 400);
        return;
    }
     // Kiểm tra role hợp lệ
    if (!in_array($data['role'], ['customer', 'staff', 'admin'])) {
        sendJsonResponse(false, null, "Vai trò không hợp lệ", 400);
        return;
    }
     // Kiểm tra email hợp lệ
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        sendJsonResponse(false, null, "Email không hợp lệ", 400);
        return;
    }

    // Kiểm tra email tồn tại
    $checkQuery = "SELECT UserID FROM Users WHERE Email = :email";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':email', $data['email']);
    $checkStmt->execute();

    if ($checkStmt->fetch()) {
        sendJsonResponse(false, null, "Email đã tồn tại", 409); // 409 Conflict
        return;
    }

    // Tạo username và password mặc định
    $username = explode('@', $data['email'])[0] . rand(10, 99); // Thêm số ngẫu nhiên để tránh trùng
    $defaultPassword = password_hash('123456', PASSWORD_DEFAULT);

    $query = "INSERT INTO Users
              (Username, Email, PasswordHash, FullName, Phone, Address, Role, Status, CreatedAt, UpdatedAt)
              VALUES
              (:username, :email, :password, :fullname, :phone, :address, :role, 'active', NOW(), NOW())";

    $stmt = $db->prepare($query);

    // Sanitize input trước khi bind
    $email = sanitizeInput($data['email']);
    $fullName = sanitizeInput($data['full_name']); // Sửa key 'fullname' thành 'full_name'
    $phone = sanitizeInput($data['phone'] ?? '');
    $address = sanitizeInput($data['address'] ?? '');
    $role = sanitizeInput($data['role']);

    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $defaultPassword);
    $stmt->bindParam(':fullname', $fullName);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':address', $address);
    $stmt->bindParam(':role', $role);

    if ($stmt->execute()) {
        sendJsonResponse(true, [
            "user_id" => $db->lastInsertId(),
            "default_password" => "123456" // Nhắc admin mật khẩu mặc định
        ], "Thêm người dùng thành công", 201); // 201 Created
    } else {
        // Ghi log lỗi chi tiết hơn
        error_log("Failed to create user: " . implode(";", $stmt->errorInfo()));
        sendJsonResponse(false, null, "Không thể thêm người dùng do lỗi máy chủ", 500);
    }
}

/**
 * Cập nhật người dùng (yêu cầu Admin)
 */
function updateUser($db, $id) { // Nhận $id làm tham số
    $data = json_decode(file_get_contents("php://input"), true);

    // Validate dữ liệu tối thiểu
     if (empty($data['full_name']) || empty($data['role'])) {
        sendJsonResponse(false, null, "Thiếu thông tin bắt buộc (Họ tên, Vai trò)", 400);
        return;
    }
     if (!in_array($data['role'], ['customer', 'staff', 'admin'])) {
        sendJsonResponse(false, null, "Vai trò không hợp lệ", 400);
        return;
    }

    // Chỉ cập nhật các trường cho phép
    $query = "UPDATE Users SET
              FullName = :fullname,
              Phone = :phone,
              Address = :address,
              Role = :role,
              Status = :status, -- Thêm cập nhật Status
              UpdatedAt = NOW()
              WHERE UserID = :id";

    $stmt = $db->prepare($query);

    // Sanitize input
    $fullName = sanitizeInput($data['full_name']); // Sửa key
    $phone = sanitizeInput($data['phone'] ?? '');
    $address = sanitizeInput($data['address'] ?? '');
    $role = sanitizeInput($data['role']);
    $status = sanitizeInput($data['status'] ?? 'active'); // Thêm status, mặc định là active
    if (!in_array($status, ['active', 'inactive', 'banned'])) { $status = 'active'; } // Validate status

    $stmt->bindParam(':id', $id, PDO::PARAM_INT); // Chỉ định kiểu INT
    $stmt->bindParam(':fullname', $fullName);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':address', $address);
    $stmt->bindParam(':role', $role);
    $stmt->bindParam(':status', $status); // Bind status

    if ($stmt->execute()) {
        // Kiểm tra xem có hàng nào thực sự được cập nhật không
        if ($stmt->rowCount() > 0) {
            sendJsonResponse(true, null, "Cập nhật người dùng thành công");
        } else {
            // Có thể ID không tồn tại hoặc dữ liệu không thay đổi
            sendJsonResponse(false, null, "Không tìm thấy người dùng hoặc không có gì thay đổi", 404);
        }
    } else {
        error_log("Failed to update user ID $id: " . implode(";", $stmt->errorInfo()));
        sendJsonResponse(false, null, "Không thể cập nhật người dùng do lỗi máy chủ", 500);
    }
}

/**
 * Xóa người dùng (yêu cầu Admin)
 */
function deleteUser($db, $id) { // Nhận $id làm tham số
    // Ngăn xóa admin chính (giả sử UserID=1 là admin gốc)
    if ($id == 1) {
        sendJsonResponse(false, null, "Không thể xóa tài khoản quản trị viên chính", 403);
        return;
    }

    // Nên kiểm tra xem user có tồn tại không trước khi xóa
    $checkQuery = "SELECT UserID FROM Users WHERE UserID = :id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':id', $id, PDO::PARAM_INT);
    $checkStmt->execute();

    if (!$checkStmt->fetch()) {
        sendJsonResponse(false, null, "Không tìm thấy người dùng để xóa", 404);
        return;
    }

    // Cân nhắc: Có nên xóa hẳn hay chỉ đổi Status thành 'inactive'?
    // Xóa hẳn:
    $query = "DELETE FROM Users WHERE UserID = :id";
    // Chỉ đổi status:
    // $query = "UPDATE Users SET Status = 'inactive', UpdatedAt = NOW() WHERE UserID = :id";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);

    if ($stmt->execute()) {
        sendJsonResponse(true, null, "Xóa người dùng thành công");
        // Nếu chỉ đổi status: sendJsonResponse(true, null, "Vô hiệu hóa người dùng thành công");
    } else {
        error_log("Failed to delete user ID $id: " . implode(";", $stmt->errorInfo()));
        sendJsonResponse(false, null, "Không thể xóa người dùng do lỗi máy chủ", 500);
    }
}

?>