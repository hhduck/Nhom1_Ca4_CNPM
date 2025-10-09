/**
 * Order Confirmation Page JavaScript
 * Handles order confirmation functionality for LA CUISINE NGỌT
 */

// Load order confirmation page on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    loadOrderDetails();
    updateCartCount();
    setupAnimations();
    setupPrintFunctionality();
});

function loadOrderDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    
    if (orderId) {
        // Try to load order from localStorage first
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const order = orders.find(o => o.order_id === orderId);
        
        if (order) {
            displayOrderDetails(order);
        } else {
            // Fallback to demo data
            displayOrderDetails(createDemoOrder(orderId));
        }
    } else {
        // No order ID, show demo data
        displayOrderDetails(createDemoOrder('DEMO001'));
    }
}

function createDemoOrder(orderId) {
    return {
        order_id: orderId,
        order_number: 'ORD' + new Date().getTime(),
        total_amount: 750000,
        status: 'pending',
        items: [
            {
                name: 'Bánh Kem Chocolate Premium',
                quantity: 2,
                price: 250000,
                image: '../../assets/images/placeholder-cake.jpg'
            },
            {
                name: 'Bánh Kem Vanilla Deluxe',
                quantity: 1,
                price: 200000,
                image: '../../assets/images/placeholder-cake.jpg'
            }
        ],
        shipping_address: '123 Đường ABC, Quận 1, TP.HCM',
        shipping_phone: '0123456789',
        customer_name: 'Nguyễn Văn A',
        customer_email: 'nguyenvana@email.com',
        payment_method: 'cod',
        notes: 'Giao hàng vào buổi chiều',
        created_at: new Date().toLocaleString('vi-VN'),
        estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleString('vi-VN')
    };
}

function displayOrderDetails(order) {
    const orderDetails = document.getElementById('orderDetails');
    
    // Show loading state
    orderDetails.classList.add('loading');
    
    // Simulate loading delay
    setTimeout(() => {
        orderDetails.classList.remove('loading');
        
        orderDetails.innerHTML = `
            <div class="order-info">
                <h3>Thông tin đơn hàng</h3>
                <div class="info-row">
                    <span>Mã đơn hàng:</span>
                    <strong>${order.order_number}</strong>
                </div>
                <div class="info-row">
                    <span>Ngày đặt:</span>
                    <span>${order.created_at}</span>
                </div>
                <div class="info-row">
                    <span>Trạng thái:</span>
                    <span class="status ${order.status}">${getStatusText(order.status)}</span>
                </div>
                ${order.estimated_delivery ? `
                <div class="info-row">
                    <span>Dự kiến giao hàng:</span>
                    <span>${order.estimated_delivery}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="order-items">
                <h3>Sản phẩm đã đặt</h3>
                ${order.items.map(item => `
                    <div class="order-item">
                        <div class="item-info">
                            <img src="${item.image || '../../assets/images/placeholder-cake.jpg'}" 
                                 alt="${item.name}" 
                                 class="item-image"
                                 onerror="this.src='../../assets/images/placeholder-cake.jpg'">
                            <div class="item-details">
                                <span class="item-name">${item.name}</span>
                                <span class="item-quantity">Số lượng: ${item.quantity}</span>
                            </div>
                        </div>
                        <span class="item-price">${formatPrice(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-summary">
                <div class="summary-row">
                    <span>Tạm tính:</span>
                    <span>${formatPrice(order.total_amount)}</span>
                </div>
                <div class="summary-row">
                    <span>Phí vận chuyển:</span>
                    <span class="free-shipping">Miễn phí</span>
                </div>
                <div class="summary-row total">
                    <span>Tổng cộng:</span>
                    <span>${formatPrice(order.total_amount)}</span>
                </div>
            </div>
            
            <div class="shipping-info">
                <h3>Thông tin giao hàng</h3>
                <div class="info-row">
                    <span>Khách hàng:</span>
                    <span>${order.customer_name || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span>Email:</span>
                    <span>${order.customer_email || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span>Địa chỉ:</span>
                    <span>${order.shipping_address}</span>
                </div>
                <div class="info-row">
                    <span>Số điện thoại:</span>
                    <span>${order.shipping_phone}</span>
                </div>
                <div class="info-row">
                    <span>Phương thức thanh toán:</span>
                    <span>${getPaymentMethodText(order.payment_method)}</span>
                </div>
                ${order.notes ? `
                <div class="info-row">
                    <span>Ghi chú:</span>
                    <span>${order.notes}</span>
                </div>
                ` : ''}
            </div>
        `;
        
        // Trigger success animation
        triggerSuccessAnimation();
        
    }, 1000);
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xác nhận',
        'confirmed': 'Đã xác nhận',
        'processing': 'Đang chuẩn bị',
        'shipped': 'Đang giao hàng',
        'delivered': 'Đã giao hàng',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || 'Không xác định';
}

function getPaymentMethodText(method) {
    const methodMap = {
        'cod': 'Thanh toán khi nhận hàng (COD)',
        'bank': 'Chuyển khoản ngân hàng',
        'vnpay': 'VNPay',
        'momo': 'MoMo',
        'paypal': 'PayPal'
    };
    return methodMap[method] || 'Không xác định';
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

function triggerSuccessAnimation() {
    const successIcon = document.querySelector('.success-icon');
    if (successIcon) {
        successIcon.classList.add('animate');
        setTimeout(() => {
            successIcon.classList.remove('animate');
        }, 2000);
    }
}

function setupAnimations() {
    // Animate step numbers on scroll
    const stepItems = document.querySelectorAll('.step-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stepNumber = entry.target.querySelector('.step-number');
                if (stepNumber) {
                    stepNumber.style.animation = 'bounceIn 0.6s ease-out';
                }
            }
        });
    }, {
        threshold: 0.5
    });
    
    stepItems.forEach(item => {
        observer.observe(item);
    });
}

