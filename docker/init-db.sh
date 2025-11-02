#!/bin/bash
# Script để khởi tạo database
# Đợi MySQL sẵn sàng
echo "Waiting for MySQL to be ready..."
while ! mysqladmin ping -h db --silent; do
    sleep 1
done

echo "MySQL is ready!"

