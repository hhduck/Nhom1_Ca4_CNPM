// order.js - PHIÊN BẢN HOÀN CHỈNH, CHỈ CÓ CHỨC NĂNG XEM

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
    if (!row) return; // Nếu click vào khoảng trống trong tbody thì thoát

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
        viewReasonContent.textContent = orderData.cancelReason || 'Không có lý do hủy.';
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
    updateOrderStatus(orderId, 'failed', reason);
    reasonModal.style.display = 'none';
}

async function updateOrderStatus(orderId, newStatus, reason = null) {
    try {
        const response = await fetch('order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: orderId, status: newStatus, reason: reason })
        });
        const result = await response.json();
        if (result.success) {
            alert('Cập nhật trạng thái thành công!');
            fetchOrders();
        } else {
            alert('Cập nhật thất bại: ' + result.message);
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái:', error);
    }
}

async function fetchOrders() {
    try {
        const response = await fetch('order.php');
        if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);
        allOrders = await response.json();
        renderOrderList(allOrders);
    } catch (error) {
        console.error('Đã xảy ra lỗi khi lấy dữ liệu đơn hàng:', error);
    }
}

function applyFilters() {
    const selectedStatuses = Array.from(document.querySelectorAll('.filters input:checked'))
        .map(cb => cb.id.replace('filter-', ''));
    const filteredOrders = selectedStatuses.length === 0 ? allOrders : allOrders.filter(order => selectedStatuses.includes(order.status));
    renderOrderList(filteredOrders);
}

function renderOrderList(orders) {
    const tableBody = document.getElementById('orders-table-body');
    tableBody.innerHTML = '';
    const statusMap = { pending: 'Chờ xác nhận', completed: 'Hoàn tất', failed: 'Giao thất bại', shipping: 'Đang giao' };

    if (orders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Không có đơn hàng nào phù hợp.</td></tr>`;
        return;
    }

    orders.forEach(order => {
        const row = document.createElement('tr');
        row.dataset.orderInfo = JSON.stringify(order);
        let actionButtonsHTML = '';
        if (order.status === 'pending') {
            actionButtonsHTML = `<button class="btn-confirm" data-id="${order.id}">Xác nhận</button> <button class="btn-cancel-reason" data-id="${order.id}">Hủy (Lý do)</button>`;
        } else if (order.status === 'completed') {
            actionButtonsHTML = `<button class="btn-disabled" disabled>Đã xác nhận</button>`;
        } else {
            actionButtonsHTML = `<button class="btn-archived" disabled>Đã hủy</button> <button class="btn-view-reason" data-id="${order.id}">Xem lý do</button>`;
        }
        row.innerHTML = `
            <td>${order.id}</td> <td>${order.customerName}</td> <td>${order.date}</td>
            <td>${new Intl.NumberFormat('vi-VN').format(order.total)} VND</td>
            <td>${statusMap[order.status] || order.status}</td> <td class="action-buttons">${actionButtonsHTML}</td>
            <td><a href="#" class="view-icon"><i class="fas fa-eye"></i></a></td>
        `;
        tableBody.appendChild(row);
    });
}

function displayOrderDetails(order) {
    document.getElementById('detail-order-id').textContent = order.id;
    document.getElementById('detail-customer-name').textContent = order.customerName;
    document.getElementById('detail-phone').textContent = order.phone || 'Chưa có';
    document.getElementById('detail-address').textContent = order.address || 'Chưa có';
    document.getElementById('detail-date').textContent = order.date;
    document.getElementById('detail-total').textContent = `${new Intl.NumberFormat('vi-VN').format(order.total)} VND`;
    document.getElementById('detail-payment-method').textContent = order.paymentMethod || 'Chưa rõ';
}