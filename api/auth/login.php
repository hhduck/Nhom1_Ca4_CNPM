<?php
/**
 * Login API
 * LA CUISINE NGỌT
 * FILE: api/auth/login.php
 */

require_once __DIR__ . '/../config/database.php';

enableCORS();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    login($db);
} else {
    sendJsonResponse(false, null, "Method không được hỗ trợ", 405);
}

/**
 * Đăng nhập
 */
function login($db) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (empty($data['username']) || empty($data['password'])) {
        sendJsonResponse(false, null, "Thiếu thông tin đăng nhập", 400);
    }
    
    $query = "SELECT 
                UserID as id,
                Username as username,
                Email as email,
                PasswordHash as password_hash,
                FullName as full_name,
                Phone as phone,
                Address as address,
                Role as role,
                Status as status
              FROM Users
              WHERE Username = :username OR Email = :username";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':username', $data['username']);
    $stmt->execute();
    
    $user = $stmt->fetch();
    
    if (!$user) {
        sendJsonResponse(false, null, "Tên đăng nhập không tồn tại", 401);
    }
    
    // Kiểm tra mật khẩu
    if (!password_verify($data['password'], $user['password_hash'])) {
        sendJsonResponse(false, null, "Mật khẩu không chính xác", 401);
    }
    
    // Kiểm tra trạng thái tài khoản
    if ($user['status'] !== 'active') {
        sendJsonResponse(false, null, "Tài khoản đã bị khóa", 403);
    }
    
    // Cập nhật last login
    $updateQuery = "UPDATE Users SET LastLogin = NOW() WHERE UserID = :id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(':id', $user['id']);
    $updateStmt->execute();
    
    // Tạo JWT token (đơn giản hóa cho demo)
    $token = base64_encode(json_encode([
        'user_id' => $user['id'],
        'username' => $user['username'],
        'role' => $user['role'],
        'exp' => time() + (7 * 24 * 60 * 60) // 7 ngày
    ]));
    
    // Xóa password hash khỏi response
    unset($user['password_hash']);
    
    sendJsonResponse(true, [
        'user' => $user,
        'token' => $token
    ], "Đăng nhập thành công");
}