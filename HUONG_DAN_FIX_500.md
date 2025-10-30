# 🚨 HƯỚNG DẪN FIX LỖI 500 & 401 - KHẨN CẤP

## 📊 TÌNH TRẠNG HIỆN TẠI

Bạn đang gặp **2 LOẠI LỖI**:

### ❌ Lỗi 500 (Internal Server Error)
- `/api/products.php?search=...` 
- `/api/users.php?search=...`
- `/api/reports.php?period=...`
- `/api/complaints.php?search=...`

### ❌ Lỗi 401 (Unauthorized)  
- `/api/orders.php/4` - Xem chi tiết đơn hàng

---

## 🎯 NGUYÊN NHÂN CHÍNH

### 1. **JWT Token không hợp lệ hoặc hết hạn** (90% khả năng)
- Token được lưu trong `localStorage` có thể đã expire
- Hoặc bạn chưa đăng nhập

### 2. **Database chưa được import** (10% khả năng)
- Bảng không tồn tại
- Schema không khớp với code

---

## ✅ GIẢI PHÁP - LÀM THEO THỨ TỰ

### **BƯỚC 1: Chạy Test API** ⭐⭐⭐ (QUAN TRỌNG NHẤT)

```
URL: http://localhost/Nhom1_Ca4_CNPM/api/test_api.php
```

**Kết quả mong đợi:**
- ✅ Database Connected Successfully
- ✅ All tables exist
- ✅ Admin account found
- ✅ Middleware loaded

**Nếu thấy ❌:**
- Làm theo hướng dẫn FIX trong trang test
- Import lại `database/schema.sql`

---

### **BƯỚC 2: Xóa Cache và Đăng nhập lại** ⭐⭐⭐

#### 2.1. Xóa localStorage
```
1. Mở Admin Panel: http://localhost/Nhom1_Ca4_CNPM/admin/admin.html
2. Nhấn F12 (DevTools)
3. Tab "Application" (hoặc "Ứng dụng")
4. Bên trái: "Local Storage" → "http://localhost"
5. Click chuột phải → "Clear"
```

#### 2.2. Đăng nhập lại
```
1. Đến: http://localhost/Nhom1_Ca4_CNPM/pages/login/login.html
2. Nhập:
   - Username: admin
   - Password: password
3. Click "Đăng nhập"
```

#### 2.3. Kiểm tra Token
```
1. Sau khi đăng nhập, nhấn F12
2. Tab "Console"
3. Gõ: localStorage.getItem('jwtToken')
4. Phải thấy một chuỗi token (không phải null)
```

---

### **BƯỚC 3: Test từng tính năng**

#### 3.1. Test Products
```
1. Vào Admin Panel → "Sản phẩm"
2. Thử tìm kiếm: "Orange"
3. Không thấy lỗi 500 → ✅ OK
```

#### 3.2. Test Orders
```
1. Vào "Đơn hàng"
2. Click icon "mắt" ở bất kỳ đơn hàng nào
3. Modal hiện chi tiết → ✅ OK
4. Không thấy lỗi 401 → ✅ OK
```

#### 3.3. Test Users
```
1. Vào "Người dùng"
2. Thử search: "0902345678"
3. Hiện kết quả → ✅ OK
```

#### 3.4. Test Reports
```
1. Vào "Báo cáo"
2. Chọn tháng/năm bất kỳ
3. Charts hiện dữ liệu → ✅ OK
```

---

## 🔧 FIXES ĐÃ ÁP DỤNG

### Fix 1: ✅ Thêm Authorization header cho `viewOrderDetail()`
**File:** `admin/admin.js` (line 626-638)

```javascript
// TRƯỚC:
const response = await fetch(`${API_BASE_URL}/orders.php/${orderId}`);

// SAU:
const jwtToken = localStorage.getItem('jwtToken');
const response = await fetch(`${API_BASE_URL}/orders.php/${orderId}`, {
    headers: {
        'Authorization': `Bearer ${jwtToken}`
    }
});
```

### Fix 2: ✅ Thống nhất OrderStatus
**File:** `api/orders.php`

```php
// Database ENUM: 'pending','confirmed','preparing','shipping','completed','cancelled'
// API đã được update để match 100%
```

---

## 🆘 NẾU VẪN LỖI 500

### Kiểm tra PHP Error Log

**Windows (XAMPP):**
```
C:\xampp\apache\logs\error.log
```

**Cách đọc:**
1. Mở file bằng Notepad++
2. Cuộn xuống cuối (Ctrl + End)
3. Tìm dòng có timestamp gần nhất
4. Copy toàn bộ error message
5. Gửi cho tôi để debug

**Ví dụ lỗi thường gặp:**
```
[30-Oct-2025 10:30:45] PHP Fatal error: Uncaught PDOException: SQLSTATE[42S02]: Base table or view not found...
→ FIX: Import lại database/schema.sql

[30-Oct-2025 10:31:12] PHP Fatal error: Call to undefined function checkAdminPermission()
→ FIX: Kiểm tra file api/auth/middleware.php
```

---

## 📋 CHECKLIST HOÀN CHỈNH

- [ ] Chạy test API: `http://localhost/Nhom1_Ca4_CNPM/api/test_api.php`
- [ ] Tất cả tests đều ✅ trong trang test
- [ ] Xóa localStorage (F12 → Application → Clear)
- [ ] Đăng nhập lại với `admin / password`
- [ ] Kiểm tra `localStorage.getItem('jwtToken')` không null
- [ ] Test tìm kiếm sản phẩm → Không lỗi 500
- [ ] Test xem chi tiết đơn hàng → Không lỗi 401
- [ ] Test tìm kiếm user → Không lỗi 500
- [ ] Test báo cáo → Charts hiện dữ liệu

---

## 🔍 DEBUG NÂNG CAO

### Nếu bạn biết MySQL:

```sql
-- Kiểm tra OrderStatus values
SHOW COLUMNS FROM Orders LIKE 'OrderStatus';

-- Kết quả mong đợi:
-- Type: enum('pending','confirmed','preparing','shipping','completed','cancelled')

-- Nếu sai, chạy lại schema:
SOURCE D:/Hoc_tap/Lap_trinh_PHP/htdocs/Nhom1_Ca4_CNPM/database/schema.sql;
```

---

## 📞 CẦN HỖ TRỢ THÊM?

Nếu sau khi làm TẤT CẢ các bước trên vẫn lỗi, cung cấp:

1. **Screenshot kết quả** từ `test_api.php`
2. **Nội dung PHP error log** (10 dòng cuối)
3. **Screenshot Console** khi gặp lỗi (F12 → Console)
4. **Kết quả query:**
   ```sql
   SHOW TABLES;
   SELECT * FROM Users WHERE Role = 'admin';
   ```

---

## ⚡ TÓM TẮT 3 BƯỚC NHANH

```
1. Chạy: http://localhost/Nhom1_Ca4_CNPM/api/test_api.php
   → Xem kết quả

2. F12 → Application → Local Storage → Clear All
   → Đăng nhập lại: admin / password

3. Test lại tất cả tính năng
   → Báo cáo kết quả
```

---

**Cập nhật:** 30/10/2025  
**Tác giả:** AI Assistant  
**Ưu tiên:** 🔴 KHẨN CẤP

