<?php
/**
 * Promotions API
 * LA CUISINE NGỌT
 * FILE: api/promotions.php
 */

ini_set('display_errors', 0); // Không hiển thị errors trực tiếp (sẽ trả về JSON)
ini_set('display_startup_errors', 0);
error_reporting(E_ALL); // Vẫn log errors
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config/database.php';

enableCORS();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// Xử lý routing
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));
$promotionId = null;

// Lấy ID từ URL path (vd: /api/promotions.php/123)
if (end($pathParts) && is_numeric(end($pathParts))) {
    $promotionId = end($pathParts);
}
// Hoặc từ query string (vd: ?id=123)
else if (isset($_GET['id'])) {
    $promotionId = $_GET['id'];
}

try {
    switch($method) {
        case 'GET':
            // Public endpoint cho home page (cần query param ?public=1)
            if (isset($_GET['public']) && $_GET['public'] == '1') {
                // Public access - chỉ lấy promotions active
                if ($promotionId) {
                    getPromotionByIdPublic($db, $promotionId);
                } else {
                    getAllPromotionsPublic($db);
                }
            } else {
                // Admin access - cần auth
                checkAdminPermission();
                if ($promotionId) {
                    getPromotionById($db, $promotionId);
                } else {
                    getAllPromotions($db);
                }
            }
            break;
            
        case 'POST':
            checkAdminPermission();
            createPromotion($db);
            break;
            
        case 'PUT':
            checkAdminPermission();
            if (!$promotionId) {
                sendJsonResponse(false, null, "Thiếu ID khuyến mãi", 400);
            }
            updatePromotion($db, $promotionId);
            break;
            
        case 'DELETE':
            checkAdminPermission();
            if (!$promotionId) {
                sendJsonResponse(false, null, "Thiếu ID khuyến mãi", 400);
            }
            deletePromotion($db, $promotionId);
            break;
            
        default:
            sendJsonResponse(false, null, "Method không được hỗ trợ", 405);
    }
} catch(Exception $e) {
    error_log("Promotions API Error: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
    sendJsonResponse(false, null, "Có lỗi xảy ra: " . $e->getMessage(), 500);
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
                ImageURL as image_url,
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

function getPromotionById($db, $id) {
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
                ImageURL as image_url,
                CreatedAt as created_at
              FROM Promotions
              WHERE PromotionID = :id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    
    $promotion = $stmt->fetch();
    
    if ($promotion) {
        sendJsonResponse(true, $promotion, "Lấy thông tin khuyến mãi thành công");
    } else {
        sendJsonResponse(false, null, "Không tìm thấy khuyến mãi", 404);
    }
}

function getAllPromotionsPublic($db) {
    // Thêm cache headers để tránh cache
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    // Chỉ lấy promotions active cho home page
    // Sửa: Lấy tất cả promotions active (không giới hạn StartDate/EndDate trong query)
    // vì promotions có thể có StartDate trong tương lai nhưng vẫn cần hiển thị
    // Sửa: Dùng COALESCE để đảm bảo ImageURL không phải NULL
    $query = "SELECT 
                PromotionID as promotion_id,
                PromotionCode as promotion_code,
                PromotionName as promotion_name,
                Description as description,
                PromotionType as promotion_type,
                DiscountValue as discount_value,
                MinOrderValue as min_order_value,
                StartDate as start_date,
                EndDate as end_date,
                COALESCE(ImageURL, '') as image_url
              FROM Promotions
              WHERE Status = 'active'
              ORDER BY CreatedAt DESC
              LIMIT 10";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $promotions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendJsonResponse(true, [
        "promotions" => $promotions,
        "total" => count($promotions)
    ], "Lấy danh sách khuyến mãi thành công");
}

function getPromotionByIdPublic($db, $id) {
    $query = "SELECT 
                PromotionID as promotion_id,
                PromotionCode as promotion_code,
                PromotionName as promotion_name,
                Description as description,
                PromotionType as promotion_type,
                DiscountValue as discount_value,
                MinOrderValue as min_order_value,
                StartDate as start_date,
                EndDate as end_date,
                ImageURL as image_url
              FROM Promotions
              WHERE PromotionID = :id 
                AND Status = 'active'
                AND StartDate <= NOW() 
                AND EndDate >= NOW()";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    
    $promotion = $stmt->fetch();
    
    if ($promotion) {
        sendJsonResponse(true, $promotion, "Lấy thông tin khuyến mãi thành công");
    } else {
        sendJsonResponse(false, null, "Không tìm thấy khuyến mãi", 404);
    }
}

