<?php
/**
 * Payments API Endpoint (stubs for wallets/banks)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once '../database/connection.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { handleError('Method not allowed', 405); }
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) { handleError('Invalid JSON input', 400); }
    $method = $input['method'] ?? '';
    $amount = (float)($input['amount'] ?? 0);
    $orderNumber = sanitizeInput($input['order_number'] ?? '');
    if (!$method || $amount <= 0 || !$orderNumber) { handleError('Missing fields', 400); }

    // In production: sign request and call provider (MoMo, ZaloPay, VietQR, etc.)
    // Here: return a simulated payment URL
    $paymentUrl = 'https://payment.example.com/checkout?provider=' . urlencode($method) . '&order=' . urlencode($orderNumber) . '&amount=' . $amount;
    sendSuccess(['payment_url' => $paymentUrl], 'Payment created');
} catch (Exception $e) {
    error_log('Payments API Error: '.$e->getMessage());
    handleError('Internal server error', 500);
}

?>


