document.addEventListener("DOMContentLoaded", async () => {
  await loadPromotions();
  calculateTotals();
});

async function loadPromotions() {
  try {
    const response = await fetch("../../api/promotions.php", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("⚠️ API trả về không phải JSON:", text);
      document.getElementById("promoMessage").textContent = "Không tải được danh sách khuyến mãi.";
      return;
    }

    if (!data.success || !data.data?.promotions?.length) {
      console.warn("Không có khuyến mãi:", data);
      document.getElementById("promoMessage").textContent = "Hiện chưa có khuyến mãi khả dụng.";
      return;
    }

    const promotions = data.data.promotions;
    console.log("✅ Danh sách khuyến mãi:", promotions);
    populatePromotionSelect(promotions);
  } catch (error) {
    console.error("🚨 Không thể tải khuyến mãi:", error);
    document.getElementById("promoMessage").textContent = "Lỗi kết nối API.";
  }
}

function populatePromotionSelect(promotions) {
  const select = document.getElementById("promotionSelect");
  if (!select) {
    console.error("Không tìm thấy #promotionSelect trong HTML!");
    return;
  }

  select.innerHTML = '<option value="">-- Chọn mã khuyến mãi --</option>';

  promotions.forEach(promo => {
    const opt = document.createElement("option");
    opt.value = promo.promotion_code;
    opt.textContent = `${promo.promotion_name} (${promo.promotion_code})`;
    select.appendChild(opt);
  });

  select.addEventListener("change", () => {
    const code = select.value;
    const promo = promotions.find(p => p.promotion_code === code);
    if (promo) applyPromotion(promo);
  });
}

function applyPromotion(promo) {
  const msg = document.getElementById("promoMessage");
  const subtotal = parseInt(document.getElementById("subtotal").textContent.replace(/\D/g, "")) || 0;

  const now = new Date();
  const start = new Date(promo.start_date);
  const end = new Date(promo.end_date);

  if (now < start || now > end || promo.status !== "active") {
    msg.textContent = "⚠️ Mã này chưa hoặc đã hết hạn!";
    msg.style.color = "orange";
    return;
  }

  if (subtotal < promo.min_order_value) {
    msg.textContent = `Đơn hàng tối thiểu ${Number(promo.min_order_value).toLocaleString()}đ mới áp dụng được.`;
    msg.style.color = "orange";
    return;
  }

  let discount = 0;
  if (promo.promotion_type === "percent") {
    discount = (promo.discount_value / 100) * subtotal;
    if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
  } else if (promo.promotion_type === "fixed_amount") {
    discount = promo.discount_value;
  } else if (promo.promotion_type === "free_shipping") {
    document.getElementById("shipping").textContent = "Miễn phí";
  }

  const grandtotalEl = document.getElementById("grandtotal");
  const newTotal = subtotal - discount;
  grandtotalEl.textContent = newTotal.toLocaleString("vi-VN");

  msg.textContent = `✅ Áp dụng mã ${promo.promotion_code}, giảm ${Number(discount).toLocaleString()}đ`;
  msg.style.color = "green";
}

function calculateTotals() {
  const rows = document.querySelectorAll("#orderTable tbody tr");
  let subtotal = 0;
  rows.forEach(row => {
    subtotal += parseInt(row.dataset.price) || 0;
  });

  const vat = Math.round(subtotal * 0.08);
  const grandTotal = subtotal + vat;

  document.getElementById("subtotal").textContent = subtotal.toLocaleString("vi-VN");
  document.getElementById("vat").textContent = vat.toLocaleString("vi-VN");
  document.getElementById("grandtotal").textContent = grandTotal.toLocaleString("vi-VN");
}
