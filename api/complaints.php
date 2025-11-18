<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

/**
 * API Xử lý Khiếu nại (Complaints) - ĐÃ THÊM ENDPOINT CHO KHÁCH HÀNG
 * - Staff: Xem, cập nhật, trả lời khiếu nại
 * - Customer: Gửi khiếu nại mới
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/auth/middleware.php'; 

enableCORS();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// ---- Xử lý Routing chuẩn RESTful ----
$complaintId = null;
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));
$apiIndex = array_search('api', $pathParts);

if ($apiIndex !== false && isset($pathParts[$apiIndex + 2]) && is_numeric($pathParts[$apiIndex + 2])) {
    $complaintId = (int)$pathParts[$apiIndex + 2];
}

$action = isset($_GET['action']) ? $_GET['action'] : null;

try {
    switch ($method) {
        case 'GET':
            // Chỉ staff mới xem được danh sách/chi tiết khiếu nại
            $currentUser = requireStaff();
            
            if ($complaintId) {
                getComplaintById($db, $complaintId);
            } else {
                getAllComplaints($db);
            }
            break;

        case 'POST':
            // PHÂN BIỆT: Tạo mới (customer) vs Reply (staff)
            if (!$complaintId) {
                // ✅ KHÁCH HÀNG GỬI KHIẾU NẠI MỚI (không cần staff permission)
                createComplaint($db);
            } else {
                // Staff trả lời khiếu nại
                $currentUser = requireStaff();
                if ($action === 'reply') {
                    sendReplyToCustomer($db, $complaintId, $currentUser['id']);
                } else {
                    throw new Exception("Hành động POST không hợp lệ", 400);
                }
            }
            break;

        case 'PUT':
            // Chỉ staff mới cập nhật được
            $currentUser = requireStaff();
            if (!$complaintId) throw new Exception("Thiếu ID khiếu nại", 400);
            updateComplaint($db, $complaintId, $currentUser['id']);
            break;

        case 'DELETE':
            // Chỉ admin mới xóa được
            $currentUser = requireAdmin();
            if (!$complaintId) throw new Exception("Thiếu ID khiếu nại", 400);
            deleteComplaint($db, $complaintId);
            break;

        default:
            throw new Exception("Method không được hỗ trợ", 405);
    }
} catch (Exception $e) {
    error_log("Complaints API Exception: " . $e->getMessage());
    $statusCode = ($e->getCode() >= 400 && $e->getCode() < 600) ? $e->getCode() : 500;
    sendJsonResponse(false, null, $e->getMessage(), $statusCode);
}

/**
 * ✅ HÀM MỚI: KHÁCH HÀNG GỬI KHIẾU NẠI
 */
function createComplaint($db) {
    // Xác thực người dùng (chỉ cần đăng nhập, không cần staff)
    $currentUser = requireAuth();
    
    // Chỉ cho phép customer gửi khiếu nại
    if ($currentUser['role'] !== 'customer') {
        throw new Exception("Chỉ khách hàng mới có thể gửi khiếu nại", 403);
    }
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validate dữ liệu
    if (empty($data['order_id']) || empty($data['title']) || empty($data['content'])) {
        throw new Exception("Thiếu thông tin bắt buộc (order_id, title, content)", 400);
    }
    
    $orderId = (int)$data['order_id'];
    $title = sanitizeInput($data['title']);
    $content = sanitizeInput($data['content']);
    
    // Kiểm tra đơn hàng có tồn tại và thuộc về khách hàng này không
    $checkOrderQuery = "SELECT OrderID, OrderCode FROM Orders 
                        WHERE OrderID = :order_id AND CustomerID = :customer_id";
    $checkStmt = $db->prepare($checkOrderQuery);
    $checkStmt->bindParam(':order_id', $orderId, PDO::PARAM_INT);
    $checkStmt->bindParam(':customer_id', $currentUser['id'], PDO::PARAM_INT);
    $checkStmt->execute();
    
    $order = $checkStmt->fetch(PDO::FETCH_ASSOC);
    if (!$order) {
        throw new Exception("Đơn hàng không tồn tại hoặc không thuộc về bạn", 404);
    }
    
    // Tạo mã khiếu nại (COM + timestamp)
    $complaintCode = 'COM' . date('YmdHis') . rand(100, 999);
    
    // Insert khiếu nại vào database
    $insertQuery = "INSERT INTO Complaints 
                    (ComplaintCode, OrderID, CustomerID, ComplaintType, Title, Content, 
                     Status, Priority, CreatedAt, UpdatedAt)
                    VALUES 
                    (:code, :order_id, :customer_id, 'product', :title, :content, 
                     'pending', 'medium', NOW(), NOW())";
    
    $insertStmt = $db->prepare($insertQuery);
    $insertStmt->bindParam(':code', $complaintCode);
    $insertStmt->bindParam(':order_id', $orderId, PDO::PARAM_INT);
    $insertStmt->bindParam(':customer_id', $currentUser['id'], PDO::PARAM_INT);
    $insertStmt->bindParam(':title', $title);
    $insertStmt->bindParam(':content', $content);
    
    if ($insertStmt->execute()) {
        $newComplaintId = $db->lastInsertId();
        sendJsonResponse(true, [
            'complaint_id' => $newComplaintId,
            'complaint_code' => $complaintCode,
            'message' => 'Khiếu nại đã được gửi thành công. Chúng tôi sẽ xem xét và phản hồi sớm nhất.'
        ], "Gửi khiếu nại thành công", 201);
    } else {
        throw new Exception("Không thể tạo khiếu nại do lỗi máy chủ", 500);
    }
}

