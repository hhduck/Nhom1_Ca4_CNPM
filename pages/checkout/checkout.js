/**
 * Checkout Page JavaScript
 * Handles checkout functionality for LA CUISINE NGỌT
 */

let cart = [];

// Load cart on page load
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromStorage();
    
    // Check if cart is empty
    if (cart.length === 0) {
        showMessage('Giỏ hàng trống!', 'error');
        setTimeout(() => {
            window.location.href = '../cart/cart.html';
        }, 2000);
        return;
    }
    
    // Load order summary
    loadOrderSummary();
    
    // Setup form validation
    setupFormValidation();
    
    // Auto-fill user data if logged in
    autoFillUserData();
});

function loadCartFromStorage() {
    cart = JSON.parse(localStorage.getItem('cart') || '[]');
}

function loadOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const orderTotal = document.getElementById('orderTotal');
    
    // Display order items
    orderItems.innerHTML = cart.map(item => `
        <div class="order-item">
            <img src="${item.image || '../../assets/images/placeholder-cake.jpg'}" 
                 alt="${item.name}" 
                 class="order-item-image"
                 onerror="this.src='../../assets/images/placeholder-cake.jpg'">
            <div class="order-item-info">
                <h4>${item.name}</h4>
                <span class="quantity">x${item.quantity}</span>
            </div>
            <div class="order-item-price">${formatPrice(item.price * item.quantity)}</div>
        </div>
    `).join('');
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingThreshold = 500000;
    const shipping = subtotal >= shippingThreshold ? 0 : 50000;
    const total = subtotal + shipping;
    
    orderTotal.innerHTML = `
        <div class="total-row">
            <span>Tạm tính:</span>
            <span>${formatPrice(subtotal)}</span>
        </div>
        <div class="total-row">
            <span>Phí vận chuyển:</span>
            <span class="${shipping === 0 ? 'free-shipping' : ''}">${shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}</span>
        </div>
        ${shipping > 0 ? `
        <div class="shipping-note">
            <i class="fas fa-truck"></i>
            <small>Mua thêm ${formatPrice(shippingThreshold - subtotal)} để được miễn phí vận chuyển</small>
        </div>
        ` : `
        <div class="shipping-note" style="background: #d4edda; border-color: #c3e6cb; color: #155724;">
            <i class="fas fa-check-circle"></i>
            <small>Bạn đã được miễn phí vận chuyển!</small>
        </div>
        `}
        <div class="total-row total">
            <span>Tổng cộng:</span>
            <span>${formatPrice(total)}</span>
        </div>
    `;
}

function setupFormValidation() {
    const form = document.getElementById('checkoutForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleCheckout(e);
    });
    
    // Real-time validation
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
    
    // Phone number formatting
    document.getElementById('phone').addEventListener('input', function() {
        const phone = this.value.replace(/\D/g, '');
        this.value = phone;
    });
    
    // City change handler
    document.getElementById('city').addEventListener('change', function() {
        if (this.value === 'hcm') {
            document.getElementById('district').placeholder = 'VD: Quận 1, Quận 2, Quận 3...';
        } else if (this.value === 'hn') {
            document.getElementById('district').placeholder = 'VD: Quận Ba Đình, Quận Hoàn Kiếm...';
        } else if (this.value === 'dn') {
            document.getElementById('district').placeholder = 'VD: Quận Hải Châu, Quận Thanh Khê...';
        } else {
            document.getElementById('district').placeholder = 'Nhập quận/huyện';
        }
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    clearFieldError(field);
    
    switch(fieldName) {
        case 'fullName':
            if (!value) {
                showFieldError(fieldName, 'Vui lòng nhập họ và tên');
            } else if (value.length < 2) {
                showFieldError(fieldName, 'Họ và tên phải có ít nhất 2 ký tự');
            } else {
                showFieldSuccess(fieldName);
            }
            break;
            
        case 'phone':
            if (!value) {
                showFieldError(fieldName, 'Vui lòng nhập số điện thoại');
            } else if (!isValidPhone(value)) {
                showFieldError(fieldName, 'Số điện thoại không hợp lệ');
            } else {
                showFieldSuccess(fieldName);
            }
            break;
            
        case 'email':
            if (!value) {
                showFieldError(fieldName, 'Vui lòng nhập email');
            } else if (!isValidEmail(value)) {
                showFieldError(fieldName, 'Email không hợp lệ');
            } else {
                showFieldSuccess(fieldName);
            }
            break;
            
        case 'address':
            if (!value) {
                showFieldError(fieldName, 'Vui lòng nhập địa chỉ');
            } else if (value.length < 10) {
                showFieldError(fieldName, 'Địa chỉ phải có ít nhất 10 ký tự');
            } else {
                showFieldSuccess(fieldName);
            }
            break;
            
        case 'city':
            if (!value) {
                showFieldError(fieldName, 'Vui lòng chọn thành phố');
            } else {
                showFieldSuccess(fieldName);
            }
            break;
            
        case 'district':
            if (!value) {
                showFieldError(fieldName, 'Vui lòng nhập quận/huyện');
            } else if (value.length < 2) {
                showFieldError(fieldName, 'Quận/huyện phải có ít nhất 2 ký tự');
            } else {
                showFieldSuccess(fieldName);
            }
            break;
    }
}

function showFieldError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    const formGroup = field.closest('.form-group');
    
    formGroup.classList.add('error');
    formGroup.classList.remove('success');
    
    // Remove existing error message
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    formGroup.appendChild(errorDiv);
}

