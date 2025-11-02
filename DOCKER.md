# 🐳 Hướng dẫn sử dụng Docker cho LA CUISINE NGỌT

## 📋 Yêu cầu

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB RAM trống (khuyến nghị)
- Port 8080, 3306, 8081 trống

## 🚀 Cài đặt và chạy ứng dụng

### Bước 1: Clone repository và di chuyển vào thư mục dự án

```bash
cd Nhom1_Ca4_CNPM
```

### Bước 2: Cấu hình Database (Tùy chọn)

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` nếu cần thay đổi cấu hình mặc định:

```env
DB_HOST=db
DB_NAME=lacuisinengot
DB_USER=root
DB_PASSWORD=
DB_ROOT_PASSWORD=rootpassword
```

### Bước 3: Cấu hình Database Connection trong PHP

Mở file `api/config/database.php` và cập nhật:

```php
private $host = "db";  // Thay vì "localhost"
private $database_name = "lacuisinengot";
private $username = "root";
private $password = "";  // Để trống nếu không có password
```

**Lưu ý:** Trong Docker, host của database là tên service trong `docker-compose.yml`, tức là `db`.

### Bước 4: Build và khởi động containers

```bash
docker-compose up -d --build
```

Lệnh này sẽ:
- Build image PHP với Apache
- Tạo và khởi động MySQL container
- Tự động import database schema từ `database/schema.sql`
- Khởi động phpMyAdmin

### Bước 5: Kiểm tra ứng dụng

Mở trình duyệt và truy cập:
- **Website:** http://localhost:8080
- **phpMyAdmin:** http://localhost:8081

## 📦 Các Services

### 1. Web Server (PHP + Apache)
- **Container:** `lacuisine-web`
- **Port:** 8080 → 80
- **URL:** http://localhost:8080

### 2. MySQL Database
- **Container:** `lacuisine-db`
- **Port:** 3306 → 3306
- **Host:** `db` (trong Docker network)
- **Database:** `lacuisinengot`
- **User:** `root`
- **Password:** (trống hoặc theo file .env)

### 3. phpMyAdmin
- **Container:** `lacuisine-phpmyadmin`
- **Port:** 8081 → 80
- **URL:** http://localhost:8081
- **Username:** `root`
- **Password:** (theo file .env)

## 🔧 Các lệnh Docker hữu ích

### Xem logs
```bash
# Xem logs của tất cả services
docker-compose logs -f

# Xem logs của web server
docker-compose logs -f web

# Xem logs của database
docker-compose logs -f db
```

### Dừng containers
```bash
docker-compose stop
```

### Khởi động lại containers
```bash
docker-compose restart
```

### Dừng và xóa containers
```bash
docker-compose down
```

### Dừng và xóa containers + volumes (xóa database)
```bash
docker-compose down -v
```

### Rebuild containers
```bash
docker-compose up -d --build --force-recreate
```

### Vào container để chạy lệnh
```bash
# Vào container web
docker-compose exec web bash

# Vào container database
docker-compose exec db mysql -u root -p
```

## 🗄️ Quản lý Database

### Import database thủ công

```bash
# Copy file schema.sql vào container
docker cp database/schema.sql lacuisine-db:/tmp/schema.sql

# Import vào MySQL
docker-compose exec db mysql -u root -p lacuisinengot < database/schema.sql
```

### Export database

```bash
docker-compose exec db mysqldump -u root -p lacuisinengot > backup.sql
```

### Truy cập MySQL CLI

```bash
docker-compose exec db mysql -u root -p
```

## 🐛 Troubleshooting

### Lỗi: "Cannot connect to database"

1. Kiểm tra database container đang chạy:
```bash
docker-compose ps
```

2. Kiểm tra logs của database:
```bash
docker-compose logs db
```

3. Đảm bảo file `api/config/database.php` có `host = "db"` (không phải `localhost`)

### Lỗi: Port đã được sử dụng

Thay đổi ports trong `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Thay 8080 bằng port khác
```

### Lỗi: Permission denied

Trên Linux/Mac, có thể cần chạy với sudo:
```bash
sudo docker-compose up -d
```

### Reset database về trạng thái ban đầu

```bash
docker-compose down -v
docker-compose up -d
```

## 📝 Lưu ý quan trọng

1. **Database Host:** Trong Docker, luôn sử dụng `db` làm host, không phải `localhost`

2. **File Uploads:** File uploads sẽ được lưu trực tiếp vào thư mục dự án (vì có volume mount)

3. **Development vs Production:**
   - Development: Sử dụng volume mount để code thay đổi được áp dụng ngay
   - Production: Nên build image và không dùng volume mount để tối ưu hiệu suất

4. **Environment Variables:** 
   - Sử dụng file `.env` để cấu hình
   - Không commit file `.env` vào Git (đã có trong .gitignore)

## 🔐 Bảo mật cho Production

Khi deploy lên production:

1. Đổi tất cả passwords trong `.env`
2. Không expose MySQL port ra ngoài
3. Sử dụng strong passwords
4. Cấu hình firewall
5. Sử dụng HTTPS/SSL
6. Không sử dụng `root` user cho database trong production

## 📚 Tài liệu thêm

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PHP Docker Official Image](https://hub.docker.com/_/php)

