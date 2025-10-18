// script.js - hiển thị tính toán tạm tính, VAT và tổng tiền
(function () {
  const toVND = n => {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const rows = Array.from(document.querySelectorAll("#orderTable tbody tr"));
  const subtotalEl = document.getElementById("subtotal");
  const vatEl = document.getElementById("vat");
  const shippingEl = document.getElementById("shipping");
  const grandEl = document.getElementById("grandtotal");
  const placeOrderBtn = document.getElementById("placeOrder");

  // Tính tạm tính dựa trên data-price và số lượng (hiện cố định là 1)
  let subtotal = 0;
  rows.forEach(r => {
    const price = Number(r.getAttribute("data-price") || 0);
    const qty = Number((r.querySelector(".td-qty") || {textContent:"1"}).textContent.trim()) || 1;
    subtotal += price * qty;

    // cập nhật hiển thị tiền trong bảng (đảm bảo format)
    const priceCell = r.querySelector(".td-price");
    if (priceCell) priceCell.textContent = toVND(price * qty);
  });

  // shipping: miễn phí (có thể thay đổi)
  const shipping = 0;

  // VAT 8%
  const vat = Math.round(subtotal * 0.08);

  const grand = subtotal + shipping + vat;

  subtotalEl.textContent = toVND(subtotal);
  vatEl.textContent = toVND(vat);
  shippingEl.textContent = shipping === 0 ? "Miễn phí" : toVND(shipping);
  grandEl.textContent = toVND(grand);

  // Xử lý submit (form tĩnh - không gửi lên server)
  document.getElementById("checkoutForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const name = (this.fullname && this.fullname.value) || "Khách hàng";
    alert(`Cảm ơn ${name}!\nĐơn hàng của bạn đã được ghi nhận (demo).\nTổng: ${toVND(grand)} VND`);
    // TODO: nếu muốn gửi lên server, thay phần này bằng fetch(...) đến API của bạn
  });

})();
