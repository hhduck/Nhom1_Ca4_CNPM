const API_URL = "../../api/cart.php";
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user_id') || 1; // nếu không có thì dùng 1

const cartContainer = document.getElementById("cartContainer");
// ==========================
// ==========================
// CART.JS - XỬ LÝ MENU USER DÀNH CHO KHÁCH HÀNG
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  handleUserDisplay();
});

// ========== HIỂN THỊ ICON USER VÀ MENU ==========
function handleUserDisplay() {
  const loginLink = document.querySelector(".nav-login");
  const userMenu = document.querySelector(".user-menu");

  if (!loginLink || !userMenu) {
    console.error("Thiếu phần tử .nav-login hoặc .user-menu trong cart.html.");
    return;
  }

  // Reset event listener
  const newLoginLink = loginLink.cloneNode(true);
  loginLink.parentNode.replaceChild(newLoginLink, loginLink);

  const customerData = localStorage.getItem("currentUser");
  const jwtToken = localStorage.getItem("jwtToken");

  let currentUser = null;
  if (customerData && jwtToken) {
    try {
      currentUser = JSON.parse(customerData);
    } catch {
      currentUser = null;
    }
  }

  // --- Nếu ĐÃ đăng nhập ---
  if (currentUser && currentUser.id) {
    newLoginLink.innerHTML = `<i class="fas fa-user"></i>`;
    newLoginLink.href = "#";

    const accountLink = userMenu.querySelector("a[href*='account.html']");
    const logoutBtn = document.getElementById("logoutBtn");

    // Cập nhật link tài khoản
    if (accountLink) accountLink.href = "../account/account.html";

    // Toggle menu user
    newLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      userMenu.style.display = userMenu.style.display === "block" ? "none" : "block";
    });

    // Ẩn khi click ra ngoài
    document.addEventListener("click", (e) => {
      if (!newLoginLink.contains(e.target) && !userMenu.contains(e.target)) {
        userMenu.style.display = "none";
      }
    });

    // Logout
    if (logoutBtn) {
      const newLogoutBtn = logoutBtn.cloneNode(true);
      logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
      newLogoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        performLogout("../login/login.html");
      });
    }

    userMenu.style.display = "none";
  } 
  // --- Nếu CHƯA đăng nhập ---
  else {
    newLoginLink.innerHTML = "ĐĂNG NHẬP/ĐĂNG KÍ";
    newLoginLink.href = "../login/login.html";
    userMenu.style.display = "none";
  }
}

// ========== ĐĂNG XUẤT ==========
function performLogout(redirectUrl) {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("rememberMe");
  window.location.href = redirectUrl;
}

// ========================
// 🧠 HÀM CHÍNH
// ========================
document.addEventListener("DOMContentLoaded", () => {
    loadCart();
});

// ========================
// 🧩 LẤY DỮ LIỆU GIỎ HÀNG
// ========================
async function loadCart() {
    try {
        const res = await fetch(`${API_URL}?user_id=${userId}`);
        const data = await res.json();

        if (!data.success || data.data.total_items === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart cart-icon"></i>
                    <p class="cart-text">Giỏ hàng trống, vui lòng thêm sản phẩm!</p>
                    <a href="../home/home.html" class="btn-primary">Quay lại trang chủ</a>
                </div>
            `;
            return;
        }

        renderCart(data.data);
    } catch (err) {
        console.error("Lỗi tải giỏ hàng:", err);
        cartContainer.innerHTML = `<p class="error">Không thể tải giỏ hàng.</p>`;
    }
}

// ========================
// 🎨 HIỂN THỊ GIỎ HÀNG
// ========================
function renderCart(cartData) {
    const { items, total_amount } = cartData;

    cartContainer.innerHTML = `
        <div class="cart-list">
            ${items.map(item => `
                <div class="cart-item" data-id="${item.cart_id}">
                    <img src="${item.image_url}" alt="${item.product_name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h3>${item.product_name}</h3>
                        <p>Giá: ${formatCurrency(item.price)}</p>
                        <div class="quantity-control">
                            <button class="btn-qty decrease">-</button>
                            <input type="number" value="${item.quantity}" min="1" class="input-qty">
                            <button class="btn-qty increase">+</button>
                        </div>
                        <p class="subtotal">Tạm tính: ${formatCurrency(item.subtotal)}</p>
                    </div>
                    <button class="btn-remove"><i class="fas fa-trash"></i></button>
                </div>
            `).join("")}
        </div>
        <div class="cart-summary">
            <h3>Tổng cộng: ${formatCurrency(total_amount)}</h3>
            <button class="btn-primary">Thanh toán</button>
        </div>
    `;

    attachCartEvents();
}

// ========================
// ⚙️ GẮN SỰ KIỆN
// ========================
function attachCartEvents() {
    // Xoá sản phẩm
    document.querySelectorAll(".btn-remove").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const cartId = e.target.closest(".cart-item").dataset.id;
            await removeCartItem(cartId);
        });
    });

    // Tăng giảm số lượng
    document.querySelectorAll(".btn-qty").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const item = e.target.closest(".cart-item");
            const input = item.querySelector(".input-qty");
            let newQty = parseInt(input.value);

            if (e.target.classList.contains("increase")) newQty++;
            else if (e.target.classList.contains("decrease")) newQty--;

            if (newQty < 1) return;

            input.value = newQty;
            await updateCartItem(item.dataset.id, newQty);
        });
    });
}

// ========================
// 🔧 CẬP NHẬT SỐ LƯỢNG
// ========================
async function updateCartItem(cartId, quantity) {
    try {
        const res = await fetch(`${API_URL}/${cartId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity })
        });

        const data = await res.json();
        if (data.success) loadCart();
        else alert(data.message);
    } catch (err) {
        console.error("Lỗi cập nhật giỏ hàng:", err);
    }
}

// ========================
// 🗑️ XÓA SẢN PHẨM
// ========================
async function removeCartItem(cartId) {
    if (!confirm("Bạn có chắc muốn xoá sản phẩm này?")) return;

    try {
        const res = await fetch(`${API_URL}/${cartId}`, {
            method: "DELETE"
        });

        const data = await res.json();
        if (data.success) loadCart();
        else alert(data.message);
    } catch (err) {
        console.error("Lỗi xoá sản phẩm:", err);
    }
}

// ========================
// 💰 ĐỊNH DẠNG TIỀN
// ========================
function formatCurrency(num) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(num);
}
