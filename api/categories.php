<?php
/**
 * Categories API
 * LA CUISINE NGỌT
 * FILE: api/categories.php
 */

require_once __DIR__ . '/config/database.php';

enableCORS();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            getAllCategories($db);
            break;
            
        case 'POST':
            checkAdminPermission();
            createCategory($db);
            break;
            
        case 'PUT':
            checkAdminPermission();
            updateCategory($db);
            break;
            
        case 'DELETE':
            checkAdminPermission();
            deleteCategory($db);
            break;
            
        default:
            sendJsonResponse(false, null, "Method không được hỗ trợ", 405);
    }
} catch(Exception $e) {
    error_log("Categories API Error: " . $e->getMessage());
    sendJsonResponse(false, null, "Có lỗi xảy ra", 500);
}

function getAllCategories($db) {
    $query = "SELECT 
                CategoryID as category_id,
                CategoryName as category_name,
                Description as description,
                Slug as slug,
                ParentID as parent_id,
                IsActive as is_active,
                DisplayOrder as display_order,
                CreatedAt as created_at
              FROM Categories
              WHERE IsActive = 1
              ORDER BY DisplayOrder ASC, CategoryName ASC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $categories = $stmt->fetchAll();
    
    foreach ($categories as &$category) {
        $countQuery = "SELECT COUNT(*) as product_count 
                      FROM Products 
                      WHERE CategoryID = :category_id AND IsActive = 1";
        $countStmt = $db->prepare($countQuery);
        $countStmt->bindParam(':category_id', $category['category_id']);
        $countStmt->execute();
        $count = $countStmt->fetch();
        $category['product_count'] = $count['product_count'];
    }
    
    sendJsonResponse(true, [
        "categories" => $categories,
        "total" => count($categories)
    ], "Lấy danh sách danh mục thành công");
}

function createCategory($db) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (empty($data['category_name'])) {
        sendJsonResponse(false, null, "Thiếu tên danh mục", 400);
    }
    
    $slug = createSlug($data['category_name']);
    
    $query = "INSERT INTO Categories 
              (CategoryName, Description, Slug, ParentID, IsActive, DisplayOrder) 
              VALUES 
              (:name, :desc, :slug, :parent, :active, :order)";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':name', sanitizeInput($data['category_name']));
    $stmt->bindParam(':desc', sanitizeInput($data['description'] ?? ''));
    $stmt->bindParam(':slug', $slug);
    $stmt->bindParam(':parent', $data['parent_id'] ?? null);
    $stmt->bindParam(':active', $data['is_active'] ?? 1);
    $stmt->bindParam(':order', $data['display_order'] ?? 0);
    
    if ($stmt->execute()) {
        sendJsonResponse(true, [
            "category_id" => $db->lastInsertId()
        ], "Thêm danh mục thành công", 201);
    } else {
        sendJsonResponse(false, null, "Không thể thêm danh mục", 500);
    }
}

function updateCategory($db) {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', trim($path, '/'));
    $id = end($pathParts);
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    $slug = createSlug($data['category_name']);
    
    $query = "UPDATE Categories SET 
              CategoryName = :name,
              Description = :desc,
              Slug = :slug,
              ParentID = :parent,
              IsActive = :active,
              DisplayOrder = :order
              WHERE CategoryID = :id";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':name', sanitizeInput($data['category_name']));
    $stmt->bindParam(':desc', sanitizeInput($data['description'] ?? ''));
    $stmt->bindParam(':slug', $slug);
    $stmt->bindParam(':parent', $data['parent_id'] ?? null);
    $stmt->bindParam(':active', $data['is_active'] ?? 1);
    $stmt->bindParam(':order', $data['display_order'] ?? 0);
    
    if ($stmt->execute()) {
        sendJsonResponse(true, null, "Cập nhật danh mục thành công");
    } else {
        sendJsonResponse(false, null, "Không thể cập nhật danh mục", 500);
    }
}

function deleteCategory($db) {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', trim($path, '/'));
    $id = end($pathParts);
    
    $checkQuery = "SELECT COUNT(*) as count FROM Products WHERE CategoryID = :id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':id', $id);
    $checkStmt->execute();
    $result = $checkStmt->fetch();
    
    if ($result['count'] > 0) {
        sendJsonResponse(false, null, "Không thể xóa danh mục có sản phẩm", 400);
    }
    
    $query = "DELETE FROM Categories WHERE CategoryID = :id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    
    if ($stmt->execute()) {
        sendJsonResponse(true, null, "Xóa danh mục thành công");
    } else {
        sendJsonResponse(false, null, "Không thể xóa danh mục", 500);
    }
}

function createSlug($str) {
    $str = mb_strtolower($str, 'UTF-8');
    
    $str = preg_replace("/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/", 'a', $str);
    $str = preg_replace("/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/", 'e', $str);
    $str = preg_replace("/(ì|í|ị|ỉ|ĩ)/", 'i', $str);
    $str = preg_replace("/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/", 'o', $str);
    $str = preg_replace("/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/", 'u', $str);
    $str = preg_replace("/(ỳ|ý|ỵ|ỷ|ỹ)/", 'y', $str);
    $str = preg_replace("/(đ)/", 'd', $str);
    
    $str = preg_replace("/[^a-z0-9\s-]/", '', $str);
    $str = preg_replace("/[\s-]+/", '-', $str);
    $str = trim($str, '-');
    
    return $str;
}
?>