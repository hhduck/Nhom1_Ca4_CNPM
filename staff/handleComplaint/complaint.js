// complaint.js - PHIÊN BẢN SỬA LỖI ĐẦY ĐỦ (28/10/2025)
// Cập nhật: Thêm danh sách khiếu nại, xóa tính năng "Chuyển tiếp Admin"
// Cập nhật 2: Xóa bộ lọc "Đã đóng/Từ chối"
// Cập nhật 3: Gỡ bỏ toàn bộ logic validation màu (xanh/đỏ)
// Cập nhật 4: Thêm bộ lọc "Tất cả" và logic đi kèm

let currentComplaintId = null;
let btnReplyCustomer = null;
let statusSelect = null;
let assignedStaffInput = null;
let validatedStaffId = null;

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
    assignedStaffInput = document.getElementById('assignedStaff');

    fetchComplaints();

    document.getElementById('complaints-table-body').addEventListener('click', handleComplaintListClick);

    // (SỬA) Cập nhật listener cho bộ lọc
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
            // Nếu check "Tất cả", bỏ check các mục khác
            otherCheckboxes.forEach(cb => cb.checked = false);
        }
        applyFilters();
    });

    otherCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                // Nếu check mục khác, bỏ check "Tất cả"
                allCheckbox.checked = false;
            }

            // Nếu không còn mục nào khác được check, tự động check "Tất cả"
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

        if (!response.ok) {
            throw new Error(`Lỗi API: ${response.status}`);
        }

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

// (SỬA) Cập nhật hàm applyFilters
function applyFilters() {
    const isAllChecked = document.getElementById('filter-all').checked;

    const filterStatusMap = {
        'filter-pending': 'pending',
        'filter-processing': 'processing',
        'filter-resolved': 'resolved'
    };

    let selectedStatuses = [];
    // Chỉ lấy status nếu "Tất cả" KHÔNG được check
    if (!isAllChecked) {
        document.querySelectorAll('.filters input.complaint-filter:checked:not(#filter-all)').forEach(cb => {
            const status = filterStatusMap[cb.id];
            if (status) {
                selectedStatuses.push(status);
            }
        });
    }

    const searchTerm = document.getElementById('complaint-search-input').value.toLowerCase();

    const filteredComplaints = allComplaints.filter(complaint => {
        // (SỬA) Logic so khớp trạng thái
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
        const statusClass = `status-${complaint.Status}`.replace('processing', 'shipping').replace('resolved', 'success').replace('closed', 'failed').replace('rejected', 'failed');

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

        if (!response.ok) {
            throw new Error(`Lỗi API: ${response.status}`);
        }

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

    assignedStaffInput.value = data.assigned_staff_name || '';
    validatedStaffId = data.AssignedTo || null;

    document.getElementById('responseText').value = data.Resolution || '';

    updateButtonStates(data.Status || 'pending');
}

function clearForm() {
    console.log("Xóa trống form...");
    currentComplaintId = null;

    document.getElementById('customerName').value = '(Chọn một khiếu nại từ danh sách)';
    document.getElementById('phoneNumber').value = '';
    document.getElementById('complaintDetails').value = '';

    statusSelect.value = 'pending';

    assignedStaffInput.value = '';
    validatedStaffId = null;

    document.getElementById('responseText').value = '';

    updateButtonStates(null);
}

function updateButtonStates(currentStatus) {
    const hasComplaint = currentComplaintId !== null;
    const isStaffValidOrEmpty = validatedStaffId !== null || assignedStaffInput.value.trim() === '';

    const btnSave = document.querySelector('.form-actions .btn-primary-green');
    if (btnSave) {
        btnSave.disabled = !hasComplaint || !isStaffValidOrEmpty;
        btnSave.title = !hasComplaint ? "Không có khiếu nại để lưu" : (!isStaffValidOrEmpty ? "Tên nhân viên phụ trách không hợp lệ" : "Lưu thay đổi");
    }
    if (btnReplyCustomer) {
        btnReplyCustomer.disabled = !hasComplaint;
        btnReplyCustomer.title = !hasComplaint ? "Không có khiếu nại" : "Gửi email trả lời khách hàng (và lưu)";
    }
}

function setupEventListeners() {
    const form = document.getElementById('complaint-form');

    if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
            updateButtonStates(e.target.value);
        });
    }

    if (assignedStaffInput) {
        assignedStaffInput.addEventListener('input', () => {
            validatedStaffId = null;
            updateButtonStates(statusSelect.value);
        });
        assignedStaffInput.addEventListener('blur', async () => {
            const name = assignedStaffInput.value.trim();
            if (name === '') {
                validatedStaffId = null;
            } else {
                await validateStaffNameWithExistingAPI(name);
            }
            updateButtonStates(statusSelect.value);
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

async function validateStaffNameWithExistingAPI(name) {
    console.log("Đang kiểm tra tên nhân viên qua staff_search.php:", name);
    validatedStaffId = null;

    try {
        const response = await fetch(`../../api/staff_search.php?role=staff&search=${encodeURIComponent(name)}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (response.status === 403) {
            console.error("Lỗi quyền truy cập: Nhân viên không thể tìm kiếm.");
            alert("Lỗi: Bạn không có quyền tìm kiếm nhân viên.");
            return;
        }
        if (!response.ok) {
            const errorResult = await response.json();
            throw new Error(`Lỗi API ${response.status}: ${errorResult.message || 'Lỗi không xác định'}`);
        }

        const result = await response.json();

        if (result.success && result.data && result.data.users) {
            const matchingUsers = result.data.users;
            console.log("API staff_search.php tìm thấy:", matchingUsers);

            if (matchingUsers.length === 1) {
                validatedStaffId = matchingUsers[0].id;
                assignedStaffInput.value = matchingUsers[0].full_name;
                console.log("ID nhân viên hợp lệ:", validatedStaffId);
            } else if (matchingUsers.length > 1) {
                console.warn("Tên nhân viên không eindeutig, tìm thấy nhiều kết quả.");
            } else {
                console.log("Không tìm thấy nhân viên.");
            }
        } else {
            console.log("Không tìm thấy nhân viên hoặc lỗi API:", result.message);
        }
    } catch (error) {
        console.error('Lỗi khi kiểm tra tên nhân viên với staff_search.php:', error.message);
    }
}

async function handleSaveAndClose() {
    const dataToSave = {
        status: statusSelect.value,
        assignedStaffId: validatedStaffId,
        resolutionText: document.getElementById('responseText').value
    };

    if (assignedStaffInput.value.trim() !== '' && validatedStaffId === null) {
        alert('Tên nhân viên phụ trách không hợp lệ. Vui lòng kiểm tra lại.');
        assignedStaffInput.focus();
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

// (ĐÃ XÓA) Hàm addValidationStyles()