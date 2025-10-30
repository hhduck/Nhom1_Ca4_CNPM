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
  const navUserLi = document.querySelector(".nav-user");       // Thẻ <li> cha

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
    // 🔹 ĐÃ ĐĂNG NHẬP

    // SỬA LỖI 2: Ẩn link "Đăng nhập" và "Đăng ký"
    loginLink_1.style.display = "none";
    loginLink_2.style.display = "none";

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

// ===== XỬ LÝ CONTACT FORM =====
function bindContactForm() {
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      // 1. Ngăn form gửi đi và reload lại trang
      e.preventDefault();

      // 2. Lấy dữ liệu (nếu cần)
      const subject = document.getElementById('contactSubject').value;
      const message = document.getElementById('contactMessage').value;

      // 3. Thông báo cho người dùng
      alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');

      // 4. Xóa nội dung form sau khi gửi
      contactForm.reset();
    });
  }
}