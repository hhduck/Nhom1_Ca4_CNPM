<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

/**
 * Orders API - PHIÊN BẢN ĐƠN GIẢN HÓA
 * LA CUISINE NGỌT
 * *** ĐÃ SỬA LỖI HTTP 400 KHI CẬP NHẬT TRẠNG THÁI 'pending' ***
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/auth/middleware.php';

// Bật CORS
enableCORS();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// XỬ LÝ ROUTING
$orderId = null;

// Lấy từ URL path
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));
$apiIndex = array_search('api', $pathParts);

if ($apiIndex !== false && isset($pathParts[$apiIndex + 2]) && is_numeric($pathParts[$apiIndex + 2])) {
    $orderId = (int)$pathParts[$apiIndex + 2];
}

// Fallback: Lấy từ query string
if (!$orderId && isset($_GET['id']) && is_numeric($_GET['id'])) {
    $orderId = (int)$_GET['id'];
}

try {
    switch ($method) {
        case 'GET':
            $currentUser = requireStaff();
            if ($orderId) {
                getOrderById($db, $orderId);
            } else {
                getAllOrders($db);
            }
            break;

        case 'PUT':
            $currentUser = requireStaff();
            if ($orderId) {
                updateOrderData($db, $orderId, $currentUser['id']);
            } else {
                throw new Exception("Thiếu ID đơn hàng cho PUT", 400);
            }
            break;

        case 'DELETE':
            $currentUser = requireAdmin();
            if ($orderId) {
                deleteOrder($db, $orderId);
            } else {
                throw new Exception("Thiếu ID đơn hàng để xóa", 400);
            }
            break;

        default:
            throw new Exception("Method không được hỗ trợ", 405);
    }
} catch (Exception $e) {
    error_log("Orders API Exception: " . $e->getMessage());
    $statusCode = ($e->getCode() >= 400 && $e->getCode() < 600) ? $e->getCode() : 500;
    sendJsonResponse(false, ['error_details' => $e->getMessage()], "Có lỗi xảy ra", $statusCode);
}

/**
 * Lấy tất cả đơn hàng
 */
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
        $query .= " AND (o.OrderCode LIKE :search1 OR o.CustomerName LIKE :search2 OR o.CustomerPhone LIKE :search3)";
        $params[':search1'] = "%" . $search . "%";
        $params[':search2'] = "%" . $search . "%";
        $params[':search3'] = "%" . $search . "%";
    }

    if ($status) {
        // *** SỬA LỖI: Thống nhất với Database Schema ***
        $validStatuses = ['pending', 'confirmed', 'preparing', 'shipping', 'completed', 'cancelled'];
        if (in_array($status, $validStatuses)) {
            $query .= " AND o.OrderStatus = :status";
            $params[':status'] = $status;
        }
    }

    $query .= " ORDER BY o.CreatedAt DESC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // *** THÊM 3 DÒNG NÀY VÀO ĐỂ CHỐNG CACHE TỪ SERVER ***
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
    // *** KẾT THÚC PHẦN THÊM ***

    sendJsonResponse(true, [
        "orders" => $orders,
        "total" => count($orders)
    ], "Lấy danh sách đơn hàng thành công");
}

/**
 * Lấy chi tiết một đơn hàng
 */
function getOrderById($db, $id)
{
    $queryOrder = "SELECT 
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
                     o.DeliveryDate as delivery_date,
                     o.DeliveryTime as delivery_time,
                     o.CreatedAt as created_at,
                     o.UpdatedAt as updated_at,
                     u.FullName as customer_full_name
                   FROM Orders o
                   LEFT JOIN Users u ON o.CustomerID = u.UserID
                   WHERE o.OrderID = :id";

    $stmtOrder = $db->prepare($queryOrder);
    $stmtOrder->bindParam(':id', $id, PDO::PARAM_INT);
    $stmtOrder->execute();
    $order = $stmtOrder->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        throw new Exception("Không tìm thấy đơn hàng", 404);
    }

    $queryItems = "SELECT 
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

    $stmtItems = $db->prepare($queryItems);
    $stmtItems->bindParam(':id', $id, PDO::PARAM_INT);
    $stmtItems->execute();
    $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

    $order['items'] = $items;

    sendJsonResponse(true, $order, "Lấy chi tiết đơn hàng thành công");
}

/**
 * Cập nhật trạng thái hoặc ghi chú
 */
