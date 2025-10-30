<?php
/**
 * API Quản lý Liên hệ Khách hàng
 * FILE: api/contacts.php
 * Cho phép Staff/Admin xem và cập nhật trạng thái liên hệ.
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/auth/middleware.php'; // Sử dụng middleware

enableCORS();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// ---- Xử lý Routing ----
$contactId = null;
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));
$apiIndex = array_search('api', $pathParts);

// Lấy ID từ URL nếu có (cho PUT) vd: /api/contacts.php/12
if ($apiIndex !== false && isset($pathParts[$apiIndex + 2]) && is_numeric($pathParts[$apiIndex + 2])) {
    $contactId = (int)$pathParts[$apiIndex + 2];
}

try {
    // Yêu cầu quyền Staff hoặc Admin cho tất cả hành động
    $currentUser = requireStaff();

    switch ($method) {
        case 'GET':
            // Lấy danh sách liên hệ (có thể lọc theo status, search)
            getAllContacts($db);
            break;

        case 'PUT':
            // Cập nhật trạng thái của một liên hệ
            if (!$contactId) {
                throw new Exception("Thiếu ID liên hệ để cập nhật", 400);
            }
            updateContactStatus($db, $contactId, $currentUser['id']);
            break;

        default:
            throw new Exception("Method không được hỗ trợ", 405);
    }
} catch (Exception $e) {
    error_log("Contacts API Exception: " . $e->getMessage() . " Code: " . $e->getCode());
    $statusCode = ($e->getCode() >= 400 && $e->getCode() < 600) ? $e->getCode() : 500;
    sendJsonResponse(false, null, "Lỗi Server: " . $e->getMessage(), $statusCode);
}

/**
 * Lấy danh sách tất cả liên hệ
 */
function getAllContacts($db) {
    $search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : null;
    $status = isset($_GET['status']) ? sanitizeInput($_GET['status']) : null; // 'pending' hoặc 'responded'

    $query = "SELECT
                ct.ContactID, ct.CustomerID, ct.Subject, ct.Message, ct.Status, ct.CreatedAt, ct.UpdatedAt,
                u.FullName AS CustomerName, u.Email AS CustomerEmail, u.Phone AS CustomerPhone, u.Address AS CustomerAddress,
                r.FullName AS ResponderName
              FROM Contacts ct
              JOIN Users u ON ct.CustomerID = u.UserID
              LEFT JOIN Users r ON ct.RespondedBy = r.UserID -- Join để lấy tên người phản hồi
              WHERE 1=1";

    $params = [];

    // Thêm điều kiện lọc theo trạng thái
    if ($status === 'pending' || $status === 'responded') {
        $query .= " AND ct.Status = :status";
        $params[':status'] = $status;
    }

    // Thêm điều kiện tìm kiếm (Tên KH, Email, SĐT, Tiêu đề)
    if ($search) {
        $query .= " AND (u.FullName LIKE :search OR u.Email LIKE :search OR u.Phone LIKE :search OR ct.Subject LIKE :search)";
        $params[':search'] = "%" . $search . "%";
    }

    $query .= " ORDER BY ct.CreatedAt DESC"; // Sắp xếp mới nhất lên đầu

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $contacts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    sendJsonResponse(true, $contacts, "Lấy danh sách liên hệ thành công");
}

/**
 * Cập nhật trạng thái của một liên hệ (thành 'responded')
 */
function updateContactStatus($db, $contactId, $staffUserId) {
    // Chỉ cho phép cập nhật thành 'responded'
    $newStatus = 'responded';

    // Lấy trạng thái hiện tại để tránh cập nhật lại nếu đã 'responded'
    $checkQuery = "SELECT Status FROM Contacts WHERE ContactID = :id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':id', $contactId, PDO::PARAM_INT);
    $checkStmt->execute();
    $currentContact = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$currentContact) {
        throw new Exception("Không tìm thấy liên hệ", 404);
    }

    if ($currentContact['Status'] === 'responded') {
        sendJsonResponse(true, null, "Liên hệ đã được phản hồi trước đó.");
        return;
    }

    // Cập nhật trạng thái và người phản hồi
    $query = "UPDATE Contacts SET
                Status = :status,
                RespondedBy = :staff_id,
                RespondedAt = NOW(),
                UpdatedAt = NOW()
              WHERE ContactID = :id AND Status = 'pending'"; // Chỉ cập nhật nếu đang pending

    try {
        $stmt = $db->prepare($query);
        $stmt->bindParam(':status', $newStatus, PDO::PARAM_STR);
        $stmt->bindParam(':staff_id', $staffUserId, PDO::PARAM_INT);
        $stmt->bindParam(':id', $contactId, PDO::PARAM_INT);

        if ($stmt->execute()) {
            if ($stmt->rowCount() > 0) {
                 sendJsonResponse(true, null, "Đánh dấu đã phản hồi thành công");
            } else {
                 // Có thể đã có người khác cập nhật trước
                 sendJsonResponse(true, null, "Liên hệ có thể đã được xử lý.");
            }
        } else {
            throw new Exception("Lỗi khi cập nhật cơ sở dữ liệu.");
        }
    } catch (PDOException $e) {
         error_log("Update Contact Status PDOException: " . $e->getMessage());
         throw new Exception("Lỗi cơ sở dữ liệu khi cập nhật trạng thái.", 500);
    } catch (Exception $e) {
         error_log("Update Contact Status Exception: " . $e->getMessage());
         throw new Exception("Lỗi không xác định khi cập nhật trạng thái: " . $e->getMessage(), 500);
    }
}
?>
