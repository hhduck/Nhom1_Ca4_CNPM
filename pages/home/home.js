/**
 * Home Page JavaScript - PHIÊN BẢN CHÍNH XÁC CHO TRANG HOME
 */

document.addEventListener('DOMContentLoaded', function () {
  bindCategoryTabs();
  updateCartCount();
  bindProductCardNavigation();
  handleUserDisplay(); // Xử lý hiển thị user menu
  bindContactForm();   // <--- ĐÃ THÊM
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

document.addEventListener('DOMContentLoaded', function () {
  bindCategoryTabs();
  updateCartCount();
  bindProductCardNavigation();
  handleUserDisplay(); // xử lý menu user
  bindCartNavigation(); // xử lý click vào icon giỏ hàng
});

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
function handleUserDisplay() {
  const loginLink = document.querySelector(".nav-login");
  const userMenu = document.querySelector(".user-menu");

  if (!loginLink || !userMenu) {
    console.error("Thiếu phần tử .nav-login hoặc .user-menu");
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
    // 🔹 ĐÃ ĐĂNG NHẬP → Hiện icon user
    loginLink.innerHTML = `<i class="fas fa-user"></i>`;
    loginLink.href = "#"; // ✅ QUAN TRỌNG: Đặt href="#" để không chuyển trang

    // ✅ Cập nhật link "Thông tin tài khoản" trong menu
    const accountBtn = document.getElementById("tt");
    if (accountBtn) {
      // ✅ XÓA thuộc tính onclick cũ (nếu có)
      accountBtn.onclick = null;

      // ✅ GẮN sự kiện mới
      accountBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const accountUrl = (userType === 'staff')
          ? "../staff/staffProfile/staff_profile.html"
          : "../account/account.html";
        window.location.href = accountUrl;
      });
    }

    // ✅ XÓA listener cũ của loginLink bằng cách clone
    const newLoginLink = loginLink.cloneNode(true);
    loginLink.parentNode.replaceChild(newLoginLink, loginLink);

    // ✅ Gắn event listener MỚI cho icon user
    newLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Toggle hiển thị menu
      const isVisible = userMenu.style.display === "block";
      userMenu.style.display = isVisible ? "none" : "block";
      userMenu.classList.remove("hidden"); // Đảm bảo class hidden bị xóa
    });

    // ✅ Đóng menu khi click ra ngoài
    document.addEventListener('click', (event) => {
      if (!newLoginLink.contains(event.target) && !userMenu.contains(event.target)) {
        userMenu.style.display = "none";
      }
    });

    // ✅ Xử lý nút ĐĂNG XUẤT (Đã sửa ID thành logoutBtnNav)
    const logoutBtn = document.getElementById("logoutBtnNav");
    if (logoutBtn) {
      // XÓA listener cũ bằng cách clone
      const newLogoutBtn = logoutBtn.cloneNode(true);
      logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);

      newLogoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Đăng xuất...");

        // Xóa TẤT CẢ dữ liệu liên quan đến user
        localStorage.removeItem("currentStaff");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("rememberMe");

        // Chuyển về trang login
        window.location.href = "../login/login.html";
      });
    }

    // ✅ Ẩn menu ban đầu
    userMenu.style.display = "none";
    userMenu.classList.remove("hidden");

  } else {
    // 🔸 CHƯA ĐĂNG NHẬP → Giữ nguyên nút đăng nhập
    loginLink.innerHTML = 'ĐĂNG NHẬP/ĐĂNG KÍ';
    loginLink.href = "../login/login.html";
    userMenu.classList.add("hidden");
    userMenu.style.display = "none";
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