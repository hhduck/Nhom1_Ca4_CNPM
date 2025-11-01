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
            // Kiểm tra cả URL path và query string
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $pathParts = explode('/', trim($path, '/'));
            $productId = null;
            
            // Lấy ID từ URL path (vd: /api/products.php/123)
            if (end($pathParts) && is_numeric(end($pathParts))) {
                $productId = end($pathParts);
            }
            // Hoặc từ query string (vd: ?id=123)
            else if (isset($_GET['id'])) {
                $productId = $_GET['id'];
            }
            
            if ($productId) {
                getProductById($db, $productId);
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
    
    // Thêm cache headers để tránh cache
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    $query = "SELECT 
                p.ProductID as product_id,
                p.ProductName as product_name,
                p.Description as description,
                p.Price as price,
                p.OriginalPrice as original_price,
                p.Quantity as quantity,
                p.Status as status,
                p.ImageURL as image_url,
                p.ShortIntro as short_intro,
                p.ShortParagraph as short_paragraph,
                p.Structure as structure,
                p.`Usage` as product_usage,
                p.Bonus as bonus,
                p.IsFeatured as is_featured,
                p.Views as views,
                p.SoldCount as sold_count,
                c.CategoryID as category_id,
                c.CategoryName as category_name,
                p.CreatedAt as created_at,
                p.UpdatedAt as updated_at
              FROM Products p
              LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
              WHERE p.IsActive = 1";
    
    $params = [];
    
    if ($search) {
        $query .= " AND (p.ProductName LIKE :search1 OR p.Description LIKE :search2 OR c.CategoryName LIKE :search3)";
        $params[':search1'] = "%$search%";
        $params[':search2'] = "%$search%";
        $params[':search3'] = "%$search%";
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
                p.ProductID as product_id,
                p.ProductName as product_name,
                p.CategoryID as category_id,
                p.Description as description,
                p.Price as price,
                p.Quantity as quantity,
                p.Status as status,
                p.ImageURL as image_url,
                p.ShortIntro as short_intro,
                p.ShortParagraph as short_paragraph,
                p.Structure as structure,
                p.`Usage` as product_usage,
                p.Bonus as bonus,
                p.IsFeatured as is_featured,
                p.Views as views,
                p.SoldCount as sold_count,
                p.CreatedAt as created_at,
                p.UpdatedAt as updated_at,
                c.CategoryName as category_name
              FROM Products p
              LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
              WHERE p.ProductID = :id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    
    $product = $stmt->fetch(PDO::FETCH_ASSOC);
    
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
    
    // Convert category_id to integer if it's a string
    $categoryId = is_numeric($data['category_id']) ? (int)$data['category_id'] : null;
    
    // If category_id is not a number, try to find by category name
    if (!$categoryId || $categoryId <= 0) {
        $categoryName = sanitizeInput($data['category_id']);
        $catQuery = "SELECT CategoryID FROM Categories WHERE CategoryName = :name LIMIT 1";
        $catStmt = $db->prepare($catQuery);
        $catStmt->bindParam(':name', $categoryName);
        $catStmt->execute();
        $catResult = $catStmt->fetch();
        if ($catResult) {
            $categoryId = (int)$catResult['CategoryID'];
        } else {
            sendJsonResponse(false, null, "Danh mục không tồn tại", 400);
        }
    }
    
    $query = "INSERT INTO Products 
              (ProductName, CategoryID, Description, Price, Quantity, Status, ImageURL, ShortIntro, ShortParagraph, Structure, `Usage`, Bonus) 
              VALUES 
              (:name, :category, :desc, :price, :quantity, :status, :image, :short_intro, :short_paragraph, :structure, :usage, :bonus)";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':name', sanitizeInput($data['product_name']));
    $stmt->bindParam(':category', $categoryId, PDO::PARAM_INT);
    $stmt->bindParam(':desc', sanitizeInput($data['description'] ?? ''));
    $stmt->bindParam(':price', $data['price']);
    $stmt->bindParam(':quantity', $data['quantity'] ?? 0);
    $stmt->bindParam(':status', $data['status'] ?? 'available');
    $stmt->bindParam(':image', $data['image_url'] ?? '');
    $stmt->bindParam(':short_intro', sanitizeInput($data['short_intro'] ?? ''));
    $stmt->bindParam(':short_paragraph', sanitizeInput($data['short_paragraph'] ?? ''));
    $stmt->bindParam(':structure', sanitizeInput($data['structure'] ?? ''));
    $stmt->bindParam(':usage', sanitizeInput($data['usage'] ?? ''));
    $stmt->bindParam(':bonus', sanitizeInput($data['bonus'] ?? ''));
    
    if ($stmt->execute()) {
        sendJsonResponse(true, [
            "product_id" => $db->lastInsertId()
        ], "Thêm sản phẩm thành công", 201);
    } else {
        $errorInfo = $stmt->errorInfo();
        sendJsonResponse(false, null, "Không thể thêm sản phẩm: " . ($errorInfo[2] ?? 'Unknown error'), 500);
    }
}

function updateProduct($db) {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', trim($path, '/'));
    $id = end($pathParts);
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Convert category_id to integer if it's a string
    $categoryId = null;
    if (isset($data['category_id'])) {
        $categoryId = is_numeric($data['category_id']) ? (int)$data['category_id'] : null;
        
        // If category_id is not a number, try to find by category name
        if (!$categoryId || $categoryId <= 0) {
            $categoryName = sanitizeInput($data['category_id']);
            $catQuery = "SELECT CategoryID FROM Categories WHERE CategoryName = :name LIMIT 1";
            $catStmt = $db->prepare($catQuery);
            $catStmt->bindParam(':name', $categoryName);
            $catStmt->execute();
            $catResult = $catStmt->fetch();
            if ($catResult) {
                $categoryId = (int)$catResult['CategoryID'];
            } else {
                sendJsonResponse(false, null, "Danh mục không tồn tại", 400);
            }
        }
    }
    
    $query = "UPDATE Products SET 
              ProductName = :name,
              CategoryID = :category,
              Description = :desc,
              Price = :price,
              Quantity = :quantity,
              Status = :status,
              ImageURL = :image_url,
              ShortIntro = :short_intro,
              ShortParagraph = :short_paragraph,
              Structure = :structure,
              `Usage` = :usage,
              Bonus = :bonus,
              UpdatedAt = CURRENT_TIMESTAMP
              WHERE ProductID = :id";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':name', sanitizeInput($data['product_name']));
    $stmt->bindParam(':category', $categoryId, PDO::PARAM_INT);
    $stmt->bindParam(':desc', sanitizeInput($data['description'] ?? ''));
    $stmt->bindParam(':price', $data['price']);
    $stmt->bindParam(':quantity', $data['quantity'] ?? 0);
    $stmt->bindParam(':status', $data['status'] ?? 'available');
    $stmt->bindParam(':image_url', sanitizeInput($data['image_url'] ?? ''));
    $stmt->bindParam(':short_intro', sanitizeInput($data['short_intro'] ?? ''));
    $stmt->bindParam(':short_paragraph', sanitizeInput($data['short_paragraph'] ?? ''));
    $stmt->bindParam(':structure', sanitizeInput($data['structure'] ?? ''));
    $stmt->bindParam(':usage', sanitizeInput($data['usage'] ?? ''));
    $stmt->bindParam(':bonus', sanitizeInput($data['bonus'] ?? ''));
    
    if ($stmt->execute()) {
        sendJsonResponse(true, null, "Cập nhật sản phẩm thành công");
    } else {
        $errorInfo = $stmt->errorInfo();
        sendJsonResponse(false, null, "Không thể cập nhật sản phẩm: " . ($errorInfo[2] ?? 'Unknown error'), 500);
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