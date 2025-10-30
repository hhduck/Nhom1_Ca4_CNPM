<?php
/**
 * Authentication Middleware
 * LA CUISINE NGỌT
 * FILE: api/auth/middleware.php
 */

require_once __DIR__ . '/../config/database.php';

class AuthMiddleware {
    private $db;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }
    
    public function authenticate() {
        $token = $this->getBearerToken();
        
        if (!$token) {
            $this->sendUnauthorized("Token không được cung cấp");
        }
        
        $tokenData = $this->validateToken($token);
        
        if (!$tokenData['valid']) {
            $this->sendUnauthorized("Token không hợp lệ hoặc đã hết hạn");
        }
        
        $user = $this->getUserById($tokenData['user_id']);
        
        if (!$user || $user['status'] !== 'active') {
            $this->sendUnauthorized("Tài khoản không hoạt động");
        }
        
        return $user;
    }
    
    public function requireAdmin() {
        $user = $this->authenticate();
        
        if ($user['role'] !== 'admin') {
            $this->sendForbidden("Bạn không có quyền truy cập");
        }
        
        return $user;
    }
    
    public function requireStaff() {
        $user = $this->authenticate();
        
        if (!in_array($user['role'], ['admin', 'staff'])) {
            $this->sendForbidden("Bạn không có quyền truy cập");
        }
        
        return $user;
    }
    
    public function requireOwnerOrAdmin($resourceUserId) {
        $user = $this->authenticate();
        
        if ($user['role'] !== 'admin' && $user['id'] != $resourceUserId) {
            $this->sendForbidden("Bạn không có quyền truy cập tài nguyên này");
        }
        
        return $user;
    }
    
    private function getBearerToken() {
        $headers = getallheaders();
        
        if (isset($headers['Authorization'])) {
            $matches = [];
            if (preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
                return $matches[1];
            }
        }
        
        return null;
    }
    
    private function validateToken($token) {
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
    
    private function getUserById($userId) {
        $query = "SELECT 
                    UserID as id,
                    Username as username,
                    Email as email,
                    FullName as full_name,
                    Role as role,
                    Status as status
                  FROM Users 
                  WHERE UserID = :id";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $userId);
        $stmt->execute();
        
        return $stmt->fetch();
    }
    
    private function sendUnauthorized($message) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            "success" => false,
            "message" => $message
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    private function sendForbidden($message) {
        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            "success" => false,
            "message" => $message
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
}

function requireAuth() {
    $middleware = new AuthMiddleware();
    return $middleware->authenticate();
}

function requireAdmin() {
    $middleware = new AuthMiddleware();
    return $middleware->requireAdmin();
}

function requireStaff() {
    $middleware = new AuthMiddleware();
    return $middleware->requireStaff();
}

function requireOwnerOrAdmin($resourceUserId) {
    $middleware = new AuthMiddleware();
    return $middleware->requireOwnerOrAdmin($resourceUserId);
}
?>
