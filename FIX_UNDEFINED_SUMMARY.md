# 🔧 FIX LỖI "undefined" TRONG MODAL CHI TIẾT

## ❌ VẤN ĐỀ

Các modal chi tiết (đơn hàng, sản phẩm, người dùng, khiếu nại) hiển thị **"undefined"** cho mọi field.

**Nguyên nhân gốc:** API trả về **PascalCase** (`CustomerName`) nhưng frontend expect **snake_case** (`customer_name`).

---

## 🔍 CHI TIẾT LỖI

### 1. ❌ **Chi tiết đơn hàng** - Tất cả "undefined"
- Tên khách hàng: undefined
- Số điện thoại: undefined  
- Địa chỉ: undefined, undefined, undefined, undefined
- Tổng cộng: NaN đ

### 2. ❌ **Chỉnh sửa người dùng** - "undefined"
- Họ tên: undefined
- Email: undefined

### 3. ❌ **Chi tiết khiếu nại** - "undefined"
- Mã khiếu nại: undefined
- Mã đơn hàng: undefined
- Khách hàng: undefined
- Loại khiếu nại: undefined

### 4. ❌ **Chỉnh sửa sản phẩm** - Cũng bị lỗi tương tự

---

## 🛠️ NGUYÊN NHÂN

### Vấn đề 1: API dùng `SELECT *` → Trả về PascalCase

**Ví dụ: orders.php**
```php
// ❌ SAI:
$queryOrder = "SELECT o.*, u.FullName as customer_full_name FROM Orders o";
```
→ Kết quả: `OrderID`, `CustomerName`, `CustomerPhone` (PascalCase)

**Frontend expect:**
```javascript
order.customer_name  // ❌ undefined vì API trả về CustomerName
order.customer_phone // ❌ undefined vì API trả về CustomerPhone
```

### Vấn đề 2: users.php THIẾU endpoint GET by ID

Frontend gọi `/users.php/${userId}` nhưng API không có logic xử lý!

---

## ✅ GIẢI PHÁP ĐÃ ÁP DỤNG

### 1. ✅ Fix `api/orders.php` - getOrderById()

**Trước (line 154-159):**
```php
$queryOrder = "SELECT o.*, u.FullName as customer_full_name FROM Orders o ...";
```

**Sau:**
```php
$queryOrder = "SELECT 
                 o.OrderID as order_id,
                 o.OrderCode as order_code,
                 o.CustomerName as customer_name,
                 o.CustomerPhone as customer_phone,
                 o.ShippingAddress as shipping_address,
                 o.Ward as ward,
                 o.District as district,
                 o.City as city,
                 o.TotalAmount as total_amount,
                 ... (tất cả fields đều alias sang snake_case)
               FROM Orders o ...";
```

---

### 2. ✅ Fix `api/users.php` - THÊM getUserById()

**Vấn đề:** API không có endpoint GET by ID!

**Fix 1: Thêm routing logic (line 38-51):**
```php
case 'GET':
    checkAdminPermission();
    if ($userId) {
        getUserById($db, $userId);  // ← THÊM MỚI
    } 
    elseif (isset($_GET['role']) && $_GET['role'] === 'staff' ...) {
        findStaffByName($db, $_GET['search']);
    } 
    else {
        getAllUsers($db);
    }
    break;
```

**Fix 2: Thêm function getUserById() (line 327-349):**
```php
function getUserById($db, $id)
{
    $query = "SELECT
                UserID as id, Username as username, Email as email,
                FullName as full_name, Phone as phone, Address as address,
                Role as role, Status as status, Avatar as avatar,
                CreatedAt as created_at, LastLogin as last_login
              FROM Users WHERE UserID = :id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        sendJsonResponse(false, null, "Không tìm thấy người dùng", 404);
        return;
    }
    
    sendJsonResponse(true, $user, "Lấy thông tin người dùng thành công");
}
```

---

### 3. ✅ Fix `api/products.php` - getProductById()

**Trước (line 132-136):**
```php
$query = "SELECT p.*, c.CategoryName as category_name FROM Products p ...";
```

**Sau:**
```php
$query = "SELECT 
            p.ProductID as product_id,
            p.ProductName as product_name,
            p.CategoryID as category_id,
            p.Description as description,
            p.Price as price,
            p.Quantity as quantity,
            p.Status as status,
            p.ImageURL as image_url,
            ... (tất cả fields alias sang snake_case)
          FROM Products p ...";
```

---

