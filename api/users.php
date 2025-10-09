<?php
/**
 * Users API Endpoint
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once '../database/connection.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];
    switch ($method) {
        case 'GET':
            handleListUsers();
            break;
        case 'PUT':
            handleUpdateUser();
            break;
        case 'DELETE':
            handleDeleteUser();
            break;
        default:
            handleError('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log('Users API Error: '.$e->getMessage());
    handleError('Internal server error', 500);
}

function requireAdmin() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    if (strpos($authHeader, 'Bearer ') !== 0) { handleError('Unauthorized', 401); }
    $token = substr($authHeader, 7);
    $payload = validateJWT($token);
    if (!$payload || ($payload['role'] ?? '') !== 'admin') { handleError('Unauthorized', 401); }
    return $payload;
}

function handleListUsers() {
    requireAdmin();
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : Config::ITEMS_PER_PAGE;
    $offset = ($page - 1) * $limit;
    $search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : '';
    $status = isset($_GET['status']) ? sanitizeInput($_GET['status']) : '';

    $sql = "SELECT UserID, Username, Email, FullName, Phone, Address, Role, IsActive, CreatedAt, UpdatedAt FROM Users WHERE 1=1";
    $params = [];
    if ($search) {
        $sql .= " AND (Username LIKE ? OR Email LIKE ? OR FullName LIKE ?)";
        $term = "%{$search}%";
        $params = array_merge($params, [$term, $term, $term]);
    }
    if ($status !== '') {
        $sql .= " AND IsActive = ?";
        $params[] = ($status === 'active') ? 1 : 0;
    }
    $sql .= " ORDER BY CreatedAt DESC";

    $countSql = "SELECT COUNT(*) as total FROM (".$sql.") t";
    $total = executeQuery($countSql, $params)[0]['total'] ?? 0;

    $sql .= " OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
    $params[] = $offset; $params[] = $limit;
    $users = executeQuery($sql, $params);

    $formatted = array_map(function($u){
        return [
            'id' => (int)$u['UserID'],
            'username' => $u['Username'],
            'email' => $u['Email'],
            'full_name' => $u['FullName'],
            'phone' => $u['Phone'],
            'address' => $u['Address'],
            'role' => $u['Role'],
            'is_active' => (bool)$u['IsActive'],
            'created_at' => $u['CreatedAt'],
            'updated_at' => $u['UpdatedAt']
        ];
    }, $users);

    sendSuccess(['users' => $formatted, 'pagination' => [
        'current_page' => $page,
        'per_page' => $limit,
        'total_items' => (int)$total,
        'total_pages' => ceil($total / $limit)
    ]]);
}

function handleUpdateUser() {
    $admin = requireAdmin();
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    if (!$id) { handleError('User ID required', 400); }
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) { handleError('Invalid JSON input', 400); }
    $fields = [];
    $params = [];
    if (isset($input['full_name'])) { $fields[] = 'FullName = ?'; $params[] = sanitizeInput($input['full_name']); }
    if (isset($input['phone'])) { $fields[] = 'Phone = ?'; $params[] = sanitizeInput($input['phone']); }
    if (isset($input['address'])) { $fields[] = 'Address = ?'; $params[] = sanitizeInput($input['address']); }
    if (isset($input['role'])) { $fields[] = 'Role = ?'; $params[] = sanitizeInput($input['role']); }
    if (isset($input['is_active'])) { $fields[] = 'IsActive = ?'; $params[] = (bool)$input['is_active']; }
    if (empty($fields)) { handleError('No fields to update', 400); }
    $fields[] = 'UpdatedAt = GETDATE()';
    $params[] = $id;
    $sql = 'UPDATE Users SET '.implode(', ', $fields).' WHERE UserID = ?';
    $result = executeNonQuery($sql, $params);
    if ($result > 0) { sendSuccess(null, 'User updated successfully'); } else { handleError('Failed to update user', 500); }
}

function handleDeleteUser() {
    requireAdmin();
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    if (!$id) { handleError('User ID required', 400); }
    $result = executeNonQuery('DELETE FROM Users WHERE UserID = ?', [$id]);
    if ($result > 0) { sendSuccess(null, 'User deleted successfully'); } else { handleError('Failed to delete user', 500); }
}

?>


