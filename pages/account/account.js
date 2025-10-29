// ==========================
// account.js - La Cuisine Ngọt (ĐÃ SỬA LỖI NAVBAR)
// ==========================

// --- HÀM ĐĂNG XUẤT (TÁCH RA ĐỂ DÙNG CHUNG) ---
function performLogout(redirectUrl) {
  console.log(`Đang đăng xuất và chuyển đến: ${redirectUrl}...`);
  // Xóa tất cả các key user để dọn dẹp
  localStorage.removeItem('currentStaff');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('jwtToken');
  localStorage.removeItem('rememberMe');
  window.location.href = redirectUrl; // Chuyển hướng
}

// --- HÀM XỬ LÝ NAVBAR (TÁCH RA ĐỂ DÙNG CHUNG) ---
function handleUserDisplay() {
  const loginLink = document.querySelector(".nav-login"); // Thẻ <a> chính
  const userMenu = document.querySelector(".user-menu"); // Menu thả xuống

  if (!loginLink || !userMenu) {
    console.error("Thiếu .nav-login hoặc .user-menu trong account.html.");
    return;
  }

  // Xóa listener cũ (nếu có) bằng cách clone
  const newLoginLink = loginLink.cloneNode(true);
  loginLink.parentNode.replaceChild(newLoginLink, loginLink);

  const staffDataString = localStorage.getItem("currentStaff");
  const customerDataString = localStorage.getItem("currentUser");
  const jwtToken = localStorage.getItem("jwtToken");

  let loggedInUser = null;
  let userType = null;

  if (staffDataString && jwtToken) {
    try { loggedInUser = JSON.parse(staffDataString); if (loggedInUser?.id) userType = 'staff'; else loggedInUser = null; }
    catch (e) { loggedInUser = null; }
  }
  if (!loggedInUser && customerDataString && jwtToken) {
    try { loggedInUser = JSON.parse(customerDataString); if (loggedInUser?.id) userType = 'customer'; else loggedInUser = null; }
    catch (e) { loggedInUser = null; }
  }

  // --- Cập nhật giao diện ---
  if (loggedInUser && userType) {
    // ---- ĐÃ ĐĂNG NHẬP ----
    console.log(`Đã đăng nhập (account.js) với ${userType}. Hiển thị icon.`);
    newLoginLink.innerHTML = `<i class="fas fa-user"></i>`;
    newLoginLink.href = "#";

    const accountLink = userMenu.querySelector("a[href*='account.html'], a[href*='staff_profile.html']");
    const logoutBtn = document.getElementById("logoutBtnNav"); // Dùng ID mới

    if (accountLink) {
      accountLink.href = (userType === 'staff') ? "../staff/staffProfile/staff_profile.html" : "../account/account.html";
    }

    // Hiện menu khi click icon
    newLoginLink.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      userMenu.classList.remove("hidden");
      userMenu.style.display = (userMenu.style.display === "block") ? "none" : "block";
    });

    // Đóng menu khi click ra ngoài
    document.addEventListener('click', (event) => {
      if (userMenu && !newLoginLink.contains(event.target) && !userMenu.contains(event.target)) {
        userMenu.style.display = "none";
      }
    });

    // Xử lý nút Đăng xuất (Navbar)
    if (logoutBtn) {
      const newLogoutBtn = logoutBtn.cloneNode(true);
      logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
      newLogoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        performLogout("../login/login.html"); // Về trang login
      });
    }

    userMenu.style.display = "none";

  } else {
    // ---- CHƯA ĐĂNG NHẬP ----
    console.log("Chưa đăng nhập (account.js). Hiển thị link login.");
    newLoginLink.innerHTML = 'ĐĂNG NHẬP/ĐĂNG KÍ';
    newLoginLink.href = "../login/login.html";
    userMenu.classList.add("hidden");
    userMenu.style.display = "none";
  }
}


