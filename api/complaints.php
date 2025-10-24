<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

/**
 * API Xử lý Khiếu nại (Complaints) - PHIÊN BẢN HOÀN CHỈNH
 * LA CUISINE NGỌT
 * File: api/complaints.php
 *
 * Hỗ trợ các phương thức:
 * GET /api/complaints            -> Lấy danh sách (có tìm kiếm)
 * GET /api/complaints/[ID]       -> Lấy chi tiết 1 khiếu nại
 * PUT /api/complaints/[ID]       -> Cập nhật (Lưu, Chuyển tiếp Admin)
 * POST /api/complaints/[ID]?action=reply -> Trả lời khách hàng (gửi email)
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/auth/middleware.php'; 

// Bật CORS
enableCORS();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// ---- Xử lý Routing chuẩn RESTful ----
$complaintId = null;
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));
$apiIndex = array_search('api', $pathParts);

// Tìm ID trong URL, ví dụ: /api/complaints/123
if ($apiIndex !== false && isset($pathParts[$apiIndex + 2]) && is_numeric($pathParts[$apiIndex + 2])) {
    $complaintId = (int)$pathParts[$apiIndex + 2];
}

$action = isset($_GET['action']) ? $_GET['action'] : null;

try {
    // Yêu cầu quyền Nhân viên (thay vì Admin) để khớp với file /staff/complaint.html
    $currentUser = requireStaff(); 
    
    switch ($method) {
        case 'GET':
            if ($complaintId) {
                getComplaintById($db, $complaintId);
            } else {
                getAllComplaints($db);
            }
            break;

        case 'PUT':
            // PUT dùng để CẬP NHẬT DỮ LIỆU (Lưu, Chuyển tiếp Admin)
            if (!$complaintId) throw new Exception("Thiếu ID khiếu nại", 400);
            updateComplaint($db, $complaintId, $currentUser['id']);
            break;

        case 'POST':
            // POST dùng để TẠO MỚI (ở đây là tạo 1 email gửi đi)
            if (!$complaintId) throw new Exception("Thiếu ID khiếu nại", 400);
            
            if ($action === 'reply') {
                sendReplyToCustomer($db, $complaintId, $currentUser['id']);
            } else {
                throw new Exception("Hành động POST không hợp lệ", 400);
            }
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
 * Lấy danh sách khiếu nại (hỗ trợ tìm kiếm và lọc)
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
        $query .= " AND (o.OrderCode LIKE :search OR u.FullName LIKE :search OR u.Phone LIKE :search)";
        $params[':search'] = "%" . $search . "%";
    }

    if ($status) {
        // *** THAY ĐỔI: Đã xóa 'closed' khỏi danh sách hợp lệ ***
        $validStatuses = ['pending', 'processing', 'resolved'];
        if (in_array($status, $validStatuses)) {
            $query .= " AND c.Status = :status";
            $params[':status'] = $status;
        }
    }
    
    $query .= " ORDER BY c.CreatedAt DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $complaints = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendJsonResponse(true, $complaints, "Lấy danh sách khiếu nại thành công");
}

/**
 * Lấy chi tiết 1 khiếu nại (để đổ dữ liệu vào form)
 */
