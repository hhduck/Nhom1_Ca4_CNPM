const API_URL = "../../api/cart.php";
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user_id') || 1;
const cartContainer = document.getElementById("cartContainer");

document.addEventListener("DOMContentLoaded", () => {
  handleUserDisplay();
  loadCart();
  updateCartCount();
});

// ========== HIỂN THỊ MENU USER ==========
function handleUserDisplay() {
  const loginLink = document.querySelector(".nav-login");
  const userMenu = document.querySelector(".user-menu");

  if (!loginLink || !userMenu) return;

  const customerData = localStorage.getItem("currentUser");
  const jwtToken = localStorage.getItem("jwtToken");

  let currentUser = null;
  if (customerData && jwtToken) {
    try { currentUser = JSON.parse(customerData); } catch {}
  }

  if (currentUser && currentUser.id) {
    loginLink.innerHTML = `<i class="fas fa-user"></i>`;
    loginLink.href = "#";
    loginLink.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      userMenu.style.display = userMenu.style.display === "block" ? "none" : "block";
    });
    document.addEventListener("click", e => {
      if (!loginLink.contains(e.target) && !userMenu.contains(e.target)) userMenu.style.display = "none";
    });
    document.getElementById("logoutBtn").addEventListener("click", () => performLogout("../login/login.html"));
  } else {
    loginLink.textContent = "ĐĂNG NHẬP/ĐĂNG KÍ";
    loginLink.href = "../login/login.html";
  }
}

function performLogout(redirectUrl) {
  ["currentUser", "jwtToken", "rememberMe"].forEach(k => localStorage.removeItem(k));
  window.location.href = redirectUrl;
}

// ========== TẢI DỮ LIỆU GIỎ HÀNG ==========
async function loadCart() {
  try {
    const res = await fetch(`${API_URL}?user_id=${userId}`);
    const data = await res.json();

    if (data.success && data.data.total_items > 0) {
      renderCart(data.data);
    } else {
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      renderCartFromLocal(localCart);
    }
  } catch (err) {
    console.warn("Không lấy được từ API, fallback localStorage.");
    const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
    renderCartFromLocal(localCart);
  }
}

function renderCartFromLocal(cart) {
  const cartContainer = document.getElementById("cartContainer");
  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart cart-icon"></i>
        <p class="cart-text">Giỏ hàng trống, vui lòng thêm sản phẩm!</p>
        <a href="../home/home.html" class="btn-primary">Quay lại trang chủ</a>
      </div>`;
    return;
  }

  let total = 0;
  let rows = cart
    .map((item, index) => {
      const price = parseInt(item.price.replace(/[^\d]/g, "")) || 0;
      const subtotal = price * item.quantity;
      total += subtotal;
      return `
        <tr>
          <td><img src="${item.image}" alt="${item.name}" class="cart-item-img"></td>
          <td class="cart-item-name">${item.name}</td>
          <td class="cart-item-price">${item.price}</td>
          <td>
            <div class="quantity-control">
              <button class="decrease">-</button>
              <input type="number" value="${item.quantity}" min="1" class="input-qty">
              <button class="increase">+</button>
            </div>
          </td>
          <td class="cart-subtotal">${subtotal.toLocaleString()} VND</td>
          <td>
            <button class="btn-remove" data-index="${index}">
              <i class="fas fa-trash"></i> Xóa
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  cartContainer.innerHTML = `
    <h2>Giỏ hàng của bạn</h2>
    <table class="cart-table">
      <thead>
        <tr>
          <th>Hình ảnh</th>
          <th>Sản phẩm</th>
          <th>Giá</th>
          <th>Số lượng</th>
          <th>Tạm tính</th>
          <th>Xóa</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="cart-summary">
      <h3>Tổng cộng: ${total.toLocaleString()} VND</h3>
      <button class="btn-primary">Tiến hành thanh toán</button>
    </div>
  `;

  updateCartCount();
  attachQuantityHandlers();
  attachRemoveHandlers(); // Thêm sự kiện xoá
}

// ========== HIỂN THỊ SỐ ICON ==========
function updateCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const cartCount = document.querySelector(".cart-count");
    if (cartCount) {
      cartCount.textContent = totalItems;
      cartCount.style.display = totalItems > 0 ? "inline-block" : "none";
    }
  } catch (e) {
    console.error("Lỗi hiển thị số lượng giỏ hàng:", e);
  }
}

// ========== ĐỊNH DẠNG TIỀN ==========
function formatCurrency(num) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
}
// ==========================
// 🎛️ XỬ LÝ TĂNG / GIẢM SỐ LƯỢNG NGAY TRONG GIỎ HÀNG
// ==========================
function attachQuantityHandlers() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartContainer = document.getElementById("cartContainer");

  cartContainer.querySelectorAll(".quantity-control").forEach((control, index) => {
    const decreaseBtn = control.querySelector(".decrease");
    const increaseBtn = control.querySelector(".increase");
    const qtyInput = control.querySelector(".input-qty");

    decreaseBtn.addEventListener("click", () => {
      let newQty = parseInt(qtyInput.value) - 1;
      if (newQty < 1) newQty = 1; // Không cho nhỏ hơn 1
      qtyInput.value = newQty;
      cart[index].quantity = newQty;
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCartFromLocal(cart); // Cập nhật lại giao diện và tổng tiền
    });

    increaseBtn.addEventListener("click", () => {
      let newQty = parseInt(qtyInput.value) + 1;
      qtyInput.value = newQty;
      cart[index].quantity = newQty;
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCartFromLocal(cart);
    });

    // Cho phép nhập trực tiếp số lượng
    qtyInput.addEventListener("change", () => {
      let val = parseInt(qtyInput.value);
      if (isNaN(val) || val < 1) val = 1;
      qtyInput.value = val;
      cart[index].quantity = val;
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCartFromLocal(cart);
    });
  });
}
// ==========================
// 🗑️ XỬ LÝ XÓA SẢN PHẨM KHỎI GIỎ
// ==========================
function attachRemoveHandlers() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const removeButtons = document.querySelectorAll(".btn-remove");

  removeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.index);
      if (confirm(`Bạn có chắc muốn xóa "${cart[index].name}" khỏi giỏ hàng không?`)) {
        cart.splice(index, 1); // Xóa 1 sản phẩm tại vị trí index
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCartFromLocal(cart);
      }
    });
  });
}


