# LA CUISINE NGỌT - Hệ thống quản lý và bán bánh trực tuyến

## Tổng quan dự án

LA CUISINE NGỌT là một website bán bánh kem cao cấp được phát triển với mục tiêu mang đến trải nghiệm mua sắm trực tuyến tuyệt vời cho khách hàng. Dự án được xây dựng với công nghệ hiện đại, giao diện thân thiện và tính năng đầy đủ.

## Công nghệ sử dụng

### Frontend
- **HTML5**: Cấu trúc trang web semantic
- **CSS3**: Styling với Flexbox, Grid, animations
- **JavaScript (ES6+)**: Tương tác người dùng và API calls
- **Font Awesome**: Icons
- **Google Fonts**: Typography (Inter)

### Backend
- **PHP 7.4+**: Server-side logic
- **RESTful API**: API endpoints cho frontend
- **JWT**: Authentication và authorization
- **PDO/SQL Server**: Database connectivity

### Database
- **SQL Server**: Database chính
- **MySQL**: Alternative database support

## Cấu trúc dự án

```
LA CUISINE NGOT/
├── assets/
│   ├── css/
│   │   └── style.css          # Main stylesheet
│   ├── js/
│   │   └── main.js           # Main JavaScript file
│   └── images/               # Image assets
├── api/
│   ├── products.php          # Products API
│   ├── auth.php             # Authentication API
│   ├── orders.php           # Orders API
│   └── contact.php          # Contact API
├── database/
│   ├── schema.sql           # Database schema
│   └── connection.php       # Database connection
├── index.html               # Homepage
├── products.html            # Products listing
├── product-detail.html      # Product detail page
├── cart.html               # Shopping cart
├── checkout.html           # Checkout process
├── login.html              # Login page
├── register.html           # Registration page
├── about.html              # About us page
├── contact.html            # Contact page
├── admin.html              # Admin dashboard
└── README.md               # Project documentation
```

## Tính năng chính

### Cho khách hàng
- ✅ Đăng ký/đăng nhập tài khoản
- ✅ Duyệt danh sách sản phẩm với tìm kiếm và lọc
- ✅ Xem chi tiết sản phẩm (hình ảnh, mô tả, giá, nguyên liệu)
- ✅ Thêm sản phẩm vào giỏ hàng
- ✅ Quản lý giỏ hàng (thay đổi số lượng, xóa sản phẩm)
- ✅ Thanh toán đơn hàng
- ✅ Gửi yêu cầu tư vấn qua form liên hệ
- ✅ Xem lịch sử đơn hàng
- ✅ Giao diện responsive (PC, tablet, mobile)

### Cho quản trị viên
- ✅ Dashboard tổng quan
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý đơn hàng
- ✅ Quản lý khách hàng
- ✅ Quản lý liên hệ/tư vấn
- ✅ Thống kê doanh thu và báo cáo

## Cài đặt và chạy dự án

### Yêu cầu hệ thống
- PHP 7.4 hoặc cao hơn
- SQL Server hoặc MySQL
- Web server (Apache/Nginx)
- Composer (tùy chọn)

### Cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd LA-CUISINE-NGOT
```

2. **Cấu hình database**
- Tạo database mới
- Import file `database/schema.sql`
- Cập nhật thông tin kết nối trong `database/connection.php`

3. **Cấu hình web server**
- Đặt project vào thư mục web root
- Cấu hình virtual host (tùy chọn)

4. **Cấu hình PHP**
- Đảm bảo PHP extensions: PDO, SQL Server/MySQL
- Cấu hình `php.ini` nếu cần

### Chạy dự án

1. **Khởi động web server**
```bash
# Apache
sudo systemctl start apache2

# Nginx
sudo systemctl start nginx

# PHP built-in server (development)
php -S localhost:8000
```

2. **Truy cập website**
- Mở trình duyệt và truy cập: `http://localhost/LA-CUISINE-NGOT`
- Hoặc: `http://localhost:8000` (nếu dùng PHP built-in server)

