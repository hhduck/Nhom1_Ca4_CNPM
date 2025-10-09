/**
 * Products Page JavaScript
 * Handles products listing functionality for LA CUISINE NGỌT
 */

let currentPage = 1;
let currentFilters = {};
let isLoading = false;

// Load products on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
    updateCartCount();
});

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
        
        // Real-time search
        searchInput.addEventListener('input', debounce(function() {
            handleSearch();
        }, 500));
    }
    
    // Filter change events
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const sortBy = document.getElementById('sortBy');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    if (priceFilter) {
        priceFilter.addEventListener('change', applyFilters);
    }
    if (sortBy) {
        sortBy.addEventListener('change', applyFilters);
    }
    
    // Add to cart functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-add-cart')) {
            e.preventDefault();
            const productId = e.target.dataset.productId;
            addToCart(productId);
        }
    });
}

function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (query) {
        currentFilters.search = query;
    } else {
        delete currentFilters.search;
    }
    
    currentPage = 1;
    loadProducts();
}

function applyFilters() {
    const category = document.getElementById('categoryFilter').value;
    const price = document.getElementById('priceFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    
    currentFilters = {};
    
    if (category) currentFilters.category = category;
    if (price) currentFilters.price = price;
    if (sortBy) currentFilters.sort = sortBy;
    
    currentPage = 1;
    loadProducts();
}

function clearFilters() {
    document.getElementById('categoryFilter').value = '';
    document.getElementById('priceFilter').value = '';
    document.getElementById('sortBy').value = 'newest';
    document.getElementById('searchInput').value = '';
    
    currentFilters = {};
    currentPage = 1;
    loadProducts();
}

async function loadProducts() {
    if (isLoading) return;
    
    isLoading = true;
    showLoading();
    
    try {
        const params = new URLSearchParams({
            page: currentPage,
            limit: 12
        });
        
        // Add filters to params
        Object.keys(currentFilters).forEach(key => {
            params.append(key, currentFilters[key]);
        });
        
        const response = await fetch(`../../api/products.php?${params}`);
        const data = await response.json();
        
        if (data.success) {
            displayProducts(data.data.products);
            displayPagination(data.data.pagination);
        } else {
            showMessage('Không thể tải sản phẩm: ' + data.message, 'error');
            loadStaticProducts();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to static products
        loadStaticProducts();
    } finally {
        isLoading = false;
        hideLoading();
    }
}

function showLoading() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
}

function hideLoading() {
    // Loading will be replaced by products
}

function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <p>Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn.</p>
                <button class="btn-primary" onclick="clearFilters()">Xóa bộ lọc</button>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = products.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
    return `
        <div class="product-card">
            <img src="${product.image_url || '../../assets/images/placeholder-cake.jpg'}" 
                 alt="${product.name}" 
                 class="product-image"
                 onerror="this.src='../../assets/images/placeholder-cake.jpg'">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description || ''}</p>
                <div class="product-category">${product.category_name || ''}</div>
                <div class="product-price">${formatPrice(product.price)}</div>
                <button class="btn-add-cart" data-product-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
                </button>
                <a href="../product-detail/product-detail.html?id=${product.id}" class="btn-view-detail">
                    <i class="fas fa-eye"></i> Xem chi tiết
                </a>
            </div>
        </div>
    `;
}

