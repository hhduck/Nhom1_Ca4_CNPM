# 📚 HƯỚNG DẪN IMPORT DATABASE - CHI TIẾT

## ⚡ CÁCH NHANH NHẤT (Recommended)

### Bước 1: Mở phpMyAdmin
```
URL: http://localhost/phpmyadmin
```

### Bước 2: Tạo/Chọn Database
1. Click tab **"Databases"** (hoặc "Cơ sở dữ liệu")
2. Tìm ô **"Create database"** (Tạo cơ sở dữ liệu mới)
3. Nhập tên: `lacuisinengot`
4. Collation: `utf8mb4_general_ci`
5. Click **"Create"**

### Bước 3: Import Schema
1. Bên trái, click vào database `lacuisinengot` (vừa tạo)
2. Click tab **"Import"** (hoặc "Nhập")
3. Click nút **"Choose File"** (Chọn tệp)
4. Tìm đến file:
   ```
   D:\Hoc_tap\Lap_trinh_PHP\htdocs\Nhom1_Ca4_CNPM\database\schema.sql
   ```
5. **QUAN TRỌNG:** 
   - ✅ Tick: "Partial import" → "Allow interrupt" (nếu có)
   - ✅ Character set: `utf8`
6. Click nút **"Go"** (hoặc "Thực hiện") ở cuối trang
7. Chờ 5-10 giây
8. Thấy thông báo **"Import has been successfully finished"** → ✅ XONG!

### Bước 4: Kiểm tra
1. Click vào database `lacuisinengot` bên trái
2. Phải thấy các bảng:
   - ✅ Categories
   - ✅ Complaints
   - ✅ ComplaintResponses
   - ✅ Favorites
   - ✅ OrderItems
   - ✅ Orders
   - ✅ OrderStatusHistory
   - ✅ Products
   - ✅ Promotions
   - ✅ PromotionUsage
   - ✅ Reviews
   - ✅ ShoppingCart
   - ✅ Users

3. Click vào bảng **"Users"**
4. Click tab **"Browse"** (hoặc "Duyệt")
5. Phải thấy ít nhất 1 user có `Role = 'admin'`

---

## 🔄 CÁCH 2: Dùng MySQL Command Line

Nếu cách 1 bị lỗi, thử cách này:

### Bước 1: Mở Command Prompt
```
Windows + R → gõ: cmd → Enter
```

### Bước 2: Vào thư mục MySQL
```bash
cd C:\xampp\mysql\bin
```

### Bước 3: Đăng nhập MySQL
```bash
mysql -u root -p
```
(Nếu hỏi password, nhấn Enter - mặc định không có password)

### Bước 4: Tạo Database
```sql
CREATE DATABASE IF NOT EXISTS lacuisinengot CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE lacuisinengot;
```

### Bước 5: Import File
```sql
SOURCE D:/Hoc_tap/Lap_trinh_PHP/htdocs/Nhom1_Ca4_CNPM/database/schema.sql;
```

**LưU Ý:** Dùng dấu `/` (forward slash), KHÔNG phải `\` (backslash)!

### Bước 6: Kiểm tra
```sql
SHOW TABLES;
SELECT * FROM Users WHERE Role = 'admin';
```

Phải thấy danh sách bảng và ít nhất 1 admin user.

---

## ❌ LỖI THƯỜNG GẶP

### Lỗi 1: "Access denied for user 'root'@'localhost'"
**Nguyên nhân:** Password root không đúng

**Fix:**
1. Mở: `C:\xampp\phpMyAdmin\config.inc.php`
2. Tìm dòng:
   ```php
   $cfg['Servers'][$i]['password'] = '';
   ```
3. Thay `''` bằng password của bạn (nếu có)
4. Lưu file
5. Thử lại

### Lỗi 2: "Database lacuisinengot already exists"
**Nguyên nhân:** Database đã tồn tại nhưng có thể thiếu bảng

**Fix:**
1. Vào phpMyAdmin
2. Click vào `lacuisinengot` bên trái
3. Click tab "Operations"
4. Cuộn xuống "Remove database" (Xóa cơ sở dữ liệu)
5. Click "Drop the database (DROP)" → Confirm
6. Làm lại từ đầu

### Lỗi 3: "Unknown database 'lacuisinengot'"
**Nguyên nhân:** Database chưa được tạo

**Fix:** Làm theo Bước 2 ở trên (Tạo database trước)

### Lỗi 4: Import file quá lớn
**Nguyên nhân:** `upload_max_filesize` quá nhỏ

**Fix:**
1. Mở: `C:\xampp\php\php.ini`
2. Tìm và sửa:
   ```ini
   upload_max_filesize = 128M
   post_max_size = 128M
   max_execution_time = 300
   ```
3. Lưu file
4. Restart Apache trong XAMPP Control Panel
5. Thử import lại

---

## ✅ SAU KHI IMPORT XONG

### 1. Chạy lại debug:
```
http://localhost/Nhom1_Ca4_CNPM/api/debug.php
```
→ Tất cả phải ✅

### 2. Đăng nhập lại Admin:
```
1. Xóa localStorage (F12 → Application → Clear)
2. Login: http://localhost/Nhom1_Ca4_CNPM/pages/login/login.html
   - Username: admin
   - Password: password
3. Vào Admin Panel
```

### 3. Test các tính năng:
- ✅ Sản phẩm: Tìm kiếm "Orange"
- ✅ Đơn hàng: Xem chi tiết
- ✅ User: Tìm kiếm "0901234567"
- ✅ Báo cáo: Chọn tháng/năm bất kỳ

---

## 📞 VẪN LỖI?

Gửi cho tôi:
1. Screenshot kết quả từ `debug.php`
2. Screenshot danh sách bảng trong phpMyAdmin
3. 20 dòng cuối của file `C:\xampp\apache\logs\error.log`

---

**Cập nhật:** 30/10/2025  
**Độ ưu tiên:** 🔴 CRITICAL

