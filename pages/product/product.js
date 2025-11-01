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
  localStorage.removeItem('cart'); // Xóa giỏ hàng khi logout
  window.location.href = redirectUrl; // Chuyển hướng
}


// ========== CÁC HÀM KHÁC (GIỮ NGUYÊN TỪ FILE CŨ CỦA BẠN) ==========

async function updateCartCount() {
  try {
    // Kiểm tra xem có user đăng nhập không
    const customerData = localStorage.getItem("currentUser");
    const jwtToken = localStorage.getItem("jwtToken");
    
    if (customerData && jwtToken) {
      try {
        const currentUser = JSON.parse(customerData);
        const userId = currentUser?.id;
        
        if (userId) {
          // Lấy từ database nếu đã đăng nhập - CHỈ dùng database, không fallback localStorage
          try {
            const res = await fetch(`../../api/cart.php?user_id=${userId}`);
            const data = await res.json();
            
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
              if (data.success && data.data.total_items > 0) {
                cartCount.textContent = data.data.total_items;
                cartCount.style.display = 'inline-block';
              } else {
                cartCount.style.display = 'none';
              }
            }
            return;
          } catch (e) {
            console.error("Lỗi khi lấy giỏ hàng từ API:", e);
            // Nếu API lỗi khi đã đăng nhập, hiển thị 0 thay vì dùng localStorage
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
              cartCount.style.display = 'none';
            }
            return;
          }
        }
      } catch (e) {
        console.error("Lỗi parse user data:", e);
      }
    }
    
    // Chỉ dùng localStorage nếu CHƯA đăng nhập
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      cartCount.textContent = totalItems;
      cartCount.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
  } catch (e) { 
    console.error("Lỗi cập nhật giỏ hàng:", e); 
  }
}

async function addToCart(product, quantity) {
  if (!product || !product.product_id) { 
    alert("Lỗi: Không tìm thấy thông tin sản phẩm."); 
    return; 
  }
  
  // Lấy userId từ localStorage
  const customerData = localStorage.getItem("currentUser");
  const jwtToken = localStorage.getItem("jwtToken");
  
  if (!customerData || !jwtToken) {
    alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
    window.location.href = "../login/login.html";
    return;
  }
  
  let userId = null;
  try {
    const currentUser = JSON.parse(customerData);
    userId = currentUser?.id;
  } catch (e) {
    console.error("Lỗi parse user data:", e);
    alert("Lỗi: Không thể xác định người dùng.");
    return;
  }
  
  if (!userId) {
    alert("Lỗi: Không tìm thấy thông tin người dùng.");
    return;
  }
  
  // Gọi API để thêm vào giỏ hàng trong database
  try {
    const response = await fetch("../../api/cart.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwtToken}`
      },
      body: JSON.stringify({
        user_id: userId,
        product_id: product.product_id,
        quantity: quantity
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert("Đã thêm sản phẩm vào giỏ hàng!");
      updateCartCount();
    } else {
      alert(result.message || "Không thể thêm sản phẩm vào giỏ hàng.");
    }
  } catch (error) {
    console.error("Lỗi khi thêm vào giỏ hàng:", error);
    // KHÔNG fallback vào localStorage khi đã đăng nhập - chỉ báo lỗi
    alert("Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.");
  }
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
        window.location.href = "../pay/pay.html";
      }
    });
  }
}

// ====== API & LỌC SẢN PHẨM ======
const API_BASE = "../../api/products_c.php";

