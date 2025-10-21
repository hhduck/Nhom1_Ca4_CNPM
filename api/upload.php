<?php
/**
 * Upload API
 * LA CUISINE NGỌT
 * FILE: api/upload.php
 */

require_once __DIR__ . '/config/database.php';

enableCORS();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    checkAdminPermission();
    uploadFile();
} else {
    sendJsonResponse(false, null, "Method không được hỗ trợ", 405);
}

function uploadFile() {
    if (!isset($_FILES['file'])) {
        sendJsonResponse(false, null, "Không có file được upload", 400);
    }
    
    $file = $_FILES['file'];
    
    if ($file['error'] !== UPLOAD_ERR_OK) {
        sendJsonResponse(false, null, "Lỗi khi upload file", 500);
    }
    
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $fileType = mime_content_type($file['tmp_name']);
    
    if (!in_array($fileType, $allowedTypes)) {
        sendJsonResponse(false, null, "Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)", 400);
    }
    
    $maxSize = 5 * 1024 * 1024; // 5MB
    if ($file['size'] > $maxSize) {
        sendJsonResponse(false, null, "File quá lớn. Tối đa 5MB", 400);
    }
    
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = uniqid() . '_' . time() . '.' . $extension;
    
    $uploadDir = __DIR__ . '/../uploads/';
    
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $yearMonth = date('Y/m');
    $targetDir = $uploadDir . $yearMonth . '/';
    
    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0777, true);
    }
    
    $targetPath = $targetDir . $fileName;
    
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $fileUrl = '/uploads/' . $yearMonth . '/' . $fileName;
        
        sendJsonResponse(true, [
            'file_name' => $fileName,
            'file_url' => $fileUrl,
            'file_size' => $file['size'],
            'file_type' => $fileType
        ], "Upload file thành công", 201);
    } else {
        sendJsonResponse(false, null, "Không thể lưu file", 500);
    }
}