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
  localStorage.removeItem('cart'); // Xóa giỏ hàng khi logout
  window.location.href = redirectUrl; // Chuyển hướng
}

// --- HÀM XỬ LÝ NAVBAR (TÁCH RA ĐỂ DÙNG CHUNG) ---
function handleUserDisplay() {
  const navUserLi = document.querySelector(".nav-user"); // Chọn thẻ <li> cha
  const login1Link = document.querySelector(".nav-login-1"); // ĐĂNG NHẬP
  const login2Link = document.querySelector(".nav-login-2"); // ĐĂNG KÍ
  const navSeparator = document.querySelector(".nav-separator"); // Dấu |
  const userMenu = document.querySelector(".user-menu"); // Menu thả xuống
  const ttButton = document.getElementById("tt"); // Nút Thông tin tài khoản trong user-menu
  const logoutBtnNav = document.getElementById("logoutBtnNav"); // Nút Đăng xuất trong user-menu

  if (!navUserLi || !login1Link || !login2Link || !navSeparator || !userMenu || !ttButton || !logoutBtnNav) {
    console.error("Thiếu các element navbar quan trọng.");
    return;
  }

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

    // Ẩn link Đăng nhập/Đăng ký và dấu |
    login1Link.style.display = 'none';
    login2Link.style.display = 'none';
    navSeparator.style.display = 'none';

    // Tạo hoặc cập nhật icon user
    let userIconLink = navUserLi.querySelector(".nav-user-icon");
    if (!userIconLink) {
      userIconLink = document.createElement('a');
      userIconLink.href = "#";
      userIconLink.className = "nav-user-icon";
      userIconLink.innerHTML = `<i class="fas fa-user"></i>`;
      navUserLi.prepend(userIconLink); // Thêm vào đầu li.nav-user
    } else {
      userIconLink.style.display = 'block'; // Đảm bảo icon hiện
    }

    // Cập nhật href cho nút "Thông tin tài khoản" trong user-menu
    if (userType === 'staff') {
      ttButton.onclick = () => window.location.href = "../../staff/staffProfile/staff_profile.html";
    } else {
      ttButton.onclick = () => window.location.href = "../account/account.html";
    }

    // Hiện/ẩn menu khi click icon
    userIconLink.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      userMenu.classList.toggle("hidden"); // Dùng toggle để tiện ẩn hiện
      userMenu.style.display = userMenu.classList.contains("hidden") ? "none" : "block";
    });

    // Đóng menu khi click ra ngoài
    document.addEventListener('click', (event) => {
      if (userMenu && userIconLink && !userIconLink.contains(event.target) && !userMenu.contains(event.target)) {
        userMenu.classList.add("hidden");
        userMenu.style.display = "none";
      }
    });

    // Xử lý nút Đăng xuất (Navbar)
    logoutBtnNav.addEventListener("click", (e) => {
      e.preventDefault();
      performLogout("../login/login.html"); // Về trang login
    });

    userMenu.classList.add("hidden"); // Mặc định ẩn menu khi mới tải trang
    userMenu.style.display = "none";

  } else {
    // ---- CHƯA ĐĂNG NHẬP ----
    console.log("Chưa đăng nhập (account.js). Hiển thị link login.");

    // Hiện link Đăng nhập/Đăng ký và dấu |
    login1Link.style.display = 'inline';
    login2Link.style.display = 'inline';
    navSeparator.style.display = 'inline';

    // Ẩn icon user nếu có
    const userIconLink = navUserLi.querySelector(".nav-user-icon");
    if (userIconLink) {
      userIconLink.style.display = 'none';
    }

    userMenu.classList.add("hidden"); // Đảm bảo menu ẩn
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

  // Thêm các element liên quan đến hiển thị đơn hàng
  const orderSection = document.getElementById("orderHistorySection");
  const orderListContainer = document.getElementById("orderList");

  // Kiểm tra null cho các element quan trọng
  if (!customerNameDisplay || !accountForm || !sidebarItems.length || !orderSection || !orderListContainer) {
    console.error("Thiếu các element chính của trang account (form, sidebar, order section...).");
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
      window.location.href = "../../staff/staffProfile/staff_profile.html"; // Điều hướng về profile nhân viên
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

  // --- HÀM LẤY ĐƠN HÀNG CỦA NGƯỜI DÙNG ---
  async function fetchUserOrders(userId) {
    const headers = getAuthHeaders();
    if (!headers) return [];

    try {
      const response = await fetch(`../../api/orders.php?user_id=${userId}`, {
        method: 'GET',
        headers: headers
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("Phản hồi lỗi từ server:", result);
        throw new Error(result.error_details || `Lỗi khi lấy đơn hàng: ${response.status}`);
      }

      // Nếu server trả về data kiểu khác, vẫn có fallback
      return result.data?.orders || [];

    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
      alert("Không thể tải lịch sử đơn hàng: " + error.message);
      return [];
    }
  }

  // --- LOGIC XỬ LÝ POPUP KHIẾU NẠI ---
  const complaintOverlay = document.getElementById("complaintOverlay");
  const complaintForm = document.getElementById("complaintForm");
  const closeComplaintPopupBtn = document.getElementById("closeComplaintPopup");
  const complaintOrderIdInput = document.getElementById("complaintOrderId");
  const complaintTitleInput = document.getElementById("complaintTitle");
  const complaintContentInput = document.getElementById("complaintContent");
  const popupContentWrapper = document.querySelector("#complaintOverlay .popup-content-wrapper"); // Lấy wrapper mới

  // Mở popup khi click nút "Khiếu Nại"
  orderListContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('complaint-btn')) {
      const orderId = e.target.dataset.orderId;
      complaintOrderIdInput.value = orderId;

      complaintOverlay.classList.remove('hidden'); // Hiện overlay
      // Kích hoạt animation của overlay và content
      setTimeout(() => { // Đảm bảo trình duyệt render 'display:flex' trước khi thêm 'show'
        complaintOverlay.classList.add('show');
        // Đối với content wrapper, vì chúng ta dùng animation keyframes, không cần thêm/xóa class riêng
        // animation: fadeInUp sẽ tự động chạy khi nó hiển thị và opacity > 0
      }, 10);
    }
  });

  // Đóng popup
  function hideComplaintPopup() {
    // Kích hoạt hiệu ứng đóng
    complaintOverlay.classList.add('closing'); // Thêm class để kích hoạt fadeOutDown (nếu có)
    complaintOverlay.classList.remove('show'); // Bắt đầu fade out overlay

    // Chờ cho animation đóng hoàn tất rồi ẩn hoàn toàn
    setTimeout(() => {
      complaintOverlay.classList.add('hidden');
      complaintOverlay.classList.remove('closing'); // Xóa class closing để chuẩn bị cho lần mở tiếp theo
      complaintForm.reset(); // Reset form khi đóng
      // Đặt lại opacity của content wrapper để animation mở lần sau hoạt động
      if (popupContentWrapper) {
        popupContentWrapper.style.opacity = 0;
      }
    }, 300); // Thời gian này phải khớp với transition/animation duration của overlay và content
  }

  closeComplaintPopupBtn.addEventListener('click', hideComplaintPopup);
  complaintOverlay.addEventListener('click', (e) => {
    // Chỉ đóng khi click vào nền mờ, không phải click vào nội dung popup
    if (e.target === complaintOverlay) {
      hideComplaintPopup();
    }
  });

  // Xử lý gửi form khiếu nại (giữ nguyên logic này)
  complaintForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const order_id = complaintOrderIdInput.value;
    const title = complaintTitleInput.value.trim();
    const content = complaintContentInput.value.trim();

    if (!order_id || !title || !content) {
      alert("Vui lòng điền đầy đủ tiêu đề và nội dung khiếu nại.");
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await fetch('../../api/complaints.php', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ order_id, title, content })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("✅ Khiếu nại của bạn đã được gửi thành công!");
        hideComplaintPopup();
        if (userData && userData.id) {
          const userOrders = await fetchUserOrders(userData.id);
          displayOrders(userOrders);
        }
      } else {
        throw new Error(result.message || "Lỗi khi gửi khiếu nại.");
      }
    } catch (error) {
      console.error("Lỗi gửi khiếu nại:", error);
      alert("❌ Đã xảy ra lỗi khi gửi khiếu nại: " + error.message);
    }
  });

  // --- HÀM HIỂN THỊ ĐƠN HÀNG (ĐÃ SỬA HOÀN CHỈNH) ---
  function displayOrders(orders) {
    // 1. Lấy container chứa danh sách đơn hàng
    const orderListContainer = document.getElementById("orderList");
    if (!orderListContainer) return;

    // 2. Xử lý dữ liệu đầu vào (đảm bảo là mảng)
    if (!Array.isArray(orders)) orders = [];
    orderListContainer.innerHTML = ''; // Xóa nội dung cũ

    // 3. Nếu không có đơn hàng nào -> Hiện thông báo
    if (orders.length === 0) {
      orderListContainer.innerHTML = '<p class="text-center text-gray-500" style="padding: 20px;">Bạn chưa có đơn hàng nào.</p>';
      return;
    }

    // 4. Tạo khung bảng
    const table = document.createElement('table');
    table.className = 'orders-table';

    // 5. Tạo phần đầu bảng (Header)
    let tableContent = `
      <thead>
        <tr>
          <th>Mã đơn hàng</th>
          <th>Ngày đặt</th>
          <th>Sản phẩm</th>
          <th>Tổng tiền</th>
          <th>Trạng thái</th>
          <th>Ghi chú</th>
          <th>Khiếu nại</th>
        </tr>
      </thead>
      <tbody>`;

    // 6. Duyệt qua từng đơn hàng để tạo dòng (Body)
    // Sử dụng hàm map() để biến mỗi đơn hàng thành một chuỗi HTML <tr>
    const rows = orders.map(order => {
      // a) Xử lý ngày tháng
      const dateStr = order.created_at || order.CreatedAt; // Lấy ngày (chấp nhận cả chữ hoa/thường)
      const orderDate = dateStr ? new Date(dateStr) : new Date();
      const formattedDate = orderDate.toLocaleDateString('vi-VN') + ' ' + orderDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      // b) Xử lý danh sách sản phẩm
      let productsList = 'Chưa có sản phẩm';
      if (order.items && order.items.length > 0) {
        productsList = order.items.map(item =>
          `${item.product_name} (x${item.quantity})`
        ).join('<br>');
      }

      // c) Xử lý tổng tiền
      const amount = order.final_amount || order.FinalAmount || 0;
      const totalAmount = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount);

      // d) Xử lý trạng thái (màu sắc và chữ)
      const statusKey = order.order_status || order.OrderStatus || 'pending';
      const statusClass = getOrderStatusClass(statusKey); // Hàm helper có sẵn trong file của bạn
      const statusText = getVietnameseStatus(statusKey);  // Hàm helper có sẵn trong file của bạn

      // Trong hàm displayOrders của account.js

      // e) --- LOGIC QUAN TRỌNG: CHỌN NÚT KHIẾU NẠI ---
      let actionButton = '';

      if (order.complaint_id) {
        // ==> ĐÃ CÓ KHIẾU NẠI -> HIỆN NÚT "XEM"

        const complaintDataObj = {
          id: order.complaint_id,
          title: order.complaint_title,
          content: order.complaint_content,
          status: order.complaint_status,
          // Lấy trường resolution (đảm bảo API trả về đúng tên này)
          resolution: order.complaint_resolution || ''
        };

        // --- SỬA ĐỔI QUAN TRỌNG: Dùng encodeURIComponent để an toàn tuyệt đối ---
        // Không dùng JSON.stringify trực tiếp vào HTML vì dễ lỗi dấu ngoặc kép/xuống dòng
        const safeDataStr = encodeURIComponent(JSON.stringify(complaintDataObj));

        actionButton = `<button class="view-complaint-btn" data-complaint="${safeDataStr}">Xem Khiếu Nại</button>`;
      } else {
        // ==> CHƯA CÓ -> HIỆN NÚT "GỬI"
        const orderID = order.OrderID || order.order_id || order.id;
        actionButton = `<button class="complaint-btn" data-order-id="${orderID}">Khiếu Nại</button>`;
      }
      // Trả về HTML của một dòng trọn vẹn
      return `
            <tr>
              <td><strong>${order.order_code || order.OrderCode}</strong></td>
              <td>${formattedDate}</td>
              <td>${productsList}</td>
              <td><strong style="color: #2d5016;">${totalAmount}</strong></td>
              <td><span class="status-badge ${statusClass}">${statusText}</span></td>
              <td>${order.note || order.Note || ''}</td>
              <td>
                  ${actionButton}
              </td>
            </tr>
        `;
    });

    // 7. Nối tất cả các dòng lại và đóng thẻ tbody
    tableContent += rows.join('');
    tableContent += `</tbody>`;

    // 8. Đưa vào bảng và hiển thị ra màn hình
    table.innerHTML = tableContent;
    orderListContainer.appendChild(table);
  }

  const ORDER_STATUS_TEXT = {
    pending: 'Chờ xử lý',
    order_received: 'Đã nhận đơn',
    preparing: 'Đang chuẩn bị hàng',
    delivering: 'Đang giao hàng',
    delivery_successful: 'Giao hàng thành công',
    delivery_failed: 'Giao hàng thất bại',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao hàng',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy'
  };

  // Hàm giúp hiển thị trạng thái tiếng Việt
  function getVietnameseStatus(status) {
    return ORDER_STATUS_TEXT[status] || ORDER_STATUS_TEXT.pending;
  }

  // Hàm giúp thêm class CSS cho trạng thái
  function getOrderStatusClass(status) {
    const statusClassMap = {
      pending: 'status-pending',
      order_received: 'status-order_received',
      preparing: 'status-preparing',
      delivering: 'status-delivering',
      delivery_successful: 'status-delivery_successful',
      delivery_failed: 'status-delivery_failed',
      confirmed: 'status-confirmed',
      shipping: 'status-delivering',
      completed: 'status-delivery_successful',
      cancelled: 'status-cancelled'
    };
    return statusClassMap[status] || 'status-default';
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
          const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(dataToUpdate)
          });

          const result = await response.json(); // ✅ thêm dòng này
          if (!response.ok || !result.success) {
            throw new Error(result.message || `Lỗi cập nhật: ${response.status}`);
          }

          infoUpdated = true;

          const updatedUser = result.data?.user || result.data; // ✅ giờ mới có result

          // Lưu lại vào localStorage
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
          userData = updatedUser;

          // Cập nhật giao diện
          customerNameDisplay.textContent = updatedUser?.full_name || "(Chưa có tên)";
        } catch (error) {
          console.error("Lỗi cập nhật thông tin:", error);
          alert(`Lỗi cập nhật thông tin:\n${error.message}`);
          saveButton.disabled = false;
          saveButton.textContent = "Lưu thay đổi";
          return;
        }

      }

      // b) Đổi mật khẩu
      if (newPassword || confirmPassword || oldPassword) {
        if (!oldPassword) {
          alert("⚠️ Vui lòng nhập Mật khẩu hiện tại!");
          saveButton.disabled = false;
          saveButton.textContent = "Lưu thay đổi";
          return;
        }
        else if (newPassword.length < 6) {
          alert("❌ Mật khẩu mới phải có ít nhất 6 ký tự!");
          saveButton.disabled = false;
          saveButton.textContent = "Lưu thay đổi";
          return;
        }
        else if (newPassword !== confirmPassword) {
          alert("❌ Mật khẩu xác nhận không khớp!");
          saveButton.disabled = false;
          saveButton.textContent = "Lưu thay đổi";
          return;
        }
        else {
          console.log("Chuẩn bị gọi API đổi mật khẩu...");
          const passwordData = { oldPassword: oldPassword, newPassword: newPassword };
          try {
            const apiUrlChangePassword = `../../api/users.php/${userData.id}/change-password`;
            const responseChangePassword = await fetch(apiUrlChangePassword, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify(passwordData)
            });
            const resultChangePassword = await responseChangePassword.json();

            if (!responseChangePassword.ok || !resultChangePassword.success) {
              throw new Error(resultChangePassword.message || `Lỗi ${responseChangePassword.status}`);
            }

            passwordChanged = true;
            // Reset form mật khẩu
            document.getElementById("oldPassword").value = "";
            document.getElementById("newPassword").value = "";
            document.getElementById("confirmPassword").value = "";
          } catch (error) {
            console.error('Lỗi đổi mật khẩu:', error);
            alert(`❌ Lỗi đổi mật khẩu: ${error.message}`);
            saveButton.disabled = false;
            saveButton.textContent = "Lưu thay đổi";
            return;
          }
        }
      }

      // --- Thông báo kết quả ---
      if (infoUpdated || passwordChanged) {
        alert(`✅ ${infoUpdated ? 'Thông tin đã được cập nhật.' : ''} ${passwordChanged ? 'Mật khẩu đã được thay đổi.' : ''}`);
      } else if (!infoChanged && !oldPassword && !newPassword && !confirmPassword) {
        alert("ℹ️ Không có thay đổi nào để lưu.");
      }

      saveButton.disabled = false;
      saveButton.textContent = "Lưu thay đổi";
    });
  }

  // --- 4. XỬ LÝ SIDEBAR ---
  if (sidebarItems) {
    sidebarItems.forEach(item => {
      item.addEventListener("click", async () => {
        // ❌ Sai: document.querySelectorAll(".account-section").forEach(sec => sec.classList.add("hidden"));
        // ✅ Đúng:
        document.getElementById("personalInfoSection").classList.add("hidden");
        document.getElementById("orderHistorySection").classList.add("hidden");

        // Xóa active
        sidebarItems.forEach(el => el.classList.remove('active'));
        item.classList.add('active');

        const actionId = item.id;
        switch (actionId) {
          case "infoBtn":
            document.getElementById("personalInfoSection").classList.remove("hidden");
            break;

          case "ordersBtn":
            document.getElementById("orderHistorySection").classList.remove("hidden");
            if (userData && userData.id) {
              const userOrders = await fetchUserOrders(userData.id);
              displayOrders(userOrders);
            }
            break;

          case "logoutBtn":
            if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) logoutAndRedirect();
            break;

          default:
            document.getElementById("personalInfoSection").classList.remove("hidden");
            break;
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });




    // Mặc định kích hoạt mục "Thông tin cá nhân" khi tải trang
    const initialActiveItem = document.getElementById("infoBtn");
    if (initialActiveItem) {
      initialActiveItem.classList.add('active');
      document.getElementById("personalInfoSection").classList.remove("hidden");
    }
  }

  // === 5. GỌI HÀM XỬ LÝ NAVBAR (CUỐI CÙNG) ===
  handleUserDisplay();

}); // <-- Đây là dấu đóng của DOMContentLoaded chính

