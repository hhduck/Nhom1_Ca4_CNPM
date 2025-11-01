// order.js - PHIÊN BẢN HOÀN CHỈNH VỚI MODAL VÀ TIẾNG VIỆT

let allOrders = [];
let pendingUpdate = null;
let currentDisplayedOrderId = null;

// Map trạng thái sang tiếng Việt
const STATUS_MAP = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã nhận đơn',   // SỬA: received -> confirmed
    preparing: 'Đang chuẩn bị', // THÊM MỚI (Từ CSDL)
    shipping: 'Đang giao',
    completed: 'Giao hàng thành công', // SỬA: success -> completed
    cancelled: 'Giao hàng thất bại'  // SỬA: failed -> cancelled
};

// Map phương thức thanh toán sang tiếng Việt
const PAYMENT_METHOD_MAP = {
    cod: 'Tiền mặt (COD)',
    bank_transfer: 'Chuyển khoản',
    momo: 'MoMo',
    zalopay: 'ZaloPay',
    vnpay: 'VNPay'
};

// ===== HÀM ĐĂNG XUẤT (TÁCH RA NGOÀI) =====
function performLogout(redirectUrl) {
    console.log("Đang đăng xuất...");
    localStorage.removeItem('currentStaff');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('rememberMe');
    // BỎ ALERT - Đăng xuất trực tiếp
    window.location.href = redirectUrl;
}
// ===== KẾT THÚC HÀM ĐĂNG XUẤT =====

