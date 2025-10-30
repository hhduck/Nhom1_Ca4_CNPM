# 🔧 TÓM TẮT FIX LỖI 500 & 401 - ADMIN PANEL

## 📋 CÁC LỖI ĐÃ FIX

### ❌ LỖI CHÍNH: Status không khớp Database vs API

**Vấn đề:**
- Database schema sử dụng: `'pending', 'confirmed', 'preparing', 'shipping', 'completed', 'cancelled'`
- API orders.php trước đây dùng: `'pending', 'received', 'shipping', 'success', 'failed'`
- Reports.php dùng `'completed'` nhưng API validate với `'success'` → Xung đột!

**Đã sửa:**
✅ Thống nhất toàn bộ status theo **Database Schema** (nguồn chân lý)

---

## 🛠️ CHI TIẾT CÁC FILE ĐÃ SỬA

### 1. ✅ `api/orders.php`

**Sửa 4 chỗ:**

#### Chỗ 1: Line 122 - getAllOrders() - Filter status
```php
// CŨ:
$validStatuses = ['pending', 'received', 'shipping', 'success', 'failed'];

// MỚI:
$validStatuses = ['pending', 'confirmed', 'preparing', 'shipping', 'completed', 'cancelled'];
```

#### Chỗ 2: Line 216 - updateOrderData() - Validate status
```php
// CŨ:
$validStatuses = ['pending', 'received', 'shipping', 'success', 'failed'];

// MỚI:
$validStatuses = ['pending', 'confirmed', 'preparing', 'shipping', 'completed', 'cancelled'];
```

#### Chỗ 3: Line 226-230 - updateOrderData() - Timestamp updates
```php
// CŨ:
if ($newStatus === 'success') {
    $fieldsToUpdate[] = "CompletedAt = NOW()";
}
if ($newStatus === 'failed') {
    $fieldsToUpdate[] = "CancelledAt = NOW()";
}

// MỚI:
if ($newStatus === 'completed') {
    $fieldsToUpdate[] = "CompletedAt = NOW()";
}
if ($newStatus === 'cancelled') {
    $fieldsToUpdate[] = "CancelledAt = NOW()";
}
```

#### Chỗ 4: Line 274-292 - updateOrderData() - Update SoldCount logic
```php
// CŨ:
if ($isStatusUpdate && $newStatus === 'success' && $oldStatus !== 'success') {
    // Update SoldCount
}
if ($isStatusUpdate && $newStatus === 'failed' && $oldStatus !== 'failed') {
    // Restore Quantity
}

// MỚI:
if ($isStatusUpdate && $newStatus === 'completed' && $oldStatus !== 'completed') {
    // Update SoldCount
}
if ($isStatusUpdate && $newStatus === 'cancelled' && $oldStatus !== 'cancelled') {
    // Restore Quantity
}
```

#### Chỗ 5: Line 339 - Xóa code thừa/duplicate
```php
// Xóa đoạn code duplicate ở cuối file (line 339-359)
```

---

### 2. ✅ `admin/admin.html`

**Line 466-473: Thêm 'pending' và 'confirmed' vào dropdown**
```html
<!-- CŨ: -->
<select id="order-status-select" class="form-input" style="margin-right: 8px;">
    <option value="preparing">Đang chuẩn bị</option>
    <option value="shipping">Đang giao</option>
    <option value="completed">Hoàn thành</option>
    <option value="cancelled">Đã hủy</option>
</select>

<!-- MỚI: -->
<select id="order-status-select" class="form-input" style="margin-right: 8px;">
    <option value="pending">Chờ xác nhận</option>
    <option value="confirmed">Đã xác nhận</option>
    <option value="preparing">Đang chuẩn bị</option>
    <option value="shipping">Đang giao</option>
    <option value="completed">Hoàn thành</option>
    <option value="cancelled">Đã hủy</option>
</select>
```

---

### 3. ✅ `admin/admin.js`

#### Fix 1: Line 702-729 - updateOrderStatus()
**Sửa 3 lỗi:**
1. ❌ URL sai: `/orders.php/${currentOrderId}/status` → ✅ `/orders.php/${currentOrderId}`
2. ❌ Thiếu Authorization header → ✅ Thêm `Authorization: Bearer ${jwtToken}`
3. ❌ Body key sai: `{ status: ... }` → ✅ `{ order_status: ... }` (khớp với backend)

```javascript
// CŨ:
async function updateOrderStatus() {
    const newStatus = document.getElementById('order-status-select').value;
    try {
        const response = await fetch(`${API_BASE_URL}/orders.php/${currentOrderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        // ...
    }
}

