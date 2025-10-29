// complaint.js - PHIÊN BẢN HOÀN CHỈNH (CÓ LOGOUT TRÊN LOGO, BỎ CONFIRM)

let currentComplaintId = null;
let btnReplyCustomer = null;
let statusSelect = null;
let responseText = null;
let validatedStaffId = null;
let assignedStaffIdInput = null;
let assignedStaffNameDisplay = null;
let allComplaints = [];

// Map trạng thái API sang text Tiếng Việt
const STATUS_MAP_VI = {
    'pending': 'Chờ giải quyết',
    'processing': 'Đang giải quyết',
    'resolved': 'Đã giải quyết',
    'closed': 'Đã đóng',
    'rejected': 'Từ chối'
};

// Hàm lấy Headers xác thực
function getAuthHeaders() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        console.error("Token không hợp lệ hoặc đã hết hạn. Đang đăng xuất...");
        performLogout('../../pages/login/login.html'); // Chuyển về login nếu mất token
        return null;
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Chạy khi trang tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra đăng nhập
    const staffDataString = localStorage.getItem("currentStaff");
    const jwtToken = localStorage.getItem("jwtToken");
    if (!staffDataString || !jwtToken) {
        alert("Vui lòng đăng nhập với tài khoản nhân viên/admin.");
        window.location.href = "../../pages/login/login.html";
        return;
    }

    // Lấy các element quan trọng (thêm kiểm tra null)
    btnReplyCustomer = document.querySelector('.form-actions .btn-secondary');
    statusSelect = document.getElementById('status');
    responseText = document.getElementById('responseText');
    assignedStaffIdInput = document.getElementById('assignedStaffIdInput');
    assignedStaffNameDisplay = document.getElementById('assignedStaffNameDisplay');

    fetchComplaints(); // Tải dữ liệu

    // Gắn các listener (thêm kiểm tra null)
    const tableBody = document.getElementById('complaints-table-body');
    if (tableBody) tableBody.addEventListener('click', handleComplaintListClick);
    setupFilterListeners();
    const searchInput = document.getElementById('complaint-search-input');
    if (searchInput) searchInput.addEventListener('input', debounce(applyFilters, 300));
    setupFormEventListeners();
    setupUserIconMenu(); // Setup menu user
    setupLogoLogout();   // <<< GỌI HÀM LOGOUT CHO LOGO >>>
});

// Setup bộ lọc checkboxes
function setupFilterListeners() {
    const allCheckbox = document.getElementById('filter-all');
    const otherCheckboxes = document.querySelectorAll('.complaint-filter:not(#filter-all)');
    if (!allCheckbox) return;

    allCheckbox.addEventListener('change', () => {
        if (allCheckbox.checked) {
            otherCheckboxes.forEach(cb => cb.checked = false);
        } else if (!Array.from(otherCheckboxes).some(cb => cb.checked)) {
             // Nếu bỏ check 'Tất cả' và không có cái nào khác được check -> check lại 'Tất cả'
            allCheckbox.checked = true;
        }
        applyFilters();
    });

    otherCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                allCheckbox.checked = false;
            }
            // Tự động check 'Tất cả' nếu không còn filter nào được chọn
            const anyOtherChecked = Array.from(otherCheckboxes).some(cb => cb.checked);
            if (!anyOtherChecked && !allCheckbox.checked) {
                allCheckbox.checked = true;
            }
            applyFilters();
        });
    });
}

// Tải danh sách khiếu nại từ API
async function fetchComplaints() {
    console.log("Đang tải danh sách khiếu nại...");
    showLoadingState();
    const headers = getAuthHeaders();
    if (!headers) { showErrorState("Lỗi xác thực."); return; }

    try {
        const antiCache = `_=${new Date().getTime()}`;
        const response = await fetch(`../../api/complaints.php?${antiCache}`, { method: 'GET', headers: headers, cache: 'no-store' });
        if (!response.ok) { const err = await response.json().catch(()=>({message:`HTTP ${response.status}`})); throw new Error(err.message); }
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
            allComplaints = result.data;
            applyFilters();
        } else {
            allComplaints = [];
            console.warn("API không trả về mảng:", result.message);
            renderComplaintList([]);
        }
    } catch (error) {
        console.error('Lỗi tải khiếu nại:', error);
        showErrorState('Lỗi tải danh sách: ' + error.message);
    }
}

