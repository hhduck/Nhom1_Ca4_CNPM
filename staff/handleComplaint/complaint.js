// complaint.js - PHIÊN BẢN SỬA ĐỔI (28/10/2025)
// Cập nhật 5: Thay đổi logic "Nhân viên phụ trách"
// - Chuyển từ nhập Tên (FullName) sang nhập Mã (UserID)
// - Cập nhật logic API call sang staff_search.php?id=...

let currentComplaintId = null;
let btnReplyCustomer = null;
let statusSelect = null;
let responseText = null;
let validatedStaffId = null;

// (SỬA) Thay đổi biến input
let assignedStaffIdInput = null;
let assignedStaffNameDisplay = null;

let allComplaints = [];

const STATUS_MAP_VI = {
    'pending': 'Chờ giải quyết',
    'processing': 'Đang giải quyết',
    'resolved': 'Đã giải quyết',
};

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
    };
}

document.addEventListener('DOMContentLoaded', () => {
    btnReplyCustomer = document.querySelector('.form-actions .btn-secondary:nth-child(1)');
    statusSelect = document.getElementById('status');
    responseText = document.getElementById('responseText');

    // (SỬA) Lấy 2 input mới
    assignedStaffIdInput = document.getElementById('assignedStaffIdInput');
    assignedStaffNameDisplay = document.getElementById('assignedStaffNameDisplay');

    fetchComplaints();

    document.getElementById('complaints-table-body').addEventListener('click', handleComplaintListClick);
    setupFilterListeners();
    document.getElementById('complaint-search-input').addEventListener('input', debounce(applyFilters, 500));
    setupEventListeners();
});

// (MỚI) Hàm riêng để quản lý logic bộ lọc
function setupFilterListeners() {
    const allCheckbox = document.getElementById('filter-all');
    const otherCheckboxes = document.querySelectorAll('.complaint-filter:not(#filter-all)');

    allCheckbox.addEventListener('change', () => {
        if (allCheckbox.checked) {
            otherCheckboxes.forEach(cb => cb.checked = false);
        }
        applyFilters();
    });

    otherCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                allCheckbox.checked = false;
            }
            const anyOtherChecked = Array.from(otherCheckboxes).some(cb => cb.checked);
            if (!anyOtherChecked) {
                allCheckbox.checked = true;
            }
            applyFilters();
        });
    });
}


