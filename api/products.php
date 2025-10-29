<?php
/**
 * Products API
 * LA CUISINE NGỌT
 * FILE: api/products.php
 */
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

require_once __DIR__ . '/config/database.php';

enableCORS();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                getProductById($db, $_GET['id']);
            } else {
                getAllProducts($db);
            }
            break;
            
        case 'POST':
            checkAdminPermission();
            createProduct($db);
            break;
            
        case 'PUT':
            checkAdminPermission();
            updateProduct($db);
            break;
            
        case 'DELETE':
            checkAdminPermission();
            deleteProduct($db);
            break;
            
        default:
            sendJsonResponse(false, null, "Method không được hỗ trợ", 405);
    }
} catch(Exception $e) {
    error_log("Products API Error: " . $e->getMessage());
    sendJsonResponse(false, null, "Có lỗi xảy ra", 500);
}

function getAllProducts($db) {
    $search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : null;
    $category = isset($_GET['category']) ? sanitizeInput($_GET['category']) : null;
    $status = isset($_GET['status']) ? sanitizeInput($_GET['status']) : null;
    $featured = isset($_GET['featured']) ? sanitizeInput($_GET['featured']) : null;
    
    $query = "SELECT 
                p.ProductID as product_id,
                p.ProductName as product_name,
                p.Description as description,
                p.Price as price,
                p.OriginalPrice as original_price,
                p.Quantity as quantity,
                p.Status as status,
                p.ImageURL as image_url,
                p.IsFeatured as is_featured,
                p.Views as views,
                p.SoldCount as sold_count,
                c.CategoryID as category_id,
                c.CategoryName as category_name,
                p.CreatedAt as created_at,
                p.UpdatedAt as updated_at
              FROM Products p
              LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
              WHERE 1=1";
    
    $params = [];
    
    if ($search) {
        $query .= " AND (p.ProductName LIKE :search OR p.Description LIKE :search OR c.CategoryName LIKE :search)";
        $params[':search'] = "%$search%";
    }
    
    if ($category) {
        $query .= " AND c.CategoryName = :category";
        $params[':category'] = $category;
    }
    
    if ($status) {
        $query .= " AND p.Status = :status";
        $params[':status'] = $status;
    }
    
    // ✅ FIX: Thêm filter cho featured products
    if ($featured === '1') {
        $query .= " AND p.IsFeatured = 1";
    }
    
    $query .= " ORDER BY p.CreatedAt DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    
    $products = $stmt->fetchAll();
    
    sendJsonResponse(true, [
        "products" => $products,
        "total" => count($products)
    ], "Lấy danh sách sản phẩm thành công");
}

function getProductById($db, $id) {
    $query = "SELECT 
                p.*,
                c.CategoryName as category_name
              FROM Products p
              LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
              WHERE p.ProductID = :id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    
    $product = $stmt->fetch();
    
    if ($product) {
        sendJsonResponse(true, $product, "Lấy thông tin sản phẩm thành công");
    } else {
        sendJsonResponse(false, null, "Không tìm thấy sản phẩm", 404);
    }
}

function createProduct($db) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (empty($data['product_name']) || empty($data['category_id']) || empty($data['price'])) {
        sendJsonResponse(false, null, "Thiếu thông tin bắt buộc", 400);
    }
    
    $query = "INSERT INTO Products 
              (ProductName, CategoryID, Description, Price, Quantity, Status, ImageURL) 
              VALUES 
              (:name, :category, :desc, :price, :quantity, :status, :image)";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':name', sanitizeInput($data['product_name']));
    $stmt->bindParam(':category', sanitizeInput($data['category_id']));
    $stmt->bindParam(':desc', sanitizeInput($data['description'] ?? ''));
    $stmt->bindParam(':price', $data['price']);
    $stmt->bindParam(':quantity', $data['quantity'] ?? 0);
    $stmt->bindParam(':status', $data['status'] ?? 'available');
    $stmt->bindParam(':image', $data['image_url'] ?? '');
    
    if ($stmt->execute()) {
        sendJsonResponse(true, [
            "product_id" => $db->lastInsertId()
        ], "Thêm sản phẩm thành công", 201);
    } else {
        sendJsonResponse(false, null, "Không thể thêm sản phẩm", 500);
    }
}

function updateProduct($db) {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', trim($path, '/'));
    $id = end($pathParts);
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    $query = "UPDATE Products SET 
              ProductName = :name,
              CategoryID = :category,
              Description = :desc,
              Price = :price,
              Quantity = :quantity,
              Status = :status
              WHERE ProductID = :id";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':name', sanitizeInput($data['product_name']));
    $stmt->bindParam(':category', sanitizeInput($data['category_id']));
    $stmt->bindParam(':desc', sanitizeInput($data['description'] ?? ''));
    $stmt->bindParam(':price', $data['price']);
    $stmt->bindParam(':quantity', $data['quantity'] ?? 0);
    $stmt->bindParam(':status', $data['status'] ?? 'available');
    
    if ($stmt->execute()) {
        sendJsonResponse(true, null, "Cập nhật sản phẩm thành công");
    } else {
        sendJsonResponse(false, null, "Không thể cập nhật sản phẩm", 500);
    }
}

function deleteProduct($db) {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', trim($path, '/'));
    $id = end($pathParts);
    
    $query = "DELETE FROM Products WHERE ProductID = :id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    
    if ($stmt->execute()) {
        sendJsonResponse(true, null, "Xóa sản phẩm thành công");
    } else {
        sendJsonResponse(false, null, "Không thể xóa sản phẩm", 500);
    }
}
?>