// staff/orders.js

// Dữ liệu mẫu (sau này sẽ lấy từ API)
const mockOrders = [
    { id: "DH2025-01", customerName: "Trần Quang A", date: "01/03/2025", total: 500000, status: "pending" },
    { id: "DH2025-02", customerName: "Nguyễn Thị B", date: "13/06/2025", total: 750000, status: "completed" },
    { id: "DH2025-03", customerName: "Lê Hoàng C", date: "21/09/2025", total: 1200000, status: "failed" }
];

// Hàm chạy khi trang tải xong
document.addEventListener('DOMContentLoaded', () => {
    renderOrderList(mockOrders);
});

// Hàm để "vẽ" danh sách đơn hàng ra bảng
function renderOrderList(orders) {
    const tableBody = document.getElementById('orders-table-body');
    tableBody.innerHTML = '';

    const statusMap = {
        pending: 'Chờ xác nhận',
        completed: 'Hoàn tất',
        failed: 'Giao thất bại'
    };

    orders.forEach(order => {
        const row = document.createElement('tr');

        // Tạo HTML cho các nút xử lý dựa trên trạng thái
        let actionButtonsHTML = '';
        if (order.status === 'pending') {
            actionButtonsHTML = `
                <button class="btn-confirm">Xác nhận</button>
                <button class="btn-cancel-reason">Hủy (Lý do)</button>`;
        } else if (order.status === 'completed') {
            actionButtonsHTML = `<button class="btn-disabled">Đã xác nhận</button>`;
        } else { // 'failed'
            actionButtonsHTML = `
                <button class="btn-archived">Đã hủy</button>
                <button class="btn-view-reason">Xem lý do</button>`;
        }

        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customerName}</td>
            <td>${order.date}</td>
            <td>${new Intl.NumberFormat('vi-VN').format(order.total)}VND</td>
            <td>${statusMap[order.status]}</td>
            <td class="action-buttons">${actionButtonsHTML}</td>
            <td>
                <a href="#" class="update-icon">
                    <i class="fas fa-pen-to-square"></i>
                </a>
            </td>
        `;

        tableBody.appendChild(row);
    });
}