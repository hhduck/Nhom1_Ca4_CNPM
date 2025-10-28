// ==========================
// pay.js - xử lý tính toán & giao hàng
// ==========================
document.addEventListener('DOMContentLoaded', function () {
  const toVND = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const rows = Array.from(document.querySelectorAll("#orderTable tbody tr"));
  const subtotalEl = document.getElementById("subtotal");
  const vatEl = document.getElementById("vat");
  const shippingEl = document.getElementById("shipping");
  const grandEl = document.getElementById("grandtotal");
  const checkoutForm = document.getElementById("checkoutForm");

  // ==========================
  // 1️⃣ TÍNH TOÁN ĐƠN HÀNG
  // ==========================
  let subtotal = 0;
  rows.forEach(r => {
    const price = Number(r.getAttribute("data-price") || 0);
    const qty = Number((r.querySelector(".td-qty") || { textContent: "1" }).textContent.trim()) || 1;
    subtotal += price * qty;
    const priceCell = r.querySelector(".td-price");
    if (priceCell) priceCell.textContent = toVND(price * qty);
  });

  const shipping = 0;
  const vat = Math.round(subtotal * 0.08);
  const grand = subtotal + shipping + vat;

  subtotalEl.textContent = toVND(subtotal);
  vatEl.textContent = toVND(vat);
  shippingEl.textContent = shipping === 0 ? "Miễn phí" : toVND(shipping);
  grandEl.textContent = toVND(grand);

  // ==========================
  // 2️⃣ VALIDATION FORM
  // ==========================
  checkoutForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Ẩn lỗi cũ
    document.querySelectorAll(".error-msg").forEach(el => el.style.display = "none");
    document.querySelectorAll("input").forEach(el => el.classList.remove("error"));

    let isValid = true;

    const name = (this.fullname && this.fullname.value.trim()) || "";
    const phone = this.phone ? this.phone.value.replace(/\s+/g, '') : "";
    const deliveryTimeInput = this.deliveryTime ? this.deliveryTime.value : "";

    // Kiểm tra họ tên
    if (name === "") {
      const err = document.getElementById("nameError");
      err.textContent = "⚠️ Vui lòng nhập họ và tên.";
      err.style.display = "block";
      this.fullname.classList.add("error");
      isValid = false;
    }

    // Kiểm tra số điện thoại
    if (!/^\d{10}$/.test(phone)) {
      const err = document.getElementById("phoneError");
      err.textContent = "⚠️ Số điện thoại phải có đúng 10 chữ số.";
      err.style.display = "block";
      this.phone.classList.add("error");
      isValid = false;
    }

    // Kiểm tra email
    const email = this.email ? this.email.value.trim() : "";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      const err = document.getElementById("emailError");
      err.textContent = "⚠️ Vui lòng nhập địa chỉ email hợp lệ.";
      err.style.display = "block";
      this.email.classList.add("error");
      isValid = false;
    }

    // Kiểm tra thời gian nhận bánh
    if (!deliveryTimeInput) {
      const err = document.getElementById("timeError");
      err.textContent = "⚠️ Vui lòng chọn thời gian nhận bánh.";
      err.style.display = "block";
      this.deliveryTime.classList.add("error");
      isValid = false;
    } else {
      const [datePart, timePart] = deliveryTimeInput.split("T");
      const [year, month, day] = datePart.split("-").map(Number);
      const [hour, minute] = timePart.split(":").map(Number);
      const deliveryTime = new Date(year, month - 1, day, hour, minute);
      const now = new Date();
      const diffHours = (deliveryTime - now) / (1000 * 60 * 60);

      if (diffHours < 2) {
        const err = document.getElementById("timeError");
        err.textContent = "⚠️ Thời gian nhận bánh phải sau thời điểm đặt ít nhất 2 tiếng.";
        err.style.display = "block";
        this.deliveryTime.classList.add("error");
        isValid = false;
      } else if (hour < 8 || hour >= 20) {
        const err = document.getElementById("timeError");
        err.textContent = "⚠️ Thời gian nhận bánh phải trong khoảng từ 8:00 đến 20:00.";
        err.style.display = "block";
        this.deliveryTime.classList.add("error");
        isValid = false;
      }
    }

    // Nếu có lỗi thì ngừng lại
    if (!isValid) return;

    // Thành công
    const nameDisplay = name || "Khách hàng";
    alert(`🎉 Cảm ơn ${nameDisplay}!\nĐơn hàng của bạn đã được ghi nhận.\nTổng: ${toVND(grand)} VND`);
  });


  // ==========================
  // 3️⃣ CHỌN TỈNH / PHƯỜNG
  // ==========================
  const locationData = {
    hcm: ["Sài Gòn", "Tân Định", "Bến Thành", "Cầu Ông Lãnh", "Bàn Cờ", "Xuân Hòa", "Nhiêu Lộc", "Xóm Chiếu", "Khánh Hội", "Vĩnh Hội"],
    ld: ["Vĩnh Hảo", "Liên Hương", "Tuy Phong", "Phan Rí Cửa", "Bắc Bình", "Hồng Thái", "Hải Ninh", "Phan Sơn", "Sông Lũy", "Lương Sơn"],
    kh: ["Phan Rang", "Bảo An", "Đô Vinh", "Ninh Chử", "Đông Hải", "Phước Dinh", "Mỹ Sơn", "Vĩnh Hảo", "Ninh Sơn", "Thuận Nam"]
  };

  const citySelect = document.getElementById('city');
  const wardSelect = document.getElementById('ward');
  const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
  const deliveryInfo = document.querySelector('.delivery-info');

  // Ẩn phần địa chỉ mặc định
  deliveryInfo.style.display = "none";

  // Lắng nghe khi người dùng chọn phương thức nhận hàng
  deliveryOptions.forEach(option => {
    option.addEventListener('change', function () {
      deliveryInfo.style.display = this.value === 'delivery' ? 'block' : 'none';
    });
  });

  // Cập nhật phường / xã khi chọn tỉnh
  citySelect.addEventListener('change', function () {
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
