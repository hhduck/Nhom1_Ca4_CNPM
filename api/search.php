<?php
/**
 * Search API
 * LA CUISINE NGỌT
 * FILE: api/search.php
 */

require_once __DIR__ . '/config/database.php';

enableCORS();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    search($db);
} else {
    sendJsonResponse(false, null, "Method không được hỗ trợ", 405);
}

function search($db) {
    $keyword = isset($_GET['q']) ? sanitizeInput($_GET['q']) : null;
    $type = isset($_GET['type']) ? sanitizeInput($_GET['type']) : 'all';
    
    if (empty($keyword) || strlen($keyword) < 2) {
        sendJsonResponse(false, null, "Từ khóa tìm kiếm phải có ít nhất 2 ký tự", 400);
    }
    
    $results = [];
    
    if ($type === 'all' || $type === 'products') {
        $results['products'] = searchProducts($db, $keyword);
    }
    
    if (($type === 'all' || $type === 'orders')) {
        try {
            checkAdminPermission();
            $results['orders'] = searchOrders($db, $keyword);
        } catch (Exception $e) {
            // Không có quyền
        }
    }
    
    if (($type === 'all' || $type === 'users')) {
        try {
            checkAdminPermission();
            $results['users'] = searchUsers($db, $keyword);
        } catch (Exception $e) {
            // Không có quyền
        }
    }
    
    sendJsonResponse(true, $results, "Tìm kiếm thành công");
}

function searchProducts($db, $keyword) {
    $query = "SELECT 
                p.ProductID as product_id,
                p.ProductName as product_name,
                p.Description as description,
                p.Price as price,
                p.ImageURL as image_url,
                p.Status as status,
                c.CategoryName as category_name
              FROM Products p
              LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
              WHERE p.IsActive = 1
              AND (p.ProductName LIKE :keyword 
                   OR p.Description LIKE :keyword
                   OR c.CategoryName LIKE :keyword)
              ORDER BY p.ProductName ASC
              LIMIT 20";
    
    $stmt = $db->prepare($query);
    $searchKeyword = "%$keyword%";
    $stmt->bindParam(':keyword', $searchKeyword);
    $stmt->execute();
    
    return $stmt->fetchAll();
}

function searchOrders($db, $keyword) {
    $query = "SELECT 
                o.OrderID as order_id,
                o.OrderCode as order_code,
                o.CustomerName as customer_name,
                o.CustomerPhone as customer_phone,
                o.FinalAmount as final_amount,
                o.OrderStatus as order_status,
                o.PaymentStatus as payment_status,
                o.CreatedAt as created_at
              FROM Orders o
              WHERE o.OrderCode LIKE :keyword
                 OR o.CustomerName LIKE :keyword
                 OR o.CustomerPhone LIKE :keyword
                 OR o.CustomerEmail LIKE :keyword
              ORDER BY o.CreatedAt DESC
              LIMIT 20";
    
    $stmt = $db->prepare($query);
    $searchKeyword = "%$keyword%";
    $stmt->bindParam(':keyword', $searchKeyword);
    $stmt->execute();
    
    return $stmt->fetchAll();
}

function searchUsers($db, $keyword) {
    $query = "SELECT 
                UserID as user_id,
                Username as username,
                Email as email,
                FullName as full_name,
                Phone as phone,
                Role as role,
                Status as status
              FROM Users
              WHERE Username LIKE :keyword
                 OR Email LIKE :keyword
                 OR FullName LIKE :keyword
                 OR Phone LIKE :keyword
              ORDER BY FullName ASC
              LIMIT 20";
    
    $stmt = $db->prepare($query);
    $searchKeyword = "%$keyword%";
    $stmt->bindParam(':keyword', $searchKeyword);
    $stmt->execute();
    
    return $stmt->fetchAll();
}