function createPromotion($db) {
    try {
        $adminId = checkAdminPermission();
        
        $input = file_get_contents("php://input");
        if (empty($input)) {
            sendJsonResponse(false, null, "Dữ liệu không hợp lệ", 400);
        }
        
        $data = json_decode($input, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            sendJsonResponse(false, null, "Dữ liệu JSON không hợp lệ: " . json_last_error_msg(), 400);
        }
        
        if (empty($data['promotion_code']) || empty($data['promotion_name']) || empty($data['promotion_type'])) {
            sendJsonResponse(false, null, "Thiếu thông tin bắt buộc", 400);
        }
        
        // Validate promotion_type
        $validTypes = ['percent', 'fixed_amount', 'free_shipping', 'gift'];
        if (!in_array($data['promotion_type'], $validTypes)) {
            sendJsonResponse(false, null, "Loại khuyến mãi không hợp lệ. Phải là: " . implode(', ', $validTypes), 400);
        }
        
        // Kiểm tra mã khuyến mãi đã tồn tại chưa
        $checkQuery = "SELECT PromotionID FROM Promotions WHERE PromotionCode = :code";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':code', $data['promotion_code']);
        $checkStmt->execute();
        
        if ($checkStmt->fetch()) {
            sendJsonResponse(false, null, "Mã khuyến mãi đã tồn tại", 400);
        }
        
        // Format dates: Convert from YYYY-MM-DD to YYYY-MM-DD HH:MM:SS for TIMESTAMP
        $startDate = $data['start_date'] ?? '';
        $endDate = $data['end_date'] ?? '';
        
        if (strlen($startDate) == 10) {
            $startDate .= ' 00:00:00';
        }
        if (strlen($endDate) == 10) {
            $endDate .= ' 23:59:59';
        }
        
        $query = "INSERT INTO Promotions 
                  (PromotionCode, PromotionName, PromotionType, DiscountValue, MinOrderValue, 
                   Quantity, StartDate, EndDate, Status, ImageURL, CreatedBy) 
                  VALUES 
                  (:code, :name, :type, :value, :min_order, :quantity, :start_date, :end_date, 'active', :image_url, :created_by)";
        
        $stmt = $db->prepare($query);
        
        $code = sanitizeInput($data['promotion_code']);
        $name = sanitizeInput($data['promotion_name']);
        $type = $data['promotion_type'];
        $value = isset($data['discount_value']) ? (float)$data['discount_value'] : 0;
        $minOrder = isset($data['min_order_value']) ? (float)$data['min_order_value'] : 0;
        $quantity = isset($data['quantity']) ? (int)$data['quantity'] : -1;
        $imageUrl = sanitizeInput($data['image_url'] ?? '');
        
        $stmt->bindParam(':code', $code);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':type', $type);
        $stmt->bindParam(':value', $value);
        $stmt->bindParam(':min_order', $minOrder);
        $stmt->bindParam(':quantity', $quantity);
        $stmt->bindParam(':start_date', $startDate);
        $stmt->bindParam(':end_date', $endDate);
        $stmt->bindParam(':image_url', $imageUrl);
        $stmt->bindParam(':created_by', $adminId, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            sendJsonResponse(true, [
                "promotion_id" => $db->lastInsertId()
            ], "Tạo khuyến mãi thành công", 201);
        } else {
            $errorInfo = $stmt->errorInfo();
            error_log("Promotion creation error: " . json_encode($errorInfo));
            sendJsonResponse(false, null, "Không thể tạo khuyến mãi: " . ($errorInfo[2] ?? 'Unknown error'), 500);
        }
    } catch (Exception $e) {
        error_log("Create promotion exception: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
        sendJsonResponse(false, null, "Lỗi khi tạo khuyến mãi: " . $e->getMessage(), 500);
    }
}

function updatePromotion($db, $id) {
    $adminId = checkAdminPermission();
    $data = json_decode(file_get_contents("php://input"), true);
    
    $fields = [];
    $params = [':id' => $id];
    
    if (isset($data['promotion_code'])) {
        $fields[] = "PromotionCode = :code";
        $params[':code'] = sanitizeInput($data['promotion_code']);
    }
    if (isset($data['promotion_name'])) {
        $fields[] = "PromotionName = :name";
        $params[':name'] = sanitizeInput($data['promotion_name']);
    }
    if (isset($data['promotion_type'])) {
        $fields[] = "PromotionType = :type";
        $params[':type'] = $data['promotion_type'];
    }
    if (isset($data['discount_value'])) {
        $fields[] = "DiscountValue = :value";
        $params[':value'] = $data['discount_value'];
    }
    if (isset($data['min_order_value'])) {
        $fields[] = "MinOrderValue = :min_order";
        $params[':min_order'] = $data['min_order_value'];
    }
    if (isset($data['quantity'])) {
        $fields[] = "Quantity = :quantity";
        $params[':quantity'] = $data['quantity'];
    }
    if (isset($data['start_date'])) {
        $fields[] = "StartDate = :start_date";
        $params[':start_date'] = $data['start_date'];
    }
    if (isset($data['end_date'])) {
        $fields[] = "EndDate = :end_date";
        $params[':end_date'] = $data['end_date'];
    }
    if (isset($data['status'])) {
        $fields[] = "Status = :status";
        $params[':status'] = $data['status'];
    }
    if (isset($data['image_url'])) {
        $fields[] = "ImageURL = :image_url";
        $params[':image_url'] = sanitizeInput($data['image_url']);
    }
    
    if (empty($fields)) {
        sendJsonResponse(false, null, "Không có dữ liệu để cập nhật", 400);
    }
    
    $fields[] = "UpdatedAt = CURRENT_TIMESTAMP";
    
    $query = "UPDATE Promotions SET " . implode(", ", $fields) . " WHERE PromotionID = :id";
    
    $stmt = $db->prepare($query);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    if ($stmt->execute()) {
        sendJsonResponse(true, null, "Cập nhật khuyến mãi thành công");
    } else {
        sendJsonResponse(false, null, "Không thể cập nhật khuyến mãi", 500);
    }
}

function deletePromotion($db, $id) {
    $query = "DELETE FROM Promotions WHERE PromotionID = :id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    
    if ($stmt->execute()) {
        sendJsonResponse(true, null, "Xóa khuyến mãi thành công");
    } else {
        sendJsonResponse(false, null, "Không thể xóa khuyến mãi", 500);
    }
}

?>