document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
    setupEventListeners();
    setupModalListeners();
    setupUserIconMenu();

    // Xử lý click vào logo để đăng xuất
    const logoLinkOrder = document.querySelector('.nav-logo a');
    if (logoLinkOrder) {
        logoLinkOrder.addEventListener('click', (event) => {
            event.preventDefault();
            console.log("Logo clicked on order page, logging out...");
            performLogout('../../pages/home/home.html');
        });
    }
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
                    // Dòng này hoạt động đúng cho cả 2 trường hợp
                    selectElement.value = order.order_status || 'pending';
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
            cancelBtn.click(); // Gọi sự kiện click của nút Hủy
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

    // 1. Xử lý khi nhấp vào icon LƯU GHI CHÚ (dấu tích)
    const saveIcon = target.closest('.save-note-icon');
    if (saveIcon) {
        e.preventDefault(); // Ngăn hành vi mặc định của thẻ <a>
        console.log('Save note icon clicked');

        // Tìm ô input tương ứng trong cùng wrapper
        const wrapper = saveIcon.closest('.note-cell-wrapper');
        const inputElement = wrapper.querySelector('.table-note-input');

        if (inputElement) {
            // Gọi hàm xử lý thay đổi ghi chú
            handleNoteChange(inputElement);
        }
        return; // Dừng thực thi, không làm gì thêm
    }

    // 2. Ngăn các hành vi khác nếu nhấp vào select hoặc input
    if (target.tagName === 'SELECT' || target.tagName === 'INPUT') {
        return;
    }

    // 3. Xử lý khi nhấp vào icon XEM CHI TIẾT (con mắt) hoặc nhấp vào hàng
    const viewIcon = target.closest('.view-icon');

    // Luôn hiển thị chi tiết khi nhấp vào hàng (trừ các trường hợp đã return ở trên)
    const orderData = JSON.parse(row.dataset.orderInfo);
    currentDisplayedOrderId = orderData.order_id;
    displayOrderDetails(orderData);

    // 4. CHỈ cuộn trang xuống nếu nhấp vào icon con mắt
    if (viewIcon) {
        e.preventDefault(); // Ngăn hành vi mặc định của thẻ <a>
        console.log('View icon clicked');
        const detailSection = document.querySelector('.order-info-display');
        if (detailSection) {
            detailSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
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
            if (contentType && contentType.includes("application/json")) {
                errorData = await response.json();
                throw new Error(`Lỗi HTTP: ${response.status}. Chi tiết: ${errorData.message || JSON.stringify(errorData)}`);
            } else {
                errorData = await response.text();
                throw new Error(`Lỗi HTTP: ${response.status}. Server response: ${errorData.substring(0, 200)}...`);
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
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Không thể tải dữ liệu đơn hàng. Lỗi: ${error.message}</td></tr>`;
    }
}

function applyFilters() {
    // --- ĐỒNG BỘ VỚI ADMIN ---
    const filterStatusMap = {
        'filter-pending': 'pending',
        'filter-confirmed': 'confirmed',
        'filter-preparing': 'preparing',
        'filter-shipping': 'shipping',
        'filter-completed': 'completed',
        'filter-cancelled': 'cancelled'
    };

    const selectedStatuses = Array.from(document.querySelectorAll('.filters input[type="checkbox"]:checked'))
        .map(cb => filterStatusMap[cb.id])
        .filter(Boolean);

    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();

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

        // --- BẮT ĐẦU THAY ĐỔI ---
        // Xóa onblur và thêm icon dấu tích vào trong một div wrapper
        const noteCellHTML = `
            <div class="note-cell-wrapper">
                <input type="text" class="table-note-input" data-order-id="${orderId}" value="${currentNote.replace(/"/g, '&quot;')}" placeholder="Thêm ghi chú...">
                <a href="#" class="save-note-icon" data-order-id="${orderId}" title="Lưu ghi chú">
                    <i class="fas fa-check"></i>
                </a>
            </div>
        `;
        // --- KẾT THÚC THAY ĐỔI ---

        row.innerHTML = `
            <td>${order.order_code || orderId}</td>
            <td>${order.customer_name}</td>
            <td>${new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
            <td>${new Intl.NumberFormat('vi-VN').format(order.final_amount)} VND</td>
            <td>${statusSelectHTML}</td>
            
            <td>${noteCellHTML}</td>
            
            <td><a href="#" class="view-icon"><i class="fas fa-eye"></i></a></td>
        `;
        tableBody.appendChild(row);
    });
}

function displayOrderDetails(order) {
    console.log("Hiển thị chi tiết cho đơn hàng:", order);

    document.getElementById('detail-order-id').textContent = order.order_code || order.order_id;
    document.getElementById('detail-customer-name').textContent = order.customer_name || 'Chưa có';
    document.getElementById('detail-phone').textContent = order.customer_phone || 'Chưa có';

    let fullAddress = [order.shipping_address, order.ward, order.district, order.city].filter(Boolean).join(', ');
    document.getElementById('detail-address').textContent = fullAddress || 'Chưa có';

    document.getElementById('detail-date').textContent = new Date(order.created_at).toLocaleString('vi-VN');
    document.getElementById('detail-total').textContent = `${new Intl.NumberFormat('vi-VN').format(order.final_amount)} VND`;

    const paymentMethod = PAYMENT_METHOD_MAP[order.payment_method] || order.payment_method || 'Chưa rõ';
    document.getElementById('detail-payment-method').textContent = paymentMethod;

    const statusSpan = document.getElementById('detail-current-status');
    const noteSpan = document.getElementById('detail-current-note');
    const statusKey = order.order_status || 'pending';
    const statusTextVietnamese = STATUS_MAP[statusKey] || statusKey || 'Không xác định';

    statusSpan.textContent = statusTextVietnamese;
    statusSpan.className = `status-badge status-${statusKey || 'unknown'}`;
    console.log(`Trạng thái đơn hàng: Key='${statusKey}', Text='${statusTextVietnamese}', Class='${statusSpan.className}'`);

    if (order.note && order.note.trim() !== '') {
        noteSpan.textContent = order.note;
        noteSpan.style.fontStyle = 'normal';
        noteSpan.style.color = '#555';
    } else {
        noteSpan.textContent = '(Không có ghi chú)';
        noteSpan.style.fontStyle = 'italic';
        noteSpan.style.color = '#999';
    }
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
            if (contentType && contentType.includes("application/json")) {
                const errorJson = await response.json();
                errorText = errorJson.message || JSON.stringify(errorJson);
            } else {
                errorText = await response.text();
            }
            throw new Error(`Lỗi HTTP ${response.status}: ${errorText}`);
        }

        if (contentType && contentType.includes("application/json")) {
            const result = await response.json();
            console.log("Kết quả API:", result);

            if (result.success) {
                console.log(`Cập nhật ${field} thành công cho đơn hàng ${orderId}`);

                const index = allOrders.findIndex(o => o.order_id == orderId);
                let updatedOrderData = null;
                if (index !== -1) {
                    if (field === 'status') allOrders[index].order_status = value;
                    else if (field === 'note') allOrders[index].note = value;
                    updatedOrderData = allOrders[index];
                }

                applyFilters();

                const displayedOrderIdElement = document.getElementById('detail-order-id');
                const displayedOrderIdText = displayedOrderIdElement ? displayedOrderIdElement.textContent : null;
                const updatedOrderCodeOrId = updatedOrderData ? (updatedOrderData.order_code || updatedOrderData.order_id.toString()) : null;

                if (updatedOrderData && displayedOrderIdText && (displayedOrderIdText == orderId || displayedOrderIdText == updatedOrderCodeOrId)) {
                    displayOrderDetails(updatedOrderData);
                }

                showSuccessToast(`Cập nhật ${field === 'status' ? 'trạng thái' : 'ghi chú'} thành công!`);
            } else {
                alert('Cập nhật thất bại: ' + result.message);
                fetchOrders();
            }
        } else {
            const textResult = await response.text();
            throw new Error("Phản hồi từ server không phải JSON: " + textResult.substring(0, 200));
        }

    } catch (error) {
        console.error(`Lỗi nghiêm trọng khi cập nhật ${field} cho đơn ${orderId}:`, error);
        alert(`Đã xảy ra lỗi khi cập nhật. ${error.message}. Vui lòng thử lại.`);
        fetchOrders();
    }
}

function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed; bottom: 30px; right: 30px;
        background-color: #155724; color: white; padding: 15px 25px;
        border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 9999; font-family: 'Inter', sans-serif; font-size: 14px;
        font-weight: 500; animation: slideInUp 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOutDown 0.3s ease forwards';
        toast.addEventListener('animationend', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    }, 3000);
}

// --- Logic cho User Icon Dropdown ---
function setupUserIconMenu() {
    const userIconDiv = document.querySelector('.nav-user-icon');
    const userMenu = document.querySelector('.user-menu');
    const logoutButton = document.getElementById('logoutButton');

    if (userIconDiv && userMenu) {
        userIconDiv.addEventListener('click', (event) => {
            event.stopPropagation();
            userMenu.classList.remove('hidden');
            setTimeout(() => {
                userMenu.classList.toggle('visible');
            }, 0);
        });

        document.addEventListener('click', (event) => {
            if (userIconDiv && !userIconDiv.contains(event.target) && userMenu.classList.contains('visible')) {
                userMenu.classList.remove('visible');
            }
        });
    }

    // Xử lý nút Đăng xuất
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            performLogout('../../pages/login/login.html');
        });
    }
}

// Thêm keyframes cho animation
const styleSheet = document.styleSheets[document.styleSheets.length - 1];
try {
    styleSheet.insertRule(`
        @keyframes slideInUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `, styleSheet.cssRules.length);
    styleSheet.insertRule(`
        @keyframes slideOutDown {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(100%); opacity: 0; }
        }
    `, styleSheet.cssRules.length);
} catch (e) {
    console.warn("Không thể thêm keyframes, có thể đã tồn tại hoặc trình duyệt không hỗ trợ.", e);
}