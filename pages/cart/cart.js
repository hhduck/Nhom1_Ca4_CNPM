/**
 * Cart Page JavaScript
 * Handles cart functionality for LA CUISINE NGỌT
 */

let cart = [];

// Load cart on page load
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromStorage();
    loadCartItems();
    updateCartCount();
    setupEventListeners();
});

function loadCartFromStorage() {
    cart = JSON.parse(localStorage.getItem('cart') || '[]');
}

function setupEventListeners() {
    // Quantity change events
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quantity-btn')) {
            const action = e.target.dataset.action;
            const productId = parseInt(e.target.dataset.productId);
            updateCartQuantity(productId, action);
        }
        
        if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
            const productId = parseInt(e.target.dataset.productId || e.target.closest('.remove-item').dataset.productId);
            removeFromCart(productId);
        }
    });
    
    // Quantity input change events
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('quantity-input')) {
            const productId = parseInt(e.target.closest('.cart-item').dataset.productId);
            const newQuantity = parseInt(e.target.value);
            updateCartQuantityDirect(productId, newQuantity);
        }
    });
}

function loadCartItems() {
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    const emptyCart = document.getElementById('emptyCart');
    
    if (cart.length === 0) {
        cartItems.style.display = 'none';
        cartSummary.style.display = 'none';
        emptyCart.style.display = 'block';
        return;
    }
    
    cartItems.style.display = 'block';
    cartSummary.style.display = 'block';
    emptyCart.style.display = 'none';
    
    // Display cart items
    cartItems.innerHTML = cart.map(item => createCartItem(item)).join('');
    
    // Display cart summary
    displayCartSummary();
}

