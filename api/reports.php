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
    $month = isset($_GET['month']) ? (int)sanitizeInput($_GET['month']) : null;
    $year = isset($_GET['year']) ? (int)sanitizeInput($_GET['year']) : null;
    
    // Nếu có month và year, dùng để filter
    if ($month && $year) {
        $startDate = sprintf('%04d-%02d-01', $year, $month);
        $endDate = date('Y-m-t', strtotime($startDate)); // Last day of month
    } else if ($period === 'month') {
        $startDate = date('Y-m-d', strtotime('-1 month'));
        $endDate = date('Y-m-d');
    } else {
        $startDate = date('Y-m-d', strtotime('-1 year'));
        $endDate = date('Y-m-d');
    }
    
    // Stats query: Tính tổng doanh thu, đơn hàng, v.v.
    // Nếu có month và year, chỉ tính trong tháng đó (từ startDate đến endDate)
    // Nếu không có month, tính từ startDate đến hiện tại
    if ($month && $year) {
        // Có tháng cụ thể: tính trong khoảng thời gian của tháng đó
        $statsQuery = "SELECT 
                        COALESCE(SUM(CASE WHEN OrderStatus = 'completed' THEN FinalAmount ELSE 0 END), 0) as revenue,
                        COUNT(*) as total_orders,
                        SUM(CASE WHEN OrderStatus = 'completed' THEN 1 ELSE 0 END) as delivered_orders,
                        (SELECT COUNT(*) FROM Users WHERE Role = 'customer' AND CreatedAt >= :start_date1 AND CreatedAt <= :end_date1) as new_customers
                       FROM Orders
                       WHERE CreatedAt >= :start_date2
                         AND CreatedAt <= :end_date2";
        $stmt = $db->prepare($statsQuery);
        $stmt->bindParam(':start_date1', $startDate);
        $stmt->bindParam(':end_date1', $endDate);
        $stmt->bindParam(':start_date2', $startDate);
        $stmt->bindParam(':end_date2', $endDate);
    } else {
        // Không có tháng cụ thể: tính từ startDate đến hiện tại
        $statsQuery = "SELECT 
                        COALESCE(SUM(CASE WHEN OrderStatus = 'completed' THEN FinalAmount ELSE 0 END), 0) as revenue,
                        COUNT(*) as total_orders,
                        SUM(CASE WHEN OrderStatus = 'completed' THEN 1 ELSE 0 END) as delivered_orders,
                        (SELECT COUNT(*) FROM Users WHERE Role = 'customer' AND CreatedAt >= :start_date1) as new_customers
                       FROM Orders
                       WHERE CreatedAt >= :start_date2";
        $stmt = $db->prepare($statsQuery);
        $stmt->bindParam(':start_date1', $startDate);
        $stmt->bindParam(':start_date2', $startDate);
    }
    
    $stmt->execute();
    $stats = $stmt->fetch();
    
    // Top products query: Tính sản phẩm bán chạy
    // Nếu có month và year, chỉ tính trong tháng đó
    if ($month && $year) {
        $topProductsQuery = "SELECT 
                              p.ProductName as product_name,
                              SUM(oi.Quantity) as quantity_sold,
                              SUM(oi.Subtotal) as revenue
                             FROM OrderItems oi
                             INNER JOIN Products p ON oi.ProductID = p.ProductID
                             INNER JOIN Orders o ON oi.OrderID = o.OrderID
                             WHERE o.OrderStatus = 'completed' 
                               AND o.CreatedAt >= :start_date
                               AND o.CreatedAt <= :end_date
                             GROUP BY p.ProductID, p.ProductName
                             ORDER BY revenue DESC
                             LIMIT 10";
        $stmt = $db->prepare($topProductsQuery);
        $stmt->bindParam(':start_date', $startDate);
        $stmt->bindParam(':end_date', $endDate);
    } else {
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
    }
    
    $stmt->execute();
    $topProducts = $stmt->fetchAll();
    
    // Biểu đồ cột: Doanh thu theo tháng của năm được chọn
    // Tính TỔNG doanh thu của TẤT CẢ các đơn hàng completed trong mỗi tháng
    if ($year) {
        // Query doanh thu theo tháng trong năm đó
        // Tính tổng FinalAmount của tất cả đơn hàng completed trong mỗi tháng
        $revenueChartQuery = "SELECT 
                               MONTH(CreatedAt) as month,
                               DATE_FORMAT(CreatedAt, '%m') as period,
                               COALESCE(SUM(CASE WHEN OrderStatus = 'completed' THEN FinalAmount ELSE 0 END), 0) as revenue
                              FROM Orders
                              WHERE YEAR(CreatedAt) = :year
                                AND OrderStatus = 'completed'
                              GROUP BY MONTH(CreatedAt), DATE_FORMAT(CreatedAt, '%m')
                              ORDER BY MONTH(CreatedAt)";
        $stmt = $db->prepare($revenueChartQuery);
        $stmt->bindParam(':year', $year);
    } else {
        // Default: doanh thu theo tháng trong năm hiện tại
        $currentYear = date('Y');
        $revenueChartQuery = "SELECT 
                               MONTH(CreatedAt) as month,
                               DATE_FORMAT(CreatedAt, '%m') as period,
                               COALESCE(SUM(CASE WHEN OrderStatus = 'completed' THEN FinalAmount ELSE 0 END), 0) as revenue
                              FROM Orders
                              WHERE YEAR(CreatedAt) = :year
                                AND OrderStatus = 'completed'
                              GROUP BY MONTH(CreatedAt), DATE_FORMAT(CreatedAt, '%m')
                              ORDER BY MONTH(CreatedAt)";
        $stmt = $db->prepare($revenueChartQuery);
        $stmt->bindParam(':year', $currentYear);
    }
    
    $stmt->execute();
    $revenueChart = $stmt->fetchAll();
    
    // Tạo labels cho 12 tháng (nếu thiếu tháng nào thì revenue = 0)
    // Mỗi tháng sẽ hiển thị TỔNG doanh thu của tất cả đơn hàng completed trong tháng đó
    $monthLabels = [];
    $monthData = [];
    for ($i = 1; $i <= 12; $i++) {
        $monthLabels[] = sprintf('%02d', $i);
        $found = false;
        foreach ($revenueChart as $row) {
            if ($row['month'] == $i) {
                // Lưu tổng doanh thu của tháng (đã được SUM trong query)
                $monthData[] = (float)$row['revenue'];
                $found = true;
                break;
            }
        }
        if (!$found) {
            // Tháng không có đơn hàng completed
            $monthData[] = 0;
        }
    }
    $revenueChart = [
        'labels' => $monthLabels,
        'data' => $monthData
    ];
    
    // Biểu đồ tròn: Số lượng sản phẩm bán được theo tháng (nếu có month)
    // Lấy TẤT CẢ sản phẩm (kể cả không bán được = 0)
    if ($month && $year) {
        // Lấy tất cả sản phẩm
        $allProductsQuery = "SELECT ProductID, ProductName FROM Products WHERE Status = 'available' ORDER BY ProductName";
        $stmt = $db->prepare($allProductsQuery);
        $stmt->execute();
        $allProducts = $stmt->fetchAll();
        
        // Lấy số lượng bán được theo tháng
        $salesQuery = "SELECT 
                        p.ProductID,
                        p.ProductName as product_name,
                        COALESCE(SUM(oi.Quantity), 0) as quantity,
                        COALESCE(SUM(oi.Subtotal), 0) as revenue
                      FROM Products p
                      LEFT JOIN OrderItems oi ON p.ProductID = oi.ProductID
                      LEFT JOIN Orders o ON oi.OrderID = o.OrderID 
                        AND o.OrderStatus = 'completed' 
                        AND YEAR(o.CreatedAt) = :year
                        AND MONTH(o.CreatedAt) = :month
                      WHERE p.Status = 'available'
                      GROUP BY p.ProductID, p.ProductName
                      ORDER BY quantity DESC, p.ProductName";
        $stmt = $db->prepare($salesQuery);
        $stmt->bindParam(':year', $year);
        $stmt->bindParam(':month', $month);
        $stmt->execute();
        $productChart = $stmt->fetchAll();
        
        // Đảm bảo tất cả sản phẩm đều có (nếu không bán được thì quantity = 0)
        $productMap = [];
        foreach ($productChart as $p) {
            $productMap[$p['ProductID']] = $p;
        }
        foreach ($allProducts as $p) {
            if (!isset($productMap[$p['ProductID']])) {
                $productChart[] = [
                    'ProductID' => $p['ProductID'],
                    'product_name' => $p['ProductName'],
                    'quantity' => 0,
                    'revenue' => 0
                ];
            }
        }
        
        // Sắp xếp lại: sản phẩm bán được trước, không bán được sau
        usort($productChart, function($a, $b) {
            if ($b['quantity'] != $a['quantity']) {
                return $b['quantity'] - $a['quantity'];
            }
            return strcmp($a['product_name'], $b['product_name']);
        });
    } else {
        // Default: tất cả sản phẩm (không có data)
        $productChart = [];
    }
    
    // Chuẩn bị dữ liệu cho biểu đồ tròn
    $productChartData = [];
    if ($month && $year) {
        // Khi có month, trả về tất cả sản phẩm với số lượng bán
        $productChartData = [
            'labels' => array_column($productChart, 'product_name'),
            'data' => array_column($productChart, 'quantity'),
            'revenues' => array_column($productChart, 'revenue') // Thêm revenues để tính tỉ lệ
        ];
    } else {
        // Khi không có month, dùng topProducts
        $productChartData = [
            'labels' => array_column($productChart, 'product_name'),
            'data' => array_column($productChart, 'quantity')
        ];
    }
    
    $chartData = [
        'revenue' => $revenueChart,
        'products' => $productChartData
    ];
    
    sendJsonResponse(true, [
        'revenue' => $stats['revenue'],
        'total_orders' => $stats['total_orders'],
        'delivered_orders' => $stats['delivered_orders'],
        'new_customers' => $stats['new_customers'],
        'top_products' => $topProducts,
        'chart_data' => $chartData,
        'product_chart_full' => $productChart // Trả về full data cho bảng
    ], "Lấy báo cáo thành công");
}
?>