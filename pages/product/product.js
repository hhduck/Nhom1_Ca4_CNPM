// ==========================
// product.js - PHIÊN BẢN ĐÃ SỬA LỖI MENU USER (ĐỒNG BỘ VỚI HOME.JS)
// ==========================

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Xử lý hiển thị User (SỬ DỤNG LOGIC ĐÚNG CỦA HOME.JS)
  handleUserDisplay();

  // 2. Lấy ID và tải sản phẩm từ API
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get("id"));

  if (!productId) {
    const main = document.querySelector(".product-page");
    if (main) main.innerHTML = "<h2 style='text-align:center; padding: 50px;'>Không tìm thấy ID sản phẩm.</h2>";
    return;
  }

  try {
    // Load product từ API
    const response = await fetch(`../../api/products.php/${productId}`);
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Không tìm thấy sản phẩm');
    }

    const product = result.data;

    // 3. Điền thông tin sản phẩm
// Chuẩn hóa đường dẫn ảnh trước khi gán
let imagePath = product.image_url || 'assets/images/default.jpg';

// Nếu trong đường dẫn có "assets/assets/" thì sửa lại cho đúng
if (imagePath.startsWith("assets/assets/")) {
  imagePath = imagePath.replace("assets/assets/", "assets/");
}

// Nếu chưa có "../../" ở đầu thì thêm vào (vì file product.js nằm trong /pages/product)
if (!imagePath.startsWith("../../")) {
  imagePath = "../../" + imagePath;
}

document.getElementById("product-img").src = imagePath;
    document.getElementById("product-img").alt = product.product_name;
    document.getElementById("product-name").textContent = product.product_name;
    document.getElementById("product-price").textContent = formatPrice(product.price);
    document.getElementById("product-short1").innerHTML = product.short_intro || '';
    document.getElementById("product-short2").innerHTML = product.short_paragraph || '';
    document.getElementById("desc1").innerHTML = product.description || '';
    document.getElementById("structure").innerHTML = product.structure || '';
    document.getElementById("usage").innerHTML = product.product_usage || product.usage || '';
    document.getElementById("bonus").innerHTML = product.bonus || '';

    // 3.5. Ẩn phần "THÔNG TIN SẢN PHẨM" nếu sản phẩm thuộc danh mục "Phụ kiện"
    const productDetailsSection = document.querySelector(".product-details");
    if (productDetailsSection && product.category_name === "Phụ kiện") {
      productDetailsSection.style.display = "none";
    }

    // 4. Cập nhật số lượng giỏ hàng
    updateCartCount();

    // 5. Gắn listener cho các nút (Thêm vào giỏ, Mua ngay)
    setupActionButtons(product);
  } catch (error) {
    console.error('Lỗi load sản phẩm:', error);
    const main = document.querySelector(".product-page");
    if (main) main.innerHTML = "<h2 style='text-align:center; padding: 50px;'>Không thể tải thông tin sản phẩm.</h2>";
  }
});

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}

// ========== HÀM XỬ LÝ HIỂN THỊ USER (COPY TỪ HOME.JS ĐÃ SỬA) ==========
function handleUserDisplay() {
  const loginLink = document.querySelector(".nav-login"); // Thẻ <a> chính
  const userMenu = document.querySelector(".user-menu"); // Menu thả xuống

  if (!loginLink || !userMenu) {
    console.error("Thiếu phần tử .nav-login hoặc .user-menu trong product.html.");
    return;
  }

  // Xóa listener cũ (nếu có) bằng cách clone
  const newLoginLink = loginLink.cloneNode(true);
  loginLink.parentNode.replaceChild(newLoginLink, loginLink);

  const staffDataString = localStorage.getItem("currentStaff");
  const customerDataString = localStorage.getItem("currentUser");
  const jwtToken = localStorage.getItem("jwtToken");

  let loggedInUser = null;
  let userType = null;

  // Ưu tiên Staff/Admin
  if (staffDataString && jwtToken) {
    try { loggedInUser = JSON.parse(staffDataString); if (loggedInUser?.id) userType = 'staff'; else loggedInUser = null; }
    catch (e) { loggedInUser = null; }
  }
  // Nếu không phải staff, kiểm tra Customer
  if (!loggedInUser && customerDataString && jwtToken) {
    try { loggedInUser = JSON.parse(customerDataString); if (loggedInUser?.id) userType = 'customer'; else loggedInUser = null; }
    catch (e) { loggedInUser = null; }
  }

  // --- Cập nhật giao diện ---
  if (loggedInUser && userType) {
    // ---- ĐÃ ĐĂNG NHẬP ----
    console.log(`Đã đăng nhập với ${userType}. Hiển thị icon user.`);
    newLoginLink.innerHTML = `<i class="fas fa-user"></i>`; // Chỉ thay đổi nội dung thành icon
    newLoginLink.href = "#"; // Bỏ link đến trang login

    const accountLink = userMenu.querySelector("a[href*='account.html'], a[href*='staff_profile.html']");
    const logoutBtn = document.getElementById("logoutBtn");

    // Điều chỉnh link "Thông tin tài khoản"
    if (accountLink) {
      accountLink.href = (userType === 'staff')
        ? "../staff/staffProfile/staff_profile.html" // Link cho Staff
        : "../account/account.html";               // Link cho Customer
      console.log("Updated account link to:", accountLink.href);
    }

    // Hiện menu khi click icon
    newLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation(); // Ngăn sự kiện click lan ra document
      userMenu.classList.remove("hidden"); // Bỏ class hidden
      userMenu.style.display = (userMenu.style.display === "block") ? "none" : "block"; // Toggle
    });

    // Đóng menu khi click ra ngoài
    document.addEventListener('click', (event) => {
      if (userMenu && !newLoginLink.contains(event.target) && !userMenu.contains(event.target)) {
        userMenu.style.display = "none";
      }
    });

    // Xử lý nút Đăng xuất
    if (logoutBtn) {
      const newLogoutBtn = logoutBtn.cloneNode(true);
      logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
      newLogoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        performLogout("../login/login.html"); // Gọi hàm logout mới
      });
    }

    userMenu.style.display = "none"; // Đảm bảo menu ẩn ban đầu

  } else {
    // ---- CHƯA ĐĂNG NHẬP ----
    console.log("Chưa đăng nhập. Hiển thị nút Đăng nhập/Đăng ký.");
    newLoginLink.innerHTML = 'ĐĂNG NHẬP/ĐĂNG KÍ'; // Khôi phục text
    newLoginLink.href = "../login/login.html"; // Khôi phục link
    userMenu.classList.add("hidden");
    userMenu.style.display = "none";
  }
}