// ====== API & LỌC SẢN PHẨM ======
const API_BASE = "../../api/products_c.php";

function initProductFilter() {
  const categorySelect = document.getElementById("categorySelect");
  const priceSelect = document.getElementById("priceSelect");
  const filterButton = document.getElementById("filterButton");
  const grid = document.getElementById("filteredProducts"); // ✅ chỉ render vào vùng mới
  if (!categorySelect || !priceSelect || !filterButton || !grid) return;

  // 🔹 Lấy danh mục từ API
  fetch(`${API_BASE}?categories=1`)
    .then(res => res.json())
    .then(data => {
      if (data.success && data.categories) {
        data.categories.forEach(cat => {
          const opt = document.createElement("option");
          opt.value = cat.CategoryName;
          opt.textContent = cat.CategoryName;
          categorySelect.appendChild(opt);
        });
      }
    });

  // 🔹 Hàm tải và lọc sản phẩm
  async function loadProducts() {
    const res = await fetch(API_BASE);
    const data = await res.json();
    if (!data.success) return;

    let filtered = data.products;
    const category = categorySelect.value;
    const price = priceSelect.value;

    if (category) filtered = filtered.filter(p => p.CategoryName === category);

    filtered = filtered.filter(p => {
      const priceNum = parseFloat(p.Price);
      if (price === "duoi500") return priceNum < 500000;
      if (price === "500-700") return priceNum >= 500000 && priceNum <= 700000;
      if (price === "tren700") return priceNum > 700000;
      return true;
    });

    grid.innerHTML = "";
    if (!filtered.length) {
      grid.innerHTML = "<p>Không có sản phẩm phù hợp.</p>";
      return;
    }

    filtered.forEach(p => {
      const card = `
        <div class="product-card" data-id="${p.ProductID}">
          <div class="product-image-container">
            <a href="../product/product.html?id=${p.ProductID}" class="product-item">
              <img src="../../${p.ImageURL}" alt="${p.ProductName}" class="product-image">
            </a>
          </div>
          <div class="product-info">
            <h3 class="product-name">${p.ProductName}</h3>
            <p class="product-price">${Number(p.Price).toLocaleString()} VNĐ</p>
          </div>
        </div>`;
      grid.insertAdjacentHTML("beforeend", card);
    });

    // Re-bind navigation sau khi render
    bindProductCardNavigation();
  }
}

