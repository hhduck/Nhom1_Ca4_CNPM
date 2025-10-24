// complaint.js

// Biến giả định, trong thực tế, bạn sẽ lấy ID này từ URL
// Ví dụ: .../complaint.html?id=1
let currentComplaintId = 1; // Đang giả định xử lý khiếu nại ID=1

document.addEventListener('DOMContentLoaded', () => {
    // 1. Tải thông tin chi tiết của khiếu nại (nếu cần)
    // Bạn có thể bỏ qua bước này nếu đã có dữ liệu từ trang danh sách
    // loadComplaintDetails(currentComplaintId);

    // 2. Gán sự kiện cho các nút bấm
    setupEventListeners();
});

function setupEventListeners() {
    const form = document.getElementById('complaint-form');
    const btnForwardAdmin = document.querySelector('.form-actions .btn-secondary:nth-child(1)');
    const btnReplyCustomer = document.querySelector('.form-actions .btn-secondary:nth-child(2)');

    // 1. Xử lý nút "Lưu và đóng" (khi submit form)
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Ngăn form gửi đi theo cách truyền thống
        handleSaveAndClose();
    });

    // 2. Xử lý nút "Chuyển tiếp Admin"
    btnForwardAdmin.addEventListener('click', () => {
        handleForwardToAdmin();
    });

    // 3. Xử lý nút "Trả lời khách hàng"
    btnReplyCustomer.addEventListener('click', () => {
        handleReplyToCustomer();
    });
}

/**
 * LƯU VÀ ĐÓNG: Cập nhật trạng thái, nhân viên, và nội dung phản hồi
 */
async function handleSaveAndClose() {
    const dataToSave = {
        status: document.getElementById('status').value,
        assignedStaff: document.getElementById('assignedStaff').value,
        resolutionText: document.getElementById('responseText').value
    };

    console.log("Đang lưu dữ liệu:", dataToSave);

    try {
        const response = await fetch(`../../api/complaints.php?id=${currentComplaintId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
            },
            body: JSON.stringify(dataToSave)
        });

        const result = await response.json();

        if (result.success) {
            showSuccessToast('Đã lưu tiến độ thành công!');
            // Bạn có thể chuyển hướng về trang danh sách ở đây
            // window.location.href = '../ViewOders/order.html';
        } else {
            throw new Error(result.message || 'Lỗi không xác định');
        }
    } catch (error) {
        console.error('Lỗi khi lưu và đóng:', error);
        alert('Lỗi: ' + error.message);
    }
}

/**
 * CHUYỂN TIẾP ADMIN: Gửi một hành động đặc biệt
 */
async function handleForwardToAdmin() {
    if (!confirm('Bạn có chắc chắn muốn chuyển tiếp khiếu nại này cho Admin?')) {
        return;
    }

    const data = { action: 'forward_admin' };

    try {
        const response = await fetch(`../../api/complaints.php?id=${currentComplaintId}`, {
            method: 'PUT', // Vẫn dùng PUT để cập nhật
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showSuccessToast('Đã chuyển tiếp cho Admin thành công!');
            // Cập nhật trạng thái trên giao diện (ví dụ)
            document.getElementById('status').value = 'pending';
        } else {
            throw new Error(result.message || 'Lỗi không xác định');
        }
    } catch (error) {
        console.error('Lỗi khi chuyển tiếp Admin:', error);
        alert('Lỗi: ' + error.message);
    }
}

/**
 * TRẢ LỜI KHÁCH HÀNG: Gửi email
 */
async function handleReplyToCustomer() {
    const responseText = document.getElementById('responseText').value;

    if (!responseText || responseText.trim() === '') {
        alert('Vui lòng nhập nội dung phản hồi trước khi gửi.');
        document.getElementById('responseText').focus();
        return;
    }

    if (!confirm('Bạn có chắc chắn muốn GỬI EMAIL phản hồi này cho khách hàng?')) {
        return;
    }

    const data = { responseText: responseText };

    try {
        // Sử dụng phương thức POST cho hành động "gửi"
        const response = await fetch(`../../api/complaints.php?id=${currentComplaintId}&action=reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showSuccessToast('Gửi phản hồi thành công!');
            // Cập nhật trạng thái sang "Đã giải quyết" (ví dụ)
            document.getElementById('status').value = 'resolved';
            // Lưu lại thay đổi trạng thái này
            handleSaveAndClose();
        } else {
            throw new Error(result.message || 'Lỗi gửi email');
        }
    } catch (error) {
        console.error('Lỗi khi trả lời khách hàng:', error);
        alert('Lỗi: ' + error.message);
    }
}


/**
 * Hiển thị thông báo toast (giống order.js)
 */
function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background-color: #155724; /* Màu xanh lá */
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

    // Thêm keyframes animation (nếu chưa có)
    const styleSheet = document.styleSheets[0];
    styleSheet.insertRule(`
        @keyframes slideInUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `, styleSheet.cssRules.length);

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutDown 0.3s ease forwards';
        styleSheet.insertRule(`
            @keyframes slideOutDown {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(100%); opacity: 0; }
            }
        `, styleSheet.cssRules.length);
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}