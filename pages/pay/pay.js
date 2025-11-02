// ======================================================
// pay.js - PHIÊN BẢN HOÀN CHỈNH (SỬA LỖI DATA + CSS + SHIPPING)
// ======================================================

// Biến toàn cục để lưu giỏ hàng, tránh gọi API liên tục
let globalCartItems = [];
let globalPromotions = [];
let globalCurrentUser = null;

// --- CÁC HÀM XỬ LÝ NAVBAR CHUẨN ---

/**
 * Đăng xuất người dùng
 */
function performLogout(redirectUrl = "../login/login.html") {
  localStorage.removeItem("currentStaff");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("rememberMe");
  window.location.href = redirectUrl;
}

/**
 * Xử lý hiển thị Navbar dựa trên trạng thái đăng nhập
 */
function handleUserDisplay() {
  const loginLink_1 = document.querySelector(".nav-login-1");
  const loginLink_2 = document.querySelector(".nav-login-2");
  const navSeparator = document.querySelector(".nav-separator");
  const userMenu = document.querySelector(".user-menu");
  const navUserLi = document.querySelector(".nav-user");

  if (!loginLink_1 || !loginLink_2 || !navSeparator || !userMenu || !navUserLi) {
    console.error("Lỗi: Thiếu các thành phần navbar.");
    return;
  }

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

  // Lưu user vào biến toàn cục để các hàm khác sử dụng
  globalCurrentUser = currentUser;

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
    const accountBtn = document.getElementById("accountBtn");
    if (accountBtn) {
      const newAccountBtn = accountBtn.cloneNode(true);
      accountBtn.parentNode.replaceChild(newAccountBtn, accountBtn);
      newAccountBtn.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const accountUrl = (userType === 'staff') ? "../staff/staffProfile/staff_profile.html" : "../account/account.html";
        window.location.href = accountUrl;
      });
    }
    const newUserIcon = userIcon.cloneNode(true);
    userIcon.parentNode.replaceChild(newUserIcon, userIcon);
    newUserIcon.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      const isVisible = userMenu.style.display === "block";
      userMenu.style.display = isVisible ? "none" : "block";
    });
    const logoutBtn = document.getElementById("logoutBtnNav");
    if (logoutBtn) {
      const newLogoutBtn = logoutBtn.cloneNode(true);
      logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
      newLogoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        performLogout();
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
    if (userIcon) { userIcon.style.display = 'none'; }
  }
  document.addEventListener('click', (event) => {
    const userIcon = navUserLi.querySelector(".user-icon-link");
    if (userMenu && userIcon && !userIcon.contains(event.target) && !userMenu.contains(event.target)) {
      userMenu.style.display = "none";
    }
  });
}
// --- KẾT THÚC HÀM NAVBAR ---


// --- HÀM CHÍNH CỦA TRANG THANH TOÁN ---

document.addEventListener('DOMContentLoaded', () => {

  // 1. Chạy hàm Navbar (sẽ set globalCurrentUser)
  handleUserDisplay();

  // 2. Kiểm tra đăng nhập
  if (!globalCurrentUser || !globalCurrentUser.id) {
    alert("Vui lòng đăng nhập để tiến hành thanh toán.");
    window.location.href = "../login/login.html?redirect=pay";
    return; // Dừng thực thi nếu chưa đăng nhập
  }

  // 3. Khởi chạy các hàm
  loadUserData(globalCurrentUser); // Tải thông tin user vào form
  loadCartFromAPI(globalCurrentUser.id); // Tải giỏ hàng từ CSDL
  setupDeliveryOptions(); // Cài đặt logic giao hàng (HCM)
  setupValidation(); // Cài đặt logic kiểm tra form
  loadPromotions(); // Tải khuyến mãi
});

/**
 * Tự động điền thông tin người dùng đã đăng nhập
 */
function loadUserData(user) {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  form.fullname.value = user.full_name || '';
  form.phone.value = user.phone || '';
  form.email.value = user.email || '';
  form.address.value = user.address || '';
}

/**
 * Tải giỏ hàng từ CSDL (API GET)
 */
