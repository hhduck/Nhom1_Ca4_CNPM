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

---

## 🌟 Giới thiệu

**LA CUISINE NGỌT** là website bán bánh kem cao cấp được phát triển với công nghệ hiện đại, giao diện thân thiện và đầy đủ tính năng cho cả khách hàng và quản trị viên.

### ✨ Điểm nổi bật
- ✅ Giao diện hiện đại, responsive 100%
- ✅ Quản trị admin đầy đủ tính năng
- ✅ Hệ thống giỏ hàng thông minh
- ✅ Tìm kiếm và lọc sản phẩm
- ✅ Quản lý đơn hàng, khuyến mãi
- ✅ Báo cáo thống kê chi tiết

---

## 🛠️ Công nghệ sử dụng

### Frontend
- **HTML5** - Cấu trúc semantic
- **CSS3** - Flexbox, Grid, Animations
- **JavaScript (ES6+)** - Tương tác và API calls
- **Font Awesome** - Icons
- **Google Fonts** - Typography

### Backend
- **PHP 7.4+** - Server-side logic
- **RESTful API** - API endpoints
- **JWT** - Authentication
- **PDO** - Database connectivity

### Database
- **MySQL** - Database chính

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
│   │   └── middleware.php         # Xác thực
│   ├── config/
│   │   └── database.php           # Kết nối database
│   ├── products.php               # API sản phẩm
│   ├── orders.php                 # API đơn hàng
│   ├── users.php                  # API người dùng
│   ├── cart.php                   # API giỏ hàng
│   ├── promotions.php             # API khuyến mãi
│   ├── complaints.php             # API khiếu nại
│   ├── contacts.php               # API liên hệ
│   ├── reports.php                # API báo cáo
│   └── reviews.php                # API đánh giá
│
├── assets/                         # 🎨 TÀI NGUYÊN
│   ├── css/
│   │   ├── style.css              # CSS chung
│   │   └── animations.css         # Hiệu ứng
│   ├── js/
│   │   ├── main.js                # JavaScript chung
│   │   └── image-handler.js       # Xử lý ảnh
│   └── images/                    # Hình ảnh sản phẩm
│
├── database/                       # 🗄️ DATABASE
│   └── schema.sql                 # Cấu trúc database + Dữ liệu mẫu
│
├── pages/                          # 📄 CÁC TRANG
│   ├── home/                      # Trang chủ
│   │   ├── home.html
│   │   ├── home.css
│   │   └── home.js
│   ├── login/                     # Đăng nhập
│   │   ├── login.html
│   │   ├── login.css
│   │   └── login.js
│   ├── register/                  # Đăng ký
│   │   ├── register.html
│   │   ├── register.css
│   │   └── register.js
│   ├── product/                   # Sản phẩm
│   │   ├── product.html
│   │   ├── product.css
│   │   ├── product.js
│   │   └── product-data.js
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
│   ├── account/                   # Tài khoản
│   │   ├── account.html
│   │   ├── account.css
│   │   └── account.js
│   ├── contact/                   # Liên hệ
│   │   ├── contact.html
│   │   ├── contact.css
│   │   └── contact.js
│   ├── about/                     # Về chúng tôi
│   │   ├── about.html
│   │   ├── about.css
│   │   └── about.js
│   └── pay/                       # Thanh toán
│       ├── pay.php
│       ├── pay.css
│       └── pay.js
│
├── staff/                          # 👨‍💼 NHÂN VIÊN
│   ├── handleComplaint/          # Xử lý khiếu nại
│   ├── handleContact/            # Xử lý liên hệ
│   ├── staffProfile/             # Hồ sơ nhân viên
│   └── ViewOrders/               # Xem đơn hàng
│
└── README.md                       # 📖 Tài liệu này
```

---

## 🚀 Cài đặt & Chạy

### 📋 Yêu cầu hệ thống

- ✅ **XAMPP/WAMP** đã cài đặt
- ✅ **PHP 7.4+** 
- ✅ **MySQL 5.7+**
- ✅ **Trình duyệt** hiện đại (Chrome, Firefox, Edge)

---

### 🔧 Bước 1: Chuẩn bị

1. **Cài đặt XAMPP:**
   - Tải về: [https://www.apachefriends.org/](https://www.apachefriends.org/)
   - Cài đặt vào `C:\xampp\`

2. **Clone/Copy project vào thư mục htdocs:**
   ```bash
   # Windows
   C:\xampp\htdocs\Nhom1_Ca4_CNPM\
   
   # hoặc copy thư mục project vào đây
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
   - Click nút **"Choose File"**
   - Chọn file: `database/schema.sql`
   - Click **"Go"** để thực thi
   - Đợi thông báo **"Import has been successfully finished"** ✅

#### Cách 2: Qua Command Line

```bash
# Mở CMD/PowerShell
cd C:\xampp\mysql\bin

# Import database
mysql -u root -p < "đường_dẫn_đến\database\schema.sql"

# Nhấn Enter nếu không có password
```

#### ✅ Kiểm tra database

- Database name: `lacuisinengot`
- Có **15 tables** được tạo
- Có dữ liệu mẫu: 12 sản phẩm, 9 users, 5 đơn hàng

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
http://localhost/Nhom1_Ca4_CNPM/pages/product/product.html
```

#### 🛒 **Giỏ hàng:**
```
http://localhost/Nhom1_Ca4_CNPM/pages/cart/cart.html
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
- ✅ **Xem chi tiết** sản phẩm (hình ảnh, giá, mô tả)
- ✅ **Giỏ hàng** thông minh (thêm, sửa, xóa)
- ✅ **Đặt hàng** với form đầy đủ
- ✅ **Theo dõi đơn hàng** của mình
- ✅ **Đánh giá sản phẩm** đã mua
- ✅ **Gửi khiếu nại** khi có vấn đề
- ✅ **Liên hệ** tư vấn
- ✅ **Đăng ký/Đăng nhập** tài khoản

