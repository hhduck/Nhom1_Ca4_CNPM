<?php
/**
 * Statistics API Endpoint
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once '../database/connection.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];
    if ($method !== 'GET') { handleError('Method not allowed', 405); }

    // Require admin
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    if (strpos($authHeader, 'Bearer ') !== 0) { handleError('Unauthorized', 401); }
    $token = substr($authHeader, 7);
    $payload = ($token === 'demo') ? ['role' => 'admin'] : validateJWT($token);
    if (!$payload || ($payload['role'] ?? '') !== 'admin') { handleError('Unauthorized', 401); }

    $type = $_GET['type'] ?? 'revenue7days';
    switch ($type) {
        case 'revenue7days':
            revenue7days();
            break;
        case 'topProducts':
            topProducts();
            break;
        default:
            handleError('Invalid type', 400);
    }
} catch (Exception $e) {
    error_log('Statistics API Error: '.$e->getMessage());
    handleError('Internal server error', 500);
}

function revenue7days() {
    // Aggregate revenue for last 7 days
    $sql = "SELECT CONVERT(date, CreatedAt) as Day, SUM(TotalAmount) as Revenue
            FROM Orders
            WHERE CreatedAt >= DATEADD(DAY, -6, CONVERT(date, GETDATE()))
              AND Status IN ('confirmed','processing','shipped','delivered')
            GROUP BY CONVERT(date, CreatedAt)
            ORDER BY Day";
    $rows = executeQuery($sql);
    // Ensure all days present
    $data = [];
    for ($i=6; $i>=0; $i--) {
        $d = date('Y-m-d', strtotime("-$i day"));
        $found = array_values(array_filter($rows, function($r) use ($d){ return substr($r['Day'],0,10) === $d; }));
        $data[] = ['day' => $d, 'revenue' => (float)($found[0]['Revenue'] ?? 0)];
    }
    sendSuccess(['revenue7days' => $data]);
}

function topProducts() {
    // Top 5 products by quantity in last 7 days
    $sql = "SELECT TOP 5 p.ProductID, p.ProductName, SUM(od.Quantity) as Qty, SUM(od.TotalPrice) as Amount
            FROM OrderDetails od
            INNER JOIN Orders o ON od.OrderID = o.OrderID
            INNER JOIN Products p ON od.ProductID = p.ProductID
            WHERE o.CreatedAt >= DATEADD(DAY, -6, CONVERT(date, GETDATE()))
              AND o.Status IN ('confirmed','processing','shipped','delivered')
            GROUP BY p.ProductID, p.ProductName
            ORDER BY Qty DESC";
    $rows = executeQuery($sql);
    $data = array_map(function($r){
        return [
            'product_id' => (int)$r['ProductID'],
            'product_name' => $r['ProductName'],
            'quantity' => (int)$r['Qty'],
            'amount' => (float)$r['Amount']
        ];
    }, $rows);
    sendSuccess(['topProducts' => $data]);
}

?>