function createCartItem(item) {
    return `
        <div class="cart-item" data-product-id="${item.productId || item.id}">
            <img src="${item.image || '../../assets/images/placeholder-cake.jpg'}" 
                 alt="${item.name}" 
                 class="cart-item-image"
                 onerror="this.src='../../assets/images/placeholder-cake.jpg'">
            <div class="cart-item-info">
                <h3 class="cart-item-name">${item.name}</h3>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" data-action="decrease" data-product-id="${item.productId || item.id}">
                    <i class="fas fa-minus"></i>
                </button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10">
                <button class="quantity-btn" data-action="increase" data-product-id="${item.productId || item.id}">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="cart-item-total">${formatPrice(item.price * item.quantity)}</div>
            <button class="remove-item" data-product-id="${item.productId || item.id}" title="Xóa sản phẩm">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

function displayCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingThreshold = 500000;
    const shipping = subtotal >= shippingThreshold ? 0 : 50000;
    const total = subtotal + shipping;
    
    const cartSummary = document.getElementById('cartSummary');
    cartSummary.innerHTML = `
        <h3>Tóm tắt đơn hàng</h3>
        <div class="summary-row">
            <span>Tạm tính:</span>
            <span>${formatPrice(subtotal)}</span>
        </div>
        <div class="summary-row">
            <span>Phí vận chuyển:</span>
            <span class="${shipping === 0 ? 'free-shipping' : ''}">${shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}</span>
        </div>
        ${shipping > 0 ? `
        <div class="summary-row shipping-note">
            <i class="fas fa-truck"></i>
            <small>Mua thêm ${formatPrice(shippingThreshold - subtotal)} để được miễn phí vận chuyển</small>
        </div>
        ` : `
        <div class="summary-row shipping-note" style="background: #d4edda; border-color: #c3e6cb; color: #155724;">
            <i class="fas fa-check-circle"></i>
            <small>Bạn đã được miễn phí vận chuyển!</small>
        </div>
        `}
        <div class="summary-total">
            <span>Tổng cộng:</span>
            <span>${formatPrice(total)}</span>
        </div>
        <button class="btn-checkout" onclick="proceedToCheckout()" ${cart.length === 0 ? 'disabled' : ''}>
            <i class="fas fa-credit-card"></i>
            Tiến hành đặt hàng
        </button>
        <a href="../products/products.html" class="btn-secondary">
            <i class="fas fa-arrow-left"></i>
            Tiếp tục mua sắm
        </a>
    `;
}

function updateCartQuantity(productId, action) {
    const item = cart.find(item => (item.productId || item.id) === productId);
    if (!item) return;
    
    // Add loading state
    const cartItem = document.querySelector(`[data-product-id="${productId}"]`);
    if (cartItem) {
        cartItem.classList.add('loading');
    }
    
    setTimeout(() => {
        if (action === 'increase' && item.quantity < 10) {
            item.quantity += 1;
        } else if (action === 'decrease' && item.quantity > 1) {
            item.quantity -= 1;
        }
        
        saveCartToStorage();
        updateCartCount();
        loadCartItems();
        
        // Remove loading state
        if (cartItem) {
            cartItem.classList.remove('loading');
        }
        
        showMessage('Đã cập nhật giỏ hàng!', 'success');
    }, 300);
}

function updateCartQuantityDirect(productId, newQuantity) {
    const item = cart.find(item => (item.productId || item.id) === productId);
    if (!item) return;
    
    if (newQuantity >= 1 && newQuantity <= 10) {
        item.quantity = newQuantity;
        saveCartToStorage();
        updateCartCount();
        loadCartItems();
        showMessage('Đã cập nhật số lượng!', 'success');
    } else {
        // Reset to previous value
        loadCartItems();
        showMessage('Số lượng phải từ 1 đến 10!', 'error');
    }
}

function removeFromCart(productId) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
        cart = cart.filter(item => (item.productId || item.id) !== productId);
        saveCartToStorage();
        updateCartCount();
        loadCartItems();
        showMessage('Đã xóa sản phẩm khỏi giỏ hàng!', 'info');
        
        // Animate removal
        const cartItem = document.querySelector(`[data-product-id="${productId}"]`);
        if (cartItem) {
            cartItem.style.transform = 'translateX(-100%)';
            cartItem.style.opacity = '0';
            setTimeout(() => {
                loadCartItems();
            }, 300);
        }
    }
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showMessage('Giỏ hàng trống!', 'error');
        return;
    }
    
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.id) {
        showMessage('Vui lòng đăng nhập để tiếp tục đặt hàng!', 'error');
        setTimeout(() => {
            window.location.href = '../login/login.html';
        }, 2000);
        return;
    }
    
    // Show loading state
    const checkoutBtn = document.querySelector('.btn-checkout');
    if (checkoutBtn) {
        checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang chuyển hướng...';
        checkoutBtn.disabled = true;
    }
    
    // Redirect to checkout page
    setTimeout(() => {
        window.location.href = '../checkout/checkout.html';
    }, 1000);
}

function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
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
    
    // Insert at top of cart container
    const cartContainer = document.querySelector('.cart-container');
    cartContainer.insertBefore(messageDiv, cartContainer.firstChild);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// Clear cart function (for testing)
function clearCart() {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
        cart = [];
        saveCartToStorage();
        updateCartCount();
        loadCartItems();
        showMessage('Đã xóa tất cả sản phẩm trong giỏ hàng!', 'info');
    }
}

// Add sample products to cart (for testing)
function addSampleProducts() {
    const sampleProducts = [
        {
            productId: 1,
            name: "Bánh Kem Chocolate",
            price: 250000,
            image: "../../assets/images/cake1.jpg",
            quantity: 1
        },
        {
            productId: 2,
            name: "Bánh Kem Vanilla",
            price: 200000,
            image: "../../assets/images/cake2.jpg",
            quantity: 2
        }
    ];
    
    cart = [...cart, ...sampleProducts];
    saveCartToStorage();
    updateCartCount();
    loadCartItems();
    showMessage('Đã thêm sản phẩm mẫu vào giỏ hàng!', 'success');
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + R to refresh cart
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        loadCartFromStorage();
        loadCartItems();
        showMessage('Đã làm mới giỏ hàng!', 'info');
    }
    
    // Ctrl + C to clear cart (for testing)
    if (e.ctrlKey && e.key === 'c' && e.shiftKey) {
        e.preventDefault();
        clearCart();
    }
});

// Auto-save cart changes
setInterval(() => {
    saveCartToStorage();
}, 5000); // Save every 5 seconds

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        loadCartFromStorage();
        loadCartItems();
        updateCartCount();
    }
});

