# 🎯 ĐƠN GIẢN HÓA TRẠNG THÁI KHIẾU NẠI - CHỈ CÒN 2 TRẠNG THÁI

## ✅ YÊU CẦU

Giảm từ **5 trạng thái** xuống còn **2 trạng thái** đơn giản hơn:

### ❌ Trước đây (5 trạng thái):
1. `pending` - Chờ xử lý
2. `processing` - Đang xử lý
3. `resolved` - Đã xử lý
4. `closed` - Đã đóng
5. `rejected` - Từ chối

### ✅ Sau khi sửa (2 trạng thái):
1. `pending` - **Chưa xử lý**
2. `resolved` - **Đã xử lý**

---

## 🛠️ CÁC FILE ĐÃ SỬA

### 1. ✅ `admin/admin.html`

#### Fix 1: Filter buttons (Line 372-376)

**Trước:**
```html
<div class="toolbar">
    <button class="tab-btn active" onclick="filterComplaints('all')">Tất cả</button>
    <button class="tab-btn" onclick="filterComplaints('pending')">Đang xử lý</button>
    <button class="tab-btn" onclick="filterComplaints('resolved')">Đã xử lý</button>
    <button class="tab-btn" onclick="filterComplaints('closed')">Đã đóng</button>
</div>
```

**Sau:**
```html
<div class="toolbar">
    <button class="tab-btn active" onclick="filterComplaints('all')">Tất cả</button>
    <button class="tab-btn" onclick="filterComplaints('pending')">Chưa xử lý</button>
    <button class="tab-btn" onclick="filterComplaints('resolved')">Đã xử lý</button>
</div>
```

#### Fix 2: Status dropdown trong modal (Line 541-544)

**Trước:**
```html
<select id="complaint-status-select" class="form-input" style="margin-right: 8px;">
    <option value="pending">Chờ xử lý</option>
    <option value="processing">Đang xử lý</option>
    <option value="resolved">Đã xử lý</option>
    <option value="closed">Đã đóng</option>
</select>
```

**Sau:**
```html
<select id="complaint-status-select" class="form-input" style="margin-right: 8px;">
    <option value="pending">Chưa xử lý</option>
    <option value="resolved">Đã xử lý</option>
</select>
```

---

### 2. ✅ `admin/admin.js`

#### Fix: getComplaintStatusText() function (Line 1616-1622)

**Trước:**
```javascript
function getComplaintStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xử lý',
        'processing': 'Đang xử lý',
        'resolved': 'Đã xử lý',
        'closed': 'Đã đóng',
        'rejected': 'Từ chối'
    };
    return statusMap[status] || status;
}
```

**Sau:**
```javascript
function getComplaintStatusText(status) {
    const statusMap = {
        'pending': 'Chưa xử lý',
        'resolved': 'Đã xử lý'
    };
    return statusMap[status] || status;
}
```

---

### 3. ✅ `api/complaints.php`

#### Fix 1: getAllComplaints() - validStatuses (Line 100-106)

**Trước:**
```php
if ($status) {
    $validStatuses = ['pending', 'processing', 'resolved', 'closed', 'rejected']; 
    if (in_array($status, $validStatuses)) {
        $query .= " AND c.Status = :status";
        $params[':status'] = $status;
    }
}
```

**Sau:**
```php
if ($status) {
    $validStatuses = ['pending', 'resolved']; 
    if (in_array($status, $validStatuses)) {
        $query .= " AND c.Status = :status";
        $params[':status'] = $status;
    }
}
```

#### Fix 2: updateComplaint() - validStatuses (Line 189-200)

**Trước:**
```php
if (isset($data['status'])) {
    $status = sanitizeInput($data['status']);
    $validStatuses = ['pending', 'processing', 'resolved', 'closed', 'rejected'];
    if (!in_array($status, $validStatuses)) {
        throw new Exception("Trạng thái không hợp lệ", 400);
    }
    $fieldsToUpdate[] = "Status = :status";
    $params[':status'] = $status;
    
    if ($status === 'resolved') $fieldsToUpdate[] = "ResolvedAt = NOW()";
    if ($status === 'closed') $fieldsToUpdate[] = "ClosedAt = NOW()";
}
```

