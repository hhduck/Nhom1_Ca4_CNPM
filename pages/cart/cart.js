// Cải thiện chức năng giỏ hàng với đầy đủ tính năng
document.addEventListener("DOMContentLoaded", () => {
    const cartContainer = document.getElementById("cartContainer");
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

    if (cartItems.length > 0) {
        // Tính tổng tiền
        const totalAmount = cartItems.reduce((sum, item) => {
            const price = parseFloat(item.price.replace(/[^\d]/g, '')) || 0;
            return sum + (price * (item.quantity || 1));
        }, 0);

        cartContainer.innerHTML = `
            <div class="cart-list">
                <h2>Giỏ hàng của bạn</h2>
                <div class="cart-items">
                    ${cartItems.map((item, index) => `
                        <div class="cart-item" data-index="${index}">
                            <img src="${item.image}" alt="${item.name}" onerror="this.src='../../assets/images/placeholder-cake.jpg'" />
                            <div class="item-info">
                                <h4>${item.name}</h4>
                                <p class="item-price">${item.price}</p>
                                <div class="quantity-controls">
                                    <button onclick="updateQuantity(${index}, -1)" class="qty-btn">-</button>
                                    <span class="quantity">${item.quantity || 1}</span>
                                    <button onclick="updateQuantity(${index}, 1)" class="qty-btn">+</button>
                                </div>
                            </div>
                            <button onclick="removeItem(${index})" class="remove-btn">Xóa</button>
                        </div>
                    `).join('')}
                </div>
                <div class="cart-summary">
                    <h3>Tổng cộng: ${formatCurrency(totalAmount)}</h3>
                    <a href="../checkout/checkout.html" class="btn-primary">Thanh toán</a>
                </div>
            </div>
        `;
    }
});

// Hàm cập nhật số lượng sản phẩm
function updateQuantity(index, change) {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    if (cartItems[index]) {
        cartItems[index].quantity = (cartItems[index].quantity || 1) + change;
        if (cartItems[index].quantity <= 0) {
            cartItems.splice(index, 1);
        }
        localStorage.setItem("cart", JSON.stringify(cartItems));
        location.reload(); // Reload để cập nhật UI
    }
}

// Hàm xóa sản phẩm khỏi giỏ hàng
function removeItem(index) {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
        const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
        cartItems.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cartItems));
        location.reload(); // Reload để cập nhật UI
    }
}

// Hàm format tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}
