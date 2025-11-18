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

// Tạo placeholder SVG - không cần file thực
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22 viewBox=%220 0 300 300%22%3E%3Crect fill=%22%23f8f9fa%22 width=%22300%22 height=%22300%22/%3E%3Cg%3E%3Cpath fill=%22%23dee2e6%22 d=%22M150 100 L150 200 M100 150 L200 150%22 stroke=%22%23dee2e6%22 stroke-width=%2215%22 stroke-linecap=%22round%22/%3E%3C/g%3E%3Ctext x=%2250%25%22 y=%2270%25%22 text-anchor=%22middle%22 fill=%22%23adb5bd%22 font-family=%22-apple-system, BlinkMacSystemFont, %27Segoe UI%27, Roboto, sans-serif%22 font-size=%2218%22 font-weight=%22500%22%3EKhông có ảnh%3C/text%3E%3C/svg%3E';

// Function xử lý URL ảnh an toàn
function getSafeImageUrl(imageUrl) {
    // Nếu không có URL hoặc rỗng
    if (!imageUrl || imageUrl.trim() === '') {
        return PLACEHOLDER_IMAGE;
    }

    // Nếu đã là data URL hoặc HTTP URL
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // Nếu là đường dẫn tương đối từ database (ví dụ: assets/images/banh.jpg)
    // Từ admin/admin.html cần thêm ../ để lên 1 cấp về thư mục gốc
    if (imageUrl.startsWith('assets/')) {
        return '../' + imageUrl;
    }

    // Trả về URL gốc (đã có xử lý onerror bên dưới)
    return imageUrl;
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    // Check authentication first
    checkAuthentication();
    loadCategories();
    showPage('products');
    setupNavigation();
    setupEventListeners();

    // Kích hoạt cho các nhóm
    setupTabButtons('.order-tab-btn');
    setupTabButtons('.user-tab-btn');
    setupTabButtons('.promo-tab-btn');
    setupTabButtons('.tab-btn');


    // Setup user dropdown menu
    const userMenuBtn = document.getElementById("userMenuBtn");
    const userDropdown = document.getElementById("userDropdown");

    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            const isVisible = userDropdown.style.display === "block";
            userDropdown.style.display = isVisible ? "none" : "block";
        });

        document.addEventListener("click", function (e) {
            if (!userDropdown.contains(e.target) && e.target !== userMenuBtn) {
                userDropdown.style.display = "none";
            }
        });
    }
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
        link.addEventListener('click', function (e) {
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
        switch (pageName) {
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
                initYearDropdown();
                loadReports('month', null, new Date().getFullYear());
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

// Expose showPage to global scope
window.showPage = showPage;

// ============================================
// CATEGORIES MANAGEMENT
// ============================================

let categoriesMap = {}; // Map category_name -> category_id

async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories.php`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.categories) {
            const categories = data.data.categories;
            categoriesMap = {};
            
            const categorySelect = document.getElementById('product-category');
            if (categorySelect) {
                // Clear existing options except the first one
                categorySelect.innerHTML = '<option value="">Chọn danh mục</option>';
                
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.category_id;
                    option.textContent = category.category_name;
                    categorySelect.appendChild(option);
                    
                    // Map for quick lookup
                    categoriesMap[category.category_name] = category.category_id;
                });
            }
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// ============================================
// PRODUCTS MANAGEMENT
// ============================================

async function loadProducts(filters = {}) {
    try {
        showLoading('products-tbody');

        const queryParams = new URLSearchParams(filters).toString();
        const jwtToken = localStorage.getItem('jwtToken') || 'demo';

        // Thêm timeout cho request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 giây timeout

        const response = await fetch(`${API_BASE_URL}/products.php?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // ✅ FIX: Kiểm tra response trước khi parse JSON
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error('Server trả về HTML thay vì JSON:', text.substring(0, 300));
            throw new Error("Server không trả về JSON");
        }

        const data = await response.json();

        const tbody = document.getElementById('products-tbody');

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
                        <img src="${getSafeImageUrl(product.image_url)}" 
                             alt="${product.product_name}" 
                             class="product-image"
                             onerror="this.onerror=null; this.src='${PLACEHOLDER_IMAGE}';">
                    </td>
                    <td>${product.product_name}</td>
                    <td>${product.category_name || 'N/A'}</td>
                    <td>${formatCurrency(product.price)}</td>
                    <td>
                        <div class="quantity-cell">
                            <span>${product.quantity}</span>
                            ${product.quantity === 0 
                                ? '<i class="fas fa-times-circle quantity-error-icon" title="Hết sản phẩm"></i>'
                                : product.quantity < 10 
                                ? '<i class="fas fa-exclamation-triangle quantity-warning-icon" title="Sắp hết (dưới 10)"></i>'
                                : ''
                            }
                        </div>
                    </td>
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
        const tbody = document.getElementById('products-tbody');

        // Cải thiện error handling
        let errorMessage = 'Không có kết nối đến máy chủ';
        if (error.name === 'AbortError') {
            errorMessage = 'Request timeout - Vui lòng thử lại';
        } else if (error.message) {
            errorMessage = error.message;
        }

        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="error-state">
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Không thể tải danh sách sản phẩm</p>
                        <p class="error-details">${errorMessage}</p>
                        <button onclick="loadProducts()" class="retry-btn">Thử lại</button>
                    </div>
                </td>
            </tr>
        `;
    }
}

function setupTabButtons(selector) {
    const buttons = document.querySelectorAll(selector);

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Xóa active trong nhóm đó
            buttons.forEach(b => b.classList.remove('active'));
            // Gán active cho nút được nhấn
            btn.classList.add('active');
        });
    });
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
    document.getElementById('product-short-intro').value = '';
    document.getElementById('product-short-paragraph').value = '';
    document.getElementById('product-structure').value = '';
    document.getElementById('product-usage').value = '';
    document.getElementById('product-bonus').value = '';
    document.getElementById('product-image-url').value = '';

    document.getElementById('productModal').classList.add('active');
}

async function editProduct(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/products.php/${productId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
            }
        });
        const data = await response.json();

        if (data.success) {
            const product = data.data;
            document.getElementById('product-modal-title').textContent = 'Chỉnh sửa sản phẩm';
            document.getElementById('product-id').value = product.product_id || product.ProductID;
            document.getElementById('product-name').value = product.product_name || product.ProductName;
            document.getElementById('product-category').value = product.category_id || product.CategoryID;
            document.getElementById('product-price').value = product.price || product.Price;
            document.getElementById('product-quantity').value = product.quantity || product.Quantity;
            document.getElementById('product-description').value = product.description || product.Description || '';
            document.getElementById('product-short-intro').value = product.short_intro || product.ShortIntro || '';
            document.getElementById('product-short-paragraph').value = product.short_paragraph || product.ShortParagraph || '';
            document.getElementById('product-structure').value = product.structure || product.Structure || '';
            document.getElementById('product-usage').value = product.product_usage || product.usage || product.Usage || '';
            document.getElementById('product-bonus').value = product.bonus || product.Bonus || '';
            document.getElementById('product-image-url').value = product.image_url || product.ImageURL || '';

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
        description: document.getElementById('product-description').value,
        short_intro: document.getElementById('product-short-intro').value,
        short_paragraph: document.getElementById('product-short-paragraph').value,
        structure: document.getElementById('product-structure').value,
        usage: document.getElementById('product-usage').value,
        bonus: document.getElementById('product-bonus').value,
        image_url: document.getElementById('product-image-url').value
    };

    if (!productData.product_name || !productData.category_id || !productData.price) {
        showError('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
    }

    // Validate quantity >= 0
    const quantity = parseInt(productData.quantity) || 0;
    if (quantity < 0) {
        showError('Số lượng không thể nhỏ hơn 0');
        return;
    }
    productData.quantity = quantity;

    try {
        const url = productId
            ? `${API_BASE_URL}/products.php/${productId}`
            : `${API_BASE_URL}/products.php`;
        const method = productId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
            },
            body: JSON.stringify(productData)
        });

        // Lấy response text trước để kiểm tra
        const responseText = await response.text();
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            // Nếu không parse được JSON, có thể là lỗi PHP/HTML
            console.error('Response không phải JSON:', responseText);
            console.error('Parse error:', parseError);
            throw new Error('Server trả về lỗi không hợp lệ. Vui lòng kiểm tra console để biết thêm chi tiết.');
        }

        if (data.success) {
            showSuccess(productId ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công');
            closeModal('productModal');
            loadProducts();
        } else {
            throw new Error(data.message || 'Failed to save product');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showError(error.message || 'Không thể lưu sản phẩm');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/products.php/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
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
                        <div class="action-btns">
                        <button class="icon-btn" onclick="viewOrderDetail(${order.order_id})" title="Chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                            <button class="icon-btn" onclick="deleteOrder(${order.order_id})" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Không có đơn hàng nào</td></tr>';
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        // Hiển thị thông báo lỗi chi tiết hơn
        const tbody = document.getElementById('orders-tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="error-state">
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

async function filterOrders(status, button) {
    // Cập nhật trạng thái active cho button
    document.querySelectorAll('.order-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (button) {
        button.classList.add('active');
    }
    
    // Lọc đơn hàng theo trạng thái
    if (status === 'all') {
        await loadOrders();
    } else {
        await loadOrders({ status: status });
    }
}

async function viewOrderDetail(orderId) {
    try {
        currentOrderId = orderId;
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await fetch(`${API_BASE_URL}/orders.php/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        const order = result.data || result;

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
    const jwtToken = localStorage.getItem('jwtToken');

    try {
        const response = await fetch(`${API_BASE_URL}/orders.php/${currentOrderId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify({ order_status: newStatus })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'HTTP ' + response.status);
        }

            showSuccess('Cập nhật trạng thái đơn hàng thành công');
            closeModal('orderModal');
        loadOrders();
    } catch (error) {
        console.error('Error updating order status:', error);
        showError('Không thể cập nhật trạng thái đơn hàng: ' + error.message);
    }
}

async function deleteOrder(orderId) {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?\n\nLưu ý: Hành động này không thể hoàn tác và đơn hàng sẽ bị xóa khỏi cơ sở dữ liệu.')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/orders.php/${orderId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
            }
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Xóa đơn hàng thành công');
            loadOrders();
        } else {
            throw new Error(data.message || 'Failed to delete order');
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        showError('Không thể xóa đơn hàng: ' + error.message);
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
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
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
                                <span class="status-badge status-${user.status}">
                                    ${getStatusText(user.status)}
                                </span>
                            </p>
                        </div>
                        <div class="user-card-footer">
                            <button class="icon-btn" onclick="editUser(${user.id})" title="Chỉnh sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${user.status === 'banned' ? 
                                `<button class="icon-btn" onclick="unlockUser(${user.id})" title="Mở khóa">
                                    <i class="fas fa-unlock"></i>
                                </button>` : 
                                `<button class="icon-btn" onclick="lockUser(${user.id})" title="Khóa">
                                    <i class="fas fa-lock"></i>
                                </button>`
                            }
                            <button class="icon-btn" onclick="deleteUser(${user.id})" title="Xóa">
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
        const response = await fetch(`${API_BASE_URL}/users.php/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
            }
        });
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to load user');
        }

        const user = data.data || data;

        document.getElementById('user-modal-title').textContent = 'Chỉnh sửa người dùng';
        document.getElementById('user-id').value = user.id || user.UserID;
        document.getElementById('user-fullname').value = user.full_name || user.FullName;
        document.getElementById('user-role').value = user.role || user.Role;
        document.getElementById('user-phone').value = user.phone || user.Phone || '';
        document.getElementById('user-email').value = user.email || user.Email;
        document.getElementById('user-address').value = user.address || user.Address || '';
        if (document.getElementById('user-status')) {
            document.getElementById('user-status').value = user.status || user.Status || 'active';
        }

        document.getElementById('userModal').classList.add('active');
    } catch (error) {
        console.error('Error loading user:', error);
        showError('Không thể tải thông tin người dùng');
    }
}

