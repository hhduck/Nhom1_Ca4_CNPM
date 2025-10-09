/**
 * Admin Panel JavaScript
 * Handles admin functionality for LA CUISINE NGỌT
 */

// Admin page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check admin authentication
    if (!isAdmin()) {
        showMessage('Bạn không có quyền truy cập trang này!', 'error');
        setTimeout(() => {
            window.location.href = '../pages/login/login.html';
        }, 2000);
        return;
    }
    
    // Setup admin navigation
    setupAdminNavigation();
    
    // Load default content
    loadAdminContent('dashboard');
});

function isAdmin() {
    // In production, check JWT token and user role
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.role === 'admin';
}

function setupAdminNavigation() {
    const adminNav = document.querySelector('.admin-nav');
    
    adminNav.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            
            // Remove active class from all links
            adminNav.querySelectorAll('a').forEach(link => link.classList.remove('active'));
            
            // Add active class to clicked link
            e.target.classList.add('active');
            
            // Load content
            const tabType = e.target.dataset.tab;
            loadAdminContent(tabType);
        }
    });
}

function loadAdminContent(tabType) {
    const content = document.getElementById('adminContent');
    
    switch(tabType) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'contacts':
            loadContacts();
            break;
        case 'statistics':
            loadStatistics();
            break;
        default:
            loadDashboard();
    }
}

function loadDashboard() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="dashboard">
            <h3>Tổng quan hệ thống</h3>
            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <div class="stat-content">
                        <h4>Đơn hàng hôm nay</h4>
                        <p class="stat-number">12</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="stat-content">
                        <h4>Doanh thu hôm nay</h4>
                        <p class="stat-number">3,500,000 VNĐ</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-content">
                        <h4>Khách hàng mới</h4>
                        <p class="stat-number">5</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-box"></i>
                    </div>
                    <div class="stat-content">
                        <h4>Sản phẩm</h4>
                        <p class="stat-number">24</p>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-charts">
                <div class="chart-container">
                    <h4>Doanh thu 7 ngày qua</h4>
                    <div id="chartRevenue7"></div>
                </div>
                <div class="chart-container">
                    <h4>Sản phẩm bán chạy</h4>
                    <div id="chartTopProducts"></div>
                </div>
            </div>
        </div>
    `;
    renderCharts();
}

function loadProducts() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="products-management">
            <div class="management-header">
                <h3>Quản lý sản phẩm</h3>
                <button class="btn-primary" onclick="addProduct()">
                    <i class="fas fa-plus"></i> Thêm sản phẩm mới
                </button>
            </div>
            
            <div class="management-filters">
                <input type="text" placeholder="Tìm kiếm sản phẩm..." id="productSearch">
                <select id="categoryFilter">
                    <option value="">Tất cả danh mục</option>
                    <option value="1">Bánh sinh nhật</option>
                    <option value="2">Bánh cưới</option>
                    <option value="3">Bánh tráng miệng</option>
                </select>
                <button class="btn-secondary" onclick="filterProducts()">Lọc</button>
            </div>
            
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Hình ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>Danh mục</th>
                            <th>Giá</th>
                            <th>Tồn kho</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="productsTableBody"></tbody>
                </table>
            </div>
        </div>
    `;

    fetchProducts();
}

function loadOrders() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="orders-management">
            <div class="management-header">
                <h3>Quản lý đơn hàng</h3>
                <div class="order-filters">
                    <select id="orderStatusFilter">
                        <option value="">Tất cả trạng thái</option>
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="shipped">Đang giao</option>
                        <option value="delivered">Đã giao</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                    <button class="btn-secondary" onclick="filterOrders()">Lọc</button>
                </div>
            </div>
            
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Mã đơn hàng</th>
                            <th>Khách hàng</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Ngày đặt</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="ordersTableBody"></tbody>
                </table>
            </div>
        </div>
    `;

    fetchOrders();
}

function loadCustomers() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="customers-management">
            <div class="management-header">
                <h3>Quản lý khách hàng</h3>
                <input type="text" placeholder="Tìm kiếm khách hàng..." id="customerSearch">
            </div>
            
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên khách hàng</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Địa chỉ</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="customersTableBody"></tbody>
                </table>
            </div>
        </div>
    `;

    fetchCustomers();
}

