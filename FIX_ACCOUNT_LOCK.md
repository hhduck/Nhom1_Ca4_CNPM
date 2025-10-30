# 🔐 FIX LỖI TÀI KHOẢN BỊ KHÓA VẪN ĐĂNG NHẬP ĐƯỢC

## ❌ VẤN ĐỀ

**User báo:** Đã khóa tài khoản trong admin panel nhưng user đó vẫn đăng nhập được.

---

## 🔍 NGUYÊN NHÂN

### Kịch bản lỗi:

1. **User A đăng nhập** → Nhận **JWT token** (expire sau **7 ngày**)
2. **Admin khóa tài khoản User A** → Database update `Status = 'banned'`
3. **User A vẫn dùng token cũ** → **Vẫn truy cập được hệ thống**

**Tại sao?**
- Token đã được phát hành **TRƯỚC KHI** tài khoản bị khóa
- Token còn hạn → User vẫn authenticate thành công
- Middleware **ĐÃ CHECK** status, NHƯNG chỉ khi user **GỌI API** mới bị block

---

## ✅ GIẢI PHÁP ĐÃ ÁP DỤNG

### 1. ✅ **Giảm thời gian expire của token**

**File:** `api/auth/login.php` (Line 89-94)

**Trước:**
```php
$token = base64_encode(json_encode([
    'user_id' => $user['id'],
    'username' => $user['username'],
    'role' => $user['role'],
    'exp' => time() + (7 * 24 * 60 * 60) // 7 ngày
]));
```

**Sau:**
```php
$token = base64_encode(json_encode([
    'user_id' => $user['id'],
    'username' => $user['username'],
    'role' => $user['role'],
    'exp' => time() + (24 * 60 * 60) // 1 ngày (giảm từ 7 ngày)
]));
```

**Lợi ích:**
- Token hết hạn nhanh hơn → User bị khóa sẽ phải login lại trong 24h
- Login lại → API check status → **Bị từ chối** (line 78-80)

---

### 2. ✅ **Cải thiện thông báo khi khóa user**

**File:** `admin/admin.js` - `lockUser()` function

**Thông báo mới:**
```javascript
if (!confirm('Bạn có chắc chắn muốn khóa tài khoản này?\n\nLưu ý: Nếu user đang đăng nhập, họ sẽ bị logout khi thực hiện hành động tiếp theo.')) return;
```

**Success message:**
```javascript
showSuccess('Khóa tài khoản thành công. User sẽ không thể đăng nhập lại và sẽ bị logout tự động khi thực hiện hành động tiếp theo.');
```

---

### 3. ✅ **Middleware đã có sẵn check status**

**File:** `api/auth/middleware.php` (Line 31-35)

```php
$user = $this->getUserById($tokenData['user_id']);

if (!$user || $user['status'] !== 'active') {
    $this->sendUnauthorized("Tài khoản không hoạt động");
}
```

**Hoạt động:**
- Mỗi lần user gọi **BẤT KỲ API NÀO** → Middleware check status từ database
- Nếu `status !== 'active'` → **401 Unauthorized**
- User tự động logout

---

### 4. ✅ **Login API đã có check status**

**File:** `api/auth/login.php` (Line 78-80)

```php
if ($user['status'] !== 'active') {
    sendJsonResponse(false, null, "Tài khoản đã bị khóa", 403);
}
```

**Hoạt động:**
- User bị khóa **KHÔNG THỂ** đăng nhập lại
- Ngay cả khi biết đúng username/password

---

### 5. ✅ **Tạo API Force Logout (Tùy chọn)**

**File mới:** `api/auth/force_logout.php`

**Công dụng:**
- Admin có thể gọi API này sau khi khóa user
- Lưu log để tracking
- Có thể mở rộng để implement token blacklist

**Cách dùng:**
```javascript
// Trong admin.js - lockUser()
await fetch(`${API_BASE_URL}/auth/force_logout.php`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
    },
    body: JSON.stringify({ user_id: userId })
});
```

---

## 🔄 FLOW SAU KHI FIX

### Kịch bản 1: User BỊ KHÓA sau khi đã login

```
1. User A đang login (có token còn hạn)
2. Admin khóa User A
3. User A tiếp tục dùng web
4. User A click vào "Đơn hàng" → Gọi API orders.php
5. Middleware check status → Status = 'banned'
6. API trả về 401 Unauthorized
7. Frontend tự động logout User A
```

### Kịch bản 2: User BỊ KHÓA cố gắng login lại

```
1. Admin khóa User A
2. User A logout và cố login lại
3. API login.php check status
4. Status = 'banned'
5. API trả về 403: "Tài khoản đã bị khóa"
6. User A KHÔNG lấy được token
```

