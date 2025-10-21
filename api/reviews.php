<?php
/**
 * Reviews API
 * LA CUISINE NGỌT
 * FILE: api/reviews.php (ĐÃ SỬA LỖI)
 */

require_once __DIR__ . '/config/database.php';

enableCORS();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            getAllReviews($db);
            break;
            
        case 'POST':
            createReview($db);
            break;
            
        case 'PUT':
            checkAdminPermission();
            updateReview($db);
            break;
            
        case 'DELETE':
            checkAdminPermission();
            deleteReview($db);
            break;
            
        default:
            sendJsonResponse(false, null, "Method không được hỗ trợ", 405);
    }
} catch(Exception $e) {
    error_log("Reviews API Error: " . $e->getMessage());
    sendJsonResponse(false, null, "Có lỗi xảy ra", 500);
}

function getAllReviews($db) {
    $productId = isset($_GET['product_id']) ? sanitizeInput($_GET['product_id']) : null;
    $status = isset($_GET['status']) ? sanitizeInput($_GET['status']) : 'approved';
    
    $query = "SELECT 
                r.ReviewID as review_id,
                r.ProductID as product_id,
                r.UserID as user_id,
                r.OrderID as order_id,
                r.Rating as rating,
                r.Title as title,
                r.Content as content,
                r.Images as images,
                r.IsVerifiedPurchase as is_verified_purchase,
                r.HelpfulCount as helpful_count,
                r.Status as status,
                r.AdminReply as admin_reply,
                r.RepliedAt as replied_at,
                r.CreatedAt as created_at,
                u.FullName as user_name,
                p.ProductName as product_name
              FROM Reviews r
              INNER JOIN Users u ON r.UserID = u.UserID
              INNER JOIN Products p ON r.ProductID = p.ProductID
              WHERE 1=1";
    
    $params = [];
    
    if ($productId) {
        $query .= " AND r.ProductID = :product_id";
        $params[':product_id'] = $productId;
    }
    
    if ($status) {
        $query .= " AND r.Status = :status";
        $params[':status'] = $status;
    }
    
    $query .= " ORDER BY r.CreatedAt DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    
    $reviews = $stmt->fetchAll();
    
    sendJsonResponse(true, [
        "reviews" => $reviews,
        "total" => count($reviews)
    ], "Lấy danh sách đánh giá thành công");
}

function createReview($db) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (empty($data['product_id']) || empty($data['user_id']) || empty($data['rating'])) {
        sendJsonResponse(false, null, "Thiếu thông tin bắt buộc", 400);
    }
    
    if ($data['rating'] < 1 || $data['rating'] > 5) {
        sendJsonResponse(false, null, "Đánh giá phải từ 1-5 sao", 400);
    }
    
    $checkQuery = "SELECT o.OrderID 
                   FROM Orders o
                   INNER JOIN OrderItems oi ON o.OrderID = oi.OrderID
                   WHERE o.CustomerID = :user_id 
                   AND oi.ProductID = :product_id 
                   AND o.OrderStatus = 'completed'
                   LIMIT 1";
    
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':user_id', $data['user_id']);
    $checkStmt->bindParam(':product_id', $data['product_id']);
    $checkStmt->execute();
    
    $order = $checkStmt->fetch();
    $isVerifiedPurchase = $order ? 1 : 0;
    $orderId = $order ? $order['OrderID'] : null;
    
    $checkReviewQuery = "SELECT ReviewID FROM Reviews 
                        WHERE UserID = :user_id AND ProductID = :product_id";
    $checkReviewStmt = $db->prepare($checkReviewQuery);
    $checkReviewStmt->bindParam(':user_id', $data['user_id']);
    $checkReviewStmt->bindParam(':product_id', $data['product_id']);
    $checkReviewStmt->execute();
    
    if ($checkReviewStmt->fetch()) {
        sendJsonResponse(false, null, "Bạn đã đánh giá sản phẩm này rồi", 400);
    }
    
    $query = "INSERT INTO Reviews 
              (ProductID, UserID, OrderID, Rating, Title, Content, 
               IsVerifiedPurchase, Status) 
              VALUES 
              (:product_id, :user_id, :order_id, :rating, :title, :content, 
               :verified, 'pending')";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':product_id', $data['product_id']);
    $stmt->bindParam(':user_id', $data['user_id']);
    $stmt->bindParam(':order_id', $orderId);
    $stmt->bindParam(':rating', $data['rating']);
    $stmt->bindParam(':title', sanitizeInput($data['title'] ?? ''));
    $stmt->bindParam(':content', sanitizeInput($data['content'] ?? ''));
    $stmt->bindParam(':verified', $isVerifiedPurchase);
    
    if ($stmt->execute()) {
        sendJsonResponse(true, [
            "review_id" => $db->lastInsertId()
        ], "Thêm đánh giá thành công", 201);
    } else {
        sendJsonResponse(false, null, "Không thể thêm đánh giá", 500);
    }
}

function updateReview($db) {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', trim($path, '/'));
    $id = end($pathParts);
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (isset($data['status'])) {
        $query = "UPDATE Reviews SET Status = :status WHERE ReviewID = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':status', $data['status']);
    } elseif (isset($data['admin_reply'])) {
        $query = "UPDATE Reviews SET 
                  AdminReply = :reply,
                  RepliedAt = NOW()
                  WHERE ReviewID = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':reply', sanitizeInput($data['admin_reply']));
    } else {
        sendJsonResponse(false, null, "Thiếu thông tin cập nhật", 400);
    }
    
    if ($stmt->execute()) {
        sendJsonResponse(true, null, "Cập nhật đánh giá thành công");
    } else {
        sendJsonResponse(false, null, "Không thể cập nhật đánh giá", 500);
    }
}

function deleteReview($db) {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', trim($path, '/'));
    $id = end($pathParts);
    
    $query = "DELETE FROM Reviews WHERE ReviewID = :id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    
    if ($stmt->execute()) {
        sendJsonResponse(true, null, "Xóa đánh giá thành công");
    } else {
        sendJsonResponse(false, null, "Không thể xóa đánh giá", 500);
    }
}