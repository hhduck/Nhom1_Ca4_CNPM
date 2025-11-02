/**
 * Register Page JavaScript
 * Handles registration functionality for LA CUISINE NGỌT
 */

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is already logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.id) {
        showMessage('Bạn đã đăng nhập!', 'info');
        setTimeout(() => {
            window.location.href = '../home/home.html';
        }, 1500);
        return;
    }

    // Setup form handling
    setupRegisterForm();
    handleUserDisplay();
    bindCartNavigation();

});

function setupRegisterForm() {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        handleRegistration(e);
    });

    // Add real-time validation
    const inputs = registerForm.querySelectorAll('input[required], textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            validateField(this);
        });

        input.addEventListener('input', function () {
            clearFieldError(this);
            if (this.name === 'password') {
                checkPasswordStrength(this.value);
            }
        });
    });

    // Special handling for password confirmation
    const confirmPassword = document.getElementById('confirmPassword');
    confirmPassword.addEventListener('input', function () {
        validatePasswordConfirmation();
    });
}

function handleRegistration(e) {
    const form = e.target;
    const formData = new FormData(form);

    const userData = {
        firstName: formData.get('firstName').trim(),
        lastName: formData.get('lastName').trim(),
        email: formData.get('email').trim(),
        phone: formData.get('phone').trim(),
        username: formData.get('username').trim(),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        address: formData.get('address').trim(),
        agreeTerms: formData.get('agreeTerms')
    };

    // Validate form
    if (!validateRegisterForm(userData)) {
        return;
    }

    // Show loading state
    const submitBtn = form.querySelector('.btn-submit');
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Đang đăng ký...';

    // Simulate API call
    setTimeout(() => {
        performRegistration(userData);
    }, 2000);
}

function validateRegisterForm(userData) {
    let isValid = true;

    // Clear previous errors
    clearAllErrors();

    // Validate first name
    if (!userData.firstName) {
        showFieldError('firstName', 'Vui lòng nhập họ');
        isValid = false;
    } else if (userData.firstName.length < 2) {
        showFieldError('firstName', 'Họ phải có ít nhất 2 ký tự');
        isValid = false;
    }

    // Validate last name
    if (!userData.lastName) {
        showFieldError('lastName', 'Vui lòng nhập tên');
        isValid = false;
    } else if (userData.lastName.length < 2) {
        showFieldError('lastName', 'Tên phải có ít nhất 2 ký tự');
        isValid = false;
    }

    // Validate email
    if (!userData.email) {
        showFieldError('email', 'Vui lòng nhập email');
        isValid = false;
    } else if (!validateEmail(userData.email)) {
        showFieldError('email', 'Email không hợp lệ');
        isValid = false;
    }

    // Validate phone
    if (!userData.phone) {
        showFieldError('phone', 'Vui lòng nhập số điện thoại');
        isValid = false;
    } else if (!validatePhone(userData.phone)) {
        showFieldError('phone', 'Số điện thoại không hợp lệ');
        isValid = false;
    }

    // Validate username
    if (!userData.username) {
        showFieldError('username', 'Vui lòng nhập tên đăng nhập');
        isValid = false;
    } else if (userData.username.length < 3) {
        showFieldError('username', 'Tên đăng nhập phải có ít nhất 3 ký tự');
        isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
        showFieldError('username', 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới');
        isValid = false;
    }

    // Validate password
    if (!userData.password) {
        showFieldError('password', 'Vui lòng nhập mật khẩu');
        isValid = false;
    } else if (userData.password.length < 6) {
        showFieldError('password', 'Mật khẩu phải có ít nhất 6 ký tự');
        isValid = false;
    }

    // Validate password confirmation
    if (!userData.confirmPassword) {
        showFieldError('confirmPassword', 'Vui lòng xác nhận mật khẩu');
        isValid = false;
    } else if (userData.password !== userData.confirmPassword) {
        showFieldError('confirmPassword', 'Mật khẩu xác nhận không khớp');
        isValid = false;
    }

    // Validate terms agreement
    if (!userData.agreeTerms) {
        showMessage('Vui lòng đồng ý với điều khoản sử dụng', 'error');
        isValid = false;
    }

    return isValid;
}

// 👁️ Toggle show/hide password
document.addEventListener('DOMContentLoaded', function () {
    const togglePassword = document.querySelector('.toggle-password');
    const passwordField = document.getElementById('password');

    if (togglePassword && passwordField) {
        togglePassword.addEventListener('click', function () {
            const isHidden = passwordField.type === 'password';
            passwordField.type = isHidden ? 'text' : 'password';
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
});

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;

    clearFieldError(field);

    switch (fieldName) {
        case 'firstName':
        case 'lastName':
            if (!value) {
                showFieldError(fieldName, `Vui lòng nhập ${fieldName === 'firstName' ? 'họ' : 'tên'}`);
            } else if (value.length < 2) {
                showFieldError(fieldName, `${fieldName === 'firstName' ? 'Họ' : 'Tên'} phải có ít nhất 2 ký tự`);
            } else {
                showFieldSuccess(fieldName);
            }
            break;

        case 'email':
            if (!value) {
                showFieldError(fieldName, 'Vui lòng nhập email');
            } else if (!validateEmail(value)) {
                showFieldError(fieldName, 'Email không hợp lệ');
            } else {
                showFieldSuccess(fieldName);
            }
            break;

        case 'phone':
            if (!value) {
                showFieldError(fieldName, 'Vui lòng nhập số điện thoại');
            } else if (!validatePhone(value)) {
                showFieldError(fieldName, 'Số điện thoại không hợp lệ');
            } else {
                showFieldSuccess(fieldName);
            }
            break;

        case 'username':
            if (!value) {
                showFieldError(fieldName, 'Vui lòng nhập tên đăng nhập');
            } else if (value.length < 3) {
                showFieldError(fieldName, 'Tên đăng nhập phải có ít nhất 3 ký tự');
            } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                showFieldError(fieldName, 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới');
            } else {
                showFieldSuccess(fieldName);
            }
            break;

        case 'password':
            if (!value) {
                showFieldError(fieldName, 'Vui lòng nhập mật khẩu');
            } else if (value.length < 6) {
                showFieldError(fieldName, 'Mật khẩu phải có ít nhất 6 ký tự');
            } else {
                showFieldSuccess(fieldName);
                checkPasswordStrength(value);
            }
            break;
    }
}

function validatePasswordConfirmation() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    clearFieldError(document.getElementById('confirmPassword'));

    if (!confirmPassword) {
        showFieldError('confirmPassword', 'Vui lòng xác nhận mật khẩu');
    } else if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'Mật khẩu xác nhận không khớp');
    } else {
        showFieldSuccess('confirmPassword');
    }
}