### 👑 Cho Admin

#### 📊 Dashboard
- Thống kê doanh thu, đơn hàng
- Biểu đồ báo cáo theo tháng/năm
- Top sản phẩm bán chạy

#### 📦 Quản lý sản phẩm
- Thêm/Sửa/Xóa sản phẩm
- Quản lý danh mục
- Tìm kiếm, lọc sản phẩm
- Cập nhật số lượng, giá

#### 📋 Quản lý đơn hàng
- Xem danh sách đơn hàng
- Cập nhật trạng thái (Pending → Shipping → Completed)
- Xem chi tiết đơn hàng
- Lọc theo trạng thái

#### 👥 Quản lý người dùng
- Xem danh sách users (Admin/Staff/Customer)
- Thêm/Sửa/Xóa user
- Phân quyền (Role management)
- Lọc theo loại tài khoản

#### 🎁 Quản lý khuyến mãi
- Tạo mã giảm giá
- Thiết lập điều kiện áp dụng
- Theo dõi số lượt sử dụng
- Lọc theo trạng thái

#### 📞 Quản lý khiếu nại
- Xem danh sách khiếu nại
- Cập nhật trạng thái xử lý
- Phản hồi khách hàng

### 👨‍💼 Cho Staff (Nhân viên)

- ✅ Xem đơn hàng
- ✅ Xử lý liên hệ từ khách
- ✅ Xử lý khiếu nại
- ✅ Cập nhật hồ sơ cá nhân

---

## 🔌 API Endpoints

### 🔐 Authentication
```
POST   /api/auth/login.php       - Đăng nhập
POST   /api/auth/register.php    - Đăng ký
```

### 📦 Products
```
GET    /api/products.php          - Lấy danh sách sản phẩm
GET    /api/products.php?id=1     - Lấy chi tiết sản phẩm
POST   /api/products.php          - Tạo sản phẩm (Admin)
PUT    /api/products.php/{id}     - Cập nhật sản phẩm (Admin)
DELETE /api/products.php/{id}     - Xóa sản phẩm (Admin)
```

### 📋 Orders
```
GET    /api/orders.php             - Lấy danh sách đơn hàng
GET    /api/orders.php/{id}        - Chi tiết đơn hàng
POST   /api/orders.php             - Tạo đơn hàng mới
PUT    /api/orders.php/{id}/status - Cập nhật trạng thái
```

### 🛒 Cart
```
GET    /api/cart.php               - Lấy giỏ hàng
POST   /api/cart.php               - Thêm vào giỏ
PUT    /api/cart.php               - Cập nhật số lượng
DELETE /api/cart.php               - Xóa khỏi giỏ
```

### 👥 Users
```
GET    /api/users.php              - Danh sách users (Admin)
GET    /api/users.php/{id}         - Chi tiết user
POST   /api/users.php              - Tạo user (Admin)
PUT    /api/users.php/{id}         - Cập nhật user
DELETE /api/users.php/{id}         - Xóa user (Admin)
```

### 🎁 Promotions
```
GET    /api/promotions.php         - Danh sách khuyến mãi
POST   /api/promotions.php         - Tạo khuyến mãi (Admin)
```

### 📊 Reports
```
GET    /api/reports.php?period=month  - Báo cáo tháng
GET    /api/reports.php?period=year   - Báo cáo năm
```

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

### ❌ Lỗi: "Access Denied"

**Giải pháp:**
- Đăng nhập lại với tài khoản đúng
- Xóa cache trình duyệt (Ctrl + Shift + Delete)
- Kiểm tra role của user

### ❌ Lỗi: Ảnh không hiển thị

**Giải pháp:**
- Kiểm tra file ảnh trong `assets/images/`
- Xóa cache trình duyệt (Ctrl + F5)
- Kiểm tra đường dẫn trong database

### ❌ Lỗi: API không hoạt động

**Giải pháp:**
- Kiểm tra Apache đang chạy
- Kiểm tra Console trong trình duyệt (F12)
- Kiểm tra Network tab để xem request/response

---

## 📱 Responsive Design

Website hoạt động tốt trên mọi thiết bị:

- 📱 **Mobile:** 320px - 480px
- 📱 **Tablet:** 481px - 768px  
- 💻 **Desktop:** 769px - 1024px
- 🖥️ **Large Desktop:** 1025px+

---

## 🔒 Bảo mật

- ✅ **Password Hashing:** bcrypt
- ✅ **JWT Authentication:** Token-based
- ✅ **SQL Injection Prevention:** Prepared statements
- ✅ **XSS Protection:** Input sanitization
- ✅ **CORS:** Configured properly

---

## 🎯 Roadmap

### ✅ Đã hoàn thành
- [x] Frontend responsive đầy đủ
- [x] Backend API hoàn chỉnh
- [x] Admin panel đầy đủ tính năng
- [x] Database với dữ liệu mẫu
- [x] Authentication & Authorization

### 🚧 Tương lai
- [ ] Payment gateway (VNPay, MoMo)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Multi-language support
- [ ] Mobile app

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:

1. ✅ XAMPP Apache và MySQL đang chạy
2. ✅ Database đã import thành công
3. ✅ Đường dẫn file đúng
4. ✅ Trình duyệt đã xóa cache
5. ✅ PHP extensions đầy đủ

---

## 🎉 Hoàn tất!

Chúc bạn sử dụng thành công **LA CUISINE NGỌT**! 🎂🍰

**Made with ❤️ by Team Nhóm 1 - Ca 4 - CNPM**