function setupPrintFunctionality() {
    // Add print button
    const actionButtons = document.querySelector('.action-buttons');
    if (actionButtons) {
        const printButton = document.createElement('a');
        printButton.href = '#';
        printButton.className = 'btn-secondary';
        printButton.innerHTML = '<i class="fas fa-print"></i> In đơn hàng';
        printButton.addEventListener('click', function(e) {
            e.preventDefault();
            printOrder();
        });
        actionButtons.appendChild(printButton);
    }
}

function printOrder() {
    const printContent = document.querySelector('.confirmation-content').innerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Đơn hàng - LA CUISINE NGỌT</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .success-icon { text-align: center; margin-bottom: 20px; }
                .success-icon i { font-size: 3rem; color: #28a745; }
                h1 { text-align: center; color: #2d5016; margin-bottom: 20px; }
                .order-details h3 { color: #2d5016; border-bottom: 2px solid #2d5016; padding-bottom: 5px; }
                .order-info, .order-items, .order-summary, .shipping-info { 
                    background: #f8f9fa; 
                    padding: 15px; 
                    margin-bottom: 15px; 
                    border-radius: 5px; 
                }
                .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                .order-item { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #eee; }
                .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                .summary-row.total { font-weight: bold; border-top: 2px solid #2d5016; padding-top: 10px; margin-top: 10px; }
                .status { padding: 4px 8px; border-radius: 10px; font-size: 12px; }
                .status.pending { background: #fff3cd; color: #856404; }
                .btn-primary, .btn-secondary, .action-buttons, .next-steps, .contact-info { display: none; }
            </style>
        </head>
        <body>
            ${printContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Add CSS for additional styles
const style = document.createElement('style');
style.textContent = `
    .item-info {
        display: flex;
        align-items: center;
        gap: 15px;
        flex: 1;
    }
    
    .item-image {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .item-details {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .item-details .item-quantity {
        font-size: 0.9rem;
        color: #666;
        background: none;
        padding: 0;
        margin: 0;
    }
    
    .free-shipping {
        color: #28a745;
        font-weight: 600;
    }
    
    .btn-secondary i {
        margin-right: 8px;
    }
    
    @media print {
        .action-buttons,
        .next-steps,
        .contact-info {
            display: none !important;
        }
        
        .confirmation-content {
            box-shadow: none !important;
            border: 1px solid #000 !important;
        }
    }
`;
document.head.appendChild(style);

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+P or Cmd+P for print
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        printOrder();
    }
    
    // Escape to go back
    if (e.key === 'Escape') {
        window.location.href = '../home/home.html';
    }
});

// Add page visibility change handler
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden, pause any animations
        document.body.style.animationPlayState = 'paused';
    } else {
        // Page is visible, resume animations
        document.body.style.animationPlayState = 'running';
    }
});

// Add beforeunload handler to prevent accidental navigation
window.addEventListener('beforeunload', function(e) {
    // Only show warning if user hasn't been on page for at least 30 seconds
    const timeOnPage = Date.now() - window.pageLoadTime;
    if (timeOnPage < 30000) {
        e.preventDefault();
        e.returnValue = 'Bạn có chắc chắn muốn rời khỏi trang xác nhận đơn hàng?';
    }
});

// Set page load time
window.pageLoadTime = Date.now();

