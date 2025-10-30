# 🔧 FIX LỖI HY093 - REPORTS API

## ❌ LỖI PHÁT HIỆN

```
[Thu Oct 30 19:29:37] Reports API Error: SQLSTATE[HY093]: Invalid parameter number
```

---

## 🔍 NGUYÊN NHÂN

**File:** `api/reports.php` (Line 38-49)

**Vấn đề:** SQL query có **2 lần** sử dụng placeholder `:start_date`:

```sql
SELECT 
    ...,
    (SELECT COUNT(*) FROM Users WHERE ... CreatedAt >= :start_date) as new_customers
FROM Orders
WHERE CreatedAt >= :start_date
```

Nhưng chỉ `bindParam` **1 LẦN**:

```php
$stmt->bindParam(':start_date', $startDate);  // ❌ Thiếu 1 lần bind!
```

PDO yêu cầu mỗi placeholder phải được bind riêng biệt, ngay cả khi cùng tên.

---

## ✅ GIẢI PHÁP

Đổi tên placeholder thành **khác nhau**:

### TRƯỚC (Lỗi):
```php
$statsQuery = "SELECT 
                ...,
                (SELECT COUNT(*) FROM Users WHERE ... CreatedAt >= :start_date) as new_customers
               FROM Orders
               WHERE CreatedAt >= :start_date";

$stmt = $db->prepare($statsQuery);
$stmt->bindParam(':start_date', $startDate);  // ❌ THIẾU 1 BIND!
$stmt->execute();
```

### SAU (Fixed):
```php
$statsQuery = "SELECT 
                ...,
                (SELECT COUNT(*) FROM Users WHERE ... CreatedAt >= :start_date1) as new_customers
               FROM Orders
               WHERE CreatedAt >= :start_date2";

$stmt = $db->prepare($statsQuery);
$stmt->bindParam(':start_date1', $startDate);  // ✅
$stmt->bindParam(':start_date2', $startDate);  // ✅
$stmt->execute();
```

---

## ✅ ĐÃ FIX

**File:** `api/reports.php`  
**Line:** 38-49  
**Status:** ✅ **HOÀN THÀNH**

---

## 🧪 CÁCH TEST

### 1. Test Reports API trực tiếp:
```
http://localhost/Nhom1_Ca4_CNPM/api/reports.php?period=month
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "data": {
    "revenue": "...",
    "total_orders": 5,
    "delivered_orders": 3,
    "new_customers": 12,
    "top_products": [...],
    "chart_data": {...}
  },
  "message": "Lấy báo cáo thành công"
}
```

### 2. Test trong Admin Panel:
1. Đăng nhập: `http://localhost/Nhom1_Ca4_CNPM/admin/admin.html`
2. Click menu **"Báo cáo"**
3. Chọn tháng/năm bất kỳ
4. Charts phải hiển thị dữ liệu
5. ✅ **Không còn lỗi 500!**

### 3. Kiểm tra PHP Error Log:
```
C:\xampp\apache\logs\error.log
```
→ **Không thấy** thông báo `Reports API Error: SQLSTATE[HY093]`

---

## 📋 KIỂM TRA CÁC API KHÁC

Đã kiểm tra tất cả API còn lại:

- ✅ **users.php** - OK (dùng `$params` array)
- ✅ **products.php** - OK (dùng `$params` array)  
- ✅ **orders.php** - OK (dùng `$params` array)
- ✅ **complaints.php** - OK (dùng `$params` array)
- ✅ **promotions.php** - OK (dùng `$params` array)

**Kết luận:** Chỉ có `reports.php` gặp lỗi này.

---

## 🎯 LỖI TƯƠNG TỰ ĐÃ FIX TRƯỚC ĐÓ

**File:** `api/complaints.php` (đã fix trong lần trước)

**Lỗi tương tự:**
- Có nhiều placeholder trong query nhưng quên bind
- Hoặc bind sai tên parameter

**Fix:** Đảm bảo mọi placeholder đều được bind đúng tên.

---

## 📝 BÀI HỌC

### ⚠️ Quy tắc khi dùng PDO Prepared Statements:

1. **MỖI placeholder** (`:param`) phải được bind riêng biệt
2. Nếu dùng **cùng tên 2 lần** trong 1 query → Phải đổi tên hoặc bind 2 lần
3. **Tốt nhất:** Dùng `$params` array thay vì `bindParam`:

```php
// ✅ CÁCH TỐT (dùng array):
$params = [':start_date' => $startDate];
$stmt->execute($params);

// ⚠️ CÁCH XỬA (phải bind từng cái):
$stmt->bindParam(':start_date', $startDate);
$stmt->execute();
```

4. **Debugging:** Nếu gặp lỗi HY093:
   - Count số lượng `:param` trong query
   - Count số lượng `bindParam()` hoặc keys trong `$params`
   - Đảm bảo **khớp 100%**

---

## ✅ CHECKLIST SAU KHI FIX

- [x] ✅ Fix `reports.php` line 38-49
- [x] ✅ Kiểm tra các API khác (không có lỗi tương tự)
- [ ] 🔄 Test API trực tiếp: `reports.php?period=month`
- [ ] 🔄 Test Admin Panel → Báo cáo
- [ ] 🔄 Kiểm tra error log (không còn HY093)

---

## 🆘 NẾU VẪN LỖI

Nếu sau khi fix vẫn thấy lỗi HY093, cung cấp:

1. **Error message đầy đủ** từ PHP error log
2. **Line number** cụ thể
3. **API endpoint** đang gọi (URL đầy đủ)

---

**Ngày fix:** 30/10/2025  
**File đã sửa:** `api/reports.php`  
**Lỗi:** `SQLSTATE[HY093]: Invalid parameter number`  
**Trạng thái:** ✅ **HOÀN THÀNH**