// ========== HÀM ĐĂNG XUẤT (CẦN THÊM VÀO) ==========
function performLogout(redirectUrl) {
  console.log(`Đang đăng xuất và chuyển đến: ${redirectUrl}...`);
  // Xóa tất cả các key để đảm bảo sạch
  localStorage.removeItem('currentStaff');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('jwtToken');
  localStorage.removeItem('rememberMe');
  window.location.href = redirectUrl; // Chuyển hướng
}


// ========== CÁC HÀM KHÁC (GIỮ NGUYÊN TỪ FILE CŨ CỦA BẠN) ==========

function updateCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      cartCount.textContent = totalItems;
      cartCount.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
  } catch (e) { console.error("Lỗi cập nhật giỏ hàng:", e); }
}

function addToCart(product, quantity) {
  if (!product || !product.product_id) { alert("Lỗi: Không tìm thấy thông tin sản phẩm."); return; }
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingIndex = cart.findIndex(item => item.id === product.product_id);
  if (existingIndex > -1) {
    cart[existingIndex].quantity = (cart[existingIndex].quantity || 0) + quantity;
  } else {
    cart.push({ 
      id: product.product_id, 
      name: product.product_name, 
      price: product.price, 
      image: product.image_url || product.ImageURL, 
      quantity: quantity 
    });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert(`Đã thêm ${quantity} "${product.product_name}" vào giỏ hàng!`);
}

function setupActionButtons(product) {
  const decreaseBtn = document.getElementById("decrease");
  const increaseBtn = document.getElementById("increase");
  const quantityInput = document.getElementById("quantity");
  const addCartBtn = document.querySelector(".add-cart");
  const buyNowBtn = document.querySelector(".buy-now");

  if (decreaseBtn && increaseBtn && quantityInput) {
    decreaseBtn.addEventListener("click", () => { let val = parseInt(quantityInput.value); if (val > 1) quantityInput.value = val - 1; });
    increaseBtn.addEventListener("click", () => { let val = parseInt(quantityInput.value); quantityInput.value = val + 1; });
  }

  if (addCartBtn) {
    addCartBtn.addEventListener("click", () => {
      const isCustomer = localStorage.getItem("currentUser") && localStorage.getItem("jwtToken");
      const isStaff = localStorage.getItem("currentStaff") && localStorage.getItem("jwtToken");
      if (!isCustomer && !isStaff) { alert("Vui lòng đăng nhập để thêm sản phẩm."); window.location.href = "../login/login.html"; return; }
      if (product) { const quantity = parseInt(quantityInput.value) || 1; addToCart(product, quantity); }
      else { alert("Lỗi: Không thể thêm sản phẩm."); }
    });
  }

  if (buyNowBtn) {
    buyNowBtn.addEventListener("click", () => {
      const isCustomer = localStorage.getItem("currentUser") && localStorage.getItem("jwtToken");
      const isStaff = localStorage.getItem("currentStaff") && localStorage.getItem("jwtToken");
      if (!isCustomer && !isStaff) { alert("Vui lòng đăng nhập để mua hàng."); window.location.href = "../login/login.html"; }
      else {
        if (product) { const quantity = parseInt(quantityInput.value) || 1; addToCart(product, quantity); }
      window.location.href = "../pay/pay.html";      }
    });
  }
}