async function saveUser() {
    const userId = document.getElementById('user-id').value;
    const userData = {
        full_name: document.getElementById('user-fullname').value,
        role: document.getElementById('user-role').value,
        phone: document.getElementById('user-phone').value,
        email: document.getElementById('user-email').value,
        address: document.getElementById('user-address').value,
        status: document.getElementById('user-status') ? document.getElementById('user-status').value : 'active'
    };

    if (!userData.full_name || !userData.email) {
        showError('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
    }

    try {
        const url = userId
            ? `${API_BASE_URL}/users.php/${userId}`
            : `${API_BASE_URL}/users.php`;
        const method = userId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (data.success) {
            showSuccess(userId ? 'Cập nhật người dùng thành công' : 'Thêm người dùng thành công');
            closeModal('userModal');
            loadUsers();
        } else {
            throw new Error(data.message || 'Failed to save user');
        }
    } catch (error) {
        console.error('Error saving user:', error);
        showError('Không thể lưu người dùng');
    }
}

async function lockUser(userId) {
    if (!confirm('Bạn có chắc chắn muốn khóa tài khoản này?\n\nLưu ý: Nếu user đang đăng nhập, họ sẽ bị logout khi thực hiện hành động tiếp theo.')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/users.php/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
            },
            body: JSON.stringify({ status: 'banned' })
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Khóa tài khoản thành công. User sẽ không thể đăng nhập lại và sẽ bị logout tự động khi thực hiện hành động tiếp theo.');
            loadUsers();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error locking user:', error);
        showError('Không thể khóa tài khoản');
    }
}

async function unlockUser(userId) {
    if (!confirm('Bạn có chắc chắn muốn mở khóa tài khoản này?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/users.php/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
            },
            body: JSON.stringify({ status: 'active' })
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Mở khóa tài khoản thành công');
            loadUsers();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error unlocking user:', error);
        showError('Không thể mở khóa tài khoản');
    }
}

