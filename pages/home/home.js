/**
 * Home Page JavaScript - PHIÊN BẢN CHÍNH XÁC CHO TRANG HOME
 */

// Gộp 2 listener thành 1
document.addEventListener('DOMContentLoaded', function () {
  // Các hàm từ listener 1
  bindCategoryTabs();
  updateCartCount();
  bindProductCardNavigation();
  handleUserDisplay();
  bindContactForm(); // <--- Hàm này giờ đã tồn tại (sau khi bạn dán code ở trên)

  // Hàm từ listener 2
  bindCartNavigation();

  // Load products từ API
  loadProductsFromAPI();
  
  // Load promotions từ API
  loadPromotionsFromAPI();
});

// ===== CẬP NHẬT GIỎ HÀNG =====
function updateCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      cartCount.textContent = totalItems;
      cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
  } catch (e) {
    console.error("Lỗi cập nhật giỏ hàng:", e);
  }
}

function bindCartNavigation() {
  const cartIcon = document.querySelector('.nav-cart'); // <-- đổi class
  if (!cartIcon) return;

  cartIcon.addEventListener('click', (e) => {
    e.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentStaff = JSON.parse(localStorage.getItem('currentStaff'));
    const jwtToken = localStorage.getItem('jwtToken');

    if ((!currentUser && !currentStaff) || !jwtToken) {
      alert("Vui lòng đăng nhập để xem giỏ hàng.");
      window.location.href = "../login/login.html";
      return;
    }

    const userId = currentUser?.id || currentStaff?.id || 1;
    window.location.href = `../cart/cart.html?user_id=${userId}`;
  });
}


// ===== XỬ LÝ USER DISPLAY - SỬA LỖI HIỂN THỊ MENU =====
// ===== XỬ LÝ USER DISPLAY - PHIÊN BẢN ĐÃ SỬA LỖI =====
function handleUserDisplay() {
  const loginLink_1 = document.querySelector(".nav-login-1"); // Link "ĐĂNG NHẬP"
  const loginLink_2 = document.querySelector(".nav-login-2"); // Link "ĐĂNG KÍ"
  const userMenu = document.querySelector(".user-menu");       // Menu xổ xuống (ẩn)
  const navUserLi = document.querySelector(".nav-user");
  const navSeparator = document.querySelector(".nav-separator");    // Thẻ <li> cha

  // SỬA LỖI 1: Kiểm tra đúng các biến đã khai báo
  if (!loginLink_1 || !loginLink_2 || !userMenu || !navUserLi) {
    console.error("Thiếu phần tử .nav-login-1, .nav-login-2, .user-menu, hoặc .nav-user");
    return;
  }

  // Kiểm tra CẢ Staff VÀ Customer
  const staffData = localStorage.getItem("currentStaff");
  const customerData = localStorage.getItem("currentUser");
  const jwtToken = localStorage.getItem("jwtToken");

  let currentUser = null;
  let userType = null;

  // Ưu tiên Staff/Admin
  if (staffData && jwtToken) {
    try {
      currentUser = JSON.parse(staffData);
      if (currentUser && currentUser.id) userType = 'staff';
    } catch (e) {
      console.error("Lỗi parse staff data:", e);
    }
  }

  // Nếu không phải staff, check customer
  if (!currentUser && customerData && jwtToken) {
    try {
      currentUser = JSON.parse(customerData);
      if (currentUser && currentUser.id) userType = 'customer';
    } catch (e) {
      console.error("Lỗi parse customer data:", e);
    }
  }

  if (currentUser && currentUser.id) {
    // ĐÃ ĐĂNG NHẬP thì ẩn đi link đăng nhập và đăng ký
    loginLink_1.style.display = "none";
    loginLink_2.style.display = "none";
    if (navSeparator) navSeparator.style.display = "none";

    // Hiện user menu (ban đầu ẩn)
    userMenu.style.display = "none";
    userMenu.classList.remove("hidden");

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
          ? "../staff/staffProfile/staff_profile.html"
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
        console.log("Đăng xuất...");
        localStorage.removeItem("currentStaff");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("rememberMe");
        window.location.href = "../login/login.html";
      });
    }

  } else {
    // CHƯA ĐĂNG NHẬP

    // SỬA LỖI 3: Hiện link "Đăng nhập" và "Đăng ký"
    loginLink_1.style.display = "inline-block";
    loginLink_2.style.display = "inline-block";

    // Ẩn menu user
    userMenu.classList.add("hidden");
    userMenu.style.display = "none";

    // Ẩn icon user (nếu nó tồn tại)
    let userIcon = navUserLi.querySelector(".user-icon-link");
    if (userIcon) {
      userIcon.style.display = 'none';
    }
  }
}

