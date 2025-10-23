// Admin Panel JavaScript for LA CUISINE NGỌT - Connected to Database
// THÊM CONSOLE LOG ĐỂ DEBUG VÒNG LẶP

// API Configuration
const API_BASE_URL = '../api'; // Thay đổi URL này theo backend của bạn

// Global state
let currentOrderId = null;
let currentUserId = null;
let currentComplaintId = null;
let currentPromoId = null;
let revenueChart = null;
let categoryChart = null;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    console.log("DEBUG: DOM Content Loaded - Bắt đầu khởi tạo"); // Log 1
    checkAuthentication();

    console.log("DEBUG: Hiển thị trang ban đầu: products"); // Log 2
    showPage('products'); // Gọi lần đầu

    setupNavigation();
    setupEventListeners();
    console.log("DEBUG: Khởi tạo hoàn tất"); // Log
});

// ... (các hàm checkAuthentication, showAuthError, showWelcomeMessage giữ nguyên) ...
function checkAuthentication() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const jwtToken = localStorage.getItem('jwtToken');
    if (!currentUser.id || !jwtToken) {
        showAuthError('Bạn cần đăng nhập để truy cập trang quản trị!');
        return;
    }
    if (currentUser.role !== 'admin') {
        showAuthError('Bạn không có quyền truy cập trang quản trị!');
        return;
    }
    showWelcomeMessage(currentUser.full_name || currentUser.username);
}
function showAuthError(message) { /* Giữ nguyên code */ }
function showWelcomeMessage(username) { /* Giữ nguyên code */ }

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const pageName = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            console.log(`DEBUG: Click navigation link - Gọi showPage('${pageName}')`); // Log
            showPage(pageName);
        });
    });
}

function setupEventListeners() {
    // Product search
    const productSearch = document.getElementById('product-search');
    if (productSearch) {
        productSearch.addEventListener('input', debounce(() => {
            console.log("DEBUG: Product search input changed - Gọi searchProducts"); // Log
            searchProducts();
        }, 500));
    }
    // ... (các event listener khác giữ nguyên) ...
    const orderSearch = document.getElementById('order-search'); if (orderSearch) { orderSearch.addEventListener('input', debounce(() => { console.log("DEBUG: Order search input changed - Gọi searchOrders"); searchOrders() }, 500)) }
    const userSearch = document.getElementById('user-search'); if (userSearch) { userSearch.addEventListener('input', debounce(() => { console.log("DEBUG: User search input changed - Gọi searchUsers"); searchUsers() }, 500)) }
    const complaintSearch = document.getElementById('complaint-search'); if (complaintSearch) { complaintSearch.addEventListener('input', debounce(() => { console.log("DEBUG: Complaint search input changed - Gọi searchComplaints"); searchComplaints() }, 500)) }
}

// ============================================
// PAGE NAVIGATION
// ============================================

function showPage(pageName) {
    console.log(`DEBUG: --- Bắt đầu showPage('${pageName}') ---`); // Log 3
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.classList.remove('active'));

    const targetPage = document.getElementById(pageName + '-page');
    if (targetPage) {
        targetPage.classList.add('active');

        // Load data for specific page
        switch (pageName) {
            case 'products':
                console.log("DEBUG: showPage -> Gọi loadProducts()"); // Log 4
                loadProducts(); // <--- Chỉ gọi loadProducts ở đây
                break;
            case 'orders':
                console.log("DEBUG: showPage -> Gọi loadOrders()"); // Log
                loadOrders();
                break;
            case 'users':
                console.log("DEBUG: showPage -> Gọi loadUsers()"); // Log
                loadUsers();
                break;
            case 'reports':
                console.log("DEBUG: showPage -> Gọi loadReports()"); // Log
                loadReports('month');
                break;
            case 'promotions':
                console.log("DEBUG: showPage -> Gọi loadPromotions()"); // Log
                loadPromotions();
                break;
            case 'complaints':
                console.log("DEBUG: showPage -> Gọi loadComplaints()"); // Log
                loadComplaints();
                break;
        }
    }
    console.log(`DEBUG: --- Kết thúc showPage('${pageName}') ---`); // Log
}

// ============================================
// PRODUCTS MANAGEMENT
// ============================================