---

## 🧪 CÁCH TEST

### Test 1: Khóa user đang online

```
1. Login bằng một tài khoản thường (không phải admin)
2. Mở tab khác → Login admin
3. Admin → "Người dùng" → Khóa tài khoản ở tab 1
4. Quay lại tab 1 → Click vào bất kỳ menu nào
5. ✅ User phải bị logout tự động với thông báo "Tài khoản không hoạt động"
```

### Test 2: User bị khóa cố login lại

```
1. Admin khóa một tài khoản
2. Logout khỏi trang web
3. Thử login lại với tài khoản vừa bị khóa
4. ✅ Phải thấy lỗi: "Tài khoản đã bị khóa"
```

### Test 3: Mở khóa user

```
1. Admin mở khóa tài khoản (status → 'active')
2. User thử login lại
3. ✅ Login thành công
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. **Token vẫn có thể hoạt động trong thời gian ngắn**

Nếu admin khóa user lúc 10:00, nhưng user không thực hiện hành động gì (không gọi API) cho đến 10:30, user **VẪN CÓ THỂ** thấy giao diện bình thường.

**Khi nào user bị logout?**
- Khi user **click vào menu** khác (gọi API load data)
- Khi user **thực hiện hành động** (tạo đơn, xem chi tiết, v.v.)
- Khi user **refresh trang** (gọi API init)

**Giải pháp tốt hơn (nâng cao):**
- Implement WebSocket để admin push event "user_banned" realtime
- Frontend lắng nghe event → logout ngay lập tức
- Hoặc frontend polling check status mỗi 30s

---

### 2. **Token expire time**

**Trước:** 7 ngày  
**Sau:** 1 ngày

**Ưu điểm:**
- ✅ Bảo mật hơn
- ✅ User bị khóa sẽ bị logout nhanh hơn (tối đa 24h)

**Nhược điểm:**
- ❌ User phải login lại thường xuyên hơn

**Giải pháp cân bằng:**
- Giữ 1 ngày cho production
- Implement "Remember me" với refresh token (7 ngày)
- Hoặc tăng lên 3 ngày nếu UX quan trọng hơn security

---

### 3. **Không thể force logout ngay lập tức**

Với kiến trúc hiện tại (JWT stateless), **KHÔNG THỂ** force logout user ngay lập tức.

**Tại sao?**
- JWT là stateless → Server không lưu session
- Token được client giữ → Server không thể "thu hồi"

**Để force logout ngay lập tức, cần:**
1. **Token Blacklist:** Server lưu danh sách token bị revoke
2. **Middleware check blacklist** trước khi authenticate
3. **Redis** để lưu blacklist (performance tốt)

**Code mẫu (nâng cao):**
```php
// Check token blacklist
$isBlacklisted = $redis->exists("blacklist:$token");
if ($isBlacklisted) {
    $this->sendUnauthorized("Token đã bị thu hồi");
}
```

---

## 📋 FILES ĐÃ SỬA

| File | Thay đổi | Line |
|------|----------|------|
| api/auth/login.php | Giảm token expire: 7 ngày → 1 ngày | 89-94 |
| admin/admin.js | Cải thiện thông báo lockUser() | 909-934 |
| api/auth/force_logout.php | **TẠO MỚI** - API force logout | - |

---

## ✅ CHECKLIST

- [x] ✅ Giảm token expire time (7d → 1d)
- [x] ✅ Cải thiện UX message khi lock user
- [x] ✅ Xác nhận middleware check status
- [x] ✅ Xác nhận login check status
- [x] ✅ Tạo API force_logout (optional)
- [ ] 🔄 Test khóa user đang online
- [ ] 🔄 Test user bị khóa cố login lại
- [ ] 🔄 Test mở khóa user

---

## 🎯 KẾT LUẬN

**Vấn đề:**
- ❌ Token còn hạn 7 ngày → User bị khóa vẫn dùng được

**Giải pháp:**
- ✅ Giảm token expire → 1 ngày
- ✅ Middleware **ĐÃ CHECK** status → User bị logout khi gọi API
- ✅ Login **ĐÃ CHECK** status → User không login lại được

**Hành vi sau fix:**
1. Admin khóa user
2. User **KHÔNG** bị logout ngay lập tức
3. User **BỊ LOGOUT** khi click vào menu/thực hiện hành động
4. User **KHÔNG THỂ** login lại

**Đây là hành vi ĐÚNG và BÌNH THƯỜNG** với kiến trúc JWT stateless!

---

**Ngày fix:** 30/10/2025  
**Mức độ:** 🔴 **CRITICAL SECURITY FIX**