// ===== HIỆN/ẨN Ô LỌC NHỎ =====
document.addEventListener("DOMContentLoaded", () => {
  const filterToggleBtn = document.querySelector(".filter-btn"); // nút "Lọc" trên thanh tìm kiếm
  const filterPopup = document.querySelector(".filter-popup");

  if (filterToggleBtn && filterPopup) {
    filterToggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      filterPopup.classList.toggle("show");
    });

    // Ẩn khi click ra ngoài
    document.addEventListener("click", (e) => {
      if (!filterPopup.contains(e.target) && !filterToggleBtn.contains(e.target)) {
        filterPopup.classList.remove("show");
      }
    });
  }
});

// ===== HIỂN THỊ POPUP =====
function showPopup(products) {
  const overlay = document.getElementById("overlay");
  const popupProducts = document.getElementById("popupProducts");
  if (!overlay || !popupProducts) return;

  popupProducts.innerHTML = "";

  if (!products || !products.length) {
    popupProducts.innerHTML = "<p>Không tìm thấy sản phẩm phù hợp.</p>";
  } else {
    products.forEach(p => {
      popupProducts.insertAdjacentHTML("beforeend", `
        <div class="product-card" data-id="${p.ProductID}">
          <div class="product-image-container">
            <a href="../product/product.html?id=${p.ProductID}" class="product-item">
              <img src="../../${p.ImageURL}" alt="${p.ProductName}" class="product-image">
            </a>
          </div>
          <div class="product-info">
            <h3 class="product-name">${p.ProductName}</h3>
            <p class="product-price">${Number(p.Price).toLocaleString()} VNĐ</p>
          </div>
        </div>
      `);
    });
  }

  overlay.classList.remove("hidden");

  // Re-bind navigation sau khi render popup
  bindProductCardNavigation();
}

