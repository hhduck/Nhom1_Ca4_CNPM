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
    switch ($method) {
        case 'GET':
            // Kiểm tra xem có userId trong URL không
            if ($userId) {
                // Cho phép customer xem thông tin của chính họ, hoặc admin xem tất cả
                requireOwnerOrAdmin($userId);
                getUserById($db, $userId);
            } 
            // Kiểm tra xem có phải yêu cầu tìm kiếm nhân viên không?
            elseif (isset($_GET['role']) && $_GET['role'] === 'staff' && isset($_GET['search'])) {
                // Tìm kiếm staff không yêu cầu admin (đã được implement sẵn trong findStaffByName)
                findStaffByName($db, $_GET['search']);
            } 
            else {
                // Xem danh sách tất cả users chỉ dành cho admin
                checkAdminPermission();
                getAllUsers($db);
            }
            break;

        case 'POST':
            checkAdminPermission();
            createUser($db);
            break;

        case 'PUT':
            if (!$userId) throw new Exception("Thiếu User ID để cập nhật", 400);
            // Cho phép customer cập nhật thông tin của chính họ, hoặc admin cập nhật tất cả
            requireOwnerOrAdmin($userId);
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
} catch (Exception $e) {
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
function getAllUsers($db)
{
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
        $query .= " AND (Username LIKE :search1 OR FullName LIKE :search2 OR Email LIKE :search3)";
        $params[':search1'] = "%$search%";
        $params[':search2'] = "%$search%";
        $params[':search3'] = "%$search%";
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
function findStaffByName($db, $name)
{
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
function createUser($db)
{
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
 * Cập nhật người dùng
 * - Admin có thể cập nhật tất cả thông tin (bao gồm role, status)
 * - Customer chỉ có thể cập nhật thông tin cá nhân của chính họ (không được thay đổi role, status)
 * Hỗ trợ partial update - chỉ update các field được gửi lên
 */
function updateUser($db, $id)
{ // Nhận $id làm tham số
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Lấy thông tin user hiện tại để kiểm tra quyền
    $currentUser = requireAuth();
    $isAdmin = ($currentUser['role'] === 'admin');
    $isOwner = ($currentUser['id'] == $id);

    // Nếu chỉ update status (khóa/mở tài khoản) - CHỈ ADMIN
    if (isset($data['status']) && count($data) == 1) {
        if (!$isAdmin) {
            sendJsonResponse(false, null, "Bạn không có quyền thay đổi trạng thái tài khoản", 403);
            return;
        }
        
        $status = sanitizeInput($data['status']);
        if (!in_array($status, ['active', 'inactive', 'banned'])) {
            sendJsonResponse(false, null, "Trạng thái không hợp lệ", 400);
            return;
        }

        $query = "UPDATE Users SET Status = :status, UpdatedAt = NOW() WHERE UserID = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':status', $status);

        if ($stmt->execute() && $stmt->rowCount() > 0) {
            sendJsonResponse(true, null, "Cập nhật trạng thái thành công");
        } else {
            sendJsonResponse(false, null, "Không tìm thấy người dùng", 404);
        }
        return;
    }

    // Customer chỉ có thể cập nhật thông tin cá nhân (full_name, phone, address)
    if ($isOwner && !$isAdmin) {
        // Không cho phép customer thay đổi role hoặc status
        if (isset($data['role']) || isset($data['status'])) {
            sendJsonResponse(false, null, "Bạn không có quyền thay đổi vai trò hoặc trạng thái", 403);
            return;
        }
        
        // Cập nhật thông tin cá nhân
        $fields = [];
        $params = [':id' => $id];
        
        if (isset($data['full_name'])) {
            $fields[] = "FullName = :fullname";
            $params[':fullname'] = sanitizeInput($data['full_name']);
        }
        if (isset($data['phone'])) {
            $fields[] = "Phone = :phone";
            $params[':phone'] = sanitizeInput($data['phone']);
        }
        if (isset($data['address'])) {
            $fields[] = "Address = :address";
            $params[':address'] = sanitizeInput($data['address']);
        }
        
        if (empty($fields)) {
            sendJsonResponse(false, null, "Không có thông tin nào để cập nhật", 400);
            return;
        }
        
        $fields[] = "UpdatedAt = NOW()";
        $query = "UPDATE Users SET " . implode(", ", $fields) . " WHERE UserID = :id";
        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        if ($stmt->execute()) {
            if ($stmt->rowCount() > 0) {
                // Lấy thông tin user đã cập nhật để trả về
                getUserById($db, $id);
            } else {
                sendJsonResponse(true, null, "Không có gì thay đổi");
            }
        } else {
            error_log("Failed to update user ID $id: " . implode(";", $stmt->errorInfo()));
            sendJsonResponse(false, null, "Không thể cập nhật người dùng do lỗi máy chủ", 500);
        }
        return;
    }

    // Admin update đầy đủ thông tin
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
              Status = :status,
              UpdatedAt = NOW()
              WHERE UserID = :id";

    $stmt = $db->prepare($query);

    // Sanitize input
    $fullName = sanitizeInput($data['full_name']);
    $phone = sanitizeInput($data['phone'] ?? '');
    $address = sanitizeInput($data['address'] ?? '');
    $role = sanitizeInput($data['role']);
    $status = sanitizeInput($data['status'] ?? 'active');
    if (!in_array($status, ['active', 'inactive', 'banned'])) {
        $status = 'active';
    }

    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->bindParam(':fullname', $fullName);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':address', $address);
    $stmt->bindParam(':role', $role);
    $stmt->bindParam(':status', $status);

    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            // Lấy thông tin user đã cập nhật để trả về
            getUserById($db, $id);
        } else {
            sendJsonResponse(true, null, "Không có gì thay đổi");
        }
    } else {
        error_log("Failed to update user ID $id: " . implode(";", $stmt->errorInfo()));
        sendJsonResponse(false, null, "Không thể cập nhật người dùng do lỗi máy chủ", 500);
    }
}

/**
 * Lấy thông tin 1 người dùng theo ID
 */
function getUserById($db, $id)
{
    $query = "SELECT
                UserID as id, Username as username, Email as email,
                FullName as full_name, Phone as phone, Address as address,
                Role as role, Status as status, Avatar as avatar,
                CreatedAt as created_at, LastLogin as last_login
              FROM Users
              WHERE UserID = :id";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        sendJsonResponse(false, null, "Không tìm thấy người dùng", 404);
        return;
    }
    
    sendJsonResponse(true, $user, "Lấy thông tin người dùng thành công");
}

/**
 * Xóa người dùng (yêu cầu Admin)
 */
function deleteUser($db, $id)
{ // Nhận $id làm tham số
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