function loadContacts() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="contacts-management">
            <div class="management-header">
                <h3>Quản lý liên hệ</h3>
                <div class="contact-filters">
                    <select id="contactStatusFilter">
                        <option value="">Tất cả trạng thái</option>
                        <option value="new">Mới</option>
                        <option value="read">Đã đọc</option>
                        <option value="replied">Đã trả lời</option>
                        <option value="closed">Đã đóng</option>
                    </select>
                    <button class="btn-secondary" onclick="filterContacts()">Lọc</button>
                </div>
            </div>
            
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Chủ đề</th>
                            <th>Trạng thái</th>
                            <th>Ngày gửi</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="contactsTableBody"></tbody>
                </table>
            </div>
        </div>
    `;

    fetchContacts();
}

function loadStatistics() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="statistics-management">
            <h3>Thống kê và báo cáo</h3>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>Doanh thu tháng này</h4>
                    <p class="stat-number">15,000,000 VNĐ</p>
                    <span class="stat-change positive">+12% so với tháng trước</span>
                </div>
                <div class="stat-card">
                    <h4>Tổng đơn hàng</h4>
                    <p class="stat-number">45</p>
                    <span class="stat-change positive">+8% so với tháng trước</span>
                </div>
                <div class="stat-card">
                    <h4>Khách hàng mới</h4>
                    <p class="stat-number">23</p>
                    <span class="stat-change positive">+15% so với tháng trước</span>
                </div>
                <div class="stat-card">
                    <h4>Sản phẩm bán chạy</h4>
                    <p class="stat-number">Bánh Chocolate</p>
                    <span class="stat-change">25 đơn hàng</span>
                </div>
            </div>
            
            <div class="charts-section">
                <div class="chart-card">
                    <h4>Biểu đồ doanh thu</h4>
                    <div id="chartRevenue7b"></div>
                </div>
                <div class="chart-card">
                    <h4>Biểu đồ đơn hàng</h4>
                    <div id="chartTopProductsB"></div>
                </div>
            </div>
        </div>
    `;
    renderCharts(true);
}

// Admin action functions
function addProduct() {
    openProductModal();
}

function editProduct(id) {
    openProductModal(id);
}

function deleteProduct(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    const token = localStorage.getItem('jwtToken') || '';
    fetch(`../api/products.php/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(r => r.json()).then(res => {
        if (res.success) {
            showMessage('Đã xóa sản phẩm', 'success');
            fetchProducts();
        } else {
            showMessage(res.message || 'Xóa sản phẩm thất bại', 'error');
        }
    }).catch(() => showMessage('Lỗi kết nối máy chủ', 'error'));
}

function viewOrder(orderNumber) {
    showMessage(`Xem chi tiết đơn hàng: ${orderNumber}`, 'info');
}

function updateOrderStatus(orderId) {
    openOrderStatusModal(orderId);
}

function editCustomer(id) {
    openCustomerModal(id);
}

function toggleCustomerStatus(id) {
    openCustomerStatusModal(id);
}

function viewContact(id) {
    showMessage(`Xem chi tiết liên hệ ID: ${id}`, 'info');
}

function replyContact(id) {
    updateContactStatus(id, 'replied');
}

function filterProducts() {
    fetchProducts();
}

function filterOrders() {
    fetchOrders();
}

function filterContacts() {
    fetchContacts();
}

function updateContactStatus(id, status) {
    fetch(`../api/contact.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ status })
    }).then(r => r.json()).then(res => {
        if (res.success) { showMessage('Cập nhật liên hệ thành công', 'success'); fetchContacts(); }
        else { showMessage(res.message || 'Cập nhật thất bại', 'error'); }
    }).catch(() => showMessage('Lỗi kết nối máy chủ', 'error'));
}