/**
 * Lấy danh sách khiếu nại (CHỈ STAFF)
 */
function getAllComplaints($db) {
    $search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : null;
    $status = isset($_GET['status']) ? sanitizeInput($_GET['status']) : null;
    $query = "SELECT 
                c.ComplaintID, c.ComplaintCode, c.OrderID, c.Status, c.Title, c.Priority,
                u.FullName as CustomerName,
                o.OrderCode,
                a.FullName as AssignedStaffName,
                c.CreatedAt
              FROM Complaints c
              JOIN Users u ON c.CustomerID = u.UserID
              JOIN Orders o ON c.OrderID = o.OrderID
              LEFT JOIN Users a ON c.AssignedTo = a.UserID
              WHERE 1=1";
    $params = [];
    if ($search) {
        $query .= " AND (o.OrderCode LIKE :search1 OR u.FullName LIKE :search2 OR u.Phone LIKE :search3 OR c.ComplaintCode LIKE :search4)";
        $params[':search1'] = "%" . $search . "%";
        $params[':search2'] = "%" . $search . "%";
        $params[':search3'] = "%" . $search . "%";
        $params[':search4'] = "%" . $search . "%";
    }
    if ($status) {
        $validStatuses = ['pending', 'resolved']; 
        if (in_array($status, $validStatuses)) {
            $query .= " AND c.Status = :status";
            $params[':status'] = $status;
        }
    }
    $query .= " ORDER BY c.CreatedAt ASC";
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $complaints = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendJsonResponse(true, $complaints, "Lấy danh sách khiếu nại thành công");
}

/**
 * Lấy chi tiết 1 khiếu nại (CHỈ STAFF)
 */
function getComplaintById($db, $complaintId) {
    $query = "SELECT 
                c.ComplaintID as complaint_id,
                c.ComplaintCode as complaint_code,
                c.OrderID as order_id,
                c.CustomerID as customer_id,
                c.ComplaintType as complaint_type,
                c.Title as title,
                c.Content as content,
                c.Images as images,
                c.Status as status,
                c.Priority as priority,
                c.AssignedTo as assigned_to,
                c.Resolution as resolution,
                c.CompensationType as compensation_type,
                c.CompensationValue as compensation_value,
                c.CreatedAt as created_at,
                c.UpdatedAt as updated_at,
                c.ResolvedAt as resolved_at,
                c.ClosedAt as closed_at,
                u.FullName as customer_name,
                u.Phone as customer_phone,
                u.Email as customer_email,
                o.OrderCode as order_code,
                a.FullName as assigned_staff_name
              FROM Complaints c
              JOIN Users u ON c.CustomerID = u.UserID
              JOIN Orders o ON c.OrderID = o.OrderID
              LEFT JOIN Users a ON c.AssignedTo = a.UserID
              WHERE c.ComplaintID = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $complaintId, PDO::PARAM_INT);
    $stmt->execute();
    $complaint = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$complaint) {
        throw new Exception("Không tìm thấy khiếu nại", 404);
    }
    $respQuery = "SELECT 
                    r.ResponseID as response_id,
                    r.ComplaintID as complaint_id,
                    r.UserID as user_id,
                    r.UserType as user_type,
                    r.Content as content,
                    r.CreatedAt as created_at,
                    u.FullName as user_name 
                  FROM ComplaintResponses r
                  JOIN Users u ON r.UserID = u.UserID
                  WHERE r.ComplaintID = :id ORDER BY r.CreatedAt ASC";
    $respStmt = $db->prepare($respQuery);
    $respStmt->bindParam(':id', $complaintId, PDO::PARAM_INT);
    $respStmt->execute();
    $complaint['responses'] = $respStmt->fetchAll(PDO::FETCH_ASSOC);
    sendJsonResponse(true, $complaint, "Lấy chi tiết khiếu nại thành công");
}

/**
 * Cập nhật khiếu nại (CHỈ STAFF - đã fix lỗi HY093)
 */
