<?php
/**
 * Orders API
 * LA CUISINE NGỌT
 * FILE: api/orders.php
 */

require_once __DIR__ . '/config/database.php';

enableCORS();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

try {
    switch($method) {
        case 'GET':
            if (isset($pathParts[2]) && is_numeric($pathParts[2])) {
                getOrderById($db, $pathParts[2]);
            } else {
                getAllOrders($db);
            }
            break;
            
        case 'PUT':
            checkAdminPermission();
            if (isset($pathParts[2]) && $pathParts[3] === 'status') {
                updateOrderStatus($db, $pathParts[2]);
            }
            break;
            
        default:
            sendJsonResponse(false, null, "Method không được hỗ trợ", 405);
    }
} catch(Exception $e) {
    error_log("Orders API Error: " . $e->getMessage());
    sendJsonResponse(false, null, "Có lỗi xảy ra", 500);
}

function getAllOrders($db) {
    $search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : null;
    $status = isset($_GET['status']) ? sanitizeInput($_GET['status']) : null;
    
    $query = "SELECT 
                o.OrderID as order_id,
                o.OrderCode as order_code,
                o.CustomerID as customer_id,
                o.CustomerName as customer_name,
                o.CustomerPhone as customer_phone,
                o.CustomerEmail as customer_email,
                o.ShippingAddress as shipping_address,
                o.Ward as ward,
                o.District as district,
                o.City as city,
                o.TotalAmount as total_amount,
                o.DiscountAmount as discount_amount,
                o.ShippingFee as shipping_fee,
                o.FinalAmount as final_amount,
                o.PaymentMethod as payment_method,
                o.PaymentStatus as payment_status,
                o.OrderStatus as order_status,
                o.Note as note,
                o.CreatedAt as created_at,
                o.UpdatedAt as updated_at,
                u.FullName as customer_full_name
              FROM Orders o
              LEFT JOIN Users u ON o.CustomerID = u.UserID
              WHERE 1=1";
    
    $params = [];
    
    if ($search) {
        $query .= " AND (o.OrderCode LIKE :search OR o.CustomerName LIKE :search OR o.CustomerPhone LIKE :search)";
        $params[':search'] = "%$search%";
    }
    
    if ($status) {
        $statusMap = [
            'preparing' => 'preparing',
            'shipping' => 'shipping',
            'completed' => 'completed'
        ];
        
        if (isset($statusMap[$status])) {
            $query .= " AND o.OrderStatus = :status";
            $params[':status'] = $statusMap[$status];
        }
    }
    
    $query .= " ORDER BY o.CreatedAt DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    
    $orders = $stmt->fetchAll();
    
    sendJsonResponse(true, [
        "orders" => $orders,
        "total" => count($orders)
    ], "Lấy danh sách đơn hàng thành công");
}

function getOrderById($db, $id) {
    $query = "SELECT 
                o.*,
                u.FullName as customer_full_name
              FROM Orders o
              LEFT JOIN Users u ON o.CustomerID = u.UserID
              WHERE o.OrderID = :id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    
    $order = $stmt->fetch();
    
    if (!$order) {
        sendJsonResponse(false, null, "Không tìm thấy đơn hàng", 404);
    }
    
    $query = "SELECT 
                oi.OrderItemID as order_item_id,
                oi.ProductID as product_id,
                oi.ProductName as product_name,
                oi.ProductPrice as product_price,
                oi.Quantity as quantity,
                oi.Subtotal as subtotal,
                oi.Note as note,
                p.ImageURL as image_url
              FROM OrderItems oi
              LEFT JOIN Products p ON oi.ProductID = p.ProductID
              WHERE oi.OrderID = :id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    
    $items = $stmt->fetchAll();
    
    $order['items'] = $items;
    
    sendJsonResponse(true, $order, "Lấy chi tiết đơn hàng thành công");
}

function updateOrderStatus($db, $orderId) {
    $adminId = checkAdminPermission();
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (empty($data['status'])) {
        sendJsonResponse(false, null, "Thiếu thông tin trạng thái", 400);
    }
    
    $query = "SELECT OrderStatus FROM Orders WHERE OrderID = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $orderId);
    $stmt->execute();
    $oldStatus = $stmt->fetchColumn();
    
    if (!$oldStatus) {
        sendJsonResponse(false, null, "Không tìm thấy đơn hàng", 404);
    }
    
    $query = "UPDATE Orders SET 
              OrderStatus = :status,
              UpdatedAt = NOW(),
              ConfirmedAt = CASE WHEN :status = 'confirmed' THEN NOW() ELSE ConfirmedAt END,
              CompletedAt = CASE WHEN :status = 'completed' THEN NOW() ELSE CompletedAt END,
              CancelledAt = CASE WHEN :status = 'cancelled' THEN NOW() ELSE CancelledAt END
              WHERE OrderID = :id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $orderId);
    $stmt->bindParam(':status', $data['status']);
    
    if ($stmt->execute()) {
        $historyQuery = "INSERT INTO OrderStatusHistory 
                        (OrderID, OldStatus, NewStatus, ChangedBy, Note) 
                        VALUES 
                        (:order_id, :old_status, :new_status, :changed_by, :note)";
        
        $historyStmt = $db->prepare($historyQuery);
        $historyStmt->bindParam(':order_id', $orderId);
        $historyStmt->bindParam(':old_status', $oldStatus);
        $historyStmt->bindParam(':new_status', $data['status']);
        $historyStmt->bindParam(':changed_by', $adminId);
        $historyStmt->bindParam(':note', $data['note'] ?? '');
        $historyStmt->execute();
        
        if ($data['status'] === 'completed') {
            $updateSoldQuery = "UPDATE Products p
                               INNER JOIN OrderItems oi ON p.ProductID = oi.ProductID
                               SET p.SoldCount = p.SoldCount + oi.Quantity
                               WHERE oi.OrderID = :order_id";
            
            $updateStmt = $db->prepare($updateSoldQuery);
            $updateStmt->bindParam(':order_id', $orderId);
            $updateStmt->execute();
        }
        
        sendJsonResponse(true, null, "Cập nhật trạng thái đơn hàng thành công");
    } else {
        sendJsonResponse(false, null, "Không thể cập nhật trạng thái", 500);
    }
}