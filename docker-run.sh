#!/bin/bash
# Script helper để chạy Docker cho LA CUISINE NGỌT

echo "🚀 LA CUISINE NGỌT - Docker Helper"
echo "=================================="
echo ""

# Kiểm tra Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker chưa được cài đặt. Vui lòng cài đặt Docker trước."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose chưa được cài đặt. Vui lòng cài đặt Docker Compose trước."
    exit 1
fi

# Menu
echo "Chọn hành động:"
echo "1. Khởi động containers (lần đầu)"
echo "2. Khởi động containers (đã có sẵn)"
echo "3. Dừng containers"
echo "4. Khởi động lại containers"
echo "5. Xem logs"
echo "6. Xem trạng thái containers"
echo "7. Dừng và xóa containers (giữ data)"
echo "8. Dừng và xóa containers + volumes (xóa data)"
echo "9. Rebuild containers"
echo "10. Truy cập phpMyAdmin"
echo ""
read -p "Nhập lựa chọn (1-10): " choice

case $choice in
    1)
        echo "🔨 Building và khởi động containers lần đầu..."
        docker-compose up -d --build
        echo ""
        echo "✅ Hoàn tất! Truy cập:"
        echo "   - Website: http://localhost:8080"
        echo "   - phpMyAdmin: http://localhost:8081"
        ;;
    2)
        echo "▶️ Khởi động containers..."
        docker-compose up -d
        echo ""
        echo "✅ Containers đã khởi động!"
        ;;
    3)
        echo "⏹️ Dừng containers..."
        docker-compose stop
        echo "✅ Containers đã dừng!"
        ;;
    4)
        echo "🔄 Khởi động lại containers..."
        docker-compose restart
        echo "✅ Containers đã khởi động lại!"
        ;;
    5)
        echo "📋 Logs của containers (Nhấn Ctrl+C để thoát):"
        docker-compose logs -f
        ;;
    6)
        echo "📊 Trạng thái containers:"
        docker-compose ps
        ;;
    7)
        echo "🗑️ Dừng và xóa containers (giữ data)..."
        docker-compose down
        echo "✅ Đã xóa containers nhưng giữ data!"
        ;;
    8)
        echo "⚠️ Cảnh báo: Hành động này sẽ xóa tất cả data!"
        read -p "Bạn có chắc chắn? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            docker-compose down -v
            echo "✅ Đã xóa containers và data!"
        else
            echo "❌ Đã hủy!"
        fi
        ;;
    9)
        echo "🔨 Rebuild containers..."
        docker-compose up -d --build --force-recreate
        echo "✅ Rebuild hoàn tất!"
        ;;
    10)
        echo "🌐 Mở phpMyAdmin trong trình duyệt..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open http://localhost:8081
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            xdg-open http://localhost:8081
        elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
            start http://localhost:8081
        fi
        echo "✅ Đã mở phpMyAdmin!"
        ;;
    *)
        echo "❌ Lựa chọn không hợp lệ!"
        exit 1
        ;;
esac

