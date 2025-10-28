/**
 * Home Page JavaScript - cleaned and aligned with current HTML
 */

// Initialize only what's used on this page
document.addEventListener('DOMContentLoaded', function() {
    bindCategoryTabs();
    updateCartCount();
    bindProductCardNavigation();
});

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}
document.addEventListener("DOMContentLoaded", () => {
  handleUserDisplay();
});

function handleUserDisplay() {
  const loginLink = document.querySelector(".nav-login");
  const userMenu = document.querySelector(".user-menu");

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  if (currentUser && currentUser.id) {
    // 🔹 Đã đăng nhập → Hiện icon user
    loginLink.innerHTML = `<i class="fas fa-user"></i>`;
    loginLink.href = "#";

    // Khi click vào icon user → bật/tắt menu đăng xuất
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      userMenu.style.display = userMenu.style.display === "block" ? "none" : "block";
    });

    // Xử lý đăng xuất
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("jwtToken");
      window.location.href = "../login/login.html";
    });
  } else {
    // 🔸 Chưa đăng nhập → giữ nguyên nút đăng nhập
    userMenu.classList.add("hidden");
  }
}

function bindCategoryTabs() {
    const categoryTabs = document.querySelectorAll('.category-tab');
    if (!categoryTabs.length) return;

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // set active state
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // smooth scroll to target section if provided
            const targetId = this.getAttribute('data-target');
            if (targetId) {
                const targetEl = document.querySelector(targetId);
                if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function bindProductCardNavigation() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            if (id) {
                window.location.href = `../product/product.html?id=${id}`;
            }
        });
    });
}

