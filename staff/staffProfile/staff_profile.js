// ==========================
// staff_profile.js - La Cuisine Ngọt (Dành cho nhân viên)
// Vị trí: staff/staffProfile/
// ==========================

document.addEventListener("DOMContentLoaded", () => {
    const customerNameDisplay = document.querySelector(".customer-name");
    const accountForm = document.getElementById("accountForm");
    const sidebarItems = document.querySelectorAll(".sidebar-menu li");
    const toggleIcons = document.querySelectorAll(".toggle-password");
    const saveButton = accountForm.querySelector(".save-btn");

    let userData = null;

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

    // --- 1. KIỂM TRA ĐĂNG NHẬP (NHÂN VIÊN) VÀ LẤY DỮ LIỆU ---
    const currentUserDataString = localStorage.getItem("currentStaff");
    const jwtToken = localStorage.getItem("jwtToken");

    if (currentUserDataString && jwtToken) {
        try {
            userData = JSON.parse(currentUserDataString);
            if (!userData || !userData.id || !userData.email) {
                console.error("Dữ liệu currentStaff trong localStorage không hợp lệ.");
                logoutAndRedirect(); return;
            }
        } catch (error) {
            console.error("Lỗi parse dữ liệu currentStaff:", error);
            logoutAndRedirect(); return;
        }
    } else {
        console.log("Nhân viên chưa đăng nhập, chuyển về trang login.");
        alert("Vui lòng đăng nhập để xem thông tin hồ sơ.");
        // ĐÃ CẬP NHẬT: lùi 2 cấp về trang login
        window.location.href = "../../pages/login/login.html";
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
        emailInput.readOnly = true;
        emailInput.style.backgroundColor = "#e9ecef";
        emailInput.title = "Không thể thay đổi địa chỉ email.";
    }

    // --- 2. ẨN/HIỆN MẬT KHẨU --- (Giữ nguyên)
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

    // --- 3. XỬ LÝ LƯU THAY ĐỔI (GỌI API NHÂN VIÊN) ---
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
        let passwordChanged = false;

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
                // ĐÃ CẬP NHẬT: lùi 2 cấp để vào thư mục api/
                const apiUrl = `../../api/staff.php/${userData.id}`;
                console.log("Gọi API cập nhật nhân viên:", apiUrl);

                const response = await fetch(apiUrl, {
                    method: 'PUT',
                    headers: headers,
                    body: JSON.stringify(dataToUpdate)
                });

                const result = await response.json();
                console.log("Kết quả API:", result);

                if (response.ok && result.success) {
                    infoUpdated = true;
                    const updatedUserFromServer = result.data.user;
                    localStorage.setItem("currentStaff", JSON.stringify(updatedUserFromServer));
                    userData = updatedUserFromServer;
                    customerNameDisplay.textContent = userData.full_name;
                } else {
                    throw new Error(result.message || `Lỗi ${response.status} khi cập nhật thông tin.`);
                }
            } catch (error) {
                console.error('Lỗi khi cập nhật thông tin:', error);
                alert(`Lỗi khi cập nhật thông tin:\n${error.message}\nVui lòng thử lại.`);
                saveButton.disabled = false;
                saveButton.textContent = "Lưu thay đổi";
                return;
            }
        }

        // --- b) Gọi API đổi mật khẩu (Logic giữ nguyên) ---
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
                console.log("Chuẩn bị gọi API đổi mật khẩu nhân viên...");
                // API endpoint này cũng có thể cần đổi, ví dụ: '../../api/staff_auth/change_password.php'
                alert("⚠️ Chức năng đổi mật khẩu chưa được kết nối API.");
            }
        }

        // --- Thông báo kết quả cuối cùng --- (Giữ nguyên)
        if (infoUpdated || passwordChanged) {
            let successMessage = "";
            if (infoUpdated) successMessage += "Thông tin hồ sơ đã được cập nhật. ";
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

                case "complaintsBtn":
                    // ĐÃ CẬP NHẬT: lùi 1 cấp để vào thư mục 'handleComplaint'
                    window.location.href = "../handleComplaint/complaint.html";
                    break;

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
        localStorage.removeItem('currentStaff');
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('rememberMe');
        // ĐÃ CẬP NHẬT: lùi 2 cấp về trang login
        window.location.href = "../../pages/login/login.html";
    }

    // --- 5. KÍCH HOẠT MENU DROPDOWN (Copy từ complaint.js) ---
    setupUserIconMenu();
});

// HÀM NÀY COPY TỪ complaint.js
function setupUserIconMenu() {
    const userIconDiv = document.querySelector('.nav-user-icon');
    const userMenu = document.querySelector('.user-menu');
    const logoutButton = document.getElementById('logoutButton');

    if (userIconDiv && userMenu) {
        userIconDiv.addEventListener('click', (event) => {
            event.stopPropagation();
            userMenu.classList.toggle('visible');
        });

        document.addEventListener('click', (event) => {
            if (userIconDiv && !userIconDiv.contains(event.target) && userMenu.classList.contains('visible')) {
                userMenu.classList.remove('visible');
            }
        });
    }

    function performLogout(redirectUrl) {
        if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
            console.log("Đang đăng xuất...");
            localStorage.removeItem('currentStaff');
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('rememberMe');
            alert("Bạn đã đăng xuất thành công.");
            window.location.href = redirectUrl;
        }
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // ĐÃ CẬP NHẬT: lùi 2 cấp về trang login
            performLogout('../../pages/login/login.html');
        });
    }
}