<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
/**
 * Orders API (PHIÊN BẢN GỘP CUỐI CÙNG - ĐÃ SỬA LỖI ROUTING)
 * LA CUISINE NGỌT
 * FILE: api/orders.php
 */

require_once __DIR__ . '/config/database.php';

// Giả sử các hàm này tồn tại trong config/database.php hoặc file-helpers.php
// enableCORS();
// sendJsonResponse($success, $data, $message, $statusCode);
// sanitizeInput($data);
// checkAdminPermission();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// ================================================
// ===== BẮT ĐẦU SỬA LỖI ĐIỀU HƯỚNG (ROUTING) =====
// ================================================

try {
    // Tìm vị trí của 'api' trong mảng đường dẫn
    $apiIndex = array_search('api', $pathParts);

    if ($apiIndex === false) {
        sendJsonResponse(false, null, "Endpoint không hợp lệ (Không tìm thấy 'api')", 404);
        exit;
    }

    // Phần tử tiếp theo (sau 'api') phải là 'orders' hoặc 'orders.php'
    $ordersIndex = $apiIndex + 1;

    if (!isset($pathParts[$ordersIndex]) || ($pathParts[$ordersIndex] !== 'orders' && $pathParts[$ordersIndex] !== 'orders.php')) {
        sendJsonResponse(false, null, "Endpoint không hợp lệ (Endpoint phải là 'orders')", 404);
        exit;
    }

    // Lấy ID (nếu có) là phần tử SAU 'orders'
    $orderId = isset($pathParts[$ordersIndex + 1]) && is_numeric($pathParts[$ordersIndex + 1]) ? (int)$pathParts[$ordersIndex + 1] : null;

    switch ($method) {
        case 'GET':
            if ($orderId) {
                // GET /.../api/orders.php/{id}
                getOrderById($db, $orderId);
            } else {
                // GET /.../api/orders.php
                getAllOrders($db);
            }
            break;

        case 'PUT':
            checkAdminPermission();
            if ($orderId) {
                // Lấy hành động (nếu có) là phần tử SAU ID
                $action = isset($pathParts[$ordersIndex + 2]) ? $pathParts[$ordersIndex + 2] : null;

                if ($action === 'status') {
                    // PUT /.../api/orders.php/{id}/status
                    updateOrderStatus($db, $orderId);
                } else if ($action === null) {
                    // PUT /.../api/orders.php/{id}
                    updateOrderDetails($db, $orderId);
                } else {
                    sendJsonResponse(false, null, "Hành động PUT không được hỗ trợ", 404);
                }
            } else {
                sendJsonResponse(false, null, "Thiếu ID đơn hàng cho hành động PUT", 400);
            }
            break;

        case 'DELETE':
            checkAdminPermission(); // Đảm bảo chỉ admin được xóa
            if ($orderId) {
                // DELETE /.../api/orders.php/{id}
                deleteOrder($db, $orderId);
            } else {
                sendJsonResponse(false, null, "Thiếu ID đơn hàng để xóa", 400);
            }
            break;

        default:
            sendJsonResponse(false, null, "Method không được hỗ trợ", 405);
    }
} catch (Exception $e) {
    error_log("Orders API Error: " . $e->getMessage());
    sendJsonResponse(false, null, "Có lỗi xảy ra: " . $e->getMessage(), 500);
}

// ================================================
// ===== KẾT THÚC SỬA LỖI ĐIỀU HƯỚNG (ROUTING) =====
// ================================================


// CÁC HÀM BÊN DƯỚI ĐƯỢC GIỮ NGUYÊN

function getAllOrders($db)
{
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
                o.CancelReason as cancel_reason,
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
            'pending' => 'pending',
            'confirmed' => 'confirmed',
            'preparing' => 'preparing',
            'shipping' => 'shipping',
            'completed' => 'completed',
            'cancelled' => 'cancelled',
            'failed' => 'failed'
        ];

        if (isset($statusMap[$status])) {
            $query .= " AND o.OrderStatus = :status";
            $params[':status'] = $statusMap[$status];
        }
    }

    $query .= " ORDER BY o.CreatedAt DESC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);

    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    sendJsonResponse(true, [
        "orders" => $orders,
        "total" => count($orders)
    ], "Lấy danh sách đơn hàng thành công");
}

function getOrderById($db, $id)
{
    $query = "SELECT 
                o.*,
                u.FullName as customer_full_name
              FROM Orders o
              LEFT JOIN Users u ON o.CustomerID = u.UserID
              WHERE o.OrderID = :id";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();

    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        sendJsonResponse(false, null, "Không tìm thấy đơn hàng", 404);
        return; // Thêm return để dừng hàm
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

    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $order['items'] = $items;

    sendJsonResponse(true, $order, "Lấy chi tiết đơn hàng thành công");
}