async function loadCartFromAPI(userId) {
  const cartTableBody = document.getElementById("cartTableBody");
  try {
    const response = await fetch(`../../api/cart.php?user_id=${userId}`);
    const data = await response.json();

    if (data.success && data.data.items.length > 0) {
      globalCartItems = data.data.items; // Lưu vào biến toàn cục
      renderCartTable(globalCartItems);
      calculateTotals(); // Tính tổng tiền lần đầu
    } else {
      globalCartItems = [];
      cartTableBody.innerHTML = `<tr><td colspan="2" style="text-align: center; padding: 20px;">Giỏ hàng của bạn đang trống.</td></tr>`;
      calculateTotals(); // Tính tổng tiền (sẽ là 0)
    }
  } catch (err) {
    console.error("Lỗi tải giỏ hàng CSDL:", err);
    cartTableBody.innerHTML = `<tr><td colspan="2" style="text-align: center; color: red; padding: 20px;">Lỗi tải giỏ hàng.</td></tr>`;
  }
}

/**
 * Vẽ lại bảng giỏ hàng
 */
function renderCartTable(items) {
  const cartTableBody = document.getElementById("cartTableBody");
  cartTableBody.innerHTML = ''; // Xóa nội dung "Đang tải..."
  items.forEach(item => {
    const subtotal = (item.price || 0) * (item.quantity || 1);
    const row = document.createElement('tr');
    row.innerHTML = `
            <td>
                ${item.product_name} <strong>&times; ${item.quantity}</strong>
                ${item.note ? `<div class_="prod-note" style="font-size: 0.9em; color: #777;">Ghi chú: ${item.note}</div>` : ''}
            </td>
            <td style="text-align: right; font-weight: 500;">${formatCurrency(subtotal)}</td>
        `;
    cartTableBody.appendChild(row);
  });
}

/**
 * Tính toán lại toàn bộ tổng tiền
 */
function calculateTotals() {
  const subtotal = globalCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Lấy phương thức vận chuyển
  const deliveryMethod = document.querySelector('input[name="delivery"]:checked').value;

  // SỬA LỖI SHIPPING: 30.000 nếu là 'delivery', 0 nếu là 'store'
  const shipping = (deliveryMethod === 'delivery') ? 30000 : 0;

  const vat = Math.round(subtotal * 0.08); // Giả sử VAT 8%

  // Tính giảm giá
  const discountInfo = applyPromotion();
  const discount = discountInfo.discount;

  const grand = subtotal + shipping + vat - discount;

  // Cập nhật DOM
  document.getElementById("subtotal").textContent = formatCurrency(subtotal);
  document.getElementById("vat").textContent = formatCurrency(vat);
  document.getElementById("shipping").textContent = (shipping === 0) ? 'Miễn phí' : formatCurrency(shipping);
  document.getElementById("grandtotal").textContent = formatCurrency(grand);

  const discountRow = document.getElementById("discountRow");
  if (discount > 0) {
    document.getElementById("discount").textContent = `- ${formatCurrency(discount)}`;
    discountRow.style.display = 'flex'; // Hiện hàng giảm giá
  } else {
    discountRow.style.display = 'none'; // Ẩn hàng giảm giá
  }
}

/**
 * Tải danh sách khuyến mãi
 */
async function loadPromotions() {
  const promoSelect = document.getElementById("promotionSelect");
  const promoMessage = document.getElementById("promoMessage");
  try {
    const response = await fetch("../../api/promotions.php?public=1");
    const data = await response.json();

    if (data.success && data.data?.promotions?.length) {
      globalPromotions = data.data.promotions; // Lưu vào biến toàn cục
      promoSelect.innerHTML = '<option value="">-- Chọn mã khuyến mãi --</option>';

      globalPromotions.forEach(promo => {
        const now = new Date();
        const start = new Date(promo.start_date);
        const end = new Date(promo.end_date);

        // Chỉ hiển thị mã còn hạn và active
        if (/*promo.status === 'active' &&*/ now >= start && now <= end) {
          const opt = document.createElement("option");
          opt.value = promo.promotion_code;
          opt.dataset.promo = JSON.stringify(promo); // Gắn dữ liệu vào option
          opt.textContent = `${promo.promotion_name} (${promo.promotion_code})`;
          promoSelect.appendChild(opt);
        }
      });

      // Gắn sự kiện: khi thay đổi khuyến mãi -> tính lại tổng tiền
      promoSelect.addEventListener("change", calculateTotals);

    } else {
      promoMessage.textContent = "Hiện chưa có khuyến mãi khả dụng.";
    }
  } catch (err) {
    console.error("Lỗi tải khuyến mãi:", err);
    promoMessage.textContent = "Không tải được danh sách khuyến mãi.";
  }
}