// ===== CATEGORY TABS =====
function bindCategoryTabs() {
  const categoryTabs = document.querySelectorAll('.category-tab');
  if (!categoryTabs.length) return;

  categoryTabs.forEach(tab => {
    tab.addEventListener('click', function () {
      // Set active state
      categoryTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      // Smooth scroll to target section
      const targetId = this.getAttribute('data-target');
      if (targetId) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}

// ===== PRODUCT CARD NAVIGATION =====
function bindProductCardNavigation() {
  // ✅ Bind TẤT CẢ loại card
  const allCards = document.querySelectorAll(
    '.product-card, .entremet-card, .mousse-card, .truyenthong-card, .phukien-card'
  );

  allCards.forEach(card => {
    card.addEventListener('click', (event) => {
      // ✅ Bỏ qua nếu click vào button hoặc link
      if (event.target.closest('button, a')) return;

      let productId = card.dataset.id;

      // ✅ Fallback: Tìm ID từ link bên trong nếu không có data-id
      if (!productId) {
        const productLink = card.querySelector('a.product-item, a[href*="product.html?id="]');
        if (productLink) {
          try {
            const url = new URL(productLink.href, window.location.origin);
            productId = url.searchParams.get('id');
          } catch (e) {
            console.error("Lỗi parse URL:", e);
          }
        }
      }

      if (productId) {
        window.location.href = `../product/product.html?id=${productId}`;
      } else {
        console.warn("Không tìm thấy ID sản phẩm cho card này:", card);
      }
    });
  });

  // ✅ Xử lý riêng cho Promotion Cards (không chuyển trang)
  const promotionCards = document.querySelectorAll('.promotion-card');
  promotionCards.forEach(card => {
    card.addEventListener('click', (event) => {
      event.stopPropagation();
      console.log("Promotion card clicked - Có thể thêm modal chi tiết khuyến mãi");
    });
  });
}

// ========== LOAD SẢN PHẨM TỪ API ==========
async function loadProductsFromAPI() {
  try {
    // Load tất cả sản phẩm available
    const response = await fetch('../../api/products.php?status=available');
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const result = await response.json();
    
    if (result.success && result.data && result.data.products) {
      const products = result.data.products;
      
      // Render products vào các section
      renderProductsByCategory(products);
    } else {
      console.error('Không thể load sản phẩm:', result.message);
    }
  } catch (error) {
    console.error('Lỗi load sản phẩm:', error);
  }
}

function renderProductsByCategory(products) {
  // Map category names
  const categoryMap = {
    'Entremet': 1,
    'Mousse': 2,
    'Truyền thống': 3,
    'Phụ kiện': 4
  };

  // Render vào products-grid (section SẢN PHẨM)
  const productsGrid = document.getElementById('productsGrid');
  if (productsGrid) {
    // Lấy 3 sản phẩm đầu tiên
    const featuredProducts = products.slice(0, 3);
    productsGrid.innerHTML = featuredProducts.map(product => `
      <div class="product-card" data-id="${product.product_id}">
        <div class="product-image-container">
          <a href="../product/product.html?id=${product.product_id}" class="product-item">
            <img src="../../${product.image_url}" alt="${product.product_name}" class="product-image">
          </a>
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.product_name}</h3>
          <p class="product-price">${formatPrice(product.price)}</p>
        </div>
      </div>
    `).join('');
  }

  // Render vào entremet-grid
  const entremetGrid = document.querySelector('.entremet-grid');
  if (entremetGrid) {
    const entremetProducts = products.filter(p => p.category_id == categoryMap['Entremet'] || p.category_name === 'Entremet');
    entremetGrid.innerHTML = entremetProducts.map(product => `
      <div class="entremet-card" data-id="${product.product_id}">
        <div class="entremet-image-container">
          <a href="../product/product.html?id=${product.product_id}" class="product-item">
            <img class="entremet-image" src="../../${product.image_url}" alt="${product.product_name}" />
          </a>
        </div>
        <div class="entremet-info">
          <div class="entremet-name">${product.product_name}</div>
          <div class="entremet-price">${formatPrice(product.price)}</div>
        </div>
      </div>
    `).join('');
  }

  // Render vào mousse-grid
  const mousseGrid = document.querySelector('.mousse-grid');
  if (mousseGrid) {
    const mousseProducts = products.filter(p => p.category_id == categoryMap['Mousse'] || p.category_name === 'Mousse');
    mousseGrid.innerHTML = mousseProducts.map(product => `
      <div class="mousse-card" data-id="${product.product_id}">
        <div class="mousse-image-container">
          <a href="../product/product.html?id=${product.product_id}" class="product-item">
            <img class="mousse-image" src="../../${product.image_url}" alt="${product.product_name}" />
          </a>
        </div>
        <div class="mousse-info">
          <div class="mousse-name">${product.product_name}</div>
          <div class="mousse-price">${formatPrice(product.price)}</div>
        </div>
      </div>
    `).join('');
  }

  // Render vào truyenthong-grid
  const truyenthongGrid = document.querySelector('.truyenthong-grid');
  if (truyenthongGrid) {
    const truyenthongProducts = products.filter(p => p.category_id == categoryMap['Truyền thống'] || p.category_name === 'Truyền thống');
    truyenthongGrid.innerHTML = truyenthongProducts.map(product => `
      <div class="truyenthong-card" data-id="${product.product_id}">
        <div class="truyenthong-image-container">
          <a href="../product/product.html?id=${product.product_id}" class="product-item">
            <img class="truyenthong-image" src="../../${product.image_url}" alt="${product.product_name}" />
          </a>
        </div>
        <div class="truyenthong-info">
          <div class="truyenthong-name">${product.product_name}</div>
          <div class="truyenthong-price">${formatPrice(product.price)}</div>
        </div>
      </div>
    `).join('');
  }

  // Re-bind navigation sau khi render
  bindProductCardNavigation();
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}

// ========== LOAD PROMOTIONS TỪ API ==========
async function loadPromotionsFromAPI() {
  try {
    const response = await fetch('../../api/promotions.php?public=1');
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const result = await response.json();
    
    if (result.success && result.data && result.data.promotions) {
      const promotions = result.data.promotions;
      renderPromotions(promotions);
    } else {
      console.error('Không thể load khuyến mãi:', result.message);
    }
  } catch (error) {
    console.error('Lỗi load khuyến mãi:', error);
  }
}

function renderPromotions(promotions) {
  const promotionGrid = document.querySelector('.promotion-grid');
  if (!promotionGrid) return;
  
  if (promotions.length === 0) {
    promotionGrid.innerHTML = '<p style="text-align: center; width: 100%;">Hiện tại không có khuyến mãi nào</p>';
    return;
  }
  
  promotionGrid.innerHTML = promotions.map(promo => {
    const startDate = new Date(promo.start_date);
    const endDate = new Date(promo.end_date);
    const formatDateVN = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    
    // Nếu không có image_url, dùng placeholder hoặc bỏ qua ảnh
    const imageUrl = promo.image_url ? `../../${promo.image_url}` : 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22%3E%3Crect fill=%22%23f8f9fa%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%23adb5bd%22 font-family=%22Arial%22 font-size=%2214%22%3EKhuy%E1%BA%BFn m%C3%A3i%3C/text%3E%3C/svg%3E';
    
    return `
      <div class="promotion-card">
        <div class="promotion-image-container">
          <img src="${imageUrl}" alt="${promo.promotion_name}" class="promotion-image">
        </div>
        <div class="promotion-info">
          <div class="promotion-name">${promo.promotion_name}</div>
          <div class="promotion-date">Áp dụng từ ${formatDateVN(startDate)} đến ${formatDateVN(endDate)}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ========== XỬ LÝ FORM LIÊN HỆ ==========
function bindContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const subject = document.getElementById('contactSubject').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    // ✅ Lấy user từ localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.id) {
      alert("Vui lòng đăng nhập để gửi liên hệ.");
      window.location.href = "../login/login.html";
      return;
    }

    fetch("../../api/contact-home.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: currentUser.id, // Gửi ID người dùng
        subject,
        message
      })
    })
    .then(async res => {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        console.error("Server trả về không phải JSON:", text);
        throw new Error("Server không trả về JSON hợp lệ");
      }
    })
    .then(res => {
      if (res.success) {
        alert(res.message || "Gửi liên hệ thành công!");
        contactForm.reset();
      } else {
        alert("Gửi thất bại: " + res.message);
      }
    })
    .catch(err => {
      console.error(err);
      alert("Có lỗi xảy ra khi gửi liên hệ.");
    });
  });
}
