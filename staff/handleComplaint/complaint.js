// complaint.js - CẬP NHẬT: Thêm xác thực tên nhân viên

let currentComplaintId = null;
let btnForwardAdmin = null;
let btnReplyCustomer = null;
let statusSelect = null;
let assignedStaffInput = null; // Thêm biến cho ô nhập tên NV
let validatedStaffId = null;   // Lưu ID nhân viên hợp lệ (UserID từ bảng Users)

document.addEventListener('DOMContentLoaded', () => {
    btnForwardAdmin = document.querySelector('.form-actions .btn-secondary:nth-child(1)');
    btnReplyCustomer = document.querySelector('.form-actions .btn-secondary:nth-child(2)');
    statusSelect = document.getElementById('status');
    assignedStaffInput = document.getElementById('assignedStaff'); // Lấy ô input NV

    const urlParams = new URLSearchParams(window.location.search);
    const complaintIdFromUrl = urlParams.get('id');

    if (complaintIdFromUrl) {
        loadComplaintDetails(complaintIdFromUrl);
    } else {
        loadOldestPendingComplaint();
    }

    setupEventListeners();
    addValidationStyles(); // Thêm CSS cho viền input
});

async function loadOldestPendingComplaint() { /* ... (Giữ nguyên code cũ) ... */ }

async function loadComplaintDetails(complaintId) { /* ... (Giữ nguyên code cũ) ... */ }

function fillFormWithData(data) {
    document.getElementById('customerName').value = data.customer_name || '';
    document.getElementById('phoneNumber').value = data.customer_phone || '';
    document.getElementById('complaintDetails').value = data.Content || '';
    statusSelect.value = data.Status || 'pending';
    // Hiển thị tên đầy đủ nhưng không xác thực lại ở đây
    assignedStaffInput.value = data.assigned_staff_name || '';
    // Lưu UserID ban đầu nếu có trong dữ liệu tải về
    validatedStaffId = data.AssignedTo || null;
    // Đánh dấu hợp lệ nếu có ID ban đầu hoặc ô input trống
    setStaffInputValid(validatedStaffId !== null || assignedStaffInput.value.trim() === '');

    document.getElementById('responseText').value = data.Resolution || '';
    updateButtonStates(data.Status || 'pending');
}

function clearForm() {
    console.log("Không có khiếu nại, đang xóa trống form...");
    document.getElementById('customerName').value = '';
    document.getElementById('phoneNumber').value = '';
    document.getElementById('complaintDetails').value = '';
    statusSelect.value = 'pending';
    assignedStaffInput.value = '';
    validatedStaffId = null; // Xóa ID đã xác thực
    setStaffInputValid(null); // Reset trạng thái validation (xóa viền)
    document.getElementById('responseText').value = '';
    updateButtonStates(null);
}

function updateButtonStates(currentStatus) {
    const isResolved = currentStatus === 'resolved';
    const hasComplaint = currentComplaintId !== null;
    // Kiểm tra xem tên NV có hợp lệ không (có ID hoặc ô input trống)
    const isStaffValidOrEmpty = validatedStaffId !== null || assignedStaffInput.value.trim() === '';

    const btnSave = document.querySelector('.form-actions .btn-primary-green');
    if (btnSave) {
        // Nút Lưu bị vô hiệu hóa nếu KHÔNG có khiếu nại HOẶC tên NV không hợp lệ
        btnSave.disabled = !hasComplaint || !isStaffValidOrEmpty;
    }
    if (btnForwardAdmin) {
        btnForwardAdmin.disabled = isResolved || !hasComplaint;
    }
    if (btnReplyCustomer) {
        btnReplyCustomer.disabled = !isResolved || !hasComplaint;
    }
}

