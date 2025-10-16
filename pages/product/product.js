const decrease = document.getElementById("decrease");
const increase = document.getElementById("increase");
const quantityInput = document.getElementById("quantity");

decrease.addEventListener("click", () => {
  let value = parseInt(quantityInput.value);
  if (value > 1) quantityInput.value = value - 1;
});

increase.addEventListener("click", () => {
  let value = parseInt(quantityInput.value);
  quantityInput.value = value + 1;
});

document.querySelector(".add-cart").addEventListener("click", () => {
  alert("Đã thêm sản phẩm vào giỏ hàng!");
});

document.querySelector(".buy-now").addEventListener("click", () => {
  alert("Chuyển đến trang thanh toán...");
});
