// ==========================
// pay.js - xử lý tính toán & giao hàng
// ==========================
document.addEventListener('DOMContentLoaded', () => {

  const toVND = n => n.toLocaleString('vi-VN');

  const subtotalEl = document.getElementById("subtotal");
  const vatEl = document.getElementById("vat");
  const shippingEl = document.getElementById("shipping");
  const grandEl = document.getElementById("grandtotal");
  const checkoutForm = document.getElementById("checkoutForm");
  const promoSelect = document.getElementById("promotionSelect");
  const promoMessage = document.getElementById("promoMessage");

  const locationData = {
    hcm: ["Sài Gòn", "Tân Định", "Bến Thành", "Cầu Ông Lãnh", "Bàn Cờ", "Xuân Hòa", "Nhiêu Lộc", "Xóm Chiếu", "Khánh Hội", "Vĩnh Hội"],
    ld: ["Vĩnh Hảo", "Liên Hương", "Tuy Phong", "Phan Rí Cửa", "Bắc Bình", "Hồng Thái", "Hải Ninh", "Phan Sơn", "Sông Lũy", "Lương Sơn"],
    kh: ["Phan Rang", "Bảo An", "Đô Vinh", "Ninh Chử", "Đông Hải", "Phước Dinh", "Mỹ Sơn", "Vĩnh Hảo", "Ninh Sơn", "Thuận Nam"]
  };

  const citySelect = document.getElementById('city');
  const wardSelect = document.getElementById('ward');
  const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
  const deliveryInfo = document.querySelector('.delivery-info');

  // ==========================
  // 1️⃣ Tính toán đơn hàng
  // ==========================
  function calculateTotals() {
    const rows = document.querySelectorAll("#orderTable tbody tr");
    let subtotal = 0;
    rows.forEach(row => {
      const price = Number(row.dataset.price) || 0;
      const qty = Number(row.querySelector(".td-qty")?.textContent.trim()) || 1;
      subtotal += price * qty;
      const priceCell = row.querySelector(".td-price");
      if (priceCell) priceCell.textContent = toVND(price * qty);
    });

    const shipping = 0;
    const vat = Math.round(subtotal * 0.08);
    const grand = subtotal + shipping + vat;

    subtotalEl.textContent = toVND(subtotal);
    vatEl.textContent = toVND(vat);
    shippingEl.textContent = shipping === 0 ? "Miễn phí" : toVND(shipping);
    grandEl.textContent = toVND(grand);
  }

  calculateTotals();

  // ==========================
  // 2️⃣ Load & áp dụng khuyến mãi
  // ==========================
  async function loadPromotions() {
    try {
      const response = await fetch("../../api/promotions.php");
      const data = await response.json();

      if (!data.success || !data.data?.promotions?.length) {
        promoMessage.textContent = "Hiện chưa có khuyến mãi khả dụng.";
        return;
      }

      promoSelect.innerHTML = '<option value="">-- Chọn mã khuyến mãi --</option>';
      data.data.promotions.forEach(promo => {
        const opt = document.createElement("option");
        opt.value = promo.promotion_code;
        opt.textContent = `${promo.promotion_name} (${promo.promotion_code})`;
        promoSelect.appendChild(opt);
      });

      promoSelect.addEventListener("change", () => {
        const code = promoSelect.value;
        const promo = data.data.promotions.find(p => p.promotion_code === code);
        if (promo) applyPromotion(promo);
      });

    } catch (err) {
      console.error("Lỗi tải khuyến mãi:", err);
      promoMessage.textContent = "Không tải được danh sách khuyến mãi.";
    }
  }

  function applyPromotion(promo) {
    const subtotal = parseInt(subtotalEl.textContent.replace(/\D/g, "")) || 0;
    const now = new Date();
    const start = new Date(promo.start_date);
    const end = new Date(promo.end_date);

    if (now < start || now > end || promo.status !== "active") {
      promoMessage.textContent = "⚠️ Mã này chưa hoặc đã hết hạn!";
      promoMessage.style.color = "orange";
      return;
    }

    if (subtotal < promo.min_order_value) {
      promoMessage.textContent = `Đơn hàng tối thiểu ${Number(promo.min_order_value).toLocaleString()}đ mới áp dụng được.`;
      promoMessage.style.color = "orange";
      return;
    }

    let discount = 0;
    if (promo.promotion_type === "percent") {
      discount = (promo.discount_value / 100) * subtotal;
      if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
    } else if (promo.promotion_type === "fixed_amount") {
      discount = promo.discount_value;
    } else if (promo.promotion_type === "free_shipping") {
      shippingEl.textContent = "Miễn phí";
    }

    grandEl.textContent = toVND(subtotal - discount);
    promoMessage.textContent = `✅ Áp dụng mã ${promo.promotion_code}, giảm ${Number(discount).toLocaleString()}đ`;
    promoMessage.style.color = "green";
  }

  loadPromotions();

  // ==========================
  // 3️⃣ Validation form
  // ==========================
  checkoutForm.addEventListener("submit", function (e) {
    e.preventDefault();
    document.querySelectorAll(".error-msg").forEach(el => el.style.display = "none");
    document.querySelectorAll("input").forEach(el => el.classList.remove("error"));

    let isValid = true;
    const name = this.fullname?.value.trim() || "";
    const phone = this.phone?.value.replace(/\s+/g, "") || "";
    const email = this.email?.value.trim() || "";
    const deliveryTimeInput = this.deliveryTime?.value || "";

    if (!name) {
      document.getElementById("nameError").textContent = "⚠️ Vui lòng nhập họ và tên.";
      document.getElementById("nameError").style.display = "block";
      this.fullname?.classList.add("error");
      isValid = false;
    }

    if (!/^\d{10}$/.test(phone)) {
      document.getElementById("phoneError").textContent = "⚠️ Số điện thoại phải có đúng 10 chữ số.";
      document.getElementById("phoneError").style.display = "block";
      this.phone?.classList.add("error");
      isValid = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById("emailError").textContent = "⚠️ Vui lòng nhập địa chỉ email hợp lệ.";
      document.getElementById("emailError").style.display = "block";
      this.email?.classList.add("error");
      isValid = false;
    }

    if (!deliveryTimeInput) {
      document.getElementById("timeError").textContent = "⚠️ Vui lòng chọn thời gian nhận bánh.";
      document.getElementById("timeError").style.display = "block";
      this.deliveryTime?.classList.add("error");
      isValid = false;
    } else {
      const [datePart, timePart] = deliveryTimeInput.split("T");
      const [year, month, day] = datePart.split("-").map(Number);
      const [hour, minute] = timePart.split(":").map(Number);
      const deliveryTime = new Date(year, month - 1, day, hour, minute);
      const diffHours = (deliveryTime - new Date()) / (1000 * 60 * 60);

      if (diffHours < 2) {
        document.getElementById("timeError").textContent = "⚠️ Thời gian nhận bánh phải sau thời điểm đặt ít nhất 2 tiếng.";
        document.getElementById("timeError").style.display = "block";
        this.deliveryTime?.classList.add("error");
        isValid = false;
      } else if (hour < 8 || hour >= 20) {
        document.getElementById("timeError").textContent = "⚠️ Thời gian nhận bánh phải trong khoảng từ 8:00 đến 20:00.";
        document.getElementById("timeError").style.display = "block";
        this.deliveryTime?.classList.add("error");
        isValid = false;
      }
    }

    if (!isValid) return;

    alert(`🎉 Cảm ơn ${name || "Khách hàng"}!\nĐơn hàng của bạn đã được ghi nhận.\nTổng: ${grandEl.textContent} VND`);
  });

  // ==========================
  // 4️⃣ Chọn tỉnh / phường
  // ==========================
  deliveryInfo.style.display = "none";
  deliveryOptions.forEach(option => {
    option.addEventListener("change", function () {
      deliveryInfo.style.display = this.value === 'delivery' ? 'block' : 'none';
    });
  });

  citySelect.addEventListener("change", function () {
    const selectedCity = this.value;
    wardSelect.innerHTML = '<option value="">-- Chọn phường / xã --</option>';
    if (locationData[selectedCity]) {
      locationData[selectedCity].forEach(ward => {
        const opt = document.createElement('option');
        opt.value = ward.trim();
        opt.textContent = ward.trim();
        wardSelect.appendChild(opt);
      });
    }
  });

});
