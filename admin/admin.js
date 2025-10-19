// Admin Panel JavaScript for LA CUISINE NGỌT - Connected to Database

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

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    checkAuthentication();
    
    showPage('products');
    
    // Setup navigation
    setupNavigation();
    
    // Setup event listeners
    setupEventListeners();
});

function checkAuthentication() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const jwtToken = localStorage.getItem('jwtToken');
    
    // Check if user is logged in and is admin
    if (!currentUser.id || !jwtToken) {
        showAuthError('Bạn cần đăng nhập để truy cập trang quản trị!');
        return;
    }
    
    if (currentUser.role !== 'admin') {
        showAuthError('Bạn không có quyền truy cập trang quản trị!');
        return;
    }
    
    // Show welcome message
    showWelcomeMessage(currentUser.full_name || currentUser.username);
}

function showAuthError(message) {
    document.body.innerHTML = `
        <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: 'Inter', sans-serif;
        ">
            <div style="
                background: white;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 400px;
                width: 90%;
            ">
                <div style="
                    width: 80px;
                    height: 80px;
                    background: #ff6b6b;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    font-size: 40px;
                    color: white;
                ">⚠️</div>
                <h2 style="color: #333; margin-bottom: 15px;">Truy cập bị từ chối</h2>
                <p style="color: #666; margin-bottom: 30px;">${message}</p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <a href="../pages/login/login.html" style="
                        background: #667eea;
                        color: white;
                        padding: 12px 24px;
                        border-radius: 8px;
                        text-decoration: none;
                        font-weight: 500;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='#5a6fd8'" onmouseout="this.style.background='#667eea'">
                        Đăng nhập
                    </a>
                    <a href="../pages/home/home.html" style="
                        background: #f8f9fa;
                        color: #333;
                        padding: 12px 24px;
                        border-radius: 8px;
                        text-decoration: none;
                        font-weight: 500;
                        border: 1px solid #dee2e6;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='#e9ecef'" onmouseout="this.style.background='#f8f9fa'">
                        Về trang chủ
                    </a>
                </div>
            </div>
        </div>
    `;
}

