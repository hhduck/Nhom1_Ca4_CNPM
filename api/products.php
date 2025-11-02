<?php
/**
 * Products API
 * LA CUISINE NGỌT
 * FILE: api/products.php
 */
// Bật output buffering để chặn bất kỳ output nào trước JSON
ob_start();

// Tắt display_errors để tránh HTML error làm hỏng JSON response
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL); // Vẫn log errors vào error_log
ini_set('log_errors', 1);

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
    // Lấy ID từ URL path
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', trim($path, '/'));
    $id = end($pathParts);
    
    // Validate ID
    if (!$id || !is_numeric($id)) {
        sendJsonResponse(false, null, "ID sản phẩm không hợp lệ", 400);
    }
    
    $id = (int)$id;
    
    // Parse JSON input
    $input = file_get_contents("php://input");
    if (empty($input)) {
        sendJsonResponse(false, null, "Dữ liệu không hợp lệ", 400);
    }
    
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        sendJsonResponse(false, null, "JSON không hợp lệ: " . json_last_error_msg(), 400);
    }
    
    // Convert category_id to integer if it's a string
    $categoryId = null;
    if (isset($data['category_id']) && $data['category_id'] !== null && $data['category_id'] !== '') {
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
    
    // Build UPDATE query dynamically để chỉ update các field có trong $data
    $updateFields = [];
    $params = [':id' => $id];
    
    if (isset($data['product_name'])) {
        $updateFields[] = "ProductName = :name";
        $params[':name'] = sanitizeInput($data['product_name']);
    }
    
    if ($categoryId !== null) {
        $updateFields[] = "CategoryID = :category";
        $params[':category'] = $categoryId;
    }
    
    if (isset($data['description'])) {
        $updateFields[] = "Description = :desc";
        $params[':desc'] = sanitizeInput($data['description']);
    }
    
    if (isset($data['price'])) {
        $updateFields[] = "Price = :price";
        $params[':price'] = $data['price'];
    }
    
    if (isset($data['quantity'])) {
        $updateFields[] = "Quantity = :quantity";
        $params[':quantity'] = (int)$data['quantity'];
    }
    
    if (isset($data['status'])) {
        $updateFields[] = "Status = :status";
        $params[':status'] = sanitizeInput($data['status']);
    }
    
    if (isset($data['image_url'])) {
        $updateFields[] = "ImageURL = :image_url";
        $params[':image_url'] = sanitizeInput($data['image_url']);
    }
    
    if (isset($data['short_intro'])) {
        $updateFields[] = "ShortIntro = :short_intro";
        $params[':short_intro'] = sanitizeInput($data['short_intro']);
    }
    
    if (isset($data['short_paragraph'])) {
        $updateFields[] = "ShortParagraph = :short_paragraph";
        $params[':short_paragraph'] = sanitizeInput($data['short_paragraph']);
    }
    
    if (isset($data['structure'])) {
        $updateFields[] = "Structure = :structure";
        $params[':structure'] = sanitizeInput($data['structure']);
    }
    
    if (isset($data['usage'])) {
        $updateFields[] = "`Usage` = :usage";
        $params[':usage'] = sanitizeInput($data['usage']);
    }
    
    if (isset($data['bonus'])) {
        $updateFields[] = "Bonus = :bonus";
        $params[':bonus'] = sanitizeInput($data['bonus']);
    }
    
    if (empty($updateFields)) {
        sendJsonResponse(false, null, "Không có dữ liệu để cập nhật", 400);
    }
    
    $updateFields[] = "UpdatedAt = CURRENT_TIMESTAMP";
    
    $query = "UPDATE Products SET " . implode(', ', $updateFields) . " WHERE ProductID = :id";
    
    $stmt = $db->prepare($query);
    
    // Bind all parameters
    foreach ($params as $key => $value) {
        if ($key === ':category') {
            $stmt->bindValue($key, $value, PDO::PARAM_INT);
        } else if ($key === ':id' || $key === ':quantity') {
            $stmt->bindValue($key, $value, PDO::PARAM_INT);
        } else {
            $stmt->bindValue($key, $value);
        }
    }
    
    try {
        if ($stmt->execute()) {
            $rowCount = $stmt->rowCount();
            if ($rowCount > 0) {
                sendJsonResponse(true, null, "Cập nhật sản phẩm thành công");
            } else {
                sendJsonResponse(false, null, "Không tìm thấy sản phẩm để cập nhật", 404);
            }
        } else {
            $errorInfo = $stmt->errorInfo();
            error_log("Update Product Error: " . print_r($errorInfo, true));
            sendJsonResponse(false, null, "Không thể cập nhật sản phẩm: " . ($errorInfo[2] ?? 'Unknown error'), 500);
        }
    } catch (PDOException $e) {
        error_log("Update Product PDO Error: " . $e->getMessage());
        sendJsonResponse(false, null, "Lỗi database: " . $e->getMessage(), 500);
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