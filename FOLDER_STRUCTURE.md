# Cấu trúc thư mục LA CUISINE NGỌT

## Tổng quan
Website được tổ chức theo cấu trúc thư mục riêng biệt cho từng trang, giúp dễ quản lý và bảo trì code.

## Cấu trúc thư mục

```
LA CUISINE NGOT/
├── index.html                          # Redirect đến pages/home/home.html
├── pages/                              # Tất cả các trang
│   ├── home/                           # Trang chủ (tách riêng)
│   │   ├── home.html
│   │   ├── home.css
│   │   └── home.js
├── assets/                             # Tài nguyên chung
│   ├── css/
│   │   ├── style.css                   # CSS chung cho toàn site
│   │   └── animations.css              # CSS animations
│   ├── js/
│   │   ├── main.js                     # JavaScript chung
│   │   └── image-handler.js            # Xử lý ảnh
│   └── images/                         # Thư mục ảnh
│       ├── README.md                   # Hướng dẫn sử dụng ảnh
│       ├── placeholder-cake.jpg        # Ảnh placeholder bánh
│       └── placeholder-person.jpg      # Ảnh placeholder người
├── admin/                              # Trang quản trị
│   ├── admin.html
│   ├── admin.css
│   └── admin.js
├── pages/                              # Các trang khác
│   ├── login/                          # Trang đăng nhập
│   │   ├── login.html
│   │   ├── login.css
│   │   └── login.js
│   ├── register/                       # Trang đăng ký
│   │   ├── register.html
│   │   ├── register.css
│   │   └── register.js
│   ├── products/                       # Trang sản phẩm
│   │   ├── products.html
│   │   ├── products.css
│   │   └── products.js
│   ├── product-detail/                 # Trang chi tiết sản phẩm
│   │   ├── product-detail.html
│   │   ├── product-detail.css
│   │   └── product-detail.js
│   ├── cart/                           # Trang giỏ hàng
│   │   ├── cart.html
│   │   ├── cart.css
│   │   └── cart.js
│   ├── checkout/                       # Trang thanh toán
│   │   ├── checkout.html
│   │   ├── checkout.css
│   │   └── checkout.js
│   ├── contact/                        # Trang liên hệ
│   │   ├── contact.html
│   │   ├── contact.css
│   │   └── contact.js
│   ├── about/                          # Trang về chúng tôi
│   │   ├── about.html
│   │   ├── about.css
│   │   └── about.js
│   └── order-confirmation/             # Trang xác nhận đơn hàng
│       ├── order-confirmation.html
│       ├── order-confirmation.css
│       └── order-confirmation.js
├── api/                                # Backend API
│   ├── auth.php                        # API xác thực
│   ├── products.php                    # API sản phẩm
│   ├── orders.php                      # API đơn hàng
│   └── contact.php                     # API liên hệ
├── database/                           # Database
│   ├── schema.sql                      # Cấu trúc database
│   └── connection.php                  # Kết nối database
├── create-pages.js                     # Script tạo trang tự động
├── .gitignore                          # Git ignore
└── README.md                           # Hướng dẫn dự án
```

## Quy tắc đặt tên

### HTML Files
- Sử dụng tên trang làm tên file: `login.html`, `register.html`
- Tất cả file HTML đều có cấu trúc chuẩn HTML5

### CSS Files
- Mỗi trang có file CSS riêng: `login.css`, `register.css`
- File CSS chung: `style.css`, `animations.css`
- Sử dụng BEM methodology cho class names

### JavaScript Files
- Mỗi trang có file JS riêng: `login.js`, `register.js`
- File JS chung: `main.js`, `image-handler.js`
- Sử dụng ES6+ syntax

## Đường dẫn tương đối

### Từ trang chủ (index.html)
```html
<!-- CSS -->
<link rel="stylesheet" href="assets/css/style.css">

<!-- JavaScript -->
<script src="assets/js/main.js"></script>

<!-- Images -->
<img src="assets/images/hero-cake.jpg" alt="Bánh kem">
```

### Từ trang trong thư mục pages/
```html
<!-- CSS -->
<link rel="stylesheet" href="../../assets/css/style.css">
<link rel="stylesheet" href="login.css">

<!-- JavaScript -->
<script src="../../assets/js/main.js"></script>
<script src="login.js"></script>

<!-- Images -->
<img src="../../assets/images/hero-cake.jpg" alt="Bánh kem">
```

### Từ trang admin/
```html
<!-- CSS -->
<link rel="stylesheet" href="../assets/css/style.css">
<link rel="stylesheet" href="admin.css">

<!-- JavaScript -->
<script src="../assets/js/main.js"></script>
<script src="admin.js"></script>

<!-- Images -->
<img src="../assets/images/hero-cake.jpg" alt="Bánh kem">
```

## Cấu trúc CSS

### File style.css (Chung)
- Reset và base styles
- Layout chung (navbar, footer, container)
- Component chung (buttons, forms, cards)
- Responsive design

### File animations.css (Chung)
- Keyframes animations
- Animation classes
- Transition effects
- Loading animations

### File trang riêng (VD: login.css)
- Styles cụ thể cho trang đó
- Override styles nếu cần
- Responsive cho trang đó

## Cấu trúc JavaScript

### File main.js (Chung)
- Utility functions
- Common event handlers
- Navigation logic
- Cart management

### File image-handler.js (Chung)
- Image loading và fallback
- Lazy loading
- Image optimization

### File trang riêng (VD: login.js)
- Logic cụ thể cho trang đó
- Form handling
- API calls
- Page-specific functionality

## Lợi ích của cấu trúc này

1. **Tổ chức rõ ràng**: Mỗi trang có thư mục riêng
2. **Dễ bảo trì**: Tìm và sửa code dễ dàng
3. **Tái sử dụng**: CSS và JS chung được chia sẻ
4. **Scalable**: Dễ thêm trang mới
5. **Team work**: Nhiều người có thể làm việc song song
6. **Performance**: Chỉ load code cần thiết cho từng trang

## Hướng dẫn thêm trang mới

1. Tạo thư mục mới trong `pages/`
2. Tạo 3 file: `pagename.html`, `pagename.css`, `pagename.js`
3. Copy cấu trúc từ trang có sẵn
4. Cập nhật đường dẫn tương đối
5. Thêm link navigation nếu cần

## Lưu ý quan trọng

- Luôn sử dụng đường dẫn tương đối
- Kiểm tra console để debug lỗi đường dẫn
- Test responsive trên nhiều thiết bị
- Optimize images trước khi upload
- Sử dụng semantic HTML
- Tuân thủ accessibility guidelines
