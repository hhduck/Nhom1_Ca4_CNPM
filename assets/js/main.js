// Main JavaScript file for LA CUISINE NGỌT

// Global variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadFeaturedProducts();
    updateCartCount();
});

// Initialize application
function initializeApp() {
    // Check if user is logged in
    if (currentUser) {
        updateUserInterface();
    }
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize search functionality
    initSearch();

    // Ensure global navigation helpers exist
    if (typeof window.getHomePath !== 'function') {
        window.getHomePath = getHomePath;
    }
    if (typeof window.getBasePathToPages !== 'function') {
        window.getBasePathToPages = getBasePathToPages;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    // Cart functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-add-cart')) {
            const productId = e.target.dataset.productId;
            addToCart(productId);
        }
        
        if (e.target.classList.contains('quantity-btn')) {
            const action = e.target.dataset.action;
            const productId = e.target.dataset.productId;
            updateCartQuantity(productId, action);
        }
        
        if (e.target.classList.contains('remove-item')) {
            const productId = e.target.dataset.productId;
            removeFromCart(productId);
        }
    });
}

// Mobile menu functionality
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Search functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            if (query.length > 2) {
                // Implement live search if needed
                console.log('Searching for:', query);
            }
        });
    }
}

// Navigation helpers to make paths robust across folders
function getBasePathToPages() {
    // Determine path prefix from current location to the `pages/` directory
    const path = window.location.pathname.replace(/\\/g, '/');
    // Cases:
    // - From root (e.g., /index.html or /) -> pages/
    // - From /pages/* -> ../pages/
    // - From /admin/* -> ../pages/
    // - From /assets/* -> ../pages/
    if (path.includes('/pages/')) return '../pages/';
    if (path.includes('/admin/')) return '../pages/';
    if (path.includes('/assets/')) return '../pages/';
    return 'pages/';
}

function getHomePath() {
    const base = getBasePathToPages();
    return `${base}home/home.html`;
}

function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (query) {
        // Redirect to products page with search query
        const base = getBasePathToPages();
        window.location.href = `${base}products/products.html?search=${encodeURIComponent(query)}`;
    }
}

// Product management
async function loadFeaturedProducts() {
    try {
        const response = await fetch('api/products.php?featured=1');
        const products = await response.json();
        
        const productsGrid = document.getElementById('featuredProducts');
        if (productsGrid && products.length > 0) {
            productsGrid.innerHTML = products.map(product => createProductCard(product)).join('');
        }
    } catch (error) {
        console.error('Error loading featured products:', error);
        // Fallback to static products
        loadStaticProducts();
    }
}

function loadStaticProducts() {
    const staticProducts = [
        {
            id: 1,
            name: "Bánh Kem Chocolate",
            description: "Bánh kem chocolate thơm ngon với lớp kem mịn màng",
            price: 250000,
            image: "assets/images/cake1.jpg"
        },
        {
            id: 2,
            name: "Bánh Kem Vanilla",
            description: "Bánh kem vanilla truyền thống với hương vị tinh tế",
            price: 200000,
            image: "assets/images/cake2.jpg"
        },
        {
            id: 3,
            name: "Bánh Kem Dâu Tây",
            description: "Bánh kem dâu tây tươi ngon, ngọt ngào",
            price: 280000,
            image: "assets/images/cake3.jpg"
        }
    ];
    
    const productsGrid = document.getElementById('featuredProducts');
    if (productsGrid) {
        productsGrid.innerHTML = staticProducts.map(product => createProductCard(product)).join('');
    }
}

function createProductCard(product) {
    return `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='assets/images/placeholder-cake.jpg'">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${formatPrice(product.price)}</div>
                <button class="btn-add-cart" data-product-id="${product.id}">
                    Thêm vào giỏ
                </button>
            </div>
        </div>
    `;
}