function setupEventListeners() {
    const form = document.getElementById('complaint-form');
    const searchInput = document.getElementById('search-input');

    if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
            updateButtonStates(e.target.value);
        });
    }

    // *** THÊM EVENT LISTENER CHO Ô NHÂN VIÊN PHỤ TRÁCH ***
    if (assignedStaffInput) {
        // Sử dụng 'input' để kiểm tra khi đang gõ (reset validation)
        assignedStaffInput.addEventListener('input', () => {
            validatedStaffId = null; // Reset ID khi đang gõ
            setStaffInputValid(null); // Reset viền xanh/đỏ
            updateButtonStates(statusSelect.value); // Cập nhật nút Lưu (sẽ bị disable)
        });
        // Sử dụng 'blur' để kiểm tra khi rời khỏi ô input (sau khi gõ xong)
        assignedStaffInput.addEventListener('blur', async () => {
            const name = assignedStaffInput.value.trim();
            if (name === '') {
                // Nếu ô trống, coi như hợp lệ và xóa ID
                validatedStaffId = null;
                setStaffInputValid(true); // Ô trống là hợp lệ, có thể hiện viền xanh hoặc không (null)
            } else {
                // Nếu có chữ, gọi API để kiểm tra
                await validateStaffNameWithExistingAPI(name);
            }
            // Cập nhật lại trạng thái nút Lưu sau khi validate xong
            updateButtonStates(statusSelect.value);
        });
    }
    // ******************************************************

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch(searchInput.value);
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Không cần kiểm tra ID ở đây nữa vì nút Lưu đã bị disable nếu không hợp lệ
        handleSaveAndClose();
    });

    if (btnForwardAdmin) {
        btnForwardAdmin.addEventListener('click', () => {
            handleForwardToAdmin();
        });
    }
    if (btnReplyCustomer) {
        btnReplyCustomer.addEventListener('click', () => {
            handleReplyToCustomer();
        });
    }
}

/**
 * HÀM MỚI: Gọi API users.php để xác thực tên nhân viên
 */
