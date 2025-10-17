// staff/orders.js

// Hàm này sẽ chạy ngay khi trang web được tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Thay vì dùng dữ liệu giả, chúng ta gọi hàm để lấy dữ liệu thật từ server
    fetchOrders();
});

// Hàm mới: Gửi yêu cầu đến file order.php để lấy danh sách đơn hàng
async function fetchOrders() {
    try {
        // Đây chính là "lời gọi" đến file PHP của bạn
        const response = await fetch('/dm_git/Nhom1_Ca4_CNPM/staff/ViewOders/order.php'); 
        
        // Chuyển dữ liệu JSON nhận được thành một object mà JavaScript có thể dùng
        const ordersFromDB = await response.json();
        
        // Sau khi có dữ liệu, gọi hàm render để hiển thị ra bảng
        renderOrderList(ordersFromDB);

    } catch (error) {
        console.error('Đã xảy ra lỗi khi lấy dữ liệu đơn hàng:', error);
    }
}


// Hàm để "vẽ" danh sách đơn hàng ra bảng (Hàm này gần như giữ nguyên)
function renderOrderList(orders) {
    const tableBody = document.getElementById('orders-table-body');
    tableBody.innerHTML = ''; // Xóa sạch dữ liệu cũ trên bảng

    const statusMap = {
        pending: 'Chờ xác nhận',
        completed: 'Hoàn tất',
        failed: 'Giao thất bại'
    };
    
    // Nếu không có đơn hàng nào, hiển thị thông báo
    if (orders.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="7" style="text-align: center;">Không có đơn hàng nào.</td>`;
        tableBody.appendChild(row);
        return;
    }

    // Lặp qua từng đơn hàng nhận được và tạo một dòng mới trong bảng
    orders.forEach(order => {
        const row = document.createElement('tr');

        let actionButtonsHTML = '';
        if (order.status === 'pending') {
            actionButtonsHTML = `
                <button class="btn-confirm">Xác nhận</button>
                <button class="btn-cancel-reason">Hủy (Lý do)</button>`;
        } else if (order.status === 'completed') {
            actionButtonsHTML = `<button class="btn-disabled" disabled>Đã xác nhận</button>`;
        } else { // 'failed'
            actionButtonsHTML = `
                <button class="btn-archived" disabled>Đã hủy</button>
                <button class="btn-view-reason">Xem lý do</button>`;
        }

        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customerName}</td>
            <td>${order.date}</td>
            <td>${new Intl.NumberFormat('vi-VN').format(order.total)} VND</td>
            <td>${statusMap[order.status] || order.status}</td>
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