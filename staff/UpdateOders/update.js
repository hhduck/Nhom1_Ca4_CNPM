// update.js - PHIÊN BẢN HOÀN CHỈNH

document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
});

async function fetchOrders() {
    try {
        const response = await fetch('update.php');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const ordersFromDB = await response.json();
        renderOrderList(ordersFromDB);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu đơn hàng:', error);
    }
}

function renderOrderList(orders) {
    const tableBody = document.getElementById('update-orders-tbody');
    tableBody.innerHTML = '';

    if (orders.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="6" style="text-align: center;">Không có đơn hàng nào để hiển thị.</td>`;
        tableBody.appendChild(row);
        return;
    }

    orders.forEach(order => {
        const row = document.createElement('tr');
        let statusDotClass = '';
        switch (order.status) {
            case 'shipping': statusDotClass = 'yellow'; break;
            case 'completed': statusDotClass = 'green'; break;
            case 'cancelled': statusDotClass = 'red'; break;
        }

        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.updateTime}</td>
            <td>${order.updatedBy}</td>
            <td><span class="status-dot ${statusDotClass}"></span></td>
            <td>${order.notes || ''}</td>
            <td>
                <a class="update-icon" data-order='${JSON.stringify(order)}'>
                    <i class="fas fa-pen-to-square"></i>
                </a>
            </td>
        `;
        tableBody.appendChild(row);
    });

    addEventListenersToIcons();
}

function addEventListenersToIcons() {
    const updateIcons = document.querySelectorAll('.update-icon');
    updateIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
            const orderDataString = event.currentTarget.getAttribute('data-order');
            const orderData = JSON.parse(orderDataString);
            populateUpdateForm(orderData);
        });
    });
}

function populateUpdateForm(order) {
    document.getElementById('info-order-id').textContent = order.id;
    document.getElementById('info-customer-name').textContent = order.customerName;
    document.getElementById('info-phone').textContent = order.phone;
    document.getElementById('info-address').textContent = order.address;
    document.getElementById('info-date').textContent = order.orderDate;

    const formattedTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total);
    document.getElementById('info-total').textContent = formattedTotal;

    document.getElementById('info-payment-method').textContent = order.paymentMethod;

    // Nếu đơn hàng không có status, nó sẽ tự động quay về placeholder
    document.getElementById('update-status').value = order.status || "";
    document.getElementById('update-notes').value = order.notes || '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}