// order.js - PHIÊN BẢN HOÀN CHỈNH VỚI MODAL VÀ TIẾNG VIỆT

let allOrders = [];
let pendingUpdate = null;
let currentDisplayedOrderId = null; // Lưu ID đơn hàng đang hiển thị

// Map trạng thái sang tiếng Việt (dùng chung cho toàn bộ app)
const STATUS_MAP = {
    pending: 'Chờ xử lý',
    received: 'Đã nhận đơn',
    shipping: 'Đang giao',
    success: 'Giao hàng thành công',
    failed: 'Giao hàng thất bại'
};

// Map phương thức thanh toán sang tiếng Việt
const PAYMENT_METHOD_MAP = {
    cod: 'Tiền mặt (COD)',
    bank_transfer: 'Chuyển khoản',
    momo: 'MoMo',
    zalopay: 'ZaloPay',
    vnpay: 'VNPay'
};

document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
    setupEventListeners();
    setupModalListeners();
});

function setupEventListeners() {
    document.querySelectorAll('.filters input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });

    document.getElementById('orders-table-body').addEventListener('click', handleTableViewClick);

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
}

function setupModalListeners() {
    const modal = document.getElementById('confirmationModal');
    const cancelBtn = document.getElementById('cancelUpdateBtn');
    const confirmBtn = document.getElementById('confirmUpdateBtn');

    cancelBtn.addEventListener('click', () => {
        closeModal();
        if (pendingUpdate && pendingUpdate.type === 'status') {
            const selectElement = document.querySelector(`select[data-order-id="${pendingUpdate.orderId}"]`);
            if (selectElement) {
                const order = allOrders.find(o => o.order_id == pendingUpdate.orderId);
                if (order) {
                    selectElement.value = order.order_status;
                }
            }
        }
        pendingUpdate = null;
    });

    confirmBtn.addEventListener('click', () => {
        if (pendingUpdate) {
            closeModal();
            updateOrderData(pendingUpdate.orderId, pendingUpdate.field, pendingUpdate.value);
            pendingUpdate = null;
        }
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            cancelBtn.click();
        }
    });
}

function showModal(title, message) {
    const modal = document.getElementById('confirmationModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');

    modalTitle.textContent = title;
    modalMessage.textContent = message;

    modal.classList.add('visible');
}

function closeModal() {
    const modal = document.getElementById('confirmationModal');
    modal.classList.remove('visible');
}

