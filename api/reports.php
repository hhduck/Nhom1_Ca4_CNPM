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
    
    // Xác định startDate và endDate dựa trên month và year
    if ($month && $year) {
        // Có cả tháng và năm: tính trong tháng đó
        $startDate = sprintf('%04d-%02d-01', $year, $month);
        $endDate = date('Y-m-t', strtotime($startDate)); // Last day of month
    } else if ($year) {
        // Chỉ có năm (không có tháng): tính TẤT CẢ các tháng trong năm đó
        $startDate = sprintf('%04d-01-01', $year); // Ngày đầu năm
        $currentYear = date('Y');
        $currentMonth = date('m');
        if ($year == $currentYear) {
            // Nếu là năm hiện tại, tính đến tháng hiện tại
            $endDate = date('Y-m-t', strtotime(sprintf('%04d-%02d-01', $year, $currentMonth))); // Ngày cuối tháng hiện tại
        } else {
            // Nếu là năm quá khứ, tính đến cuối năm
            $endDate = sprintf('%04d-12-31', $year); // Ngày cuối năm
        }
    } else if ($period === 'month') {
        // Không có năm/tháng, dùng period logic
        $startDate = date('Y-m-d', strtotime('-1 month'));
        $endDate = date('Y-m-d');
    } else {
        // Default: -1 year
        $startDate = date('Y-m-d', strtotime('-1 year'));
        $endDate = date('Y-m-d');
    }
    
    // Stats query: Tính tổng doanh thu, đơn hàng, v.v.
    // Doanh thu tính từ Subtotal của OrderItems (đồng nhất với bảng chi tiết)
    // Để đảm bảo tổng các sản phẩm trong bảng = KPI doanh thu
    $statsQuery = "SELECT 
                    COALESCE(SUM(oi.Subtotal), 0) as revenue,
                    COUNT(DISTINCT o.OrderID) as total_orders,
                    COUNT(DISTINCT CASE WHEN o.OrderStatus = 'completed' THEN o.OrderID END) as delivered_orders,
                    (SELECT COUNT(*) FROM Users WHERE Role = 'customer' AND CreatedAt >= :start_date1 AND CreatedAt <= :end_date1) as new_customers
                   FROM Orders o
                   LEFT JOIN OrderItems oi ON o.OrderID = oi.OrderID AND o.OrderStatus = 'completed'
                   WHERE o.CreatedAt >= :start_date2
                     AND o.CreatedAt <= :end_date2";
    $stmt = $db->prepare($statsQuery);
    $stmt->bindParam(':start_date1', $startDate);
    $stmt->bindParam(':end_date1', $endDate);
    $stmt->bindParam(':start_date2', $startDate);
    $stmt->bindParam(':end_date2', $endDate);
    
    $stmt->execute();
    $stats = $stmt->fetch();
    
    // Top products query: Tính sản phẩm bán chạy
    // Luôn dùng startDate và endDate để đảm bảo tính đúng
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
    
    $stmt->execute();
    $topProducts = $stmt->fetchAll();
    
    // Biểu đồ cột: Doanh thu theo tháng của năm được chọn
    // Tính TỔNG doanh thu từ Subtotal của OrderItems (đồng nhất với bảng chi tiết)
    // Để đảm bảo tổng các sản phẩm trong bảng = doanh thu trong biểu đồ
    if ($year) {
        // Query doanh thu theo tháng trong năm đó
        // Tính tổng Subtotal của tất cả OrderItems trong các đơn hàng completed của tháng đó
        $revenueChartQuery = "SELECT 
                               MONTH(o.CreatedAt) as month,
                               DATE_FORMAT(o.CreatedAt, '%m') as period,
                               COALESCE(SUM(oi.Subtotal), 0) as revenue
                              FROM Orders o
                              INNER JOIN OrderItems oi ON o.OrderID = oi.OrderID
                              WHERE YEAR(o.CreatedAt) = :year
                                AND o.OrderStatus = 'completed'
                              GROUP BY MONTH(o.CreatedAt), DATE_FORMAT(o.CreatedAt, '%m')
                              ORDER BY MONTH(o.CreatedAt)";
        $stmt = $db->prepare($revenueChartQuery);
        $stmt->bindParam(':year', $year);
    } else {
        // Default: doanh thu theo tháng trong năm hiện tại
        $currentYear = date('Y');
        $revenueChartQuery = "SELECT 
                               MONTH(o.CreatedAt) as month,
                               DATE_FORMAT(o.CreatedAt, '%m') as period,
                               COALESCE(SUM(oi.Subtotal), 0) as revenue
                              FROM Orders o
                              INNER JOIN OrderItems oi ON o.OrderID = oi.OrderID
                              WHERE YEAR(o.CreatedAt) = :year
                                AND o.OrderStatus = 'completed'
                              GROUP BY MONTH(o.CreatedAt), DATE_FORMAT(o.CreatedAt, '%m')
                              ORDER BY MONTH(o.CreatedAt)";
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
        // Khi không có month (chọn "Tất cả"): lấy dữ liệu tổng hợp theo năm
        // Lấy tất cả sản phẩm với số lượng bán trong cả năm
        if ($year) {
            $allProductsQuery = "SELECT ProductID, ProductName FROM Products WHERE Status = 'available' ORDER BY ProductName";
            $stmt = $db->prepare($allProductsQuery);
            $stmt->execute();
            $allProducts = $stmt->fetchAll();
            
            // Lấy số lượng bán được trong cả năm
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
                          WHERE p.Status = 'available'
                          GROUP BY p.ProductID, p.ProductName
                          ORDER BY quantity DESC, p.ProductName";
            $stmt = $db->prepare($salesQuery);
            $stmt->bindParam(':year', $year);
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
            // Không có year: trả về rỗng
            $productChart = [];
        }
    }
    
    // Chuẩn bị dữ liệu cho biểu đồ tròn
    $productChartData = [];
    if (!empty($productChart)) {
        // Trả về tất cả sản phẩm với số lượng bán
        $productChartData = [
            'labels' => array_column($productChart, 'product_name'),
            'data' => array_column($productChart, 'quantity'),
            'revenues' => array_column($productChart, 'revenue') // Thêm revenues để tính tỉ lệ
        ];
    } else {
        // Không có dữ liệu
        $productChartData = [
            'labels' => [],
            'data' => [],
            'revenues' => []
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
        'product_chart_full' => $productChart // Trả về full data cho bảng (theo tháng hoặc theo năm)
    ], "Lấy báo cáo thành công");
}
?>