// Lọc và tìm kiếm danh sách
function applyFilters() {
    const allCheckbox = document.getElementById('filter-all');
    const isAllChecked = allCheckbox ? allCheckbox.checked : true;
    const filterStatusMap = { 'filter-pending': 'pending', 'filter-processing': 'processing', 'filter-resolved': 'resolved', 'filter-closed': 'closed', 'filter-rejected': 'rejected' };
    let selectedStatuses = [];
    if (!isAllChecked) {
        document.querySelectorAll('.filters input.complaint-filter:checked:not(#filter-all)').forEach(cb => {
            const status = filterStatusMap[cb.id]; if (status) selectedStatuses.push(status);
        });
    }
    const searchInput = document.getElementById('complaint-search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filteredComplaints = allComplaints.filter(c => {
        const statusMatch = isAllChecked || selectedStatuses.length === 0 || selectedStatuses.includes(c.Status);
        const searchMatch = !searchTerm || ['ComplaintCode', 'OrderCode', 'CustomerName', 'Title'].some(field => c[field] && c[field].toLowerCase().includes(searchTerm));
        return statusMatch && searchMatch;
    });
    renderComplaintList(filteredComplaints);
}

// Hiển thị danh sách ra bảng
function renderComplaintList(complaints) {
    const tableBody = document.getElementById('complaints-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    if (complaints.length === 0) { tableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Không có khiếu nại nào phù hợp.</td></tr>`; return; }

    complaints.forEach(c => {
        const row = document.createElement('tr');
        row.dataset.complaintId = c.ComplaintID;
        const statusText = STATUS_MAP_VI[c.Status] || c.Status;
        // ✅ QUAN TRỌNG CHO MÀU SẮC: Tạo class CSS dựa trên status gốc từ API
        const statusClass = `status-badge status-${c.Status || 'unknown'}`; // Ví dụ: status-pending, status-processing

        row.innerHTML = `
            <td>${c.ComplaintCode || 'N/A'}</td>
            <td>${c.OrderCode || 'N/A'}</td>
            <td>${c.CustomerName || 'N/A'}</td>
            <td>${c.Title || 'N/A'}</td>
            <td>${formatDateTime(c.CreatedAt)}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td><a href="#" class="view-icon" title="Xử lý"><i class="fas fa-pen-to-square"></i></a></td>
        `;
        tableBody.appendChild(row);
    });
}

// Xử lý click icon xem/sửa
function handleComplaintListClick(e) {
    const icon = e.target.closest('.view-icon');
    if (icon) {
        e.preventDefault();
        const row = e.target.closest('tr');
        const id = row?.dataset.complaintId;
        if (id) {
            loadComplaintDetails(id);
            document.getElementById('complaint-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Tải chi tiết khiếu nại
async function loadComplaintDetails(id) {
    console.log(`Tải chi tiết ID: ${id}`);
    currentComplaintId = id;
    clearForm();
    const formActions = document.querySelector('.form-actions');
    let loadingDiv = document.querySelector('.form-loading');
    if (!loadingDiv && formActions) { /* ... chèn loading ... */ loadingDiv = document.createElement('div'); loadingDiv.className = 'form-loading'; loadingDiv.style.textAlign = 'center'; loadingDiv.style.padding = '20px'; loadingDiv.style.color = '#888'; loadingDiv.textContent = 'Đang tải...'; formActions.insertAdjacentElement('beforebegin', loadingDiv); }

    try {
        const headers = getAuthHeaders(); if (!headers) throw new Error("Lỗi xác thực.");
        const response = await fetch(`../../api/complaints.php/${id}`, { method: 'GET', headers: headers });
        if (!response.ok) { const err = await response.json().catch(()=>({message:`HTTP ${response.status}`})); throw new Error(err.message); }
        const result = await response.json();
        if (result.success && result.data) fillFormWithData(result.data);
        else throw new Error(result.message || 'Không có dữ liệu');
    } catch (error) { console.error('Lỗi tải chi tiết:', error); alert(`Lỗi: ${error.message}`); clearForm(); }
    finally { document.querySelector('.form-loading')?.remove(); }
}

// Điền dữ liệu vào form
function fillFormWithData(data) {
    console.log("Điền form:", data);
    const getEl = (id) => document.getElementById(id); // Helper
    if (getEl('customerName')) getEl('customerName').value = data.customer_name || '';
    if (getEl('phoneNumber')) getEl('phoneNumber').value = data.customer_phone || '';
    if (getEl('complaintDetails')) getEl('complaintDetails').value = data.Content || data.content || '';
    if (statusSelect) statusSelect.value = data.Status || 'pending';
    if (responseText) responseText.value = data.Resolution || data.resolutionText || '';
    if (assignedStaffIdInput) assignedStaffIdInput.value = data.AssignedTo || '';
    if (assignedStaffNameDisplay) {
        assignedStaffNameDisplay.value = data.assigned_staff_name || '';
        assignedStaffNameDisplay.classList.remove('error-placeholder');
        assignedStaffNameDisplay.placeholder = 'Tên NV';
    }
    validatedStaffId = data.AssignedTo || null;
    updateButtonStates(data.Status || 'pending');
}

// Xóa trắng form
function clearForm() {
    console.log("Xóa form"); currentComplaintId = null;
    const form = document.getElementById('complaint-form'); if(form) form.reset(); // Dùng reset tiện hơn
    const customerNameInput = document.getElementById('customerName');
    if (customerNameInput) customerNameInput.value = '(Chọn khiếu nại)'; // Đặt lại placeholder
    // Reset assigned staff display
    validatedStaffId = null;
    if (assignedStaffNameDisplay) {
        assignedStaffNameDisplay.value = '';
        assignedStaffNameDisplay.classList.remove('error-placeholder');
        assignedStaffNameDisplay.placeholder = 'Tên NV';
    }
    if (statusSelect) statusSelect.value = 'pending'; // Đặt lại status về pending
    updateButtonStates(null);
}


// Cập nhật trạng thái các nút bấm
function updateButtonStates(currentStatus) {
    const hasComplaint = currentComplaintId !== null;
    if (statusSelect) statusSelect.disabled = !hasComplaint;
    if (responseText) responseText.disabled = !hasComplaint;
    if (assignedStaffIdInput) assignedStaffIdInput.disabled = !hasComplaint;

    const btnSave = document.querySelector('.form-actions .btn-primary-green');
    const btnReply = document.querySelector('.form-actions .btn-secondary');

    if (btnSave) { btnSave.disabled = !hasComplaint; btnSave.title = hasComplaint ? "Lưu" : "Chọn khiếu nại"; }
    if (btnReply) {
        const canReply = hasComplaint && currentStatus !== 'resolved' && currentStatus !== 'closed';
        btnReply.disabled = !canReply;
        btnReply.title = canReply ? "Gửi email (tự lưu & chuyển status)" : (hasComplaint ? "Đã xử lý/đóng" : "Chọn khiếu nại");
    }
}

// Gắn các listener cho form
function setupFormEventListeners() {
    const form = document.getElementById('complaint-form'); if (!form) return;
    if (statusSelect) statusSelect.addEventListener('change', (e) => updateButtonStates(e.target.value));
    if (assignedStaffIdInput) {
        assignedStaffIdInput.addEventListener('input', () => { validatedStaffId = null; if (assignedStaffNameDisplay) { assignedStaffNameDisplay.value = ''; assignedStaffNameDisplay.placeholder = 'Kiểm tra ID...'; } });
        assignedStaffIdInput.addEventListener('blur', async () => { const id = assignedStaffIdInput.value.trim(); if (id === '') { validatedStaffId = null; if (assignedStaffNameDisplay) assignedStaffNameDisplay.placeholder = 'Tên NV'; } else await validateStaffById(id); });
    }
    form.addEventListener('submit', (e) => { e.preventDefault(); handleSaveAndClose(); });
    if (btnReplyCustomer) btnReplyCustomer.addEventListener('click', handleReplyToCustomer);
}

// Debounce
function debounce(func, wait) { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func(...args), wait); }; }

// Validate Staff ID
async function validateStaffById(staffId) {
    console.log("Kiểm tra ID:", staffId); validatedStaffId = null;
    if (assignedStaffNameDisplay) { assignedStaffNameDisplay.value = 'Đang kiểm tra...'; assignedStaffNameDisplay.classList.remove('error-placeholder'); }
    const headers = getAuthHeaders(); if (!headers) return;
    try {
        // *** Đảm bảo API này tồn tại và hoạt động ***
        const response = await fetch(`../../api/users.php?id=${encodeURIComponent(staffId)}&roleCheck=staff_admin`, { method: 'GET', headers: headers });
        const result = await response.json();
        if (response.ok && result.success && result.data && ['staff', 'admin'].includes(result.data.role)) {
            validatedStaffId = result.data.id; assignedStaffIdInput.value = result.data.id;
            if (assignedStaffNameDisplay) assignedStaffNameDisplay.value = result.data.full_name;
        } else {
            if (assignedStaffNameDisplay) { assignedStaffNameDisplay.value = ''; assignedStaffNameDisplay.placeholder = 'ID không hợp lệ/không phải NV'; assignedStaffNameDisplay.classList.add('error-placeholder'); }
        }
    } catch (error) { console.error('Lỗi API validate:', error); if (assignedStaffNameDisplay) { assignedStaffNameDisplay.value = ''; assignedStaffNameDisplay.placeholder = 'Lỗi API'; assignedStaffNameDisplay.classList.add('error-placeholder'); } }
}


// Xử lý nút "Lưu và đóng"
async function handleSaveAndClose() {
    if (!currentComplaintId) { alert('Chọn khiếu nại.'); return; }
    if (assignedStaffIdInput && assignedStaffIdInput.value.trim() !== '' && validatedStaffId === null) { alert('ID nhân viên không hợp lệ.'); return; }
    const dataToSave = { status: statusSelect?.value, assignedStaffId: (assignedStaffIdInput && assignedStaffIdInput.value.trim() === '') ? null : validatedStaffId, resolutionText: responseText?.value.trim() };
    console.log("Lưu dữ liệu:", dataToSave);
    const btnSave = document.querySelector('.form-actions .btn-primary-green');
    if (btnSave) { btnSave.disabled = true; btnSave.textContent = 'Đang lưu...'; }
    const headers = getAuthHeaders(); if (!headers) { if(btnSave){btnSave.disabled=false; btnSave.textContent='Lưu và đóng';} return; }
    try {
        const response = await fetch(`../../api/complaints.php/${currentComplaintId}`, { method: 'PUT', headers: headers, body: JSON.stringify(dataToSave) });
        const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.message || `Lỗi ${response.status}`);
        showSuccessToast('Đã lưu thành công!'); fetchComplaints();
    } catch (error) { console.error('Lỗi lưu:', error); alert('Lỗi: ' + error.message); }
    finally { if (btnSave) { btnSave.disabled = false; btnSave.textContent = 'Lưu và đóng'; } }
}


// Xử lý nút "Trả lời khách hàng"
async function handleReplyToCustomer() {
    if (!currentComplaintId) { alert('Chọn khiếu nại.'); return; }
    const content = responseText?.value.trim(); if (!content) { alert("Nhập nội dung phản hồi."); return; }
    if (!confirm("Gửi email, lưu phản hồi và chuyển status thành 'Đã giải quyết'?")) return;
    if (btnReplyCustomer) { btnReplyCustomer.disabled = true; btnReplyCustomer.textContent = 'Đang gửi...'; }
    const headers = getAuthHeaders(); if (!headers) { if(btnReplyCustomer){btnReplyCustomer.disabled=false; btnReplyCustomer.textContent='Trả lời';} return; }
    try {
        const response = await fetch(`../../api/complaints.php/${currentComplaintId}?action=reply`, { method: 'POST', headers: headers, body: JSON.stringify({ responseText: content }) });
        const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.message || `Lỗi ${response.status}`);
        showSuccessToast('Đã gửi phản hồi!'); fetchComplaints(); clearForm();
    } catch (error) { console.error('Lỗi gửi:', error); alert('Lỗi: ' + error.message); }
    finally { if (btnReplyCustomer) { btnReplyCustomer.disabled = false; btnReplyCustomer.textContent = 'Trả lời khách hàng'; } }
}

// --- Các hàm tiện ích ---
function showSuccessToast(message) { const toast = document.createElement('div'); toast.textContent = message; toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#28a745;color:white;padding:15px;border-radius:5px;z-index:1000;opacity:0;transition:all 0.5s'; document.body.appendChild(toast); setTimeout(()=>{toast.style.opacity='1';toast.style.top='30px'},100); setTimeout(()=>{toast.style.opacity='0';toast.style.top='20px';setTimeout(()=>toast.remove(),500)},3000); }
function showLoadingState() { const el = document.getElementById('complaints-table-body'); if (el) el.innerHTML = `<tr><td colspan="7" class="loading-state">Đang tải...</td></tr>`; }
function showErrorState(message) { const el = document.getElementById('complaints-table-body'); if (el) el.innerHTML = `<tr><td colspan="7" class="error-state">${message}</td></tr>`; }
function formatDateTime(d) { try { return d ? new Date(d).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'; } catch (e) { return 'Invalid Date'; } }

// --- HÀM MENU NGƯỜI DÙNG VÀ ĐĂNG XUẤT (ĐÃ BỎ CONFIRM + THÊM LOGOUT TRÊN LOGO) ---
function setupUserIconMenu() {
    const userIconDiv = document.querySelector('.nav-user-icon');
    const userMenu = document.querySelector('.user-menu');
    const logoutButton = document.getElementById('logoutButton');

    // Thêm kiểm tra null chặt chẽ hơn
    if (!userIconDiv || !userMenu || !logoutButton) {
        console.error("Thiếu phần tử cần thiết cho menu người dùng trong complaint.js.");
        return;
    }

    userIconDiv.addEventListener('click', (e) => { e.stopPropagation(); userMenu.classList.remove('hidden'); setTimeout(() => userMenu.classList.toggle('visible'), 0); });
    document.addEventListener('click', (e) => { if (userIconDiv && !userIconDiv.contains(e.target) && userMenu.classList.contains('visible')) userMenu.classList.remove('visible'); });
    logoutButton.addEventListener('click', () => {
        console.log("Nút logout trong menu được nhấn.");
        performLogout('../../pages/login/login.html'); // Nút logout về trang login
    });
}

// <<< HÀM XỬ LÝ LOGOUT KHI CLICK LOGO >>>
function setupLogoLogout() {
    const logoLink = document.querySelector('.nav-logo a');
    if (logoLink) {
        logoLink.addEventListener('click', (event) => {
            event.preventDefault(); // Ngăn chuyển trang ngay
            console.log("Logo clicked, logging out...");
            performLogout('../../pages/home/home.html'); // Gọi hàm logout và chuyển về trang chủ
        });
    } else {
        console.error("Không tìm thấy link logo (.nav-logo a) trong complaint.js");
    }
}

// Hàm logout dùng chung (đã bỏ confirm)
function performLogout(redirectUrl) {
    console.log(`Đang đăng xuất và chuyển đến: ${redirectUrl}...`);
    localStorage.removeItem('currentStaff'); // Xóa đúng key
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('rememberMe'); // Nếu có
    window.location.href = redirectUrl; // Chuyển hướng
}

// Thêm CSS cho trạng thái loading/error/empty
const style = document.createElement('style');
style.textContent = `
    .loading-state, .empty-state, .error-state { text-align: center; padding: 40px 20px; color: #888; font-style: italic; }
    .error-state { color: #dc3545; font-style: normal; font-weight: 500; }
`;
document.head.appendChild(style);