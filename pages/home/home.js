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

// ===== XỬ LÝ FORM LIÊN HỆ =====
function bindContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async function (event) {
    event.preventDefault(); // Ngăn trình duyệt tải lại trang

    const subjectInput = document.getElementById('contactSubject');
    const messageInput = document.getElementById('contactMessage');
    const submitButton = contactForm.querySelector('.btn-submit');

    // Lấy thông tin đăng nhập
    const token = localStorage.getItem('jwtToken');
    // Sửa lỗi nhỏ: Cần kiểm tra currentUser tồn tại trước khi parse
    let currentUser = null;
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      try {
        currentUser = JSON.parse(currentUserData);
      } catch (e) {
        console.error("Lỗi parse currentUser:", e);
      }
    }

    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!token || !currentUser || !currentUser.id) {
      alert("Vui lòng đăng nhập để gửi liên hệ. Bạn sẽ được chuyển đến trang đăng nhập.");
      window.location.href = "../login/login.html";
      return;
    }

    const data = {
      subject: subjectInput.value,
      message: messageInput.value
    };

    // Vô hiệu hóa nút Gửi và thay đổi text
    submitButton.disabled = true;
    submitButton.textContent = 'Đang gửi...';

    try {
      const response = await fetch('../api/contacts.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Gửi token để xác thực
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("Gửi liên hệ thành công! Chúng tôi sẽ phản hồi bạn sớm nhất.");
        contactForm.reset(); // Xóa nội dung form
      } else {
        throw new Error(result.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Lỗi khi gửi liên hệ:', error);
      alert(`Lỗi: ${error.message}`);
    } finally {
      // Kích hoạt lại nút Gửi
      submitButton.disabled = false;
      submitButton.textContent = 'Gửi đi';
    }
  });
}