function updateOrderStatus($db, $orderId)
{
    $adminId = checkAdminPermission();
    $data = json_decode(file_get_contents("php://input"), true);

    $newStatus = $data['status'] ?? null;
    $note = $data['note'] ?? ($data['reason'] ?? ''); // Lấy 'reason' từ file order.php

    if (empty($newStatus)) {
        sendJsonResponse(false, null, "Thiếu thông tin trạng thái", 400);
        return; // Thêm return
    }

    if ($newStatus === 'failed') {
        $newStatus = 'cancelled';
    }

    $query = "SELECT OrderStatus FROM Orders WHERE OrderID = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $orderId);
    $stmt->execute();
    $oldStatus = $stmt->fetchColumn();

    if ($oldStatus === false) {
        sendJsonResponse(false, null, "Không tìm thấy đơn hàng", 404);
        return;
    }

    $query = "UPDATE Orders SET 
              OrderStatus = :status,
              UpdatedAt = NOW(),
              ConfirmedAt = CASE WHEN :status = 'confirmed' THEN NOW() ELSE ConfirmedAt END,
              CompletedAt = CASE WHEN :status = 'completed' THEN NOW() ELSE CompletedAt END,
              CancelledAt = CASE WHEN :status = 'cancelled' THEN NOW() ELSE CancelledAt END,
              CancelReason = CASE WHEN :status = 'cancelled' THEN :note ELSE CancelReason END
              WHERE OrderID = :id";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $orderId);
    $stmt->bindParam(':status', $newStatus);
    $stmt->bindParam(':note', $note);

    if ($stmt->execute()) {
        $historyQuery = "INSERT INTO OrderStatusHistory 
                        (OrderID, OldStatus, NewStatus, ChangedBy, Note) 
                        VALUES 
                        (:order_id, :old_status, :new_status, :changed_by, :note)";

        $historyStmt = $db->prepare($historyQuery);
        $historyStmt->bindParam(':order_id', $orderId);
        $historyStmt->bindParam(':old_status', $oldStatus);
        $historyStmt->bindParam(':new_status', $newStatus);
        $historyStmt->bindParam(':changed_by', $adminId);
        $historyStmt->bindParam(':note', $note);
        $historyStmt->execute();

        if ($newStatus === 'completed') {
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

function updateOrderDetails($db, $orderId)
{
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data)) {
        sendJsonResponse(false, null, "Không có dữ liệu cập nhật", 400);
        return;
    }

    $fields = [];
    $params = [':id' => $orderId];

    $fieldMap = [
        'customerName' => 'CustomerName',
        'phone' => 'CustomerPhone',
        'address' => 'ShippingAddress',
        'total' => 'FinalAmount',
        'paymentMethod' => 'PaymentMethod'
    ];

    foreach ($fieldMap as $jsonKey => $dbColumn) {
        if (isset($data[$jsonKey])) {
            $fields[] = "$dbColumn = :$jsonKey";
            $params[":$jsonKey"] = $data[$jsonKey];
        }
    }

    if (empty($fields)) {
        sendJsonResponse(false, null, "Không có trường nào hợp lệ để cập nhật", 400);
        return;
    }

    $fields[] = "UpdatedAt = NOW()";

    $query = "UPDATE Orders SET " . implode(", ", $fields) . " WHERE OrderID = :id";

    try {
        $stmt = $db->prepare($query);

        if ($stmt->execute($params)) {
            if ($stmt->rowCount() > 0) {
                sendJsonResponse(true, null, "Cập nhật thông tin đơn hàng thành công");
            } else {
                sendJsonResponse(false, null, "Không tìm thấy đơn hàng hoặc không có gì thay đổi", 404);
            }
        } else {
            sendJsonResponse(false, null, "Không thể cập nhật đơn hàng", 500);
        }
    } catch (Exception $e) {
        error_log("updateOrderDetails Error: " . $e->getMessage());
        sendJsonResponse(false, null, "Lỗi khi cập nhật đơn hàng", 500);
    }
}

/**
 * HÀM MỚI (ĐỂ XÓA)
 * Xóa một đơn hàng (chỉ dành cho Admin)
 * Endpoint: DELETE /api/orders/{id}
 */
function deleteOrder($db, $orderId)
{

    $db->beginTransaction();

    try {
        // 1. Kiểm tra xem đơn hàng có tồn tại không
        $checkStmt = $db->prepare("SELECT OrderID FROM Orders WHERE OrderID = :id");
        $checkStmt->bindParam(':id', $orderId);
        $checkStmt->execute();
        if ($checkStmt->rowCount() === 0) {
            sendJsonResponse(false, null, "Không tìm thấy đơn hàng để xóa", 404);
            $db->rollBack();
            return;
        }

        // 2. Xóa các mục trong OrderItems (chi tiết sản phẩm của đơn hàng)
        $stmtItems = $db->prepare("DELETE FROM OrderItems WHERE OrderID = :id");
        $stmtItems->bindParam(':id', $orderId);
        $stmtItems->execute();

        // 3. Xóa lịch sử trạng thái của đơn hàng
        $stmtHistory = $db->prepare("DELETE FROM OrderStatusHistory WHERE OrderID = :id");
        $stmtHistory->bindParam(':id', $orderId);
        $stmtHistory->execute();

        // 4. Xóa chính đơn hàng đó
        $stmtOrder = $db->prepare("DELETE FROM Orders WHERE OrderID = :id");
        $stmtOrder->bindParam(':id', $orderId);
        $stmtOrder->execute();

        $db->commit();

        sendJsonResponse(true, null, "Xóa đơn hàng thành công");
    } catch (Exception $e) {
        $db->rollBack();
        error_log("deleteOrder Error: " . $e->getMessage());
        sendJsonResponse(false, null, "Lỗi khi xóa đơn hàng", 500);
    }
}
?>
