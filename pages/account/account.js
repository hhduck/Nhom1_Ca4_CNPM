// ==========================
// account.js - La Cuisine Ngọt (Tích hợp API cập nhật thông tin - Hoàn chỉnh)
// ==========================

document.addEventListener("DOMContentLoaded", () => {
  const customerNameDisplay = document.querySelector(".customer-name");
  const accountForm = document.getElementById("accountForm");
  const sidebarItems = document.querySelectorAll(".sidebar-menu li");
  const toggleIcons = document.querySelectorAll(".toggle-password");
  const saveButton = accountForm.querySelector(".save-btn");

  let userData = null;

  // --- TIỆN ÍCH: Lấy Auth Headers ---
  function getAuthHeaders() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      console.error("Không tìm thấy JWT Token!");
      logoutAndRedirect();
      return null;
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // --- 1. KIỂM TRA ĐĂNG NHẬP VÀ LẤY DỮ LIỆU ---
  const currentUserDataString = localStorage.getItem("currentUser");
  const jwtToken = localStorage.getItem("jwtToken");

  if (currentUserDataString && jwtToken) {
    try {
      userData = JSON.parse(currentUserDataString);
      if (!userData || !userData.id || !userData.email) {
        console.error("Dữ liệu currentUser trong localStorage không hợp lệ.");
        logoutAndRedirect(); return;
      }
    } catch (error) {
      console.error("Lỗi parse dữ liệu currentUser:", error);
      logoutAndRedirect(); return;
    }
  } else {
    console.log("Chưa đăng nhập, chuyển về trang login.");
    alert("Vui lòng đăng nhập để xem thông tin tài khoản.");
    window.location.href = "../login/login.html"; return;
  }

  // --- Điền thông tin vào form ---
  if (userData) {
    customerNameDisplay.textContent = userData.full_name || "(Chưa có tên)";
    document.getElementById("nameInput").value = userData.full_name || "";
    document.getElementById("emailInput").value = userData.email || "";
    document.getElementById("phoneInput").value = userData.phone || "";
    document.getElementById("addressInput").value = userData.address || "";
    const emailInput = document.getElementById("emailInput");
    emailInput.readOnly = true;
    emailInput.style.backgroundColor = "#e9ecef";
    emailInput.title = "Không thể thay đổi địa chỉ email.";
  }

  // --- 2. ẨN/HIỆN MẬT KHẨU ---
  toggleIcons.forEach(icon => {
    icon.addEventListener("click", () => {
      const targetInput = document.getElementById(icon.dataset.target);
      if (!targetInput) return;
      const isHidden = targetInput.type === "password";
      targetInput.type = isHidden ? "text" : "password";
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    });
  });

  // --- 3. XỬ LÝ LƯU THAY ĐỔI (GỌI API) ---
  accountForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    saveButton.disabled = true;
    saveButton.textContent = "Đang lưu...";

    const headers = getAuthHeaders();
    if (!headers) {
      saveButton.disabled = false;
      saveButton.textContent = "Lưu thay đổi";
      return;
    }

    const newName = document.getElementById("nameInput").value.trim();
    const newPhone = document.getElementById("phoneInput").value.trim();
    const newAddress = document.getElementById("addressInput").value.trim();
    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    let infoUpdated = false;
    let passwordChanged = false; // Vẫn giữ biến này cho phần đổi mật khẩu sau này

    // --- a) Gọi API cập nhật thông tin cơ bản ---
    const infoChanged = newName !== (userData.full_name || '') ||
      newPhone !== (userData.phone || '') ||
      newAddress !== (userData.address || '');

    if (infoChanged) {
      const dataToUpdate = {
        full_name: newName,
        phone: newPhone,
        address: newAddress
      };

      try {
        // Đảm bảo URL gọi API đúng định dạng
        const apiUrl = `../../api/users.php/${userData.id}`; // Chỉ có ID người dùng
        console.log("Gọi API cập nhật:", apiUrl); // In ra URL để kiểm tra

        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify(dataToUpdate)
        });

        const result = await response.json();
        console.log("Kết quả API:", result); // In kết quả API

        if (response.ok && result.success) {
          infoUpdated = true;
          const updatedUserFromServer = result.data.user;
          localStorage.setItem("currentUser", JSON.stringify(updatedUserFromServer));
          userData = updatedUserFromServer;
          customerNameDisplay.textContent = userData.full_name;
        } else {
          // Ném lỗi với thông báo từ API hoặc status code
          throw new Error(result.message || `Lỗi ${response.status} (${response.statusText}) khi cập nhật thông tin.`);
        }
      } catch (error) {
        console.error('Lỗi khi cập nhật thông tin:', error);
        // Hiển thị lỗi cụ thể hơn cho người dùng
        alert(`Lỗi khi cập nhật thông tin:\n${error.message}\nVui lòng thử lại.`);
        saveButton.disabled = false;
        saveButton.textContent = "Lưu thay đổi";
        return;
      }
    }

    // --- b) Gọi API đổi mật khẩu (NẾU CÓ NHẬP) ---
    if (newPassword || confirmPassword || oldPassword) {
      if (!oldPassword) {
        alert("⚠️ Vui lòng nhập Mật khẩu hiện tại để thay đổi mật khẩu!");
        document.getElementById("oldPassword").focus();
      } else if (newPassword.length < 6) {
        alert("❌ Mật khẩu mới phải có ít nhất 6 ký tự!");
        document.getElementById("newPassword").focus();
      } else if (newPassword !== confirmPassword) {
        alert("❌ Mật khẩu xác nhận không khớp!");
        document.getElementById("confirmPassword").focus();
      } else {
        console.log("Chuẩn bị gọi API đổi mật khẩu...");
        const passwordData = {
          oldPassword: oldPassword,
          newPassword: newPassword
        };
        try {
          alert("⚠️ Chức năng đổi mật khẩu chưa được kết nối API.");
          /*
          // Code gọi API đổi mật khẩu sẽ nằm ở đây
          const response = await fetch('../../api/auth/change_password.php', {
              method: 'POST',
              headers: headers,
              body: JSON.stringify(passwordData)
          });
          const result = await response.json();
          if (response.ok && result.success) {
              passwordChanged = true;
              document.getElementById("oldPassword").value = "";
              document.getElementById("newPassword").value = "";
              document.getElementById("confirmPassword").value = "";
          } else {
              throw new Error(result.message || `Lỗi ${response.status} khi đổi mật khẩu.`);
          }
          */
        } catch (error) {
          console.error('Lỗi khi đổi mật khẩu:', error);
          alert(`Lỗi khi đổi mật khẩu: ${error.message}`);
        }
      }
    }

    // --- Thông báo kết quả cuối cùng ---
    if (infoUpdated || passwordChanged) {
      let successMessage = "";
      if (infoUpdated) successMessage += "Thông tin tài khoản đã được cập nhật. ";
      if (passwordChanged) successMessage += "Mật khẩu đã được thay đổi.";
      alert(`✅ ${successMessage.trim()}`);
    } else if (!infoChanged && !(newPassword || confirmPassword || oldPassword)) {
      alert("ℹ️ Không có thay đổi nào để lưu.");
    }

    saveButton.disabled = false;
    saveButton.textContent = "Lưu thay đổi";
  });

  // --- 4. XỬ LÝ SIDEBAR ---
  sidebarItems.forEach(item => {
    item.addEventListener("click", () => {
      const actionId = item.id;
      switch (actionId) {
        case "infoBtn":
          window.scrollTo({ top: 0, behavior: "smooth" }); break;
        case "ordersBtn":
          alert("📦 Tính năng xem đơn hàng của bạn đang được phát triển!"); break;
        case "logoutBtn":
          if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
            logoutAndRedirect();
          } break;
      }
    });
  });

  // --- HÀM ĐĂNG XUẤT VÀ CHUYỂN HƯỚNG ---
  function logoutAndRedirect() {
    console.log("Đang đăng xuất...");
    localStorage.removeItem('currentUser');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('rememberMe');
    window.location.href = "../login/login.html";
  }
}); 