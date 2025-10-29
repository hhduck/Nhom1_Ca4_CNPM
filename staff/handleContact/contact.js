// contact.js - Xử lý trang Quản lý Liên hệ (Phiên bản tương thích layout mới)

let allContacts = [];
let currentContactId = null;

// Map trạng thái sang tiếng Việt
const CONTACT_STATUS_MAP = {
    pending: 'Chưa xử lý',
    responded: 'Đã phản hồi'
};

document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra đăng nhập trước
    const staffDataString = localStorage.getItem("currentStaff");
    const jwtToken = localStorage.getItem("jwtToken");
    if (!staffDataString || !jwtToken) {
        alert("Vui lòng đăng nhập với tài khoản nhân viên/admin.");
        window.location.href = "../../pages/login/login.html";
        return;
    }

    fetchContacts();
    setupEventListeners();
    setupUserIconMenu(); // Gọi hàm setup menu
});

function setupEventListeners() {
    // Bộ lọc trạng thái
    document.querySelectorAll('.contact-filter').forEach(radio => {
        radio.addEventListener('change', applyFilters);
    });

    // Ô tìm kiếm
    const searchInput = document.getElementById('contact-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300)); // Thời gian debounce ngắn hơn
    }

    // Click vào bảng (icon xem)
    document.getElementById('contacts-table-body').addEventListener('click', handleTableViewClick);

    // Nút đóng modal
    document.getElementById('closeContactModalBtn').addEventListener('click', closeModal);

    // Nút "Đánh dấu Đã phản hồi"
    document.getElementById('markRespondedBtn').addEventListener('click', markAsResponded);

    // Đóng modal khi click ra ngoài backdrop
    const modalBackdrop = document.getElementById('contactDetailModal');
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (event) => {
            if (event.target === modalBackdrop) {
                closeModal();
            }
        });
    }
}


