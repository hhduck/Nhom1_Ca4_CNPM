<?php
/**
 * Products API Endpoint
 * LA CUISINE NGỌT - Cake Selling Website
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../database/connection.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', trim($path, '/'));
    
    // Remove 'api' from path parts
    if ($pathParts[0] === 'api') {
        array_shift($pathParts);
    }
    
    switch ($method) {
        case 'GET':
            handleGetProducts($pathParts);
            break;
        case 'POST':
            handleCreateProduct($pathParts);
            break;
        case 'PUT':
            handleUpdateProduct($pathParts);
            break;
        case 'DELETE':
            handleDeleteProduct($pathParts);
            break;
        default:
            handleError('Method not allowed', 405);
    }
    
} catch (Exception $e) {
    error_log("Products API Error: " . $e->getMessage());
    handleError('Internal server error', 500);
}

function handleGetProducts($pathParts) {
    $productId = isset($pathParts[1]) ? (int)$pathParts[1] : null;
    
    if ($productId) {
        getProductById($productId);
    } else {
        getProducts();
    }
}

function getProducts() {
    $featured = isset($_GET['featured']) ? (int)$_GET['featured'] : null;
    $category = isset($_GET['category']) ? (int)$_GET['category'] : null;
    $search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : null;
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : Config::ITEMS_PER_PAGE;
    $offset = ($page - 1) * $limit;
    
    $sql = "SELECT p.*, c.CategoryName 
            FROM Products p 
            INNER JOIN Categories c ON p.CategoryID = c.CategoryID 
            WHERE p.IsActive = 1";
    
    $params = [];
    
    if ($featured) {
        $sql .= " AND p.IsFeatured = 1";
    }
    
    if ($category) {
        $sql .= " AND p.CategoryID = ?";
        $params[] = $category;
    }
    
    if ($search) {
        $sql .= " AND (p.ProductName LIKE ? OR p.Description LIKE ? OR c.CategoryName LIKE ?)";
        $searchTerm = "%{$search}%";
        $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm]);
    }
    
    $sql .= " ORDER BY p.CreatedAt DESC";
    
    // Get total count
    $countSql = str_replace("SELECT p.*, c.CategoryName", "SELECT COUNT(*)", $sql);
    $countResult = executeQuery($countSql, $params);
    $totalItems = $countResult[0]['COUNT(*)'] ?? 0;
    
    // Add pagination
    $sql .= " OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
    $params[] = $offset;
    $params[] = $limit;
    
    $products = executeQuery($sql, $params);
    
    // Format products
    $formattedProducts = array_map(function($product) {
        return [
            'id' => (int)$product['ProductID'],
            'name' => $product['ProductName'],
            'description' => $product['Description'],
            'price' => (float)$product['Price'],
            'category_id' => (int)$product['CategoryID'],
            'category_name' => $product['CategoryName'],
            'image_url' => $product['ImageURL'],
            'ingredients' => $product['Ingredients'],
            'is_featured' => (bool)$product['IsFeatured'],
            'stock_quantity' => (int)$product['StockQuantity'],
            'created_at' => $product['CreatedAt']
        ];
    }, $products);
    
    $response = [
        'products' => $formattedProducts,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $limit,
            'total_items' => (int)$totalItems,
            'total_pages' => ceil($totalItems / $limit)
        ]
    ];
    
    sendSuccess($response);
}

function getProductById($productId) {
    $sql = "SELECT p.*, c.CategoryName 
            FROM Products p 
            INNER JOIN Categories c ON p.CategoryID = c.CategoryID 
            WHERE p.ProductID = ? AND p.IsActive = 1";
    
    $products = executeQuery($sql, [$productId]);
    
    if (empty($products)) {
        handleError('Product not found', 404);
    }
    
    $product = $products[0];
    $formattedProduct = [
        'id' => (int)$product['ProductID'],
        'name' => $product['ProductName'],
        'description' => $product['Description'],
        'price' => (float)$product['Price'],
        'category_id' => (int)$product['CategoryID'],
        'category_name' => $product['CategoryName'],
        'image_url' => $product['ImageURL'],
        'ingredients' => $product['Ingredients'],
        'is_featured' => (bool)$product['IsFeatured'],
        'stock_quantity' => (int)$product['StockQuantity'],
        'created_at' => $product['CreatedAt']
    ];
    
    sendSuccess($formattedProduct);
}

function handleCreateProduct($pathParts) {
    // Check if user is admin
    if (!isAdmin()) {
        handleError('Unauthorized', 401);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        handleError('Invalid JSON input', 400);
    }
    
    validateRequired(['name', 'price', 'category_id'], $input);
    
    $name = sanitizeInput($input['name']);
    $description = sanitizeInput($input['description'] ?? '');
    $price = (float)$input['price'];
    $categoryId = (int)$input['category_id'];
    $imageUrl = sanitizeInput($input['image_url'] ?? '');
    $ingredients = sanitizeInput($input['ingredients'] ?? '');
    $isFeatured = (bool)($input['is_featured'] ?? false);
    $stockQuantity = (int)($input['stock_quantity'] ?? 0);
    
    // Validate price
    if ($price <= 0) {
        handleError('Price must be greater than 0', 400);
    }
    
    // Check if category exists
    $categorySql = "SELECT CategoryID FROM Categories WHERE CategoryID = ? AND IsActive = 1";
    $categoryResult = executeQuery($categorySql, [$categoryId]);
    if (empty($categoryResult)) {
        handleError('Category not found', 400);
    }
    
    $sql = "INSERT INTO Products (ProductName, Description, Price, CategoryID, ImageURL, Ingredients, IsFeatured, StockQuantity) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $params = [$name, $description, $price, $categoryId, $imageUrl, $ingredients, $isFeatured, $stockQuantity];
    
    $result = executeNonQuery($sql, $params);
    
    if ($result > 0) {
        $productId = getLastInsertId();
        logActivity(getCurrentUserId(), 'create_product', "Created product: {$name}");
        sendSuccess(['id' => $productId], 'Product created successfully');
    } else {
        handleError('Failed to create product', 500);
    }
}

function handleUpdateProduct($pathParts) {
    // Check if user is admin
    if (!isAdmin()) {
        handleError('Unauthorized', 401);
    }
    
    $productId = isset($pathParts[1]) ? (int)$pathParts[1] : null;
    
    if (!$productId) {
        handleError('Product ID required', 400);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        handleError('Invalid JSON input', 400);
    }
    
    // Check if product exists
    $existingProduct = executeQuery("SELECT ProductID FROM Products WHERE ProductID = ?", [$productId]);
    if (empty($existingProduct)) {
        handleError('Product not found', 404);
    }
    
    $updateFields = [];
    $params = [];
    
    if (isset($input['name'])) {
        $updateFields[] = "ProductName = ?";
        $params[] = sanitizeInput($input['name']);
    }
    
    if (isset($input['description'])) {
        $updateFields[] = "Description = ?";
        $params[] = sanitizeInput($input['description']);
    }
    
    if (isset($input['price'])) {
        $price = (float)$input['price'];
        if ($price <= 0) {
            handleError('Price must be greater than 0', 400);
        }
        $updateFields[] = "Price = ?";
        $params[] = $price;
    }
    
    if (isset($input['category_id'])) {
        $categoryId = (int)$input['category_id'];
        // Check if category exists
        $categoryResult = executeQuery("SELECT CategoryID FROM Categories WHERE CategoryID = ? AND IsActive = 1", [$categoryId]);
        if (empty($categoryResult)) {
            handleError('Category not found', 400);
        }
        $updateFields[] = "CategoryID = ?";
        $params[] = $categoryId;
    }
    
    if (isset($input['image_url'])) {
        $updateFields[] = "ImageURL = ?";
        $params[] = sanitizeInput($input['image_url']);
    }
    
    if (isset($input['ingredients'])) {
        $updateFields[] = "Ingredients = ?";
        $params[] = sanitizeInput($input['ingredients']);
    }
    
    if (isset($input['is_featured'])) {
        $updateFields[] = "IsFeatured = ?";
        $params[] = (bool)$input['is_featured'];
    }
    
    if (isset($input['stock_quantity'])) {
        $updateFields[] = "StockQuantity = ?";
        $params[] = (int)$input['stock_quantity'];
    }
    
    if (isset($input['is_active'])) {
        $updateFields[] = "IsActive = ?";
        $params[] = (bool)$input['is_active'];
    }
    
    if (empty($updateFields)) {
        handleError('No fields to update', 400);
    }
    
    $updateFields[] = "UpdatedAt = GETDATE()";
    $params[] = $productId;
    
    $sql = "UPDATE Products SET " . implode(', ', $updateFields) . " WHERE ProductID = ?";
    
    $result = executeNonQuery($sql, $params);
    
    if ($result > 0) {
        logActivity(getCurrentUserId(), 'update_product', "Updated product ID: {$productId}");
        sendSuccess(null, 'Product updated successfully');
    } else {
        handleError('Failed to update product', 500);
    }
}

function handleDeleteProduct($pathParts) {
    // Check if user is admin
    if (!isAdmin()) {
        handleError('Unauthorized', 401);
    }
    
    $productId = isset($pathParts[1]) ? (int)$pathParts[1] : null;
    
    if (!$productId) {
        handleError('Product ID required', 400);
    }
    
    // Check if product exists
    $existingProduct = executeQuery("SELECT ProductName FROM Products WHERE ProductID = ?", [$productId]);
    if (empty($existingProduct)) {
        handleError('Product not found', 404);
    }
    
    // Soft delete - set IsActive to 0
    $sql = "UPDATE Products SET IsActive = 0, UpdatedAt = GETDATE() WHERE ProductID = ?";
    $result = executeNonQuery($sql, [$productId]);
    
    if ($result > 0) {
        $productName = $existingProduct[0]['ProductName'];
        logActivity(getCurrentUserId(), 'delete_product', "Deleted product: {$productName}");
        sendSuccess(null, 'Product deleted successfully');
    } else {
        handleError('Failed to delete product', 500);
    }
}

// Helper functions
function isAdmin() {
    // This is a simplified check - in production, implement proper JWT authentication
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';
    if (strpos($token, 'Bearer ') === 0) {
        $token = substr($token, 7);
        if ($token === 'demo') { return true; }
        // In production, validate JWT token here
        return true; // simplified
    }
    return false;
}

function getCurrentUserId() {
    // This is a simplified implementation - in production, get from JWT token
    return 1; // Admin user ID
}

?>

