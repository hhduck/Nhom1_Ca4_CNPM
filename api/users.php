<?php
/**
 * Users API
 * LA CUISINE NGỌT
 * FILE: api/users.php
 */

require_once __DIR__ . '/config/database.php';

enableCORS();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            checkAdminPermission();
            getAllUsers($db);
            break;
            
        case 'POST':
            checkAdminPermission();
            createUser($db);
            break;
            
        case 'PUT':
            checkAdminPermission();
            updateUser($db);
            break;
            
        case 'DELETE':
            checkAdminPermission();
            deleteUser($db);
            break;
            
        default:
            sendJsonResponse(false, null, "Method không được hỗ trợ", 405);
    }
} catch(Exception $e) {
    error_log("Users API Error: " . $e->getMessage());
    sendJsonResponse(false, null, "Có lỗi xảy ra", 500);
}

function getAllUsers($db) {
    $search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : null;
    $role = isset($_GET['role']) ? sanitizeInput($_GET['role']) : null;
    
    $query = "SELECT 
                UserID as id,
                Username as username,
                Email as email,
                FullName as full_name,
                Phone as phone,
                Address as address,
                Role as role,
                Status as is_active,
                Avatar as avatar,
                CreatedAt as created_at,
                LastLogin as last_login
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
    
    $users = $stmt->fetchAll();
    
    sendJsonResponse(true, [
        "users" => $users,
        "total" => count($users)
    ], "Lấy danh sách người dùng thành công");
}

function createUser($db) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (empty($data['fullname']) || empty($data['email'])) {
        sendJsonResponse(false, null, "Thiếu thông tin bắt buộc", 400);
    }
    
    $checkQuery = "SELECT UserID FROM Users WHERE Email = :email";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':email', $data['email']);
    $checkStmt->execute();
    
    if ($checkStmt->fetch()) {
        sendJsonResponse(false, null, "Email đã tồn tại", 400);
    }
    
    $username = explode('@', $data['email'])[0];
    $defaultPassword = password_hash('123456', PASSWORD_DEFAULT);
    
    $query = "INSERT INTO Users 
              (Username, Email, PasswordHash, FullName, Phone, Address, Role, Status) 
              VALUES 
              (:username, :email, :password, :fullname, :phone, :address, :role, 'active')";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':email', sanitizeInput($data['email']));
    $stmt->bindParam(':password', $defaultPassword);
    $stmt->bindParam(':fullname', sanitizeInput($data['fullname']));
    $stmt->bindParam(':phone', sanitizeInput($data['phone'] ?? ''));
    $stmt->bindParam(':address', sanitizeInput($data['address'] ?? ''));
    $stmt->bindParam(':role', $data['role'] ?? 'customer');
    
    if ($stmt->execute()) {
        sendJsonResponse(true, [
            "user_id" => $db->lastInsertId(),
            "default_password" => "123456"
        ], "Thêm người dùng thành công", 201);
    } else {
        sendJsonResponse(false, null, "Không thể thêm người dùng", 500);
    }
}

function updateUser($db) {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', trim($path, '/'));
    $id = end($pathParts);
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    $query = "UPDATE Users SET 
              FullName = :fullname,
              Phone = :phone,
              Address = :address,
              Role = :role
              WHERE UserID = :id";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':fullname', sanitizeInput($data['fullname']));
    $stmt->bindParam(':phone', sanitizeInput($data['phone'] ?? ''));
    $stmt->bindParam(':address', sanitizeInput($data['address'] ?? ''));
    $stmt->bindParam(':role', $data['role']);
    
    if ($stmt->execute()) {
        sendJsonResponse(true, null, "Cập nhật người dùng thành công");
    } else {
        sendJsonResponse(false, null, "Không thể cập nhật người dùng", 500);
    }
}

function deleteUser($db) {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', trim($path, '/'));
    $id = end($pathParts);
    
    if ($id == 1) {
        sendJsonResponse(false, null, "Không thể xóa tài khoản admin chính", 403);
    }
    
    $query = "DELETE FROM Users WHERE UserID = :id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    
    if ($stmt->execute()) {
        sendJsonResponse(true, null, "Xóa người dùng thành công");
    } else {
        sendJsonResponse(false, null, "Không thể xóa người dùng", 500);
    }
}