async function deleteUser(userId) {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?\n\nLưu ý: Hành động này sẽ xóa người dùng khỏi cơ sở dữ liệu và không thể hoàn tác.')) return;

    try {
        const jwtToken = localStorage.getItem('jwtToken') || 'demo';
        const url = `${API_BASE_URL}/users.php/${userId}`;
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            }
        });

        // Kiểm tra response status trước khi parse JSON
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                const errorText = await response.text();
                errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        if (data.success) {
            showSuccess('Xóa người dùng thành công');
            loadUsers();
        } else {
            throw new Error(data.message || 'Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showError('Không thể xóa người dùng: ' + error.message);
    }
}

// ============================================
// REPORTS
// ============================================

async function loadReports(period, month, year) {
    try {
        // Destroy charts cũ trước khi load dữ liệu mới
        if (revenueChart) {
            revenueChart.destroy();
            revenueChart = null;
        }
        if (categoryChart) {
            categoryChart.destroy();
            categoryChart = null;
        }
        
        // Xóa legend
        const legendContainer = document.getElementById('product-chart-legend');
        if (legendContainer) {
            legendContainer.innerHTML = '';
        }
        
        // Hiển thị loading state
        const loadingIndicatorElement = document.getElementById('reports-loading');
        if (loadingIndicatorElement) {
            loadingIndicatorElement.style.display = 'block';
        }
        
        // Ẩn charts và table tạm thời
        const revenueCtx = document.getElementById('revenueChart');
        const categoryCtx = document.getElementById('categoryChart');
        const tbody = document.getElementById('top-products-tbody');
        if (revenueCtx) {
            const ctx = revenueCtx.getContext('2d');
            ctx.clearRect(0, 0, revenueCtx.width, revenueCtx.height);
            ctx.font = '16px Arial';
            ctx.fillStyle = '#999';
            ctx.textAlign = 'center';
            ctx.fillText('Đang tải...', revenueCtx.width / 2, revenueCtx.height / 2);
        }
        if (categoryCtx) {
            const ctx = categoryCtx.getContext('2d');
            ctx.clearRect(0, 0, categoryCtx.width, categoryCtx.height);
            ctx.font = '16px Arial';
            ctx.fillStyle = '#999';
            ctx.textAlign = 'center';
            ctx.fillText('Đang tải...', categoryCtx.width / 2, categoryCtx.height / 2);
        }
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px; color: #999;">Đang tải...</td></tr>';
        }
        
        let url = `${API_BASE_URL}/reports.php?period=${period}`;
        // Luôn gửi year nếu có
        if (year) {
            url += `&year=${year}`;
        }
        // Gửi month nếu có (cho biểu đồ tròn)
        if (month) {
            url += `&month=${month}`;
        }
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
            }
        });

        // ✅ THÊM KIỂM TRA NÀY
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // ✅ KIỂM TRA CONTENT-TYPE
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error('Server trả về:', text.substring(0, 500));
            throw new Error("Server không trả về JSON (có thể là trang lỗi HTML)");
        }

        const data = await response.json();

        if (data.success) {
            // Update statistics
            document.getElementById('revenue-stat').textContent = formatCurrency(data.data.revenue);
            document.getElementById('orders-stat').textContent = data.data.total_orders;
            document.getElementById('delivered-stat').textContent = data.data.delivered_orders;
            document.getElementById('customers-stat').textContent = data.data.new_customers;

            // Update charts - truyền month và year để initCharts biết tháng nào được chọn
            initCharts(data.data.chart_data, month, year);

            // Update top products table - chỉ hiển thị khi có tháng được chọn và có dữ liệu từ biểu đồ tròn
            const monthSelect = document.getElementById('report-month-select');
            const selectedMonth = monthSelect?.value || '';
            const hasMonthSelected = selectedMonth !== '' && selectedMonth !== null;
            
            if (hasMonthSelected && data.data.product_chart_full && data.data.product_chart_full.length > 0) {
                // Có tháng được chọn và có dữ liệu từ biểu đồ tròn: hiển thị bảng chi tiết
                loadTopProductsFromChart(data.data.product_chart_full);
            } else {
                // Không có tháng được chọn hoặc không có dữ liệu: không hiển thị gì
                const tbody = document.getElementById('top-products-tbody');
                if (tbody) {
                    if (hasMonthSelected) {
                        // Có tháng được chọn nhưng không có dữ liệu
                        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Tháng này không có doanh thu</td></tr>';
                    } else {
                        // Chưa chọn tháng
                        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Vui lòng chọn tháng để xem chi tiết doanh thu theo sản phẩm</td></tr>';
                    }
                }
            }
        } else {
            throw new Error(data.message || 'Không thể tải báo cáo');
        }
        
        // Ẩn loading state
        if (loadingIndicatorElement) {
            loadingIndicatorElement.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading reports:', error);
        // ✅ HIỂN THỊ LỖI RÕ RÀNG HƠN
        showError(`Không thể tải báo cáo: ${error.message}`);
        
        // Ẩn loading state
        const loadingIndicatorElementError = document.getElementById('reports-loading');
        if (loadingIndicatorElementError) {
            loadingIndicatorElementError.style.display = 'none';
        }
    }
}

function loadTopProducts(products) {
    const tbody = document.getElementById('top-products-tbody');

    if (products && products.length > 0) {
        const totalRevenue = products.reduce((sum, p) => sum + (parseFloat(p.revenue) || 0), 0);

        tbody.innerHTML = products.map(product => {
            const revenue = parseFloat(product.revenue) || 0;
            const percentage = totalRevenue > 0 ? ((revenue / totalRevenue) * 100).toFixed(2) : '0.00';
            return `
            <tr>
                <td>${product.product_name}</td>
                <td>${product.quantity_sold || 0}</td>
                <td>${formatCurrency(revenue)}</td>
                <td>${percentage}%</td>
            </tr>
        `;
        }).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Không có dữ liệu</td></tr>';
    }
}

