// ==========================
// staff_profile.js - PHIÊN BẢN HOÀN CHỈNH (TAB + API GỘP)
// Vị trí: staff/staffProfile/
// ==========================

document.addEventListener("DOMContentLoaded", () => {
    // === Lấy các phần tử theo thiết kế mới ===
    const staffNameDisplay = document.getElementById("staffNameDisplay");
    const infoForm = document.getElementById("infoForm");
    const passwordForm = document.getElementById("passwordForm");
    const toggleIcons = document.querySelectorAll(".toggle-password");
    const saveInfoBtn = document.getElementById("saveInfoBtn");
    const changePasswordBtn = document.getElementById("changePasswordBtn");

    let userData = null;

    // === Hàm xác thực (Không đổi) ===
    function getAuthHeaders() {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            console.error("Không tìm thấy JWT Token!");
            logoutAndRedirect();
            return null;
        }
        return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    }

    // === 1. KIỂM TRA ĐĂNG NHẬP (Không đổi) ===
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
        window.location.href = "../../pages/login/login.html";
        return;
    }

    // === 2. Điền thông tin vào form (Cập nhật cho giao diện mới) ===
    if (userData) {
        staffNameDisplay.textContent = userData.full_name || "(Chưa có tên)";
        document.getElementById("nameInput").value = userData.full_name || "";
        document.getElementById("emailInput").value = userData.email || "";
        document.getElementById("phoneInput").value = userData.phone || "";
        document.getElementById("addressInput").value = userData.address || "";
    }

    // === 3. ẨN/HIỆN MẬT KHẨU (Không đổi) ===
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

    // === 4. XỬ LÝ LƯU THÔNG TIN (FORM INFO) ===
    // Gửi yêu cầu PUT đến api/staff_profile.php/{id}
    infoForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        saveInfoBtn.disabled = true;
        saveInfoBtn.textContent = "Đang lưu...";

        const headers = getAuthHeaders();
        if (!headers) {
            saveInfoBtn.disabled = false;
            saveInfoBtn.textContent = "Lưu thay đổi";
            return;
        }

        const newName = document.getElementById("nameInput").value.trim();
        const newPhone = document.getElementById("phoneInput").value.trim();
        const newAddress = document.getElementById("addressInput").value.trim();

        const infoChanged = newName !== (userData.full_name || '') ||
            newPhone !== (userData.phone || '') ||
            newAddress !== (userData.address || '');

        if (!infoChanged) {
            alert("ℹ️ Không có thay đổi nào để lưu.");
            saveInfoBtn.disabled = false;
            saveInfoBtn.textContent = "Lưu thay đổi";
            return;
        }

        const dataToUpdate = {
            full_name: newName,
            phone: newPhone,
            address: newAddress
        };

        try {
            // ĐÃ CẬP NHẬT: Trỏ đến file api/staff_profile.php
            const apiUrl = `../../api/staff_profile.php/${userData.id}`;

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(dataToUpdate)
            });
            const result = await response.json();

            if (response.ok && result.success) {
                const updatedUserFromServer = result.data.user;
                localStorage.setItem("currentStaff", JSON.stringify(updatedUserFromServer));
                userData = updatedUserFromServer;
                staffNameDisplay.textContent = userData.full_name;
                alert(`✅ Thông tin hồ sơ đã được cập nhật.`);
            } else {
                throw new Error(result.message || `Lỗi ${response.status} khi cập nhật thông tin.`);
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin:', error);
            alert(`Lỗi khi cập nhật thông tin:\n${error.message}\nVui lòng thử lại.`);
        } finally {
            saveInfoBtn.disabled = false;
            saveInfoBtn.textContent = "Lưu thay đổi";
        }
    });

    // === 5. XỬ LÝ ĐỔI MẬT KHẨU (FORM PASSWORD) ===
    // Gửi yêu cầu POST đến api/staff_profile.php
    passwordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        changePasswordBtn.disabled = true;
        changePasswordBtn.textContent = "Đang đổi...";

        const headers = getAuthHeaders();
        if (!headers) {
            changePasswordBtn.disabled = false;
            changePasswordBtn.textContent = "Đổi mật khẩu";
            return;
        }

        const oldPassword = document.getElementById("oldPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // --- Logic validation ---
        if (!oldPassword) {
            alert("⚠️ Vui lòng nhập Mật khẩu hiện tại!");
            document.getElementById("oldPassword").focus();
            changePasswordBtn.disabled = false;
            changePasswordBtn.textContent = "Đổi mật khẩu";
            return;
        }
        if (newPassword.length < 6) {
            alert("❌ Mật khẩu mới phải có ít nhất 6 ký tự!");
            document.getElementById("newPassword").focus();
            changePasswordBtn.disabled = false;
            changePasswordBtn.textContent = "Đổi mật khẩu";
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("❌ Mật khẩu xác nhận không khớp!");
            document.getElementById("confirmPassword").focus();
            changePasswordBtn.disabled = false;
            changePasswordBtn.textContent = "Đổi mật khẩu";
            return;
        }

        // --- BẮT ĐẦU GỌI API GỘP BẰNG POST ---
        try {
            console.log("Chuẩn bị gọi API đổi mật khẩu (POST)...");

            // ĐÃ CẬP NHẬT: Trỏ đến file api/staff_profile.php (không cần ID vì dùng POST)
            const response = await fetch('../../api/staff_profile.php', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    oldPassword: oldPassword,
                    newPassword: newPassword
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Thành công
                alert("✅ Đổi mật khẩu thành công!");
                // Xóa trống các ô mật khẩu
                document.getElementById("oldPassword").value = "";
                document.getElementById("newPassword").value = "";
                document.getElementById("confirmPassword").value = "";
            } else {
                // Thất bại
                throw new Error(result.message || `Lỗi ${response.status}`);
            }

        } catch (error) {
            console.error('Lỗi khi đổi mật khẩu:', error);
            alert(`❌ Đổi mật khẩu thất bại:\n${error.message}`);
        } finally {
            // Luôn trả lại nút về trạng thái ban đầu
            changePasswordBtn.disabled = false;
            changePasswordBtn.textContent = "Đổi mật khẩu";
        }
    });

    // === 6. HÀM ĐĂNG XUẤT (Không đổi) ===
    function logoutAndRedirect() {
        console.log("Đang đăng xuất...");
        localStorage.removeItem('currentStaff');
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('rememberMe');
        window.location.href = "../../pages/login/login.html";
    }

    // === 7. KÍCH HOẠT MENU DROPDOWN (ĐÃ SỬA LỖI) ===
    setupUserIconMenu();

    // === 8. XỬ LÝ TAB MỚI ===
    const tabLinks = document.querySelectorAll(".tab-link");
    const tabContents = document.querySelectorAll(".tab-content");

    tabLinks.forEach(link => {
        link.addEventListener("click", () => {
            // Xóa active khỏi tất cả link và content
            tabLinks.forEach(l => l.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            // Thêm active vào link và content được chọn
            link.classList.add("active");
            document.getElementById(link.dataset.tab).classList.add("active");
        });
    });

});


