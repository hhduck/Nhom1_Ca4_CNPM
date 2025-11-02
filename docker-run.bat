@echo off
REM Script helper để chạy Docker cho LA CUISINE NGỌT (Windows)

echo ===================================
echo LA CUISINE NGOT - Docker Helper
echo ===================================
echo.

REM Kiểm tra Docker
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker chua duoc cai dat. Vui long cai dat Docker truoc.
    pause
    exit /b 1
)

REM Menu
echo Chon hanh dong:
echo 1. Khoi dong containers (lan dau)
echo 2. Khoi dong containers (da co san)
echo 3. Dung containers
echo 4. Khoi dong lai containers
echo 5. Xem logs
echo 6. Xem trang thai containers
echo 7. Dung va xoa containers (giu data)
echo 8. Dung va xoa containers + volumes (xoa data)
echo 9. Rebuild containers
echo 10. Mo phpMyAdmin trong trinh duyet
echo.
set /p choice="Nhap lua chon (1-10): "

if "%choice%"=="1" (
    echo Building va khoi dong containers lan dau...
    docker-compose up -d --build
    echo.
    echo Hoan tat! Truy cap:
    echo    - Website: http://localhost:8080
    echo    - phpMyAdmin: http://localhost:8081
) else if "%choice%"=="2" (
    echo Khoi dong containers...
    docker-compose up -d
    echo Containers da khoi dong!
) else if "%choice%"=="3" (
    echo Dung containers...
    docker-compose stop
    echo Containers da dung!
) else if "%choice%"=="4" (
    echo Khoi dong lai containers...
    docker-compose restart
    echo Containers da khoi dong lai!
) else if "%choice%"=="5" (
    echo Logs cua containers (Nhan Ctrl+C de thoat):
    docker-compose logs -f
) else if "%choice%"=="6" (
    echo Trang thai containers:
    docker-compose ps
) else if "%choice%"=="7" (
    echo Dung va xoa containers (giu data)...
    docker-compose down
    echo Da xoa containers nhung giu data!
) else if "%choice%"=="8" (
    echo CANH BAO: Hanh dong nay se xoa tat ca data!
    set /p confirm="Ban co chac chan? (yes/no): "
    if "%confirm%"=="yes" (
        docker-compose down -v
        echo Da xoa containers va data!
    ) else (
        echo Da huy!
    )
) else if "%choice%"=="9" (
    echo Rebuild containers...
    docker-compose up -d --build --force-recreate
    echo Rebuild hoan tat!
) else if "%choice%"=="10" (
    echo Mo phpMyAdmin trong trinh duyet...
    start http://localhost:8081
    echo Da mo phpMyAdmin!
) else (
    echo Lua chon khong hop le!
    pause
    exit /b 1
)

pause