**Sau:**
```php
if (isset($data['status'])) {
    $status = sanitizeInput($data['status']);
    $validStatuses = ['pending', 'resolved'];
    if (!in_array($status, $validStatuses)) {
        throw new Exception("Trạng thái không hợp lệ", 400);
    }
    $fieldsToUpdate[] = "Status = :status";
    $params[':status'] = $status;
    
    if ($status === 'resolved') $fieldsToUpdate[] = "ResolvedAt = NOW()";
}
```

---

## 📊 MAPPING MỚI

| Database Value | Display Text | Badge Color |
|----------------|--------------|-------------|
| `pending` | Chưa xử lý | 🟡 Yellow |
| `resolved` | Đã xử lý | 🟢 Green |

---

## 🧪 CÁCH TEST

### Test 1: Hiển thị danh sách
```
1. Vào Admin Panel → "Khiếu nại"
2. Kiểm tra filter buttons:
   ✅ Chỉ có 3 buttons: "Tất cả", "Chưa xử lý", "Đã xử lý"
   ❌ KHÔNG còn: "Đang xử lý", "Đã đóng"
```

### Test 2: Lọc theo trạng thái
```
1. Click "Chưa xử lý" → Chỉ hiển thị khiếu nại pending
2. Click "Đã xử lý" → Chỉ hiển thị khiếu nại resolved
3. Click "Tất cả" → Hiển thị tất cả
```

### Test 3: Cập nhật trạng thái
```
1. Click "Chi tiết" ở bất kỳ khiếu nại nào
2. Modal hiển thị với dropdown chỉ có 2 options:
   ✅ "Chưa xử lý"
   ✅ "Đã xử lý"
3. Chọn "Đã xử lý" → Click "Cập nhật"
4. Trạng thái được cập nhật thành công
```

### Test 4: Badge hiển thị
```
1. Trong danh sách khiếu nại
2. Cột "Trạng thái" hiển thị:
   ✅ "Chưa xử lý" (màu vàng) cho pending
   ✅ "Đã xử lý" (màu xanh) cho resolved
```

---

## ⚠️ LƯU Ý VỀ DATABASE

### Database schema KHÔNG CẦN sửa!

Bảng `Complaints` vẫn có ENUM với 5 giá trị:
```sql
Status ENUM('pending', 'processing', 'resolved', 'closed', 'rejected')
```

**Tại sao không sửa?**
- Giữ tính linh hoạt cho tương lai
- Không làm mất dữ liệu cũ (nếu có khiếu nại với status khác)
- Chỉ giới hạn ở tầng Application (Frontend + API)

**Nếu muốn cleanup database:**
```sql
-- Cập nhật tất cả status cũ sang 2 status mới
UPDATE Complaints SET Status = 'resolved' WHERE Status IN ('processing', 'closed');
UPDATE Complaints SET Status = 'pending' WHERE Status = 'rejected';

-- SAU ĐÓ mới alter table (không bắt buộc)
ALTER TABLE Complaints MODIFY Status ENUM('pending', 'resolved') DEFAULT 'pending';
```

---

## ✅ CHECKLIST

- [x] ✅ Sửa HTML - Filter buttons (chỉ còn 2)
- [x] ✅ Sửa HTML - Modal dropdown (chỉ còn 2)
- [x] ✅ Sửa JS - getComplaintStatusText()
- [x] ✅ Sửa API - getAllComplaints() validStatuses
- [x] ✅ Sửa API - updateComplaint() validStatuses
- [x] ✅ Xóa logic cho 'closed' status
- [ ] 🔄 Test hiển thị danh sách
- [ ] 🔄 Test filter theo trạng thái
- [ ] 🔄 Test cập nhật trạng thái

---

## 📝 TÓM TẮT

**Thay đổi:**
- ❌ Xóa 3 trạng thái: `processing`, `closed`, `rejected`
- ✅ Giữ lại 2 trạng thái: `pending`, `resolved`
- ✅ Đổi text: "Chờ xử lý" → **"Chưa xử lý"**
- ✅ Giữ nguyên: "Đã xử lý"

**Files đã sửa:**
1. `admin/admin.html` - 2 chỗ
2. `admin/admin.js` - 1 function
3. `api/complaints.php` - 2 chỗ

**Database:** KHÔNG SỬA (giữ nguyên linh hoạt)

---

**Ngày sửa:** 30/10/2025  
**Trạng thái:** ✅ **HOÀN TẤT**

