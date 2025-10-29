/**
 * Home Page JavaScript - PHIÊN BẢN KẾT HỢP (ỔN ĐỊNH + ĐẦY ĐỦ TÍNH NĂNG)
 */

document.addEventListener('DOMContentLoaded', function () {
  bindCategoryTabs();
  updateCartCount();
  bindProductCardNavigation();
  handleUserDisplay(); // Gộp chung vào DOMContentLoaded
});

// ===== CẬP NHẬT GIỎ HÀNG (GIỮ NGUYÊN) =====
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

// ===== XỬ LÝ USER DISPLAY (CẢI TIẾN) =====
function handleUserDisplay() {
  const loginLink = document.querySelector(".nav-login");
  const userMenu = document.querySelector(".user-menu");

  if (!loginLink || !userMenu) {
    console.error("Thiếu phần tử .nav-login hoặc .user-menu");
    return;
  }

  // ✅ Kiểm tra CẢ Staff VÀ Customer
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
    loginLink.href = "#";

    // ✅ Cập nhật link "Thông tin tài khoản" theo user type
    const accountBtn = document.getElementById("tt");
    if (accountBtn) {
      accountBtn.onclick = (e) => {
        e.preventDefault();
        const accountUrl = (userType === 'staff')
          ? "../staff/staffProfile/staff_profile.html"
          : "../account/account.html";
        window.location.href = accountUrl;
      };
    }

    // ✅ Toggle menu khi click icon (XÓA listener cũ trước)
    const newLoginLink = loginLink.cloneNode(true);
    loginLink.parentNode.replaceChild(newLoginLink, loginLink);

    newLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      userMenu.style.display = (userMenu.style.display === "block") ? "none" : "block";
    });

    // ✅ Đóng menu khi click ra ngoài
    document.addEventListener('click', (event) => {
      if (!newLoginLink.contains(event.target) && !userMenu.contains(event.target)) {
        userMenu.style.display = "none";
      }
    });

    // ✅ Xử lý đăng xuất (XÓA listener cũ trước)
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
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

        window.location.href = "../login/login.html";
      });
    }

    // Ẩn menu ban đầu
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

// ===== CATEGORY TABS (GIỮ NGUYÊN) =====
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

// ===== PRODUCT CARD NAVIGATION (CẢI TIẾN) =====
function bindProductCardNavigation() {
  // ✅ Bind TẤT CẢ loại card
  const allCards = document.querySelectorAll(
    '.product-card, .entremet-card, .mousse-card, .truyenthong-card, .phukien-card'
  );

  allCards.forEach(card => {
    card.addEventListener('click', (event) => {
      // Bỏ qua nếu click vào button/link
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
      // TODO: Hiển thị modal với thông tin khuyến mãi chi tiết
    });
  });
}