function deleteContact(id) {
    if (!confirm('Xóa liên hệ này?')) return;
    fetch(`../api/contact.php?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    }).then(r => r.json()).then(res => {
        if (res.success) { showMessage('Đã xóa liên hệ', 'success'); fetchContacts(); }
        else { showMessage(res.message || 'Xóa thất bại', 'error'); }
    }).catch(() => showMessage('Lỗi kết nối máy chủ', 'error'));
}

// ----- Charts -----
function renderCharts(secondary = false) {
    const token = getAuthToken();
    Promise.all([
        fetch('../api/statistics.php?type=revenue7days', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
        fetch('../api/statistics.php?type=topProducts', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ]).then(([rev, top]) => {
        const revData = (rev.data?.revenue7days || []).map(d => `${d.day}: ${formatCurrency(d.revenue)}`).join('<br>');
        const topData = (top.data?.topProducts || []).map(t => `${t.product_name}: ${t.quantity}`).join('<br>');
        const revEl = document.getElementById(secondary ? 'chartRevenue7b' : 'chartRevenue7');
        const topEl = document.getElementById(secondary ? 'chartTopProductsB' : 'chartTopProducts');
        if (revEl) revEl.innerHTML = revData || 'Không có dữ liệu';
        if (topEl) topEl.innerHTML = topData || 'Không có dữ liệu';
    }).catch(() => {
        const revEl = document.getElementById(secondary ? 'chartRevenue7b' : 'chartRevenue7');
        const topEl = document.getElementById(secondary ? 'chartTopProductsB' : 'chartTopProducts');
        if (revEl) revEl.innerHTML = 'Lỗi tải biểu đồ';
        if (topEl) topEl.innerHTML = 'Lỗi tải biểu đồ';
    });
}

function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('currentUser');
        showMessage('Đã đăng xuất thành công!', 'success');
        setTimeout(() => {
            window.location.href = '../pages/login/login.html';
        }, 1000);
    }
}

// ----- Data fetching helpers -----
function getAuthToken() {
    // Expect token saved from backend auth
    return localStorage.getItem('jwtToken') || '';
}

function fetchProducts() {
    const qs = new URLSearchParams();
    const search = document.getElementById('productSearch')?.value.trim();
    const cat = document.getElementById('categoryFilter')?.value;
    if (search) qs.set('search', search);
    if (cat) qs.set('category', cat);
    fetch(`../api/products.php?${qs.toString()}`)
        .then(r => r.json())
        .then(res => {
            const tbody = document.getElementById('productsTableBody');
            if (!res.success) { tbody.innerHTML = '<tr><td colspan="8">Lỗi tải dữ liệu</td></tr>'; return; }
            const rows = (res.data.products || []).map(p => `
                <tr>
                    <td>${p.id}</td>
                    <td><img src="../${p.image_url || 'assets/images/placeholder-cake.jpg'}" class="table-image" onerror="this.src='../assets/images/placeholder-cake.jpg'"></td>
                    <td>${p.name}</td>
                    <td>${p.category_name || ''}</td>
                    <td>${formatCurrency(p.price)}</td>
                    <td>${p.stock_quantity ?? 0}</td>
                    <td><span class="status ${p.is_active === false ? 'inactive' : 'active'}">${p.is_active === false ? 'Ngưng' : 'Hoạt động'}</span></td>
                    <td>
                        <button class="btn-edit" onclick="editProduct(${p.id})">Sửa</button>
                        <button class="btn-delete" onclick="deleteProduct(${p.id})">Xóa</button>
                    </td>
                </tr>
            `).join('');
            tbody.innerHTML = rows || '<tr><td colspan="8">Không có dữ liệu</td></tr>';
        })
        .catch(() => {
            const tbody = document.getElementById('productsTableBody');
            tbody.innerHTML = '<tr><td colspan="8">Lỗi kết nối máy chủ</td></tr>';
        });
}

function fetchOrders() {
    const qs = new URLSearchParams();
    const status = document.getElementById('orderStatusFilter')?.value;
    if (status) qs.set('status', status);
    fetch(`../api/orders.php?${qs.toString()}`, { headers: { 'Authorization': `Bearer ${getAuthToken()}` } })
        .then(r => r.json())
        .then(res => {
            const tbody = document.getElementById('ordersTableBody');
            if (!res.success) { tbody.innerHTML = '<tr><td colspan="6">Lỗi tải dữ liệu</td></tr>'; return; }
            const rows = (res.data.orders || []).map(o => `
                <tr>
                    <td>#${o.order_number}</td>
                    <td>${o.customer_name}</td>
                    <td>${formatCurrency(o.total_amount)}</td>
                    <td><span class="status ${o.status}">${translateStatus(o.status)}</span></td>
                    <td>${o.created_at}</td>
                    <td>
                        <button class="btn-edit" onclick="viewOrder(${o.id})">Xem</button>
                        <button class="btn-edit" onclick="updateOrderStatus(${o.id})">Cập nhật</button>
                    </td>
                </tr>
            `).join('');
            tbody.innerHTML = rows || '<tr><td colspan="6">Không có dữ liệu</td></tr>';
        })
        .catch(() => {
            const tbody = document.getElementById('ordersTableBody');
            tbody.innerHTML = '<tr><td colspan="6">Lỗi kết nối máy chủ</td></tr>';
        });
}

function fetchCustomers() {
    // Requires users API, placeholder until implemented
    const tbody = document.getElementById('customersTableBody');
    tbody.innerHTML = '<tr><td colspan="7">Đang phát triển API khách hàng...</td></tr>';
}

function fetchContacts() {
    const qs = new URLSearchParams();
    const status = document.getElementById('contactStatusFilter')?.value;
    if (status) qs.set('status', status);
    fetch(`../api/contact.php?${qs.toString()}`, { headers: { 'Authorization': `Bearer ${getAuthToken()}` } })
        .then(r => r.json())
        .then(res => {
            const tbody = document.getElementById('contactsTableBody');
            if (!res.success) { tbody.innerHTML = '<tr><td colspan="8">Lỗi tải dữ liệu</td></tr>'; return; }
            const rows = (res.data.contacts || []).map(c => `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.full_name}</td>
                    <td>${c.email}</td>
                    <td>${c.phone || ''}</td>
                    <td>${c.subject || ''}</td>
                    <td><span class="status ${c.status}">${translateContactStatus(c.status)}</span></td>
                    <td>${c.created_at}</td>
                    <td>
                        <button class="btn-edit" onclick="viewContact(${c.id})">Xem</button>
                        <button class="btn-edit" onclick="replyContact(${c.id})">Trả lời</button>
                        <button class="btn-delete" onclick="deleteContact(${c.id})">Xóa</button>
                    </td>
                </tr>
            `).join('');
            tbody.innerHTML = rows || '<tr><td colspan="8">Không có dữ liệu</td></tr>';
        })
        .catch(() => {
            const tbody = document.getElementById('contactsTableBody');
            tbody.innerHTML = '<tr><td colspan="8">Lỗi kết nối máy chủ</td></tr>';
        });
}

function translateStatus(s) {
    const map = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', processing: 'Đang xử lý', shipped: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy' };
    return map[s] || s;
}

function translateContactStatus(s) {
    const map = { new: 'Mới', read: 'Đã đọc', replied: 'Đã trả lời', closed: 'Đã đóng' };
    return map[s] || s;
}

function formatCurrency(v) {
    try { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0); } catch { return v; }
}

// ----- Modals -----
function openProductModal(id) {
    const isEdit = !!id;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>${isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h3>
                <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            <div class="modal-body">
                <form id="productForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Tên sản phẩm</label>
                            <input type="text" name="name" required>
                        </div>
                        <div class="form-group">
                            <label>Giá</label>
                            <input type="number" name="price" min="0" required>
                        </div>
                        <div class="form-group">
                            <label>Danh mục</label>
                            <select name="category_id" required>
                                <option value="1">Bánh sinh nhật</option>
                                <option value="2">Bánh cưới</option>
                                <option value="3">Bánh tráng miệng</option>
                                <option value="4">Bánh theo mùa</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Tồn kho</label>
                            <input type="number" name="stock_quantity" min="0" value="0">
                        </div>
                        <div class="form-group full">
                            <label>Mô tả</label>
                            <textarea name="description"></textarea>
                        </div>
                        <div class="form-group full">
                            <label>Ảnh (URL)</label>
                            <input type="text" name="image_url">
                        </div>
                        <div class="form-group full">
                            <label>Thành phần</label>
                            <textarea name="ingredients"></textarea>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" name="is_featured"> Nổi bật
                            </label>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Hủy</button>
                        <button type="submit" class="btn-primary">${isEdit ? 'Cập nhật' : 'Tạo mới'}</button>
                    </div>
                </form>
            </div>
        </div>`;
    document.body.appendChild(modal);

    const form = modal.querySelector('#productForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(form).entries());
        formData.price = parseFloat(formData.price);
        formData.category_id = parseInt(formData.category_id, 10);
        formData.stock_quantity = parseInt(formData.stock_quantity || '0', 10);
        formData.is_featured = !!form.querySelector('input[name="is_featured"]').checked;
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `../api/products.php/${id}` : '../api/products.php';
        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
            body: JSON.stringify(formData)
        }).then(r => r.json()).then(res => {
            if (res.success) {
                showMessage(isEdit ? 'Cập nhật sản phẩm thành công' : 'Tạo sản phẩm thành công', 'success');
                modal.remove();
                fetchProducts();
            } else {
                showMessage(res.message || 'Thao tác thất bại', 'error');
            }
        }).catch(() => showMessage('Lỗi kết nối máy chủ', 'error'));
    });

    if (isEdit) {
        // Load product detail
        fetch(`../api/products.php/${id}`).then(r => r.json()).then(res => {
            if (res.success) {
                const p = res.data;
                form.name.value = p.name || '';
                form.price.value = p.price || 0;
                form.category_id.value = p.category_id || '';
                form.stock_quantity.value = p.stock_quantity || 0;
                form.description.value = p.description || '';
                form.image_url.value = p.image_url || '';
                form.ingredients.value = p.ingredients || '';
                form.querySelector('input[name="is_featured"]').checked = !!p.is_featured;
            }
        });
    }
}

