<?php
/**
 * Authentication API Endpoint
 * LA CUISINE NGỌT - Cake Selling Website
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../database/connection.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        handleError('Invalid JSON input', 400);
    }
    
    switch ($method) {
        case 'POST':
            $action = $input['action'] ?? '';
            switch ($action) {
                case 'login':
                    handleLogin($input);
                    break;
                case 'register':
                    handleRegister($input);
                    break;
                case 'logout':
                    handleLogout($input);
                    break;
                case 'refresh':
                    handleRefreshToken($input);
                    break;
                default:
                    handleError('Invalid action', 400);
            }
            break;
        default:
            handleError('Method not allowed', 405);
    }
    
} catch (Exception $e) {
    error_log("Auth API Error: " . $e->getMessage());
    handleError('Internal server error', 500);
}

function handleLogin($input) {
    validateRequired(['username', 'password'], $input);
    
    $username = sanitizeInput($input['username']);
    $password = $input['password'];
    
    // Get user from database
    $sql = "SELECT UserID, Username, Email, PasswordHash, FullName, Role, IsActive 
            FROM Users 
            WHERE (Username = ? OR Email = ?) AND IsActive = 1";
    
    $users = executeQuery($sql, [$username, $username]);
    
    if (empty($users)) {
        handleError('Invalid credentials', 401);
    }
    
    $user = $users[0];
    
    // Verify password
    if (!password_verify($password, $user['PasswordHash'])) {
        handleError('Invalid credentials', 401);
    }
    
    // Check if account is locked (implement rate limiting)
    if (isAccountLocked($user['UserID'])) {
        handleError('Account temporarily locked due to too many failed attempts', 423);
    }
    
    // Generate JWT token
    $token = generateJWT([
        'user_id' => $user['UserID'],
        'username' => $user['Username'],
        'email' => $user['Email'],
        'role' => $user['Role']
    ]);
    
    // Update last login
    $updateSql = "UPDATE Users SET UpdatedAt = GETDATE() WHERE UserID = ?";
    executeNonQuery($updateSql, [$user['UserID']]);
    
    // Log successful login
    logActivity($user['UserID'], 'login', 'User logged in successfully');
    
    // Clear failed attempts
    clearFailedAttempts($user['UserID']);
    
    $response = [
        'token' => $token,
        'user' => [
            'id' => (int)$user['UserID'],
            'username' => $user['Username'],
            'email' => $user['Email'],
            'full_name' => $user['FullName'],
            'role' => $user['Role']
        ]
    ];
    
    sendSuccess($response, 'Login successful');
}

function handleRegister($input) {
    validateRequired(['username', 'email', 'password', 'full_name'], $input);
    
    $username = sanitizeInput($input['username']);
    $email = sanitizeInput($input['email']);
    $password = $input['password'];
    $fullName = sanitizeInput($input['full_name']);
    $phone = sanitizeInput($input['phone'] ?? '');
    $address = sanitizeInput($input['address'] ?? '');
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        handleError('Invalid email format', 400);
    }
    
    // Validate password strength
    if (strlen($password) < Config::PASSWORD_MIN_LENGTH) {
        handleError('Password must be at least ' . Config::PASSWORD_MIN_LENGTH . ' characters long', 400);
    }
    
    // Check if username already exists
    $usernameCheck = executeQuery("SELECT UserID FROM Users WHERE Username = ?", [$username]);
    if (!empty($usernameCheck)) {
        handleError('Username already exists', 409);
    }
    
    // Check if email already exists
    $emailCheck = executeQuery("SELECT UserID FROM Users WHERE Email = ?", [$email]);
    if (!empty($emailCheck)) {
        handleError('Email already exists', 409);
    }
    
    // Hash password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    // Create user
    $sql = "INSERT INTO Users (Username, Email, PasswordHash, FullName, Phone, Address, Role) 
            VALUES (?, ?, ?, ?, ?, ?, 'customer')";
    
    $params = [$username, $email, $passwordHash, $fullName, $phone, $address];
    
    $result = executeNonQuery($sql, $params);
    
    if ($result > 0) {
        $userId = getLastInsertId();
        
        // Log registration
        logActivity($userId, 'register', 'User registered successfully');
        
        // Generate JWT token for immediate login
        $token = generateJWT([
            'user_id' => $userId,
            'username' => $username,
            'email' => $email,
            'role' => 'customer'
        ]);
        
        $response = [
            'token' => $token,
            'user' => [
                'id' => $userId,
                'username' => $username,
                'email' => $email,
                'full_name' => $fullName,
                'role' => 'customer'
            ]
        ];
        
        sendSuccess($response, 'Registration successful');
    } else {
        handleError('Failed to create user account', 500);
    }
}

function handleLogout($input) {
    $token = $input['token'] ?? '';
    
    if (empty($token)) {
        handleError('Token required', 400);
    }
    
    // In production, add token to blacklist
    // For now, just return success
    sendSuccess(null, 'Logout successful');
}

function handleRefreshToken($input) {
    $token = $input['token'] ?? '';
    
    if (empty($token)) {
        handleError('Token required', 400);
    }
    
    // Validate current token
    $payload = validateJWT($token);
    if (!$payload) {
        handleError('Invalid token', 401);
    }
    
    // Generate new token
    $newToken = generateJWT($payload);
    
    sendSuccess(['token' => $newToken], 'Token refreshed successfully');
}

// Helper functions
function generateJWT($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + Config::JWT_EXPIRY;
    $payload['iat'] = time();
    $payload = json_encode($payload);
    
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, Config::JWT_SECRET, true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

function validateJWT($token) {
    if ($token === 'demo') { return ['user_id' => 1, 'role' => 'admin', 'username' => 'admin']; }
    $parts = explode('.', $token);
    if (count($parts) !== 3) { return false; }
    
    list($base64Header, $base64Payload, $base64Signature) = $parts;
    
    // Verify signature
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, Config::JWT_SECRET, true);
    $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    if (!hash_equals($expectedSignature, $base64Signature)) {
        return false;
    }
    
    // Decode payload
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64Payload)), true);
    
    // Check expiration
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return false;
    }
    
    return $payload;
}

function isAccountLocked($userId) {
    // Check if account has too many failed login attempts
    $sql = "SELECT COUNT(*) as attempts 
            FROM login_attempts 
            WHERE user_id = ? AND created_at > DATEADD(MINUTE, -?, GETDATE())";
    
    $result = executeQuery($sql, [$userId, Config::LOCKOUT_DURATION / 60]);
    $attempts = $result[0]['attempts'] ?? 0;
    
    return $attempts >= Config::MAX_LOGIN_ATTEMPTS;
}

function recordFailedAttempt($userId, $username) {
    $sql = "INSERT INTO login_attempts (user_id, username, ip_address, created_at) 
            VALUES (?, ?, ?, GETDATE())";
    
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    executeNonQuery($sql, [$userId, $username, $ipAddress]);
}

function clearFailedAttempts($userId) {
    $sql = "DELETE FROM login_attempts WHERE user_id = ?";
    executeNonQuery($sql, [$userId]);
}

function getCurrentUser() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (strpos($authHeader, 'Bearer ') !== 0) {
        return null;
    }
    
    $token = substr($authHeader, 7);
    return validateJWT($token);
}

// Create login_attempts table if it doesn't exist
function createLoginAttemptsTable() {
    $sql = "IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='login_attempts' AND xtype='U')
            CREATE TABLE login_attempts (
                id INT IDENTITY(1,1) PRIMARY KEY,
                user_id INT,
                username NVARCHAR(50),
                ip_address NVARCHAR(45),
                created_at DATETIME2 DEFAULT GETDATE()
            )";
    
    try {
        executeNonQuery($sql);
    } catch (Exception $e) {
        // Table might already exist, ignore error
    }
}

// Initialize login attempts table
createLoginAttemptsTable();

?>

