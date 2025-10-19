// order.js - PHIÊN BẢN CẬP NHẬT

let allOrders = [];
let reasonModal, confirmCancelBtn, cancelModalBtn, reasonTextarea;
let viewReasonModal, viewReasonContent, closeViewReasonBtn;
let currentEditingOrderId = null;

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

    // Event listeners cho modal xem lý do
    closeViewReasonBtn.addEventListener('click', () => viewReasonModal.style.display = 'none');
    viewReasonModal.addEventListener('click', (e) => {
        if (e.target === viewReasonModal) viewReasonModal.style.display = 'none';
    });

    // Event listeners cho nút xác nhận và hủy trong chi tiết đơn hàng
    document.querySelector('.btn-action-confirm').addEventListener('click', handleUpdateOrder);
    document.querySelector('.btn-action-cancel').addEventListener('click', cancelEditOrder);
}

function handleTableButtonClick(e) {
    const target = e.target;
    const orderId = target.dataset.id;

    if (target.classList.contains('btn-confirm')) {
        if (confirm(`Bạn có chắc muốn xác nhận đơn hàng ${orderId}?`)) {
            updateOrderStatus(orderId, 'completed');
        }
    }

    if (target.classList.contains('btn-cancel-reason')) {
        reasonTextarea.value = '';
        reasonModal.dataset.orderId = orderId;
        reasonModal.style.display = 'flex';
    }

    if (target.classList.contains('btn-view-reason')) {
        const order = allOrders.find(o => o.id === orderId);
        if (order && order.cancelReason) {
            viewReasonContent.textContent = order.cancelReason;
        } else {
            viewReasonContent.textContent = 'Không có lý do hủy.';
        }
        viewReasonModal.style.display = 'flex';
    }

    if (target.classList.contains('update-icon') || target.closest('.update-icon')) {
        e.preventDefault();
        const row = target.closest('tr');
        const order = JSON.parse(row.dataset.orderInfo);
        enableEditMode(order);
        // Cuộn xuống phần chi tiết đơn hàng
        document.querySelector('.order-detail-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
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

function enableEditMode(order) {
    currentEditingOrderId = order.id;

    // Thay thế các span bằng input để cho phép chỉnh sửa
    document.getElementById('detail-order-id').textContent = order.id;

    const customerNameSpan = document.getElementById('detail-customer-name');
    customerNameSpan.innerHTML = `<input type="text" id="edit-customer-name" value="${order.customerName}" style="width: 100%; padding: 5px; border: 1px solid #D4CFC3; border-radius: 4px; font-family: 'Inter', sans-serif; font-size: 14px;">`;

    const phoneSpan = document.getElementById('detail-phone');
    phoneSpan.innerHTML = `<input type="text" id="edit-phone" value="${order.phone || ''}" style="width: 100%; padding: 5px; border: 1px solid #D4CFC3; border-radius: 4px; font-family: 'Inter', sans-serif; font-size: 14px;">`;

    const addressSpan = document.getElementById('detail-address');
    addressSpan.innerHTML = `<input type="text" id="edit-address" value="${order.address || ''}" style="width: 100%; padding: 5px; border: 1px solid #D4CFC3; border-radius: 4px; font-family: 'Inter', sans-serif; font-size: 14px;">`;

    const totalSpan = document.getElementById('detail-total');
    totalSpan.innerHTML = `<input type="number" id="edit-total" value="${order.total}" style="width: 100%; padding: 5px; border: 1px solid #D4CFC3; border-radius: 4px; font-family: 'Inter', sans-serif; font-size: 14px;">`;

    const paymentSpan = document.getElementById('detail-payment-method');
    const currentPayment = order.paymentMethod || '';
    paymentSpan.innerHTML = `
        <select id="edit-payment-method" style="width: 100%; padding: 5px; border: 1px solid #D4CFC3; border-radius: 4px; font-family: 'Inter', sans-serif; font-size: 14px; background-color: white; cursor: pointer;">
            <option value="">-- Chọn hình thức --</option>
            <option value="COD" ${currentPayment === 'COD' ? 'selected' : ''}>COD (Thanh toán khi nhận hàng)</option>
            <option value="Chuyển khoản" ${currentPayment === 'Chuyển khoản' ? 'selected' : ''}>Chuyển khoản ngân hàng</option>
            <option value="MoMo" ${currentPayment === 'MoMo' ? 'selected' : ''}>Ví MoMo</option>
            <option value="ZaloPay" ${currentPayment === 'ZaloPay' ? 'selected' : ''}>Ví ZaloPay</option>
            <option value="VNPay" ${currentPayment === 'VNPay' ? 'selected' : ''}>VNPay</option>
        </select>
    `;

    // Giữ nguyên ngày đặt (không cho sửa)
    document.getElementById('detail-date').textContent = order.date;
}

async function handleUpdateOrder() {
    if (!currentEditingOrderId) {
        alert('Vui lòng chọn đơn hàng cần cập nhật bằng cách nhấn vào icon cập nhật.');
        return;
    }

    const customerNameInput = document.getElementById('edit-customer-name');
    const phoneInput = document.getElementById('edit-phone');
    const addressInput = document.getElementById('edit-address');
    const totalInput = document.getElementById('edit-total');
    const paymentMethodInput = document.getElementById('edit-payment-method');

    if (!customerNameInput) {
        alert('Vui lòng nhấn vào icon cập nhật để chỉnh sửa đơn hàng.');
        return;
    }

    const updatedData = {
        id: currentEditingOrderId,
        customerName: customerNameInput.value.trim(),
        phone: phoneInput.value.trim(),
        address: addressInput.value.trim(),
        total: parseFloat(totalInput.value) || 0,
        paymentMethod: paymentMethodInput.value.trim()
    };

    if (!updatedData.customerName) {
        alert('Tên khách hàng không được để trống.');
        return;
    }

    try {
        const response = await fetch('order.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        const result = await response.json();
        if (result.success) {
            currentEditingOrderId = null;
            await fetchOrders();
            resetOrderDetailForm();
        } else {
            alert('Cập nhật thất bại: ' + result.message);
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật đơn hàng:', error);
        alert('Đã có lỗi xảy ra phía client.');
    }
}

function cancelEditOrder() {
    if (currentEditingOrderId) {
        currentEditingOrderId = null;
        resetOrderDetailForm();
    }
}

function resetOrderDetailForm() {
    document.getElementById('detail-order-id').textContent = 'Mã đơn hàng...';
    document.getElementById('detail-customer-name').textContent = 'Tên khách hàng...';
    document.getElementById('detail-phone').textContent = 'Nhập số điện thoại...';
    document.getElementById('detail-address').textContent = 'Địa chỉ khách hàng...';
    document.getElementById('detail-date').textContent = 'Ngày tạo đơn...';
    document.getElementById('detail-total').textContent = 'Giá trị đơn...';
    document.getElementById('detail-payment-method').textContent = '(Chọn hình thức thanh toán)';
    document.getElementById('notes').value = '';
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
        alert('Đã có lỗi xảy ra phía client.');
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
            <td><a href="#" class="update-icon"><i class="fas fa-pen-to-square"></i></a></td>
        `;
        row.addEventListener('click', e => {
            if (e.target.tagName !== 'BUTTON' && !e.target.closest('.update-icon') && !e.target.closest('a')) {
                displayOrderDetails(JSON.parse(row.dataset.orderInfo));
            }
        });
        tableBody.appendChild(row);
    });
}

function displayOrderDetails(order) {
    currentEditingOrderId = null;
    document.getElementById('detail-order-id').textContent = order.id;
    document.getElementById('detail-customer-name').textContent = order.customerName;
    document.getElementById('detail-phone').textContent = order.phone || 'Chưa có';
    document.getElementById('detail-address').textContent = order.address || 'Chưa có';
    document.getElementById('detail-date').textContent = order.date;
    document.getElementById('detail-total').textContent = `${new Intl.NumberFormat('vi-VN').format(order.total)} VND`;
    document.getElementById('detail-payment-method').textContent = order.paymentMethod || 'Chưa rõ';
}