async function loadProducts(filters = {}) {
    console.log("DEBUG: >>> Bắt đầu loadProducts() với filters:", filters); // Log 5
    try {
        showLoading('products-tbody');

        const queryParams = new URLSearchParams(filters).toString();
        const jwtToken = localStorage.getItem('jwtToken') || 'demo';
        const response = await fetch(`${API_BASE_URL}/products.php?${queryParams}`, {
            headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        const data = await response.json();
        console.log("DEBUG: loadProducts - Received data from API:", data); // Log

        const tbody = document.getElementById('products-tbody');
        let products = [];
        if (data.success && data.data && data.data.products) { products = data.data.products } else if (data.success && data.products) { products = data.products } else if (Array.isArray(data)) { products = data }

        if (products.length > 0) {
            console.log(`DEBUG: loadProducts - Rendering ${products.length} products`); // Log
            tbody.innerHTML = products.map(product => `
                <tr>
                    <td>${product.product_id}</td>
                    <td>
                        <img src="${product.image_url || '../assets/images/placeholder.jpg'}"
                             alt="${product.product_name}"
                             class="product-image"
                             onerror="console.log('DEBUG: onerror triggered for image:', this.src); if (this.src !== '../assets/images/placeholder.jpg') this.src='../assets/images/placeholder.jpg';">
                    </td>
                    <td>${product.product_name}</td>
                    <td>${product.category_name || 'N/A'}</td>
                    <td>${formatCurrency(product.price)}</td>
                    <td>${product.quantity}</td>
                    <td>
                        <span class="status-badge status-${product.status}">
                            ${getStatusText(product.status)}
                        </span>
                    </td>
                    <td>
                        <div class="action-btns">
                            <button class="icon-btn" onclick="console.log('DEBUG: Click edit button'); editProduct(${product.product_id})" title="Sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="icon-btn" onclick="console.log('DEBUG: Click delete button'); deleteProduct(${product.product_id})" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } else {
            console.log("DEBUG: loadProducts - No products found, rendering empty state"); // Log
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Không có sản phẩm nào</td></tr>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        const tbody = document.getElementById('products-tbody');
        tbody.innerHTML = `
            <tr><td colspan="8" class="error-state">
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Không thể tải danh sách sản phẩm</p>
                    <p class="error-details">Chi tiết lỗi: ${error.message || 'Không có kết nối đến máy chủ'}</p>
                    <button onclick="console.log('DEBUG: Click retry button'); loadProducts()" class="retry-btn">Thử lại</button>
                </div>
            </td></tr>
        `;
    } finally {
        console.log("DEBUG: <<< Kết thúc loadProducts()"); // Log 6
    }
}

// ... (các hàm setupTabButtons, searchProducts, filterProducts, showAddProductModal, editProduct, saveProduct, deleteProduct giữ nguyên) ...
function setupTabButtons(selector) { const buttons = document.querySelectorAll(selector); buttons.forEach(btn => { btn.addEventListener('click', () => { buttons.forEach(b => b.classList.remove('active')); btn.classList.add('active') }) }) }
setupTabButtons('.order-tab-btn'); setupTabButtons('.user-tab-btn'); setupTabButtons('.promo-tab-btn'); setupTabButtons('.tab-btn');
async function searchProducts() { console.log("DEBUG: searchProducts called"); const searchTerm = document.getElementById('product-search').value; const category = document.getElementById('category-filter').value; await loadProducts({ search: searchTerm, category: category }) }
function filterProducts() { console.log("DEBUG: filterProducts called"); searchProducts() }
function showAddProductModal() { document.getElementById('product-modal-title').textContent = 'Thêm sản phẩm mới'; document.getElementById('product-id').value = ''; document.getElementById('product-name').value = ''; document.getElementById('product-category').value = ''; document.getElementById('product-price').value = ''; document.getElementById('product-quantity').value = ''; document.getElementById('product-description').value = ''; document.getElementById('productModal').classList.add('active') }
async function editProduct(productId) { console.log("DEBUG: editProduct called for ID:", productId); try { const response = await fetch(`${API_BASE_URL}/products.php/${productId}`, { headers: { 'Authorization': 'Bearer demo' } }); const data = await response.json(); if (data.success) { const product = data.data; document.getElementById('product-modal-title').textContent = 'Chỉnh sửa sản phẩm'; document.getElementById('product-id').value = product.product_id; document.getElementById('product-name').value = product.product_name; document.getElementById('product-category').value = product.category_id; document.getElementById('product-price').value = product.price; document.getElementById('product-quantity').value = product.quantity; document.getElementById('product-description').value = product.description || ''; document.getElementById('productModal').classList.add('active') } else { throw new Error(data.message || 'Failed to load product') } } catch (error) { console.error('Error loading product:', error); showError('Không thể tải thông tin sản phẩm') } }
async function saveProduct() { console.log("DEBUG: saveProduct called"); const productId = document.getElementById('product-id').value; const productData = { product_name: document.getElementById('product-name').value, category_id: document.getElementById('product-category').value, price: document.getElementById('product-price').value, quantity: document.getElementById('product-quantity').value, description: document.getElementById('product-description').value }; if (!productData.product_name || !productData.category_id || !productData.price) { showError('Vui lòng điền đầy đủ thông tin bắt buộc'); return } try { const url = productId ? `${API_BASE_URL}/products.php/${productId}` : `${API_BASE_URL}/products.php`; const method = productId ? 'PUT' : 'POST'; const response = await fetch(url, { method: method, headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer demo' }, body: JSON.stringify(productData) }); const data = await response.json(); if (data.success) { showSuccess(productId ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công'); closeModal('productModal'); console.log("DEBUG: saveProduct successful - Calling loadProducts"); loadProducts() } else { throw new Error(data.message || 'Failed to save product') } } catch (error) { console.error('Error saving product:', error); showError('Không thể lưu sản phẩm') } }
async function deleteProduct(productId) { console.log("DEBUG: deleteProduct called for ID:", productId); if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return; try { const response = await fetch(`${API_BASE_URL}/products.php/${productId}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer demo' } }); const data = await response.json(); if (data.success) { showSuccess('Xóa sản phẩm thành công'); console.log("DEBUG: deleteProduct successful - Calling loadProducts"); loadProducts() } else { throw new Error(data.message || 'Failed to delete product') } } catch (error) { console.error('Error deleting product:', error); showError('Không thể xóa sản phẩm') } }

// ... (các hàm quản lý Orders, Users, Reports, Promotions, Complaints giữ nguyên) ...
async function loadOrders(filters = {}) {/* Giữ nguyên code */ }
async function searchOrders() {/* Giữ nguyên code */ }
async function filterOrders(status) {/* Giữ nguyên code */ }
async function viewOrderDetail(orderId) {/* Giữ nguyên code */ }
async function updateOrderStatus() {/* Giữ nguyên code */ }
async function loadUsers(filters = {}) {/* Giữ nguyên code */ }
async function searchUsers() {/* Giữ nguyên code */ }
async function filterUsers(role) {/* Giữ nguyên code */ }
function showAddUserModal() {/* Giữ nguyên code */ }
async function editUser(userId) {/* Giữ nguyên code */ }
async function saveUser() {/* Giữ nguyên code */ }
async function deleteUser(userId) {/* Giữ nguyên code */ }
async function loadReports(period) {/* Giữ nguyên code */ }
function loadTopProducts(products) {/* Giữ nguyên code */ }
function loadReportData(period) {/* Giữ nguyên code */ }
function initCharts(chartData) {/* Giữ nguyên code */ }
async function loadPromotions(filters = {}) {/* Giữ nguyên code */ }
async function filterPromotions(status) {/* Giữ nguyên code */ }
async function createPromotion() {/* Giữ nguyên code */ }
async function viewPromoDetail(promoId) {/* Giữ nguyên code */ }
async function loadComplaints(filters = {}) {/* Giữ nguyên code */ }
async function searchComplaints() {/* Giữ nguyên code */ }
async function filterComplaints(status) {/* Giữ nguyên code */ }
async function viewComplaintDetail(complaintId) {/* Giữ nguyên code */ }
async function updateComplaintStatus() {/* Giữ nguyên code */ }

// ... (các hàm UTILITY FUNCTIONS giữ nguyên) ...
function closeModal(modalId) { document.getElementById(modalId).classList.remove('active') }
window.addEventListener('click', function (event) { const modals = document.querySelectorAll('.modal'); modals.forEach(modal => { if (event.target === modal) { modal.classList.remove('active') } }) });
function formatCurrency(amount) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount) }
function formatDate(dateString) { if (!dateString) return 'N/A'; const date = new Date(dateString); return date.toLocaleDateString('vi-VN') }
function formatDateTime(dateString) { if (!dateString) return 'N/A'; const date = new Date(dateString); return date.toLocaleString('vi-VN') }
function getStatusText(status) { const statusMap = { 'available': 'Còn hàng', 'out_of_stock': 'Hết hàng', 'discontinued': 'Ngừng bán', 'active': 'Hoạt động', 'inactive': 'Không hoạt động', 'banned': 'Bị khóa' }; return statusMap[status] || status }
function getOrderStatusText(status) { const statusMap = { 'pending': 'Chờ xử lý', 'confirmed': 'Đã xác nhận', 'preparing': 'Đang chuẩn bị', 'shipping': 'Đang giao', 'completed': 'Hoàn thành', 'cancelled': 'Đã hủy' }; return statusMap[status] || status }
function getPaymentStatusText(status) { const statusMap = { 'pending': 'Chờ thanh toán', 'paid': 'Đã thanh toán', 'failed': 'Thất bại', 'refunded': 'Đã hoàn tiền' }; return statusMap[status] || status }
function getRoleText(role) { const roleMap = { 'admin': 'Quản trị viên', 'staff': 'Nhân viên', 'customer': 'Khách hàng' }; return roleMap[role] || role }
function getPromoStatusText(status) { const statusMap = { 'pending': 'Chưa áp dụng', 'active': 'Đang áp dụng', 'expired': 'Hết hạn', 'cancelled': 'Đã hủy' }; return statusMap[status] || status }
function getPromoTypeText(type) { const typeMap = { 'percent': 'Giảm giá %', 'fixed_amount': 'Giảm giá VNĐ', 'free_shipping': 'Miễn phí vận chuyển', 'gift': 'Quà tặng' }; return typeMap[type] || type }
function getComplaintStatusText(status) { const statusMap = { 'pending': 'Chờ xử lý', 'processing': 'Đang xử lý', 'resolved': 'Đã xử lý', 'closed': 'Đã đóng', 'rejected': 'Từ chối' }; return statusMap[status] || status }
function getComplaintTypeText(type) { const typeMap = { 'product_quality': 'Chất lượng sản phẩm', 'delivery': 'Vấn đề giao hàng', 'service': 'Dịch vụ', 'other': 'Khác' }; return typeMap[type] || type }
function formatPromoValue(promo) { if (promo.promotion_type === 'percent') { return promo.discount_value + '%' } else if (promo.promotion_type === 'fixed_amount') { return formatCurrency(promo.discount_value) } else if (promo.promotion_type === 'free_shipping') { return 'Miễn phí vận chuyển' } return 'N/A' }
function showLoading(elementId) { const element = document.getElementById(elementId); if (element) { element.innerHTML = '<tr><td colspan="100%" class="loading">Đang tải dữ liệu...</td></tr>' } }
function showSuccess(message) { let successEl = document.querySelector('.success-message'); if (!successEl) { successEl = document.createElement('div'); successEl.className = 'success-message'; document.querySelector('.content-container').prepend(successEl) } successEl.textContent = message; successEl.classList.add('show'); setTimeout(() => { successEl.classList.remove('show') }, 3000) }
function showError(message) { let errorEl = document.querySelector('.error-message'); if (!errorEl) { errorEl = document.createElement('div'); errorEl.className = 'error-message'; document.querySelector('.content-container').prepend(errorEl) } errorEl.textContent = message; errorEl.classList.add('show'); setTimeout(() => { errorEl.classList.remove('show') }, 3000) }
function debounce(func, wait) { let timeout; return function executedFunction(...args) { const later = () => { clearTimeout(timeout); func(...args) }; clearTimeout(timeout); timeout = setTimeout(later, wait) } }

// ... (các hàm EXPORT FUNCTIONS giữ nguyên) ...
function exportReport(type) { console.log('Exporting report:', type); alert('Chức năng xuất báo cáo ' + type + ' sẽ được triển khai.') }
function printReport() { window.print() }
function editPromotion() { alert('Chức năng chỉnh sửa khuyến mãi sẽ được triển khai.'); closeModal('promoDetailModal') }