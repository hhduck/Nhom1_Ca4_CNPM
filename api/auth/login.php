<?php
/**
 * Login API
 * LA CUISINE NGỌT
 * FILE: api/auth/login.php
 */

// ✅ FIX: Thêm error reporting để debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        // ✅ FIX: Kiểm tra JSON decode
        if (json_last_error() !== JSON_ERROR_NONE) {
            sendJsonResponse(false, null, "Dữ liệu JSON không hợp lệ", 400);
        }
        
        if (empty($data['username']) || empty($data['password'])) {
            sendJsonResponse(false, null, "Thiếu thông tin đăng nhập", 400);
        }
        
        // ✅ FIX: Sanitize input
        $username = sanitizeInput($data['username']);
        $password = $data['password']; // Không sanitize password để giữ nguyên
    
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
              WHERE Username = :username OR Email = :email";
    
        $stmt = $db->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':email', $username); // ✅ FIX: Bind parameter thứ 2
        $stmt->execute();
    
        $user = $stmt->fetch();
        
        if (!$user) {
            sendJsonResponse(false, null, "Tên đăng nhập không tồn tại", 401);
        }
        
        // Kiểm tra mật khẩu
        if (!password_verify($password, $user['password_hash'])) {
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
        
    } catch (Exception $e) {
        error_log("Login Error: " . $e->getMessage());
        sendJsonResponse(false, null, "Có lỗi xảy ra khi đăng nhập", 500);
    }
}