function loadTopProductsFromChart(products) {
    const tbody = document.getElementById('top-products-tbody');

    if (products && products.length > 0) {
        // Lọc sản phẩm có revenue > 0
        const productsWithRevenue = products.filter(p => parseFloat(p.revenue) > 0);
        
        if (productsWithRevenue.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Không có dữ liệu</td></tr>';
            return;
        }
        
        // Tính tổng doanh thu từ các sản phẩm có doanh thu
        const totalRevenue = productsWithRevenue.reduce((sum, p) => sum + (parseFloat(p.revenue) || 0), 0);
        const totalQuantity = productsWithRevenue.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0);
        
        // Tính % cho từng sản phẩm, đảm bảo tổng = 100%
        let percentages = productsWithRevenue.map(product => {
            const revenue = parseFloat(product.revenue) || 0;
            return totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
        });
        
        // Làm tròn và điều chỉnh để tổng = 100%
        let roundedPercentages = percentages.map(p => parseFloat(p.toFixed(2)));
        const sum = roundedPercentages.reduce((a, b) => a + b, 0);
        const diff = 100 - sum;
        // Điều chỉnh % lớn nhất để tổng = 100%
        if (Math.abs(diff) > 0.01) {
            const maxIndex = percentages.indexOf(Math.max(...percentages));
            roundedPercentages[maxIndex] = parseFloat((roundedPercentages[maxIndex] + diff).toFixed(2));
        }

        let rowsHTML = productsWithRevenue.map((product, index) => {
            const revenue = parseFloat(product.revenue) || 0;
            const quantity = parseInt(product.quantity) || 0;
            const percentage = roundedPercentages[index].toFixed(2);
            return `
            <tr>
                <td>${product.product_name}</td>
                <td>${quantity}</td>
                <td>${formatCurrency(revenue)}</td>
                <td>${percentage}%</td>
            </tr>
        `;
        }).join('');
        
        // Thêm dòng TỔNG CỘNG
        rowsHTML += `
            <tr style="background-color: #f0f0f0; font-weight: 600;">
                <td>TỔNG CỘNG</td>
                <td>${totalQuantity}</td>
                <td>${formatCurrency(totalRevenue)}</td>
                <td>100.00%</td>
            </tr>
        `;
        
        tbody.innerHTML = rowsHTML;
    } else {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Không có dữ liệu</td></tr>';
    }
}

function loadReportData(period) {
    loadReports(period);
}

function updateChartLegend(labels, colors, revenues = null) {
    const legendContainer = document.getElementById('product-chart-legend') || document.querySelector('.chart-legend');
    if (!legendContainer) return;
    
    if (labels && labels.length > 0) {
        let totalRevenue = 0;
        if (revenues && revenues.length > 0) {
            totalRevenue = revenues.reduce((sum, r) => sum + (parseFloat(r) || 0), 0);
        }
        
        legendContainer.innerHTML = labels.map((label, index) => {
            let labelText = label;
            // Thêm % vào legend nếu có revenues (chỉ hiển thị sản phẩm có doanh thu > 0)
            if (revenues && revenues.length > index && totalRevenue > 0) {
                const revenue = parseFloat(revenues[index]) || 0;
                if (revenue > 0) {
                    const percentage = ((revenue / totalRevenue) * 100).toFixed(1);
                    labelText = `${label} (${percentage}%)`;
                }
            }
            
            return `
            <div class="legend-item">
                <span class="legend-color" style="background: ${colors[index]};"></span>
                <span>${labelText}</span>
            </div>
        `;
        }).join('');
    } else {
        legendContainer.innerHTML = '';
    }
}

// Initialize year dropdown từ 2024 đến năm hiện tại
function initYearDropdown() {
    const yearSelect = document.getElementById('report-year-select');
    if (!yearSelect) return;
    
    const currentYear = new Date().getFullYear();
    const startYear = 2024;
    
    yearSelect.innerHTML = '';
    for (let year = startYear; year <= currentYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }
}

function loadReportByMonth() {
    const monthSelect = document.getElementById('report-month-select');
    const yearSelect = document.getElementById('report-year-select');
    
    const month = monthSelect?.value || '';
    const year = parseInt(yearSelect?.value || new Date().getFullYear());
    const monthNum = month ? parseInt(month) : null;
    
    // Kiểm tra xem tháng được chọn có phải là tháng tương lai không
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() trả về 0-11
    
    let isFutureMonth = false;
    if (monthNum) {
        // Nếu năm > năm hiện tại, hoặc năm = năm hiện tại nhưng tháng > tháng hiện tại
        if (year > currentYear || (year === currentYear && monthNum > currentMonth)) {
            isFutureMonth = true;
        }
    }
    
    // Nếu là tháng tương lai, hiển thị trống
    if (isFutureMonth) {
        clearChartsAndTable();
        return;
    }
    
    // Luôn gửi year (cho biểu đồ cột), gửi month nếu có (cho biểu đồ tròn)
    loadReports('month', monthNum, year);
}

function clearChartsAndTable() {
    // Xóa biểu đồ
    if (revenueChart) {
        revenueChart.destroy();
        revenueChart = null;
    }
    if (categoryChart) {
        categoryChart.destroy();
        categoryChart = null;
    }
    
    // Xóa canvas - không hiển thị thông báo, chỉ xóa trắng
    const revenueCtx = document.getElementById('revenueChart');
    const categoryCtx = document.getElementById('categoryChart');
    if (revenueCtx) {
        const ctx = revenueCtx.getContext('2d');
        ctx.clearRect(0, 0, revenueCtx.width, revenueCtx.height);
    }
    if (categoryCtx) {
        const ctx = categoryCtx.getContext('2d');
        ctx.clearRect(0, 0, categoryCtx.width, categoryCtx.height);
        // Không hiển thị thông báo, chỉ xóa trắng
    }
    
    // Xóa legend
    const legendContainer = document.getElementById('product-chart-legend') || document.querySelector('.chart-legend');
    if (legendContainer) {
        legendContainer.innerHTML = '';
    }
    
    // Xóa bảng doanh thu
    const tbody = document.getElementById('top-products-tbody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Tháng này không có doanh thu</td></tr>';
    }
    
    // Reset stats
    document.getElementById('revenue-stat').textContent = '0 ₫';
    document.getElementById('orders-stat').textContent = '0';
    document.getElementById('delivered-stat').textContent = '0';
    document.getElementById('customers-stat').textContent = '0';
}

