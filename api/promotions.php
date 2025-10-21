<?php
/**
 * Promotions API
 * LA CUISINE NGỌT
 * FILE: api/promotions.php
 */

require_once __DIR__ . '/config/database.php';

enableCORS();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            checkAdminPermission();
            getAllPromotions($db);
            break;
            
        case 'POST':
            checkAdminPermission();
            createPromotion($db);
            break;
            
        default:
            sendJsonResponse(false, null, "Method không được hỗ trợ", 405);
    }
} catch(Exception $e) {
    error_log("Promotions API Error: " . $e->getMessage());
    sendJsonResponse(false, null, "Có lỗi xảy ra", 500);
}

function getAllPromotions($db) {
    $status = isset($_GET['status']) ? sanitizeInput($_GET['status']) : null;
    
    $query = "SELECT 
                PromotionID as promotion_id,
                PromotionCode as promotion_code,
                PromotionName as promotion_name,
                Description as description,
                PromotionType as promotion_type,
                DiscountValue as discount_value,
                MinOrderValue as min_order_value,
                MaxDiscount as max_discount,
                Quantity as quantity,
                UsedCount as used_count,
                StartDate as start_date,
                EndDate as end_date,
                Status as status,
                CreatedAt as created_at
              FROM Promotions
              WHERE 1=1";
    
    $params = [];
    
    if ($status) {
        $statusMap = [
            'pending' => 'pending',
            'active' => 'active',
            'expired' => 'expired'
        ];
        
        if (isset($statusMap[$status])) {
            $query .= " AND Status = :status";
            $params[':status'] = $statusMap[$status];
        }
    }
    
    $query .= " ORDER BY CreatedAt DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    
    $promotions = $stmt->fetchAll();
    
    sendJsonResponse(true, [
        "promotions" => $promotions,
        "total" => count($promotions)
    ], "Lấy danh sách khuyến mãi thành công");
}

function createPromotion($db) {
    $adminId = checkAdminPermission();
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (empty($data['promotion_code']) || empty($data['promotion_name']) || empty($data['promotion_type'])) {
        sendJsonResponse(false, null, "Thiếu thông tin bắt buộc", 400);
    }
    
    $checkQuery = "SELECT PromotionID FROM Promotions WHERE PromotionCode = :code";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':code', $data['promotion_code']);
    $checkStmt->execute();
    
    if ($checkStmt->fetch()) {
        sendJsonResponse(false, null, "Mã khuyến mãi đã tồn tại", 400);
    }
    
    $query = "INSERT INTO Promotions 
              (PromotionCode, PromotionName, PromotionType, DiscountValue, MinOrderValue, 
               Quantity, StartDate, EndDate, Status, CreatedBy) 
              VALUES 
              (:code, :name, :type, :value, :min_order, :quantity, :start_date, :end_date, 'pending', :created_by)";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':code', sanitizeInput($data['promotion_code']));
    $stmt->bindParam(':name', sanitizeInput($data['promotion_name']));
    $stmt->bindParam(':type', $data['promotion_type']);
    $stmt->bindParam(':value', $data['discount_value'] ?? 0);
    $stmt->bindParam(':min_order', $data['min_order_value'] ?? 0);
    $stmt->bindParam(':quantity', $data['quantity'] ?? -1);
    $stmt->bindParam(':start_date', $data['start_date']);
    $stmt->bindParam(':end_date', $data['end_date']);
    $stmt->bindParam(':created_by', $adminId);
    
    if ($stmt->execute()) {
        sendJsonResponse(true, [
            "promotion_id" => $db->lastInsertId()
        ], "Tạo khuyến mãi thành công", 201);
    } else {
        sendJsonResponse(false, null, "Không thể tạo khuyến mãi", 500);
    }
}