// Cart management
function addToCart(productId) {
    // Find product details
    const product = getProductById(productId);
    if (!product) return;
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update UI
    updateCartCount();
    showMessage('Đã thêm sản phẩm vào giỏ hàng!', 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    loadCartItems();
    showMessage('Đã xóa sản phẩm khỏi giỏ hàng!', 'info');
}

function updateCartQuantity(productId, action) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    if (action === 'increase') {
        item.quantity += 1;
    } else if (action === 'decrease' && item.quantity > 1) {
        item.quantity -= 1;
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    loadCartItems();
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function loadCartItems() {
    const cartContainer = document.getElementById('cartItems');
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Giỏ hàng trống</p>';
        return;
    }
    
    cartContainer.innerHTML = cart.map(item => createCartItem(item)).join('');
    updateCartTotal();
}

function createCartItem(item) {
    return `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='assets/images/placeholder-cake.jpg'">
            <div class="cart-item-info">
                <h3 class="cart-item-name">${item.name}</h3>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" data-action="decrease" data-product-id="${item.id}">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" readonly>
                <button class="quantity-btn" data-action="increase" data-product-id="${item.id}">+</button>
            </div>
            <div class="cart-item-total">${formatPrice(item.price * item.quantity)}</div>
            <button class="remove-item" data-product-id="${item.id}">Xóa</button>
        </div>
    `;
}

function updateCartTotal() {
    const totalElement = document.getElementById('cartTotal');
    if (totalElement) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalElement.textContent = formatPrice(total);
    }
}

// Utility functions
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

function getProductById(id) {
    // This would normally fetch from API
    // For now, return a mock product
    return {
        id: id,
        name: `Sản phẩm ${id}`,
        price: 200000,
        image: 'assets/images/placeholder-cake.jpg'
    };
}

function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at top of page
    document.body.insertBefore(messageDiv, document.body.firstChild);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// User authentication
