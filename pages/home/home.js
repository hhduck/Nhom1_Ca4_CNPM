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
  setTimeout(initProductFilter, 200);
});

// ===== CẬP NHẬT GIỎ HÀNG =====
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
                cartCount.style.display = 'flex';
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
            // Thử parse với URL đầy đủ
            let url;
            if (productLink.href.startsWith('http://') || productLink.href.startsWith('https://')) {
              url = new URL(productLink.href);
            } else {
              // Relative URL - cần convert sang absolute
              url = new URL(productLink.href, window.location.origin);
            }
            productId = url.searchParams.get('id');
          } catch (e) {
            // Fallback: Parse thủ công từ href
            try {
              const match = productLink.href.match(/[?&]id=(\d+)/);
              if (match && match[1]) {
                productId = match[1];
              }
            } catch (e2) {
              console.error("Lỗi parse URL:", e2);
            }
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
    });
  });
}

// ========== LOAD SẢN PHẨM TỪ API ==========
async function loadProductsFromAPI() {
  try {
    // Load tất cả sản phẩm available với cache-busting để đảm bảo load dữ liệu mới
    const cacheBuster = new Date().getTime();
    const response = await fetch(`../../api/products.php?status=available&_t=${cacheBuster}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-store' // Đảm bảo không cache request
    });
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const result = await response.json();
    
    if (result.success && result.data && result.data.products) {
      const products = result.data.products;
      
      // Render products vào các section (sẽ tự động filter status='available' bên trong)
      renderProductsByCategory(products);
    } else {
      console.error('Không thể load sản phẩm:', result.message);
      // Hiển thị message lỗi trên UI nếu cần
      const productsGrid = document.getElementById('productsGrid');
      if (productsGrid) {
        productsGrid.innerHTML = '<p style="text-align: center; width: 100%;">Không thể tải sản phẩm. Vui lòng thử lại sau.</p>';
      }
    }
  } catch (error) {
    console.error('Lỗi load sản phẩm:', error);
    // Hiển thị message lỗi trên UI
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
      productsGrid.innerHTML = '<p style="text-align: center; width: 100%;">Không thể tải sản phẩm. Vui lòng thử lại sau.</p>';
    }
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

  // Lọc chỉ lấy sản phẩm có status = 'available'
  const availableProducts = products.filter(p => p.status === 'available');

  // Render vào products-grid (section SẢN PHẨM)
  const productsGrid = document.getElementById('productsGrid');
  if (productsGrid) {
    // Clear trước khi render
    productsGrid.innerHTML = '';
    
    // Lấy 3 sản phẩm đầu tiên từ danh sách available
    const featuredProducts = availableProducts.slice(0, 3);
    if (featuredProducts.length > 0) {
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
    } else {
      productsGrid.innerHTML = '<p style="text-align: center; width: 100%;">Chưa có sản phẩm nổi bật</p>';
    }
  }

  // Render vào entremet-grid
  const entremetGrid = document.querySelector('.entremet-grid');
  if (entremetGrid) {
    // Clear trước khi render
    entremetGrid.innerHTML = '';
    
    const entremetProducts = availableProducts.filter(p => p.category_id == categoryMap['Entremet'] || p.category_name === 'Entremet');
    if (entremetProducts.length > 0) {
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
    } else {
      entremetGrid.innerHTML = '<p style="text-align: center; width: 100%;">Chưa có sản phẩm Entremet</p>';
    }
  }

  // Render vào mousse-grid
  const mousseGrid = document.querySelector('.mousse-grid');
  if (mousseGrid) {
    // Clear trước khi render
    mousseGrid.innerHTML = '';
    
    const mousseProducts = availableProducts.filter(p => p.category_id == categoryMap['Mousse'] || p.category_name === 'Mousse');
    if (mousseProducts.length > 0) {
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
    } else {
      mousseGrid.innerHTML = '<p style="text-align: center; width: 100%;">Chưa có sản phẩm Mousse</p>';
    }
  }

  // Render vào truyenthong-grid
  const truyenthongGrid = document.querySelector('.truyenthong-grid');
  if (truyenthongGrid) {
    // Clear trước khi render
    truyenthongGrid.innerHTML = '';
    
    const truyenthongProducts = availableProducts.filter(p => p.category_id == categoryMap['Truyền thống'] || p.category_name === 'Truyền thống');
    if (truyenthongProducts.length > 0) {
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
    } else {
      truyenthongGrid.innerHTML = '<p style="text-align: center; width: 100%;">Chưa có sản phẩm Truyền thống</p>';
    }
  }

  // Render vào phukien-grid
  const phukienGrid = document.querySelector('.phukien-grid');
  if (phukienGrid) {
    // Clear trước khi render
    phukienGrid.innerHTML = '';
    
    const phukienProducts = availableProducts.filter(p => p.category_id == categoryMap['Phụ kiện'] || p.category_name === 'Phụ kiện');
    if (phukienProducts.length > 0) {
      phukienGrid.innerHTML = phukienProducts.map(product => `
      <div class="phukien-card" data-id="${product.product_id}">
        <div class="phukien-image-container">
          <a href="../product/product.html?id=${product.product_id}" class="product-item">
            <img class="phukien-image" src="../../${product.image_url}" alt="${product.product_name}" />
          </a>
        </div>
        <div class="phukien-info">
          <div class="phukien-name">${product.product_name}</div>
          <div class="phukien-price">${formatPrice(product.price)}</div>
        </div>
      </div>
    `).join('');
    } else {
      phukienGrid.innerHTML = '<p style="text-align: center; width: 100%;">Chưa có sản phẩm Phụ kiện</p>';
    }
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
    // Load promotions với cache-busting để đảm bảo load dữ liệu mới
    const cacheBuster = new Date().getTime();
    const response = await fetch(`../../api/promotions.php?public=1&_t=${cacheBuster}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
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
  if (!promotionGrid) {
    console.error('Không tìm thấy .promotion-grid');
    return;
  }
  
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
    
    // Xử lý image_url: Nếu có đường dẫn và không bắt đầu bằng http/https, thêm prefix
    let imageUrl = '';
    // Kiểm tra image_url có giá trị không (không phải null, undefined, hoặc empty string)
    if (promo.image_url && promo.image_url.trim() !== '') {
      // Nếu đã có đường dẫn đầy đủ (http/https), dùng trực tiếp
      if (promo.image_url.startsWith('http://') || promo.image_url.startsWith('https://')) {
        imageUrl = promo.image_url;
      } 
      // Nếu bắt đầu bằng "assets/", thêm "../.." để đi từ pages/home/
      else if (promo.image_url.startsWith('assets/')) {
        imageUrl = `../../${promo.image_url}`;
      }
      // Nếu không có prefix, thêm "assets/images/" nếu chưa có
      else if (!promo.image_url.includes('/')) {
        imageUrl = `../../assets/images/${promo.image_url}`;
      }
      // Giữ nguyên nếu có đường dẫn đầy đủ
      else {
        imageUrl = `../../${promo.image_url}`;
      }
    } else {
      // Placeholder nếu không có image_url
      imageUrl = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22%3E%3Crect fill=%22%23f8f9fa%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%23adb5bd%22 font-family=%22Arial%22 font-size=%2214%22%3EKhuy%E1%BA%BFn m%C3%A3i%3C/text%3E%3C/svg%3E';
    }
    
    return `
      <div class="promotion-card">
        <div class="promotion-image-container">
          <img src="${imageUrl}" alt="${promo.promotion_name}" class="promotion-image" 
               onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22%3E%3Crect fill=%22%23f8f9fa%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%23adb5bd%22 font-family=%22Arial%22 font-size=%2214%22%3EKhuy%E1%BA%BFn m%C3%A3i%3C/text%3E%3C/svg%3E';">
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
