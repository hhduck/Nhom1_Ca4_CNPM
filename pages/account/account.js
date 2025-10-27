// ==========================
// account.js - La Cuisine Ngọt
// ==========================

document.addEventListener("DOMContentLoaded", () => {
  const customerName = document.querySelector(".customer-name");
  const form = document.querySelector("#accountForm");
  const sidebarItems = document.querySelectorAll(".sidebar-menu li");
  const toggleIcons = document.querySelectorAll(".toggle-password");

  // 1️⃣ Giả lập dữ liệu người dùng
  const userData = JSON.parse(localStorage.getItem("userData")) || {
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0901234567",
    address: "123 Đường ABC, Quận 1, TP.HCM",
  };

  // Hiển thị tên + gán dữ liệu
  customerName.textContent = userData.name;
  document.querySelector("#nameInput").value = userData.name;
  document.querySelector("#emailInput").value = userData.email;
  document.querySelector("#phoneInput").value = userData.phone;
  document.querySelector("#addressInput").value = userData.address;

  // 2️⃣ Ẩn/hiện mật khẩu
  toggleIcons.forEach(icon => {
    icon.addEventListener("click", () => {
      const targetInput = document.getElementById(icon.dataset.target);
      const isHidden = targetInput.type === "password";
      targetInput.type = isHidden ? "text" : "password";
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    });
  });

  // 3️⃣ Lưu thông tin tài khoản
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newName = document.querySelector("#nameInput").value.trim();
    const newEmail = document.querySelector("#emailInput").value.trim();
    const newPhone = document.querySelector("#phoneInput").value.trim();
    const newAddress = document.querySelector("#addressInput").value.trim();

    const oldPassword = document.getElementById("oldPassword").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    // Cập nhật thông tin cơ bản
    const updatedData = { ...userData, name: newName, email: newEmail, phone: newPhone, address: newAddress };
    localStorage.setItem("userData", JSON.stringify(updatedData));
    customerName.textContent = newName;

    // Xử lý đổi mật khẩu (giả lập)
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        alert("❌ Mật khẩu xác nhận không khớp!");
        return;
      } else if (!oldPassword) {
        alert("⚠️ Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu!");
        return;
      } else {
        alert("✅ Mật khẩu đã được thay đổi!");
      }
    }

    alert("✅ Thông tin tài khoản đã được lưu!");
  });

  // 4️⃣ Xử lý các nút trong sidebar
  sidebarItems.forEach(item => {
    item.addEventListener("click", () => {
      const action = item.textContent.trim();

      switch (action) {
        case "Thông tin":
          window.scrollTo({ top: 0, behavior: "smooth" });
          break;
        case "Đơn hàng":
          alert("📦 Tính năng xem đơn hàng đang được phát triển!");
          break;
        case "Đăng xuất":
          if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
            localStorage.removeItem("userData");
            window.location.href = "../home/home.html";
          }
          break;
      }
    });
  });
});
