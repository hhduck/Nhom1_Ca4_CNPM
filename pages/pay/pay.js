// ======================================================
// pay.js - PHIÊN BẢN HOÀN CHỈNH (CHO LUỒNG NGROK THẬT)
// ======================================================

let globalCartItems = [];
let globalPromotions = [];
let globalCurrentUser = null;

// Dữ liệu địa chỉ TP.HCM theo yêu cầu
const locationData = {
  "TP. Thủ Đức": ["An Khánh", "An Lợi Đông", "An Phú", "Bình Chiểu", "Bình Thọ", "Bình Trưng Đông", "Bình Trưng Tây", "Cát Lái", "Hiệp Bình Chánh", "Hiệp Bình Phước", "Hiệp Phú", "Linh Chiểu", "Linh Đông", "Linh Tây", "Linh Trung", "Linh Xuân", "Long Bình", "Long Phước", "Long Thạnh Mỹ", "Long Trường", "Phú Hữu", "Phước Bình", "Phước Long A", "Phước Long B", "Tam Bình", "Tam Phú", "Tăng Nhơn Phú A", "Tăng Nhơn Phú B", "Thạnh Mỹ Lợi", "Thảo Điền", "Thủ Thiêm", "Trường Thạnh", "Trường Thọ"],
  "Quận 1": ["Bến Nghé", "Bến Thành", "Cầu Kho", "Cầu Ông Lãnh", "Cô Giang", "Đa Kao", "Nguyễn Cư Trinh", "Nguyễn Thái Bình", "Phạm Ngũ Lão", "Tân Định"],
  "Quận 3": ["Phường 01", "Phường 02", "Phường 03", "Phường 04", "Phường 05", "Võ Thị Sáu", "Phường 09", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14"],
  "Quận 4": ["Phường 01", "Phường 02", "Phường 03", "Phường 04", "Phường 05", "Phường 06", "Phường 08", "Phường 09", "Phường 10", "Phường 13", "Phường 14", "Phường 15", "Phường 16", "Phường 18"],
  "Quận 5": ["Phường 01", "Phường 02", "Phường 03", "Phường 04", "Phường 05", "Phường 06", "Phường 07", "Phường 08", "Phường 09", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"],
  "Quận 6": ["Phường 01", "Phường 02", "Phường 03", "Phường 04", "Phường 05", "Phường 06", "Phường 07", "Phường 08", "Phường 09", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14"],
  "Quận 7": ["Bình Thuận", "Phú Mỹ", "Phú Thuận", "Tân Hưng", "Tân Kiểng", "Tân Phong", "Tân Phú", "Tân Quy", "Tân Thuận Đông", "Tân Thuận Tây"],
  "Quận 8": ["Phường 01", "Phường 02", "Phường 03", "Phường 04", "Phường 05", "Phường 06", "Phường 07", "Phường 08", "Phường 09", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16"],
  "Quận 10": ["Phường 01", "Phường 02", "Phường 03", "Phường 04", "Phường 05", "Phường 06", "Phường 07", "Phường 08", "Phường 09", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"],
  "Quận 11": ["Phường 01", "Phường 02", "Phường 03", "Phường 04", "Phường 05", "Phường 06", "Phường 07", "Phường 08", "Phường 09", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16"],
  "Quận 12": ["An Phú Đông", "Đông Hưng Thuận", "Hiệp Thành", "Tân Chánh Hiệp", "Tân Hưng Thuận", "Tân Thới Hiệp", "Tân Thới Nhất", "Thạnh Lộc", "Thạnh Xuân", "Thới An", "Trung Mỹ Tây"],
  "Quận Bình Thạnh": ["Phường 01", "Phường 02", "Phường 03", "Phường 05", "Phường 06", "Phường 07", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 17", "Phường 19", "Phường 21", "Phường 22", "Phường 24", "Phường 25", "Phường 26", "Phường 27", "Phường 28"],
  "Quận Phú Nhuận": ["Phường 01", "Phường 02", "Phường 03", "Phường 04", "Phường 05", "Phường 07", "Phường 08", "Phường 09", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 15", "Phường 17"],
  "Quận Tân Bình": ["Phường 01", "Phường 02", "Phường 03", "Phường 04", "Phường 05", "Phường 06", "Phường 07", "Phường 08", "Phường 09", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"],
  "Quận Tân Phú": ["Hiệp Tân", "Hòa Thạnh", "Phú Thạnh", "Phú Thọ Hòa", "Phú Trung", "Sơn Kỳ", "Tân Quý", "Tân Sơn Nhì", "Tân Thành", "Tân Thới Hòa", "Tây Thạnh"],
  "Quận Bình Tân": ["An Lạc", "An Lạc A", "Bình Hưng Hòa", "Bình Hưng Hòa A", "Bình Hưng Hòa B", "Bình Trị Đông", "Bình Trị Đông A", "Bình Trị Đông B", "Tân Tạo", "Tân Tạo A"],
  "Huyện Bình Chánh": ["An Phú Tây", "Bình Chánh", "Bình Hưng", "Bình Lợi", "Đa Phước", "Hưng Long", "Lê Minh Xuân", "Phạm Văn Hai", "Phong Phú", "Quy Đức", "Tân Kiên", "Tân Nhựt", "Tân Quý Tây", "Tân Túc", "Vĩnh Lộc A", "Vĩnh Lộc B"],
  "Huyện Cần Giờ": ["An Thới Đông", "Bình Khánh", "Cần Thạnh", "Long Hòa", "Lý Nhơn", "Tam Thôn Hiệp", "Thạnh An"],
  "Huyện Củ Chi": ["An Nhơn Tây", "An Phú", "Bình Mỹ", "Hòa Phú", "Nhuận Đức", "Phạm Văn Cội", "Phú Hòa Đông", "Phú Mỹ Hưng", "Phước Hiệp", "Phước Thạnh", "Phước Vĩnh An", "Tân An Hội", "Tân Phú Trung", "Tân Thạnh Đông", "Tân Thạnh Tây", "Tân Thông Hội", "Thái Mỹ", "Trung An", "Trung Lập Hạ", "Trung Lập Thượng"],
  "Huyện Hóc Môn": ["Bà Điểm", "Đông Thạnh", "Nhị Bình", "Tân Hiệp", "Tân Thới Nhì", "Tân Xuân", "Thới Tam Thôn", "Trung Chánh", "Xuân Thới Đông", "Xuân Thới Sơn", "Xuân Thới Thượng"],
  "Huyện Nhà Bè": ["Hiệp Phước", "Long Thới", "Nhơn Đức", "Phú Xuân", "Phước Kiển", "Phước Lộc"]
};

// --- HÀM NAVBAR ---
function performLogout(redirectUrl = "../login/login.html") {
  localStorage.removeItem("currentStaff");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("rememberMe");
  window.location.href = redirectUrl;
}

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

  globalCurrentUser = currentUser;

  if (currentUser && currentUser.id) {
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
        e.preventDefault();
        e.stopPropagation();
        const accountUrl = (userType === 'staff') ? "../staff/staffProfile/staff_profile.html" : "../account/account.html";
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

// --- HÀM CHÍNH ---
document.addEventListener('DOMContentLoaded', () => {
  handleUserDisplay();

  // Kiểm tra đăng nhập
  if (!globalCurrentUser || !globalCurrentUser.id) {
    alert("Vui lòng đăng nhập để tiến hành thanh toán.");
    window.location.href = "../login/login.html?redirect=pay";
    return;
  }

  // Tải các dữ liệu cần thiết
  loadUserData(globalCurrentUser);
  loadCartFromAPI(globalCurrentUser.id);
  setupDeliveryOptions();
  setupValidation(); // Hàm này chạy luồng ngrok
  loadPromotions();
});

function loadUserData(user) {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  form.fullname.value = user.full_name || '';
  form.phone.value = user.phone || '';
  form.email.value = user.email || '';
}

async function loadCartFromAPI(userId) {
  const cartTableBody = document.getElementById("cartTableBody");
  try {
    const response = await fetch(`../../api/cart.php?user_id=${userId}`);
    const data = await response.json();

    if (data.success && data.data.items.length > 0) {
      globalCartItems = data.data.items;
      renderCartTable(globalCartItems);
      calculateTotals();
    } else {
      globalCartItems = [];
      cartTableBody.innerHTML = `<tr><td colspan="2" style="text-align: center; padding: 20px;">Giỏ hàng của bạn đang trống.</td></tr>`;
      calculateTotals();
    }
  } catch (err) {
    console.error("Lỗi tải giỏ hàng CSDL:", err);
    cartTableBody.innerHTML = `<tr><td colspan="2" style="text-align: center; color: red; padding: 20px;">Lỗi tải giỏ hàng.</td></tr>`;
  }
}

function renderCartTable(items) {
  const cartTableBody = document.getElementById("cartTableBody");
  cartTableBody.innerHTML = '';
  items.forEach(item => {
    const subtotal = (item.price || 0) * (item.quantity || 1);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        ${item.product_name} <strong>&times; ${item.quantity}</strong>
        ${item.note ? `<div style="font-size: 0.9em; color: #777;">Ghi chú: ${item.note}</div>` : ''}
      </td>
      <td style="text-align: right; font-weight: 500;">${formatCurrency(subtotal)}</td>
    `;
    cartTableBody.appendChild(row);
  });
}

// HÀM SỬA ĐỔI: (Từ Bước 7)
function calculateTotals(returnOnly = false) {
  const subtotal = globalCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryMethodEl = document.querySelector('input[name="delivery"]:checked');
  const deliveryMethod = deliveryMethodEl ? deliveryMethodEl.value : 'store'; // Mặc định là 'store'
  const shipping = (deliveryMethod === 'delivery' && subtotal > 0) ? 30000 : 0;
  const vat = Math.round(subtotal * 0.08);
  const discountInfo = applyPromotion();
  const discount = discountInfo.discount;
  const grand = subtotal + shipping + vat - discount;

  // Nếu chỉ gọi để lấy giá trị (khi submit)
  if (returnOnly) {
    return { subtotal, shipping, vat, discount, grand };
  }

  // Nếu gọi để cập nhật UI
  document.getElementById("subtotal").textContent = formatCurrency(subtotal);
  document.getElementById("vat").textContent = formatCurrency(vat);
  document.getElementById("shipping").textContent = (shipping === 0) ? 'Miễn phí' : formatCurrency(shipping);
  document.getElementById("grandtotal").textContent = formatCurrency(grand);

  const discountRow = document.getElementById("discountRow");
  if (discount > 0) {
    document.getElementById("discount").textContent = `- ${formatCurrency(discount)}`;
    discountRow.style.display = 'flex';
  } else {
    discountRow.style.display = 'none';
  }
}

async function loadPromotions() {
  const promoSelect = document.getElementById("promotionSelect");
  const promoMessage = document.getElementById("promoMessage");
  try {
    const response = await fetch("../../api/promotions.php?public=1");
    const data = await response.json();

    if (data.success && data.data?.promotions?.length) {
      globalPromotions = data.data.promotions;
      promoSelect.innerHTML = '<option value="">-- Chọn mã khuyến mãi --</option>';

      globalPromotions.forEach(promo => {
        const now = new Date();
        const start = new Date(promo.start_date);
        const end = new Date(promo.end_date);

        if (now >= start && now <= end) {
          const opt = document.createElement("option");
          opt.value = promo.promotion_code;
          opt.dataset.promo = JSON.stringify(promo);
          opt.textContent = `${promo.promotion_name} (${promo.promotion_code})`;
          promoSelect.appendChild(opt);
        }
      });

      promoSelect.addEventListener("change", calculateTotals);
    } else {
      promoMessage.textContent = "Hiện chưa có khuyến mãi khả dụng.";
    }
  } catch (err) {
    console.error("Lỗi tải khuyến mãi:", err);
    promoMessage.textContent = "Không tải được danh sách khuyến mãi.";
  }
}

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

function setupDeliveryOptions() {
  const districtSelect = document.getElementById('district');
  const wardSelect = document.getElementById('ward');
  const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
  const deliveryAddressBlock = document.getElementById('deliveryAddressBlock');

  // Tự động điền Quận/Huyện từ locationData
  districtSelect.innerHTML = '<option value="">-- Chọn quận / huyện --</option>';
  for (const districtName in locationData) {
    const opt = document.createElement('option');
    opt.value = districtName;
    opt.textContent = districtName;
    districtSelect.appendChild(opt);
  }

  // Gắn sự kiện: Khi chọn Quận/Huyện thì load Phường/Xã
  districtSelect.addEventListener('change', function () {
    const selectedDistrict = this.value;
    const wards = locationData[selectedDistrict] || [];

    wardSelect.innerHTML = '<option value="">-- Chọn phường / xã --</option>';

    if (wards.length > 0) {
      wardSelect.disabled = false;
      wards.forEach(wardName => {
        const opt = document.createElement('option');
        opt.value = wardName;
        opt.textContent = wardName;
        wardSelect.appendChild(opt);
      });
    } else {
      wardSelect.disabled = true;
    }
  });

  // Ẩn/hiện khối địa chỉ giao hàng và TÍNH LẠI TỔNG TIỀN
  deliveryOptions.forEach(option => {
    option.addEventListener("change", function () {
      if (this.value === 'delivery') {
        deliveryAddressBlock.style.display = 'block';
      } else {
        deliveryAddressBlock.style.display = 'none';
        // Reset các trường địa chỉ khi chọn nhận tại cửa hàng
        districtSelect.value = '';
        wardSelect.value = '';
        wardSelect.disabled = true;
        document.getElementById('address').value = '';
      }
      calculateTotals(); // Tính lại vì phí ship thay đổi
    });
  });
}

// HÀM QUAN TRỌNG: (Từ Bước 6)
function setupValidation() {
  const checkoutForm = document.getElementById("checkoutForm");
  const placeOrderBtn = document.getElementById("placeOrder");

  checkoutForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Ẩn tất cả thông báo lỗi cũ
    document.querySelectorAll(".error-msg").forEach(el => el.style.display = "none");
    document.querySelectorAll("input.error, select.error").forEach(el => el.classList.remove("error"));

    let isValid = true;

    // --- Kiểm tra các trường bắt buộc ---
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

    // Kiểm tra địa chỉ nếu chọn giao hàng
    const deliveryMethod = document.querySelector('input[name="delivery"]:checked').value;
    if (deliveryMethod === 'delivery') {
      if (!validateField(this.district, "Vui lòng chọn quận/huyện.")) isValid = false;
      if (!validateField(this.ward, "Vui lòng chọn phường/xã.")) isValid = false;
      if (!validateField(this.address, "Vui lòng nhập địa chỉ cụ thể.")) isValid = false;
    }

    if (!isValid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // --- Nếu hợp lệ, tiến hành đặt hàng ---
    placeOrderBtn.disabled = true;
    placeOrderBtn.innerHTML = '<span class="loading-spinner"></span> Đang tạo đơn hàng...';

    // Lấy giá trị tổng cuối cùng
    const finalTotals = calculateTotals(true); // true = chỉ trả về giá trị

    // Chuẩn bị dữ liệu đơn hàng
    const orderData = {
      user_id: globalCurrentUser.id,
      customer_name: this.fullname.value.trim(),
      customer_phone: this.phone.value.trim(),
      customer_email: this.email.value.trim(),
      delivery_method: deliveryMethod,
      shipping_address: deliveryMethod === 'delivery'
        ? this.address.value.trim()
        : '123 An Dương Vương, phường Chợ Quán, TP.HCM', // Địa chỉ cửa hàng
      ward: deliveryMethod === 'delivery' ? this.ward.value : '',
      district: deliveryMethod === 'delivery' ? this.district.value : '',
      city: 'TP. Hồ Chí Minh',
      delivery_time: deliveryTimeInput.value,
      items: globalCartItems,
      promotion_code: document.getElementById('promotionSelect').value || null,

      // Thêm các giá trị tổng tiền
      total_amount: finalTotals.subtotal,
      shipping_fee: finalTotals.shipping,
      vat_amount: finalTotals.vat,
      discount_amount: finalTotals.discount,
      final_amount: finalTotals.grand
    };

    try {
      // BƯỚC A: TẠO ĐƠN HÀNG (POST api/orders.php)
      const responseOrder = await fetch('../../api/orders.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify(orderData)
      });

      const resultOrder = await responseOrder.json();

      if (!resultOrder.success || !resultOrder.data) {
        throw new Error(resultOrder.message || "Không thể tạo đơn hàng.");
      }

      placeOrderBtn.innerHTML = '<span class="loading-spinner"></span> Đang tạo link thanh toán...';

      // BƯỚC B: TẠO LINK VNPAY (POST api/vnpay_checkout.php)
      const checkoutData = {
        order_code: resultOrder.data.order_code,
        final_amount: finalTotals.grand
      };

      const responseCheckout = await fetch('../../api/vnpay_checkout.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify(checkoutData)
      });

      const resultCheckout = await responseCheckout.json();

      if (resultCheckout.success && resultCheckout.data.paymentURL) {
        // BƯỚC C: CHUYỂN HƯỚNG SANG CỔNG VNPAY
        // Xóa giỏ hàng TRƯỚC khi chuyển hướng
        await clearCartInDatabase(globalCurrentUser.id);
        window.location.href = resultCheckout.data.paymentURL;
      } else {
        throw new Error(resultCheckout.message || "Không thể tạo link thanh toán VNPay.");
      }

    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      alert("Có lỗi xảy ra: " + error.message);
      placeOrderBtn.disabled = false;
      placeOrderBtn.innerHTML = 'Đặt hàng';
    }
  });

  function validateField(input, message, regex = null) {
    if (!input) {
      console.error("Lỗi: Input không tồn tại");
      return false;
    }
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
    if (!formGroup) return;
    const errorEl = formGroup.querySelector('.error-msg');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
    input.classList.add('error');
  }
}

// Hàm xóa giỏ hàng trong database sau khi đặt hàng thành công
async function clearCartInDatabase(userId) {
  try {
    const response = await fetch(`../../api/cart.php?user_id=${userId}`);
    const data = await response.json();

    if (data.success && data.data.items.length > 0) {
      for (const item of data.data.items) {
        // Dùng API DELETE /api/cart.php/{cart_id}
        await fetch(`../../api/cart.php/${item.cart_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        });
      }
    }
  } catch (error) {
    console.error("Lỗi khi xóa giỏ hàng:", error);
  }
}

function formatCurrency(amount) {
  if (isNaN(amount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0
  }).format(amount);
}