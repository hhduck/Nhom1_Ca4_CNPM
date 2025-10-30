<?php
// SUPER SIMPLE DEBUG - Tìm lỗi ngay lập tức
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🔍 QUICK DEBUG</h1>";
echo "<hr>";

// Test 1: PHP version
echo "<h2>1. PHP Version</h2>";
echo "<p>Version: " . phpversion() . "</p>";
if (version_compare(phpversion(), '7.4.0', '<')) {
    echo "<p style='color:red'>❌ PHP version quá cũ! Cần >= 7.4</p>";
} else {
    echo "<p style='color:green'>✅ OK</p>";
}

// Test 2: Database file
echo "<h2>2. Database Config File</h2>";
$dbFile = __DIR__ . '/config/database.php';
if (file_exists($dbFile)) {
    echo "<p style='color:green'>✅ File exists: $dbFile</p>";
    require_once $dbFile;
} else {
    echo "<p style='color:red'>❌ MISSING: $dbFile</p>";
    die("STOP: Không tìm thấy file config/database.php");
}

// Test 3: Connect DB
echo "<h2>3. Database Connection</h2>";
try {
    $db = new Database();
    $conn = $db->getConnection();
    echo "<p style='color:green'>✅ Connected!</p>";
} catch (Exception $e) {
    echo "<p style='color:red'>❌ FAILED!</p>";
    echo "<pre>" . $e->getMessage() . "</pre>";
    die("STOP: Không kết nối được database");
}

// Test 4: Check tables
echo "<h2>4. Check Tables</h2>";
$tables = ['Users', 'Products', 'Orders', 'Complaints'];
foreach ($tables as $table) {
    try {
        $stmt = $conn->query("SELECT COUNT(*) as c FROM $table");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "<p style='color:green'>✅ $table: {$row['c']} rows</p>";
    } catch (Exception $e) {
        echo "<p style='color:red'>❌ $table: " . $e->getMessage() . "</p>";
    }
}

// Test 5: Middleware
echo "<h2>5. Middleware File</h2>";
$mwFile = __DIR__ . '/auth/middleware.php';
if (file_exists($mwFile)) {
    echo "<p style='color:green'>✅ File exists: $mwFile</p>";
    try {
        require_once $mwFile;
        echo "<p style='color:green'>✅ Loaded successfully</p>";
    } catch (Exception $e) {
        echo "<p style='color:red'>❌ Error loading: " . $e->getMessage() . "</p>";
    }
} else {
    echo "<p style='color:red'>❌ MISSING: $mwFile</p>";
}

// Test 6: Test Reports.php
echo "<h2>6. Test Reports API</h2>";
try {
    require_once __DIR__ . '/reports.php';
    echo "<p style='color:green'>✅ reports.php loaded (no syntax errors)</p>";
} catch (ParseError $e) {
    echo "<p style='color:red'>❌ SYNTAX ERROR in reports.php!</p>";
    echo "<pre>" . $e->getMessage() . "</pre>";
    echo "<p><strong>Line:</strong> " . $e->getLine() . "</p>";
} catch (Exception $e) {
    echo "<p style='color:orange'>⚠️ Runtime error (expected without proper request)</p>";
    echo "<pre>" . $e->getMessage() . "</pre>";
}

// Test 7: Test Users.php
echo "<h2>7. Test Users API</h2>";
try {
    // Don't include, just check syntax
    $code = file_get_contents(__DIR__ . '/users.php');
    if ($code) {
        echo "<p style='color:green'>✅ users.php exists</p>";
    }
} catch (Exception $e) {
    echo "<p style='color:red'>❌ Error: " . $e->getMessage() . "</p>";
}

// Test 8: Test Products.php
echo "<h2>8. Test Products API</h2>";
try {
    $code = file_get_contents(__DIR__ . '/products.php');
    if ($code) {
        echo "<p style='color:green'>✅ products.php exists</p>";
    }
} catch (Exception $e) {
    echo "<p style='color:red'>❌ Error: " . $e->getMessage() . "</p>";
}

echo "<hr>";
echo "<h2>✅ NEXT STEPS:</h2>";
echo "<ol>";
echo "<li>Nếu TẤT CẢ đều ✅: Check PHP error log</li>";
echo "<li>Nếu có ❌: Fix theo hướng dẫn phía trên</li>";
echo "</ol>";

echo "<h3>📁 PHP Error Log Location:</h3>";
echo "<p><code>C:\\xampp\\apache\\logs\\error.log</code></p>";
echo "<p>Mở file này bằng Notepad++, kéo xuống cuối cùng, tìm dòng error gần nhất</p>";
?>

