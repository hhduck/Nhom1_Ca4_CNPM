const API_URL = "../../api/cart.php";
const cartContainer = document.getElementById("cartContainer");

// Lấy userId từ currentUser trong localStorage thay vì URL parameter
function getCurrentUserId() {
  const customerData = localStorage.getItem("currentUser");
  const jwtToken = localStorage.getItem("jwtToken");
  
  if (customerData && jwtToken) {
    try {
      const currentUser = JSON.parse(customerData);
      if (currentUser && currentUser.id) {
        return currentUser.id;
      }
    } catch (e) {
      console.error("Lỗi parse user data:", e);
    }
  }
  
  // Fallback: thử lấy từ URL nếu không có trong localStorage
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('user_id') || null;
}

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
  ["currentUser", "jwtToken", "rememberMe", "cart"].forEach(k => localStorage.removeItem(k));
  window.location.href = redirectUrl;
}

// ========== TẢI DỮ LIỆU GIỎ HÀNG ==========
async function loadCart() {
  const userId = getCurrentUserId();
  
  if (!userId) {
    console.warn("Không tìm thấy user_id, hiển thị giỏ hàng trống.");
    const cartContainer = document.getElementById("cartContainer");
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart cart-icon"></i>
        <p class="cart-text">Vui lòng đăng nhập để xem giỏ hàng!</p>
        <a href="../login/login.html" class="btn-primary">Đăng nhập</a>
      </div>`;
    return;
  }
  
  try {
    const res = await fetch(`${API_URL}?user_id=${userId}`);
    const data = await res.json();

    if (data.success && data.data.total_items > 0) {
      renderCart(data.data);
    } else {
      // Nếu không có trong database, hiển thị giỏ hàng trống
      const cartContainer = document.getElementById("cartContainer");
      cartContainer.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-cart cart-icon"></i>
          <p class="cart-text">Giỏ hàng trống, vui lòng thêm sản phẩm!</p>
          <a href="../home/home.html" class="btn-primary">Quay lại trang chủ</a>
        </div>`;
    }
  } catch (err) {
    console.error("Lỗi khi tải giỏ hàng:", err);
    const cartContainer = document.getElementById("cartContainer");
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart cart-icon"></i>
        <p class="cart-text">Không thể tải giỏ hàng. Vui lòng thử lại sau!</p>
        <a href="../home/home.html" class="btn-primary">Quay lại trang chủ</a>
      </div>`;
  }
}

// Hàm render giỏ hàng từ database (API)
function renderCart(cartData) {
  const cartContainer = document.getElementById("cartContainer");
  const items = cartData.items || [];
  
  if (items.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart cart-icon"></i>
        <p class="cart-text">Giỏ hàng trống, vui lòng thêm sản phẩm!</p>
        <a href="../home/home.html" class="btn-primary">Quay lại trang chủ</a>
      </div>`;
    return;
  }

  let rows = items
    .map((item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      const subtotal = price * quantity;

      return `
        <tr>
          <td><img src="${normalizeImagePath(item.image_url)}" alt="${item.product_name}" class="cart-item-img"></td>
          <td class="cart-item-name">${item.product_name}</td>
          <td class="cart-item-price">${formatCurrency(price)}</td>
          <td>
            <div class="quantity-control">
              <button class="decrease" data-cart-id="${item.cart_id}">-</button>
              <input type="number" value="${quantity}" min="1" class="input-qty" data-cart-id="${item.cart_id}">
              <button class="increase" data-cart-id="${item.cart_id}">+</button>
            </div>
          </td>
          <td class="cart-subtotal">${formatCurrency(subtotal)}</td>
          <td>
            <button class="btn-remove" data-cart-id="${item.cart_id}">
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
      <h3>Tổng cộng: ${formatCurrency(cartData.total_amount || 0)}</h3>
      <button class="btn-primary" id="checkoutBtn">Thanh toán</button>
    </div>
  `;

  updateCartCount();
  attachQuantityHandlersDB(items); // Gắn handler cho cart từ database
  attachRemoveHandlersDB(); // Gắn handler xóa cho cart từ database

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      window.location.href = "../pay/pay.html";
    });
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
      // ✅ Ép kiểu giá về số chính xác
      const price = parseFloat(String(item.price).replace(/[^\d.]/g, "")) || 0;
      const subtotal = price * (item.quantity || 1);
      total += subtotal;

      return `
        <tr>
<td><img src="${normalizeImagePath(item.image)}" alt="${item.name}" class="cart-item-img"></td>
          <td class="cart-item-name">${item.name}</td>
          <td class="cart-item-price">${formatCurrency(price)}</td>
          <td>
            <div class="quantity-control">
              <button class="decrease">-</button>
              <input type="number" value="${item.quantity}" min="1" class="input-qty">
              <button class="increase">+</button>
            </div>
          </td>
          <td class="cart-subtotal">${formatCurrency(subtotal)}</td>
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
      <h3>Tổng cộng: ${formatCurrency(total)}</h3>
      <button class="btn-primary" id="checkoutBtn">Thanh toán</button>
    </div>
  `;

  updateCartCount();
  attachQuantityHandlers();
  attachRemoveHandlers();

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      window.location.href = "../pay/pay.html";
    });
  }
}

