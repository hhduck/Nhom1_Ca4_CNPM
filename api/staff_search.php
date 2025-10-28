<?php
/**
 * File: api/staff_search.php
 * API CHUYÊN DỤNG: Chỉ dùng để tìm kiếm Nhân viên (staff)
 * PHIÊN BẢN 2: Báo cáo lỗi PDO chi tiết
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/auth/middleware.php'; 

enableCORS();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    // Yêu cầu đăng nhập (ít nhất là Staff)
    $currentUser = requireStaff(); 
    
    if ($method !== 'GET') {
        throw new Exception("Method không được hỗ trợ", 405);
    }

    $role = isset($_GET['role']) ? sanitizeInput($_GET['role']) : null;
    $search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : null;

    if ($role !== 'staff') {
         throw new Exception("API này chỉ hỗ trợ tìm kiếm 'staff'", 400);
    }
    
    if (empty($search)) {
        throw new Exception("Thiếu tham số 'search'", 400);
    }

    // Câu lệnh SQL chính xác (từ schema.sql)
    $query = "SELECT 
                UserID as id, 
                FullName as full_name
              FROM Users
              WHERE 
                Role = :role 
                AND Status = 'active'
                AND FullName LIKE :search";
    
    $params = [
        ':role' => $role,
        ':search' => "%" . $search . "%"
    ];
    
    $stmt = $db->prepare($query);
    
    // Thực thi câu lệnh
    if (!$stmt->execute($params)) {
        // Nếu execute thất bại, ném ra lỗi chi tiết
        throw new Exception("Lỗi thực thi SQL: " + implode(", ", $stmt->errorInfo()));
    }
    
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Trả về định dạng mà JS mong đợi
    $data = [
        'users' => $users
    ];
    
    sendJsonResponse(true, $data, "Tìm thấy " . count($users) . " nhân viên.");

} catch (PDOException $e) {
    // Bắt lỗi CỤ THỂ từ PDO (Database)
    error_log("staff_search.php PDOException: " . $e->getMessage());
    sendJsonResponse(false, null, "Lỗi Database (PDO): " . $e->getMessage(), 500);

} catch (Exception $e) {
    // Bắt các lỗi chung khác (ví dụ: 400, 405, hoặc lỗi execute)
    error_log("staff_search.php Exception: " . $e->getMessage());
    $statusCode = ($e->getCode() >= 400 && $e->getCode() < 600) ? $e->getCode() : 500;
    sendJsonResponse(false, null, "Lỗi máy chủ chung: " . $e->getMessage(), $statusCode);
}
?> 