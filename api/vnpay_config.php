<?php
// Tệp: api/vnpay_config.php
date_default_timezone_set('Asia/Ho_Chi_Minh');

/*
  1) COPY CHÍNH XÁC FORWARDING URL TỪ NGROK WEB UI (http://127.0.0.1:4040)
     Ví dụ hợp lệ: https://salpiform-cecille-unsy.ngrok-free.app
     => Dán **toàn bộ** URL đó vào $BASE_URL (kể cả https:// và phần đuôi).
*/
$BASE_URL = "https://<PASTE_FULL_NGROK_FORWARDING_HERE>"; // <- Thay chỗ này bằng URL ngrok copy từ web UI

/*
  2) PROJECT_PATH: đường dẫn xuất hiện trong URL khi bạn mở dự án tại localhost.
     - Nếu vào trang bằng: http://localhost/Nhom1_Ca4_CNPM thì để "/Nhom1_Ca4_CNPM"
     - Nếu vào bằng: http://localhost (serve ở root) thì để ""
     KHÔNG nhập đường dẫn hệ thống (vd: C:\... hay /dm_git/...), mà là path trên URL.
*/
$PROJECT_PATH = "/Nhom1_Ca4_CNPM"; // <- chỉnh theo cách truy cập web của bạn (hoặc "" nếu serve ở root)

/*
  3) Thông tin VNPAY (đã gửi từ VNPAY qua email)
*/
$vnp_TmnCode = "48ZTZ3SY"; // giữ nguyên
$vnp_HashSecret = "I5GME99JRL54FPK552XJRAFZMD04I4Q2"; // giữ nguyên

// --- Không cần sửa các dòng dưới ---
// VNPay Sandbox (Môi trường test - VNPay thật nhưng không tính phí thật)
// Để chuyển sang Production (thực tế), đổi URL thành:
// $vnp_Url = "https://www.vnpayment.vn/paymentv2/vpcpay.html";
// $vnp_Api = "https://www.vnpayment.vn/merchant_webapi/api/transaction";
$vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
$vnp_Api = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";

// đảm bảo không có "//" thừa khi nối chuỗi
$base = rtrim($BASE_URL, '/');
$path = $PROJECT_PATH === "" ? "" : '/' . trim($PROJECT_PATH, '/');

$vnp_Returnurl = $base . $path . "/pages/pay/pay-success.html"; // Trang trả về
$vnp_Ipnurl = $base . $path . "/api/vnpay_ipn.php"; // Trang nhận tín hiệu (IPN)