function checkPasswordStrength(password) {
    const strengthIndicator = document.querySelector('.password-strength') || createPasswordStrengthIndicator();

    let strength = 'weak';
    let message = 'Mật khẩu yếu';

    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
        strength = 'strong';
        message = 'Mật khẩu mạnh';
    } else if (password.length >= 6) {
        strength = 'medium';
        message = 'Mật khẩu trung bình';
    }

    strengthIndicator.className = `password-strength ${strength}`;
    strengthIndicator.textContent = message;
}

function createPasswordStrengthIndicator() {
    const passwordField = document.getElementById('password');
    const formGroup = passwordField.closest('.form-group');

    const indicator = document.createElement('div');
    indicator.className = 'password-strength';
    formGroup.appendChild(indicator);

    return indicator;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

function showFieldError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    const formGroup = field.closest('.form-group');

    formGroup.classList.add('error');
    formGroup.classList.remove('success');

    // Remove existing error message
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    formGroup.appendChild(errorDiv);
}

function showFieldSuccess(fieldName) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    const formGroup = field.closest('.form-group');

    formGroup.classList.add('success');
    formGroup.classList.remove('error');

    // Remove error message if exists
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    formGroup.classList.remove('error', 'success');

    const errorMessage = formGroup.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function clearAllErrors() {
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('error', 'success');
        const errorMessage = group.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    });
}

function performRegistration(userData) {
fetch("../../api/auth/register.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
})
    .then(res => res.json())
    .then(data => {

        const btn = document.querySelector(".btn-submit");
        btn.classList.remove("loading");
        btn.textContent = "Đăng ký";

        // Case API lỗi validate hoặc trùng
        if (!data.success) {
            showMessage(data.message || "Lỗi không xác định từ server", "error");
            return;
        }

        // Thành công → show success và chuyển trang
        showMessage("Đăng ký thành công!", "success");

        setTimeout(() => {
            window.location.href = "../login/login.html";
        }, 1500);
    })
    .catch(error => {
        console.error("Fetch error:", error);
        showMessage("Không thể kết nối tới server!", "error");
    });
}

// Utility function for showing messages
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    // Insert at top of form container
    const formContainer = document.querySelector('.form-container');
    formContainer.insertBefore(messageDiv, formContainer.firstChild);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Handle Enter key in form
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const form = document.getElementById('registerForm');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
});

// Auto-focus on first name field
window.addEventListener('load', function () {
    const firstNameField = document.getElementById('firstName');
    if (firstNameField) {
        firstNameField.focus();
    }
});