function handleTableViewClick(e) {
    const target = e.target;
    const row = target.closest('tr');
    if (!row || !row.dataset.orderInfo) return;

    if (target.tagName === 'SELECT' || target.tagName === 'INPUT') {
        return;
    }

    const orderData = JSON.parse(row.dataset.orderInfo);
    currentDisplayedOrderId = orderData.order_id; // Lưu ID đơn hàng đang xem
    displayOrderDetails(orderData);

    if (target.classList.contains('view-icon') || target.closest('.view-icon')) {
        e.preventDefault();
        document.querySelector('.order-info-display').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

async function fetchOrders() {
    console.log("Đang gọi API để lấy danh sách đơn hàng...");
    try {
        const token = localStorage.getItem('jwtToken') || 'demo';

        const response = await fetch('../../api/orders.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            let errorData;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                errorData = await response.json();
                throw new Error(`Lỗi HTTP: ${response.status}. Chi tiết: ${errorData.message || JSON.stringify(errorData)}`);
            } else {
                errorData = await response.text();
                throw new Error(`Lỗi HTTP: ${response.status}. Chi tiết: ${errorData}`);
            }
        }

        const result = await response.json();
        console.log("Dữ liệu nhận được từ API:", result);

        if (result.success && result.data && Array.isArray(result.data.orders)) {
            allOrders = result.data.orders;
            console.log(`Tải thành công ${allOrders.length} đơn hàng.`);
        } else {
            allOrders = [];
            console.error('Lỗi khi lấy dữ liệu: ', result.message || 'API trả về cấu trúc không mong đợi', result);
        }

        applyFilters();

    } catch (error) {
        console.error('Đã xảy ra lỗi nghiêm trọng khi lấy dữ liệu đơn hàng:', error);
        const tableBody = document.getElementById('orders-table-body');
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Không thể tải dữ liệu đơn hàng. Vui lòng kiểm tra lại kết nối hoặc liên hệ quản trị viên. Lỗi: ${error.message}</td></tr>`;
    }
}

function applyFilters() {
    const filterStatusMap = {
        'filter-pending': 'pending',
        'filter-received': 'received',
        'filter-shipping': 'shipping',
        'filter-success': 'success',
        'filter-failed': 'failed'
    };

    const selectedStatuses = Array.from(document.querySelectorAll('.filters input:checked'))
        .map(cb => filterStatusMap[cb.id])
        .filter(Boolean);

    const searchTerm = document.getElementById('search-input').value.toLowerCase();

    const filteredOrders = allOrders.filter(order => {
        const orderStatus = order.order_status || 'pending';
        const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(orderStatus);
        const searchMatch = !searchTerm ||
            (order.order_code && order.order_code.toLowerCase().includes(searchTerm)) ||
            (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm));

        return statusMatch && searchMatch;
    });

    console.log(`Đang lọc: Trạng thái [${selectedStatuses.join(', ')}], Tìm kiếm "${searchTerm}". Kết quả: ${filteredOrders.length} đơn hàng.`);
    renderOrderList(filteredOrders);
}

function renderOrderList(orders) {
    const tableBody = document.getElementById('orders-table-body');
    tableBody.innerHTML = '';

    if (orders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Không có đơn hàng nào phù hợp.</td></tr>`;
        return;
    }

    orders.forEach(order => {
        const row = document.createElement('tr');
        row.dataset.orderInfo = JSON.stringify(order);
        const orderId = order.order_id;
        const currentStatus = order.order_status || 'pending';
        const currentNote = order.note || '';

        let statusOptionsHTML = '';
        for (const key in STATUS_MAP) {
            statusOptionsHTML += `<option value="${key}" ${key === currentStatus ? 'selected' : ''}>${STATUS_MAP[key]}</option>`;
        }

        const statusSelectHTML = `
            <select class="table-status-select" data-order-id="${orderId}" onchange="handleStatusChange(this)">
                ${statusOptionsHTML}
            </select>
        `;

        const noteInputHTML = `
            <input type="text" class="table-note-input" data-order-id="${orderId}" value="${currentNote.replace(/"/g, '&quot;')}" placeholder="Thêm ghi chú..." onblur="handleNoteChange(this)">
        `;

        row.innerHTML = `
            <td>${order.order_code || orderId}</td>
            <td>${order.customer_name}</td>
            <td>${new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
            <td>${new Intl.NumberFormat('vi-VN').format(order.final_amount)} VND</td>
            <td>${statusSelectHTML}</td>
            <td>${noteInputHTML}</td>
            <td><a href="#" class="view-icon"><i class="fas fa-eye"></i></a></td>
        `;
        tableBody.appendChild(row);
    });
}

// Hàm hiển thị chi tiết đơn hàng (PHIÊN BẢN SỬA LỖI HIỂN THỊ TRẠNG THÁI)
function displayOrderDetails(order) {
    console.log("Hiển thị chi tiết cho đơn hàng:", order); // Log để kiểm tra dữ liệu đầu vào

    // Cập nhật các trường thông tin cơ bản (giữ nguyên)
    document.getElementById('detail-order-id').textContent = order.order_code || order.order_id;
    document.getElementById('detail-customer-name').textContent = order.customer_name || 'Chưa có';
    document.getElementById('detail-phone').textContent = order.customer_phone || 'Chưa có';

    // Ghép địa chỉ đầy đủ (giữ nguyên)
    let fullAddress = [];
    if (order.shipping_address) fullAddress.push(order.shipping_address);
    if (order.ward) fullAddress.push(order.ward);
    if (order.district) fullAddress.push(order.district);
    if (order.city) fullAddress.push(order.city);
    document.getElementById('detail-address').textContent = fullAddress.join(', ') || 'Chưa có';

    document.getElementById('detail-date').textContent = new Date(order.created_at).toLocaleString('vi-VN');
    document.getElementById('detail-total').textContent = `${new Intl.NumberFormat('vi-VN').format(order.final_amount)} VND`;

    // Chuyển phương thức thanh toán sang tiếng Việt (giữ nguyên)
    const paymentMethod = PAYMENT_METHOD_MAP[order.payment_method] || order.payment_method || 'Chưa rõ';
    document.getElementById('detail-payment-method').textContent = paymentMethod;

    // === PHẦN CẬP NHẬT TRẠNG THÁI VÀ GHI CHÚ (SỬA LỖI) ===
    const statusSpan = document.getElementById('detail-current-status');
    const noteSpan = document.getElementById('detail-current-note');

    // 1. Lấy key trạng thái từ đơn hàng (ví dụ: 'pending', 'received'...)
    const statusKey = order.order_status || 'pending';

    // 2. Tra cứu text tiếng Việt từ STATUS_MAP
    // Nếu không tìm thấy key trong map, sẽ hiển thị key gốc (ví dụ: 'Preparing') hoặc 'Không xác định'
    const statusTextVietnamese = STATUS_MAP[statusKey] || statusKey || 'Không xác định';

    // 3. Cập nhật text và class cho statusSpan
    statusSpan.textContent = statusTextVietnamese; // Luôn hiển thị tiếng Việt (hoặc key gốc nếu không có dịch)
    statusSpan.className = `status-badge status-${statusKey || 'unknown'}`; // Đặt class CSS dựa trên key gốc
    console.log(`Trạng thái đơn hàng: Key='${statusKey}', Text='${statusTextVietnamese}', Class='${statusSpan.className}'`); // Log để kiểm tra

    // Cập nhật ghi chú (giữ nguyên)
    if (order.note && order.note.trim() !== '') {
        noteSpan.textContent = order.note;
        noteSpan.style.fontStyle = 'normal';
        noteSpan.style.color = '#555';
    } else {
        noteSpan.textContent = '(Không có ghi chú)';
        noteSpan.style.fontStyle = 'italic';
        noteSpan.style.color = '#999';
    }
    // === KẾT THÚC SỬA LỖI ===
}

function handleStatusChange(selectElement) {
    const orderId = selectElement.dataset.orderId;
    const newStatus = selectElement.value;
    const statusText = STATUS_MAP[newStatus];

    console.log(`Đã chọn trạng thái mới: ${newStatus} (${statusText}) cho đơn hàng ID: ${orderId}`);

    pendingUpdate = {
        orderId: orderId,
        field: 'status',
        value: newStatus,
        type: 'status'
    };

    showModal(
        'Xác nhận cập nhật trạng thái',
        `Bạn có chắc chắn muốn chuyển trạng thái đơn hàng sang "${statusText}"?`
    );
}

function handleNoteChange(inputElement) {
    const orderId = inputElement.dataset.orderId;
    const newNote = inputElement.value.trim();
    const order = allOrders.find(o => o.order_id == orderId);
    const oldNote = order ? (order.note || '') : '';

    if (newNote !== oldNote) {
        console.log(`Thay đổi ghi chú đơn ${orderId} thành: "${newNote}" (Ghi chú cũ: "${oldNote}")`);

        pendingUpdate = {
            orderId: orderId,
            field: 'note',
            value: newNote,
            type: 'note'
        };

        showModal(
            'Xác nhận cập nhật ghi chú',
            `Bạn có chắc chắn muốn cập nhật ghi chú cho đơn hàng này?`
        );
    } else {
        console.log(`Ghi chú đơn ${orderId} không thay đổi.`);
    }
}

// Hàm gọi API để cập nhật trạng thái hoặc ghi chú (PHIÊN BẢN SỬA LỖI CẬP NHẬT CHI TIẾT)
async function updateOrderData(orderId, field, value) {
    const endpoint = `../../api/orders.php/${orderId}`;
    const method = 'PUT';
    const dataToUpdate = {};
    if (field === 'status') { dataToUpdate.order_status = value; }
    else if (field === 'note') { dataToUpdate.note = value; }
    else { console.error("Trường cập nhật không hợp lệ:", field); return; }

    console.log("Dữ liệu gửi lên API:", JSON.stringify(dataToUpdate));

    try {
        const token = localStorage.getItem('jwtToken') || 'demo';
        const response = await fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dataToUpdate)
        });

        const contentType = response.headers.get("content-type");
        if (!response.ok) {
            let errorText;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const errorJson = await response.json();
                errorText = errorJson.message || JSON.stringify(errorJson);
            } else {
                errorText = await response.text();
            }
            throw new Error(`Lỗi HTTP ${response.status}: ${errorText}`);
        }

        if (contentType && contentType.indexOf("application/json") !== -1) {
            const result = await response.json();
            console.log("Kết quả API:", result);

            if (result.success) {
                console.log(`Cập nhật ${field} thành công cho đơn hàng ${orderId}`);

                // 1. Cập nhật dữ liệu trong mảng allOrders ở client
                const index = allOrders.findIndex(o => o.order_id == orderId); // Dùng == vì ID từ dataset có thể là string
                let updatedOrderData = null; // Biến để lưu trữ dữ liệu mới nhất
                if (index !== -1) {
                    if (field === 'status') {
                        allOrders[index].order_status = value;
                    } else if (field === 'note') {
                        allOrders[index].note = value;
                    }
                    updatedOrderData = allOrders[index]; // Lấy dữ liệu đã cập nhật
                } else {
                    console.warn("Không tìm thấy đơn hàng trong allOrders để cập nhật dữ liệu cục bộ.");
                    // Cân nhắc gọi fetchOrders() nếu muốn đảm bảo đồng bộ tuyệt đối
                }

                // 2. Render lại bảng (dùng applyFilters để giữ bộ lọc/tìm kiếm)
                applyFilters();

                // 3. *** KIỂM TRA VÀ CẬP NHẬT LẠI PHẦN CHI TIẾT ***
                const displayedOrderIdElement = document.getElementById('detail-order-id');
                const displayedOrderIdText = displayedOrderIdElement ? displayedOrderIdElement.textContent : null; // Lấy ID/Code đang hiển thị

                // Lấy code (hoặc ID nếu không có code) của đơn hàng vừa cập nhật
                const updatedOrderCodeOrId = updatedOrderData ? (updatedOrderData.order_code || updatedOrderData.order_id.toString()) : null;

                console.log("Kiểm tra cập nhật chi tiết: Đang hiển thị:", displayedOrderIdText, "|| Vừa cập nhật:", updatedOrderCodeOrId);

                // So sánh ID hoặc Code đang hiển thị với ID/Code của đơn vừa cập nhật
                if (updatedOrderData && displayedOrderIdText && (displayedOrderIdText == orderId || displayedOrderIdText == updatedOrderCodeOrId)) {
                    console.log("-> Cần cập nhật chi tiết đơn hàng đang hiển thị...");
                    displayOrderDetails(updatedOrderData); // Gọi lại displayOrderDetails với dữ liệu MỚI NHẤT
                } else {
                    console.log("-> Không cần cập nhật chi tiết (đơn khác đang hiển thị).");
                }
                // *** KẾT THÚC KIỂM TRA VÀ CẬP NHẬT CHI TIẾT ***


                showSuccessToast(`Cập nhật ${field === 'status' ? 'trạng thái' : 'ghi chú'} thành công!`);
            } else {
                alert('Cập nhật thất bại: ' + result.message);
                fetchOrders(); // Tải lại nếu API báo lỗi
            }
        } else {
            const textResult = await response.text();
            throw new Error("Phản hồi từ server không phải JSON: " + textResult);
        }

    } catch (error) { // Bắt các lỗi
        console.error(`Lỗi nghiêm trọng khi cập nhật ${field} cho đơn ${orderId}:`, error);
        alert(`Đã xảy ra lỗi khi cập nhật ${field === 'status' ? 'trạng thái' : 'ghi chú'}. ${error.message}. Vui lòng thử lại.`);
        fetchOrders(); // Tải lại nếu có lỗi mạng hoặc parse
    }
}

