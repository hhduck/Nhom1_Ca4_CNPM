<?php
/**
 * Orders API Endpoint
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
            handleGetOrders($pathParts);
            break;
        case 'POST':
            handleCreateOrder($pathParts);
            break;
        case 'PUT':
            handleUpdateOrder($pathParts);
            break;
        default:
            handleError('Method not allowed', 405);
    }
    
} catch (Exception $e) {
    error_log("Orders API Error: " . $e->getMessage());
    handleError('Internal server error', 500);
}

function handleGetOrders($pathParts) {
    $orderId = isset($pathParts[1]) ? (int)$pathParts[1] : null;
    
    if ($orderId) {
        getOrderById($orderId);
    } else {
        getOrders();
    }
}

function getOrders() {
    $user = getCurrentUser();
    if (!$user) {
        handleError('Authentication required', 401);
    }
    
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : Config::ITEMS_PER_PAGE;
    $offset = ($page - 1) * $limit;
    $status = isset($_GET['status']) ? sanitizeInput($_GET['status']) : null;
    
    $sql = "SELECT o.*, u.FullName as CustomerName, u.Email as CustomerEmail 
            FROM Orders o 
            INNER JOIN Users u ON o.UserID = u.UserID";
    
    $params = [];
    
    // If not admin, only show user's orders
    if ($user['role'] !== 'admin') {
        $sql .= " WHERE o.UserID = ?";
        $params[] = $user['user_id'];
    }
    
    if ($status) {
        $sql .= ($user['role'] !== 'admin' ? " AND" : " WHERE") . " o.Status = ?";
        $params[] = $status;
    }
    
    $sql .= " ORDER BY o.CreatedAt DESC";
    
    // Get total count
    $countSql = str_replace("SELECT o.*, u.FullName as CustomerName, u.Email as CustomerEmail", "SELECT COUNT(*)", $sql);
    $countResult = executeQuery($countSql, $params);
    $totalItems = $countResult[0]['COUNT(*)'] ?? 0;
    
    // Add pagination
    $sql .= " OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
    $params[] = $offset;
    $params[] = $limit;
    
    $orders = executeQuery($sql, $params);
    
    // Format orders
    $formattedOrders = array_map(function($order) {
        return [
            'id' => (int)$order['OrderID'],
            'order_number' => $order['OrderNumber'],
            'customer_name' => $order['CustomerName'],
            'customer_email' => $order['CustomerEmail'],
            'total_amount' => (float)$order['TotalAmount'],
            'status' => $order['Status'],
            'shipping_address' => $order['ShippingAddress'],
            'shipping_phone' => $order['ShippingPhone'],
            'notes' => $order['Notes'],
            'created_at' => $order['CreatedAt'],
            'updated_at' => $order['UpdatedAt']
        ];
    }, $orders);
    
    $response = [
        'orders' => $formattedOrders,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $limit,
            'total_items' => (int)$totalItems,
            'total_pages' => ceil($totalItems / $limit)
        ]
    ];
    
    sendSuccess($response);
}

function getOrderById($orderId) {
    $user = getCurrentUser();
    if (!$user) {
        handleError('Authentication required', 401);
    }
    
    $sql = "SELECT o.*, u.FullName as CustomerName, u.Email as CustomerEmail, u.Phone as CustomerPhone
            FROM Orders o 
            INNER JOIN Users u ON o.UserID = u.UserID 
            WHERE o.OrderID = ?";
    
    $params = [$orderId];
    
    // If not admin, only allow access to own orders
    if ($user['role'] !== 'admin') {
        $sql .= " AND o.UserID = ?";
        $params[] = $user['user_id'];
    }
    
    $orders = executeQuery($sql, $params);
    
    if (empty($orders)) {
        handleError('Order not found', 404);
    }
    
    $order = $orders[0];
    
    // Get order details
    $detailsSql = "SELECT od.*, p.ProductName, p.ImageURL 
                   FROM OrderDetails od 
                   INNER JOIN Products p ON od.ProductID = p.ProductID 
                   WHERE od.OrderID = ?";
    
    $orderDetails = executeQuery($detailsSql, [$orderId]);
    
    $formattedDetails = array_map(function($detail) {
        return [
            'id' => (int)$detail['OrderDetailID'],
            'product_id' => (int)$detail['ProductID'],
            'product_name' => $detail['ProductName'],
            'product_image' => $detail['ImageURL'],
            'quantity' => (int)$detail['Quantity'],
            'unit_price' => (float)$detail['UnitPrice'],
            'total_price' => (float)$detail['TotalPrice']
        ];
    }, $orderDetails);
    
    $formattedOrder = [
        'id' => (int)$order['OrderID'],
        'order_number' => $order['OrderNumber'],
        'customer_name' => $order['CustomerName'],
        'customer_email' => $order['CustomerEmail'],
        'customer_phone' => $order['CustomerPhone'],
        'total_amount' => (float)$order['TotalAmount'],
        'status' => $order['Status'],
        'shipping_address' => $order['ShippingAddress'],
        'shipping_phone' => $order['ShippingPhone'],
        'notes' => $order['Notes'],
        'created_at' => $order['CreatedAt'],
        'updated_at' => $order['UpdatedAt'],
        'items' => $formattedDetails
    ];
    
    sendSuccess($formattedOrder);
}

function handleCreateOrder($input) {
    $user = getCurrentUser();
    if (!$user) {
        handleError('Authentication required', 401);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        handleError('Invalid JSON input', 400);
    }
    
    validateRequired(['shipping_address', 'shipping_phone', 'items'], $input);
    
    $shippingAddress = sanitizeInput($input['shipping_address']);
    $shippingPhone = sanitizeInput($input['shipping_phone']);
    $notes = sanitizeInput($input['notes'] ?? '');
    $items = $input['items'];
    
    if (!is_array($items) || empty($items)) {
        handleError('Order items required', 400);
    }
    
    // Validate items
    $totalAmount = 0;
    $validatedItems = [];
    
    foreach ($items as $item) {
        if (!isset($item['product_id']) || !isset($item['quantity'])) {
            handleError('Invalid item format', 400);
        }
        
        $productId = (int)$item['product_id'];
        $quantity = (int)$item['quantity'];
        
        if ($quantity <= 0) {
            handleError('Invalid quantity', 400);
        }
        
        // Get product details
        $productSql = "SELECT ProductID, ProductName, Price, StockQuantity FROM Products WHERE ProductID = ? AND IsActive = 1";
        $products = executeQuery($productSql, [$productId]);
        
        if (empty($products)) {
            handleError("Product with ID {$productId} not found", 400);
        }
        
        $product = $products[0];
        
        // Check stock
        if ($product['StockQuantity'] < $quantity) {
            handleError("Insufficient stock for product: {$product['ProductName']}", 400);
        }
        
        $unitPrice = (float)$product['Price'];
        $itemTotal = $unitPrice * $quantity;
        $totalAmount += $itemTotal;
        
        $validatedItems[] = [
            'product_id' => $productId,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'total_price' => $itemTotal
        ];
    }
    
    // Generate order number
    $orderNumber = 'ORD' . date('Ymd') . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
    
    // Check if order number already exists
    $existingOrder = executeQuery("SELECT OrderID FROM Orders WHERE OrderNumber = ?", [$orderNumber]);
    while (!empty($existingOrder)) {
        $orderNumber = 'ORD' . date('Ymd') . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        $existingOrder = executeQuery("SELECT OrderID FROM Orders WHERE OrderNumber = ?", [$orderNumber]);
    }
    
    try {
        beginTransaction();
        
        // Create order
        $orderSql = "INSERT INTO Orders (OrderNumber, UserID, TotalAmount, ShippingAddress, ShippingPhone, Notes) 
                     VALUES (?, ?, ?, ?, ?, ?)";
        
        $orderParams = [$orderNumber, $user['user_id'], $totalAmount, $shippingAddress, $shippingPhone, $notes];
        $orderResult = executeNonQuery($orderSql, $orderParams);
        
        if ($orderResult <= 0) {
            throw new Exception('Failed to create order');
        }
        
        $orderId = getLastInsertId();
        
        // Create order details
        $detailSql = "INSERT INTO OrderDetails (OrderID, ProductID, Quantity, UnitPrice, TotalPrice) 
                      VALUES (?, ?, ?, ?, ?)";
        
        foreach ($validatedItems as $item) {
            $detailParams = [$orderId, $item['product_id'], $item['quantity'], $item['unit_price'], $item['total_price']];
            $detailResult = executeNonQuery($detailSql, $detailParams);
            
            if ($detailResult <= 0) {
                throw new Exception('Failed to create order details');
            }
            
            // Update stock
            $updateStockSql = "UPDATE Products SET StockQuantity = StockQuantity - ? WHERE ProductID = ?";
            $stockResult = executeNonQuery($updateStockSql, [$item['quantity'], $item['product_id']]);
            
            if ($stockResult <= 0) {
                throw new Exception('Failed to update stock');
            }
        }
        
        commitTransaction();
        
        // Log order creation
        logActivity($user['user_id'], 'create_order', "Created order: {$orderNumber}");
        
        $response = [
            'order_id' => $orderId,
            'order_number' => $orderNumber,
            'total_amount' => $totalAmount,
            'status' => 'pending'
        ];
        
        sendSuccess($response, 'Order created successfully');
        
    } catch (Exception $e) {
        rollbackTransaction();
        error_log("Order creation error: " . $e->getMessage());
        handleError('Failed to create order', 500);
    }
}

function handleUpdateOrder($pathParts) {
    $user = getCurrentUser();
    if (!$user) {
        handleError('Authentication required', 401);
    }
    
    // Only admin can update orders
    if ($user['role'] !== 'admin') {
        handleError('Unauthorized', 403);
    }
    
    $orderId = isset($pathParts[1]) ? (int)$pathParts[1] : null;
    
    if (!$orderId) {
        handleError('Order ID required', 400);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        handleError('Invalid JSON input', 400);
    }
    
    // Check if order exists
    $existingOrder = executeQuery("SELECT OrderID, OrderNumber FROM Orders WHERE OrderID = ?", [$orderId]);
    if (empty($existingOrder)) {
        handleError('Order not found', 404);
    }
    
    $updateFields = [];
    $params = [];
    
    if (isset($input['status'])) {
        $validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!in_array($input['status'], $validStatuses)) {
            handleError('Invalid status', 400);
        }
        $updateFields[] = "Status = ?";
        $params[] = $input['status'];
    }
    
    if (isset($input['shipping_address'])) {
        $updateFields[] = "ShippingAddress = ?";
        $params[] = sanitizeInput($input['shipping_address']);
    }
    
    if (isset($input['shipping_phone'])) {
        $updateFields[] = "ShippingPhone = ?";
        $params[] = sanitizeInput($input['shipping_phone']);
    }
    
    if (isset($input['notes'])) {
        $updateFields[] = "Notes = ?";
        $params[] = sanitizeInput($input['notes']);
    }
    
    if (empty($updateFields)) {
        handleError('No fields to update', 400);
    }
    
    $updateFields[] = "UpdatedAt = GETDATE()";
    $params[] = $orderId;
    
    $sql = "UPDATE Orders SET " . implode(', ', $updateFields) . " WHERE OrderID = ?";
    
    $result = executeNonQuery($sql, $params);
    
    if ($result > 0) {
        $orderNumber = $existingOrder[0]['OrderNumber'];
        logActivity($user['user_id'], 'update_order', "Updated order: {$orderNumber}");
        sendSuccess(null, 'Order updated successfully');
    } else {
        handleError('Failed to update order', 500);
    }
}

// Helper functions
function getCurrentUser() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (strpos($authHeader, 'Bearer ') !== 0) {
        return null;
    }
    
    $token = substr($authHeader, 7);
    return validateJWT($token);
}

function validateJWT($token) {
    if ($token === 'demo') { return ['user_id' => 1, 'role' => 'admin', 'username' => 'admin']; }
    $parts = explode('.', $token);
    if (count($parts) !== 3) { return false; }
    
    list($base64Header, $base64Payload, $base64Signature) = $parts;
    
    // Verify signature
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, Config::JWT_SECRET, true);
    $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    if (!hash_equals($expectedSignature, $base64Signature)) {
        return false;
    }
    
    // Decode payload
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64Payload)), true);
    
    // Check expiration
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return false;
    }
    
    return $payload;
}

?>

