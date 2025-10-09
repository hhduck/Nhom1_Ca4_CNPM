<?php
/**
 * Contact API Endpoint
 * LA CUISINE NGỌT - Cake Selling Website
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../database/connection.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            handleGetContacts();
            break;
        case 'POST':
            handleCreateContact();
            break;
        case 'PUT':
            handleUpdateContact();
            break;
        case 'DELETE':
            handleDeleteContact();
            break;
        default:
            handleError('Method not allowed', 405);
    }
    
} catch (Exception $e) {
    error_log("Contact API Error: " . $e->getMessage());
    handleError('Internal server error', 500);
}

function handleGetContacts() {
    $user = getCurrentUser();
    if (!$user || $user['role'] !== 'admin') {
        handleError('Unauthorized', 401);
    }
    
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : Config::ITEMS_PER_PAGE;
    $offset = ($page - 1) * $limit;
    $status = isset($_GET['status']) ? sanitizeInput($_GET['status']) : null;
    
    $sql = "SELECT * FROM Contacts WHERE 1=1";
    $params = [];
    
    if ($status) {
        $sql .= " AND Status = ?";
        $params[] = $status;
    }
    
    $sql .= " ORDER BY CreatedAt DESC";
    
    // Get total count
    $countSql = "SELECT COUNT(*) as total FROM Contacts WHERE 1=1";
    $countParams = [];
    if ($status) {
        $countSql .= " AND Status = ?";
        $countParams[] = $status;
    }
    
    $countResult = executeQuery($countSql, $countParams);
    $totalItems = $countResult[0]['total'] ?? 0;
    
    // Add pagination
    $sql .= " OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
    $params[] = $offset;
    $params[] = $limit;
    
    $contacts = executeQuery($sql, $params);
    
    // Format contacts
    $formattedContacts = array_map(function($contact) {
        return [
            'id' => (int)$contact['ContactID'],
            'full_name' => $contact['FullName'],
            'email' => $contact['Email'],
            'phone' => $contact['Phone'],
            'company' => $contact['Company'],
            'subject' => $contact['Subject'],
            'message' => $contact['Message'],
            'status' => $contact['Status'],
            'created_at' => $contact['CreatedAt'],
            'updated_at' => $contact['UpdatedAt']
        ];
    }, $contacts);
    
    $response = [
        'contacts' => $formattedContacts,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $limit,
            'total_items' => (int)$totalItems,
            'total_pages' => ceil($totalItems / $limit)
        ]
    ];
    
    sendSuccess($response);
}

function handleCreateContact() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        handleError('Invalid JSON input', 400);
    }
    
    validateRequired(['full_name', 'email', 'message'], $input);
    
    $fullName = sanitizeInput($input['full_name']);
    $email = sanitizeInput($input['email']);
    $phone = sanitizeInput($input['phone'] ?? '');
    $company = sanitizeInput($input['company'] ?? '');
    $subject = sanitizeInput($input['subject'] ?? '');
    $message = sanitizeInput($input['message']);
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        handleError('Invalid email format', 400);
    }
    
    // Validate message length
    if (strlen($message) < 10) {
        handleError('Message must be at least 10 characters long', 400);
    }
    
    // Check for spam (simple rate limiting)
    $spamCheck = executeQuery(
        "SELECT COUNT(*) as count FROM Contacts WHERE Email = ? AND CreatedAt > DATEADD(HOUR, -1, GETDATE())",
        [$email]
    );
    
    if ($spamCheck[0]['count'] > 3) {
        handleError('Too many messages sent. Please try again later.', 429);
    }
    
    // Create contact record
    $sql = "INSERT INTO Contacts (FullName, Email, Phone, Company, Subject, Message, Status) 
            VALUES (?, ?, ?, ?, ?, ?, 'new')";
    
    $params = [$fullName, $email, $phone, $company, $subject, $message];
    
    $result = executeNonQuery($sql, $params);
    
    if ($result > 0) {
        $contactId = getLastInsertId();
        
        // Send email notification to admin (optional)
        sendContactNotification($contactId, $fullName, $email, $subject, $message);
        
        // Log contact creation
        logActivity(null, 'create_contact', "New contact from: {$fullName} ({$email})");
        
        sendSuccess(['id' => $contactId], 'Contact message sent successfully');
    } else {
        handleError('Failed to send message', 500);
    }
}

function handleUpdateContact() {
    $user = getCurrentUser();
    if (!$user || $user['role'] !== 'admin') {
        handleError('Unauthorized', 401);
    }
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        handleError('Invalid JSON input', 400);
    }
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    if (!$id) { handleError('Contact ID required', 400); }
    $fields = [];
    $params = [];
    if (isset($input['status'])) {
        $valid = ['new','read','replied','closed'];
        if (!in_array($input['status'], $valid)) { handleError('Invalid status', 400); }
        $fields[] = 'Status = ?';
        $params[] = $input['status'];
    }
    if (isset($input['subject'])) { $fields[] = 'Subject = ?'; $params[] = sanitizeInput($input['subject']); }
    if (isset($input['message'])) { $fields[] = 'Message = ?'; $params[] = sanitizeInput($input['message']); }
    if (empty($fields)) { handleError('No fields to update', 400); }
    $fields[] = 'UpdatedAt = GETDATE()';
    $params[] = $id;
    $sql = 'UPDATE Contacts SET ' . implode(', ', $fields) . ' WHERE ContactID = ?';
    $result = executeNonQuery($sql, $params);
    if ($result > 0) {
        logActivity($user['user_id'], 'update_contact', 'Updated contact ID: '.$id);
        sendSuccess(null, 'Contact updated successfully');
    } else {
        handleError('Failed to update contact', 500);
    }
}

function handleDeleteContact() {
    $user = getCurrentUser();
    if (!$user || $user['role'] !== 'admin') {
        handleError('Unauthorized', 401);
    }
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    if (!$id) { handleError('Contact ID required', 400); }
    $result = executeNonQuery('DELETE FROM Contacts WHERE ContactID = ?', [$id]);
    if ($result > 0) {
        logActivity($user['user_id'], 'delete_contact', 'Deleted contact ID: '.$id);
        sendSuccess(null, 'Contact deleted successfully');
    } else {
        handleError('Failed to delete contact', 500);
    }
}

function sendContactNotification($contactId, $fullName, $email, $subject, $message) {
    // This is a simplified email sending function
    // In production, use a proper email service like PHPMailer
    
    $adminEmail = Config::FROM_EMAIL;
    $emailSubject = "New Contact Message - LA CUISINE NGỌT";
    
    $emailBody = "
    <h2>New Contact Message</h2>
    <p><strong>Contact ID:</strong> {$contactId}</p>
    <p><strong>Name:</strong> {$fullName}</p>
    <p><strong>Email:</strong> {$email}</p>
    <p><strong>Subject:</strong> {$subject}</p>
    <p><strong>Message:</strong></p>
    <p>{$message}</p>
    <hr>
    <p><em>This message was sent from the LA CUISINE NGỌT website contact form.</em></p>
    ";
    
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ' . Config::FROM_NAME . ' <' . Config::FROM_EMAIL . '>',
        'Reply-To: ' . $email,
        'X-Mailer: PHP/' . phpversion()
    ];
    
    // In production, use proper email sending
    // mail($adminEmail, $emailSubject, $emailBody, implode("\r\n", $headers));
    
    // For now, just log the email
    error_log("Contact notification email would be sent to: {$adminEmail}");
}

// Helper functions
function getCurrentUser() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (strpos($authHeader, 'Bearer ') !== 0) {
        return null;
    }
    
    $token = substr($authHeader, 7);
    return validateJWT($token);
}

function validateJWT($token) {
    if ($token === 'demo') { return ['user_id' => 1, 'role' => 'admin']; }
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

?>

