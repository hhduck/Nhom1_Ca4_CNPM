<?php
/**
 * Cart API
 * LA CUISINE NGỌT
 * FILE: api/cart.php
 */

require_once __DIR__ . '/../api/config/';

enableCORS();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            getCart($db);
            break;
            
        case 'POST':
            addToCart($db);
            break;
            
        case 'PUT':
            updateCartItem($db);
            break;
            
        case 'DELETE':
            removeFromCart($db);
            break;
            
        default:
            sendJsonResponse(false, null, "Method không được hỗ trợ", 405);
    }
} catch(Exception $e) {
    error_log("Cart API Error: " . $e->getMessage());
    sendJsonResponse(false, null, "Có lỗi xảy ra", 500);
}

function getCart($db) {
    $userId = isset($_GET['user_id']) ? sanitizeInput($_GET['user_id']) : null;
    
    if (!$userId) {
        sendJsonResponse(false, null, "Thiếu thông tin user_id", 400);
    }
    
    $query = "SELECT 
                c.CartID as cart_id,
                c.ProductID as product_id,
                c.Quantity as quantity,
                c.Note as note,
                p.ProductName as product_name,
                p.Price as price,
                p.ImageURL as image_url,
                p.Status as product_status,
                p.Quantity as stock_quantity,
                (c.Quantity * p.Price) as subtotal
              FROM Cart c
              INNER JOIN Products p ON c.ProductID = p.ProductID
              WHERE c.UserID = :user_id
              ORDER BY c.CreatedAt DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();
    
    $items = $stmt->fetchAll();
    
    $total = 0;
    foreach ($items as $item) {
        $total += $item['subtotal'];
    }
    
    sendJsonResponse(true, [
        "items" => $items,
        "total_items" => count($items),
        "total_amount" => $total
    ], "Lấy giỏ hàng thành công");
}

function addToCart($db) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (empty($data['user_id']) || empty($data['product_id'])) {
        sendJsonResponse(false, null, "Thiếu thông tin bắt buộc", 400);
    }
    
    $quantity = isset($data['quantity']) ? intval($data['quantity']) : 1;
    
    if ($quantity < 1) {
        sendJsonResponse(false, null, "Số lượng không hợp lệ", 400);
    }
    
    $checkQuery = "SELECT ProductID, ProductName, Quantity, Status 
                   FROM Products 
                   WHERE ProductID = :product_id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':product_id', $data['product_id']);
    $checkStmt->execute();
    $product = $checkStmt->fetch();
    
    if (!$product) {
        sendJsonResponse(false, null, "Sản phẩm không tồn tại", 404);
    }
    
    if ($product['Status'] !== 'available') {
        sendJsonResponse(false, null, "Sản phẩm không còn bán", 400);
    }
    
    if ($product['Quantity'] < $quantity) {
        sendJsonResponse(false, null, "Số lượng sản phẩm không đủ", 400);
    }
    
    $checkCartQuery = "SELECT CartID, Quantity FROM Cart 
                       WHERE UserID = :user_id AND ProductID = :product_id";
    $checkCartStmt = $db->prepare($checkCartQuery);
    $checkCartStmt->bindParam(':user_id', $data['user_id']);
    $checkCartStmt->bindParam(':product_id', $data['product_id']);
    $checkCartStmt->execute();
    $existingItem = $checkCartStmt->fetch();
    
    if ($existingItem) {
        $newQuantity = $existingItem['Quantity'] + $quantity;
        
        if ($newQuantity > $product['Quantity']) {
            sendJsonResponse(false, null, "Số lượng vượt quá tồn kho", 400);
        }
        
        $updateQuery = "UPDATE Cart SET 
                        Quantity = :quantity,
                        UpdatedAt = NOW()
                        WHERE CartID = :cart_id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':quantity', $newQuantity);
        $updateStmt->bindParam(':cart_id', $existingItem['CartID']);
        
        if ($updateStmt->execute()) {
            sendJsonResponse(true, [
                "cart_id" => $existingItem['CartID'],
                "quantity" => $newQuantity
            ], "Cập nhật giỏ hàng thành công");
        }
    } else {
        $insertQuery = "INSERT INTO Cart 
                        (UserID, ProductID, Quantity, Note) 
                        VALUES 
                        (:user_id, :product_id, :quantity, :note)";
        $insertStmt = $db->prepare($insertQuery);
        $insertStmt->bindParam(':user_id', $data['user_id']);
        $insertStmt->bindParam(':product_id', $data['product_id']);
        $insertStmt->bindParam(':quantity', $quantity);
        $insertStmt->bindParam(':note', sanitizeInput($data['note'] ?? ''));
        
        if ($insertStmt->execute()) {
            sendJsonResponse(true, [
                "cart_id" => $db->lastInsertId()
            ], "Thêm vào giỏ hàng thành công", 201);
        }
    }
    
    sendJsonResponse(false, null, "Không thể thêm vào giỏ hàng", 500);
}

function updateCartItem($db) {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', trim($path, '/'));
    $cartId = end($pathParts);
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['quantity'])) {
        sendJsonResponse(false, null, "Thiếu thông tin số lượng", 400);
    }
    
    $quantity = intval($data['quantity']);
    
    if ($quantity < 1) {
        sendJsonResponse(false, null, "Số lượng không hợp lệ", 400);
    }
    
    $checkQuery = "SELECT p.Quantity as stock 
                   FROM Cart c
                   INNER JOIN Products p ON c.ProductID = p.ProductID
                   WHERE c.CartID = :cart_id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':cart_id', $cartId);
    $checkStmt->execute();
    $result = $checkStmt->fetch();
    
    if (!$result) {
        sendJsonResponse(false, null, "Sản phẩm không tồn tại trong giỏ", 404);
    }
    
    if ($quantity > $result['stock']) {
        sendJsonResponse(false, null, "Số lượng vượt quá tồn kho", 400);
    }
    
    $query = "UPDATE Cart SET 
              Quantity = :quantity,
              UpdatedAt = NOW()
              WHERE CartID = :cart_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':quantity', $quantity);
    $stmt->bindParam(':cart_id', $cartId);
    
    if ($stmt->execute()) {
        sendJsonResponse(true, null, "Cập nhật giỏ hàng thành công");
    } else {
        sendJsonResponse(false, null, "Không thể cập nhật giỏ hàng", 500);
    }
}

function removeFromCart($db) {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', trim($path, '/'));
    $cartId = end($pathParts);
    
    $query = "DELETE FROM Cart WHERE CartID = :cart_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':cart_id', $cartId);
    
    if ($stmt->execute()) {
        sendJsonResponse(true, null, "Xóa sản phẩm khỏi giỏ hàng thành công");
    } else {
        sendJsonResponse(false, null, "Không thể xóa sản phẩm", 500);
    }
}