function showFieldSuccess(fieldName) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    const formGroup = field.closest('.form-group');
    
    formGroup.classList.add('success');
    formGroup.classList.remove('error');
    
    // Remove error message if exists
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    formGroup.classList.remove('error', 'success');
    
    const errorMessage = formGroup.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function autoFillUserData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (currentUser.id) {
        document.getElementById('fullName').value = currentUser.fullName || '';
        document.getElementById('email').value = currentUser.email || '';
        document.getElementById('phone').value = currentUser.phone || '';
        document.getElementById('address').value = currentUser.address || '';
    }
}

async function handleCheckout(e) {
    const formData = new FormData(e.target);
    const checkoutData = {
        fullName: formData.get('fullName').trim(),
        phone: formData.get('phone').trim(),
        email: formData.get('email').trim(),
        address: formData.get('address').trim(),
        city: formData.get('city'),
        district: formData.get('district').trim(),
        paymentMethod: formData.get('paymentMethod'),
        notes: formData.get('notes').trim(),
        items: cart.map(item => ({
            product_id: item.productId || item.id,
            quantity: item.quantity
        }))
    };
    
    // Validate all required fields
    if (!validateCheckoutForm(checkoutData)) {
        return;
    }
    
    try {
        // Show loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        // Create order via backend
        const token = localStorage.getItem('jwtToken') || '';
        const orderRes = await fetch('../../api/orders.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                shipping_address: `${checkoutData.address}, ${checkoutData.district}, ${checkoutData.city}`,
                shipping_phone: checkoutData.phone,
                notes: checkoutData.notes,
                items: checkoutData.items
            })
        }).then(r => r.json());
        if (!orderRes.success) { throw new Error(orderRes.message || 'Tạo đơn hàng thất bại'); }
        const orderId = orderRes.data.order_number;
        const orderData = {
            order_id: orderId,
            customer_name: checkoutData.fullName,
            customer_phone: checkoutData.phone,
            customer_email: checkoutData.email,
            shipping_address: `${checkoutData.address}, ${checkoutData.district}, ${checkoutData.city}`,
            payment_method: checkoutData.paymentMethod,
            notes: checkoutData.notes,
            items: checkoutData.items,
            total: calculateTotal(),
            status: 'pending',
            created_at: new Date().toISOString()
        };
        
        // Optionally save a brief record locally
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Clear cart
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        if (checkoutData.paymentMethod && checkoutData.paymentMethod !== 'cod') {
            // Initiate payment
            const payRes = await fetch('../../api/payments.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method: checkoutData.paymentMethod, amount: calculateTotal(), order_number: orderId })
            }).then(r => r.json());
            if (payRes.success && payRes.data?.payment_url) {
                window.location.href = payRes.data.payment_url;
                return;
            }
        }
        showMessage('Đặt hàng thành công!', 'success');
        window.location.href = `../order-confirmation/order-confirmation.html?order_id=${orderId}`;
        
    } catch (error) {
        console.error('Checkout error:', error);
        showMessage('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!', 'error');
    } finally {
        // Reset button
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
}

function validateCheckoutForm(data) {
    let isValid = true;
    
    // Clear all errors
    clearAllErrors();
    
    // Validate full name
    if (!data.fullName) {
        showFieldError('fullName', 'Vui lòng nhập họ và tên');
        isValid = false;
    } else if (data.fullName.length < 2) {
        showFieldError('fullName', 'Họ và tên phải có ít nhất 2 ký tự');
        isValid = false;
    }
    
    // Validate phone
    if (!data.phone) {
        showFieldError('phone', 'Vui lòng nhập số điện thoại');
        isValid = false;
    } else if (!isValidPhone(data.phone)) {
        showFieldError('phone', 'Số điện thoại không hợp lệ');
        isValid = false;
    }
    
    // Validate email
    if (!data.email) {
        showFieldError('email', 'Vui lòng nhập email');
        isValid = false;
    } else if (!isValidEmail(data.email)) {
        showFieldError('email', 'Email không hợp lệ');
        isValid = false;
    }
    
    // Validate address
    if (!data.address) {
        showFieldError('address', 'Vui lòng nhập địa chỉ');
        isValid = false;
    } else if (data.address.length < 10) {
        showFieldError('address', 'Địa chỉ phải có ít nhất 10 ký tự');
        isValid = false;
    }
    
    // Validate city
    if (!data.city) {
        showFieldError('city', 'Vui lòng chọn thành phố');
        isValid = false;
    }
    
    // Validate district
    if (!data.district) {
        showFieldError('district', 'Vui lòng nhập quận/huyện');
        isValid = false;
    } else if (data.district.length < 2) {
        showFieldError('district', 'Quận/huyện phải có ít nhất 2 ký tự');
        isValid = false;
    }
    
    return isValid;
}

function clearAllErrors() {
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('error', 'success');
        const errorMessage = group.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    });
}

function calculateTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 500000 ? 0 : 50000;
    return subtotal + shipping;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone);
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    // Insert at top of checkout container
    const checkoutContainer = document.querySelector('.checkout-container');
    checkoutContainer.insertBefore(messageDiv, checkoutContainer.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Handle browser back button
window.addEventListener('beforeunload', function(e) {
    if (cart.length > 0) {
        e.preventDefault();
        e.returnValue = 'Bạn có chắc chắn muốn rời khỏi trang? Thông tin đơn hàng sẽ bị mất.';
    }
});

// Auto-save form data
setInterval(() => {
    const formData = new FormData(document.getElementById('checkoutForm'));
    const data = Object.fromEntries(formData.entries());
    localStorage.setItem('checkoutFormData', JSON.stringify(data));
}, 5000);

// Load saved form data
function loadSavedFormData() {
    const savedData = localStorage.getItem('checkoutFormData');
    if (savedData) {
        const data = JSON.parse(savedData);
        Object.keys(data).forEach(key => {
            const field = document.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = data[key];
            }
        });
    }
}

// Load saved data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadSavedFormData();
});