// Hàm lấy Auth Headers
function getAuthHeaders() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        console.error("Không tìm thấy JWT Token!");
        logoutAndRedirect(); // Nên có hàm này để redirect nếu mất token
        return null;
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Gọi API lấy danh sách liên hệ
async function fetchContacts() {
    console.log("Đang tải danh sách liên hệ...");
    showLoading();
    const headers = getAuthHeaders();
    if (!headers) {
        showError("Lỗi xác thực. Vui lòng đăng nhập lại.");
        return;
    }

    try {
        const response = await fetch('../../api/contacts.php', { method: 'GET', headers: headers });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Lỗi HTTP ${response.status}` }));
            throw new Error(errorData.message || `Lỗi HTTP ${response.status}`);
        }
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
            allContacts = result.data;
            applyFilters(); // Hiển thị dữ liệu
        } else {
            allContacts = [];
            showError(result.message || "Lỗi không xác định từ API");
        }
    } catch (error) {
        console.error('Lỗi khi tải danh sách liên hệ:', error);
        showError('Không thể tải danh sách liên hệ. ' + error.message);
    }
}

// Áp dụng bộ lọc và tìm kiếm
function applyFilters() {
    const selectedStatus = document.querySelector('.contact-filter:checked').value;
    const searchTerm = document.getElementById('contact-search-input').value.toLowerCase().trim();

    const filteredContacts = allContacts.filter(contact => {
        const statusMatch = (selectedStatus === 'all') || (contact.Status === selectedStatus);
        const searchMatch = !searchTerm ||
            (contact.CustomerName && contact.CustomerName.toLowerCase().includes(searchTerm)) ||
            (contact.CustomerEmail && contact.CustomerEmail.toLowerCase().includes(searchTerm)) ||
            (contact.CustomerPhone && contact.CustomerPhone.toLowerCase().includes(searchTerm)) ||
            (contact.Subject && contact.Subject.toLowerCase().includes(searchTerm));
        return statusMatch && searchMatch;
    });

    renderContactList(filteredContacts);
}


// Hiển thị danh sách liên hệ ra bảng
function renderContactList(contacts) {
    const tableBody = document.getElementById('contacts-table-body');
    tableBody.innerHTML = '';

    if (contacts.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Không có liên hệ nào phù hợp.</td></tr>`; // Sử dụng class empty-state
        return;
    }

    contacts.forEach(contact => {
        const row = document.createElement('tr');
        row.dataset.contactInfo = JSON.stringify(contact); // Lưu data

        const statusText = CONTACT_STATUS_MAP[contact.Status] || contact.Status;
        const statusClass = `status-badge status-contact-${contact.Status || 'unknown'}`;

        row.innerHTML = `
            <td>${contact.CustomerName || 'N/A'}</td>
            <td>${contact.CustomerEmail || 'N/A'}</td>
            <td>${contact.CustomerPhone || 'N/A'}</td>
            <td>${contact.Subject || 'N/A'}</td>
            <td>${formatDateTime(contact.CreatedAt)}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td>
                <a href="#" class="view-contact-icon" title="Xem chi tiết">
                    <i class="fas fa-eye"></i>
                </a>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Xử lý khi click vào icon xem trong bảng
function handleTableViewClick(event) {
    const viewIcon = event.target.closest('.view-contact-icon');
    if (viewIcon) {
        event.preventDefault();
        const row = viewIcon.closest('tr');
        if (row && row.dataset.contactInfo) {
            try {
                const contactData = JSON.parse(row.dataset.contactInfo);
                openContactModal(contactData);
            } catch (e) {
                console.error("Lỗi parse dữ liệu contact:", e);
                alert("Không thể hiển thị chi tiết liên hệ này.");
            }
        }
    }
}

// Mở và điền dữ liệu vào modal
function openContactModal(contact) {
    currentContactId = contact.ContactID;
    const modal = document.getElementById('contactDetailModal');
    const modalContent = modal.querySelector('.contact-modal-content');

    // Điền thông tin
    document.getElementById('modalCustomerName').textContent = contact.CustomerName || 'N/A';
    document.getElementById('modalCustomerEmail').textContent = contact.CustomerEmail || 'N/A';
    document.getElementById('modalCustomerPhone').textContent = contact.CustomerPhone || 'N/A';
    document.getElementById('modalCustomerAddress').textContent = contact.CustomerAddress || 'N/A'; // Thêm địa chỉ
    document.getElementById('modalCreatedAt').textContent = formatDateTime(contact.CreatedAt);
    document.getElementById('modalSubject').textContent = contact.Subject || 'N/A';
    document.getElementById('modalMessageContent').textContent = contact.Message || '(Không có nội dung)';

    // Cập nhật trạng thái
    const statusSpan = document.getElementById('modalStatus');
    statusSpan.textContent = CONTACT_STATUS_MAP[contact.Status] || contact.Status;
    statusSpan.className = `status-badge status-contact-${contact.Status || 'unknown'}`;
    modalContent.dataset.status = contact.Status; // Cập nhật data attribute

    // Thông tin người phản hồi
    const responderInfoRows = modal.querySelectorAll('.responder-info');
    if (contact.Status === 'responded') {
        document.getElementById('modalResponderName').textContent = contact.ResponderName || '(Không rõ)';
        document.getElementById('modalRespondedAt').textContent = formatDateTime(contact.RespondedAt);
        responderInfoRows.forEach(row => row.style.display = 'flex'); // Hiện
    } else {
        responderInfoRows.forEach(row => row.style.display = 'none'); // Ẩn
    }

    modal.classList.add('visible');
}

// Đóng modal
function closeModal() {
    currentContactId = null;
    const modal = document.getElementById('contactDetailModal');
    modal.classList.remove('visible');
    // Reset lại trạng thái nút (nếu cần)
    const markButton = document.getElementById('markRespondedBtn');
    markButton.disabled = false;
    markButton.textContent = "Đánh dấu Đã phản hồi";
}

// Gọi API để đánh dấu đã phản hồi
async function markAsResponded() {
    if (!currentContactId) return;

    // Bỏ confirm nếu muốn đánh dấu ngay
    // const confirmMark = confirm("Bạn chắc chắn muốn đánh dấu liên hệ này là ĐÃ PHẢN HỒI?");
    // if (!confirmMark) return;

    const markButton = document.getElementById('markRespondedBtn');
    markButton.disabled = true;
    markButton.textContent = "Đang xử lý...";

    const headers = getAuthHeaders();
    if (!headers) { /* ... xử lý lỗi ... */ return; }

    try {
        const response = await fetch(`../../api/contacts.php/${currentContactId}`, {
            method: 'PUT',
            headers: headers
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || `Lỗi ${response.status}`);

        alert("✅ Đã đánh dấu phản hồi thành công!");
        closeModal();
        fetchContacts(); // Tải lại danh sách
    } catch (error) {
        console.error("Lỗi khi đánh dấu đã phản hồi:", error);
        alert(`❌ Lỗi: ${error.message}`);
        // Không reset nút ở đây nếu lỗi, để người dùng biết
        markButton.disabled = false; // Có thể bật lại nút nếu muốn cho thử lại
        markButton.textContent = "Đánh dấu Đã phản hồi";
    }
    // finally không cần reset nút nếu muốn giữ trạng thái loading khi lỗi
}


// --- Các hàm tiện ích ---

function showLoading() {
    const tableBody = document.getElementById('contacts-table-body');
    // Sử dụng class empty-state để nhất quán
    tableBody.innerHTML = `<tr><td colspan="7" class="empty-state" style="padding: 40px 0;">Đang tải dữ liệu...</td></tr>`;
}

function showError(message) {
    const tableBody = document.getElementById('contacts-table-body');
    // Sử dụng class error-state
    tableBody.innerHTML = `<tr><td colspan="7" class="error-state" style="padding: 40px 0; color: red;">${message}</td></tr>`;
}

// Format ngày giờ (giữ nguyên)
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
    } catch (e) { return dateString; }
}

// Debounce (giữ nguyên)
function debounce(func, wait) { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func(...args), wait); }; }


// --- HÀM MENU NGƯỜI DÙNG VÀ ĐĂNG XUẤT (Giữ nguyên) ---
function setupUserIconMenu() {
    const userIconDiv = document.querySelector('.nav-user-icon');
    const userMenu = document.querySelector('.user-menu');
    const logoutButton = document.getElementById('logoutButton');
    if (!userIconDiv || !userMenu || !logoutButton) return; // Thoát nếu thiếu
    userIconDiv.addEventListener('click', (e) => { e.stopPropagation(); userMenu.classList.remove('hidden'); setTimeout(() => userMenu.classList.toggle('visible'), 0); });
    document.addEventListener('click', (e) => { if (!userIconDiv.contains(e.target) && userMenu.classList.contains('visible')) userMenu.classList.remove('visible'); });
    logoutButton.addEventListener('click', () => performLogout('../../pages/login/login.html'));
}
function performLogout(redirectUrl) {
    console.log("Đang đăng xuất...");
    localStorage.removeItem('currentStaff');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('rememberMe');
    window.location.href = redirectUrl;
}

// Thêm class empty-state và error-state vào CSS nếu chưa có
const style = document.createElement('style');
style.textContent = `
    .empty-state, .error-state {
        text-align: center;
        padding: 40px 20px;
        color: #888;
        font-style: italic;
    }
    .error-state {
        color: #dc3545; /* Màu đỏ Bootstrap */
        font-style: normal;
        font-weight: 500;
    }
`;
document.head.appendChild(style);