function initCharts(chartData, selectedMonth = null, selectedYear = null) {
    // Đảm bảo destroy charts cũ trước khi tạo mới
    if (revenueChart) {
        revenueChart.destroy();
        revenueChart = null;
    }
    if (categoryChart) {
        categoryChart.destroy();
        categoryChart = null;
    }
    
    // Lấy month và year từ tham số hoặc từ DOM
    const monthSelect = document.getElementById('report-month-select');
    const yearSelect = document.getElementById('report-year-select');
    const month = selectedMonth !== null ? selectedMonth : (monthSelect?.value ? parseInt(monthSelect.value) : null);
    const year = selectedYear !== null ? selectedYear : parseInt(yearSelect?.value || new Date().getFullYear());
    
    const hasMonth = month !== null && month !== undefined;
    
    // Kiểm tra xem có phải tháng tương lai không
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    let isFutureMonth = false;
    if (hasMonth && month) {
        if (year > currentYear || (year === currentYear && month > currentMonth)) {
            isFutureMonth = true;
        }
    }

    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx && chartData.revenue) {
        // Kiểm tra xem có phải năm tương lai không
        const yearSelect = document.getElementById('report-year-select');
        const now = new Date();
        const currentYear = now.getFullYear();
        const selectedYear = parseInt(yearSelect?.value || currentYear);
        const isFutureYear = selectedYear > currentYear;
        
        if (isFutureYear) {
            // Năm tương lai: hiển thị trống
            const ctx = revenueCtx.getContext('2d');
            ctx.clearRect(0, 0, revenueCtx.width, revenueCtx.height);
            ctx.font = '16px Arial';
            ctx.fillStyle = '#999';
            ctx.textAlign = 'center';
            ctx.fillText('Năm tương lai không có dữ liệu', revenueCtx.width / 2, revenueCtx.height / 2);
        } else {
            // Chuyển đổi labels từ "01", "02" sang "Tháng 1", "Tháng 2"
            const monthLabels = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                                 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
            const labels = chartData.revenue.labels ? chartData.revenue.labels.map((label, index) => {
                const monthNum = parseInt(label) || (index + 1);
                return monthLabels[monthNum - 1] || label;
            }) : monthLabels;
            
            const data = chartData.revenue.data || Array(12).fill(0);
            
            // Xác định tháng hiện tại
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;
            const selectedYear = parseInt(document.getElementById('report-year-select')?.value || currentYear);
            
            // Tạo màu: tháng hiện tại màu đậm hơn (#2d4a3e), các tháng khác màu xanh (#4472C4)
            const backgroundColor = data.map((value, index) => {
                if (selectedYear === currentYear && (index + 1) === currentMonth) {
                    return '#2d4a3e'; // Màu đậm cho tháng hiện tại
                }
                return '#4472C4'; // Màu xanh cho các tháng khác
            });
            
        revenueChart = new Chart(revenueCtx.getContext('2d'), {
            type: 'bar',
            data: {
                    labels: labels,
                datasets: [{
                    label: 'Doanh thu (VNĐ)',
                        data: data,
                        backgroundColor: backgroundColor,
                        borderColor: backgroundColor,
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
                            callback: function (value) {
                                return (value / 1000000) + 'M';
                            }
                        }
                    }
                }
            }
        });
        }
    } else if (revenueCtx) {
        // Nếu không có data, hiển thị trống
        const ctx = revenueCtx.getContext('2d');
        ctx.clearRect(0, 0, revenueCtx.width, revenueCtx.height);
    }

    // Category Chart (biểu đồ tròn) - chỉ hiển thị khi có tháng được chọn và có dữ liệu
    const categoryCtx = document.getElementById('categoryChart');
    
    // Màu sắc cho biểu đồ (đủ cho nhiều sản phẩm)
    const chartColors = [
        '#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5', '#70AD47', '#FF0000', 
        '#7030A0', '#00B0F0', '#C55A11', '#8FAADC', '#F4B084', '#9BBB59', '#8064A2', 
        '#4BACC6', '#F79646', '#0000FF', '#00FF00', '#FF00FF'
    ];
    
    if (categoryCtx) {
        // Chỉ hiển thị biểu đồ tròn khi có tháng được chọn (không phải "Tất cả")
        if (hasMonth && month && !isFutureMonth) {
            // Kiểm tra xem có dữ liệu sản phẩm với doanh thu > 0 không (dùng revenues, không phải quantity)
            const hasProductData = chartData.products && 
                                   chartData.products.labels && 
                                   chartData.products.labels.length > 0 &&
                                   chartData.products.revenues && 
                                   chartData.products.revenues.some(r => parseFloat(r) > 0);
            
            if (hasProductData) {
                // Có dữ liệu sản phẩm với doanh thu: hiển thị biểu đồ tròn
                if (categoryChart) categoryChart.destroy();
                
                // Lọc chỉ các sản phẩm có doanh thu (revenue) > 0
                const filteredLabels = [];
                const filteredRevenues = [];
                
                chartData.products.labels.forEach((label, index) => {
                    const revenue = parseFloat(chartData.products.revenues[index] || 0);
                    if (revenue > 0) {
                        filteredLabels.push(label);
                        filteredRevenues.push(revenue);
                    }
                });
                
                if (filteredLabels.length > 0) {
                    // Tạo mảng màu cho từng sản phẩm có doanh thu
                    const colors = filteredLabels.map((_, index) => 
                        chartColors[index % chartColors.length]
                    );
                    
                    categoryChart = new Chart(categoryCtx.getContext('2d'), {
                        type: 'pie',
                        data: {
                            labels: filteredLabels,
                            datasets: [{
                                data: filteredRevenues, // Dùng doanh thu (revenue) thay vì số lượng (quantity)
                                backgroundColor: colors,
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
                    
                    // Cập nhật legend động từ revenues (doanh thu) với %
                    updateChartLegend(filteredLabels, colors, filteredRevenues);
                } else {
                    // Không có sản phẩm nào có doanh thu > 0: không hiển thị gì
                    if (categoryChart) categoryChart.destroy();
                    const ctx = categoryCtx.getContext('2d');
                    ctx.clearRect(0, 0, categoryCtx.width, categoryCtx.height);
                    // Xóa legend
                    updateChartLegend([], []);
                }
            } else {
                // Không có dữ liệu: không hiển thị gì
                if (categoryChart) categoryChart.destroy();
                const ctx = categoryCtx.getContext('2d');
                ctx.clearRect(0, 0, categoryCtx.width, categoryCtx.height);
                // Xóa legend
                updateChartLegend([], []);
            }
        } else {
            // Không chọn tháng hoặc tháng tương lai: không hiển thị gì
            if (categoryChart) categoryChart.destroy();
            const ctx = categoryCtx.getContext('2d');
            ctx.clearRect(0, 0, categoryCtx.width, categoryCtx.height);
            // Xóa legend
            updateChartLegend([], []);
        }
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
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
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
        promotion_code: document.getElementById('promo-code').value.trim(),
        promotion_name: document.getElementById('promo-name').value.trim(),
        promotion_type: document.getElementById('promo-type').value,
        start_date: document.getElementById('promo-start').value,
        end_date: document.getElementById('promo-end').value,
        discount_value: document.getElementById('promo-value').value || 0,
        quantity: document.getElementById('promo-quantity').value || -1,
        min_order_value: document.getElementById('promo-condition').value || 0,
        image_url: document.getElementById('promo-image-url').value.trim() || ''
    };

    if (!promoData.promotion_code || !promoData.promotion_name || !promoData.promotion_type) {
        showError('Vui lòng điền đầy đủ thông tin khuyến mãi');
        return;
    }

    if (!promoData.start_date || !promoData.end_date) {
        showError('Vui lòng chọn ngày bắt đầu và ngày kết thúc');
        return;
    }

    try {
        const jwtToken = localStorage.getItem('jwtToken') || 'demo';
        const response = await fetch(`${API_BASE_URL}/promotions.php`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify(promoData)
        });

        // Kiểm tra response status trước khi parse JSON
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                const errorText = await response.text();
                errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        if (data.success) {
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
            document.getElementById('promo-image-url').value = '';
        } else {
            throw new Error(data.message || 'Failed to create promotion');
        }
    } catch (error) {
        console.error('Error creating promotion:', error);
        showError('Không thể tạo khuyến mãi: ' + error.message);
    }
}

async function viewPromoDetail(promoId) {
    try {
        window.currentPromoId = promoId;
        currentPromoId = promoId;
        const response = await fetch(`${API_BASE_URL}/promotions.php/${promoId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
            }
        });
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to load promotion');
        }

        const promo = data.data;
        const modalBody = document.getElementById('promo-detail-body');
        modalBody.innerHTML = `
            <div class="info-section">
                ${promo.image_url ? `
                <div class="info-row">
                    <span class="info-label">Hình ảnh:</span>
                    <span class="info-value">
                        <img src="../${promo.image_url}" alt="${promo.promotion_name}" style="max-width: 300px; max-height: 200px; border-radius: 8px;">
                    </span>
                </div>
                ` : ''}
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

async function deletePromotion(promoId) {
    if (!confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/promotions.php/${promoId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
            }
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Xóa khuyến mãi thành công');
            loadPromotions();
        } else {
            throw new Error(data.message || 'Failed to delete promotion');
        }
    } catch (error) {
        console.error('Error deleting promotion:', error);
        showError('Không thể xóa khuyến mãi');
    }
}

async function openEditPromoModal() {
    if (!window.currentPromoId && !currentPromoId) return;
    const promoId = window.currentPromoId || currentPromoId;
    
    try {
        const response = await fetch(`${API_BASE_URL}/promotions.php/${promoId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
            }
        });
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to load promotion');
        }

        const promo = data.data;
        
        // Fill form
        document.getElementById('edit-promo-code').value = promo.promotion_code || '';
        document.getElementById('edit-promo-name').value = promo.promotion_name || '';
        document.getElementById('edit-promo-type').value = promo.promotion_type || '';
        document.getElementById('edit-promo-value').value = promo.discount_value || '';
        document.getElementById('edit-promo-min-order').value = promo.min_order_value || '';
        document.getElementById('edit-promo-quantity').value = promo.quantity || '';
        document.getElementById('edit-promo-status').value = promo.status || 'active';
        document.getElementById('edit-promo-image-url').value = promo.image_url || '';
        
        // Format dates for datetime-local input
        if (promo.start_date) {
            const startDate = new Date(promo.start_date);
            document.getElementById('edit-promo-start').value = startDate.toISOString().slice(0, 16);
        }
        if (promo.end_date) {
            const endDate = new Date(promo.end_date);
            document.getElementById('edit-promo-end').value = endDate.toISOString().slice(0, 16);
        }

        document.getElementById('promoEditModal').classList.add('active');
    } catch (error) {
        console.error('Error loading promotion for edit:', error);
        showError('Không thể tải thông tin khuyến mãi');
    }
}

async function updatePromotion() {
    const promoId = window.currentPromoId || currentPromoId;
    if (!promoId) return;
    
    const promoData = {
        promotion_code: document.getElementById('edit-promo-code').value,
        promotion_name: document.getElementById('edit-promo-name').value,
        promotion_type: document.getElementById('edit-promo-type').value,
        discount_value: document.getElementById('edit-promo-value').value || 0,
        min_order_value: document.getElementById('edit-promo-min-order').value || 0,
        quantity: document.getElementById('edit-promo-quantity').value || -1,
        status: document.getElementById('edit-promo-status').value,
        start_date: document.getElementById('edit-promo-start').value,
        end_date: document.getElementById('edit-promo-end').value,
        image_url: document.getElementById('edit-promo-image-url').value || ''
    };

    if (!promoData.promotion_code || !promoData.promotion_name || !promoData.promotion_type) {
        showError('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/promotions.php/${promoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
            },
            body: JSON.stringify(promoData)
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Cập nhật khuyến mãi thành công');
            closeModal('promoEditModal');
            loadPromotions();
        } else {
            throw new Error(data.message || 'Failed to update promotion');
        }
    } catch (error) {
        console.error('Error updating promotion:', error);
        showError('Không thể cập nhật khuyến mãi');
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
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
            }
        });
        const data = await response.json();

        const tbody = document.getElementById('complaints-tbody');

        if (data.success && data.data && data.data.length > 0) {
            const complaints = data.data;
            tbody.innerHTML = complaints.map(complaint => `
                <tr>
                    <td>${complaint.ComplaintCode}</td>
                    <td>${complaint.OrderCode}</td>
                    <td>${complaint.CustomerName}</td>
                    <td>${complaint.Title}</td>
                    <td>${formatDate(complaint.CreatedAt)}</td>
                    <td>
                        <span class="status-badge status-${complaint.Status}">
                            ${getComplaintStatusText(complaint.Status)}
                        </span>
                    </td>
                    <td>
                        <div class="action-btns">
                            <button class="icon-btn" onclick="viewComplaintDetail(${complaint.ComplaintID})" title="Chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                            <button class="icon-btn" onclick="deleteComplaint(${complaint.ComplaintID})" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
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
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await fetch(`${API_BASE_URL}/complaints.php/${complaintId}`, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        // ✅ FIX: Kiểm tra response
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server không trả về JSON");
        }

        const result = await response.json();
        const complaint = result.data || result;

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
        showError(`Không thể tải chi tiết khiếu nại: ${error.message}`);
    }
}

async function updateComplaintStatus() {
    const newStatus = document.getElementById('complaint-status-select').value;

    try {
        const response = await fetch(`${API_BASE_URL}/complaints.php/${currentComplaintId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Cập nhật trạng thái khiếu nại thành công');
            closeModal('complaintModal');
            loadComplaints();
        } else {
            throw new Error(data.message || 'Failed to update complaint status');
        }
    } catch (error) {
        console.error('Error updating complaint status:', error);
        showError('Không thể cập nhật trạng thái khiếu nại');
    }
}

async function deleteComplaint(complaintId) {
    if (!confirm('Bạn có chắc chắn muốn xóa khiếu nại này?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/complaints.php/${complaintId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken') || 'demo'}`
            }
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Xóa khiếu nại thành công');
            loadComplaints();
        } else {
            throw new Error(data.message || 'Failed to delete complaint');
        }
    } catch (error) {
        console.error('Error deleting complaint:', error);
        showError('Không thể xóa khiếu nại');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal on outside click
window.addEventListener('click', function (event) {
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
        'order_received': 'Đã nhận đơn',
        'preparing': 'Đang chuẩn bị',
        'delivering': 'Đang giao',
        'delivery_successful': 'Giao hàng thành công',
        'delivery_failed': 'Giao hàng thất bại'
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
        'pending': 'Chưa xử lý',
        'resolved': 'Đã xử lý'
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

// Xử lý tất cả lỗi ảnh khi trang load xong
document.addEventListener('DOMContentLoaded', function () {
    // Thêm xử lý lỗi cho TẤT CẢ ảnh trên trang
    const handleImageError = function () {
        if (this.src !== PLACEHOLDER_IMAGE) {
            console.warn('❌ Không tìm thấy ảnh:', this.src);
            this.src = PLACEHOLDER_IMAGE;
            this.alt = 'Không có ảnh';
        }
    };

    // Áp dụng cho tất cả ảnh hiện tại
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', handleImageError);
    });

    // Theo dõi ảnh mới được thêm vào (dùng MutationObserver)
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                if (node.tagName === 'IMG') {
                    node.addEventListener('error', handleImageError);
                } else if (node.querySelectorAll) {
                    node.querySelectorAll('img').forEach(img => {
                        img.addEventListener('error', handleImageError);
                    });
                }
            });
        });
    });

    // Bắt đầu theo dõi
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
// Thêm global error handler
window.addEventListener('unhandledrejection', function (event) {
    console.error('❌ Promise bị reject:', event.reason);
    event.preventDefault(); // Ngăn lỗi hiển thị trong console

    // Hiển thị thông báo lỗi cho user
    showError('Có lỗi xảy ra. Vui lòng thử lại sau.');
});

// ✅ FIX: Thêm function logout cho admin
function logout() {
    // Xóa tất cả dữ liệu đăng nhập
    localStorage.removeItem('currentUser');
    localStorage.removeItem('jwtToken');

    // Hiển thị thông báo đăng xuất thành công
    showSuccess('Đã đăng xuất thành công!');

    // Chuyển về trang home sau 1 giây
    setTimeout(() => {
        window.location.href = '../pages/home/home.html';
    }, 1000);
}

// ============================================
// EXPORT REPORT TO PDF
// ============================================

async function exportReportToPDF() {
    try {
        // Hiển thị loading
        const exportBtn = document.getElementById('export-pdf-btn');
        const originalText = exportBtn.innerHTML;
        exportBtn.disabled = true;
        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xuất PDF...';

        // Kiểm tra xem jsPDF và html2canvas đã được load chưa
        if (typeof window.jspdf === 'undefined' || typeof html2canvas === 'undefined') {
            throw new Error('Thư viện PDF chưa được tải. Vui lòng tải lại trang.');
        }

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        let yPosition = margin;

        // Tạo container ẩn cho tiêu đề và ngày xuất
        const now = new Date();
        const dateStr = now.toLocaleDateString('vi-VN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const headerDiv = document.createElement('div');
        headerDiv.style.position = 'absolute';
        headerDiv.style.left = '-9999px';
        headerDiv.style.width = '210mm';
        headerDiv.style.padding = '20px';
        headerDiv.style.backgroundColor = '#ffffff';
        headerDiv.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        headerDiv.innerHTML = `
            <h1 style="font-size: 24px; font-weight: bold; text-align: center; margin: 0 0 10px 0; color: #333;">BÁO CÁO DOANH THU</h1>
            <p style="font-size: 12px; text-align: center; margin: 0; color: #666;">Ngày xuất: ${dateStr}</p>
        `;
        document.body.appendChild(headerDiv);
        
        try {
            const headerCanvas = await html2canvas(headerDiv, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                width: headerDiv.offsetWidth,
                height: headerDiv.offsetHeight
            });
            const headerImgData = headerCanvas.toDataURL('image/png');
            const headerHeight = (headerCanvas.height * (pageWidth - 2 * margin)) / headerCanvas.width;
            pdf.addImage(headerImgData, 'PNG', margin, yPosition, pageWidth - 2 * margin, headerHeight);
            yPosition += headerHeight + 10;
        } catch (error) {
            console.error('Lỗi khi xuất tiêu đề:', error);
        }
        document.body.removeChild(headerDiv);

        // 2. Chụp phần thống kê tổng quan bằng html2canvas
        const statsGrid = document.querySelector('.stats-grid');
        if (statsGrid) {
            try {
                const statsCanvas = await html2canvas(statsGrid, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    logging: false
                });
                const statsImgData = statsCanvas.toDataURL('image/png');
                const statsHeight = (statsCanvas.height * (pageWidth - 2 * margin)) / statsCanvas.width;
                
                if (yPosition + statsHeight > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }
                
                // Thêm tiêu đề cho phần thống kê
                const statsTitleDiv = document.createElement('div');
                statsTitleDiv.style.position = 'absolute';
                statsTitleDiv.style.left = '-9999px';
                statsTitleDiv.style.width = '210mm';
                statsTitleDiv.style.padding = '10px 20px';
                statsTitleDiv.style.backgroundColor = '#ffffff';
                statsTitleDiv.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                statsTitleDiv.innerHTML = '<h2 style="font-size: 16px; font-weight: bold; margin: 0; color: #333;">THỐNG KÊ TỔNG QUAN</h2>';
                document.body.appendChild(statsTitleDiv);
                
                const titleCanvas = await html2canvas(statsTitleDiv, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    logging: false
                });
                const titleImgData = titleCanvas.toDataURL('image/png');
                const titleHeight = (titleCanvas.height * (pageWidth - 2 * margin)) / titleCanvas.width;
                
                pdf.addImage(titleImgData, 'PNG', margin, yPosition, pageWidth - 2 * margin, titleHeight);
                yPosition += titleHeight + 5;
                
                document.body.removeChild(statsTitleDiv);
                
                pdf.addImage(statsImgData, 'PNG', margin, yPosition, pageWidth - 2 * margin, statsHeight);
                yPosition += statsHeight + 10;
            } catch (error) {
                console.error('Lỗi khi xuất thống kê:', error);
            }
        }

        // 3. Chuyển đổi và thêm biểu đồ doanh thu
        const revenueChart = document.getElementById('revenueChart');
        if (revenueChart) {
            try {
                const revenueCanvas = await html2canvas(revenueChart, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    logging: false
                });
                const revenueImgData = revenueCanvas.toDataURL('image/png');
                
                // Kiểm tra chiều cao của biểu đồ
                const imgHeight = (revenueCanvas.height * (pageWidth - 2 * margin)) / revenueCanvas.width;
                
                if (yPosition + imgHeight > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }
                
                // Thêm tiêu đề cho biểu đồ bằng html2canvas
                const chartTitle1Div = document.createElement('div');
                chartTitle1Div.style.position = 'absolute';
                chartTitle1Div.style.left = '-9999px';
                chartTitle1Div.style.width = '210mm';
                chartTitle1Div.style.padding = '10px 20px';
                chartTitle1Div.style.backgroundColor = '#ffffff';
                chartTitle1Div.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                chartTitle1Div.innerHTML = '<h2 style="font-size: 14px; font-weight: bold; margin: 0; color: #333;">BIỂU ĐỒ DOANH THU THEO THÁNG</h2>';
                document.body.appendChild(chartTitle1Div);
                
                const chartTitle1Canvas = await html2canvas(chartTitle1Div, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    logging: false
                });
                const chartTitle1ImgData = chartTitle1Canvas.toDataURL('image/png');
                const chartTitle1Height = (chartTitle1Canvas.height * (pageWidth - 2 * margin)) / chartTitle1Canvas.width;
                
                pdf.addImage(chartTitle1ImgData, 'PNG', margin, yPosition, pageWidth - 2 * margin, chartTitle1Height);
                yPosition += chartTitle1Height + 5;
                
                document.body.removeChild(chartTitle1Div);
                
                pdf.addImage(revenueImgData, 'PNG', margin, yPosition, pageWidth - 2 * margin, imgHeight);
                yPosition += imgHeight + 10;
            } catch (error) {
                console.error('Lỗi khi xuất biểu đồ doanh thu:', error);
            }
        }

        // 4. Chuyển đổi và thêm biểu đồ sản phẩm
        const categoryChart = document.getElementById('categoryChart');
        if (categoryChart) {
            try {
                if (yPosition > pageHeight - 100) {
                    pdf.addPage();
                    yPosition = margin;
                }
                
                const categoryCanvas = await html2canvas(categoryChart, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    logging: false
                });
                const categoryImgData = categoryCanvas.toDataURL('image/png');
                
                const imgHeight = (categoryCanvas.height * (pageWidth - 2 * margin)) / categoryCanvas.width;
                
                if (yPosition + imgHeight > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }
                
                // Thêm tiêu đề cho biểu đồ bằng html2canvas
                const chartTitle2Div = document.createElement('div');
                chartTitle2Div.style.position = 'absolute';
                chartTitle2Div.style.left = '-9999px';
                chartTitle2Div.style.width = '210mm';
                chartTitle2Div.style.padding = '10px 20px';
                chartTitle2Div.style.backgroundColor = '#ffffff';
                chartTitle2Div.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                chartTitle2Div.innerHTML = '<h2 style="font-size: 14px; font-weight: bold; margin: 0; color: #333;">BIỂU ĐỒ DOANH THU THEO SẢN PHẨM</h2>';
                document.body.appendChild(chartTitle2Div);
                
                const chartTitle2Canvas = await html2canvas(chartTitle2Div, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    logging: false
                });
                const chartTitle2ImgData = chartTitle2Canvas.toDataURL('image/png');
                const chartTitle2Height = (chartTitle2Canvas.height * (pageWidth - 2 * margin)) / chartTitle2Canvas.width;
                
                pdf.addImage(chartTitle2ImgData, 'PNG', margin, yPosition, pageWidth - 2 * margin, chartTitle2Height);
                yPosition += chartTitle2Height + 5;
                
                document.body.removeChild(chartTitle2Div);
                
                pdf.addImage(categoryImgData, 'PNG', margin, yPosition, pageWidth - 2 * margin, imgHeight);
                yPosition += imgHeight + 10;
            } catch (error) {
                console.error('Lỗi khi xuất biểu đồ sản phẩm:', error);
            }
        }

        // 5. Chụp bảng chi tiết sản phẩm bằng html2canvas
        const topProductsTable = document.querySelector('.products-report-table');
        if (topProductsTable && topProductsTable.querySelector('tbody')) {
            const tbody = topProductsTable.querySelector('tbody');
            const rows = tbody.querySelectorAll('tr:not(.empty-state)');
            
            if (rows.length > 0) {
                try {
                    if (yPosition > pageHeight - 80) {
                        pdf.addPage();
                        yPosition = margin;
                    }
                    
                    // Thêm tiêu đề cho bảng bằng html2canvas
                    const tableTitleDiv = document.createElement('div');
                    tableTitleDiv.style.position = 'absolute';
                    tableTitleDiv.style.left = '-9999px';
                    tableTitleDiv.style.width = '210mm';
                    tableTitleDiv.style.padding = '10px 20px';
                    tableTitleDiv.style.backgroundColor = '#ffffff';
                    tableTitleDiv.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                    tableTitleDiv.innerHTML = '<h2 style="font-size: 14px; font-weight: bold; margin: 0; color: #333;">CHI TIẾT DOANH THU THEO SẢN PHẨM</h2>';
                    document.body.appendChild(tableTitleDiv);
                    
                    const tableTitleCanvas = await html2canvas(tableTitleDiv, {
                        backgroundColor: '#ffffff',
                        scale: 2,
                        logging: false
                    });
                    const tableTitleImgData = tableTitleCanvas.toDataURL('image/png');
                    const tableTitleHeight = (tableTitleCanvas.height * (pageWidth - 2 * margin)) / tableTitleCanvas.width;
                    
                    pdf.addImage(tableTitleImgData, 'PNG', margin, yPosition, pageWidth - 2 * margin, tableTitleHeight);
                    yPosition += tableTitleHeight + 5;
                    
                    document.body.removeChild(tableTitleDiv);
                    
                    // Chụp toàn bộ bảng
                    const tableCanvas = await html2canvas(topProductsTable, {
                        backgroundColor: '#ffffff',
                        scale: 2,
                        logging: false
                    });
                    const tableImgData = tableCanvas.toDataURL('image/png');
                    const tableHeight = (tableCanvas.height * (pageWidth - 2 * margin)) / tableCanvas.width;
                    
                    if (yPosition + tableHeight > pageHeight - margin) {
                        pdf.addPage();
                        yPosition = margin;
                    }
                    
                    pdf.addImage(tableImgData, 'PNG', margin, yPosition, pageWidth - 2 * margin, tableHeight);
                    yPosition += tableHeight + 10;
                } catch (error) {
                    console.error('Lỗi khi xuất bảng:', error);
                }
            }
        }

        // 6. Thêm chân trang bằng html2canvas
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            
            // Tạo chân trang bằng html2canvas để hỗ trợ tiếng Việt
            const footerDiv = document.createElement('div');
            footerDiv.style.position = 'absolute';
            footerDiv.style.left = '-9999px';
            footerDiv.style.width = '210mm';
            footerDiv.style.padding = '5px';
            footerDiv.style.backgroundColor = '#ffffff';
            footerDiv.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            footerDiv.style.textAlign = 'center';
            footerDiv.innerHTML = `<p style="font-size: 10px; margin: 0; color: #666;">Trang ${i} / ${totalPages}</p>`;
            document.body.appendChild(footerDiv);
            
            try {
                const footerCanvas = await html2canvas(footerDiv, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    logging: false
                });
                const footerImgData = footerCanvas.toDataURL('image/png');
                const footerHeight = (footerCanvas.height * (pageWidth - 2 * margin)) / footerCanvas.width;
                const footerY = pageHeight - footerHeight - 5;
                
                pdf.addImage(footerImgData, 'PNG', margin, footerY, pageWidth - 2 * margin, footerHeight);
            } catch (error) {
                console.error('Lỗi khi xuất chân trang:', error);
            }
            
            document.body.removeChild(footerDiv);
        }

        // 7. Xuất file PDF
        const year = document.getElementById('report-year-select')?.value || new Date().getFullYear();
        const month = document.getElementById('report-month-select')?.value;
        let fileName = `BaoCao_${year}`;
        if (month) {
            fileName += `_Thang${month}`;
        }
        fileName += `_${now.toISOString().split('T')[0]}.pdf`;
        
        pdf.save(fileName);

        // Hiển thị thông báo thành công
        showSuccess('Đã xuất báo cáo PDF thành công!');
        
        // Khôi phục nút
        exportBtn.disabled = false;
        exportBtn.innerHTML = originalText;
    } catch (error) {
        console.error('Lỗi khi xuất PDF:', error);
        showError('Không thể xuất PDF: ' + error.message);
        
        // Khôi phục nút
        const exportBtn = document.getElementById('export-pdf-btn');
        if (exportBtn) {
            exportBtn.disabled = false;
            exportBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Xuất PDF';
        }
    }
}

// Expose function to global scope
window.exportReportToPDF = exportReportToPDF;