function openOrderStatusModal(orderId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>Cập nhật trạng thái đơn hàng</h3>
                <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            <div class="modal-body">
                <form id="orderStatusForm">
                    <div class="form-group">
                        <label>Trạng thái</label>
                        <select name="status">
                            <option value="pending">Chờ xác nhận</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="processing">Đang xử lý</option>
                            <option value="shipped">Đang giao</option>
                            <option value="delivered">Đã giao</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Hủy</button>
                        <button type="submit" class="btn-primary">Cập nhật</button>
                    </div>
                </form>
            </div>
        </div>`;
    document.body.appendChild(modal);

    modal.querySelector('#orderStatusForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const status = new FormData(e.target).get('status');
        fetch(`../api/orders.php/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
            body: JSON.stringify({ status })
        }).then(r => r.json()).then(res => {
            if (res.success) {
                showMessage('Cập nhật đơn hàng thành công', 'success');
                modal.remove();
                fetchOrders();
            } else {
                showMessage(res.message || 'Cập nhật thất bại', 'error');
            }
        }).catch(() => showMessage('Lỗi kết nối máy chủ', 'error'));
    });
}

function openCustomerModal(id) {
    const tbody = document.getElementById('customersTableBody');
    tbody.innerHTML = '<tr><td colspan="7">Đang phát triển giao diện khách hàng...</td></tr>';
}

function openCustomerStatusModal(id) {
    const tbody = document.getElementById('customersTableBody');
    tbody.innerHTML = '<tr><td colspan="7">Đang phát triển cập nhật trạng thái khách hàng...</td></tr>';
}