/**
 * Kiểm tra và áp dụng khuyến mãi
 * (Hàm này chỉ trả về số tiền giảm, không cập nhật DOM)
 */
function applyPromotion() {
  const promoSelect = document.getElementById("promotionSelect");
  const promoMessage = document.getElementById("promoMessage");
  const selectedOption = promoSelect.options[promoSelect.selectedIndex];

  if (!selectedOption || !selectedOption.value) {
    promoMessage.textContent = "";
    return { discount: 0 };
  }

  const promo = JSON.parse(selectedOption.dataset.promo);
  const subtotal = globalCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (subtotal < (promo.min_order_value || 0)) {
    promoMessage.textContent = `Đơn hàng tối thiểu ${formatCurrency(promo.min_order_value)}đ.`;
    promoMessage.style.color = "orange";
    return { discount: 0 };
  }

  let discount = 0;
  if (promo.promotion_type === "percent") {
    discount = (promo.discount_value / 100) * subtotal;
    if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
  } else if (promo.promotion_type === "fixed_amount") {
    discount = promo.discount_value;
  }

  promoMessage.textContent = `✅ Áp dụng mã ${promo.promotion_code}, giảm ${formatCurrency(discount)}`;
  promoMessage.style.color = "green";
  return { discount: Math.round(discount) };
}

/**
 * Cài đặt logic cho ô Giao Hàng
 */
// Dán vào pay.js, thay thế hàm setupDeliveryOptions cũ

/**
 * Cài đặt logic cho ô Giao Hàng (Hỗ trợ Phường/Xã)
 */