## Cấu hình Database

### SQL Server
```sql
-- Tạo database
CREATE DATABASE LaCuisineNgot;

-- Import schema
-- Chạy file database/schema.sql
```

### MySQL (Alternative)
```sql
-- Tạo database
CREATE DATABASE lacuisinengot;

-- Import schema
-- Chạy file database/schema.sql
```

## API Endpoints

### Authentication
- `POST /api/auth.php` - Login/Register/Logout

### Products
- `GET /api/products.php` - Lấy danh sách sản phẩm
- `GET /api/products.php/{id}` - Lấy chi tiết sản phẩm
- `POST /api/products.php` - Tạo sản phẩm mới (Admin)
- `PUT /api/products.php/{id}` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products.php/{id}` - Xóa sản phẩm (Admin)

### Orders
- `GET /api/orders.php` - Lấy danh sách đơn hàng
- `GET /api/orders.php/{id}` - Lấy chi tiết đơn hàng
- `POST /api/orders.php` - Tạo đơn hàng mới

### Contact
- `GET /api/contact.php` - Lấy danh sách liên hệ (Admin)
- `POST /api/contact.php` - Gửi liên hệ

## Bảo mật

- **Password Hashing**: Sử dụng bcrypt
- **JWT Authentication**: Token-based authentication
- **Input Validation**: Sanitize và validate tất cả input
- **SQL Injection Prevention**: Sử dụng prepared statements
- **XSS Protection**: Escape output
- **CSRF Protection**: Token validation (có thể thêm)

## Responsive Design

Website được thiết kế responsive với breakpoints:
- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Performance

- **Lazy Loading**: Images và content
- **Minification**: CSS và JavaScript (có thể thêm)
- **Caching**: Browser caching headers
- **CDN**: Static assets (có thể thêm)

## Testing

### Manual Testing
- [ ] Test tất cả tính năng trên desktop
- [ ] Test responsive trên mobile/tablet
- [ ] Test các trình duyệt khác nhau
- [ ] Test API endpoints với Postman

### Automated Testing (Có thể thêm)
- Unit tests cho PHP functions
- Integration tests cho API
- E2E tests cho user flows

## Deployment

### Production Environment
1. **Web Server**: Apache/Nginx
2. **PHP**: 7.4+ với OPcache
3. **Database**: SQL Server/MySQL
4. **SSL**: HTTPS certificate
5. **Domain**: Point domain to server

### Environment Variables
```env
DB_HOST=localhost
DB_NAME=lacuisinengot
DB_USER=username
DB_PASS=password
JWT_SECRET=your-secret-key
```

## Monitoring và Logging

- **Error Logging**: PHP error logs
- **Application Logs**: Custom logging system
- **Performance Monitoring**: Có thể thêm APM tools

## Backup và Recovery

- **Database Backup**: Regular automated backups
- **File Backup**: Source code và uploads
- **Recovery Plan**: Documented recovery procedures

## Roadmap

### Phase 1 (Current)
- ✅ Basic e-commerce functionality
- ✅ Admin dashboard
- ✅ Responsive design

### Phase 2 (Future)
- [ ] Payment gateway integration (VNPay, PayPal)
- [ ] Email notifications
- [ ] Advanced search và filtering
- [ ] Wishlist functionality
- [ ] Product reviews và ratings

### Phase 3 (Future)
- [ ] Mobile app (React Native/Flutter)
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Advanced admin features

## Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

This project is licensed under the MIT License.

## Support

Để được hỗ trợ, vui lòng liên hệ:
- Email: support@lacuisinengot.com
- Phone: 0123 456 789

## Changelog

### Version 1.0.0 (2024-01-15)
- Initial release
- Basic e-commerce functionality
- Admin dashboard
- Responsive design
- API endpoints

---

**LA CUISINE NGỌT** - Thương hiệu bánh kem cao cấp hàng đầu Việt Nam