function handleUserDisplay() {
    const loginLink_1 = document.querySelector(".nav-login-1");
    const loginLink_2 = document.querySelector(".nav-login-2");
    const navSeparator = document.querySelector(".nav-separator");
    const userMenu = document.querySelector(".user-menu");
    const navUserLi = document.querySelector(".nav-user");

    if (!loginLink_1 || !loginLink_2 || !navSeparator || !userMenu || !navUserLi) {
        console.error("Lỗi: Thiếu các thành phần navbar để JS hoạt động.");
        return;
    }

    // Kiểm tra CẢ Staff VÀ Customer
    const staffData = localStorage.getItem("currentStaff");
    const customerData = localStorage.getItem("currentUser");
    const jwtToken = localStorage.getItem("jwtToken");

    let currentUser = null;
    let userType = null;

    if (staffData && jwtToken) {
        try {
            currentUser = JSON.parse(staffData);
            if (currentUser && currentUser.id) userType = 'staff';
        } catch (e) { console.error("Lỗi parse staff data:", e); }
    }

    if (!currentUser && customerData && jwtToken) {
        try {
            currentUser = JSON.parse(customerData);
            if (currentUser && currentUser.id) userType = 'customer';
        } catch (e) { console.error("Lỗi parse customer data:", e); }
    }

    if (currentUser && currentUser.id) {
        // ---- ĐÃ ĐĂNG NHẬP ----
        loginLink_1.style.display = "none";
        loginLink_2.style.display = "none";
        navSeparator.style.display = "none";

        userMenu.style.display = "none";
        userMenu.classList.remove("hidden");

        let userIcon = navUserLi.querySelector(".user-icon-link");
        if (!userIcon) {
            userIcon = document.createElement('a');
            userIcon.href = "#";
            userIcon.className = "user-icon-link";
            userIcon.innerHTML = `<i class="fas fa-user"></i>`;
            navUserLi.prepend(userIcon);
        }
        userIcon.style.display = 'inline-block';

        const accountBtn = document.getElementById("tt");
        if (accountBtn) {
            accountBtn.onclick = null;
            accountBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const accountUrl = (userType === 'staff')
                    ? "../../staff/staffProfile/staff_profile.html"
                    // SỬA: Trang register/login không biết user là ai, mặc định về account.html
                    : "../account/account.html";
                window.location.href = accountUrl;
            });
        }

        const newUserIcon = userIcon.cloneNode(true);
        userIcon.parentNode.replaceChild(newUserIcon, userIcon);

        newUserIcon.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isVisible = userMenu.style.display === "block";
            userMenu.style.display = isVisible ? "none" : "block";
        });

        document.addEventListener('click', (event) => {
            if (!newUserIcon.contains(event.target) && !userMenu.contains(event.target)) {
                userMenu.style.display = "none";
            }
        });

        const logoutBtn = document.getElementById("logoutBtnNav");
        if (logoutBtn) {
            const newLogoutBtn = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);

            newLogoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("currentStaff");
                localStorage.removeItem("currentUser");
                localStorage.removeItem("jwtToken");
                localStorage.removeItem("rememberMe");
                window.location.href = "../login/login.html"; // Luôn về login khi logout
            });
        }

    } else {
        // ---- CHƯA ĐĂNG NHẬP ----
        loginLink_1.style.display = "inline-block";
        loginLink_2.style.display = "inline-block";
        navSeparator.style.display = "inline-block";

        userMenu.classList.add("hidden");
        userMenu.style.display = "none";

        let userIcon = navUserLi.querySelector(".user-icon-link");
        if (userIcon) {
            userIcon.style.display = 'none';
        }
    }
}

function bindCartNavigation() {
    const cartIcon = document.querySelector('.nav-cart');
    if (!cartIcon) return;

    cartIcon.addEventListener('click', (e) => {
        // Chặn hành vi <a href> mặc định
        e.preventDefault();

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const currentStaff = JSON.parse(localStorage.getItem('currentStaff'));
        const jwtToken = localStorage.getItem('jwtToken');

        // Nếu chưa đăng nhập -> Cảnh báo
        if ((!currentUser && !currentStaff) || !jwtToken) {
            alert("Vui lòng đăng nhập để xem giỏ hàng.");
            window.location.href = "../login/login.html"; // Chuyển về trang login
            return;
        }

        // Nếu đã đăng nhập -> Đi đến giỏ hàng
        const userId = currentUser?.id || currentStaff?.id || 1;
        window.location.href = `../cart/cart.html?user_id=${userId}`;
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