// Hàm hiển thị thông báo thành công (tùy chọn)
function showSuccessToast(message) {
    // Tạo element thông báo
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background-color: #155724;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 9999;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        font-weight: 500;
        animation: slideInUp 0.3s ease;
    `;

    document.body.appendChild(toast);

    // Tự động xóa sau 3 giây
    setTimeout(() => {
        toast.style.animation = 'slideOutDown 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Thay thế TOÀN BỘ đoạn code "Logic cho User Icon Dropdown" cũ bằng đoạn này
// Thêm vào cuối file order.js VÀ complaint.js

// --- Logic cho User Icon Dropdown (Cập nhật: Trang chủ cũng đăng xuất) ---
document.addEventListener('DOMContentLoaded', () => {
    const userIconDiv = document.querySelector('.nav-user-icon');
    const userMenu = document.querySelector('.user-menu');
    const logoutButton = document.getElementById('logoutButton');
    const homeLink = userMenu ? userMenu.querySelector('a[href*="home.html"]') : null; // Tìm link Trang chủ

    if (userIconDiv && userMenu) {
        // Hiện/ẩn menu khi bấm vào icon
        userIconDiv.addEventListener('click', (event) => {
            event.stopPropagation();
            userMenu.classList.remove('hidden');
            setTimeout(() => {
                userMenu.classList.toggle('visible');
            }, 0);
        });

        // Ẩn menu khi bấm ra ngoài
        document.addEventListener('click', (event) => {
            if (userIconDiv && !userIconDiv.contains(event.target) && userMenu.classList.contains('visible')) {
                userMenu.classList.remove('visible');
            }
        });
    }

    // --- HÀM ĐĂNG XUẤT (Tách ra để dùng chung) ---
    function performLogout(redirectUrl) {
         if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
            console.log("Đang đăng xuất...");
            localStorage.removeItem('currentUser');
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('rememberMe');

            alert("Bạn đã đăng xuất thành công.");
            // Chuyển hướng đến URL được cung cấp
            window.location.href = redirectUrl;
        }
    }
    // --- KẾT THÚC HÀM ĐĂNG XUẤT ---

    // Xử lý nút Đăng xuất (nhấn nút)
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Gọi hàm đăng xuất và chuyển về trang login
            performLogout('../../pages/login/login.html'); // Chuyển về trang đăng nhập
        });
    }

    // (SỬA) Xử lý link Trang chủ (nhấn link)
    if (homeLink) {
        homeLink.addEventListener('click', (event) => {
            event.preventDefault(); // Ngăn chuyển trang ngay lập tức
            // Gọi hàm đăng xuất và chuyển về trang home
            performLogout(homeLink.href); // Chuyển về trang chủ (href của link)
        });
    }
});
// --- Kết thúc Logic User Icon ---