function displayPagination(pagination) {
    const paginationContainer = document.getElementById('pagination');
    
    if (pagination.total_pages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<div class="pagination-controls">';
    
    // Previous button
    if (pagination.current_page > 1) {
        paginationHTML += `<button onclick="goToPage(${pagination.current_page - 1})" class="pagination-btn">
            <i class="fas fa-chevron-left"></i> Trước
        </button>`;
    }
    
    // Page numbers
    const startPage = Math.max(1, pagination.current_page - 2);
    const endPage = Math.min(pagination.total_pages, pagination.current_page + 2);
    
    // First page
    if (startPage > 1) {
        paginationHTML += `<button onclick="goToPage(1)" class="pagination-btn">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === pagination.current_page ? 'active' : '';
        paginationHTML += `<button onclick="goToPage(${i})" class="pagination-btn ${activeClass}">${i}</button>`;
    }
    
    // Last page
    if (endPage < pagination.total_pages) {
        if (endPage < pagination.total_pages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHTML += `<button onclick="goToPage(${pagination.total_pages})" class="pagination-btn">${pagination.total_pages}</button>`;
    }
    
    // Next button
    if (pagination.current_page < pagination.total_pages) {
        paginationHTML += `<button onclick="goToPage(${pagination.current_page + 1})" class="pagination-btn">
            Sau <i class="fas fa-chevron-right"></i>
        </button>`;
    }
    
    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
}

function goToPage(page) {
    currentPage = page;
    loadProducts();
    
    // Scroll to top of products section
    document.querySelector('.products-section').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function loadStaticProducts() {
    const staticProducts = [
        {
            id: 1,
            name: "Bánh Kem Chocolate",
            description: "Bánh kem chocolate thơm ngon với lớp kem mịn màng, được làm từ chocolate Bỉ cao cấp",
            price: 250000,
            category_name: "Bánh sinh nhật",
            image_url: "../../assets/images/cake1.jpg"
        },
        {
            id: 2,
            name: "Bánh Kem Vanilla",
            description: "Bánh kem vanilla truyền thống với hương vị tinh tế, phù hợp cho mọi lứa tuổi",
            price: 200000,
            category_name: "Bánh sinh nhật",
            image_url: "../../assets/images/cake2.jpg"
        },
        {
            id: 3,
            name: "Bánh Kem Dâu Tây",
            description: "Bánh kem dâu tây tươi ngon, ngọt ngào với lớp kem dâu tây tự nhiên",
            price: 280000,
            category_name: "Bánh sinh nhật",
            image_url: "../../assets/images/cake3.jpg"
        },
        {
            id: 4,
            name: "Bánh Cưới 3 Tầng",
            description: "Bánh cưới 3 tầng sang trọng cho ngày cưới, được trang trí tinh tế",
            price: 1500000,
            category_name: "Bánh cưới",
            image_url: "../../assets/images/wedding-cake.jpg"
        },
        {
            id: 5,
            name: "Tiramisu",
            description: "Bánh tiramisu Ý thơm ngon, đậm đà với hương vị cà phê và mascarpone",
            price: 180000,
            category_name: "Bánh tráng miệng",
            image_url: "../../assets/images/tiramisu.jpg"
        },
        {
            id: 6,
            name: "Cheesecake Dâu",
            description: "Cheesecake dâu tây mát lạnh, hoàn hảo cho những ngày hè nóng bức",
            price: 220000,
            category_name: "Bánh tráng miệng",
            image_url: "../../assets/images/cheesecake.jpg"
        },
        {
            id: 7,
            name: "Bánh Kem Matcha",
            description: "Bánh kem matcha Nhật Bản với hương vị trà xanh đặc trưng",
            price: 320000,
            category_name: "Bánh theo mùa",
            image_url: "../../assets/images/placeholder-cake.jpg"
        },
        {
            id: 8,
            name: "Bánh Kem Red Velvet",
            description: "Bánh kem red velvet với màu đỏ đặc trưng và kem cheese thơm ngon",
            price: 300000,
            category_name: "Bánh sinh nhật",
            image_url: "../../assets/images/placeholder-cake.jpg"
        }
    ];
    
    // Apply filters to static products
    let filteredProducts = [...staticProducts];
    
    if (currentFilters.category) {
        const categoryMap = {
            '1': 'Bánh sinh nhật',
            '2': 'Bánh cưới',
            '3': 'Bánh tráng miệng',
            '4': 'Bánh theo mùa'
        };
        filteredProducts = filteredProducts.filter(p => p.category_name === categoryMap[currentFilters.category]);
    }
    
    if (currentFilters.price) {
        const [min, max] = currentFilters.price.split('-').map(Number);
        filteredProducts = filteredProducts.filter(p => p.price >= min && p.price <= max);
    }
    
    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm) ||
            p.category_name.toLowerCase().includes(searchTerm)
        );
    }
    
    if (currentFilters.sort) {
        switch (currentFilters.sort) {
            case 'price_low':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price_high':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
            default:
                // Keep original order
                break;
        }
    }
    
    // Pagination for static products
    const itemsPerPage = 12;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    displayProducts(paginatedProducts);
    
    // Create pagination for static products
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const pagination = {
        current_page: currentPage,
        total_pages: totalPages
    };
    displayPagination(pagination);
}

function addToCart(productId) {
    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already exists in cart
    const existingItem = cart.find(item => item.productId == productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Find product details
        const product = findProductById(productId);
        if (product) {
            cart.push({
                productId: productId,
                name: product.name,
                price: product.price,
                image: product.image_url,
                quantity: 1
            });
        }
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showMessage('Đã thêm sản phẩm vào giỏ hàng!', 'success');
    
    // Animate cart icon
    animateCartIcon();
}

function findProductById(productId) {
    // This would normally come from the API
    // For now, we'll use a simple lookup
    const staticProducts = [
        { id: 1, name: "Bánh Kem Chocolate", price: 250000, image_url: "../../assets/images/cake1.jpg" },
        { id: 2, name: "Bánh Kem Vanilla", price: 200000, image_url: "../../assets/images/cake2.jpg" },
        { id: 3, name: "Bánh Kem Dâu Tây", price: 280000, image_url: "../../assets/images/cake3.jpg" },
        { id: 4, name: "Bánh Cưới 3 Tầng", price: 1500000, image_url: "../../assets/images/wedding-cake.jpg" },
        { id: 5, name: "Tiramisu", price: 180000, image_url: "../../assets/images/tiramisu.jpg" },
        { id: 6, name: "Cheesecake Dâu", price: 220000, image_url: "../../assets/images/cheesecake.jpg" }
    ];
    
    return staticProducts.find(p => p.id == productId);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function animateCartIcon() {
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.classList.add('animate-bounce');
        setTimeout(() => {
            cartIcon.classList.remove('animate-bounce');
        }, 1000);
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    // Insert at top of products section
    const productsSection = document.querySelector('.products-section');
    productsSection.insertBefore(messageDiv, productsSection.firstChild);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// Debounce function for search
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