// ===== HIỂN THỊ KẾT QUẢ TRÊN NỀN MỜ =====

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("overlay");
  const popupProducts = document.getElementById("popupProducts");
  const closePopupBtn = document.querySelector(".close-popup");

  const categorySelect = document.getElementById("categorySelect");
  const priceSelect = document.getElementById("priceSelect");
  const applyFilterBtn = document.getElementById("filterButton");

  // ===== ẨN POPUP =====
  function hidePopup() {
    overlay.classList.add("hidden");
  }

  // Nút đóng popup
  closePopupBtn.addEventListener("click", hidePopup);

  // Click ra ngoài cũng tắt
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) hidePopup();
  });

  // ===== SỰ KIỆN LỌC =====
  if (applyFilterBtn) {
    applyFilterBtn.addEventListener("click", async () => {
      const category = categorySelect.value;
      const price = priceSelect.value;
      let min = 0, max = 99999999;

      if (price === "duoi500") max = 500000;
      if (price === "500-700") { min = 500000; max = 700000; }
      if (price === "tren700") min = 700000;

      const res = await fetch(`${API_BASE}?category=${encodeURIComponent(category)}&min=${min}&max=${max}`);
      const data = await res.json();
      showPopup(data.products);
    });
  }
});

// ====== TÌM KIẾM & HIỂN THỊ KẾT QUẢ TRÊN NỀN MỜ ======
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("overlay");
  const popupProducts = document.getElementById("popupProducts");
  const closePopupBtn = document.querySelector(".close-popup");
  const searchIcon = document.querySelector(".nav-search");
  const searchBar = document.querySelector(".search-bar");
  const searchInput = document.getElementById("searchInput");

  // Reset popup và thanh tìm kiếm khi load trang mới
  if (overlay) {
    overlay.classList.add("hidden");
  }
  if (searchBar) {
    searchBar.classList.remove("show");
    document.body.classList.remove("searching");
  }

  // ===== Hiện/ẩn thanh tìm kiếm =====
  if (searchIcon && searchBar) {
    searchIcon.addEventListener("click", (e) => {
      e.preventDefault();
      searchBar.classList.toggle("show");
      document.body.classList.toggle("searching");
    });

    document.addEventListener("click", (e) => {
      if (!searchBar.contains(e.target) && !searchIcon.contains(e.target)) {
        searchBar.classList.remove("show");
        document.body.classList.remove("searching");
      }
    });
  }

  // ===== Hiển thị popup sản phẩm =====
  function showPopup(products) {
    if (!overlay || !popupProducts) return;

    popupProducts.innerHTML = "";

    if (!products || !products.length) {
      popupProducts.innerHTML = "<p>Không tìm thấy sản phẩm phù hợp.</p>";
    } else {
      products.forEach(p => {
        const card = `
          <div class="product-card">
            <div class="product-image-container">
              <a href="../product/product.html?id=${p.ProductID}" class="product-item">
                <img src="../../${p.ImageURL}" alt="${p.ProductName}" class="product-image">
              </a>
            </div>
            <div class="product-info">
              <h3 class="product-name">${p.ProductName}</h3>
              <p class="product-price">${Number(p.Price).toLocaleString()} VNĐ</p>
            </div>
          </div>`;
        popupProducts.insertAdjacentHTML("beforeend", card);
      });
    }
    overlay.classList.remove("hidden");

    // Đảm bảo popup luôn căn giữa
    const popupContainer = document.querySelector(".popup-container");
    if (popupContainer) {
      popupContainer.style.margin = "auto";
    }
  }

  // ===== Đóng popup =====
  function hidePopup() {
    overlay.classList.add("hidden");
    // Ẩn thanh tìm kiếm khi đóng popup
    if (searchBar) {
      searchBar.classList.remove("show");
      document.body.classList.remove("searching");
    }
  }
  if (closePopupBtn) {
    closePopupBtn.addEventListener("click", hidePopup);
  }
  overlay.addEventListener("click", (e) => { if (e.target === overlay) hidePopup(); });

  // Đóng popup khi click vào link sản phẩm trong popup
  document.addEventListener("click", (e) => {
    if (e.target.closest(".product-item")) {
      hidePopup();
    }
  });

  // Hàm tìm kiếm
  async function performSearch() {
    // Lấy lại searchInput để đảm bảo có giá trị mới nhất
    const currentSearchInput = document.getElementById("searchInput");
    const keyword = currentSearchInput ? currentSearchInput.value.trim() : "";

    if (!keyword) {
      alert("Vui lòng nhập từ khóa tìm kiếm");
      return;
    }

    const url = `${API_BASE}?search=${encodeURIComponent(keyword)}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log("Search response:", data); // Debug log

      // Xử lý response từ products_c.php (format: {success: true, products: [...]})
      let products = [];
      if (data.success && data.products) {
        products = data.products;
      } else if (Array.isArray(data)) {
        products = data;
      } else if (data.data && data.data.products) {
        products = data.data.products;
      }

      // Chuyển đổi snake_case thành PascalCase nếu cần
      products = products.map(p => ({
        ProductID: p.ProductID || p.product_id,
        ProductName: p.ProductName || p.product_name,
        Price: p.Price || p.price,
        ImageURL: p.ImageURL || p.image_url
      }));

      showPopup(products);
    } catch (err) {
      console.error("❌ Lỗi tìm kiếm:", err);
      alert("Không thể tìm kiếm. Vui lòng thử lại sau.\n" + err.message);
    }
  }

  // ===== Gọi API khi nhấn Enter trong ô tìm kiếm =====
  if (searchInput) {
    searchInput.addEventListener("keypress", async (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); // ✅ Ngăn hành vi mặc định chuyển trang
        e.stopPropagation(); // ✅ Ngăn chồng sự kiện khác
        await performSearch();
      }
    });
  }

  // ===== Gọi API khi nhấn nút dấu tích =====
  const searchSubmitBtn = document.getElementById("searchSubmitBtn");
  if (searchSubmitBtn) {
    searchSubmitBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await performSearch();
    });
  }
});

// ✅ Ghi đè hành vi tìm kiếm của main.js chỉ trên trang Home
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector(".search-bar input");

  if (searchInput) {
    // Xóa toàn bộ sự kiện keypress cũ mà main.js đã gắn
    const newInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newInput, searchInput);

    // Gắn lại sự kiện tìm kiếm theo logic của bạn
    newInput.addEventListener("keypress", async (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); // ❌ chặn chuyển hướng từ main.js
        const keyword = e.target.value.trim();
        if (!keyword) return;

        const url = `${API_BASE}?search=${encodeURIComponent(keyword)}`;
        try {
          const res = await fetch(url);
          const data = await res.json();

          // Hiện kết quả trên popup (hàm showPopup bạn đã có)
          if (typeof showPopup === "function") {
            showPopup(data.products);
          } else {
            alert("Không tìm thấy sản phẩm hoặc showPopup chưa được định nghĩa.");
          }
        } catch (err) {
          console.error("❌ Lỗi tìm kiếm:", err);
        }
      }
    });
  }
});
// ====== GỌI VÀ HIỂN THỊ DANH MỤC SẢN PHẨM (THIẾT LẬP VÀ GỌI HÀM) ======
async function fetchAndRenderCategories() {
  try {
    const res = await fetch(`${API_BASE}?categories=1`);
    const data = await res.json();
    if (!data.success || !data.categories) return;

    // 1) Điền vào select (ô lọc)
    const categorySelect = document.getElementById("categorySelect");
    if (categorySelect) {
      // để 1 option mặc định (tất cả)
      categorySelect.innerHTML = '<option value="">Tất cả</option>';
      data.categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.CategoryName || cat.Category; // tùy API trả về key
        opt.textContent = cat.CategoryName || cat.CategoryName;
        categorySelect.appendChild(opt);
      });
    }

    // 2) Hiển thị ở sidebar / danh mục (nếu có element .category-list)
    const categoryList = document.querySelector(".category-list");
    if (categoryList) {
      categoryList.innerHTML = ''; // clear trước khi render
      // thêm item "Tất cả"
      categoryList.insertAdjacentHTML('beforeend', `<li><a href="#" data-cat="">Tất cả</a></li>`);
      data.categories.forEach(cat => {
        const name = cat.CategoryName || cat.Category;
        const item = `<li><a href="#" data-cat="${encodeURIComponent(name)}">${name}</a></li>`;
        categoryList.insertAdjacentHTML('beforeend', item);
      });

      // bind click cho các link category (lọc ngay khi click)
      categoryList.querySelectorAll('a[data-cat]').forEach(a => {
        a.addEventListener('click', async (e) => {
          e.preventDefault();
          const cat = decodeURIComponent(a.dataset.cat || '');
          // nếu bạn muốn chuyển tới trang lọc riêng, thay đổi href ở trên thành link phù hợp
          // Ở đây sẽ gọi API và show kết quả popup hoặc render vào khu vực filteredProducts nếu có
          try {
            const min = 0, max = 99999999;
            const url = `${API_BASE}?category=${encodeURIComponent(cat)}&min=${min}&max=${max}`;
            const r = await fetch(url);
            const json = await r.json();
            // nếu bạn có vùng filteredProducts: render trực tiếp
            const grid = document.getElementById("filteredProducts");
            if (grid) {
              grid.innerHTML = "";
              const list = json.products || [];
              if (!list.length) { grid.innerHTML = "<p>Không có sản phẩm phù hợp.</p>"; return; }
              list.forEach(p => {
                const card = `
                  <div class="product-card" data-id="${p.ProductID}">
                    <div class="product-image-container">
                      <a href="../product/product.html?id=${p.ProductID}" class="product-item">
                        <img src="../../${p.ImageURL}" alt="${p.ProductName}" class="product-image">
                      </a>
                    </div>
                    <div class="product-info">
                      <h3 class="product-name">${p.ProductName}</h3>
                      <p class="product-price">${Number(p.Price).toLocaleString()} VNĐ</p>
                    </div>
                  </div>`;
                grid.insertAdjacentHTML("beforeend", card);
              });
              // rebind navigation nếu cần
              if (typeof bindProductCardNavigation === "function") bindProductCardNavigation();
            } else {
              // nếu không có grid, show popup (nếu bạn muốn)
              if (typeof showPopup === "function") {
                showPopup(json.products || []);
              }
            }
          } catch (err) {
            console.error("Lỗi khi lọc theo category:", err);
          }
        });
      });
    }
  } catch (err) {
    console.error("Lỗi fetch categories:", err);
  }
}

// ====== KHỞI TẠO KHI DOM CONTENT LOADED: gọi các hàm cần thiết ======
document.addEventListener("DOMContentLoaded", () => {
  // Gọi initProductFilter (nếu bạn muốn khởi tạo phần lọc đã viết)
  if (typeof initProductFilter === "function") initProductFilter();

  // Gọi fetchAndRenderCategories để load danh mục vào select + sidebar
  fetchAndRenderCategories();
});

// =========================================================
// LOGIC XỬ LÝ POPUP XEM CHI TIẾT KHIẾU NẠI (ĐÃ SỬA LỖI HIỂN THỊ)
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  const viewOverlay = document.getElementById("viewComplaintOverlay");
  const closeViewBtn = document.getElementById("closeViewComplaintPopup");
  const orderListContainer = document.getElementById("orderList");

  // Hàm đóng popup
  const closeViewPopup = () => {
    if (viewOverlay) {
      viewOverlay.classList.remove('show');
      setTimeout(() => {
        viewOverlay.classList.add('hidden');
      }, 300);
    }
  };

  // 1. Bắt sự kiện Click
  if (orderListContainer) {
    orderListContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('view-complaint-btn')) {
        e.preventDefault();

        try {
          // --- GIẢI MÃ DỮ LIỆU AN TOÀN ---
          const rawData = e.target.dataset.complaint;
          // Dùng decodeURIComponent để giải mã chuỗi đã mã hóa ở trên
          const data = JSON.parse(decodeURIComponent(rawData));

          console.log("Dữ liệu khiếu nại xem được:", data); // Debug xem có resolution không

          // --- ĐIỀN DỮ LIỆU ---
          const titleEl = document.getElementById("viewComplaintTitle");
          if (titleEl) titleEl.textContent = data.title || '(Không có tiêu đề)';

          const contentEl = document.getElementById("viewComplaintContent");
          if (contentEl) contentEl.textContent = data.content || '';

          // Trạng thái
          const statusEl = document.getElementById("viewComplaintStatus");
          if (statusEl) {
            const statusMap = {
              'pending': 'Đang chờ xử lý',
              'processing': 'Đang xử lý',
              'resolved': 'Đã giải quyết',
              'rejected': 'Đã từ chối',
              'closed': 'Đã đóng'
            };
            statusEl.textContent = statusMap[data.status] || data.status;
            statusEl.className = '';
            statusEl.classList.add('status-badge'); // Thêm class gốc
            statusEl.classList.add('status-' + (data.status || 'unknown'));
          }

          // --- XỬ LÝ PHẦN PHẢN HỒI (RESOLUTION) ---
          const resEl = document.getElementById("viewComplaintResolution");
          if (resEl) {
            // Kiểm tra kỹ dữ liệu resolution
            if (data.resolution && data.resolution.trim() !== "") {
              // Thay thế xuống dòng \n thành thẻ <br> để hiển thị đẹp
              resEl.innerHTML = data.resolution.replace(/\n/g, '<br>');
              resEl.style.fontStyle = 'normal';
              resEl.style.color = '#2d5016'; // Màu xanh đậm
            } else {
              resEl.textContent = 'Cửa hàng đang xem xét và sẽ phản hồi sớm nhất.';
              resEl.style.fontStyle = 'italic';
              resEl.style.color = '#888'; // Màu xám nhạt
            }
          }

          // Hiện Popup
          if (viewOverlay) {
            viewOverlay.classList.remove('hidden');
            setTimeout(() => {
              viewOverlay.classList.add('show');
            }, 10);
          }

        } catch (error) {
          console.error("Lỗi hiển thị popup:", error);
          alert("Có lỗi khi mở chi tiết. Vui lòng thử lại.");
        }
      }
    });
  }

  // Sự kiện đóng
  if (closeViewBtn) closeViewBtn.addEventListener('click', closeViewPopup);
  if (viewOverlay) {
    viewOverlay.addEventListener('click', (e) => {
      if (e.target === viewOverlay) closeViewPopup();
    });
  }
});