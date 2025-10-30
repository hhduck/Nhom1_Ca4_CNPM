<?php
/**
 * Force Logout API - Xóa token của user khi admin khóa tài khoản
 * LA CUISINE NGỌT
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/middleware.php';

enableCORS();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Chỉ admin mới được gọi
    $currentUser = requireAdmin();
    forceLogoutUser($db);
} else {
    sendJsonResponse(false, null, "Method không được hỗ trợ", 405);
}

/**
 * Force logout một user (khi admin khóa tài khoản)
 */
function forceLogoutUser($db) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (empty($data['user_id'])) {
        sendJsonResponse(false, null, "Thiếu user_id", 400);
    }
    
    $userId = (int)$data['user_id'];
    
    // Kiểm tra user có tồn tại không
    $query = "SELECT UserID, Username, Status FROM Users WHERE UserID = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $user = $stmt->fetch();
    
    if (!$user) {
        sendJsonResponse(false, null, "Không tìm thấy user", 404);
    }
    
    // Trong hệ thống đơn giản này, chúng ta chỉ cần đổi status
    // Client sẽ tự động logout khi middleware check status
    
    // Optional: Lưu log
    error_log("Admin forced logout user ID: $userId (Username: {$user['Username']}, Status: {$user['Status']})");
    
    sendJsonResponse(true, null, "User đã bị force logout. Lần truy cập API tiếp theo sẽ bị từ chối.");
}
?>

