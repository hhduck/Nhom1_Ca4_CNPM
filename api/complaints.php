<?php
/**
 * Complaints API
 * LA CUISINE NGỌT
 * FILE: api/complaints.php
 */

require_once __DIR__ . '/config/database.php';

enableCORS();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

try {
    switch($method) {
        case 'GET':
            checkAdminPermission();
            getAllComplaints($db);
            break;
            
        case 'PUT':
            checkAdminPermission();
            if (isset($pathParts[2]) && $pathParts[3] === 'status') {
                updateComplaintStatus($db, $pathParts[2]);
            }
            break;
            
        default:
            sendJsonResponse(false, null, "Method không được hỗ trợ", 405);
    }
} catch(Exception $e) {
    error_log("Complaints API Error: " . $e->getMessage());
    sendJsonResponse(false, null, "Có lỗi xảy ra", 500);
}

function getAllComplaints($db) {
    $search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : null;
    $status = isset($_GET['status']) ? sanitizeInput($_GET['status']) : null;
    
    $query = "SELECT 
                c.ComplaintID as complaint_id,
                c.ComplaintCode as complaint_code,
                c.OrderID as order_id,
                c.CustomerID as customer_id,
                c.ComplaintType as complaint_type,
                c.Title as title,
                c.Content as content,
                c.Status as status,
                c.Priority as priority,
                c.Resolution as resolution,
                c.CompensationType as compensation_type,
                c.CompensationValue as compensation_value,
                c.CreatedAt as created_at,
                c.UpdatedAt as updated_at,
                o.OrderCode as order_code,
                u.FullName as customer_name,
                u.Phone as customer_phone,
                o.ShippingAddress as shipping_address
              FROM Complaints c
              INNER JOIN Orders o ON c.OrderID = o.OrderID
              INNER JOIN Users u ON c.CustomerID = u.UserID
              WHERE 1=1";
    
    $params = [];
    
    if ($search) {
        $query .= " AND (c.ComplaintCode LIKE :search OR c.Title LIKE :search OR u.FullName LIKE :search)";
        $params[':search'] = "%$search%";
    }
    
    if ($status) {
        $statusMap = [
            'pending' => 'pending',
            'resolved' => 'resolved',
            'closed' => 'closed'
        ];
        
        if (isset($statusMap[$status])) {
            $query .= " AND c.Status = :status";
            $params[':status'] = $statusMap[$status];
        }
    }
    
    $query .= " ORDER BY c.CreatedAt DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    
    $complaints = $stmt->fetchAll();
    
    sendJsonResponse(true, [
        "complaints" => $complaints,
        "total" => count($complaints)
    ], "Lấy danh sách khiếu nại thành công");
}

function updateComplaintStatus($db, $complaintId) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (empty($data['status'])) {
        sendJsonResponse(false, null, "Thiếu thông tin trạng thái", 400);
    }
    
    $query = "UPDATE Complaints SET 
              Status = :status,
              UpdatedAt = NOW(),
              ResolvedAt = CASE WHEN :status = 'resolved' THEN NOW() ELSE ResolvedAt END,
              ClosedAt = CASE WHEN :status = 'closed' THEN NOW() ELSE ClosedAt END
              WHERE ComplaintID = :id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $complaintId);
    $stmt->bindParam(':status', $data['status']);
    
    if ($stmt->execute()) {
        sendJsonResponse(true, null, "Cập nhật trạng thái khiếu nại thành công");
    } else {
        sendJsonResponse(false, null, "Không thể cập nhật trạng thái", 500);
    }
}