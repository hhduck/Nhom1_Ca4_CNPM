let currentComplaintId = null;
let btnReplyCustomer = null;
let statusSelect = null;
let responseText = null;
let validatedStaffId = null;
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
    assignedStaffIdInput = document.getElementById('assignedStaffIdInput');
    assignedStaffNameDisplay = document.getElementById('assignedStaffNameDisplay');

    fetchComplaints();

    document.getElementById('complaints-table-body').addEventListener('click', handleComplaintListClick);
    setupFilterListeners();
    document.getElementById('complaint-search-input').addEventListener('input', debounce(applyFilters, 500));
    setupEventListeners();
    setupUserIconMenu(); // Gọi hàm setup menu
});

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
    assignedStaffIdInput.value = data.AssignedTo || '';
    assignedStaffNameDisplay.value = data.assigned_staff_name || '';
    validatedStaffId = data.AssignedTo || null;
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
    assignedStaffIdInput.value = '';
    assignedStaffNameDisplay.value = '';
    validatedStaffId = null;
    assignedStaffNameDisplay.classList.remove('error-placeholder');
    assignedStaffNameDisplay.placeholder = 'Tên nhân viên sẽ hiển thị ở đây';
    updateButtonStates(null);
}

function updateButtonStates(currentStatus) {
    const hasComplaint = currentComplaintId !== null;
    if (statusSelect) statusSelect.disabled = !hasComplaint;
    if (responseText) responseText.disabled = !hasComplaint;
    if (assignedStaffIdInput) assignedStaffIdInput.disabled = !hasComplaint;
    if (assignedStaffNameDisplay) assignedStaffNameDisplay.disabled = !hasComplaint;

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

    if (assignedStaffIdInput) {
        assignedStaffIdInput.addEventListener('input', () => {
            validatedStaffId = null;
            assignedStaffNameDisplay.value = '';
            assignedStaffNameDisplay.classList.remove('error-placeholder');
            assignedStaffNameDisplay.placeholder = '...';
        });

        assignedStaffIdInput.addEventListener('blur', async () => {
            const staffId = assignedStaffIdInput.value.trim();
            if (staffId === '') {
                validatedStaffId = null;
                assignedStaffNameDisplay.value = '';
                assignedStaffNameDisplay.placeholder = 'Tên nhân viên sẽ hiển thị ở đây';
            } else {
                await validateStaffById(staffId);
            }
        });
    }

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

async function validateStaffById(staffId) {
    console.log("Đang kiểm tra ID nhân viên qua staff_search.php:", staffId);
    validatedStaffId = null;
    assignedStaffNameDisplay.classList.remove('error-placeholder');

    try {
        const response = await fetch(`../../api/staff_search.php?id=${encodeURIComponent(staffId)}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const result = await response.json();

        if (response.ok && result.success && result.data) {
            console.log("Tìm thấy nhân viên:", result.data);
            validatedStaffId = result.data.id;
            assignedStaffIdInput.value = result.data.id;
            assignedStaffNameDisplay.value = result.data.full_name;
        } else {
            console.log("Không tìm thấy nhân viên với ID:", staffId);
            assignedStaffNameDisplay.value = '';
            assignedStaffNameDisplay.placeholder = 'Không có nhân viên tương ứng trong dữ liệu';
            assignedStaffNameDisplay.classList.add('error-placeholder');
        }
    } catch (error) {
        console.error('Lỗi khi kiểm tra ID nhân viên:', error.message);
        assignedStaffNameDisplay.value = '';
        assignedStaffNameDisplay.placeholder = 'Lỗi kết nối API, không thể tìm';
        assignedStaffNameDisplay.classList.add('error-placeholder');
    }
}

async function handleSaveAndClose() {
    const dataToSave = {
        status: statusSelect.value,
        assignedStaffId: validatedStaffId,
        resolutionText: document.getElementById('responseText').value
    };

    if (assignedStaffIdInput.value.trim() !== '' && validatedStaffId === null) {
        alert('Mã nhân viên phụ trách không hợp lệ. Vui lòng kiểm tra lại.');
        assignedStaffIdInput.focus();
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
    const responseTextValue = document.getElementById('responseText').value;
    if (responseTextValue.trim() === '') {
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
            body: JSON.stringify({ responseText: responseTextValue })
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
            if (toast.parentNode) { // Kiểm tra trước khi xóa
                document.body.removeChild(toast);
            }
        }, 500);
    }, 3000);
}

function setupUserIconMenu() {
    const userIconDiv = document.querySelector('.nav-user-icon');
    const userMenu = document.querySelector('.user-menu');
    const logoutButton = document.getElementById('logoutButton');
    // Link "Thông tin tài khoản" không cần xử lý đặc biệt, chỉ cần href đúng

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

    function performLogout(redirectUrl) {
        if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
            console.log("Đang đăng xuất...");
            // ĐÃ SỬA
            localStorage.removeItem('currentStaff');
            localStorage.removeItem('jwtToken');
            //...
        }
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            performLogout('../../pages/login/login.html');
        });
    }
}