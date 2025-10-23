// ========== KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP ==========
document.addEventListener("DOMContentLoaded", () => {
  const navAuth = document.querySelector(".nav-auth");
  const loggedIn = localStorage.getItem("loggedIn");

  // Hiển thị icon người dùng nếu đã đăng nhập
  if (loggedIn === "true") {
    navAuth.innerHTML = `
      <a href="../profile/profile.html" class="nav-user">
        <i class="fa-solid fa-user"></i>
      </a>
    `;
  }

  // ========== LẤY ID SẢN PHẨM TỪ URL ==========
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get("id"));

  // ========== TÌM SẢN PHẨM TƯƠNG ỨNG ==========
  const product = products.find(p => p.id === productId);

  if (product) {
    // Cập nhật nội dung sản phẩm
    document.getElementById("product-img").src = product.image;
    document.getElementById("product-name").textContent = product.name;
    document.getElementById("product-price").textContent = product.price;
    document.getElementById("product-short1").innerHTML = product.shortIntro;
    document.getElementById("product-short2").textContent = product.shortParagraph;
    document.getElementById("desc1").innerHTML = product.description;
    document.getElementById("structure").innerHTML = product.structure;
document.getElementById("usage").innerHTML = product.usage;
document.getElementById("bonus").innerHTML = product.bonus;
  } else {
    // Nếu id sai hoặc không có sản phẩm
    const main = document.querySelector(".product-page");
    main.innerHTML = "<p>Không tìm thấy sản phẩm.</p>";
  }

  updateCartCount();
});

// ========== HÀM CẬP NHẬT SỐ LƯỢNG GIỎ HÀNG ==========
function updateCartCount() {
  const cartCount = document.querySelector(".cart-count");
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cartCount) cartCount.textContent = cart.length;
}
// ========== HÀM THÊM VÀO GIỎ HÀNG ==========
function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find(item => item.id === product.id);

  if (!existing) {
    cart.push(product);
  } else {
    existing.quantity += product.quantity;
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// ========== NÚT TĂNG / GIẢM SỐ LƯỢNG ==========
const decreaseBtn = document.getElementById("decrease");
const increaseBtn = document.getElementById("increase");
const quantityInput = document.getElementById("quantity");

if (decreaseBtn && increaseBtn && quantityInput) {
  decreaseBtn.addEventListener("click", () => {
    let val = parseInt(quantityInput.value);
    if (val > 1) quantityInput.value = val - 1;
  });

  increaseBtn.addEventListener("click", () => {
    let val = parseInt(quantityInput.value);
    quantityInput.value = val + 1;
  });
}

// ========== NÚT "THÊM VÀO GIỎ HÀNG" ==========
const addCartBtn = document.querySelector(".add-cart");
if (addCartBtn) {
  addCartBtn.addEventListener("click", () => {
    const loggedIn = localStorage.getItem("loggedIn");
    if (loggedIn !== "true") {
      window.location.href = "../login/login.html";
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get("id"));
    const product = products.find(p => p.id === productId);

    const quantity = parseInt(quantityInput.value);
    addToCart({ ...product, quantity });
  });
}

// ========== NÚT "MUA NGAY" ==========
const buyNowBtn = document.querySelector(".buy-now");
if (buyNowBtn) {
  buyNowBtn.addEventListener("click", () => {
    const loggedIn = localStorage.getItem("loggedIn");

    if (loggedIn !== "true") {
      window.location.href = "../login/login.html";
    } else {
      window.location.href = "../checkout/checkout.html";
    }
  });
}