// === HÀM SỬA LỖI ĐĂNG XUẤT ===
function setupUserIconMenu() {
    const userIconDiv = document.querySelector('.nav-user-icon');
    const userMenu = document.querySelector('.user-menu');
    const logoutButton = document.getElementById('logoutButton');

    if (userIconDiv && userMenu) {
        userIconDiv.addEventListener('click', (event) => {
            event.stopPropagation();

            // SỬA LỖI: Xóa 'hidden' TRƯỚC, rồi mới toggle 'visible'
            userMenu.classList.remove('hidden');
            setTimeout(() => { // Thêm timeout nhỏ để CSS transition kịp chạy
                userMenu.classList.toggle('visible');
            }, 0);
        });

        // Đóng menu khi nhấp ra ngoài
        document.addEventListener('click', (event) => {
            if (userIconDiv && !userIconDiv.contains(event.target) && userMenu.classList.contains('visible')) {
                userMenu.classList.remove('visible');
            }
        });
    }

    // Hàm riêng để đăng xuất
    function performLogout(redirectUrl) {
        if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
            console.log("Đang đăng xuất...");
            localStorage.removeItem('currentStaff'); // Xóa đúng key
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('rememberMe');
            alert("Bạn đã đăng xuất thành công.");
            window.location.href = redirectUrl;
        }
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            performLogout('../../pages/login/login.html');
        });
    }
}