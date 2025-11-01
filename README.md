# 🎂 LA CUISINE NGỌT

> Website bán bánh kem cao cấp - Hệ thống quản lý và bán hàng trực tuyến

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Công nghệ](#-công-nghệ-sử-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Cài đặt & Chạy](#-cài-đặt--chạy)
- [Tài khoản đăng nhập](#-tài-khoản-đăng-nhập)
- [Tính năng](#-tính-năng)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Authentication & Authorization](#-authentication--authorization)

---

## 🌟 Giới thiệu

**LA CUISINE NGỌT** là website bán bánh kem cao cấp được phát triển với công nghệ hiện đại, giao diện thân thiện và đầy đủ tính năng cho cả khách hàng, nhân viên và quản trị viên.

### ✨ Điểm nổi bật

- ✅ Giao diện hiện đại, responsive 100%
- ✅ Quản trị admin đầy đủ tính năng (CRUD sản phẩm, đơn hàng, người dùng, khuyến mãi)
- ✅ Hệ thống giỏ hàng thông minh
- ✅ Tìm kiếm và lọc sản phẩm
- ✅ Quản lý đơn hàng với đầy đủ trạng thái (pending, confirmed, preparing, shipping, completed, cancelled)
- ✅ Báo cáo thống kê chi tiết với biểu đồ tương tác (Chart.js)
- ✅ Phân quyền rõ ràng (Admin, Staff, Customer)
- ✅ Hệ thống xác thực và bảo mật (JWT, middleware)
- ✅ Báo cáo thống kê theo tháng/năm với biểu đồ cột và tròn
- ✅ Tự động đăng xuất khi tài khoản bị khóa
- ✅ Đổi mật khẩu và quên mật khẩu

---

## 🛠️ Công nghệ sử dụng

### Frontend
- **HTML5** - Cấu trúc semantic
- **CSS3** - Flexbox, Grid, Animations
- **JavaScript (ES6+)** - Tương tác và API calls
- **Chart.js 3.9.1** - Biểu đồ tương tác (báo cáo admin)
- **Font Awesome 6.x** - Icons
- **Google Fonts** - Typography (Inter, Inspiration, Crimson Text, Dancing Script)

### Backend
- **PHP 7.4+** - Server-side logic
- **RESTful API** - API endpoints
- **JWT Token** - Authentication (đơn giản hóa với base64)
- **PDO** - Database connectivity với prepared statements
- **MySQL** - Database chính

### Database
- **MySQL 5.7+ / MariaDB** - Database chính
- **15 Tables** - Users, Products, Orders, Promotions, Reviews, Complaints, Contacts, v.v.

---

## 📁 Cấu trúc dự án

```
Nhom1_Ca4_CNPM/
│
├── admin/                          # 👑 ADMIN PANEL
│   ├── admin.html                  # Dashboard quản trị
│   ├── admin.css                   # Styling admin
│   └── admin.js                    # Logic admin
│
├── api/                            # 🔌 BACKEND API
│   ├── auth/
│   │   ├── login.php              # API đăng nhập
│   │   ├── register.php           # API đăng ký
│   │   ├── forgot-password.php    # API quên mật khẩu (reset về "123456")
│   │   └── middleware.php         # Xác thực và phân quyền
│   ├── config/
│   │   └── database.php           # Kết nối database
│   ├── products.php               # API sản phẩm (CRUD)
│   ├── products_c.php             # API sản phẩm (public)
│   ├── orders.php                 # API đơn hàng (CRUD, xóa)
│   ├── users.php                  # API người dùng (CRUD, đổi mật khẩu)
│   ├── cart.php                   # API giỏ hàng
│   ├── promotions.php             # API khuyến mãi (CRUD)
│   ├── complaints.php             # API khiếu nại
│   ├── contacts.php               # API liên hệ (Staff/Admin)
│   ├── contact-home.php           # API liên hệ (public)
│   ├── reports.php                # API báo cáo (Admin)
│   ├── reviews.php                # API đánh giá
│   ├── categories.php             # API danh mục (CRUD)
│   ├── search.php                 # API tìm kiếm
│   ├── staff_profile.php          # API hồ sơ nhân viên
│   ├── staff_search.php           # API tìm kiếm nhân viên
│   └── upload.php                 # API upload file
│
├── assets/                         # 🎨 TÀI NGUYÊN
│   ├── css/
│   │   ├── style.css              # CSS chung
│   │   └── animations.css         # Hiệu ứng
│   ├── js/
│   │   ├── main.js                # JavaScript chung
│   │   ├── image-handler.js       # Xử lý ảnh
│   │   └── auth-check.js         # Kiểm tra xác thực client-side (auto logout nếu banned)
│   └── images/                    # Hình ảnh sản phẩm, khuyến mãi
│
├── database/                       # 🗄️ DATABASE
│   └── schema.sql                 # Cấu trúc database + Dữ liệu mẫu
│
├── pages/                          # 📄 CÁC TRANG
│   ├── home/                      # Trang chủ
│   │   ├── home.html
│   │   ├── home.css
│   │   └── home.js                # Load sản phẩm, khuyến mãi từ API
│   ├── login/                     # Đăng nhập
│   │   ├── login.html
│   │   ├── login.css
│   │   └── login.js               # Đăng nhập, quên mật khẩu
│   ├── register/                  # Đăng ký
│   │   ├── register.html
│   │   ├── register.css
│   │   └── register.js
│   ├── product/                   # Chi tiết sản phẩm
│   │   ├── product.html
│   │   ├── product.css
│   │   └── product.js             # Ẩn "THÔNG TIN SẢN PHẨM" nếu là Phụ kiện
│   ├── cart/                      # Giỏ hàng
│   │   ├── cart.html
│   │   ├── cart.css
│   │   └── cart.js
│   ├── checkout/                  # Thanh toán
│   │   ├── checkout.html
│   │   ├── checkout.css
│   │   └── checkout.js
│   ├── order-confirmation/        # Xác nhận đơn
│   │   ├── order-confirmation.html
│   │   ├── order-confirmation.css
│   │   └── order-confirmation.js
│   ├── account/                   # Tài khoản khách hàng
│   │   ├── account.html
│   │   ├── account.css
│   │   └── account.js             # Xem đơn hàng dạng bảng, đổi mật khẩu
│   ├── contact/                   # Liên hệ
│   │   ├── contact.html
│   │   ├── contact.css
│   │   └── contact.js
│   ├── about/                     # Về chúng tôi
│   │   ├── about.html
│   │   ├── about.css
│   │   └── about.js
│   └── pay/                       # Thanh toán
│       ├── pay.html
│       ├── pay.css
│       └── pay.js
│
├── staff/                          # 👨‍💼 NHÂN VIÊN
│   ├── handleComplaint/          # Xử lý khiếu nại
│   │   ├── complaint.html
│   │   ├── complaint.css
│   │   └── complaint.js
│   ├── handleContact/            # Xử lý liên hệ
│   │   ├── contact.html
│   │   ├── contact.css
│   │   └── contact.js
│   ├── staffProfile/             # Hồ sơ nhân viên
│   │   ├── staff_profile.html
│   │   ├── staff_profile.css
│   │   └── staff_profile.js       # Cập nhật thông tin, đổi mật khẩu
│   └── ViewOders/                # Xem đơn hàng (Lưu ý: tên thư mục có typo "Oders")
│       ├── order.html
│       ├── order.css
│       └── order.js
│
├── .htaccess                      # Apache URL Rewrite rules
├── test.md                        # Bảng kiểm thử phần mềm (150 test cases)
└── README.md                      # 📖 Tài liệu này
```

---

## 🚀 Cài đặt & Chạy

### 📋 Yêu cầu hệ thống

- ✅ **XAMPP/WAMP** đã cài đặt
- ✅ **PHP 7.4+** 
- ✅ **MySQL 5.7+ / MariaDB 10.3+**
- ✅ **Trình duyệt** hiện đại (Chrome, Firefox, Edge)

---

### 🔧 Bước 1: Chuẩn bị

1. **Cài đặt XAMPP:**
   - Tải về: [https://www.apachefriends.org/](https://www.apachefriends.org/)
   - Cài đặt vào `C:\xampp\` (hoặc đường dẫn tùy chọn)

2. **Copy project vào thư mục htdocs:**
```bash
   # Windows
   C:\xampp\htdocs\Nhom1_Ca4_CNPM\
   ```

3. **Khởi động XAMPP:**
   - Mở **XAMPP Control Panel**
   - Start **Apache**
   - Start **MySQL**

---

### 🗄️ Bước 2: Import Database

#### Cách 1: Qua phpMyAdmin (Khuyên dùng)

1. **Mở phpMyAdmin:**
   ```
   http://localhost/phpmyadmin
   ```

2. **Import database:**
   - Click tab **"SQL"** ở menu trên
   - Click nút **"Choose File"** hoặc **"Import"**
   - Chọn file: `database/schema.sql`
   - Click **"Go"** để thực thi
   - Đợi thông báo **"Import has been successfully finished"** ✅

#### Cách 2: Qua Command Line

```bash
# Mở CMD/PowerShell
cd C:\xampp\mysql\bin

# Import database
mysql -u root -p < "D:\Hoc_tap\Lap_trinh_PHP\htdocs\Nhom1_Ca4_CNPM\database\schema.sql"

# Nhấn Enter nếu không có password
```

#### ✅ Kiểm tra database

- **Database name:** `lacuisinengot`
- **Số bảng:** 15 tables
- **Dữ liệu mẫu:**
  - 4 danh mục sản phẩm
  - 12 sản phẩm
  - 9 users (1 admin, 6 staff, 2 customer)
  - 50+ đơn hàng mẫu (phân bố theo tháng/năm để test báo cáo)
  - 3 khuyến mãi mẫu

---

### 🌐 Bước 3: Truy cập Website

#### 🏠 **Trang chủ:**
```
http://localhost/Nhom1_Ca4_CNPM/pages/home/home.html
```

#### 🔐 **Trang đăng nhập:**
```
http://localhost/Nhom1_Ca4_CNPM/pages/login/login.html
```

#### 👑 **ADMIN PANEL:**
```
http://localhost/Nhom1_Ca4_CNPM/admin/admin.html
```

#### 📦 **Trang sản phẩm:**
```
http://localhost/Nhom1_Ca4_CNPM/pages/product/product.html?id=1
```

#### 🛒 **Giỏ hàng:**
```
http://localhost/Nhom1_Ca4_CNPM/pages/cart/cart.html
```

#### 👨‍💼 **STAFF PANEL:**
```
http://localhost/Nhom1_Ca4_CNPM/staff/ViewOders/order.html
```

---

## 👤 Tài khoản đăng nhập

### 👑 Admin (Quản trị viên)
```
Username: admin
Password: password
```

### 👨‍💼 Staff (Nhân viên)
```
Username: staff01
Password: password

Hoặc: staff02, staff03, staff04, staff05, staff06
(Tất cả đều có password: password)
```

### 🛍️ Customer (Khách hàng)
```
Username: customer01
Password: password

Hoặc: customer02
(Password: password)
```

---

## ✨ Tính năng

### 🛍️ Cho khách hàng

- ✅ **Duyệt sản phẩm** với tìm kiếm và lọc theo danh mục
- ✅ **Xem chi tiết** sản phẩm (hình ảnh, giá, mô tả, cấu trúc, hướng dẫn sử dụng)
- ✅ **Ẩn "THÔNG TIN SẢN PHẨM"** nếu sản phẩm là "Phụ kiện"
- ✅ **Giỏ hàng** thông minh (thêm, sửa, xóa)
- ✅ **Đặt hàng** với form đầy đủ thông tin
- ✅ **Theo dõi đơn hàng** của mình (xem dạng bảng với chi tiết sản phẩm)
- ✅ **Xem khuyến mãi** trên trang home
- ✅ **Cập nhật thông tin** cá nhân (tên, số điện thoại, địa chỉ)
- ✅ **Đổi mật khẩu** trong phần thông tin tài khoản
- ✅ **Quên mật khẩu** (reset về "123456")
- ✅ **Đăng ký/Đăng nhập** tài khoản
- ✅ **Tự động đăng xuất** nếu tài khoản bị khóa

### 👑 Cho Admin

#### 📊 Dashboard & Báo cáo
- **Thống kê KPI:** Doanh thu, Tổng đơn hàng, Đã giao, Khách hàng mới
- **Biểu đồ cột:** Doanh thu theo tháng (phân biệt tháng hiện tại bằng màu)
- **Biểu đồ tròn:** Phân bổ doanh thu theo sản phẩm (với phần trăm trong chú thích)
- **Bảng chi tiết:** Doanh thu theo sản phẩm (có dòng TỔNG CỘNG, tỷ lệ % tổng = 100%)
- **Lọc theo tháng/năm:** Chọn năm và tháng cụ thể hoặc "Tất cả"
- **Xử lý tháng tương lai:** Hiển thị thông báo khi chọn tháng tương lai
- **Loading state:** Hiển thị "Đang tải..." khi chuyển đổi

#### 📦 Quản lý sản phẩm
- **Thêm sản phẩm mới** với đầy đủ thông tin (tên, danh mục, giá, mô tả, ảnh, v.v.)
- **Sửa sản phẩm** (cập nhật thông tin, giá, số lượng)
- **Xóa sản phẩm** (với xác nhận)
- **Tìm kiếm sản phẩm**
- **Lọc theo danh mục và trạng thái**
- **Sản phẩm mới xuất hiện trên trang home** sau khi refresh (cache-busting)

#### 📋 Quản lý đơn hàng
- **Xem danh sách đơn hàng** với đầy đủ thông tin
- **Lọc theo trạng thái:** pending, confirmed, preparing, shipping, completed, cancelled
- **Cập nhật trạng thái** đơn hàng
- **Xem chi tiết đơn hàng** (sản phẩm, số lượng, giá)
- **Xóa đơn hàng** (với xác nhận, xóa cả OrderItems, OrderStatusHistory, PromotionUsage)

#### 👥 Quản lý người dùng
- **Xem danh sách users** (Admin/Staff/Customer)
- **Thêm user mới**
- **Sửa thông tin user** (tên, email, phone, role, status)
- **Khóa/Mở khóa tài khoản** (status: banned/active)
- **Xóa user** (với xác nhận, không cho xóa admin chính)
- **Tài khoản bị khóa không thể đăng nhập** (kiểm tra ở cả server và client)
- **Tự động đăng xuất** nếu user đang đăng nhập bị khóa

#### 🎁 Quản lý khuyến mãi
- **Thêm khuyến mãi mới** (mã, tên, loại, giá trị, ngày bắt đầu/kết thúc, ảnh)
- **Sửa khuyến mãi**
- **Xóa khuyến mãi**
- **Xem danh sách khuyến mãi** (lọc theo trạng thái)
- **Khuyến mãi mới xuất hiện trên trang home** sau khi refresh (cache-busting)
- **Validate:** Kiểm tra mã khuyến mãi đã tồn tại

#### 📞 Quản lý khiếu nại
- **Xem danh sách khiếu nại**
- **Cập nhật trạng thái** xử lý
- **Phản hồi khách hàng**
- **Xóa khiếu nại** (Admin)

#### 📧 Quản lý liên hệ
- **Xem danh sách liên hệ** từ khách hàng
- **Cập nhật trạng thái** (pending, responded)

### 👨‍💼 Cho Staff (Nhân viên)

- ✅ **Xem đơn hàng** với lọc theo trạng thái (đồng bộ với admin)
- ✅ **Cập nhật trạng thái** đơn hàng
- ✅ **Xử lý liên hệ** từ khách
- ✅ **Xử lý khiếu nại** (cập nhật trạng thái, phản hồi)
- ✅ **Cập nhật hồ sơ** cá nhân (tên, số điện thoại, địa chỉ)
- ✅ **Đổi mật khẩu** trong phần hồ sơ nhân viên
- ✅ **Tìm kiếm đơn hàng** và nhân viên

---

## 🔌 API Endpoints

### 🔐 Authentication
```
POST   /api/auth/login.php              - Đăng nhập
POST   /api/auth/register.php           - Đăng ký
POST   /api/auth/forgot-password.php    - Quên mật khẩu (reset về "123456")
```

### 📦 Products
```
GET    /api/products.php                - Lấy danh sách sản phẩm
GET    /api/products.php?id=1            - Lấy chi tiết sản phẩm
GET    /api/products.php?search=Bánh    - Tìm kiếm sản phẩm
GET    /api/products.php?category=Entremet - Lọc theo danh mục
GET    /api/products.php?status=available - Lọc theo trạng thái
GET    /api/products.php?featured=1     - Sản phẩm nổi bật
POST   /api/products.php                - Tạo sản phẩm (Admin)
PUT    /api/products.php/{id}            - Cập nhật sản phẩm (Admin)
DELETE /api/products.php/{id}           - Xóa sản phẩm (Admin)
```

### 📋 Orders
```
GET    /api/orders.php                  - Lấy danh sách đơn hàng (Staff/Admin)
GET    /api/orders.php?user_id=3        - Lấy đơn hàng của customer (Owner/Admin)
GET    /api/orders.php/{id}             - Chi tiết đơn hàng
GET    /api/orders.php?status=pending   - Lọc theo trạng thái
POST   /api/orders.php                  - Tạo đơn hàng mới
PUT    /api/orders.php/{id}             - Cập nhật đơn hàng (Staff/Admin)
DELETE /api/orders.php/{id}             - Xóa đơn hàng (Admin)
```

### 👥 Users
```
GET    /api/users.php                   - Danh sách users (Admin)
GET    /api/users.php/{id}              - Chi tiết user (Owner/Admin)
GET    /api/users.php?role=staff&search=abc - Tìm kiếm nhân viên
POST   /api/users.php                   - Tạo user (Admin)
PUT    /api/users.php/{id}              - Cập nhật user (Owner có thể cập nhật thông tin cá nhân, Admin có thể cập nhật tất cả)
POST   /api/users.php/{userId}/change-password - Đổi mật khẩu (Owner/Admin)
DELETE /api/users.php/{id}              - Xóa user (Admin, không cho xóa admin chính)
```

### 🎁 Promotions
```
GET    /api/promotions.php              - Danh sách khuyến mãi (Admin)
GET    /api/promotions.php?public=1     - Danh sách khuyến mãi active (Public)
GET    /api/promotions.php/{id}         - Chi tiết khuyến mãi
GET    /api/promotions.php?status=active - Lọc theo trạng thái
POST   /api/promotions.php              - Tạo khuyến mãi (Admin)
PUT    /api/promotions.php/{id}         - Cập nhật khuyến mãi (Admin)
DELETE /api/promotions.php/{id}         - Xóa khuyến mãi (Admin)
```

### 📊 Reports
```
GET    /api/reports.php?period=month    - Báo cáo tháng hiện tại
GET    /api/reports.php?period=year     - Báo cáo năm hiện tại
GET    /api/reports.php?month=5&year=2024 - Báo cáo tháng cụ thể
GET    /api/reports.php?year=2024       - Báo cáo cả năm (không chọn tháng)
```

### 🛒 Cart
```
GET    /api/cart.php?user_id=3          - Lấy giỏ hàng
POST   /api/cart.php                    - Thêm vào giỏ
PUT    /api/cart.php                    - Cập nhật số lượng
DELETE /api/cart.php                    - Xóa khỏi giỏ
```

### 📂 Categories
```
GET    /api/categories.php              - Danh sách danh mục
POST   /api/categories.php              - Tạo danh mục (Admin)
PUT    /api/categories.php/{id}         - Cập nhật danh mục (Admin)
DELETE /api/categories.php/{id}         - Xóa danh mục (Admin)
```

### 📞 Contacts
```
GET    /api/contacts.php                - Danh sách liên hệ (Staff/Admin)
PUT    /api/contacts.php/{id}           - Cập nhật trạng thái (Staff/Admin)
POST   /api/contact-home.php            - Gửi liên hệ (Public)
```

### 📝 Complaints
```
GET    /api/complaints.php              - Danh sách khiếu nại (Staff/Admin)
GET    /api/complaints.php/{id}         - Chi tiết khiếu nại
PUT    /api/complaints.php/{id}         - Cập nhật khiếu nại (Staff/Admin)
POST   /api/complaints.php/{id}?action=reply - Phản hồi khách hàng (Staff/Admin)
DELETE /api/complaints.php/{id}         - Xóa khiếu nại (Admin)
```

### ⭐ Reviews
```
GET    /api/reviews.php                 - Danh sách đánh giá
GET    /api/reviews.php?product_id=1    - Đánh giá theo sản phẩm
POST   /api/reviews.php                 - Tạo đánh giá
PUT    /api/reviews.php/{id}            - Cập nhật đánh giá (Admin)
DELETE /api/reviews.php/{id}           - Xóa đánh giá (Admin)
```

### 🔍 Search
```
GET    /api/search.php?keyword=Bánh&type=products - Tìm kiếm sản phẩm
GET    /api/search.php?keyword=staff&type=users   - Tìm kiếm users (Admin)
```

### 👨‍💼 Staff Profile
```
GET    /api/staff_profile.php/{id}      - Lấy thông tin nhân viên (Owner/Staff)
PUT    /api/staff_profile.php/{id}      - Cập nhật thông tin nhân viên (Owner/Staff)
POST   /api/staff_profile.php           - Đổi mật khẩu nhân viên (Owner/Staff)
```

---

## 🗄️ Database Schema

### Các bảng chính

1. **Users** - Người dùng (admin, staff, customer)
2. **Categories** - Danh mục sản phẩm
3. **Products** - Sản phẩm
4. **ProductImages** - Hình ảnh sản phẩm
5. **Orders** - Đơn hàng
6. **OrderItems** - Chi tiết sản phẩm trong đơn hàng
7. **OrderStatusHistory** - Lịch sử thay đổi trạng thái đơn hàng
8. **Promotions** - Khuyến mãi
9. **PromotionUsage** - Lịch sử sử dụng khuyến mãi
10. **Complaints** - Khiếu nại
11. **ComplaintResponses** - Phản hồi khiếu nại
12. **Reviews** - Đánh giá sản phẩm
13. **Cart** - Giỏ hàng
14. **Wishlist** - Danh sách yêu thích
15. **Contacts** - Liên hệ từ khách hàng

### Chi tiết các bảng

#### Users
- `UserID`, `Username`, `Email`, `PasswordHash`
- `FullName`, `Phone`, `Address`
- `Role`: `customer`, `staff`, `admin`
- `Status`: `active`, `inactive`, `banned`

#### Orders
- `OrderStatus`: `pending`, `confirmed`, `preparing`, `shipping`, `completed`, `cancelled`
- `PaymentMethod`: `cod`, `bank_transfer`, `momo`, `zalopay`, `vnpay`
- `PaymentStatus`: `pending`, `paid`, `failed`, `refunded`

#### Promotions
- `PromotionType`: `percent`, `fixed_amount`, `free_shipping`, `gift`
- `Status`: `pending`, `active`, `expired`, `cancelled`
- `ImageURL`: Đường dẫn ảnh khuyến mãi

---

## 🔐 Authentication & Authorization

### Middleware Functions

- **`checkAdminPermission()`** - Chỉ Admin được truy cập
- **`requireStaff()`** - Staff hoặc Admin được truy cập
- **`requireAuth()`** - Cần đăng nhập (bất kỳ role nào, status = active)
- **`requireOwnerOrAdmin($userId)`** - Owner của resource hoặc Admin

### Client-side Authentication Check

File `assets/js/auth-check.js` tự động:
- Kiểm tra JWT token và user status mỗi 30 giây
- Đăng xuất tự động nếu tài khoản bị khóa
- Redirect nếu không có quyền truy cập
- Kiểm tra role khi truy cập admin/staff pages
- Tính toán đường dẫn API đúng dựa trên vị trí file HTML hiện tại

### Password Management

- **Đổi mật khẩu:** `POST /api/users.php/{userId}/change-password`
  - Yêu cầu: Owner hoặc Admin
  - Validate: oldPassword và newPassword
  - Hash mật khẩu mới với `PASSWORD_DEFAULT`

- **Quên mật khẩu:** `POST /api/auth/forgot-password.php`
  - Reset mật khẩu về "123456"
  - Yêu cầu: Email hợp lệ và tài khoản active
  - Hash và cập nhật PasswordHash trong database

---

## 🎯 Tính năng đã được cải thiện

### ✅ Đã fix gần đây

1. **Quản lý sản phẩm:**
   - ✅ Thêm/sửa/xóa sản phẩm cập nhật database và hiển thị trên home
   - ✅ Load categories từ API để populate dropdown
   - ✅ Xử lý category_id đúng cách (convert tên → ID nếu cần)
   - ✅ Cache-busting để đảm bảo sản phẩm mới xuất hiện ngay

2. **Quản lý đơn hàng:**
   - ✅ Thêm nút xóa đơn hàng (Admin)
   - ✅ Đồng bộ logic lọc với staff view (6 trạng thái đầy đủ)
   - ✅ Xóa đơn hàng xóa cả OrderItems, OrderStatusHistory, PromotionUsage

3. **Quản lý người dùng:**
   - ✅ Khóa tài khoản ngăn đăng nhập (server + client check)
   - ✅ Tự động đăng xuất nếu user đang đăng nhập bị khóa
   - ✅ Xóa user xóa khỏi database và danh sách
   - ✅ Customer có thể xem và cập nhật thông tin cá nhân
   - ✅ Đổi mật khẩu trong phần tài khoản (Owner/Admin)

4. **Quản lý báo cáo:**
   - ✅ Nút tháng cập nhật biểu đồ tròn và bảng chi tiết đúng
   - ✅ Hiển thị sản phẩm theo tháng/năm được chọn
   - ✅ Khi chọn "Tất cả" tháng: bảng chi tiết để trống, chỉ hiển thị biểu đồ cột và KPI
   - ✅ Khi chọn tháng tương lai: tất cả để trống với thông báo
   - ✅ KPI doanh thu khớp với biểu đồ cột
   - ✅ "Đã giao" ≤ "Tổng đơn hàng" (fixed COUNT DISTINCT)

5. **Quản lý khuyến mãi:**
   - ✅ CRUD operations cập nhật database
   - ✅ Validate mã khuyến mãi đã tồn tại
   - ✅ Validate loại khuyến mãi (percent, fixed_amount, free_shipping, gift)
   - ✅ Format dates đúng (YYYY-MM-DD → YYYY-MM-DD HH:MM:SS)
   - ✅ Khuyến mãi mới xuất hiện trên trang home (cache-busting)
   - ✅ Hiển thị ảnh khuyến mãi từ database (xử lý NULL và empty)

6. **Trang Home:**
   - ✅ Load sản phẩm và khuyến mãi từ API với cache-busting
   - ✅ Hiển thị ảnh khuyến mãi từ database (xử lý NULL và empty)
   - ✅ Tự động cập nhật khi có sản phẩm/khuyến mãi mới

7. **Trang Product:**
   - ✅ Ẩn "THÔNG TIN SẢN PHẨM" nếu sản phẩm là "Phụ kiện"
   - ✅ Fix lỗi 404 cho product-data.js

8. **Trang Account:**
   - ✅ Hiển thị đơn hàng dạng bảng với chi tiết sản phẩm
   - ✅ Đổi mật khẩu (Owner/Admin)
   - ✅ CSS spacing đều trong khung

9. **Authentication:**
   - ✅ Quên mật khẩu (reset về "123456")
   - ✅ Đổi mật khẩu trong tài khoản (Owner/Admin)
   - ✅ Fix auth-check.js để tính toán đường dẫn API đúng

---

## 🔧 Xử lý lỗi

### ❌ Lỗi: "Cannot connect to database"

**Giải pháp:**
- Kiểm tra MySQL đang chạy trong XAMPP
- Kiểm tra file `api/config/database.php`:
  ```php
  private $host = "localhost";
  private $database_name = "lacuisinengot";
  private $username = "root";
  private $password = ""; // Để trống nếu không có password
  ```

### ❌ Lỗi: "Access Denied" (401/403)

**Giải pháp:**
- Đăng nhập lại với tài khoản đúng
- Kiểm tra JWT token trong localStorage
- Xóa cache trình duyệt (Ctrl + Shift + Delete)
- Kiểm tra role của user (admin/staff/customer)
- Kiểm tra status của user (phải là 'active')

### ❌ Lỗi: Ảnh không hiển thị

**Giải pháp:**
- Kiểm tra file ảnh trong `assets/images/`
- Kiểm tra ImageURL trong database (có thể NULL hoặc empty)
- Xóa cache trình duyệt (Ctrl + F5)
- Kiểm tra đường dẫn trong database (phải bắt đầu bằng `assets/`)

### ❌ Lỗi: API không hoạt động (404 Not Found)

**Giải pháp:**
- Kiểm tra Apache đang chạy
- Kiểm tra Console trong trình duyệt (F12)
- Kiểm tra Network tab để xem request/response
- Kiểm tra đường dẫn API trong `auth-check.js` (tự động tính toán dựa trên vị trí file)
- Kiểm tra PHP error logs trong XAMPP

---

## 📱 Responsive Design

Website hoạt động tốt trên mọi thiết bị:

- 📱 **Mobile:** 320px - 480px
- 📱 **Tablet:** 481px - 768px  
- 💻 **Desktop:** 769px - 1024px
- 🖥️ **Large Desktop:** 1025px+

---

## 🔒 Bảo mật

- ✅ **Password Hashing:** bcrypt (`PASSWORD_DEFAULT`)
- ✅ **JWT Authentication:** Token-based (đơn giản hóa)
- ✅ **SQL Injection Prevention:** Prepared statements (PDO)
- ✅ **XSS Protection:** Input sanitization (htmlspecialchars, strip_tags)
- ✅ **CORS:** Configured properly với whitelist origins
- ✅ **Authorization:** Role-based access control (Admin, Staff, Customer)
- ✅ **Account Status Check:** Banned accounts cannot login
- ✅ **Client-side Auth Check:** Auto logout if account is banned
- ✅ **URL Routing:** Parse ID từ URL path và query string

---

## 📊 Báo cáo & Thống kê

### Tính năng báo cáo (Admin)

- **KPI Statistics:**
  - Doanh thu (tính từ OrderItems.Subtotal)
  - Tổng đơn hàng (COUNT DISTINCT OrderID)
  - Đã giao (COUNT DISTINCT OrderID WHERE Status = 'completed')
  - Khách hàng mới (COUNT Users WHERE Role = 'customer')

- **Biểu đồ cột:**
  - Hiển thị doanh thu theo tháng (12 tháng)
  - Tháng hiện tại có màu khác (#2d4a3e)
  - Các tháng khác màu xanh (#4472C4)

- **Biểu đồ tròn:**
  - Phân bổ doanh thu theo sản phẩm
  - Chú thích hiển thị phần trăm (XX.X%)
  - Chỉ hiển thị sản phẩm có doanh thu > 0

- **Bảng chi tiết:**
  - Hiển thị doanh thu theo sản phẩm (số lượng, doanh thu, phần trăm)
  - Có dòng TỔNG CỘNG ở cuối
  - Tỷ lệ phần trăm tổng = 100% (có điều chỉnh rounding)
  - Ẩn sản phẩm có doanh thu = 0

- **Lọc:**
  - Chọn năm và tháng cụ thể
  - Chọn "Tất cả" tháng (hiển thị cả năm, bảng chi tiết để trống)
  - Xử lý tháng tương lai (hiển thị thông báo)

---

## 🎉 Hoàn tất!

Chúc bạn sử dụng thành công **LA CUISINE NGỌT**! 🎂🍰

**Made with ❤️ by Team Nhóm 1 - Ca 4 - CNPM**
