<?php
/**
 * Register API
 * LA CUISINE NGỌT
 * FILE: api/auth/register.php
 */

require_once __DIR__ . '/../config/database.php';

enableCORS();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    register($db);
} else {
    sendJsonResponse(false, null, "Method không được hỗ trợ", 405);
}

function register($db) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (empty($data['username']) || empty($data['email']) || empty($data['password']) || empty($data['full_name'])) {
        sendJsonResponse(false, null, "Thiếu thông tin bắt buộc", 400);
    }
    
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        sendJsonResponse(false, null, "Email không hợp lệ", 400);
    }
    
    if (strlen($data['password']) < 6) {
        sendJsonResponse(false, null, "Mật khẩu phải có ít nhất 6 ký tự", 400);
    }
    
    $checkQuery = "SELECT UserID FROM Users WHERE Username = :username";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':username', $data['username']);
    $checkStmt->execute();
    
    if ($checkStmt->fetch()) {
        sendJsonResponse(false, null, "Tên đăng nhập đã tồn tại", 400);
    }
    
    $checkQuery = "SELECT UserID FROM Users WHERE Email = :email";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':email', $data['email']);
    $checkStmt->execute();
    
    if ($checkStmt->fetch()) {
        sendJsonResponse(false, null, "Email đã được sử dụng", 400);
    }
    
    $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);
    
    $query = "INSERT INTO Users 
              (Username, Email, PasswordHash, FullName, Phone, Address, Role, Status) 
              VALUES 
              (:username, :email, :password, :fullname, :phone, :address, 'customer', 'active')";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':username', sanitizeInput($data['username']));
    $stmt->bindParam(':email', sanitizeInput($data['email']));
    $stmt->bindParam(':password', $passwordHash);
    $stmt->bindParam(':fullname', sanitizeInput($data['full_name']));
    $stmt->bindParam(':phone', sanitizeInput($data['phone'] ?? ''));
    $stmt->bindParam(':address', sanitizeInput($data['address'] ?? ''));
    
    if ($stmt->execute()) {
        $userId = $db->lastInsertId();
        
        $token = base64_encode(json_encode([
            'user_id' => $userId,
            'username' => $data['username'],
            'role' => 'customer',
            'exp' => time() + (7 * 24 * 60 * 60)
        ]));
        
        $userQuery = "SELECT 
                        UserID as id,
                        Username as username,
                        Email as email,
                        FullName as full_name,
                        Phone as phone,
                        Address as address,
                        Role as role,
                        Status as status
                      FROM Users 
                      WHERE UserID = :id";
        
        $userStmt = $db->prepare($userQuery);
        $userStmt->bindParam(':id', $userId);
        $userStmt->execute();
        $user = $userStmt->fetch();
        
        sendJsonResponse(true, [
            'user' => $user,
            'token' => $token
        ], "Đăng ký thành công", 201);
    } else {
        sendJsonResponse(false, null, "Không thể tạo tài khoản", 500);
    }
}