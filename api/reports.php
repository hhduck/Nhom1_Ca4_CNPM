<?php
/**
 * Reports API
 * LA CUISINE NGỌT
 * FILE: api/reports.php
 */

require_once __DIR__ . '/config/database.php';

enableCORS();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        checkAdminPermission();
        getReports($db);
    } else {
        sendJsonResponse(false, null, "Method không được hỗ trợ", 405);
    }
} catch(Exception $e) {
    error_log("Reports API Error: " . $e->getMessage());
    sendJsonResponse(false, null, "Có lỗi xảy ra", 500);
}

function getReports($db) {
    $period = isset($_GET['period']) ? sanitizeInput($_GET['period']) : 'month';
    
    if ($period === 'month') {
        $startDate = date('Y-m-d', strtotime('-1 month'));
    } else {
        $startDate = date('Y-m-d', strtotime('-1 year'));
    }
    
    $statsQuery = "SELECT 
                    COALESCE(SUM(CASE WHEN OrderStatus = 'completed' THEN FinalAmount ELSE 0 END), 0) as revenue,
                    COUNT(*) as total_orders,
                    SUM(CASE WHEN OrderStatus = 'completed' THEN 1 ELSE 0 END) as delivered_orders,
                    (SELECT COUNT(*) FROM Users WHERE Role = 'customer' AND CreatedAt >= :start_date) as new_customers
                   FROM Orders
                   WHERE CreatedAt >= :start_date";
    
    $stmt = $db->prepare($statsQuery);
    $stmt->bindParam(':start_date', $startDate);
    $stmt->execute();
    $stats = $stmt->fetch();
    
    $topProductsQuery = "SELECT 
                          p.ProductName as product_name,
                          SUM(oi.Quantity) as quantity_sold,
                          SUM(oi.Subtotal) as revenue
                         FROM OrderItems oi
                         INNER JOIN Products p ON oi.ProductID = p.ProductID
                         INNER JOIN Orders o ON oi.OrderID = o.OrderID
                         WHERE o.OrderStatus = 'completed' AND o.CreatedAt >= :start_date
                         GROUP BY p.ProductID, p.ProductName
                         ORDER BY revenue DESC
                         LIMIT 10";
    
    $stmt = $db->prepare($topProductsQuery);
    $stmt->bindParam(':start_date', $startDate);
    $stmt->execute();
    $topProducts = $stmt->fetchAll();
    
    if ($period === 'month') {
        $revenueChartQuery = "SELECT 
                               DATE_FORMAT(CreatedAt, '%m') as period,
                               DATE_FORMAT(CreatedAt, '%Y-%m') as full_period,
                               SUM(CASE WHEN OrderStatus = 'completed' THEN FinalAmount ELSE 0 END) as revenue
                              FROM Orders
                              WHERE CreatedAt >= DATE_SUB(NOW(), INTERVAL 10 MONTH)
                              GROUP BY DATE_FORMAT(CreatedAt, '%Y-%m'), DATE_FORMAT(CreatedAt, '%m')
                              ORDER BY DATE_FORMAT(CreatedAt, '%Y-%m')";
    } else {
        $revenueChartQuery = "SELECT 
                               YEAR(CreatedAt) as period,
                               SUM(CASE WHEN OrderStatus = 'completed' THEN FinalAmount ELSE 0 END) as revenue
                              FROM Orders
                              WHERE CreatedAt >= DATE_SUB(NOW(), INTERVAL 5 YEAR)
                              GROUP BY YEAR(CreatedAt)
                              ORDER BY YEAR(CreatedAt)";
    }
    
    $stmt = $db->prepare($revenueChartQuery);
    $stmt->execute();
    $revenueChart = $stmt->fetchAll();
    
    $productChartQuery = "SELECT 
                           p.ProductName as product_name,
                           COUNT(oi.OrderItemID) as quantity
                          FROM OrderItems oi
                          INNER JOIN Products p ON oi.ProductID = p.ProductID
                          INNER JOIN Orders o ON oi.OrderID = o.OrderID
                          WHERE o.OrderStatus = 'completed'
                          GROUP BY p.ProductID, p.ProductName
                          ORDER BY quantity DESC
                          LIMIT 5";
    
    $stmt = $db->prepare($productChartQuery);
    $stmt->execute();
    $productChart = $stmt->fetchAll();
    
    $chartData = [
        'revenue' => [
            'labels' => array_column($revenueChart, 'period'),
            'data' => array_column($revenueChart, 'revenue')
        ],
        'products' => [
            'labels' => array_column($productChart, 'product_name'),
            'data' => array_column($productChart, 'quantity')
        ]
    ];
    
    sendJsonResponse(true, [
        'revenue' => $stats['revenue'],
        'total_orders' => $stats['total_orders'],
        'delivered_orders' => $stats['delivered_orders'],
        'new_customers' => $stats['new_customers'],
        'top_products' => $topProducts,
        'chart_data' => $chartData
    ], "Lấy báo cáo thành công");
}
?>