function updateComplaint($db, $complaintId, $staffUserId) {
    $data = json_decode(file_get_contents("php://input"), true);
    if (empty($data)) throw new Exception("Không có dữ liệu cập nhật", 400);

    $fieldsToUpdate = [];
    $params = [':id' => $complaintId];

    if (isset($data['status'])) {
        $status = sanitizeInput($data['status']);
        $validStatuses = ['pending', 'resolved'];
        if (!in_array($status, $validStatuses)) {
            throw new Exception("Trạng thái không hợp lệ", 400);
        }
        $fieldsToUpdate[] = "Status = :status";
        $params[':status'] = $status;
        
        if ($status === 'resolved') $fieldsToUpdate[] = "ResolvedAt = NOW()";
    }
    
    if (isset($data['resolutionText'])) {
        $fieldsToUpdate[] = "Resolution = :resolution";
        $params[':resolution'] = sanitizeInput($data['resolutionText']);
    }
    
    if (array_key_exists('assignedStaffId', $data)) {
        if ($data['assignedStaffId'] !== null && is_numeric($data['assignedStaffId'])) {
            $fieldsToUpdate[] = "AssignedTo = :assigned_id";
            $params[':assigned_id'] = $data['assignedStaffId'];
        } else {
            $fieldsToUpdate[] = "AssignedTo = NULL";
        }
    }

    if (empty($fieldsToUpdate)) {
        sendJsonResponse(true, null, "Không có gì thay đổi");
        return;
    }

    $fieldsToUpdate[] = "UpdatedAt = NOW()";
    $query = "UPDATE Complaints SET " . implode(", ", $fieldsToUpdate) . " WHERE ComplaintID = :id";
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    
    sendJsonResponse(true, null, "Cập nhật khiếu nại thành công");
}

/**
 * Staff trả lời khiếu nại (gửi email cho khách hàng)
 */
function sendReplyToCustomer($db, $complaintId, $staffUserId) {
    $data = json_decode(file_get_contents("php://input"), true);
    $responseText = isset($data['responseText']) ? sanitizeInput($data['responseText']) : null;
    if (empty($responseText)) throw new Exception("Nội dung phản hồi không được rỗng", 400);

    $query = "SELECT c.ComplaintCode, c.Title, u.Email as CustomerEmail, u.FullName as CustomerName
              FROM Complaints c
              JOIN Users u ON c.CustomerID = u.UserID
              WHERE c.ComplaintID = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $complaintId, PDO::PARAM_INT);
    $stmt->execute();
    $complaintInfo = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$complaintInfo || empty($complaintInfo['CustomerEmail'])) {
        throw new Exception("Không tìm thấy email khách hàng", 404);
    }
    
    $customerEmail = $complaintInfo['CustomerEmail'];
    $customerName = $complaintInfo['CustomerName'];
    $subject = "Phản hồi về khiếu nại [{$complaintInfo['ComplaintCode']}] - {$complaintInfo['Title']}";
    $messageBody = "Chào " . $customerName . ",\n\n" .
                   "Cửa hàng La Cuisine Ngọt xin phản hồi về khiếu nại của bạn như sau:\n\n" .
                   "--------------------------------------------------\n" .
                   $responseText . "\n" .
                   "--------------------------------------------------\n\n" .
                   "Cảm ơn bạn đã liên hệ. Chúc bạn một ngày tốt lành!\n" .
                   "Trân trọng,\nĐội ngũ La Cuisine Ngọt";
    $headers = "From: support@lacuisinengot.vn" . "\r\n" .
               "Reply-To: support@lacuisinengot.vn" . "\r\n" .
               "Content-Type: text/plain; charset=UTF-8" . "\r\n" .
               "X-Mailer: PHP/" . phpversion();

    $isSent = true; // Giả lập gửi thành công

    $respQuery = "INSERT INTO ComplaintResponses (ComplaintID, UserID, UserType, Content, CreatedAt)
                  VALUES (:complaint_id, :user_id, 'staff', :content, NOW())";
    $respStmt = $db->prepare($respQuery);
    $respStmt->execute([
        ':complaint_id' => $complaintId,
        ':user_id' => $staffUserId,
        ':content' => $responseText
    ]);

    $updateQuery = "UPDATE Complaints SET Status = 'resolved', Resolution = :content, ResolvedAt = NOW(), UpdatedAt = NOW() 
                    WHERE ComplaintID = :id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->execute([
        ':content' => $responseText,
        ':id' => $complaintId
    ]);

    sendJsonResponse(true, null, "Gửi phản hồi cho khách hàng thành công");
}

/**
 * Xóa khiếu nại (CHỈ ADMIN)
 */
function deleteComplaint($db, $complaintId) {
    $db->beginTransaction();
    try {
        $stmtResponses = $db->prepare("DELETE FROM ComplaintResponses WHERE ComplaintID = :id");
        $stmtResponses->bindParam(':id', $complaintId, PDO::PARAM_INT);
        $stmtResponses->execute();

        $stmtComplaint = $db->prepare("DELETE FROM Complaints WHERE ComplaintID = :id");
        $stmtComplaint->bindParam(':id', $complaintId, PDO::PARAM_INT);
        $stmtComplaint->execute();

        if ($stmtComplaint->rowCount() === 0) {
            throw new Exception("Không tìm thấy khiếu nại để xóa", 404);
        }

        $db->commit();
        sendJsonResponse(true, null, "Xóa khiếu nại thành công");

    } catch (Exception $e) {
        $db->rollBack();
        throw new Exception("Lỗi khi xóa khiếu nại: " . $e->getMessage(), 500);
    }
}
?>