function updateUserInterface() {
    const userActions = document.querySelector('.user-actions');
    if (userActions && currentUser) {
        userActions.innerHTML = `
            <span>Xin chào, ${currentUser.name}</span>
            <a href="profile.html" class="btn-login">Hồ sơ</a>
            <a href="orders.html" class="btn-login">Đơn hàng</a>
            <a href="#" onclick="logout()" class="btn-register">Đăng xuất</a>
            <a href="cart.html" class="cart-icon">
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-count">0</span>
            </a>
        `;
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    location.reload();
}

// Form handling
function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    // Simulate login
    if (loginData.username && loginData.password) {
        currentUser = {
            id: 1,
            name: loginData.username,
            email: loginData.username + '@example.com'
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMessage('Đăng nhập thành công!', 'success');
        setTimeout(() => {
            window.location.href = getHomePath();
        }, 1500);
    } else {
        showMessage('Vui lòng nhập đầy đủ thông tin!', 'error');
    }
}

function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const registerData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword')
    };
    
    if (registerData.password !== registerData.confirmPassword) {
        showMessage('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }
    
    if (registerData.name && registerData.email && registerData.password) {
        showMessage('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
        setTimeout(() => {
            const base = getBasePathToPages();
            window.location.href = `${base}login/login.html`;
        }, 1500);
    } else {
        showMessage('Vui lòng nhập đầy đủ thông tin!', 'error');
    }
}

function handleContact(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        company: formData.get('company'),
        phone: formData.get('phone'),
        message: formData.get('message')
    };
    
    if (contactData.name && contactData.email && contactData.message) {
        showMessage('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.', 'success');
        event.target.reset();
    } else {
        showMessage('Vui lòng nhập đầy đủ thông tin bắt buộc!', 'error');
    }
}

// Checkout functionality
function proceedToCheckout() {
    if (cart.length === 0) {
        showMessage('Giỏ hàng trống!', 'error');
        return;
    }
    
    if (!currentUser) {
        showMessage('Vui lòng đăng nhập để tiếp tục!', 'error');
        setTimeout(() => {
            const base = getBasePathToPages();
            window.location.href = `${base}login/login.html`;
        }, 1500);
        return;
    }
    
    // Redirect to checkout page
    const base = getBasePathToPages();
    window.location.href = `${base}checkout/checkout.html`;
}

// Admin functions
function loadAdminData() {
    // Load admin data based on current tab
    const activeTab = document.querySelector('.admin-nav a.active');
    if (activeTab) {
        const tabType = activeTab.dataset.tab;
        loadAdminContent(tabType);
    }
}

function loadAdminContent(tabType) {
    const content = document.getElementById('adminContent');
    if (!content) return;
    
    switch(tabType) {
        case 'products':
            loadProductsTable();
            break;
        case 'orders':
            loadOrdersTable();
            break;
        case 'customers':
            loadCustomersTable();
            break;
        case 'statistics':
            loadStatistics();
            break;
    }
}

function loadProductsTable() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <h3>Quản lý sản phẩm</h3>
        <button class="btn-primary" onclick="addProduct()">Thêm sản phẩm mới</button>
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Tên sản phẩm</th>
                    <th>Giá</th>
                    <th>Danh mục</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>Bánh Kem Chocolate</td>
                    <td>250,000 VNĐ</td>
                    <td>Bánh sinh nhật</td>
                    <td>Hoạt động</td>
                    <td>
                        <button class="btn-edit" onclick="editProduct(1)">Sửa</button>
                        <button class="btn-delete" onclick="deleteProduct(1)">Xóa</button>
                    </td>
                </tr>
            </tbody>
        </table>
    `;
}

function loadOrdersTable() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <h3>Quản lý đơn hàng</h3>
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
            <tbody>
                <tr>
                    <td>#ORD001</td>
                    <td>Nguyễn Văn A</td>
                    <td>500,000 VNĐ</td>
                    <td>Chờ xác nhận</td>
                    <td>2024-01-15</td>
                    <td>
                        <button class="btn-edit" onclick="viewOrder('ORD001')">Xem</button>
                        <button class="btn-edit" onclick="updateOrderStatus('ORD001')">Cập nhật</button>
                    </td>
                </tr>
            </tbody>
        </table>
    `;
}

function loadCustomersTable() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <h3>Quản lý khách hàng</h3>
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Tên khách hàng</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>Nguyễn Văn A</td>
                    <td>nguyenvana@email.com</td>
                    <td>0123456789</td>
                    <td>Hoạt động</td>
                    <td>
                        <button class="btn-edit" onclick="editCustomer(1)">Sửa</button>
                        <button class="btn-delete" onclick="toggleCustomerStatus(1)">Khóa</button>
                    </td>
                </tr>
            </tbody>
        </table>
    `;
}

function loadStatistics() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <h3>Thống kê</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0;">
            <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; text-align: center;">
                <h4>Tổng doanh thu</h4>
                <p style="font-size: 1.5rem; font-weight: bold; color: #2d5016;">15,000,000 VNĐ</p>
            </div>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; text-align: center;">
                <h4>Số đơn hàng</h4>
                <p style="font-size: 1.5rem; font-weight: bold; color: #2d5016;">45</p>
            </div>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; text-align: center;">
                <h4>Sản phẩm bán chạy</h4>
                <p style="font-size: 1.5rem; font-weight: bold; color: #2d5016;">Bánh Chocolate</p>
            </div>
        </div>
    `;
}

// Initialize admin page
if (window.location.pathname.includes('admin')) {
    document.addEventListener('DOMContentLoaded', function() {
        // Set up admin navigation
        const adminNav = document.querySelector('.admin-nav');
        if (adminNav) {
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
            
            // Load default content
            const firstTab = adminNav.querySelector('a');
            if (firstTab) {
                firstTab.classList.add('active');
                loadAdminContent(firstTab.dataset.tab);
            }
        }
    });
}