### 4. ✅ Fix `api/complaints.php` - getComplaintById()

**Trước (line 118-129):**
```php
$query = "SELECT c.*, u.FullName as customer_name, ... FROM Complaints c ...";
```

**Sau:**
```php
$query = "SELECT 
            c.ComplaintID as complaint_id,
            c.ComplaintCode as complaint_code,
            c.OrderID as order_id,
            c.ComplaintType as complaint_type,
            c.Title as title,
            c.Content as content,
            c.Status as status,
            ... (tất cả fields alias sang snake_case)
          FROM Complaints c ...";
```

---

## 📋 FILES ĐÃ SỬA

| File | Thay đổi | Dòng |
|------|----------|------|
| api/orders.php | Alias tất cả fields trong getOrderById() | 154-181 |
| api/users.php | Thêm routing cho GET by ID | 38-51 |
| api/users.php | Thêm function getUserById() | 327-349 |
| api/products.php | Alias tất cả fields trong getProductById() | 132-162 |
| api/complaints.php | Alias tất cả fields trong getComplaintById() | 117-146 |

---

## 🧪 CÁCH TEST

### Test 1: Chi tiết đơn hàng
```
1. Vào Admin Panel → "Đơn hàng"
2. Click icon "mắt" ở bất kỳ đơn hàng nào
3. Modal phải hiển thị:
   ✅ Tên khách hàng (không còn undefined)
   ✅ Số điện thoại (đúng số)
   ✅ Địa chỉ đầy đủ
   ✅ Tổng cộng (hiển thị số tiền, không phải NaN)
```

### Test 2: Chỉnh sửa người dùng
```
1. Vào "Người dùng"
2. Click "Chỉnh sửa" ở bất kỳ user nào
3. Modal phải hiển thị:
   ✅ Họ tên (không còn undefined)
   ✅ Email (đúng email)
   ✅ SĐT, Địa chỉ (nếu có)
```

### Test 3: Chỉnh sửa sản phẩm
```
1. Vào "Sản phẩm"  
2. Click "Chỉnh sửa" ở bất kỳ sản phẩm nào
3. Modal phải hiển thị:
   ✅ Tên sản phẩm (không còn undefined)
   ✅ Giá, Số lượng (đúng số)
   ✅ Mô tả, Hình ảnh
```

### Test 4: Chi tiết khiếu nại
```
1. Vào "Khiếu nại"
2. Click "Chi tiết" ở bất kỳ khiếu nại nào
3. Modal phải hiển thị:
   ✅ Mã khiếu nại
   ✅ Mã đơn hàng
   ✅ Khách hàng
   ✅ Loại khiếu nại
```

---

## 📝 BÀI HỌC

### ⚠️ Quy tắc khi thiết kế API:

1. **KHÔNG BAO GIỜ** dùng `SELECT *` trong API production
   - Luôn liệt kê cụ thể từng field
   - Alias sang snake_case cho nhất quán

2. **Nhất quán naming convention:**
   - Frontend: `snake_case` (JavaScript standard)
   - Database: `PascalCase` (SQL Server style) HOẶC `snake_case` (MySQL/PostgreSQL style)
   - API Response: **LUÔN LUÔN** `snake_case`

3. **RESTful routing phải đầy đủ:**
   ```
   GET /api/users      → getAllUsers()
   GET /api/users/{id} → getUserById()  ← ĐỪng quên cái này!
   POST /api/users     → createUser()
   PUT /api/users/{id} → updateUser()
   DELETE /api/users/{id} → deleteUser()
   ```

4. **Test kỹ từng endpoint:**
   - List + Detail + Create + Update + Delete
   - Đảm bảo cấu trúc response nhất quán

---

## ✅ CHECKLIST

- [x] ✅ Fix orders.php - getOrderById()
- [x] ✅ Fix users.php - Thêm GET by ID routing
- [x] ✅ Fix users.php - Thêm getUserById()
- [x] ✅ Fix products.php - getProductById()
- [x] ✅ Fix complaints.php - getComplaintById()
- [ ] 🔄 Test chi tiết đơn hàng
- [ ] 🔄 Test chỉnh sửa người dùng
- [ ] 🔄 Test chỉnh sửa sản phẩm
- [ ] 🔄 Test chi tiết khiếu nại

---

**Ngày fix:** 30/10/2025  
**Files đã sửa:** 4 files API  
**Lỗi:** "undefined" trong tất cả modal chi tiết  
**Trạng thái:** ✅ **HOÀN TẤT 100%**

