<?php

/**
 * File: api/staff_search.php
 * PHIÊN BẢN SỬA ĐỔI (28/10/2025)
 * - Thay đổi logic: Tìm nhân viên (staff) bằng UserID (tham số 'id')
 * - Bỏ tìm kiếm bằng 'search' (FullName)
 * - Trả về một object 'data' duy nhất, không phải mảng 'users'
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

    // (SỬA) Lấy 'id' thay vì 'search'
    $staffId = isset($_GET['id']) ? sanitizeInput($_GET['id']) : null;

    if (empty($staffId) || !is_numeric($staffId)) {
        throw new Exception("Thiếu hoặc sai tham số 'id' (phải là một con số)", 400);
    }

    // (SỬA) Câu lệnh SQL tìm chính xác bằng UserID và Role
    $query = "SELECT 
                UserID as id, 
                FullName as full_name
              FROM Users
              WHERE 
                Role = 'staff' 
                AND Status = 'active'
                AND UserID = :id";

    $params = [
        ':id' => $staffId
    ];

    $stmt = $db->prepare($query);

    if (!$stmt->execute($params)) {
        throw new Exception("Lỗi thực thi SQL: " + implode(", ", $stmt->errorInfo()));
    }

    // (SỬA) Lấy một kết quả (fetch) thay vì (fetchAll)
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Trả về định dạng mà JS mới mong đợi
        sendJsonResponse(true, $user, "Tìm thấy nhân viên.");
    } else {
        // Vẫn trả về success=true nhưng data=null (hoặc false) để JS biết là "không tìm thấy"
        sendJsonResponse(false, null, "Không tìm thấy nhân viên với ID này.");
    }
} catch (PDOException $e) {
    error_log("staff_search.php PDOException: " . $e->getMessage());
    sendJsonResponse(false, null, "Lỗi Database (PDO): " . $e->getMessage(), 500);
} catch (Exception $e) {
    error_log("staff_search.php Exception: " . $e->getMessage());
    $statusCode = ($e->getCode() >= 400 && $e->getCode() < 600) ? $e->getCode() : 500;
    sendJsonResponse(false, null, "Lỗi máy chủ chung: " . $e->getMessage(), $statusCode);
}