// ========== TRÌNH NGHE SỰ KIỆN CHÍNH ==========
document.addEventListener("DOMContentLoaded", () => {
  const customerNameDisplay = document.querySelector(".customer-name");
  const accountForm = document.getElementById("accountForm");
  const sidebarItems = document.querySelectorAll(".sidebar-menu li");
  const toggleIcons = document.querySelectorAll(".toggle-password");
  const saveButton = accountForm?.querySelector(".save-btn"); // Thêm kiểm tra null

  // Kiểm tra null cho các element quan trọng
  if (!customerNameDisplay || !accountForm || !sidebarItems.length) {
    console.error("Thiếu các element chính của trang account (form, sidebar...).");
    // Có thể không cần return, nhưng phải cẩn thận
  }

  let userData = null;

  // --- HÀM ĐĂNG XUẤT CỦA SIDEBAR ---
  // (Hàm này chỉ dùng cho nút logout trong sidebar)
  function logoutAndRedirect() {
    console.log("Đang đăng xuất từ sidebar...");
    performLogout("../login/login.html"); // Gọi hàm logout chung
  }

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
  // Chỉ kiểm tra 'currentUser' vì đây là trang của khách hàng
  const currentUserDataString = localStorage.getItem("currentUser");
  const jwtToken = localStorage.getItem("jwtToken");

  if (currentUserDataString && jwtToken) {
    try {
      userData = JSON.parse(currentUserDataString);
      if (!userData || !userData.id || !userData.email) {
        throw new Error("Dữ liệu currentUser không hợp lệ.");
      }
    } catch (error) {
      console.error(error.message);
      logoutAndRedirect(); return;
    }
  } else {
    // Nếu nhân viên vô tình vào trang này
    if (localStorage.getItem("currentStaff") && jwtToken) {
      alert("Đây là trang tài khoản khách hàng. Bạn đang đăng nhập với tư cách nhân viên.");
      window.location.href = "../staff/staffProfile/staff_profile.html"; // Điều hướng về profile nhân viên
    } else {
      // Nếu không ai đăng nhập
      console.log("Chưa đăng nhập, chuyển về trang login.");
      alert("Vui lòng đăng nhập để xem thông tin tài khoản.");
      window.location.href = "../login/login.html";
    }
    return;
  }

  // --- Điền thông tin vào form ---
  if (userData) {
    customerNameDisplay.textContent = userData.full_name || "(Chưa có tên)";
    document.getElementById("nameInput").value = userData.full_name || "";
    document.getElementById("emailInput").value = userData.email || "";
    document.getElementById("phoneInput").value = userData.phone || "";
    document.getElementById("addressInput").value = userData.address || "";
    const emailInput = document.getElementById("emailInput");
    if (emailInput) { // Kiểm tra null
      emailInput.readOnly = true;
      emailInput.style.backgroundColor = "#e9ecef";
      emailInput.title = "Không thể thay đổi địa chỉ email.";
    }
  }

  // --- 2. ẨN/HIỆN MẬT KHẨU ---
  if (toggleIcons) {
    toggleIcons.forEach(icon => {
      icon.addEventListener("click", () => {
        const targetInput = document.getElementById(icon.dataset.target);
        if (!targetInput) return;
        targetInput.type = targetInput.type === "password" ? "text" : "password";
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
      });
    });
  }

  // --- 3. XỬ LÝ LƯU THAY ĐỔI (GỌI API) ---
  if (accountForm) {
    accountForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!saveButton) return;
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
      let passwordChanged = false;

      // a) Cập nhật thông tin cơ bản
      const infoChanged = newName !== (userData.full_name || '') || newPhone !== (userData.phone || '') || newAddress !== (userData.address || '');
      if (infoChanged) {
        const dataToUpdate = { full_name: newName, phone: newPhone, address: newAddress };
        try {
          const apiUrl = `../../api/users.php/${userData.id}`; // API cập nhật user
          const response = await fetch(apiUrl, { method: 'PUT', headers: headers, body: JSON.stringify(dataToUpdate) });
          const result = await response.json();
          if (!response.ok || !result.success) throw new Error(result.message || `Lỗi ${response.status}`);

          infoUpdated = true;
          const updatedUserFromServer = result.data.user;
          localStorage.setItem("currentUser", JSON.stringify(updatedUserFromServer));
          userData = updatedUserFromServer;
          customerNameDisplay.textContent = userData.full_name;
        } catch (error) {
          console.error('Lỗi cập nhật thông tin:', error);
          alert(`Lỗi cập nhật thông tin:\n${error.message}`);
          saveButton.disabled = false; saveButton.textContent = "Lưu thay đổi";
          return;
        }
      }

      // b) Đổi mật khẩu
      if (newPassword || confirmPassword || oldPassword) {
        if (!oldPassword) alert("⚠️ Vui lòng nhập Mật khẩu hiện tại!");
        else if (newPassword.length < 6) alert("❌ Mật khẩu mới phải có ít nhất 6 ký tự!");
        else if (newPassword !== confirmPassword) alert("❌ Mật khẩu xác nhận không khớp!");
        else {
          console.log("Chuẩn bị gọi API đổi mật khẩu...");
          // const passwordData = { oldPassword: oldPassword, newPassword: newPassword };
          try {
            alert("⚠️ Chức năng đổi mật khẩu chưa được kết nối API.");
            // Tạm thời reset form
            passwordChanged = true; // Giả sử thành công để test alert
            document.getElementById("oldPassword").value = "";
            document.getElementById("newPassword").value = "";
            document.getElementById("confirmPassword").value = "";
          } catch (error) {
            alert(`Lỗi đổi mật khẩu: ${error.message}`);
          }
        }
      }

      // --- Thông báo kết quả ---
      if (infoUpdated || passwordChanged) {
        alert(`✅ ${infoUpdated ? 'Thông tin đã được cập nhật.' : ''} ${passwordChanged ? 'Mật khẩu đã được thay đổi.' : ''}`);
      } else if (!infoChanged && !oldPassword) {
        alert("ℹ️ Không có thay đổi nào để lưu.");
      }

      saveButton.disabled = false;
      saveButton.textContent = "Lưu thay đổi";
    });
  }

  // --- 4. XỬ LÝ SIDEBAR ---
  if (sidebarItems) {
    sidebarItems.forEach(item => {
      item.addEventListener("click", () => {
        const actionId = item.id;
        switch (actionId) {
          case "infoBtn": window.scrollTo({ top: 0, behavior: "smooth" }); break;
          case "ordersBtn": alert("📦 Tính năng xem đơn hàng đang được phát triển!"); break;
          case "logoutBtn": // Đây là nút logout CỦA SIDEBAR
            if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
              logoutAndRedirect();
            } break;
        }
      });
    });
  }

  // === 5. GỌI HÀM XỬ LÝ NAVBAR (CUỐI CÙNG) ===
  handleUserDisplay();

}); // <-- Đây là dấu đóng của DOMContentLoaded chính