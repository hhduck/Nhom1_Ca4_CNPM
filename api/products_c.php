<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/config/database.php';

$database = new Database();
$db = $database->getConnection();

// Nếu chỉ lấy danh mục (cho phần lọc)
if (isset($_GET['categories'])) {
  $query = "SELECT DISTINCT CategoryName FROM Categories ORDER BY CategoryName ASC";
  $stmt = $db->prepare($query);
  $stmt->execute();
  $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode([
    "success" => true,
    "categories" => $categories
  ], JSON_UNESCAPED_UNICODE);
  exit; // Dừng luôn ở đây, không chạy phần sản phẩm bên dưới
}

// Các tham số lọc sản phẩm
$search   = isset($_GET['search']) ? trim($_GET['search']) : '';
$category = isset($_GET['category']) ? trim($_GET['category']) : '';
$min      = isset($_GET['min']) ? floatval($_GET['min']) : 0;
$max      = isset($_GET['max']) ? floatval($_GET['max']) : 99999999;

// Câu truy vấn sản phẩm đang hoạt động
$query = "SELECT 
            p.ProductID, p.ProductName, p.Description, p.Price, p.ImageURL,
            c.CategoryName
          FROM Products p
          LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
          WHERE p.IsActive = 1 AND p.Status = 'available'
                AND p.Price BETWEEN :min AND :max";

$params = [
  ':min' => $min,
  ':max' => $max
];

if (!empty($search)) {
  $query .= " AND (p.ProductName LIKE :search1 OR p.Description LIKE :search2 OR c.CategoryName LIKE :search3)";
  $params[':search1'] = "%$search%";
  $params[':search2'] = "%$search%";
  $params[':search3'] = "%$search%";
}

if (!empty($category)) {
  $query .= " AND c.CategoryName = :category";
  $params[':category'] = $category;
}

$query .= " ORDER BY p.ProductID ASC";

$stmt = $db->prepare($query);
$stmt->execute($params);

$products = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
  "success" => true,
  "total" => count($products),
  "products" => $products
], JSON_UNESCAPED_UNICODE);
?>