function initProductFilter() {
  const categorySelect = document.getElementById("categorySelect");
  const priceSelect = document.getElementById("priceSelect");
  const filterButton = document.getElementById("filterButton");
  const grid = document.getElementById("filteredProducts"); // ✅ chỉ render vào vùng mới
  if (!categorySelect || !priceSelect || !filterButton || !grid) return;

  // 🔹 Lấy danh mục từ API
  fetch(`${API_BASE}?categories=1`)
    .then(res => res.json())
    .then(data => {
      if (data.success && data.categories) {
        data.categories.forEach(cat => {
          const opt = document.createElement("option");
          opt.value = cat.CategoryName;
          opt.textContent = cat.CategoryName;
          categorySelect.appendChild(opt);
        });
      }
    });

  // 🔹 Hàm tải và lọc sản phẩm
  async function loadProducts() {
    const res = await fetch(API_BASE);
    const data = await res.json();
    if (!data.success) return;

    let filtered = data.products;
    const category = categorySelect.value;
    const price = priceSelect.value;

    if (category) filtered = filtered.filter(p => p.CategoryName === category);

    filtered = filtered.filter(p => {
      const priceNum = parseFloat(p.Price);
      if (price === "duoi500") return priceNum < 500000;
      if (price === "500-700") return priceNum >= 500000 && priceNum <= 700000;
      if (price === "tren700") return priceNum > 700000;
      return true;
    });

    grid.innerHTML = "";
    if (!filtered.length) {
      grid.innerHTML = "<p>Không có sản phẩm phù hợp.</p>";
      return;
    }

    filtered.forEach(p => {
      const card = `
        <div class="product-card" data-id="${p.ProductID}">
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
      grid.insertAdjacentHTML("beforeend", card);
    });
    
    // Re-bind navigation sau khi render
    bindProductCardNavigation();
  }
}

// ===== HIỆN/ẨN Ô LỌC NHỎ =====
document.addEventListener("DOMContentLoaded", () => {
  const filterToggleBtn = document.querySelector(".filter-btn"); // nút "Lọc" trên thanh tìm kiếm
  const filterPopup = document.querySelector(".filter-popup");

  if (filterToggleBtn && filterPopup) {
    filterToggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      filterPopup.classList.toggle("show");
    });

    // Ẩn khi click ra ngoài
    document.addEventListener("click", (e) => {
      if (!filterPopup.contains(e.target) && !filterToggleBtn.contains(e.target)) {
        filterPopup.classList.remove("show");
      }
    });
  }
});

// ===== HIỂN THỊ POPUP =====
function showPopup(products) {
  const overlay = document.getElementById("overlay");
  const popupProducts = document.getElementById("popupProducts");
  if (!overlay || !popupProducts) return;

  popupProducts.innerHTML = "";

  if (!products || !products.length) {
    popupProducts.innerHTML = "<p>Không tìm thấy sản phẩm phù hợp.</p>";
  } else {
    products.forEach(p => {
      popupProducts.insertAdjacentHTML("beforeend", `
        <div class="product-card" data-id="${p.ProductID}">
          <div class="product-image-container">
            <a href="../product/product.html?id=${p.ProductID}" class="product-item">
              <img src="../../${p.ImageURL}" alt="${p.ProductName}" class="product-image">
            </a>
          </div>
          <div class="product-info">
            <h3 class="product-name">${p.ProductName}</h3>
            <p class="product-price">${Number(p.Price).toLocaleString()} VNĐ</p>
          </div>
        </div>
      `);
    });
  }

  overlay.classList.remove("hidden");
  
  // Re-bind navigation sau khi render popup
  bindProductCardNavigation();
}

// ===== HIỂN THỊ KẾT QUẢ TRÊN NỀN MỜ =====

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("overlay");
  const popupProducts = document.getElementById("popupProducts");
  const closePopupBtn = document.querySelector(".close-popup");

  const categorySelect = document.getElementById("categorySelect");
  const priceSelect = document.getElementById("priceSelect");
  const applyFilterBtn = document.getElementById("filterButton");

  // ===== ẨN POPUP =====
  function hidePopup() {
    overlay.classList.add("hidden");
  }

  // Nút đóng popup
  closePopupBtn.addEventListener("click", hidePopup);

  // Click ra ngoài cũng tắt
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) hidePopup();
  });

  // ===== SỰ KIỆN LỌC =====
  if (applyFilterBtn) {
    applyFilterBtn.addEventListener("click", async () => {
      const category = categorySelect.value;
      const price = priceSelect.value;
      let min = 0, max = 99999999;

      if (price === "duoi500") max = 500000;
      if (price === "500-700") { min = 500000; max = 700000; }
      if (price === "tren700") min = 700000;

      const res = await fetch(`${API_BASE}?category=${encodeURIComponent(category)}&min=${min}&max=${max}`);
      const data = await res.json();
      showPopup(data.products);
    });
  }
});

// ====== TÌM KIẾM & HIỂN THỊ KẾT QUẢ TRÊN NỀN MỜ ======
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("overlay");
  const popupProducts = document.getElementById("popupProducts");
  const closePopupBtn = document.querySelector(".close-popup");
  const searchIcon = document.querySelector(".nav-search");
  const searchBar = document.querySelector(".search-bar");
  const searchInput = document.getElementById("searchInput");

  // ===== Hiện/ẩn thanh tìm kiếm =====
  if (searchIcon && searchBar) {
    searchIcon.addEventListener("click", (e) => {
      e.preventDefault();
      searchBar.classList.toggle("show");
      document.body.classList.toggle("searching");
    });

    document.addEventListener("click", (e) => {
      if (!searchBar.contains(e.target) && !searchIcon.contains(e.target)) {
        searchBar.classList.remove("show");
        document.body.classList.remove("searching");
      }
    });
  }

  // ===== Hiển thị popup sản phẩm =====
  function showPopup(products) {
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
  }

  // ===== Đóng popup =====
  function hidePopup() { overlay.classList.add("hidden"); }
  closePopupBtn.addEventListener("click", hidePopup);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) hidePopup(); });

  // ===== Gọi API khi nhấn Enter trong ô tìm kiếm =====
  if (searchInput) {
    searchInput.addEventListener("keypress", async (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); // ✅ Ngăn hành vi mặc định chuyển trang
        e.stopPropagation(); // ✅ Ngăn chồng sự kiện khác

        const keyword = e.target.value.trim();
        if (!keyword) return;

        const url = `${API_BASE}?search=${encodeURIComponent(keyword)}`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          showPopup(data.products);
        } catch (err) {
          console.error("❌ Lỗi tìm kiếm:", err);
        }
      }
    });
  }
});

// ✅ Ghi đè hành vi tìm kiếm của main.js chỉ trên trang Home
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector(".search-bar input");

  if (searchInput) {
    // Xóa toàn bộ sự kiện keypress cũ mà main.js đã gắn
    const newInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newInput, searchInput);

    // Gắn lại sự kiện tìm kiếm theo logic của bạn
    newInput.addEventListener("keypress", async (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); // ❌ chặn chuyển hướng từ main.js
        const keyword = e.target.value.trim();
        if (!keyword) return;

        const url = `${API_BASE}?search=${encodeURIComponent(keyword)}`;
        try {
          const res = await fetch(url);
          const data = await res.json();

          // Hiện kết quả trên popup (hàm showPopup bạn đã có)
          if (typeof showPopup === "function") {
            showPopup(data.products);
          } else {
            alert("Không tìm thấy sản phẩm hoặc showPopup chưa được định nghĩa.");
          }
        } catch (err) {
          console.error("❌ Lỗi tìm kiếm:", err);
        }
      }
    });
  }
});
