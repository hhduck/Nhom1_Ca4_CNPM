// qr-payment.js - Xử lý thanh toán QR

// ⚙️ CẤU HÌNH NGÂN HÀNG (SỬA LẠI CHO ĐÚNG)
const BANK_CONFIG = {
    bankId: 'ACB',              // Mã ngân hàng: ACB, MB, VCB, TCB...
    accountNo: '12343301',      // ⚠️ Số tài khoản thật
    accountName: 'HOANG HUU DUC', // ⚠️ Tên chủ TK (VIẾT HOA, KHÔNG DẤU)
    template: 'compact'         // Giao diện QR: compact, compact2, print, qr_only
};

// 📥 Lấy thông tin đơn hàng từ URL
function getOrderInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        orderCode: urlParams.get('order_code'),
        amount: parseInt(urlParams.get('amount') || '0'),
        customerName: decodeURIComponent(urlParams.get('customer_name') || '')
    };
}

// 💰 Format tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0
    }).format(amount);
}

// 📋 Sao chép text vào clipboard
function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("✅ Đã sao chép: " + text);
    }).catch(() => {
        alert("❌ Không thể sao chép. Vui lòng chọn thủ công.");
    });
}

// 🚀 Khởi tạo trang khi load
document.addEventListener('DOMContentLoaded', () => {
    const orderInfo = getOrderInfo();

    // Kiểm tra thông tin đơn hàng
    if (!orderInfo.orderCode || orderInfo.amount <= 0) {
        alert("⚠️ Lỗi: Thiếu thông tin đơn hàng!");
        window.location.href = "../home/home.html";
        return;
    }

    // Hiển thị thông tin lên giao diện
    document.getElementById('bankNameDisplay').textContent = BANK_CONFIG.accountName;
    document.getElementById('amountToPay').textContent = formatCurrency(orderInfo.amount);
    document.getElementById('transferNote').textContent = orderInfo.orderCode;

    // Hiển thị số tài khoản + nút Copy
    document.getElementById('bankAccount').innerHTML = `
        ${BANK_CONFIG.accountNo} 
        <button class="copy-btn" onclick="copyText('${BANK_CONFIG.accountNo}')" title="Sao chép">
            <i class="fas fa-copy"></i>
        </button>
    `;

    // 🔥 Tạo mã QR ĐỘNG bằng VietQR API
    const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-${BANK_CONFIG.template}.png?amount=${orderInfo.amount}&addInfo=${encodeURIComponent(orderInfo.orderCode)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;

    // Tải ảnh QR
    const qrImg = document.getElementById('qrCodeImage');
    const loading = document.getElementById('loadingQR');

    qrImg.src = qrUrl;
    
    qrImg.onload = () => {
        loading.style.display = 'none';
        qrImg.style.display = 'block';
    };

    qrImg.onerror = () => {
        loading.innerHTML = '<span style="color:red">❌ Lỗi tải mã QR. Vui lòng nhập tay thông tin.</span>';
    };
});

// ✅ Xử lý khi nhấn "Tôi đã chuyển khoản xong"
async function handleConfirmPayment() {
    const btn = document.getElementById('btnConfirm');
    const spinner = document.getElementById('btnSpinner');
    const btnText = document.getElementById('btnText');
    const orderInfo = getOrderInfo();

    // Hiệu ứng loading
    btn.disabled = true;
    spinner.style.display = 'block';
    btnText.textContent = 'Đang xử lý...';

    try {
        // Lấy thông tin user
        const jwtToken = localStorage.getItem('jwtToken');
        let currentUser = null;
        try {
            currentUser = JSON.parse(localStorage.getItem("currentUser"));
        } catch (e) {
            console.error("Lỗi parse currentUser:", e);
        }

        if (!currentUser || !currentUser.id) {
            throw new Error("Vui lòng đăng nhập để tiếp tục");
        }

        // Lấy dữ liệu giỏ hàng từ sessionStorage
        const storedCartItems = JSON.parse(sessionStorage.getItem('cartItems') || "[]");

        if (storedCartItems.length === 0) {
            throw new Error("Giỏ hàng trống");
        }

        // Chuẩn bị dữ liệu gửi API
        const orderData = {
            user_id: currentUser.id,
            customer_name: sessionStorage.getItem('customerName') || currentUser.full_name,
            customer_phone: sessionStorage.getItem('customerPhone') || currentUser.phone,
            customer_email: sessionStorage.getItem('customerEmail') || currentUser.email,
            delivery_method: sessionStorage.getItem('deliveryMethod') || 'store',
            shipping_address: sessionStorage.getItem('shippingAddress') || '',
            ward: sessionStorage.getItem('ward') || '',
            district: sessionStorage.getItem('district') || '',
            city: 'TP. Hồ Chí Minh',
            delivery_time: sessionStorage.getItem('deliveryTime') || '',
            order_note: sessionStorage.getItem('orderNote') || '',
            items: storedCartItems,
            promotion_code: sessionStorage.getItem('promotionCode') || null,

            // Thông tin tiền
            total_amount: parseInt(sessionStorage.getItem('totalAmount') || '0'),
            shipping_fee: parseInt(sessionStorage.getItem('shippingFee') || '0'),
            vat_amount: parseInt(sessionStorage.getItem('vatAmount') || '0'),
            discount_amount: parseInt(sessionStorage.getItem('discountAmount') || '0'),
            final_amount: orderInfo.amount,

            // ⚠️ QUAN TRỌNG: Đánh dấu thanh toán QR
            payment_method: 'bank_transfer',
            payment_status: 'pending',      // Chờ nhân viên xác nhận
            order_status: 'pending'         // Đơn hàng chờ xử lý
        };

        // Gọi API tạo đơn hàng
        const response = await fetch('../../api/orders.php', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (result.success && result.data) {
            // ✅ Thành công - Xóa giỏ hàng
            
            // Xóa giỏ hàng trên server
            await fetch(`../../api/cart.php?user_id=${currentUser.id}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`
                }
            }).then(async (res) => {
                const cartData = await res.json();
                if (cartData.success && cartData.data.items.length > 0) {
                    for (const item of cartData.data.items) {
                        await fetch(`../../api/cart.php/${item.cart_id}`, {
                            method: 'DELETE',
                            credentials: 'include',
                            headers: {
                                'Authorization': `Bearer ${jwtToken}`
                            }
                        });
                    }
                }
            }).catch((err) => {
                console.error("Lỗi xóa giỏ hàng:", err);
            });

            // Xóa sessionStorage
            sessionStorage.removeItem('cartItems');
            sessionStorage.removeItem('customerPhone');
            sessionStorage.removeItem('customerEmail');
            sessionStorage.removeItem('customerName');
            sessionStorage.removeItem('deliveryMethod');
            sessionStorage.removeItem('shippingAddress');
            sessionStorage.removeItem('ward');
            sessionStorage.removeItem('district');
            sessionStorage.removeItem('deliveryTime');
            sessionStorage.removeItem('orderNote');
            sessionStorage.removeItem('promotionCode');
            sessionStorage.removeItem('shippingFee');
            sessionStorage.removeItem('vatAmount');
            sessionStorage.removeItem('discountAmount');
            sessionStorage.removeItem('totalAmount');
            sessionStorage.removeItem('finalAmount');

            // Thông báo thành công
            alert(
                `✅ ĐẶT HÀNG THÀNH CÔNG!\n\n` +
                `Mã đơn: ${result.data.order_code}\n\n` +
                `📌 Lưu ý: Nhân viên sẽ kiểm tra và xác nhận thanh toán của bạn trong vài phút.\n\n` +
                `Cảm ơn bạn đã tin tưởng La Cuisine Ngọt! 🍰`
            );

            // Chuyển về trang chủ
            window.location.href = '../home/home.html';

        } else {
            throw new Error(result.message || 'Không thể tạo đơn hàng');
        }

    } catch (error) {
        console.error('Lỗi:', error);
        alert('❌ Có lỗi xảy ra: ' + error.message);

        // Reset nút về trạng thái ban đầu
        btn.disabled = false;
        spinner.style.display = 'none';
        btnText.textContent = 'Tôi đã chuyển khoản xong';
    }
}