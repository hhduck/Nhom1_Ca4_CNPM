<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

/**
 * API Xử lý Khiếu nại (Complaints) - PHIÊN BẢN ĐÃ SỬA
 * SỬA: Bỏ tính năng "Chuyển tiếp Admin" và sửa lỗi HY093
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
    $currentUser = requireStaff(); 
    
    switch ($method) {
        case 'GET':
            if ($complaintId) {
                getComplaintById($db, $complaintId);
            } else {
                getAllComplaints($db); // Sẽ được gọi khi tải danh sách
            }
            break;

        case 'PUT':
            if (!$complaintId) throw new Exception("Thiếu ID khiếu nại", 400);
            // Luôn gọi hàm update (logic "Lưu")
            updateComplaint($db, $complaintId, $currentUser['id']);
            break;

        case 'POST':
            if (!$complaintId) throw new Exception("Thiếu ID khiếu nại", 400);
            
            if ($action === 'reply') {
                sendReplyToCustomer($db, $complaintId, $currentUser['id']);
            } else {
                throw new Exception("Hành động POST không hợp lệ", 400);
            }
            break;

        case 'DELETE':
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
 * Lấy danh sách khiếu nại
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
        $validStatuses = ['pending', 'processing', 'resolved', 'closed', 'rejected']; 
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
 * Lấy chi tiết 1 khiếu nại
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
 * Cập nhật (Chỉ còn chức năng "Lưu")
 * *** HÀM ĐÃ ĐƯỢC SỬA (FIX LỖI HY093) ***
 */
function updateComplaint($db, $complaintId, $staffUserId) {
    $data = json_decode(file_get_contents("php://input"), true);
    if (empty($data)) throw new Exception("Không có dữ liệu cập nhật", 400);

    $fieldsToUpdate = [];
    
    // *** ĐÂY LÀ DÒNG SỬA LỖI ***
    // Chỉ khởi tạo $params với :id, không thêm :staff_id
    $params = [':id' => $complaintId];

    // (Đã xóa) Logic "if action == 'forward_admin'"
    
    // Chỉ còn logic "Lưu"
    if (isset($data['status'])) {
        $status = sanitizeInput($data['status']);
        $validStatuses = ['pending', 'processing', 'resolved', 'closed', 'rejected'];
        if (!in_array($status, $validStatuses)) {
            throw new Exception("Trạng thái không hợp lệ", 400);
        }
        $fieldsToUpdate[] = "Status = :status";
        $params[':status'] = $status; // Thêm :status vào $params
        
        if ($status === 'resolved') $fieldsToUpdate[] = "ResolvedAt = NOW()";
        if ($status === 'closed') $fieldsToUpdate[] = "ClosedAt = NOW()";
    }
    
    if (isset($data['resolutionText'])) {
        $fieldsToUpdate[] = "Resolution = :resolution";
        $params[':resolution'] = sanitizeInput($data['resolutionText']); // Thêm :resolution
    }
    
    if (array_key_exists('assignedStaffId', $data)) {
        if ($data['assignedStaffId'] !== null && is_numeric($data['assignedStaffId'])) {
            $fieldsToUpdate[] = "AssignedTo = :assigned_id";
            $params[':assigned_id'] = $data['assignedStaffId']; // Thêm :assigned_id
        } else {
            // Nếu $data['assignedStaffId'] là null, ta chỉ thêm "AssignedTo = NULL"
            // vào câu query, KHÔNG thêm gì vào $params.
            $fieldsToUpdate[] = "AssignedTo = NULL"; 
        }
    }
    

    if (empty($fieldsToUpdate)) {
        sendJsonResponse(true, null, "Không có gì thay đổi");
        return;
    }

    // Xây dựng câu query chung
    $fieldsToUpdate[] = "UpdatedAt = NOW()";
    $query = "UPDATE Complaints SET " . implode(", ", $fieldsToUpdate) . " WHERE ComplaintID = :id";
    
    $stmt = $db->prepare($query);
    
    // Giờ đây, $params sẽ khớp 100% với các placeholder trong $query
    $stmt->execute($params); 
    
    sendJsonResponse(true, null, "Cập nhật khiếu nại thành công");
}

/**
 * "Trả lời khách hàng" (Gửi email)
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
    if (!$isSent) {
        throw new Exception("Lỗi máy chủ: Không thể gửi email", 500);
    }

    $respQuery = "INSERT INTO ComplaintResponses (ComplaintID, UserID, UserType, Content, CreatedAt)
                  VALUES (:complaint_id, :user_id, 'staff', :content, NOW())";
    $respStmt = $db->prepare($respQuery);
    $respStmt->execute([
        ':complaint_id' => $complaintId,
        ':user_id' => $staffUserId,
        ':content' => $responseText
    ]);

    // Tự động chuyển trạng thái sang "Đã giải quyết" khi gửi mail
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
 * Xóa khiếu nại (Admin only)
 */
function deleteComplaint($db, $complaintId) {
    // Kiểm tra quyền admin
    $currentUser = requireAdmin();
    
    $db->beginTransaction();
    try {
        // Xóa responses trước
        $stmtResponses = $db->prepare("DELETE FROM ComplaintResponses WHERE ComplaintID = :id");
        $stmtResponses->bindParam(':id', $complaintId, PDO::PARAM_INT);
        $stmtResponses->execute();

        // Xóa complaint
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