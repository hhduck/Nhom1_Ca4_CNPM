<?php
/**
 * Forgot Password API
 * LA CUISINE NGỌT
 * FILE: api/auth/forgot-password.php
 * 
 * Reset password về mật khẩu mặc định "123456" cho user dựa trên email
 */

ini_set('display_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

enableCORS();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendJsonResponse(false, null, "Method không được hỗ trợ", 405);
    exit;
}

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (json_last_error() !== JSON_ERROR_NONE || empty($data) || empty($data['email'])) {
        sendJsonResponse(false, null, "Email không được để trống", 400);
        exit;
    }
    
    $email = sanitizeInput($data['email']);
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendJsonResponse(false, null, "Email không hợp lệ", 400);
        exit;
    }
    
    // Tìm user theo email
    $query = "SELECT UserID, Email, FullName, Role FROM Users WHERE Email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        // Không tiết lộ email có tồn tại hay không (bảo mật)
        sendJsonResponse(true, null, "Nếu email tồn tại trong hệ thống, mật khẩu đã được reset về mặc định: 123456");
        exit;
    }
    
    // Kiểm tra trạng thái tài khoản
    $checkStatusQuery = "SELECT Status FROM Users WHERE UserID = :id";
    $checkStatusStmt = $db->prepare($checkStatusQuery);
    $checkStatusStmt->bindParam(':id', $user['UserID'], PDO::PARAM_INT);
    $checkStatusStmt->execute();
    $statusRow = $checkStatusStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($statusRow && $statusRow['Status'] === 'banned') {
        sendJsonResponse(false, null, "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.", 403);
        exit;
    }
    
    // Reset password về mặc định "123456"
    $defaultPassword = '123456';
    $newPasswordHash = password_hash($defaultPassword, PASSWORD_DEFAULT);
    
    $updateQuery = "UPDATE Users SET PasswordHash = :new_hash, UpdatedAt = NOW() WHERE UserID = :id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(':new_hash', $newPasswordHash);
    $updateStmt->bindParam(':id', $user['UserID'], PDO::PARAM_INT);
    
    if ($updateStmt->execute()) {
        sendJsonResponse(true, [
            'default_password' => $defaultPassword,
            'email' => $email
        ], "Mật khẩu đã được reset về mặc định: 123456. Vui lòng đăng nhập và đổi mật khẩu ngay.");
    } else {
        error_log("Failed to reset password for email $email: " . implode(";", $updateStmt->errorInfo()));
        sendJsonResponse(false, null, "Lỗi khi reset mật khẩu. Vui lòng thử lại sau.", 500);
    }
    
} catch (Exception $e) {
    error_log("Forgot Password API Error: " . $e->getMessage());
    $statusCode = ($e->getCode() >= 400 && $e->getCode() < 600) ? $e->getCode() : 500;
    sendJsonResponse(false, null, "Có lỗi xảy ra phía máy chủ", $statusCode);
}
?>

