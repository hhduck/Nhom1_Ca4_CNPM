<?php
/**
 * Database Configuration and Connection
 * LA CUISINE NGỌT
 * FILE: api/config/database.php
 */


class Database {
    // Thông tin kết nối database
    private $host = "localhost";
    private $database_name = "lacuisinengot"; // <-- XÁC NHẬN TÊN NÀY LÀ ĐÚNG
    private $username = "root"; // Thay đổi nếu cần
    private $password = ""; // Thay đổi nếu cần
    private $charset = "utf8mb4";
    
    public $conn;
    
    /**
     * Kết nối database
     */
    public function getConnection() {
        $this->conn = null;
        
        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->database_name . ";charset=" . $this->charset;
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ];
            
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
            
        } catch(PDOException $e) {
            error_log("Connection Error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Không thể kết nối database"
            ]);
            exit();
        }
        
        return $this->conn;
    }
    
    /**
     * Đóng kết nối
     */
    public function closeConnection() {
        $this->conn = null;
    }
}

/**
 * Helper Functions
 */

// Gửi response JSON
function sendJsonResponse($success, $data = null, $message = "", $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    
    $response = [
        "success" => $success,
        "message" => $message
    ];
    
    if ($data !== null) {
        $response["data"] = $data;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

// Validate JWT Token
function validateToken($token) {
    // Đơn giản hóa cho demo - trong production nên dùng thư viện JWT thực sự
    if ($token === "demo") {
        return [
            "valid" => true,
            "user_id" => 1,
            "role" => "admin"
        ];
    }
    
    try {
        $decoded = json_decode(base64_decode($token), true);
        
        if (!$decoded) {
            return ["valid" => false];
        }
        
        if (isset($decoded['exp']) && $decoded['exp'] < time()) {
            return ["valid" => false];
        }
        
        return [
            "valid" => true,
            "user_id" => $decoded['user_id'],
            "role" => $decoded['role']
        ];
        
    } catch (Exception $e) {
        return ["valid" => false];
    }
}

// Lấy Authorization token từ header
function getBearerToken() {
    $headers = getallheaders();
    
    if (isset($headers['Authorization'])) {
        $matches = [];
        if (preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }
    
    return null;
}

// Check admin permission
function checkAdminPermission() {
    $token = getBearerToken();
    
    if (!$token) {
        sendJsonResponse(false, null, "Token không hợp lệ", 401);
    }
    
    $tokenData = validateToken($token);
    
    if (!$tokenData['valid'] || $tokenData['role'] !== 'admin') {
        sendJsonResponse(false, null, "Bạn không có quyền truy cập", 403);
    }
    
    return $tokenData['user_id'];
}

// Sanitize input
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)));
}

// Enable CORS - Cải thiện bảo mật
function enableCORS() {
    // Chỉ cho phép domains cụ thể thay vì tất cả (*)
    $allowedOrigins = [
        'http://localhost',
        'http://127.0.0.1',
        'http://localhost:8080',
        'http://localhost:3000'
    ];
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: $origin");
    }
    
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
};

?>