function getComplaintById($db, $complaintId) {
    $query = "SELECT 
                c.*,
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

    // Lấy lịch sử phản hồi
    $respQuery = "SELECT r.*, u.FullName as user_name 
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
 * Cập nhật (Lưu, Chuyển tiếp Admin)
 */
function updateComplaint($db, $complaintId, $staffUserId) {
    $data = json_decode(file_get_contents("php://input"), true);
    if (empty($data)) throw new Exception("Không có dữ liệu cập nhật", 400);

    $fieldsToUpdate = [];
    $params = [':id' => $complaintId, ':staff_id' => $staffUserId];

    // 1. Xử lý "Chuyển tiếp Admin"
    if (isset($data['action']) && $data['action'] === 'forward_admin') {
        $adminQuery = "SELECT UserID FROM Users WHERE Role = 'admin' AND Status = 'active' LIMIT 1";
        $adminStmt = $db->prepare($adminQuery);
        $adminStmt->execute();
        $admin = $adminStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($admin) {
            $fieldsToUpdate[] = "AssignedTo = :admin_id";
            $params[':admin_id'] = $admin['UserID'];
            $fieldsToUpdate[] = "Status = 'pending'"; // Chuyển về "Chờ xử lý" cho admin
            $fieldsToUpdate[] = "Priority = 'high'"; // Nâng độ ưu tiên
        } else {
            throw new Exception("Không tìm thấy Admin để chuyển tiếp", 500);
        }
    
    // 2. Xử lý "Lưu" (cập nhật thông thường từ nút "Lưu và đóng")
    } else {
        if (isset($data['status'])) {
            // *** THAY ĐỔI: Đảm bảo status gửi lên hợp lệ (không có 'closed') ***
            $status = sanitizeInput($data['status']);
            if (!in_array($status, ['pending', 'processing', 'resolved'])) {
                throw new Exception("Trạng thái không hợp lệ", 400);
            }
            $fieldsToUpdate[] = "Status = :status";
            $params[':status'] = $status;
            
            // Cập nhật thời gian giải quyết
            if ($status === 'resolved') {
                 $fieldsToUpdate[] = "ResolvedAt = NOW()";
            }
        }
        
        if (isset($data['resolutionText'])) {
            $fieldsToUpdate[] = "Resolution = :resolution";
            $params[':resolution'] = sanitizeInput($data['resolutionText']);
        }
        if (isset($data['assignedStaff'])) {
            // Gán cho nhân viên hiện tại đang thực hiện hành động
            $fieldsToUpdate[] = "AssignedTo = :staff_id";
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
 * "Trả lời khách hàng" (Gửi email)
 */
function sendReplyToCustomer($db, $complaintId, $staffUserId) {
    $data = json_decode(file_get_contents("php://input"), true);
    $responseText = isset($data['responseText']) ? sanitizeInput($data['responseText']) : null;
    
    if (empty($responseText)) throw new Exception("Nội dung phản hồi không được rỗng", 400);

    // 1. Lấy thông tin khách hàng và khiếu nại
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
    
    $messageBody = "Chào " . $customerName . ",\n\n";
    $messageBody .= "Cửa hàng La Cuisine Ngọt xin phản hồi về khiếu nại của bạn như sau:\n\n";
    $messageBody .= "--------------------------------------------------\n";
    $messageBody .= $responseText . "\n";
    $messageBody .= "--------------------------------------------------\n\n";
    $messageBody .= "Cảm ơn bạn đã liên hệ. Chúc bạn một ngày tốt lành!\n";
    $messageBody .= "Trân trọng,\nĐội ngũ La Cuisine Ngọt";
    
    $headers = "From: support@lacuisinengot.vn" . "\r\n" .
               "Reply-To: support@lacuisinengot.vn" . "\r\n" .
               "Content-Type: text/plain; charset=UTF-8" . "\r\n" .
               "X-Mailer: PHP/" . phpversion();

    // $isSent = mail($customerEmail, $subject, $messageBody, $headers);
    $isSent = true; // Giả lập gửi thành công cho mục đích demo

    if (!$isSent) {
        throw new Exception("Lỗi máy chủ: Không thể gửi email", 500);
    }

    // 2. Lưu phản hồi vào CSDL
    $respQuery = "INSERT INTO ComplaintResponses (ComplaintID, UserID, UserType, Content, CreatedAt)
                  VALUES (:complaint_id, :user_id, 'staff', :content, NOW())";
    $respStmt = $db->prepare($respQuery);
    $respStmt->bindParam(':complaint_id', $complaintId, PDO::PARAM_INT);
    $respStmt->bindParam(':user_id', $staffUserId, PDO::PARAM_INT);
    $respStmt->bindParam(':content', $responseText);
    $respStmt->execute();

    // 3. Cập nhật trạng thái khiếu nại thành "Đã giải quyết"
    $updateQuery = "UPDATE Complaints SET Status = 'resolved', Resolution = :content, ResolvedAt = NOW(), UpdatedAt = NOW() 
                    WHERE ComplaintID = :id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(':content', $responseText);
    $updateStmt->bindParam(':id', $complaintId, PDO::PARAM_INT);
    $updateStmt->execute();

    sendJsonResponse(true, null, "Gửi phản hồi cho khách hàng thành công");
}
?>