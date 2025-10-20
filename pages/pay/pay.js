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

    const name = (this.fullname && this.fullname.value.trim()) || "Khách hàng";
    const phone = this.phone ? this.phone.value.replace(/\s+/g, '') : "";
    const deliveryTimeInput = this.deliveryTime ? this.deliveryTime.value : "";

    // Số điện thoại phải đủ 10 số
    if (!/^\d{10}$/.test(phone)) {
      alert("⚠️ Vui lòng nhập số điện thoại hợp lệ (10 chữ số).");
      this.phone.focus();
      return;
    }

    // Phải chọn thời gian nhận bánh
    if (!deliveryTimeInput) {
      alert("⚠️ Vui lòng chọn thời gian nhận bánh.");
      this.deliveryTime.focus();
      return;
    }

    // Chuyển datetime-local sang Date local
    const [datePart, timePart] = deliveryTimeInput.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    const deliveryTime = new Date(year, month - 1, day, hour, minute);

    const now = new Date();
    const diffHours = (deliveryTime - now) / (1000 * 60 * 60);

    if (diffHours < 2) {
      alert("⚠️ Thời gian nhận bánh phải sau thời điểm đặt ít nhất 2 tiếng.");
      this.deliveryTime.focus();
      return;
    }

    const deliveryHour = deliveryTime.getHours();
    if (deliveryHour < 8 || deliveryHour >= 20) {
      alert("⚠️ Thời gian nhận bánh phải trong khoảng từ 8:00 đến 20:00.");
      this.deliveryTime.focus();
      return;
    }

    // OK → thông báo thành công
    alert(`🎉 Cảm ơn ${name}!\nĐơn hàng của bạn đã được ghi nhận.\nTổng: ${toVND(grand)} VND`);
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

  // Ẩn/hiện phần nhập địa chỉ
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