function updateOrderData($db, $orderId, $staffUserId) {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data)) throw new Exception("Không có dữ liệu để cập nhật", 400);

    $oldStatusQuery = "SELECT OrderStatus FROM Orders WHERE OrderID = :id";
    $oldStmt = $db->prepare($oldStatusQuery);
    $oldStmt->bindParam(':id', $orderId, PDO::PARAM_INT);
    $oldStmt->execute();
    $oldStatusResult = $oldStmt->fetch(PDO::FETCH_ASSOC);
    if (!$oldStatusResult) throw new Exception("Không tìm thấy đơn hàng", 404);
    $oldStatus = $oldStatusResult['OrderStatus'];

    $fieldsToUpdate = [];
    $params = [':id' => $orderId];
    $isStatusUpdate = false;
    $newStatus = null;

    if (isset($data['order_status'])) {
        $newStatus = sanitizeInput($data['order_status']);
        
        // *** SỬA LỖI: Thống nhất với Database Schema ***
        $validStatuses = ['pending', 'confirmed', 'preparing', 'shipping', 'completed', 'cancelled'];
        
        if (!in_array($newStatus, $validStatuses)) {
            throw new Exception("Trạng thái không hợp lệ: " . $newStatus, 400);
        }
        if ($newStatus !== $oldStatus) {
            $fieldsToUpdate[] = "OrderStatus = :status";
            $params[':status'] = $newStatus;
            $isStatusUpdate = true;
            
            if ($newStatus === 'completed') {
                $fieldsToUpdate[] = "CompletedAt = NOW()";
            }
            if ($newStatus === 'cancelled') {
                $fieldsToUpdate[] = "CancelledAt = NOW()";
            }
        }
    }

    if (isset($data['note'])) {
        $newNote = sanitizeInput($data['note']);
        $fieldsToUpdate[] = "Note = :note";
        $params[':note'] = $newNote;
        if ($isStatusUpdate && $newStatus === 'failed') {
            $fieldsToUpdate[] = "CancelReason = :cancel_reason";
            $params[':cancel_reason'] = $newNote;
        }
    }

    if (empty($fieldsToUpdate)) {
        sendJsonResponse(true, null, "Không có gì thay đổi");
        return;
    }

    $fieldsToUpdate[] = "UpdatedAt = NOW()";
    $query = "UPDATE Orders SET " . implode(", ", $fieldsToUpdate) . " WHERE OrderID = :id";

    $db->beginTransaction();

    try {
        $stmt = $db->prepare($query);
        $stmt->execute($params);

        if ($isStatusUpdate && $oldStatus !== $newStatus) {
            $historyQuery = "INSERT INTO OrderStatusHistory 
                            (OrderID, OldStatus, NewStatus, ChangedBy, Note, CreatedAt) 
                            VALUES 
                            (:order_id, :old_status, :new_status, :changed_by, :note, NOW())";
            $historyStmt = $db->prepare($historyQuery);
            $noteForHistory = $data['note'] ?? "Cập nhật trạng thái qua giao diện Staff";
            $historyStmt->bindParam(':order_id', $orderId, PDO::PARAM_INT);
            $historyStmt->bindParam(':old_status', $oldStatus);
            $historyStmt->bindParam(':new_status', $newStatus);
            $historyStmt->bindParam(':changed_by', $staffUserId, PDO::PARAM_INT);
            $historyStmt->bindParam(':note', $noteForHistory);
            $historyStmt->execute();
        }

        if ($isStatusUpdate && $newStatus === 'completed' && $oldStatus !== 'completed') {
            $updateSoldQuery = "UPDATE Products p
                                INNER JOIN OrderItems oi ON p.ProductID = oi.ProductID
                                SET p.SoldCount = p.SoldCount + oi.Quantity
                                WHERE oi.OrderID = :order_id";
            $updateStmt = $db->prepare($updateSoldQuery);
            $updateStmt->bindParam(':order_id', $orderId, PDO::PARAM_INT);
            $updateStmt->execute();
        }
        
        if ($isStatusUpdate && $newStatus === 'cancelled' && $oldStatus !== 'cancelled') {
            $restoreQuery = "UPDATE Products p
                            INNER JOIN OrderItems oi ON p.ProductID = oi.ProductID
                            SET p.Quantity = p.Quantity + oi.Quantity 
                            WHERE oi.OrderID = :order_id";
            $restoreStmt = $db->prepare($restoreQuery);
            $restoreStmt->bindParam(':order_id', $orderId, PDO::PARAM_INT);
            $restoreStmt->execute();
        }

        $db->commit();
        sendJsonResponse(true, null, "Cập nhật thành công");

    } catch (Exception $e) {
        $db->rollBack();
        throw new Exception("Lỗi khi cập nhật đơn hàng: " . $e->getMessage(), 500);
    }
}

/**
 * Xóa đơn hàng
 */
function deleteOrder($db, $orderId)
{
    $db->beginTransaction();
    try {
        $stmtItems = $db->prepare("DELETE FROM OrderItems WHERE OrderID = :id");
        $stmtItems->bindParam(':id', $orderId, PDO::PARAM_INT);
        $stmtItems->execute();

        $stmtHistory = $db->prepare("DELETE FROM OrderStatusHistory WHERE OrderID = :id");
        $stmtHistory->bindParam(':id', $orderId, PDO::PARAM_INT);
        $stmtHistory->execute();
        
        $stmtPromo = $db->prepare("DELETE FROM PromotionUsage WHERE OrderID = :id");
        $stmtPromo->bindParam(':id', $orderId, PDO::PARAM_INT);
        $stmtPromo->execute();

        $stmtOrder = $db->prepare("DELETE FROM Orders WHERE OrderID = :id");
        $stmtOrder->bindParam(':id', $orderId, PDO::PARAM_INT);
        $stmtOrder->execute();

        if ($stmtOrder->rowCount() === 0) {
             throw new Exception("Không tìm thấy đơn hàng để xóa", 404);
        }

        $db->commit();
        sendJsonResponse(true, null, "Xóa đơn hàng thành công");

    } catch (Exception $e) {
        $db->rollBack();
        throw new Exception("Lỗi khi xóa đơn hàng: " . $e->getMessage(), 500); 
    }
}

?>