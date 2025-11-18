<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

/**
 * Orders API - PHIÊN BẢN HỖ TRỢ THANH TOÁN GIẢ
 * LA CUISINE NGỌT
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/auth/middleware.php';

enableCORS();
header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true");

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

$orderId = null;
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));
$apiIndex = array_search('api', $pathParts);

if ($apiIndex !== false && isset($pathParts[$apiIndex + 2]) && is_numeric($pathParts[$apiIndex + 2])) {
    $orderId = (int)$pathParts[$apiIndex + 2];
}

if (!$orderId && isset($_GET['id']) && is_numeric($_GET['id'])) {
    $orderId = (int)$_GET['id'];
}

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['check_first_order']) && $_GET['check_first_order'] == '1') {
                $currentUser = requireAuth();
                $isFirst = checkFirstOrderOfTheYear($db, $currentUser['id']);
                sendJsonResponse(true, ['isFirstOrder' => $isFirst], "Kiểm tra đơn hàng đầu tiên thành công");
                exit();
            }

            $requestedUserId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;

            if ($requestedUserId) {
                $currentUser = requireAuth();
                if ($currentUser['role'] !== 'admin' && $currentUser['role'] !== 'staff' && $currentUser['id'] != $requestedUserId) {
                    sendJsonResponse(false, null, "Bạn không có quyền truy cập đơn hàng của người dùng khác", 403);
                    exit();
                }
                getAllOrders($db, $requestedUserId);
            } elseif ($orderId) {
                $currentUser = requireStaff();
                getOrderById($db, $orderId);
            } else {
                $currentUser = requireStaff();
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

        case 'POST':
            createOrder($db);
            break;

        default:
            throw new Exception("Method không được hỗ trợ", 405);
    }
} catch (Exception $e) {
    error_log("Orders API Exception: " . $e->getMessage());
    $statusCode = ($e->getCode() >= 400 && $e->getCode() < 600) ? $e->getCode() : 500;
    sendJsonResponse(false, ['error_details' => $e->getMessage()], "Có lỗi xảy ra", $statusCode);
}

function getAllOrders($db, $customerId = null)
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
                o.Ward as ward,  o.District as district,
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
                u.FullName as customer_full_name,
                c.ComplaintID as complaint_id,
                c.Status as complaint_status,
                c.Title as complaint_title,
                c.Content as complaint_content,
                c.Resolution as complaint_resolution 
              FROM Orders o
              LEFT JOIN Users u ON o.CustomerID = u.UserID
              LEFT JOIN Complaints c ON o.OrderID = c.OrderID
              WHERE 1=1";

    $params = [];

    if ($customerId) {
        $query .= " AND o.CustomerID = :customer_id";
        $params[':customer_id'] = $customerId;
    }

    if ($search) {
        $query .= " AND (o.OrderCode LIKE :search1 OR o.CustomerName LIKE :search2 OR o.CustomerPhone LIKE :search3)";
        $params[':search1'] = "%" . $search . "%";
        $params[':search2'] = "%" . $search . "%";
        $params[':search3'] = "%" . $search . "%";
    }

    if ($status) {
        $validStatuses = ['pending', 'order_received', 'preparing', 'delivering', 'delivery_successful', 'delivery_failed'];
        if (in_array($status, $validStatuses)) {
            $query .= " AND o.OrderStatus = :status";
            $params[':status'] = $status;
        }
    }

    $query .= " ORDER BY o.CreatedAt DESC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($orders as &$order) {
        $itemsQuery = "SELECT 
                         oi.OrderItemID as order_item_id,
                         oi.ProductID as product_id,
                         oi.ProductName as product_name,
                         oi.ProductPrice as product_price,
                         oi.Quantity as quantity,
                         oi.Subtotal as subtotal,
                         oi.Note as item_note,
                         p.ImageURL as image_url 
                       FROM OrderItems oi
                       LEFT JOIN Products p ON oi.ProductID = p.ProductID
                       WHERE oi.OrderID = :order_id";

        $itemsStmt = $db->prepare($itemsQuery);
        $itemsStmt->bindParam(':order_id', $order['order_id'], PDO::PARAM_INT);
        $itemsStmt->execute();
        $order['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
    }
    unset($order);

    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    sendJsonResponse(true, [
        "orders" => $orders,
        "total" => count($orders)
    ], "Lấy danh sách đơn hàng thành công");
}

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
                     oi.Note as item_note,
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

function updateOrderData($db, $orderId, $staffUserId)
{
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
        $validStatuses = ['pending', 'order_received', 'preparing', 'delivering', 'delivery_successful', 'delivery_failed'];

        if (!in_array($newStatus, $validStatuses)) {
            throw new Exception("Trạng thái không hợp lệ: " . $newStatus, 400);
        }
        if ($newStatus !== $oldStatus) {
            $fieldsToUpdate[] = "OrderStatus = :status";
            $params[':status'] = $newStatus;
            $isStatusUpdate = true;

            if ($newStatus === 'delivery_successful') {
                $fieldsToUpdate[] = "CompletedAt = NOW()";
            }
            if ($newStatus === 'delivery_failed') {
                $fieldsToUpdate[] = "CancelledAt = NOW()";
            }
        }
    }

    if (isset($data['note'])) {
        $newNote = sanitizeInput($data['note']);
        $fieldsToUpdate[] = "Note = :note";
        $params[':note'] = $newNote;
        if ($isStatusUpdate && $newStatus === 'delivery_failed') {
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

        if ($isStatusUpdate && $newStatus === 'delivery_successful' && $oldStatus !== 'delivery_successful') {
            $updateSoldQuery = "UPDATE Products p
                                INNER JOIN OrderItems oi ON p.ProductID = oi.ProductID
                                SET p.SoldCount = p.SoldCount + oi.Quantity
                                WHERE oi.OrderID = :order_id";
            $updateStmt = $db->prepare($updateSoldQuery);
            $updateStmt->bindParam(':order_id', $orderId, PDO::PARAM_INT);
            $updateStmt->execute();
        }

        if ($isStatusUpdate && $newStatus === 'delivery_failed' && $oldStatus !== 'delivery_failed') {
            $restoreQuery = "UPDATE Products p
                            INNER JOIN OrderItems oi ON p.ProductID = oi.ProductID
                            SET p.Quantity = p.Quantity + oi.Quantity 
                            WHERE oi.OrderID = :order_id";
            $restoreStmt = $db->prepare($restoreQuery);
            $restoreStmt->bindParam(':order_id', $orderId, PDO::PARAM_INT);
            $restoreStmt->execute();
        }

        if (!empty($data['items']) && is_array($data['items'])) {
            $updateItemStmt = $db->prepare("
                UPDATE OrderItems 
                SET Note = :note 
                WHERE OrderItemID = :item_id AND OrderID = :order_id
            ");

            foreach ($data['items'] as $item) {
                if (isset($item['order_item_id']) && isset($item['note'])) {
                    $updateItemStmt->execute([
                        ':note' => sanitizeInput($item['note']),
                        ':item_id' => $item['order_item_id'],
                        ':order_id' => $orderId
                    ]);
                }
            }
        }

        $db->commit();
        sendJsonResponse(true, null, "Cập nhật thành công");
    } catch (Exception $e) {
        $db->rollBack();
        throw new Exception("Lỗi khi cập nhật đơn hàng: " . $e->getMessage(), 500);
    }
}

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

// *** HÀM TẠO ĐƠN HÀNG - ĐÃ CHỈNH SỬA HỖ TRỢ THANH TOÁN GIẢ ***
function createOrder($db)
{
    try {
        $currentUser = requireAuth();
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['items']) || !is_array($data['items']) || count($data['items']) === 0) {
            throw new Exception("Giỏ hàng trống", 400);
        }
        if (empty($data['final_amount'])) {
            throw new Exception("Thiếu tổng tiền", 400);
        }

        $uniquePart = uniqid(mt_rand(), true);
        $randomHash = strtoupper(substr(md5($uniquePart), 0, 8));
        $orderCode = 'ORD' . date('Ymd') . $randomHash;

        $db->beginTransaction();

        $orderNote = isset($data['order_note']) ? sanitizeInput($data['order_note']) : null;

        // *** XỬ LÝ THANH TOÁN GIẢ ***
        $paymentMethod = isset($data['payment_method']) ? sanitizeInput($data['payment_method']) : 'vnpay';
        $paymentStatus = isset($data['payment_status']) ? sanitizeInput($data['payment_status']) : 'pending';
        $orderStatus = isset($data['order_status']) ? sanitizeInput($data['order_status']) : 'pending';

        // Nếu là thanh toán giả, tự động cập nhật trạng thái
        if ($paymentMethod === 'fake') {
            $paymentStatus = 'completed';
            $orderStatus = 'order_received';
        }

        $insertOrder = "INSERT INTO Orders 
            (OrderCode, CustomerID, CustomerName, CustomerPhone, CustomerEmail, 
             ShippingAddress, Ward, District, City, 
             TotalAmount, DiscountAmount, ShippingFee, FinalAmount, 
             PaymentMethod, PaymentStatus, OrderStatus, 
             DeliveryTime, Note, CreatedAt) 
            VALUES 
            (:order_code, :customer_id, :customer_name, :customer_phone, :customer_email, 
             :shipping_address, :ward, :district, :city, 
             :total_amount, :discount_amount, :shipping_fee, :final_amount, 
             :payment_method, :payment_status, :order_status,  
             :delivery_time, :order_note, NOW())";

        $stmt = $db->prepare($insertOrder);
        $stmt->execute([
            ':order_code' => $orderCode,
            ':customer_id' => $currentUser['id'],
            ':customer_name' => sanitizeInput($data['customer_name']),
            ':customer_phone' => sanitizeInput($data['customer_phone']),
            ':customer_email' => sanitizeInput($data['customer_email']),
            ':shipping_address' => sanitizeInput($data['shipping_address']),
            ':ward' => sanitizeInput($data['ward'] ?? ''),
            ':district' => sanitizeInput($data['district'] ?? ''),
            ':city' => sanitizeInput($data['city']),
            ':total_amount' => $data['total_amount'],
            ':discount_amount' => $data['discount_amount'],
            ':shipping_fee' => $data['shipping_fee'],
            ':final_amount' => $data['final_amount'],
            ':payment_method' => $paymentMethod,
            ':payment_status' => $paymentStatus,
            ':order_status' => $orderStatus,
            ':delivery_time' => $data['delivery_time'],
            ':order_note' => $orderNote
        ]);

        $orderId = $db->lastInsertId();

        // Insert OrderItems
        $insertItem = "INSERT INTO OrderItems 
            (OrderID, ProductID, ProductName, ProductPrice, Quantity, Subtotal, Note) 
            VALUES 
            (:order_id, :product_id, :product_name, :product_price, :quantity, :subtotal, :note)";

        $stmtItem = $db->prepare($insertItem);

        foreach ($data['items'] as $item) {
            $subtotal = $item['price'] * $item['quantity'];
            $stmtItem->execute([
                ':order_id' => $orderId,
                ':product_id' => $item['product_id'],
                ':product_name' => sanitizeInput($item['product_name']),
                ':product_price' => $item['price'],
                ':quantity' => $item['quantity'],
                ':subtotal' => $subtotal,
                ':note' => sanitizeInput($item['note'] ?? '')
            ]);

            // *** TRỪKHO NGAY NẾU LÀ THANH TOÁN GIẢ ***
            if ($paymentMethod === 'fake') {
                $updateStock = "UPDATE Products SET Quantity = Quantity - :quantity WHERE ProductID = :product_id";
                $stockStmt = $db->prepare($updateStock);
                $stockStmt->execute([
                    ':quantity' => $item['quantity'],
                    ':product_id' => $item['product_id']
                ]);
            }
        }

        $db->commit();

        sendJsonResponse(true, [
            'order_id' => $orderId,
            'order_code' => $orderCode
        ], "Tạo đơn hàng thành công", 201);
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        error_log("Create Order Error: " . $e->getMessage());
        $statusCode = ($e->getCode() >= 400 && $e->getCode() < 600) ? $e->getCode() : 500;
        sendJsonResponse(false, null, $e->getMessage(), $statusCode);
    }
}

function checkFirstOrderOfTheYear($db, $userId)
{
    $currentYear = date('Y');

    $query = "SELECT COUNT(OrderID) as order_count 
              FROM Orders 
              WHERE CustomerID = :user_id 
                AND OrderStatus = 'delivery_successful'
                AND YEAR(CreatedAt) = :current_year";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    $stmt->bindParam(':current_year', $currentYear, PDO::PARAM_INT);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    error_log("CHECK FIRST ORDER - UserID: $userId, Year: $currentYear, Count: " . $result['order_count']);

    return $result['order_count'] == 0;
}
