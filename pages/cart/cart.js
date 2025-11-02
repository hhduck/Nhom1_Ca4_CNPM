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
  initSearch(); // Khởi tạo tìm kiếm
});

// ========== HIỂN THỊ MENU USER ==========
function performLogout(redirectUrl) {
  console.log(`Đang đăng xuất và chuyển đến: ${redirectUrl}...`);
  // Xóa tất cả các key user để dọn dẹp
  localStorage.removeItem('currentStaff');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('jwtToken');
  localStorage.removeItem('rememberMe');
  localStorage.removeItem('cart'); // Xóa giỏ hàng khi logout
  window.location.href = redirectUrl; // Chuyển hướng
}

// --- HÀM XỬ LÝ NAVBAR (TÁCH RA ĐỂ DÙNG CHUNG) ---
function handleUserDisplay() {
  const navUserLi = document.querySelector(".nav-user"); // Chọn thẻ <li> cha
  const login1Link = document.querySelector(".nav-login-1"); // ĐĂNG NHẬP
  const login2Link = document.querySelector(".nav-login-2"); // ĐĂNG KÍ
  const navSeparator = document.querySelector(".nav-separator"); // Dấu |
  const userMenu = document.querySelector(".user-menu"); // Menu thả xuống
  const ttButton = document.getElementById("tt"); // Nút Thông tin tài khoản trong user-menu
  const logoutBtnNav = document.getElementById("logoutBtnNav"); // Nút Đăng xuất trong user-menu

  if (!navUserLi || !login1Link || !login2Link || !navSeparator || !userMenu || !ttButton || !logoutBtnNav) {
    console.error("Thiếu các element navbar quan trọng.");
    return;
  }

  const staffDataString = localStorage.getItem("currentStaff");
  const customerDataString = localStorage.getItem("currentUser");
  const jwtToken = localStorage.getItem("jwtToken");

  let loggedInUser = null;
  let userType = null;

  if (staffDataString && jwtToken) {
    try { loggedInUser = JSON.parse(staffDataString); if (loggedInUser?.id) userType = 'staff'; else loggedInUser = null; }
    catch (e) { loggedInUser = null; }
  }
  if (!loggedInUser && customerDataString && jwtToken) {
    try { loggedInUser = JSON.parse(customerDataString); if (loggedInUser?.id) userType = 'customer'; else loggedInUser = null; }
    catch (e) { loggedInUser = null; }
  }

  // --- Cập nhật giao diện ---
  if (loggedInUser && userType) {
    // ---- ĐÃ ĐĂNG NHẬP ----
    console.log(`Đã đăng nhập (account.js) với ${userType}. Hiển thị icon.`);
    
    // Ẩn link Đăng nhập/Đăng ký và dấu |
    login1Link.style.display = 'none';
    login2Link.style.display = 'none';
    navSeparator.style.display = 'none';

    // Tạo và hiển thị icon user
    let userIcon = navUserLi.querySelector(".user-icon-link");
    if (!userIcon) { // Nếu icon chưa có thì tạo
      userIcon = document.createElement('a');
      userIcon.href = "#";
      userIcon.className = "user-icon-link";
      userIcon.innerHTML = `<i class="fas fa-user"></i>`;
      navUserLi.prepend(userIcon); // Thêm icon vào đầu thẻ <li>
    }
    userIcon.style.display = 'inline-block'; // Đảm bảo nó hiện

    // Cập nhật link "Thông tin tài khoản"
    const accountBtn = document.getElementById("tt");
    if (accountBtn) {
      accountBtn.onclick = null; // Xóa onclick cũ
      accountBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const accountUrl = (userType === 'staff')
          ? "../../staff/staffProfile/staff_profile.html"
          : "../account/account.html";
        window.location.href = accountUrl;
      });
    }

    // Gắn event listener MỚI cho icon user (dùng clone để xóa listener cũ)
    const newUserIcon = userIcon.cloneNode(true);
    userIcon.parentNode.replaceChild(newUserIcon, userIcon);

    newUserIcon.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isVisible = userMenu.style.display === "block";
      userMenu.style.display = isVisible ? "none" : "block";
    });

    // Đóng menu khi click ra ngoài
    document.addEventListener('click', (event) => {
      if (!newUserIcon.contains(event.target) && !userMenu.contains(event.target)) {
        userMenu.style.display = "none";
      }
    });

    // Xử lý nút ĐĂNG XUẤT (dùng clone để xóa listener cũ)
    const logoutBtn = document.getElementById("logoutBtnNav");
    if (logoutBtn) {
      const newLogoutBtn = logoutBtn.cloneNode(true);
      logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);

      newLogoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("currentStaff");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("cart"); // Xóa giỏ hàng khi logout
        window.location.href = "../login/login.html";
      });
    }

    // Menu ban đầu ẩn
    userMenu.style.display = "none";
    userMenu.classList.remove("hidden");

  } else {
    // ---- CHƯA ĐĂNG NHẬP ----
    console.log("Chưa đăng nhập (account.js). Hiển thị link login.");
    
    // Hiện link Đăng nhập/Đăng ký và dấu |
    login1Link.style.display = 'inline';
    login2Link.style.display = 'inline';
    navSeparator.style.display = 'inline';

    // Ẩn icon user (nếu nó tồn tại)
    let userIcon = navUserLi.querySelector(".user-icon-link");
    if (userIcon) {
      userIcon.style.display = 'none';
    }
    
    // Ẩn menu user
    userMenu.classList.add("hidden");
    userMenu.style.display = "none";
  }
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
      console.error("Lỗi khi lấy số lượng giỏ hàng từ API:", e);
      // KHÔNG fallback localStorage khi đã đăng nhập - chỉ ẩn số lượng
      const cartCount = document.querySelector(".cart-count");
      if (cartCount) {
        cartCount.style.display = "none";
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

// ========== TÌM KIẾM ==========
const API_BASE = "../../api/products_c.php";

function initSearch() {
  const searchIcon = document.querySelector(".nav-search");
  const searchBar = document.querySelector(".search-bar");
  const searchInput = document.getElementById("searchInput");
  const searchSubmitBtn = document.getElementById("searchSubmitBtn");
  const overlay = document.getElementById("overlay");
  const popupProducts = document.getElementById("popupProducts");
  const closePopupBtn = document.querySelector(".close-popup");
  
  // Reset popup và thanh tìm kiếm khi load trang mới
  if (overlay) {
    overlay.classList.add("hidden");
  }
  if (searchBar) {
    searchBar.classList.remove("show");
    document.body.classList.remove("searching");
  }

  // Hiện/ẩn thanh tìm kiếm
  if (searchIcon && searchBar) {
    searchIcon.addEventListener("click", (e) => {
      e.preventDefault();
      searchBar.classList.toggle("show");
      document.body.classList.toggle("searching");
      if (searchBar.classList.contains("show")) {
        searchInput.focus();
      }
    });

    document.addEventListener("click", (e) => {
      if (!searchBar.contains(e.target) && !searchIcon.contains(e.target)) {
        searchBar.classList.remove("show");
        document.body.classList.remove("searching");
      }
    });
  }

  // Hàm hiển thị popup kết quả
  function showPopup(products) {
    if (!overlay || !popupProducts) return;
    
    popupProducts.innerHTML = "";

    if (!products || !products.length) {
      popupProducts.innerHTML = "<p>Không tìm thấy sản phẩm phù hợp.</p>";
    } else {
      products.forEach(p => {
        const card = `
          <div class="product-card">
            <div class="product-image-container">
              <a href="../product/product.html?id=${p.ProductID}" class="product-item">
                <img src="../../${p.ImageURL}" alt="${p.ProductName}" class="product-image">
              </a>
            </div>
            <div class="product-info">
              <h3 class="product-name">${p.ProductName}</h3>
              <p class="product-price">${Number(p.Price).toLocaleString()} VNĐ</p>
            </div>
          </div>`;
        popupProducts.insertAdjacentHTML("beforeend", card);
      });
    }
    overlay.classList.remove("hidden");
    
    // Đảm bảo popup luôn căn giữa
    const popupContainer = document.querySelector(".popup-container");
    if (popupContainer) {
      popupContainer.style.margin = "auto";
    }
  }

  // Hàm đóng popup
  function hidePopup() {
    if (overlay) overlay.classList.add("hidden");
    // Ẩn thanh tìm kiếm khi đóng popup
    if (searchBar) {
      searchBar.classList.remove("show");
      document.body.classList.remove("searching");
    }
  }

  if (closePopupBtn) {
    closePopupBtn.addEventListener("click", hidePopup);
  }
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) hidePopup();
    });
  }
  
  // Đóng popup khi click vào link sản phẩm trong popup
  document.addEventListener("click", (e) => {
    if (e.target.closest(".product-item")) {
      hidePopup();
    }
  });

  // Hàm tìm kiếm
  async function performSearch() {
    // Lấy lại searchInput để đảm bảo có giá trị mới nhất
    const currentSearchInput = document.getElementById("searchInput");
    const keyword = currentSearchInput ? currentSearchInput.value.trim() : "";
    
    if (!keyword) {
      alert("Vui lòng nhập từ khóa tìm kiếm");
      return;
    }

    const url = `${API_BASE}?search=${encodeURIComponent(keyword)}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log("Search response:", data); // Debug log
      
      // Xử lý response từ products_c.php (format: {success: true, products: [...]})
      let products = [];
      if (data.success && data.products) {
        products = data.products;
      } else if (Array.isArray(data)) {
        products = data;
      } else if (data.data && data.data.products) {
        products = data.data.products;
      }
      
      // Chuyển đổi snake_case thành PascalCase nếu cần
      products = products.map(p => ({
        ProductID: p.ProductID || p.product_id,
        ProductName: p.ProductName || p.product_name,
        Price: p.Price || p.price,
        ImageURL: p.ImageURL || p.image_url
      }));
      
      showPopup(products);
    } catch (err) {
      console.error("❌ Lỗi tìm kiếm:", err);
      alert("Không thể tìm kiếm. Vui lòng thử lại sau.\n" + err.message);
    }
  }

  // Tìm kiếm khi nhấn Enter
  if (searchInput) {
    searchInput.addEventListener("keypress", async (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        await performSearch();
      }
    });
  }

  // Tìm kiếm khi nhấn nút dấu tích
  if (searchSubmitBtn) {
    searchSubmitBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await performSearch();
    });
  }
}



