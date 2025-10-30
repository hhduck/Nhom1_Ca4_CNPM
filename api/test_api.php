<?php
/**
 * TEST API - Kiểm tra kết nối database và authentication
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🔧 LA CUISINE NGỌT - API Diagnostic Tool</h1>";
echo "<hr>";

// Test 1: Database Connection
echo "<h2>1. ✅ Kiểm tra kết nối Database</h2>";
try {
    require_once __DIR__ . '/config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    echo "<p style='color: green;'>✅ <strong>Database Connected Successfully!</strong></p>";
    echo "<p>Database Name: lacuisinengot</p>";
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ <strong>Database Connection FAILED!</strong></p>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
    echo "<p><strong>FIX:</strong> Kiểm tra file api/config/database.php và đảm bảo database 'lacuisinengot' đã được tạo.</p>";
    exit;
}

// Test 2: Check if tables exist
echo "<h2>2. ✅ Kiểm tra bảng trong Database</h2>";
$tables = ['Users', 'Products', 'Orders', 'Complaints', 'Promotions'];
$missingTables = [];

foreach ($tables as $table) {
    $query = "SHOW TABLES LIKE '$table'";
    $stmt = $db->query($query);
    $exists = $stmt->fetch();
    
    if ($exists) {
        echo "<p style='color: green;'>✅ Table <strong>$table</strong> exists</p>";
    } else {
        echo "<p style='color: red;'>❌ Table <strong>$table</strong> MISSING!</p>";
        $missingTables[] = $table;
    }
}

if (count($missingTables) > 0) {
    echo "<p style='color: red; font-weight: bold;'>⚠️ MISSING TABLES: " . implode(', ', $missingTables) . "</p>";
    echo "<p><strong>FIX:</strong></p>";
    echo "<ol>";
    echo "<li>Mở <a href='http://localhost/phpmyadmin' target='_blank'>phpMyAdmin</a></li>";
    echo "<li>Chọn database: <code>lacuisinengot</code></li>";
    echo "<li>Tab \"SQL\" → Paste nội dung file <code>database/schema.sql</code></li>";
    echo "<li>Click \"Go\"</li>";
    echo "</ol>";
}

// Test 3: Check Users table data
echo "<h2>3. ✅ Kiểm tra dữ liệu Admin</h2>";
try {
    $query = "SELECT UserID, Username, Role, Status FROM Users WHERE Role = 'admin' LIMIT 1";
    $stmt = $db->query($query);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($admin) {
        echo "<p style='color: green;'>✅ <strong>Admin account found!</strong></p>";
        echo "<table border='1' cellpadding='10'>";
        echo "<tr><th>UserID</th><th>Username</th><th>Role</th><th>Status</th></tr>";
        echo "<tr>";
        echo "<td>{$admin['UserID']}</td>";
        echo "<td>{$admin['Username']}</td>";
        echo "<td>{$admin['Role']}</td>";
        echo "<td>{$admin['Status']}</td>";
        echo "</tr>";
        echo "</table>";
        echo "<p><strong>Login credentials:</strong></p>";
        echo "<ul>";
        echo "<li>Username: <code>{$admin['Username']}</code></li>";
        echo "<li>Password: <code>password</code> (default)</li>";
        echo "</ul>";
    } else {
        echo "<p style='color: red;'>❌ <strong>No admin account found!</strong></p>";
        echo "<p><strong>FIX:</strong> Import lại database/schema.sql</p>";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}

// Test 4: Check middleware
echo "<h2>4. ✅ Kiểm tra Middleware</h2>";
try {
    require_once __DIR__ . '/auth/middleware.php';
    echo "<p style='color: green;'>✅ <strong>Middleware loaded successfully!</strong></p>";
    
    // Test token validation
    $testToken = "demo";
    $tokenData = validateToken($testToken);
    
    if ($tokenData['valid']) {
        echo "<p style='color: green;'>✅ <strong>Demo token works!</strong></p>";
        echo "<p>User ID: {$tokenData['user_id']}, Role: {$tokenData['role']}</p>";
    } else {
        echo "<p style='color: red;'>❌ Token validation failed!</p>";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}

// Test 5: Test a simple query
echo "<h2>5. ✅ Test Query Products</h2>";
try {
    $query = "SELECT COUNT(*) as total FROM Products";
    $stmt = $db->query($query);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p style='color: green;'>✅ <strong>Total Products: {$result['total']}</strong></p>";
    
    if ($result['total'] == 0) {
        echo "<p style='color: orange;'>⚠️ No products in database. Import schema.sql!</p>";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}

// Test 6: Check Orders status values
echo "<h2>6. ✅ Test Orders Schema</h2>";
try {
    $query = "SHOW COLUMNS FROM Orders LIKE 'OrderStatus'";
    $stmt = $db->query($query);
    $column = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($column) {
        echo "<p style='color: green;'>✅ <strong>OrderStatus column found!</strong></p>";
        echo "<p>Type: <code>{$column['Type']}</code></p>";
        
        // Check if it matches our expected values
        $expectedValues = "'pending','confirmed','preparing','shipping','completed','cancelled'";
        if (strpos($column['Type'], 'pending') !== false && strpos($column['Type'], 'completed') !== false) {
            echo "<p style='color: green;'>✅ OrderStatus values are correct!</p>";
        } else {
            echo "<p style='color: red;'>❌ OrderStatus values mismatch!</p>";
            echo "<p>Current: {$column['Type']}</p>";
            echo "<p>Expected: ENUM($expectedValues)</p>";
            echo "<p><strong>FIX:</strong> Import lại database/schema.sql</p>";
        }
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}

echo "<hr>";
echo "<h2>🎯 NEXT STEPS</h2>";
echo "<ol>";
echo "<li>Nếu TẤT CẢ tests đều ✅, vấn đề là ở <strong>JWT token</strong>:
    <ul>
        <li>Đăng nhập lại: <a href='http://localhost/Nhom1_Ca4_CNPM/pages/login/login.html' target='_blank'>Login Page</a></li>
        <li>Username: <code>admin</code>, Password: <code>password</code></li>
    </ul>
</li>";
echo "<li>Nếu có ❌, làm theo hướng dẫn FIX phía trên</li>";
echo "<li>Sau khi fix, reload admin panel: <a href='http://localhost/Nhom1_Ca4_CNPM/admin/admin.html' target='_blank'>Admin Panel</a></li>";
echo "</ol>";

echo "<hr>";
echo "<p><em>Test completed at: " . date('Y-m-d H:i:s') . "</em></p>";
?>

