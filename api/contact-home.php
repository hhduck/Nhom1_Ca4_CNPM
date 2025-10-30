<?php
require_once __DIR__ . "/config/database.php";

header("Content-Type: application/json; charset=utf-8");

// ===== CHO PHÉP CORS =====
enableCORS();

// ===== KẾT NỐI DATABASE =====
$database = new Database();
$db = $database->getConnection();

// ===== CHỈ CHO PHÉP POST =====
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    sendJsonResponse(false, null, "Method không được hỗ trợ", 405);
}

// ===== NHẬN DỮ LIỆU JSON =====
$data = json_decode(file_get_contents("php://input"), true);

// ===== KIỂM TRA DỮ LIỆU =====
if (
    !$data ||
    empty($data["user_id"]) ||
    empty($data["subject"]) ||
    empty($data["message"])
) {
    sendJsonResponse(false, null, "Thiếu dữ liệu: user_id, subject hoặc message", 400);
}

$userId  = intval($data["user_id"]);
$subject = sanitizeInput($data["subject"]);
$message = sanitizeInput($data["message"]);

// ===== CHÈN DỮ LIỆU VÀO BẢNG Contacts =====
$query = "INSERT INTO Contacts (CustomerID, Subject, Message, Status, CreatedAt)
          VALUES (:user_id, :subject, :message, 'pending', NOW())";

try {
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $userId);
    $stmt->bindParam(":subject", $subject);
    $stmt->bindParam(":message", $message);
    $stmt->execute();

    sendJsonResponse(true, null, "Gửi liên hệ thành công!");
} catch (PDOException $e) {
    error_log("Lỗi SQL: " . $e->getMessage());
    sendJsonResponse(false, null, "Không thể lưu liên hệ vào database", 500);
}
?>
