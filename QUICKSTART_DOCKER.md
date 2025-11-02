# 🚀 Hướng dẫn nhanh - Docker

## ⚡ Chạy nhanh ứng dụng trong 3 bước

### Bước 1: Khởi động containers

**Windows:**
```bash
docker-compose up -d --build
```

**Hoặc dùng script helper:**
```bash
docker-run.bat
```

**Linux/Mac:**
```bash
chmod +x docker-run.sh
./docker-run.sh
```

### Bước 2: Đợi containers khởi động (30-60 giây)

Kiểm tra trạng thái:
```bash
docker-compose ps
```

Xem logs:
```bash
docker-compose logs -f
```

### Bước 3: Truy cập ứng dụng

- **Website:** http://localhost:8080
- **phpMyAdmin:** http://localhost:8081

## 📝 Lưu ý quan trọng

1. **Database tự động được tạo** từ file `database/schema.sql`
2. **File `api/config/database.php` tự động phát hiện Docker** - không cần chỉnh sửa
3. **Tất cả dữ liệu được lưu trong Docker volume** - sẽ mất khi xóa volume

## 🛑 Dừng ứng dụng

```bash
docker-compose stop
```

## 🗑️ Xóa tất cả (bao gồm database)

```bash
docker-compose down -v
```

## 📚 Xem hướng dẫn chi tiết

Xem file `DOCKER.md` để biết thêm chi tiết và troubleshooting.