function showWelcomeMessage(username) {
    // Create welcome notification
    const welcomeDiv = document.createElement('div');
    welcomeDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        animation: slideIn 0.3s ease;
    `;
    welcomeDiv.innerHTML = `👋 Chào mừng ${username}! Bạn đã đăng nhập thành công.`;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(welcomeDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (welcomeDiv.parentNode) {
            welcomeDiv.remove();
        }
    }, 3000);
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageName = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            showPage(pageName);
        });
    });
}

function setupEventListeners() {
    // Product search
    const productSearch = document.getElementById('product-search');
    if (productSearch) {
        productSearch.addEventListener('input', debounce(searchProducts, 500));
    }
    
    // Order search
    const orderSearch = document.getElementById('order-search');
    if (orderSearch) {
        orderSearch.addEventListener('input', debounce(searchOrders, 500));
    }
    
    // User search
    const userSearch = document.getElementById('user-search');
    if (userSearch) {
        userSearch.addEventListener('input', debounce(searchUsers, 500));
    }
    
    // Complaint search
    const complaintSearch = document.getElementById('complaint-search');
    if (complaintSearch) {
        complaintSearch.addEventListener('input', debounce(searchComplaints, 500));
    }
}

// ============================================
// PAGE NAVIGATION
// ============================================

function showPage(pageName) {
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(pageName + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Load data for specific page
        switch(pageName) {
            case 'products':
                loadProducts();
                break;
            case 'orders':
                loadOrders();
                break;
            case 'users':
                loadUsers();
                break;
            case 'reports':
                loadReports('month');
                break;
            case 'promotions':
                loadPromotions();
                break;
            case 'complaints':
                loadComplaints();
                break;
        }
    }
}

// ============================================
// PRODUCTS MANAGEMENT
// ============================================

async function loadProducts(filters = {}) {
    try {
        showLoading('products-tbody');
        
        const queryParams = new URLSearchParams(filters).toString();
        // Lấy token JWT từ localStorage thay vì sử dụng token cứng
        const jwtToken = localStorage.getItem('jwtToken') || 'demo';
        const response = await fetch(`${API_BASE_URL}/products.php?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        const data = await response.json();
        
        const tbody = document.getElementById('products-tbody');
        
        // Cải thiện xử lý dữ liệu trả về từ API
        // Kiểm tra nhiều cấu trúc dữ liệu có thể có
        let products = [];
        
        if (data.success && data.data && data.data.products && data.data.products.length > 0) {
            products = data.data.products;
        } else if (data.success && data.products && data.products.length > 0) {
            products = data.products;
        } else if (Array.isArray(data) && data.length > 0) {
            products = data;
        }
        
        if (products.length > 0) {
            tbody.innerHTML = products.map(product => `
                <tr>
                    <td>${product.product_id}</td>
                    <td>
                        <img src="${product.image_url || '../assets/images/placeholder.jpg'}" 
                             alt="${product.product_name}" 
                             class="product-image"
                             onerror="this.src='../assets/images/placeholder.jpg'">
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
                            <button class="icon-btn" onclick="editProduct(${product.product_id})" title="Sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="icon-btn" onclick="deleteProduct(${product.product_id})" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Không có sản phẩm nào</td></tr>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        // Hiển thị thông báo lỗi chi tiết hơn trên giao diện
        const tbody = document.getElementById('products-tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="error-state">
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Không thể tải danh sách sản phẩm</p>
                        <p class="error-details">Chi tiết lỗi: ${error.message || 'Không có kết nối đến máy chủ'}</p>
                        <button onclick="loadProducts()" class="retry-btn">Thử lại</button>
                    </div>
                </td>
            </tr>
        `;
    }
}

async function searchProducts() {
    const searchTerm = document.getElementById('product-search').value;
    const category = document.getElementById('category-filter').value;
    
    await loadProducts({
        search: searchTerm,
        category: category
    });
}

function filterProducts() {
    searchProducts();
}

function showAddProductModal() {
    document.getElementById('product-modal-title').textContent = 'Thêm sản phẩm mới';
    document.getElementById('product-id').value = '';
    document.getElementById('product-name').value = '';
    document.getElementById('product-category').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-quantity').value = '';
    document.getElementById('product-description').value = '';
    
    document.getElementById('productModal').classList.add('active');
}

async function editProduct(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/products.php/${productId}`, {
            headers: {
                'Authorization': 'Bearer demo'
            }
        });
        const data = await response.json();
        
        if (data.success) {
            const product = data.data;
            document.getElementById('product-modal-title').textContent = 'Chỉnh sửa sản phẩm';
            document.getElementById('product-id').value = product.product_id;
            document.getElementById('product-name').value = product.product_name;
            document.getElementById('product-category').value = product.category_id;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-quantity').value = product.quantity;
            document.getElementById('product-description').value = product.description || '';
            
            document.getElementById('productModal').classList.add('active');
        } else {
            throw new Error(data.message || 'Failed to load product');
        }
    } catch (error) {
        console.error('Error loading product:', error);
        showError('Không thể tải thông tin sản phẩm');
    }
}

async function saveProduct() {
    const productId = document.getElementById('product-id').value;
    const productData = {
        product_name: document.getElementById('product-name').value,
        category_id: document.getElementById('product-category').value,
        price: document.getElementById('product-price').value,
        quantity: document.getElementById('product-quantity').value,
        description: document.getElementById('product-description').value
    };
    
    if (!productData.product_name || !productData.category_id || !productData.price) {
        showError('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
    }
    
    try {
        const url = productId 
            ? `${API_BASE_URL}/products.php/${productId}` 
            : `${API_BASE_URL}/products.php`;
        const method = productId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer demo'
            },
            body: JSON.stringify(productData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(productId ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công');
            closeModal('productModal');
            loadProducts();
        } else {
            throw new Error(data.message || 'Failed to save product');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showError('Không thể lưu sản phẩm');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/products.php/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer demo'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Xóa sản phẩm thành công');
            loadProducts();
        } else {
            throw new Error(data.message || 'Failed to delete product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showError('Không thể xóa sản phẩm');
    }
}

// ============================================
// ORDERS MANAGEMENT
// ============================================

async function loadOrders(filters = {}) {
    try {
        showLoading('orders-tbody');
        
        const queryParams = new URLSearchParams(filters).toString();
        // Sử dụng token JWT từ localStorage
        const jwtToken = localStorage.getItem('jwtToken') || 'demo';
        const response = await fetch(`${API_BASE_URL}/orders.php?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        
        const data = await response.json();
        
        const tbody = document.getElementById('orders-tbody');
        
        // Cải thiện xử lý dữ liệu trả về từ API
        let orders = [];
        
        if (data.success && data.data && data.data.orders && data.data.orders.length > 0) {
            orders = data.data.orders;
        } else if (data.success && data.orders && data.orders.length > 0) {
            orders = data.orders;
        } else if (Array.isArray(data) && data.length > 0) {
            orders = data;
        }
        
        if (orders.length > 0) {
            tbody.innerHTML = orders.map(order => `
                <tr>
                    <td>${order.order_code}</td>
                    <td>${order.customer_name}</td>
                    <td>${formatDate(order.created_at)}</td>
                    <td>${formatCurrency(order.final_amount)}</td>
                    <td>
                        <span class="status-badge status-${order.order_status}">
                            ${getOrderStatusText(order.order_status)}
                        </span>
                    </td>
                    <td>
                        <span class="status-badge status-${order.payment_status}">
                            ${getPaymentStatusText(order.payment_status)}
                        </span>
                    </td>
                    <td>
                        <button class="icon-btn" onclick="viewOrderDetail(${order.order_id})" title="Chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Không có đơn hàng nào</td></tr>';
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        // Hiển thị thông báo lỗi chi tiết hơn
        const tbody = document.getElementById('orders-tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="error-state">
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Không thể tải danh sách đơn hàng</p>
                        <p class="error-details">Chi tiết lỗi: ${error.message || 'Không có kết nối đến máy chủ'}</p>
                        <button onclick="loadOrders()" class="retry-btn">Thử lại</button>
                    </div>
                </td>
            </tr>
        `;
    }
}

async function searchOrders() {
    const searchTerm = document.getElementById('order-search').value;
    await loadOrders({ search: searchTerm });
}

async function filterOrders(status) {
    if (status === 'all') {
        await loadOrders();
    } else {
        await loadOrders({ status: status });
    }
}

async function viewOrderDetail(orderId) {
    try {
        currentOrderId = orderId;
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
        const order = await response.json();
        
        const modalBody = document.getElementById('order-modal-body');
        modalBody.innerHTML = `
            <div class="order-detail-container">
                <div class="order-detail-header">
                    <h3>Chi tiết đơn hàng - ${order.order_code}</h3>
                </div>
                
                <div class="order-detail-section">
                    <h4 class="section-title">Thông tin khách hàng</h4>
                    <div class="detail-info">
                        <p><strong>Tên khách hàng:</strong> ${order.customer_name}</p>
                        <p><strong>Số điện thoại:</strong> ${order.customer_phone}</p>
                        <p><strong>Địa chỉ giao hàng:</strong> ${order.shipping_address}, ${order.ward}, ${order.district}, ${order.city}</p>
                    </div>
                </div>
                
                <div class="order-detail-section">
                    <h4 class="section-title">Danh sách sản phẩm</h4>
                    <table class="detail-product-table">
                        <thead>
                            <tr>
                                <th>Tên sản phẩm</th>
                                <th style="text-align: center;">Số lượng</th>
                                <th style="text-align: right;">Tổng tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>
                                        <div>${item.product_name}</div>
                                        ${item.note ? `<div class="product-note">(Ghi chú: ${item.note})</div>` : ''}
                                    </td>
                                    <td style="text-align: center;">${item.quantity}</td>
                                    <td style="text-align: right;">${formatCurrency(item.subtotal)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr class="total-row">
                                <td colspan="2"><strong>Tổng cộng</strong></td>
                                <td style="text-align: right;"><strong>${formatCurrency(order.total_amount)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                ${order.note ? `
                <div class="order-detail-section">
                    <h4 class="section-title">Ghi chú nội bộ</h4>
                    <div class="detail-note">
                        <p>${order.note}</p>
                    </div>
                </div>
                ` : ''}
                
                <div class="order-detail-section">
                    <h4 class="section-title">Trạng thái đơn hàng hiện tại</h4>
                    <div class="detail-status">
                        <p>Lần cập nhật cuối: ${formatDateTime(order.updated_at || order.created_at)}</p>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('order-status-select').value = order.order_status;
        document.getElementById('orderModal').classList.add('active');
    } catch (error) {
        console.error('Error loading order detail:', error);
        showError('Không thể tải chi tiết đơn hàng');
    }
}

async function updateOrderStatus() {
    const newStatus = document.getElementById('order-status-select').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${currentOrderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            showSuccess('Cập nhật trạng thái đơn hàng thành công');
            closeModal('orderModal');
            loadOrders();
        } else {
            throw new Error('Failed to update order status');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showError('Không thể cập nhật trạng thái đơn hàng');
    }
}

// ============================================
// USERS MANAGEMENT
// ============================================

async function loadUsers(filters = {}) {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_BASE_URL}/users.php?${queryParams}`, {
            headers: {
                'Authorization': 'Bearer demo'
            }
        });
        const data = await response.json();
        
        const container = document.getElementById('users-container');
        
        if (data.success && data.data.users && data.data.users.length > 0) {
            container.innerHTML = data.data.users.map(user => `
                <div class="user-card">
                    <div class="user-card-header">
                        ${user.full_name}
                    </div>
                    <div class="user-card-body">
                        <div class="user-info">
                            <p><strong>Loại:</strong> ${getRoleText(user.role)}</p>
                            <p><strong>Email:</strong> ${user.email}</p>
                            <p><strong>SĐT:</strong> ${user.phone || 'N/A'}</p>
                            <p><strong>Địa chỉ:</strong> ${user.address || 'N/A'}</p>
                            <p><strong>Trạng thái:</strong> 
                                <span class="status-badge status-${user.is_active ? 'active' : 'inactive'}">
                                    ${getStatusText(user.is_active ? 'active' : 'inactive')}
                                </span>
                            </p>
                        </div>
                        <div class="user-card-footer">
                            <button class="icon-btn" onclick="editUser(${user.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="icon-btn" onclick="deleteUser(${user.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="empty-state"><p>Không có người dùng nào</p></div>';
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Không thể tải danh sách người dùng');
    }
}

async function searchUsers() {
    const searchTerm = document.getElementById('user-search').value;
    await loadUsers({ search: searchTerm });
}

async function filterUsers(role) {
    if (role === 'all') {
        await loadUsers();
    } else {
        await loadUsers({ role: role });
    }
}

function showAddUserModal() {
    document.getElementById('user-modal-title').textContent = 'Thêm người dùng mới';
    document.getElementById('user-id').value = '';
    document.getElementById('user-fullname').value = '';
    document.getElementById('user-role').value = 'customer';
    document.getElementById('user-phone').value = '';
    document.getElementById('user-email').value = '';
    document.getElementById('user-address').value = '';
    
    document.getElementById('userModal').classList.add('active');
}

async function editUser(userId) {
    try {
        currentUserId = userId;
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        const user = await response.json();
        
        document.getElementById('user-modal-title').textContent = 'Chỉnh sửa người dùng';
        document.getElementById('user-id').value = user.user_id;
        document.getElementById('user-fullname').value = user.fullname;
        document.getElementById('user-role').value = user.role;
        document.getElementById('user-phone').value = user.phone || '';
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-address').value = user.address || '';
        
        document.getElementById('userModal').classList.add('active');
    } catch (error) {
        console.error('Error loading user:', error);
        showError('Không thể tải thông tin người dùng');
    }
}

async function saveUser() {
    const userId = document.getElementById('user-id').value;
    const userData = {
        fullname: document.getElementById('user-fullname').value,
        role: document.getElementById('user-role').value,
        phone: document.getElementById('user-phone').value,
        email: document.getElementById('user-email').value,
        address: document.getElementById('user-address').value
    };
    
    if (!userData.fullname || !userData.email) {
        showError('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
    }
    
    try {
        const url = userId 
            ? `${API_BASE_URL}/users/${userId}` 
            : `${API_BASE_URL}/users`;
        const method = userId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            showSuccess(userId ? 'Cập nhật người dùng thành công' : 'Thêm người dùng thành công');
            closeModal('userModal');
            loadUsers();
        } else {
            throw new Error('Failed to save user');
        }
    } catch (error) {
        console.error('Error saving user:', error);
        showError('Không thể lưu người dùng');
    }
}

async function deleteUser(userId) {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('Xóa người dùng thành công');
            loadUsers();
        } else {
            throw new Error('Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showError('Không thể xóa người dùng');
    }
}

// ============================================
// REPORTS
// ============================================

async function loadReports(period) {
    try {
        const response = await fetch(`${API_BASE_URL}/reports.php?period=${period}`, {
            headers: {
                'Authorization': 'Bearer demo'
            }
        });
        const data = await response.json();
        
        if (data.success) {
            // Update statistics
            document.getElementById('revenue-stat').textContent = formatCurrency(data.data.revenue);
            document.getElementById('orders-stat').textContent = data.data.total_orders;
            document.getElementById('delivered-stat').textContent = data.data.delivered_orders;
            document.getElementById('customers-stat').textContent = data.data.new_customers;
            
            // Update charts
            initCharts(data.data.chart_data);
            
            // Update top products table
            loadTopProducts(data.data.top_products);
        } else {
            throw new Error(data.message || 'Failed to load reports');
        }
    } catch (error) {
        console.error('Error loading reports:', error);
        showError('Không thể tải báo cáo');
    }
}

function loadTopProducts(products) {
    const tbody = document.getElementById('top-products-tbody');
    
    if (products && products.length > 0) {
        const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
        
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.product_name}</td>
                <td>${product.quantity_sold}</td>
                <td>${formatCurrency(product.revenue)}</td>
                <td>${((product.revenue / totalRevenue) * 100).toFixed(2)}%</td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Không có dữ liệu</td></tr>';
    }
}

function loadReportData(period) {
    loadReports(period);
}

function initCharts(chartData) {
    if (revenueChart) revenueChart.destroy();
    if (categoryChart) categoryChart.destroy();
    
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx && chartData.revenue) {
        revenueChart = new Chart(revenueCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: chartData.revenue.labels,
                datasets: [{
                    label: 'Doanh thu (VNĐ)',
                    data: chartData.revenue.data,
                    backgroundColor: '#4472C4',
                    borderColor: '#4472C4',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return (value / 1000000) + 'M';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Category Chart
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx && chartData.products) {
        categoryChart = new Chart(categoryCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: chartData.products.labels,
                datasets: [{
                    data: chartData.products.data,
                    backgroundColor: ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }
}

// ============================================
// PROMOTIONS
// ============================================

async function loadPromotions(filters = {}) {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_BASE_URL}/promotions.php?${queryParams}`, {
            headers: {
                'Authorization': 'Bearer demo'
            }
        });
        const data = await response.json();
        
        const container = document.getElementById('promos-container');
        
        if (data.success && data.data.promotions && data.data.promotions.length > 0) {
            container.innerHTML = data.data.promotions.map(promo => `
                <div class="promo-card-new">
                    <div class="promo-card-header">
                        <span class="promo-status-tag ${promo.status}-tag">
                            ${getPromoStatusText(promo.status)}
                        </span>
                    </div>
                    <div class="promo-card-content">
                        <ul class="promo-details">
                            <li><strong>Mã:</strong> ${promo.promotion_code}</li>
                            <li><strong>Tên:</strong> ${promo.promotion_name}</li>
                            <li><strong>Loại:</strong> ${getPromoTypeText(promo.promotion_type)}</li>
                            <li><strong>Giá trị:</strong> ${formatPromoValue(promo)}</li>
                            <li><strong>Số lượng:</strong> ${promo.used_count}/${promo.quantity === -1 ? '∞' : promo.quantity}</li>
                            <li><strong>Thời gian:</strong> ${formatDate(promo.start_date)} - ${formatDate(promo.end_date)}</li>
                        </ul>
                    </div>
                    <div class="promo-card-actions">
                        <button class="btn-view-promo" onclick="viewPromoDetail(${promo.promotion_id})">
                            Chi tiết
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="empty-state"><p>Không có khuyến mãi nào</p></div>';
        }
    } catch (error) {
        console.error('Error loading promotions:', error);
        showError('Không thể tải danh sách khuyến mãi');
    }
}

async function filterPromotions(status) {
    if (status === 'all') {
        await loadPromotions();
    } else {
        await loadPromotions({ status: status });
    }
}

async function createPromotion() {
    const promoData = {
        promotion_code: document.getElementById('promo-code').value,
        promotion_name: document.getElementById('promo-name').value,
        promotion_type: document.getElementById('promo-type').value,
        start_date: document.getElementById('promo-start').value,
        end_date: document.getElementById('promo-end').value,
        discount_value: document.getElementById('promo-value').value,
        quantity: document.getElementById('promo-quantity').value,
        min_order_value: document.getElementById('promo-condition').value || 0
    };
    
    if (!promoData.promotion_code || !promoData.promotion_name || !promoData.promotion_type) {
        showError('Vui lòng điền đầy đủ thông tin khuyến mãi');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/promotions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(promoData)
        });
        
        if (response.ok) {
            showSuccess('Tạo khuyến mãi thành công');
            loadPromotions();
            // Clear form
            document.getElementById('promo-code').value = '';
            document.getElementById('promo-name').value = '';
            document.getElementById('promo-type').value = '';
            document.getElementById('promo-start').value = '';
            document.getElementById('promo-end').value = '';
            document.getElementById('promo-value').value = '';
            document.getElementById('promo-quantity').value = '';
            document.getElementById('promo-condition').value = '';
        } else {
            throw new Error('Failed to create promotion');
        }
    } catch (error) {
        console.error('Error creating promotion:', error);
        showError('Không thể tạo khuyến mãi');
    }
}

async function viewPromoDetail(promoId) {
    try {
        currentPromoId = promoId;
        const response = await fetch(`${API_BASE_URL}/promotions/${promoId}`);
        const promo = await response.json();
        
        const modalBody = document.getElementById('promo-detail-body');
        modalBody.innerHTML = `
            <div class="info-section">
                <div class="info-row">
                    <span class="info-label">Mã khuyến mãi:</span>
                    <span class="info-value">${promo.promotion_code}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tên khuyến mãi:</span>
                    <span class="info-value">${promo.promotion_name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Mô tả:</span>
                    <span class="info-value">${promo.description || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Loại:</span>
                    <span class="info-value">${getPromoTypeText(promo.promotion_type)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Giá trị giảm:</span>
                    <span class="info-value">${formatPromoValue(promo)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Đơn hàng tối thiểu:</span>
                    <span class="info-value">${formatCurrency(promo.min_order_value)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Số lượng:</span>
                    <span class="info-value">${promo.quantity === -1 ? 'Không giới hạn' : promo.quantity}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Đã sử dụng:</span>
                    <span class="info-value">${promo.used_count}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Thời gian:</span>
                    <span class="info-value">${formatDate(promo.start_date)} - ${formatDate(promo.end_date)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Trạng thái:</span>
                    <span class="info-value">
                        <span class="promo-status-tag ${promo.status}-tag">
                            ${getPromoStatusText(promo.status)}
                        </span>
                    </span>
                </div>
            </div>
        `;
        
        document.getElementById('promoDetailModal').classList.add('active');
    } catch (error) {
        console.error('Error loading promotion detail:', error);
        showError('Không thể tải chi tiết khuyến mãi');
    }
}

// ============================================
// COMPLAINTS MANAGEMENT
// ============================================

async function loadComplaints(filters = {}) {
    try {
        showLoading('complaints-tbody');
        
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_BASE_URL}/complaints.php?${queryParams}`, {
            headers: {
                'Authorization': 'Bearer demo'
            }
        });
        const data = await response.json();
        
        const tbody = document.getElementById('complaints-tbody');
        
        if (data.success && data.data.complaints && data.data.complaints.length > 0) {
            tbody.innerHTML = data.data.complaints.map(complaint => `
                <tr>
                    <td>${complaint.complaint_code}</td>
                    <td>${complaint.order_code}</td>
                    <td>${complaint.customer_name}</td>
                    <td>${complaint.title}</td>
                    <td>${formatDate(complaint.created_at)}</td>
                    <td>
                        <span class="status-badge status-${complaint.status}">
                            ${getComplaintStatusText(complaint.status)}
                        </span>
                    </td>
                    <td>
                        <button class="icon-btn" onclick="viewComplaintDetail(${complaint.complaint_id})" title="Chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Không có khiếu nại nào</td></tr>';
        }
    } catch (error) {
        console.error('Error loading complaints:', error);
        showError('Không thể tải danh sách khiếu nại');
    }
}

async function searchComplaints() {
    const searchTerm = document.getElementById('complaint-search').value;
    await loadComplaints({ search: searchTerm });
}

async function filterComplaints(status) {
    if (status === 'all') {
        await loadComplaints();
    } else {
        await loadComplaints({ status: status });
    }
}

async function viewComplaintDetail(complaintId) {
    try {
        currentComplaintId = complaintId;
        const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}`);
        const complaint = await response.json();
        
        const modalBody = document.getElementById('complaint-modal-body');
        modalBody.innerHTML = `
            <div class="info-section">
                <h4 class="info-title">Thông tin khiếu nại</h4>
                <div class="info-row">
                    <span class="info-label">Mã khiếu nại:</span>
                    <span class="info-value">${complaint.complaint_code}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Mã đơn hàng:</span>
                    <span class="info-value">${complaint.order_code}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Khách hàng:</span>
                    <span class="info-value">${complaint.customer_name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Loại khiếu nại:</span>
                    <span class="info-value">${getComplaintTypeText(complaint.complaint_type)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Ngày tạo:</span>
                    <span class="info-value">${formatDateTime(complaint.created_at)}</span>
                </div>
            </div>
            
            <div class="info-section">
                <h4 class="info-title">Nội dung</h4>
                <p><strong>Tiêu đề:</strong> ${complaint.title}</p>
                <p>${complaint.content}</p>
            </div>
            
            ${complaint.resolution ? `
                <div class="info-section">
                    <h4 class="info-title">Giải quyết</h4>
                    <p>${complaint.resolution}</p>
                </div>
            ` : ''}
        `;
        
        document.getElementById('complaint-status-select').value = complaint.status;
        document.getElementById('complaintModal').classList.add('active');
    } catch (error) {
        console.error('Error loading complaint detail:', error);
        showError('Không thể tải chi tiết khiếu nại');
    }
}

async function updateComplaintStatus() {
    const newStatus = document.getElementById('complaint-status-select').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/complaints/${currentComplaintId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            showSuccess('Cập nhật trạng thái khiếu nại thành công');
            closeModal('complaintModal');
            loadComplaints();
        } else {
            throw new Error('Failed to update complaint status');
        }
    } catch (error) {
        console.error('Error updating complaint status:', error);
        showError('Không thể cập nhật trạng thái khiếu nại');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal on outside click
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
});

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
}

function getStatusText(status) {
    const statusMap = {
        'available': 'Còn hàng',
        'out_of_stock': 'Hết hàng',
        'discontinued': 'Ngừng bán',
        'active': 'Hoạt động',
        'inactive': 'Không hoạt động',
        'banned': 'Bị khóa'
    };
    return statusMap[status] || status;
}

function getOrderStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xử lý',
        'confirmed': 'Đã xác nhận',
        'preparing': 'Đang chuẩn bị',
        'shipping': 'Đang giao',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}

function getPaymentStatusText(status) {
    const statusMap = {
        'pending': 'Chờ thanh toán',
        'paid': 'Đã thanh toán',
        'failed': 'Thất bại',
        'refunded': 'Đã hoàn tiền'
    };
    return statusMap[status] || status;
}

function getRoleText(role) {
    const roleMap = {
        'admin': 'Quản trị viên',
        'staff': 'Nhân viên',
        'customer': 'Khách hàng'
    };
    return roleMap[role] || role;
}

function getPromoStatusText(status) {
    const statusMap = {
        'pending': 'Chưa áp dụng',
        'active': 'Đang áp dụng',
        'expired': 'Hết hạn',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}

function getPromoTypeText(type) {
    const typeMap = {
        'percent': 'Giảm giá %',
        'fixed_amount': 'Giảm giá VNĐ',
        'free_shipping': 'Miễn phí vận chuyển',
        'gift': 'Quà tặng'
    };
    return typeMap[type] || type;
}

function getComplaintStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xử lý',
        'processing': 'Đang xử lý',
        'resolved': 'Đã xử lý',
        'closed': 'Đã đóng',
        'rejected': 'Từ chối'
    };
    return statusMap[status] || status;
}

function getComplaintTypeText(type) {
    const typeMap = {
        'product_quality': 'Chất lượng sản phẩm',
        'delivery': 'Vấn đề giao hàng',
        'service': 'Dịch vụ',
        'other': 'Khác'
    };
    return typeMap[type] || type;
}

function formatPromoValue(promo) {
    if (promo.promotion_type === 'percent') {
        return promo.discount_value + '%';
    } else if (promo.promotion_type === 'fixed_amount') {
        return formatCurrency(promo.discount_value);
    } else if (promo.promotion_type === 'free_shipping') {
        return 'Miễn phí vận chuyển';
    }
    return 'N/A';
}

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<tr><td colspan="100%" class="loading">Đang tải dữ liệu...</td></tr>';
    }
}

function showSuccess(message) {
    // Create or get success message element
    let successEl = document.querySelector('.success-message');
    if (!successEl) {
        successEl = document.createElement('div');
        successEl.className = 'success-message';
        document.querySelector('.content-container').prepend(successEl);
    }
    
    successEl.textContent = message;
    successEl.classList.add('show');
    
    setTimeout(() => {
        successEl.classList.remove('show');
    }, 3000);
}

function showError(message) {
    // Create or get error message element
    let errorEl = document.querySelector('.error-message');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        document.querySelector('.content-container').prepend(errorEl);
    }
    
    errorEl.textContent = message;
    errorEl.classList.add('show');
    
    setTimeout(() => {
        errorEl.classList.remove('show');
    }, 3000);
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

// ============================================
// EXPORT FUNCTIONS
// ============================================

function exportReport(type) {
    console.log('Exporting report:', type);
    alert('Chức năng xuất báo cáo ' + type + ' sẽ được triển khai.');
}

function printReport() {
    window.print();
}

function editPromotion() {
    alert('Chức năng chỉnh sửa khuyến mãi sẽ được triển khai.');
    closeModal('promoDetailModal');
}
