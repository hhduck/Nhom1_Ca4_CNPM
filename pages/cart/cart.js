// Giả lập kiểm tra giỏ hàng (sau này có thể thay bằng localStorage)
document.addEventListener("DOMContentLoaded", () => {
    const cartContainer = document.getElementById("cartContainer");
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

    if (cartItems.length > 0) {
        cartContainer.innerHTML = `
            <div class="cart-list">
                <h2>Giỏ hàng của bạn</h2>
                <ul>
                    ${cartItems.map(item => `
                        <li>
                            <img src="${item.image}" alt="${item.name}" />
                            <div>
                                <h4>${item.name}</h4>
                                <p>${item.price} VNĐ</p>
                            </div>
                        </li>
                    `).join('')}
                </ul>
                <a href="../checkout/checkout.html" class="btn-primary">Thanh toán</a>
            </div>
        `;
    }
});