async function fetchComplaints() {
    console.log("Đang tải danh sách khiếu nại...");
    try {
        const response = await fetch(`../../api/complaints.php`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
            allComplaints = result.data;
            applyFilters();
        } else {
            allComplaints = [];
            console.error("API trả về không phải mảng:", result.message);
        }
    } catch (error) {
        console.error('Lỗi khi tải danh sách khiếu nại:', error);
        document.getElementById('complaints-table-body').innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Không thể tải danh sách khiếu nại.</td></tr>`;
    }
}

function applyFilters() {
    const isAllChecked = document.getElementById('filter-all').checked;
    const filterStatusMap = {
        'filter-pending': 'pending',
        'filter-processing': 'processing',
        'filter-resolved': 'resolved'
    };
    let selectedStatuses = [];
    if (!isAllChecked) {
        document.querySelectorAll('.filters input.complaint-filter:checked:not(#filter-all)').forEach(cb => {
            const status = filterStatusMap[cb.id];
            if (status) selectedStatuses.push(status);
        });
    }
    const searchTerm = document.getElementById('complaint-search-input').value.toLowerCase();
    const filteredComplaints = allComplaints.filter(complaint => {
        const statusMatch = isAllChecked || selectedStatuses.includes(complaint.Status);
        const searchMatch = !searchTerm ||
            (complaint.ComplaintCode && complaint.ComplaintCode.toLowerCase().includes(searchTerm)) ||
            (complaint.OrderCode && complaint.OrderCode.toLowerCase().includes(searchTerm)) ||
            (complaint.CustomerName && complaint.CustomerName.toLowerCase().includes(searchTerm));
        return statusMatch && searchMatch;
    });
    renderComplaintList(filteredComplaints);
}

function renderComplaintList(complaints) {
    const tableBody = document.getElementById('complaints-table-body');
    tableBody.innerHTML = '';
    if (complaints.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Không có khiếu nại nào phù hợp.</td></tr>`;
        return;
    }
    complaints.forEach(complaint => {
        const row = document.createElement('tr');
        row.dataset.complaintId = complaint.ComplaintID;
        const statusText = STATUS_MAP_VI[complaint.Status] || complaint.Status;
        const statusClass = `status-${complaint.Status}`.replace('processing', 'shipping').replace('resolved', 'success');
        row.innerHTML = `
            <td>${complaint.ComplaintCode}</td>
            <td>${complaint.OrderCode}</td>
            <td>${complaint.CustomerName}</td>
            <td>${complaint.Title}</td> <td>${new Date(complaint.CreatedAt).toLocaleDateString('vi-VN')}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <a href="#" class="view-icon" title="Xử lý khiếu nại">
                    <i class="fas fa-pen-to-square"></i>
                </a>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function handleComplaintListClick(e) {
    const icon = e.target.closest('.view-icon');
    if (icon) {
        e.preventDefault();
        const row = e.target.closest('tr');
        const complaintId = row.dataset.complaintId;
        if (complaintId) {
            loadComplaintDetails(complaintId);
            document.getElementById('complaint-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

async function loadComplaintDetails(complaintId) {
    console.log(`Đang tải chi tiết khiếu nại ID: ${complaintId}`);
    currentComplaintId = complaintId;
    try {
        const response = await fetch(`../../api/complaints.php/${complaintId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);
        const result = await response.json();
        if (result.success && result.data) {
            fillFormWithData(result.data);
        } else {
            throw new Error(result.message || 'Không tìm thấy dữ liệu');
        }
    } catch (error) {
        console.error('Lỗi khi tải chi tiết khiếu nại:', error);
        alert(`Lỗi: ${error.message}. Không thể tải chi tiết khiếu nại.`);
        clearForm();
    }
}

function fillFormWithData(data) {
    document.getElementById('customerName').value = data.customer_name || '';
    document.getElementById('phoneNumber').value = data.customer_phone || '';
    document.getElementById('complaintDetails').value = data.Content || '';
    statusSelect.value = data.Status || 'pending';
    document.getElementById('responseText').value = data.Resolution || '';

    // (SỬA) Điền dữ liệu vào 2 ô nhân viên
    assignedStaffIdInput.value = data.AssignedTo || '';
    assignedStaffNameDisplay.value = data.assigned_staff_name || '';
    validatedStaffId = data.AssignedTo || null;

    // (MỚI) Xóa báo lỗi (nếu có) khi tải dữ liệu
    assignedStaffNameDisplay.classList.remove('error-placeholder');
    assignedStaffNameDisplay.placeholder = 'Tên nhân viên sẽ hiển thị ở đây';

    updateButtonStates(data.Status || 'pending');
}

function clearForm() {
    console.log("Xóa trống form...");
    currentComplaintId = null;
    document.getElementById('customerName').value = '(Chọn một khiếu nại từ danh sách)';
    document.getElementById('phoneNumber').value = '';
    document.getElementById('complaintDetails').value = '';
    statusSelect.value = 'pending';
    document.getElementById('responseText').value = '';

    // (SỬA) Xóa 2 ô nhân viên
    assignedStaffIdInput.value = '';
    assignedStaffNameDisplay.value = '';
    validatedStaffId = null;

    // (MỚI) Xóa báo lỗi (nếu có)
    assignedStaffNameDisplay.classList.remove('error-placeholder');
    assignedStaffNameDisplay.placeholder = 'Tên nhân viên sẽ hiển thị ở đây';

    updateButtonStates(null);
}

function updateButtonStates(currentStatus) {
    const hasComplaint = currentComplaintId !== null;

    // === PHẦN MỞ KHÓA QUAN TRỌNG ===
    if (statusSelect) statusSelect.disabled = !hasComplaint;
    if (responseText) responseText.disabled = !hasComplaint;

    // (SỬA) Mở khóa 2 ô nhân viên
    if (assignedStaffIdInput) assignedStaffIdInput.disabled = !hasComplaint;
    // Ô tên thì luôn disabled (readonly), nhưng ta cũng có thể kiểm soát nó
    if (assignedStaffNameDisplay) assignedStaffNameDisplay.disabled = !hasComplaint;

    // =================================
    const btnSave = document.querySelector('.form-actions .btn-primary-green');
    if (btnSave) {
        btnSave.disabled = !hasComplaint;
        btnSave.title = !hasComplaint ? "Vui lòng chọn khiếu nại để xử lý" : "Lưu thay đổi";
    }
    if (btnReplyCustomer) {
        btnReplyCustomer.disabled = !hasComplaint;
        btnReplyCustomer.title = !hasComplaint ? "Vui lòng chọn khiếu nại" : "Gửi email trả lời khách hàng (và lưu)";
    }
}

function setupEventListeners() {
    const form = document.getElementById('complaint-form');

    if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
            updateButtonStates(e.target.value);
        });
    }

    // (SỬA) Thay thế toàn bộ logic 'assignedStaffInput'
    if (assignedStaffIdInput) {
        // 1. Xóa tên và ID đã xác thực ngay khi gõ phím
        assignedStaffIdInput.addEventListener('input', () => {
            validatedStaffId = null;
            assignedStaffNameDisplay.value = '';
            assignedStaffNameDisplay.classList.remove('error-placeholder');
            // Đặt placeholder thành "đang tìm"
            assignedStaffNameDisplay.placeholder = '...';
        });

        // 2. Sự kiện 'blur' (khi nhấp ra ngoài) -> Bắt đầu tìm kiếm
        assignedStaffIdInput.addEventListener('blur', async () => {
            const staffId = assignedStaffIdInput.value.trim();

            if (staffId === '') {
                validatedStaffId = null;
                assignedStaffNameDisplay.value = '';
                assignedStaffNameDisplay.placeholder = 'Tên nhân viên sẽ hiển thị ở đây';
            } else {
                // Gọi hàm validation MỚI (đã xóa hàm cũ)
                await validateStaffById(staffId);
            }
        });
    }
    // (KẾT THÚC SỬA ĐỔI)

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSaveAndClose();
    });

    if (btnReplyCustomer) {
        btnReplyCustomer.addEventListener('click', () => {
            handleReplyToCustomer();
        });
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// (SỬA) XÓA BỎ HÀM validateStaffNameWithExistingAPI
// THAY THẾ BẰNG HÀM validateStaffById

async function validateStaffById(staffId) {
    console.log("Đang kiểm tra ID nhân viên qua staff_search.php:", staffId);
    validatedStaffId = null; // Đặt lại ID
    assignedStaffNameDisplay.classList.remove('error-placeholder');

    try {
        // (SỬA) Gọi API staff_search.php với tham số 'id'
        const response = await fetch(`../../api/staff_search.php?id=${encodeURIComponent(staffId)}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const result = await response.json();

        if (response.ok && result.success && result.data) {
            // ---- TÌM THẤY ----
            console.log("Tìm thấy nhân viên:", result.data);
            validatedStaffId = result.data.id; // LƯU ID HỢP LỆ
            assignedStaffIdInput.value = result.data.id; // Chuẩn hóa ID (nếu cần)
            assignedStaffNameDisplay.value = result.data.full_name; // HIỂN THỊ TÊN

        } else {
            // ---- KHÔNG TÌM THẤY (API trả về success: false hoặc lỗi) ----
            console.log("Không tìm thấy nhân viên với ID:", staffId);
            assignedStaffNameDisplay.value = ''; // Xóa tên
            // (SỬA) Đặt câu báo lỗi bạn yêu cầu
            assignedStaffNameDisplay.placeholder = 'Không có nhân viên tương ứng trong dữ liệu';
            assignedStaffNameDisplay.classList.add('error-placeholder');
        }
    } catch (error) {
        // ---- LỖI KẾT NỐI / API ----
        console.error('Lỗi khi kiểm tra ID nhân viên:', error.message);
        assignedStaffNameDisplay.value = ''; // Xóa tên
        assignedStaffNameDisplay.placeholder = 'Lỗi kết nối API, không thể tìm';
        assignedStaffNameDisplay.classList.add('error-placeholder');
    }
}


async function handleSaveAndClose() {
    const dataToSave = {
        status: statusSelect.value,
        assignedStaffId: validatedStaffId, // Gửi ID đã xác thực
        resolutionText: document.getElementById('responseText').value
    };

    // (SỬA) Kiểm tra logic lỗi
    // Nếu ô ID có chữ, nhưng ID chưa được xác thực (validatedStaffId là null) -> Báo lỗi
    if (assignedStaffIdInput.value.trim() !== '' && validatedStaffId === null) {
        alert('Mã nhân viên phụ trách không hợp lệ. Vui lòng kiểm tra lại.');
        assignedStaffIdInput.focus(); // Focus vào ô ID
        return;
    }

    if (!currentComplaintId) {
        alert('Chưa chọn khiếu nại. Vui lòng chọn một khiếu nại từ danh sách.');
        return;
    }

    console.log("Đang lưu dữ liệu:", dataToSave);
    try {
        const response = await fetch(`../../api/complaints.php/${currentComplaintId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(dataToSave)
        });
        const result = await response.json();
        if (result.success) {
            showSuccessToast('Đã lưu tiến độ thành công!');
            fetchComplaints();
            clearForm();
        } else {
            throw new Error(result.message || 'Lỗi không xác định');
        }
    } catch (error) {
        console.error('Lỗi khi lưu và đóng:', error);
        alert('Lỗi: ' + error.message);
    }
}

async function handleReplyToCustomer() {
    const responseText = document.getElementById('responseText').value;
    if (responseText.trim() === '') {
        alert("Nội dung phản hồi không được rỗng.");
        document.getElementById('responseText').focus();
        return;
    }

    if (!currentComplaintId) {
        alert('Chưa chọn khiếu nại. Vui lòng chọn một khiếu nại từ danh sách.');
        return;
    }

    if (!confirm("Bạn có chắc chắn muốn GỬI EMAIL phản hồi này cho khách hàng không? Hành động này sẽ tự động chuyển trạng thái sang 'Đã giải quyết' và lưu lại.")) {
        return;
    }

    console.log("Đang gửi trả lời cho khách...");
    try {
        const response = await fetch(`../../api/complaints.php/${currentComplaintId}?action=reply`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ responseText: responseText })
        });

        const result = await response.json();
        if (result.success) {
            showSuccessToast('Đã gửi phản hồi cho khách hàng thành công!');
            fetchComplaints();
            clearForm();
        } else {
            throw new Error(result.message || 'Lỗi không xác định');
        }
    } catch (error) {
        console.error('Lỗi khi trả lời khách hàng:', error);
        alert('Lỗi: ' + error.message);
    }
}

function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;

    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#28a745',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '5px',
        zIndex: '1000',
        fontSize: '16px',
        opacity: '0',
        transition: 'opacity 0.5s, top 0.5s'
    });

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.top = '30px';
    }, 100);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.top = '20px';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 500);
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