// ========== HIỂN THỊ SỐ ICON ==========
async function updateCartCount() {
  try {
    const userId = getCurrentUserId();
    
    if (!userId) {
      const cartCount = document.querySelector(".cart-count");
      if (cartCount) {
        cartCount.style.display = "none";
      }
      return;
    }
    
    // Lấy số lượng từ database
    try {
      const res = await fetch(`${API_URL}?user_id=${userId}`);
      const data = await res.json();
      
      if (data.success && data.data.total_items > 0) {
        const totalItems = data.data.total_items;
        const cartCount = document.querySelector(".cart-count");
        if (cartCount) {
          cartCount.textContent = totalItems;
          cartCount.style.display = "inline-block";
        }
      } else {
        const cartCount = document.querySelector(".cart-count");
        if (cartCount) {
          cartCount.style.display = "none";
        }
      }
    } catch (e) {
      console.warn("Không lấy được số lượng từ API, dùng localStorage fallback:", e);
      // Fallback sang localStorage nếu API lỗi
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      const cartCount = document.querySelector(".cart-count");
      if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? "inline-block" : "none";
      }
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

// ==========================
// 🎛️ XỬ LÝ TĂNG / GIẢM SỐ LƯỢNG CHO CART TỪ DATABASE
// ==========================
function attachQuantityHandlersDB(items) {
  const cartContainer = document.getElementById("cartContainer");
  const userId = getCurrentUserId();
  
  if (!userId) return;

  cartContainer.querySelectorAll(".quantity-control").forEach((control) => {
    const decreaseBtn = control.querySelector(".decrease");
    const increaseBtn = control.querySelector(".increase");
    const qtyInput = control.querySelector(".input-qty");
    const cartId = decreaseBtn.dataset.cartId;

    decreaseBtn.addEventListener("click", async () => {
      let newQty = parseInt(qtyInput.value) - 1;
      if (newQty < 1) newQty = 1;
      qtyInput.value = newQty;
      await updateCartItemDB(cartId, newQty);
    });

    increaseBtn.addEventListener("click", async () => {
      let newQty = parseInt(qtyInput.value) + 1;
      qtyInput.value = newQty;
      await updateCartItemDB(cartId, newQty);
    });

    qtyInput.addEventListener("change", async () => {
      let val = parseInt(qtyInput.value);
      if (isNaN(val) || val < 1) val = 1;
      qtyInput.value = val;
      await updateCartItemDB(cartId, val);
    });
  });
}

// ==========================
// 🗑️ XỬ LÝ XÓA SẢN PHẨM KHỎI GIỎ (DATABASE)
// ==========================
function attachRemoveHandlersDB() {
  const removeButtons = document.querySelectorAll(".btn-remove[data-cart-id]");

  removeButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const cartId = btn.dataset.cartId;
      const productName = btn.closest("tr").querySelector(".cart-item-name")?.textContent || "sản phẩm";
      
      if (confirm(`Bạn có chắc muốn xóa "${productName}" khỏi giỏ hàng không?`)) {
        await removeFromCartDB(cartId);
      }
    });
  });
}

// Cập nhật số lượng trong database
async function updateCartItemDB(cartId, quantity) {
  try {
    const response = await fetch(`${API_URL}/${cartId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`
      },
      body: JSON.stringify({ quantity })
    });
    
    const result = await response.json();
    
    if (result.success) {
      loadCart(); // Reload giỏ hàng
      updateCartCount();
    } else {
      alert(result.message || "Không thể cập nhật số lượng");
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật giỏ hàng:", error);
    alert("Lỗi khi cập nhật số lượng. Vui lòng thử lại.");
  }
}

// Xóa sản phẩm khỏi database
async function removeFromCartDB(cartId) {
  try {
    const response = await fetch(`${API_URL}/${cartId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      loadCart(); // Reload giỏ hàng
      updateCartCount();
    } else {
      alert(result.message || "Không thể xóa sản phẩm");
    }
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    alert("Lỗi khi xóa sản phẩm. Vui lòng thử lại.");
  }
}
function formatCurrency(amount) {
  if (isNaN(amount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0
  }).format(amount);
}
function normalizeImagePath(path) {
  if (!path) return "../../assets/images/default.jpg";
  if (path.startsWith("assets/assets/")) path = path.replace("assets/assets/", "assets/");
  if (!path.startsWith("../../")) path = "../../" + path;
  return path;
}



