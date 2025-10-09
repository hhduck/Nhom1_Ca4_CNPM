<?php
/**
 * Database Connection Configuration
 * LA CUISINE NGỌT - Cake Selling Website
 */

class Database {
    private $host = 'localhost';
    private $db_name = 'LaCuisineNgot';
    private $username = 'sa'; // SQL Server username
    private $password = 'your_password'; // Change this to your SQL Server password
    private $charset = 'utf8';
    private $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            // SQL Server connection string
            $connectionInfo = array(
                "Database" => $this->db_name,
                "CharacterSet" => "UTF-8"
            );
            
            $this->conn = sqlsrv_connect($this->host, array(
                "UID" => $this->username,
                "PWD" => $this->password,
                "Database" => $this->db_name,
                "CharacterSet" => "UTF-8"
            ));

            if ($this->conn === false) {
                throw new Exception("Connection failed: " . print_r(sqlsrv_errors(), true));
            }

        } catch (Exception $e) {
            error_log("Database connection error: " . $e->getMessage());
            throw new Exception("Database connection failed");
        }

        return $this->conn;
    }

    public function closeConnection() {
        if ($this->conn) {
            sqlsrv_close($this->conn);
        }
    }
}

// Alternative MySQL connection (if using MySQL instead of SQL Server)
class MySQLDatabase {
    private $host = 'localhost';
    private $db_name = 'lacuisinengot';
    private $username = 'root';
    private $password = '';
    private $charset = 'utf8mb4';
    private $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=" . $this->charset;
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            throw new Exception("Database connection failed");
        }

        return $this->conn;
    }
}

// Configuration class
class Config {
    // Database settings
    const DB_TYPE = 'mysql'; // 'sqlserver' or 'mysql'
    const DB_HOST = 'localhost';
    const DB_NAME = 'lacuisinengot';
    const DB_USER = 'root';
    const DB_PASS = '';
    
    // JWT settings
    const JWT_SECRET = 'your_jwt_secret_key_here';
    const JWT_EXPIRY = 86400; // 24 hours
    
    // Application settings
    const APP_NAME = 'LA CUISINE NGỌT';
    const APP_URL = 'http://localhost';
    const UPLOAD_PATH = 'uploads/';
    const MAX_FILE_SIZE = 5242880; // 5MB
    
    // Email settings (for contact form)
    const SMTP_HOST = 'smtp.gmail.com';
    const SMTP_PORT = 587;
    const SMTP_USER = 'your_email@gmail.com';
    const SMTP_PASS = 'your_app_password';
    const FROM_EMAIL = 'noreply@lacuisinengot.com';
    const FROM_NAME = 'LA CUISINE NGỌT';
    
    // Pagination
    const ITEMS_PER_PAGE = 12;
    
    // Security
    const PASSWORD_MIN_LENGTH = 6;
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCKOUT_DURATION = 900; // 15 minutes
}

// Helper function to get database connection
function getDBConnection() {
    if (Config::DB_TYPE === 'sqlserver') {
        $db = new Database();
        return $db->getConnection();
    } else {
        $db = new MySQLDatabase();
        return $db->getConnection();
    }
}

// Helper function to execute query
function executeQuery($sql, $params = []) {
    $conn = getDBConnection();
    
    if (Config::DB_TYPE === 'sqlserver') {
        $stmt = sqlsrv_prepare($conn, $sql, $params);
        if ($stmt === false) {
            throw new Exception("Query preparation failed: " . print_r(sqlsrv_errors(), true));
        }
        
        if (sqlsrv_execute($stmt) === false) {
            throw new Exception("Query execution failed: " . print_r(sqlsrv_errors(), true));
        }
        
        $results = [];
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $results[] = $row;
        }
        
        sqlsrv_free_stmt($stmt);
        return $results;
    } else {
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}

// Helper function to execute non-query (INSERT, UPDATE, DELETE)
function executeNonQuery($sql, $params = []) {
    $conn = getDBConnection();
    
    if (Config::DB_TYPE === 'sqlserver') {
        $stmt = sqlsrv_prepare($conn, $sql, $params);
        if ($stmt === false) {
            throw new Exception("Query preparation failed: " . print_r(sqlsrv_errors(), true));
        }
        
        if (sqlsrv_execute($stmt) === false) {
            throw new Exception("Query execution failed: " . print_r(sqlsrv_errors(), true));
        }
        
        $rowsAffected = sqlsrv_rows_affected($stmt);
        sqlsrv_free_stmt($stmt);
        return $rowsAffected;
    } else {
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }
}

// Helper function to get last inserted ID
function getLastInsertId() {
    $conn = getDBConnection();
    
    if (Config::DB_TYPE === 'sqlserver') {
        $sql = "SELECT SCOPE_IDENTITY() as id";
        $stmt = sqlsrv_query($conn, $sql);
        $row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
        return $row['id'];
    } else {
        return $conn->lastInsertId();
    }
}

// Helper function to begin transaction
function beginTransaction() {
    $conn = getDBConnection();
    
    if (Config::DB_TYPE === 'sqlserver') {
        sqlsrv_begin_transaction($conn);
    } else {
        $conn->beginTransaction();
    }
}

// Helper function to commit transaction
function commitTransaction() {
    $conn = getDBConnection();
    
    if (Config::DB_TYPE === 'sqlserver') {
        sqlsrv_commit($conn);
    } else {
        $conn->commit();
    }
}

// Helper function to rollback transaction
function rollbackTransaction() {
    $conn = getDBConnection();
    
    if (Config::DB_TYPE === 'sqlserver') {
        sqlsrv_rollback($conn);
    } else {
        $conn->rollback();
    }
}

// Error handling
function handleError($message, $code = 500) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit;
}

// Success response
function sendSuccess($data = null, $message = 'Success') {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit;
}

// Validate required fields
function validateRequired($fields, $data) {
    $missing = [];
    foreach ($fields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $missing[] = $field;
        }
    }
    
    if (!empty($missing)) {
        handleError('Missing required fields: ' . implode(', ', $missing), 400);
    }
}

// Sanitize input
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

// Generate random string
function generateRandomString($length = 10) {
    return substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length/strlen($x)) )),1,$length);
}

// Format price
function formatPrice($price) {
    return number_format($price, 0, ',', '.') . ' VNĐ';
}

// Log activity
function logActivity($user_id, $action, $details = '') {
    try {
        $sql = "INSERT INTO activity_logs (user_id, action, details, created_at) VALUES (?, ?, ?, ?)";
        executeNonQuery($sql, [$user_id, $action, $details, date('Y-m-d H:i:s')]);
    } catch (Exception $e) {
        error_log("Failed to log activity: " . $e->getMessage());
    }
}

?>