function setupDeliveryOptions() {

  // (DỮ LIỆU GIẢ LẬP) 
  // Bạn cần thay thế khối này bằng CSDL/API về địa chỉ của bạn
  const locationData = {
    "TP. Thủ Đức": ["An Khánh", "An Lợi Đông", "An Phú", "Bình Chiểu", "Bình Thọ", "Bình Trưng Đông", "Bình Trưng Tây", "Cát Lái", "Hiệp Bình Chánh", "Hiệp Bình Phước", "Hiệp Phú", "Linh Chiểu", "Linh Đông", "Linh Tây", "Linh Trung", "Linh Xuân", "Long Bình", "Long Phước", "Long Thạnh Mỹ", "Long Trường", "Phú Hữu", "Phước Bình", "Phước Long A", "Phước Long B", "Tam Bình", "Tam Phú", "Tăng Nhơn Phú A", "Tăng Nhơn Phú B", "Thạnh Mỹ Lợi", "Thảo Điền", "Thủ Thiêm", "Trường Thạnh", "Trường Thọ"],
    "Quận 1": ["Bến Nghé", "Bến Thành", "Cầu Kho", "Cầu Ông Lãnh", "Cô Giang", "Đa Kao", "Nguyễn Cư Trinh", "Nguyễn Thái Bình", "Phạm Ngũ Lão", "Tân Định"],
    "Quận 3": ["Phường 01", "Phường 02", "Phường 03", "Phường 04", "Phường 05", "Võ Thị Sáu", "Phường 09", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14"],
    "Quận Gò Vấp": ["Phường 01", "Phường 03", "Phường 04", "Phường 05", "Phường 06", "Phường 07", "Phường 08", "Phường 09", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16", "Phường 17"],
    // (Thêm các quận/huyện khác vào đây)
  };
  // (KẾT THÚC DỮ LIỆU GIẢ LẬP)

  const districtSelect = document.getElementById('district'); // Đổi tên từ 'ward'
  const wardSelect = document.getElementById('ward');
  const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
  const deliveryInfo = document.querySelector('.delivery-info');

  // Tự động điền Quận/Huyện từ key của locationData
  districtSelect.innerHTML = '<option value="">-- Chọn quận / huyện --</option>';
  for (const districtName in locationData) {
    const opt = document.createElement('option');
    opt.value = districtName;
    opt.textContent = districtName;
    districtSelect.appendChild(opt);
  }

  // Gắn sự kiện: Khi chọn Quận/Huyện...
  districtSelect.addEventListener('change', function () {
    const selectedDistrict = this.value;
    const wards = locationData[selectedDistrict] || [];

    wardSelect.innerHTML = '<option value="">-- Chọn phường / xã --</option>';

    if (wards.length > 0) {
      wardSelect.disabled = false; // Mở khóa dropdown Phường/Xã
      wards.forEach(wardName => {
        const opt = document.createElement('option');
        opt.value = wardName;
        opt.textContent = wardName;
        wardSelect.appendChild(opt);
      });
    } else {
      wardSelect.disabled = true; // Khóa lại nếu không có dữ liệu
    }
  });

  // Ẩn/hiện khối giao hàng và TÍNH LẠI TỔNG TIỀN
  deliveryOptions.forEach(option => {
    option.addEventListener("change", function () {
      deliveryInfo.style.display = this.value === 'delivery' ? 'block' : 'none';
      // Tính lại tổng tiền (vì phí ship thay đổi)
      calculateTotals();
    });
  });
}

/**
 * Cài đặt kiểm tra lỗi form
 */
function setupValidation() {
  const checkoutForm = document.getElementById("checkoutForm");
  const placeOrderBtn = document.getElementById("placeOrder");

  checkoutForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Ẩn tất cả thông báo lỗi cũ
    document.querySelectorAll(".error-msg").forEach(el => el.style.display = "none");
    document.querySelectorAll("input.error, select.error").forEach(el => el.classList.remove("error"));

    let isValid = true;

    // --- Kiểm tra các trường ---
    if (!validateField(this.fullname, "Vui lòng nhập họ và tên.")) isValid = false;
    if (!validateField(this.phone, "Số điện thoại phải có 10 số.", /^\d{10}$/)) isValid = false;
    if (!validateField(this.email, "Email không hợp lệ.", /^[^\s@]+@[^\s@]+\.[^\s@]+$/)) isValid = false;

    // Kiểm tra thời gian
    const deliveryTimeInput = this.deliveryTime;
    if (!validateField(deliveryTimeInput, "Vui lòng chọn thời gian nhận bánh.")) {
      isValid = false;
    } else {
      const deliveryTime = new Date(deliveryTimeInput.value);
      const diffHours = (deliveryTime - new Date()) / (1000 * 60 * 60);
      const hour = deliveryTime.getHours();

      if (diffHours < 2) {
        showError(deliveryTimeInput, "Thời gian nhận bánh phải sau ít nhất 2 tiếng.");
        isValid = false;
      } else if (hour < 8 || hour >= 20) {
        showError(deliveryTimeInput, "Chỉ nhận đơn từ 8:00 sáng đến 20:00 tối.");
        isValid = false;
      }
    }

    // Kiểm tra địa chỉ nếu giao hàng
    const deliveryMethod = document.querySelector('input[name="delivery"]:checked').value;
    if (deliveryMethod === 'delivery') {
      if (!validateField(this.ward, "Vui lòng chọn quận/huyện.")) isValid = false;
      if (!validateField(this.address, "Vui lòng nhập địa chỉ cụ thể.")) isValid = false;
    }

    if (!isValid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // --- Nếu hợp lệ, tiến hành đặt hàng ---
    placeOrderBtn.disabled = true;
    placeOrderBtn.innerHTML = '<span class="loading-spinner"></span> Đang xử lý...';

    // (Đây là nơi bạn sẽ gọi API 'orders.php' để lưu đơn hàng)
    // ...

    // Giả lập thành công
    setTimeout(() => {
      alert("Đặt hàng thành công! (Đây là thông báo giả lập)");

      // Xóa giỏ hàng (Tạm thời là localStorage)
      // Bạn cần gọi API để xóa giỏ hàng trong CSDL tại đây
      // clearCartOnDatabase(globalCurrentUser.id);

      localStorage.removeItem("cart"); // Vẫn xóa local để dự phòng

      window.location.href = "../home/home.html"; // Chuyển về trang chủ

    }, 2000);
  });

  // Hàm tiện ích kiểm tra lỗi
  function validateField(input, message, regex = null) {
    const value = input.value.trim();
    if (!value) {
      showError(input, message);
      return false;
    }
    if (regex && !regex.test(value)) {
      showError(input, message);
      return false;
    }
    return true;
  }

  function showError(input, message) {
    const formGroup = input.closest('.form-group');
    const errorEl = formGroup.querySelector('.error-msg');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
    input.classList.add('error');
  }
}

// --- HÀM TIỆN ÍCH ---

function formatCurrency(amount) {
  if (isNaN(amount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0
  }).format(amount);
}