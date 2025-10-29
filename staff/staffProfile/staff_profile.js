// ==========================
// staff_profile.js - PHIÊN BẢN HOÀN CHỈNH (BỎ CONFIRM LOGOUT)
// Vị trí: staff/staffProfile/
// ==========================

document.addEventListener("DOMContentLoaded", () => {
    // === Lấy các phần tử ===
    const staffNameDisplay = document.getElementById("staffNameDisplay");
    const infoForm = document.getElementById("infoForm");
    const passwordForm = document.getElementById("passwordForm");
    const toggleIcons = document.querySelectorAll(".toggle-password");
    const saveInfoBtn = document.getElementById("saveInfoBtn");
    const changePasswordBtn = document.getElementById("changePasswordBtn");

    let userData = null;

    // === Hàm xác thực ===
    function getAuthHeaders() {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            console.error("Không tìm thấy JWT Token!");
            logoutAndRedirect(); // Chuyển hướng nếu không có token
            return null;
        }
        return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    }

    // === 1. KIỂM TRA ĐĂNG NHẬP ===
    const currentUserDataString = localStorage.getItem("currentStaff");
    const jwtToken = localStorage.getItem("jwtToken");

    if (currentUserDataString && jwtToken) {
        try {
            userData = JSON.parse(currentUserDataString);
            if (!userData || !userData.id || !userData.email) {
                throw new Error("Dữ liệu currentStaff không hợp lệ.");
            }
        } catch (error) {
            console.error("Lỗi parse dữ liệu currentStaff:", error);
            logoutAndRedirect(); return; // Chuyển hướng nếu dữ liệu lỗi
        }
    } else {
        console.log("Nhân viên chưa đăng nhập, chuyển về trang login.");
        alert("Vui lòng đăng nhập để xem thông tin hồ sơ.");
        window.location.href = "../../pages/login/login.html";
        return;
    }

    // === 2. Điền thông tin vào form ===
    if (userData) {
        staffNameDisplay.textContent = userData.full_name || "(Chưa có tên)";
        document.getElementById("nameInput").value = userData.full_name || "";
        document.getElementById("emailInput").value = userData.email || "";
        document.getElementById("phoneInput").value = userData.phone || "";
        document.getElementById("addressInput").value = userData.address || "";
    }

    // === 3. ẨN/HIỆN MẬT KHẨU ===
    toggleIcons.forEach(icon => {
        icon.addEventListener("click", () => {
            const targetInput = document.getElementById(icon.dataset.target);
            if (!targetInput) return;
            targetInput.type = targetInput.type === "password" ? "text" : "password";
            icon.classList.toggle("fa-eye");
            icon.classList.toggle("fa-eye-slash");
        });
    });

    // === 4. XỬ LÝ LƯU THÔNG TIN (FORM INFO) ===
    infoForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        saveInfoBtn.disabled = true;
        saveInfoBtn.textContent = "Đang lưu...";
        const headers = getAuthHeaders();
        if (!headers) { /* ... xử lý lỗi ... */ return; }

        const newName = document.getElementById("nameInput").value.trim();
        const newPhone = document.getElementById("phoneInput").value.trim();
        const newAddress = document.getElementById("addressInput").value.trim();

        const infoChanged = newName !== (userData.full_name || '') || newPhone !== (userData.phone || '') || newAddress !== (userData.address || '');
        if (!infoChanged) { /* ... xử lý không đổi ... */ saveInfoBtn.disabled = false; saveInfoBtn.textContent = "Lưu thay đổi"; return; }

        const dataToUpdate = { full_name: newName, phone: newPhone, address: newAddress };

        try {
            const apiUrl = `../../api/staff_profile.php/${userData.id}`;
            const response = await fetch(apiUrl, { method: 'PUT', headers: headers, body: JSON.stringify(dataToUpdate) });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || `Lỗi ${response.status}`);

            const updatedUserFromServer = result.data.user;
            localStorage.setItem("currentStaff", JSON.stringify(updatedUserFromServer));
            userData = updatedUserFromServer;
            staffNameDisplay.textContent = userData.full_name;
            alert(`✅ Thông tin hồ sơ đã được cập nhật.`);
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin:', error);
            alert(`Lỗi khi cập nhật thông tin:\n${error.message}\nVui lòng thử lại.`);
        } finally {
            saveInfoBtn.disabled = false;
            saveInfoBtn.textContent = "Lưu thay đổi";
        }
    });

    // === 5. XỬ LÝ ĐỔI MẬT KHẨU (FORM PASSWORD) ===
    passwordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        changePasswordBtn.disabled = true;
        changePasswordBtn.textContent = "Đang đổi...";
        const headers = getAuthHeaders();
        if (!headers) { /* ... xử lý lỗi ... */ return; }

        const oldPassword = document.getElementById("oldPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // --- Validation ---
        let validationError = null;
        if (!oldPassword) validationError = "⚠️ Vui lòng nhập Mật khẩu hiện tại!";
        else if (newPassword.length < 6) validationError = "❌ Mật khẩu mới phải có ít nhất 6 ký tự!";
        else if (newPassword !== confirmPassword) validationError = "❌ Mật khẩu xác nhận không khớp!";

        if (validationError) {
            alert(validationError);
            // Focus vào trường lỗi tương ứng (ví dụ)
            if (validationError.includes("hiện tại")) document.getElementById("oldPassword").focus();
            else if (validationError.includes("mới")) document.getElementById("newPassword").focus();
            else document.getElementById("confirmPassword").focus();

            changePasswordBtn.disabled = false;
            changePasswordBtn.textContent = "Đổi mật khẩu";
            return;
        }

        // --- Gọi API ---
        try {
            const response = await fetch('../../api/staff_profile.php', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ oldPassword: oldPassword, newPassword: newPassword })
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || `Lỗi ${response.status}`);

            alert("✅ Đổi mật khẩu thành công!");
            document.getElementById("oldPassword").value = "";
            document.getElementById("newPassword").value = "";
            document.getElementById("confirmPassword").value = "";
        } catch (error) {
            console.error('Lỗi khi đổi mật khẩu:', error);
            alert(`❌ Đổi mật khẩu thất bại:\n${error.message}`);
        } finally {
            changePasswordBtn.disabled = false;
            changePasswordBtn.textContent = "Đổi mật khẩu";
        }
    });

    // === 6. HÀM ĐĂNG XUẤT (ĐÃ BỎ CONFIRM) ===
    function logoutAndRedirect() {
        console.log("Đang đăng xuất (không xác nhận)...");
        localStorage.removeItem('currentStaff');
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('rememberMe');
        // Không cần alert ở đây
        window.location.href = "../../pages/login/login.html";
    }

    // === 7. KÍCH HOẠT MENU DROPDOWN ===
    setupUserIconMenu(logoutAndRedirect); // Truyền hàm logout vào

    // === 8. XỬ LÝ TAB ===
    const tabLinks = document.querySelectorAll(".tab-link");
    const tabContents = document.querySelectorAll(".tab-content");
    tabLinks.forEach(link => {
        link.addEventListener("click", () => {
            tabLinks.forEach(l => l.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));
            link.classList.add("active");
            document.getElementById(link.dataset.tab).classList.add("active");
        });
    });
}); // Kết thúc DOMContentLoaded