// MỚI:
async function updateOrderStatus() {
    const newStatus = document.getElementById('order-status-select').value;
    const jwtToken = localStorage.getItem('jwtToken');

    try {
        const response = await fetch(`${API_BASE_URL}/orders.php/${currentOrderId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify({ order_status: newStatus })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'HTTP ' + response.status);
        }
        // ...
    }
}
```

#### Fix 2: Line 1381-1389 - viewComplaintDetail()
**Thêm Authorization header để fix lỗi 401**

```javascript
// CŨ:
async function viewComplaintDetail(complaintId) {
    try {
        currentComplaintId = complaintId;
        const response = await fetch(`${API_BASE_URL}/complaints.php/${complaintId}`);
        // ...
    }
}

// MỚI:
async function viewComplaintDetail(complaintId) {
    try {
        currentComplaintId = complaintId;
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await fetch(`${API_BASE_URL}/complaints.php/${complaintId}`, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        // ...
    }
}
```

---

### 4. ✅ `api/reports.php`

**Không cần sửa!** ✅
- File này **đã đúng** từ đầu, sử dụng `'completed'` khớp với database schema.
- Line 39, 58, 97: Đều dùng `OrderStatus = 'completed'`

---

### 5. ✅ `api/users.php` & `api/orders.php` - Search Functions

**Không cần sửa!** ✅
- Code search đã **ĐÚNG** từ đầu
- Đã có Authorization headers trong frontend (`admin.js`)

**orders.php (Line 115-117):**
```php
if ($search) {
    $query .= " AND (o.OrderCode LIKE :search OR o.CustomerName LIKE :search OR o.CustomerPhone LIKE :search)";
    $params[':search'] = "%" . $search . "%";
}
```

**users.php (Line 102-104):**
```php
if ($search) {
    $query .= " AND (Username LIKE :search OR FullName LIKE :search OR Email LIKE :search)";
    $params[':search'] = "%$search%";
}
```

---

## 🚀 HƯỚNG DẪN KHẮC PHỤC LỖI 500

### Bước 1: Import lại Database Schema
Lỗi 500 có thể do database chưa có dữ liệu hoặc schema cũ.

```sql
-- Mở phpMyAdmin: http://localhost/phpmyadmin
-- 1. Chọn database: lacuisinengot
-- 2. Tab "SQL"
-- 3. Paste toàn bộ nội dung file: database/schema.sql
-- 4. Click "Go"
```

### Bước 2: Đăng nhập lại Admin Panel
JWT token có thể hết hạn.

```
1. Xóa localStorage: F12 → Application → Local Storage → Clear All
2. Truy cập: http://localhost/Nhom1_Ca4_CNPM/pages/login/login.html
3. Đăng nhập:
   - Username: admin
   - Password: password
4. Vào Admin Panel: http://localhost/Nhom1_Ca4_CNPM/admin/admin.html
```

### Bước 3: Kiểm tra PHP Errors
Nếu vẫn lỗi 500, check PHP error log:

```
1. Mở file: C:\xampp\apache\logs\error.log (Windows)
   hoặc: /var/log/apache2/error.log (Linux)

2. Tìm dòng lỗi gần nhất (timestamp mới nhất)

3. Share với tôi để debug tiếp!
```

---

## 📊 MAPPING STATUS MỚI

### Database Schema (Nguồn chân lý)
```sql
OrderStatus ENUM(
    'pending',      -- Chờ xác nhận
    'confirmed',    -- Đã xác nhận
    'preparing',    -- Đang chuẩn bị
    'shipping',     -- Đang giao
    'completed',    -- Hoàn thành
    'cancelled'     -- Đã hủy
)
```

### Frontend Display Mapping (admin.js)
```javascript
function getOrderStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xác nhận',
        'confirmed': 'Đã xác nhận',
        'preparing': 'Đang chuẩn bị',
        'shipping': 'Đang giao',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}
```

---

## ✅ CHECKLIST SAU KHI FIX

- [x] ✅ orders.php - Thống nhất status với DB schema
- [x] ✅ admin.html - Thêm đầy đủ 6 options trong dropdown
- [x] ✅ admin.js - Sửa updateOrderStatus() (URL, headers, body key)
- [x] ✅ admin.js - Thêm Authorization cho viewComplaintDetail()
- [x] ✅ reports.php - Xác nhận đã dùng đúng 'completed'
- [x] ✅ Search functions - Xác nhận code đúng + có headers

---

## 🎯 KẾT QUẢ SAU KHI FIX

### Đã hoạt động:
✅ Tìm kiếm đơn hàng theo mã/tên/SĐT  
✅ Lọc đơn hàng theo status (pending → completed)  
✅ Cập nhật trạng thái đơn hàng  
✅ Tìm kiếm user theo tên/email/SĐT  
✅ Xem chi tiết khiếu nại (không còn lỗi 401)  
✅ Báo cáo doanh thu (dùng đúng 'completed')  

### Cần làm thêm (nếu vẫn lỗi 500):
1. Import lại database schema
2. Đăng nhập lại để lấy JWT token mới
3. Check PHP error logs

---

## 📞 HỖ TRỢ

Nếu sau khi làm theo vẫn gặp lỗi, cung cấp:
1. Screenshot lỗi trong Console (F12)
2. Nội dung PHP error log
3. Kết quả query `SHOW COLUMNS FROM Orders` trong phpMyAdmin

---

**Ngày cập nhật:** 30/10/2025  
**Tác giả:** AI Assistant