async function validateStaffNameWithExistingAPI(name) {
    console.log("Đang kiểm tra tên nhân viên qua users.php:", name);
    validatedStaffId = null; // Reset trước khi kiểm tra
    setStaffInputValid(null); // Reset viền

    try {
        // Gọi API users.php với tham số role=staff và tên cần tìm
        const response = await fetch(`../../api/users.php?role=staff&search=${encodeURIComponent(name)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Lưu ý: Nếu users.php yêu cầu đăng nhập (ví dụ: checkAdminPermission), bạn cần gửi token
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
            }
        });

        // Xử lý lỗi (ví dụ: 403 Forbidden nếu staff không có quyền gọi users.php)
        if (response.status === 403) {
            console.error("Lỗi quyền truy cập: Nhân viên không thể tìm kiếm users. Cần điều chỉnh quyền trong users.php cho GET.");
            alert("Lỗi: Bạn không có quyền tìm kiếm nhân viên.");
            setStaffInputValid(false); // Đánh dấu không hợp lệ
            return; // Dừng lại
        }
        if (!response.ok) { // Các lỗi khác (404, 500...)
            const errorText = await response.text();
            throw new Error(`Lỗi API users.php ${response.status}: ${errorText}`);
        }

        const result = await response.json();

        // Xử lý kết quả trả về từ users.php
        if (result.success && result.data && result.data.users) {
            const matchingUsers = result.data.users; // Lấy mảng users
            console.log("API users.php tìm thấy:", matchingUsers);

            if (matchingUsers.length === 1) {
                // Chính xác 1 kết quả -> Hợp lệ
                validatedStaffId = matchingUsers[0].id; // Lấy UserID (tên cột là 'id' trong API của bạn)
                assignedStaffInput.value = matchingUsers[0].full_name; // Tự sửa lại tên cho đúng
                setStaffInputValid(true); // Đặt viền xanh
                console.log("ID nhân viên hợp lệ:", validatedStaffId);
            } else if (matchingUsers.length > 1) {
                // Nhiều kết quả -> Không eindeutig (tên bị trùng)
                console.warn("Tên nhân viên không eindeutig, tìm thấy nhiều kết quả.");
                setStaffInputValid(false); // Đặt viền đỏ
                // Có thể hiện thông báo lỗi chi tiết hơn
                // alert("Tìm thấy nhiều nhân viên trùng tên, vui lòng nhập chính xác họ và tên.");
            } else {
                // Không tìm thấy kết quả nào
                console.log("Không tìm thấy nhân viên.");
                setStaffInputValid(false); // Đặt viền đỏ
            }
        } else {
            // API trả về success: false hoặc không có data.users
            console.log("Không tìm thấy nhân viên hoặc lỗi API:", result.message);
            setStaffInputValid(false); // Đặt viền đỏ
        }
    } catch (error) {
        console.error('Lỗi khi kiểm tra tên nhân viên với users.php:', error);
        setStaffInputValid(false); // Đặt viền đỏ
    }
}

/**
 * HÀM CŨ: Cập nhật giao diện ô input nhân viên (đặt viền xanh/đỏ)
 */
function setStaffInputValid(isValid) {
    assignedStaffInput.classList.remove('is-valid', 'is-invalid'); // Xóa class cũ
    if (isValid === true) {
        assignedStaffInput.classList.add('is-valid'); // Thêm class viền xanh
    } else if (isValid === false) {
        assignedStaffInput.classList.add('is-invalid'); // Thêm class viền đỏ
    }
    // Nếu isValid là null (đang gõ), không thêm class nào cả
}

async function handleSearch(searchTerm) { /* ... (Giữ nguyên code cũ) ... */ }

async function handleSaveAndClose() {
    // *** THAY ĐỔI: Gửi validatedStaffId (là UserID) thay vì tên ***
    const dataToSave = {
        status: statusSelect.value,
        // Gửi ID nếu hợp lệ, nếu không gửi null (cho API complaints.php xử lý)
        assignedStaffId: validatedStaffId,
        resolutionText: document.getElementById('responseText').value
    };

    // Kiểm tra lại lần nữa trước khi gửi đi: Nếu ô input có chữ nhưng ID không hợp lệ thì báo lỗi
    if (assignedStaffInput.value.trim() !== '' && validatedStaffId === null) {
        alert('Tên nhân viên phụ trách không hợp lệ. Vui lòng kiểm tra lại.');
        assignedStaffInput.focus(); // Đưa con trỏ về ô lỗi
        return; // Dừng, không gửi dữ liệu
    }

    console.log("Đang lưu dữ liệu:", dataToSave);
    try {
        const response = await fetch(`../../api/complaints.php/${currentComplaintId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', /* ... Authorization ... */ },
            body: JSON.stringify(dataToSave)
        });
        const result = await response.json();
        if (result.success) {
            showSuccessToast('Đã lưu tiến độ thành công!');
            if (dataToSave.status === 'resolved') {
                setTimeout(loadOldestPendingComplaint, 1000);
            }
        } else {
            throw new Error(result.message || 'Lỗi không xác định');
        }
    } catch (error) {
        console.error('Lỗi khi lưu và đóng:', error);
        alert('Lỗi: ' + error.message);
    }
}

async function handleForwardToAdmin() { /* ... (Giữ nguyên code cũ) ... */ }
async function handleReplyToCustomer() { /* ... (Giữ nguyên code cũ) ... */ }
function showSuccessToast(message) { /* ... (Giữ nguyên code cũ) ... */ }

// Thêm CSS cho viền input (giữ nguyên, đảm bảo nó được gọi)
function addValidationStyles() {
    const styleSheet = document.styleSheets[0] || document.head.appendChild(document.createElement('style')).sheet;
    try {
        // Thêm rule cho viền xanh (hợp lệ)
        styleSheet.insertRule(`
            input#assignedStaff.is-valid {
                border-color: #28a745 !important; /* Màu xanh lá */
                box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25) !important; /* Bóng mờ xanh lá */
            }
        `, styleSheet.cssRules.length);
        // Thêm rule cho viền đỏ (không hợp lệ)
        styleSheet.insertRule(`
            input#assignedStaff.is-invalid {
                border-color: #dc3545 !important; /* Màu đỏ */
                box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important; /* Bóng mờ đỏ */
            }
        `, styleSheet.cssRules.length);
    } catch (e) { /* Bỏ qua nếu rule đã tồn tại */ }
}