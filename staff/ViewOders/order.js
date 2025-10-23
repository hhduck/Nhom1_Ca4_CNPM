// order.js - ĐÃ CẬP NHẬT ĐỂ CHẠY VỚI API MỚI (api/orders.php)
// ĐÃ SỬA ĐƯỜNG DẪN VÀ THÊM TOKEN XÁC THỰC

let allOrders = [];
let reasonModal, confirmCancelBtn, cancelModalBtn, reasonTextarea;
let viewReasonModal, viewReasonContent, closeViewReasonBtn;

document.addEventListener('DOMContentLoaded', () => {
    // Tìm các phần tử DOM sau khi trang đã tải xong
    reasonModal = document.getElementById('reasonModal');
    confirmCancelBtn = document.getElementById('confirmCancelBtn');
    cancelModalBtn = document.getElementById('cancelModalBtn');
    reasonTextarea = document.getElementById('reasonTextarea');
    viewReasonModal = document.getElementById('viewReasonModal');
    viewReasonContent = document.getElementById('viewReasonContent');
    closeViewReasonBtn = document.getElementById('closeViewReasonBtn');

    fetchOrders();
    setupEventListeners();
});

function setupEventListeners() {
    document.querySelectorAll('.filters input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
    document.getElementById('orders-table-body').addEventListener('click', handleTableButtonClick);
    cancelModalBtn.addEventListener('click', () => reasonModal.style.display = 'none');
    confirmCancelBtn.addEventListener('click', handleConfirmCancel);
    reasonModal.addEventListener('click', (e) => {
        if (e.target === reasonModal) reasonModal.style.display = 'none';
    });
    closeViewReasonBtn.addEventListener('click', () => viewReasonModal.style.display = 'none');
    viewReasonModal.addEventListener('click', (e) => {
        if (e.target === viewReasonModal) viewReasonModal.style.display = 'none';
    });
}

function handleTableButtonClick(e) {
    const target = e.target;
    const row = target.closest('tr');
    if (!row) return;
    
    // Lấy orderId từ data-id (thêm cái này)
    const orderId = target.dataset.id;
    const orderData = JSON.parse(row.dataset.orderInfo);

    // Xử lý nút Xác nhận
    if (target.classList.contains('btn-confirm')) {
        if (confirm(`Bạn có chắc muốn xác nhận đơn hàng ${orderId}?`)) {
            updateOrderStatus(orderId, 'completed');
        }
    }
    // Xử lý nút Hủy
    else if (target.classList.contains('btn-cancel-reason')) {
        reasonTextarea.value = '';
        reasonModal.dataset.orderId = orderId;
        reasonModal.style.display = 'flex';
    }
    // Xử lý nút Xem lý do
    else if (target.classList.contains('btn-view-reason')) {
        viewReasonContent.textContent = orderData.cancel_reason || 'Không có lý do hủy.';
        viewReasonModal.style.display = 'flex';
    }
    // Xử lý icon Xem đơn hàng (con mắt)
    else if (target.classList.contains('view-icon') || target.closest('.view-icon')) {
        e.preventDefault();
        displayOrderDetails(orderData);
        document.querySelector('.order-info-display').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // Xử lý click vào các ô khác trong dòng
    else {
        displayOrderDetails(orderData);
    }
}

function handleConfirmCancel() {
    const orderId = reasonModal.dataset.orderId;
    const reason = reasonTextarea.value.trim();
    if (!reason) {
        alert('Vui lòng nhập lý do hủy đơn hàng.');
        return;
    }
    updateOrderStatus(orderId, 'cancelled', reason);
    reasonModal.style.display = 'none';
}

async function updateOrderStatus(orderId, newStatus, reason = null) {
    try {
        const response = await fetch(`/dm_git/Nhom1_Ca4_CNPM/api/orders.php/${orderId}/status`, {
            method: 'PUT', 
            headers: { 
                'Content-Type': 'application/json',
                // ==========================================================
                // THÊM DÒNG NÀY ĐỂ GỬI TOKEN
                // ==========================================================
                'Authorization': 'Bearer demo' 
            },
            body: JSON.stringify({
                status: newStatus,
                note: reason 
            })
        });
        const result = await response.json();

        if (result.success) {
            alert('Cập nhật trạng thái thành công!');
            fetchOrders(); // Tải lại danh sách
        } else {
            // Lỗi 401 hoặc 403 sẽ hiển thị ở đây
            alert('Cập nhật thất bại: ' + result.message);
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái:', error);
    }
}

async function fetchOrders() {
    try {
        // Hàm GET không gọi checkAdminPermission() nên không cần token
        const response = await fetch('/dm_git/Nhom1_Ca4_CNPM/api/orders.php');

        if (!response.ok) {
            // Hiển thị chi tiết lỗi nếu có
            const errorText = await response.text();
            throw new Error(`Lỗi HTTP: ${response.status}. Chi tiết: ${errorText}`);
        }

        const result = await response.json();

        if (result.success && result.data.orders) {
            allOrders = result.data.orders;
        } else {
            allOrders = [];
            console.error('Lỗi khi lấy dữ liệu: ', result.message);
        }

        renderOrderList(allOrders);
    } catch (error) {
        console.error('Đã xảy ra lỗi khi lấy dữ liệu đơn hàng:', error);
    }
}

function applyFilters() {
    const selectedStatuses = Array.from(document.querySelectorAll('.filters input:checked'))
        .map(cb => cb.id.replace('filter-', ''));

    const filteredOrders = selectedStatuses.length === 0
        ? allOrders
        : allOrders.filter(order => selectedStatuses.includes(order.order_status));

    renderOrderList(filteredOrders);
}

function renderOrderList(orders) {
    const tableBody = document.getElementById('orders-table-body');
    tableBody.innerHTML = '';

    const statusMap = {
        pending: 'Chờ xác nhận',
        confirmed: 'Đã xác nhận',
        preparing: 'Đang chuẩn bị',
        shipping: 'Đang giao',
        completed: 'Hoàn tất',
        cancelled: 'Đã hủy'
    };

    if (orders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Không có đơn hàng nào phù hợp.</td></tr>`;
        return;
    }

    orders.forEach(order => {
        const row = document.createElement('tr');
        row.dataset.orderInfo = JSON.stringify(order);
        
        const orderId = order.order_id;
        const currentStatus = order.order_status;

        let actionButtonsHTML = '';
        // THÊM data-id VÀO TẤT CẢ CÁC NÚT
        if (currentStatus === 'pending') {
            actionButtonsHTML = `<button class="btn-confirm" data-id="${orderId}">Xác nhận</button> <button class="btn-cancel-reason" data-id="${orderId}">Hủy (Lý do)</button>`;
        } else if (currentStatus === 'completed') {
            actionButtonsHTML = `<button class="btn-disabled" data-id="${orderId}" disabled>Đã hoàn tất</button>`;
        } else if (currentStatus === 'cancelled') {
            actionButtonsHTML = `<button class="btn-archived" data-id="${orderId}" disabled>Đã hủy</button> <button class="btn-view-reason" data-id="${orderId}">Xem lý do</button>`;
        } else {
            actionButtonsHTML = `<button class="btn-disabled" data-id="${orderId}" disabled>${statusMap[currentStatus] || currentStatus}</button>`;
        }

        row.innerHTML = `
            <td>${order.order_code || orderId}</td> 
            <td>${order.customer_name}</td> 
            <td>${new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
            <td>${new Intl.NumberFormat('vi-VN').format(order.final_amount)} VND</td>
            <td>${statusMap[currentStatus] || currentStatus}</td> 
            <td class="action-buttons">${actionButtonsHTML}</td>
            <td><a href="#" class="view-icon" data-id="${orderId}"><i class="fas fa-eye"></i></a></td>
        `;
        tableBody.appendChild(row);
    });
}

function displayOrderDetails(order) {
    document.getElementById('detail-order-id').textContent = order.order_code || order.order_id;
    document.getElementById('detail-customer-name').textContent = order.customer_name;
    document.getElementById('detail-phone').textContent = order.customer_phone || 'Chưa có';
    document.getElementById('detail-address').textContent = order.shipping_address || 'Chưa có';
    document.getElementById('detail-date').textContent = new Date(order.created_at).toLocaleString('vi-VN');
    document.getElementById('detail-total').textContent = `${new Intl.NumberFormat('vi-VN').format(order.final_amount)} VND`;
    document.getElementById('detail-payment-method').textContent = order.payment_method || 'Chưa rõ';
}