// === HÀM MENU NGƯỜI DÙNG (ĐÃ CẬP NHẬT) ===
// Hàm này nhận vào hàm logout thực tế để gọi
function setupUserIconMenu(logoutFunction) {
    const userIconDiv = document.querySelector('.nav-user-icon');
    const userMenu = document.querySelector('.user-menu');
    const logoutButton = document.getElementById('logoutButton');

    if (!userIconDiv || !userMenu || !logoutButton) {
        console.error("Thiếu phần tử cho menu người dùng!");
        return;
    }

    userIconDiv.addEventListener('click', (event) => {
        event.stopPropagation();
        userMenu.classList.remove('hidden');
        setTimeout(() => userMenu.classList.toggle('visible'), 0);
    });

    document.addEventListener('click', (event) => {
        if (!userIconDiv.contains(event.target) && userMenu.classList.contains('visible')) {
            userMenu.classList.remove('visible');
        }
    });

    // Nút đăng xuất sẽ gọi hàm logoutFunction được truyền vào
    logoutButton.addEventListener('click', () => {
        console.log("Nút đăng xuất được nhấn.");
        if (typeof logoutFunction === 'function') {
            logoutFunction(); // Gọi hàm logout thực tế (đã bỏ confirm)
        } else {
            console.error("Hàm logout không hợp lệ!");
        }
    });
}