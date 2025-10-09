/**
 * Product Detail Page JavaScript
 * Handles product detail functionality for LA CUISINE NGỌT
 */

let currentProduct = null;

// Load product on page load
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadProductDetail(productId);
        loadRelatedProducts(productId);
    } else {
        showMessage('Không tìm thấy sản phẩm', 'error');
        loadStaticProductDetail();
    }
    
    updateCartCount();
    setupEventListeners();
});

function setupEventListeners() {
    // Add to cart functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-add-cart') && e.target.dataset.productId) {
            e.preventDefault();
            const productId = parseInt(e.target.dataset.productId);
            addToCartFromDetail(productId);
        }
    });
    
    // Wishlist functionality
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-secondary') && e.target.closest('.btn-secondary').onclick) {
            const productId = currentProduct?.id;
            if (productId) {
                addToWishlist(productId);
            }
        }
    });
}

async function loadProductDetail(productId) {
    try {
        const response = await fetch(`../../api/products.php/${productId}`);
        const data = await response.json();
        
        if (data.success) {
            currentProduct = data.data;
            displayProductDetail(data.data);
        } else {
            showMessage('Không thể tải thông tin sản phẩm: ' + data.message, 'error');
            loadStaticProductDetail();
        }
    } catch (error) {
        console.error('Error loading product detail:', error);
        loadStaticProductDetail();
    }
}

function displayProductDetail(product) {
    const content = document.getElementById('productDetailContent');
    const breadcrumb = document.getElementById('breadcrumbProductName');
    
    breadcrumb.textContent = product.name;
    
    content.innerHTML = `
        <div class="product-detail-image-container">
            <img src="${product.image_url || '../../assets/images/placeholder-cake.jpg'}" 
                 alt="${product.name}" 
                 class="product-detail-image"
                 onerror="this.src='../../assets/images/placeholder-cake.jpg'">
        </div>
        <div class="product-detail-info">
            <h1 class="product-detail-title">${product.name}</h1>
            <div class="product-detail-category">${product.category_name || ''}</div>
            <div class="product-detail-price">${formatPrice(product.price)}</div>
            <div class="product-detail-description">
                <h3>Mô tả sản phẩm</h3>
                <p>${product.description || 'Sản phẩm chất lượng cao, được làm thủ công với tình yêu và sự tỉ mỉ. Mỗi chiếc bánh đều được chế biến từ những nguyên liệu tươi ngon nhất, đảm bảo hương vị tuyệt vời cho khách hàng.'}</p>
            </div>
            ${product.ingredients ? `
            <div class="product-detail-ingredients">
                <h3>Nguyên liệu</h3>
                <ul class="ingredients-list">
                    ${product.ingredients.split(',').map(ingredient => 
                        `<li>${ingredient.trim()}</li>`
                    ).join('')}
                </ul>
            </div>
            ` : ''}
            <div class="product-detail-actions">
                <div class="quantity-selector">
                    <label for="quantity">Số lượng:</label>
                    <div class="quantity-controls">
                        <button type="button" class="quantity-btn" onclick="changeQuantity(-1)">-</button>
                        <input type="number" id="quantity" value="1" min="1" max="10">
                        <button type="button" class="quantity-btn" onclick="changeQuantity(1)">+</button>
                    </div>
                </div>
                <button class="btn-primary btn-add-cart" data-product-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i>
                    Thêm vào giỏ hàng
                </button>
                <button class="btn-secondary" onclick="addToWishlist(${product.id})">
                    <i class="far fa-heart"></i>
                    Yêu thích
                </button>
            </div>
            <div class="product-detail-features">
                <div class="feature-item">
                    <i class="fas fa-truck"></i>
                    <span>Giao hàng miễn phí</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-shield-alt"></i>
                    <span>Đảm bảo chất lượng</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-undo"></i>
                    <span>Đổi trả trong 7 ngày</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-clock"></i>
                    <span>Giao hàng trong 24h</span>
                </div>
            </div>
        </div>
    `;
}

function loadStaticProductDetail() {
    const staticProduct = {
        id: 1,
        name: "Bánh Kem Chocolate",
        description: "Bánh kem chocolate thơm ngon với lớp kem mịn màng, được làm từ những nguyên liệu cao cấp nhất. Chiếc bánh này sẽ mang đến cho bạn trải nghiệm hương vị tuyệt vời với sự kết hợp hoàn hảo giữa chocolate đắng và kem ngọt ngào.",
        price: 250000,
        category_name: "Bánh sinh nhật",
        image_url: "../../assets/images/cake1.jpg",
        ingredients: "Bột mì, trứng, sữa, chocolate, kem tươi, đường, bơ, vani, muối"
    };
    
    currentProduct = staticProduct;
    displayProductDetail(staticProduct);
}

async function loadRelatedProducts(productId) {
    try {
        const response = await fetch(`../../api/products.php?category=${currentProduct?.category_id || 1}&limit=4`);
        const data = await response.json();
        
        if (data.success) {
            displayRelatedProducts(data.data.products.filter(p => p.id != productId));
        } else {
            loadStaticRelatedProducts();
        }
    } catch (error) {
        console.error('Error loading related products:', error);
        loadStaticRelatedProducts();
    }
}

function displayRelatedProducts(products) {
    const container = document.getElementById('relatedProducts');
    
    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Không có sản phẩm liên quan.</p>';
        return;
    }
    
    container.innerHTML = products.map(product => createProductCard(product)).join('');
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
                <div class="product-price">${formatPrice(product.price)}</div>
                <a href="product-detail.html?id=${product.id}" class="btn-view-detail">
                    <i class="fas fa-eye"></i> Xem chi tiết
                </a>
            </div>
        </div>
    `;
}

function loadStaticRelatedProducts() {
    const staticProducts = [
        {
            id: 2,
            name: "Bánh Kem Vanilla",
            description: "Bánh kem vanilla truyền thống với hương vị tinh tế",
            price: 200000,
            image_url: "../../assets/images/cake2.jpg"
        },
        {
            id: 3,
            name: "Bánh Kem Dâu Tây",
            description: "Bánh kem dâu tây tươi ngon, ngọt ngào",
            price: 280000,
            image_url: "../../assets/images/cake3.jpg"
        },
        {
            id: 4,
            name: "Bánh Cưới 3 Tầng",
            description: "Bánh cưới sang trọng cho ngày đặc biệt",
            price: 1500000,
            image_url: "../../assets/images/wedding-cake.jpg"
        },
        {
            id: 5,
            name: "Tiramisu",
            description: "Bánh tiramisu Ý thơm ngon, đậm đà",
            price: 180000,
            image_url: "../../assets/images/tiramisu.jpg"
        }
    ];
    
    displayRelatedProducts(staticProducts);
}

function changeQuantity(delta) {
    const quantityInput = document.getElementById('quantity');
    const currentValue = parseInt(quantityInput.value);
    const newValue = Math.max(1, Math.min(10, currentValue + delta));
    quantityInput.value = newValue;
    
    // Add visual feedback
    quantityInput.style.transform = 'scale(1.1)';
    setTimeout(() => {
        quantityInput.style.transform = 'scale(1)';
    }, 150);
}

function addToWishlist(productId) {
    // Get current wishlist from localStorage
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    // Check if product already exists in wishlist
    const existingItem = wishlist.find(item => item.id === productId);
    
    if (existingItem) {
        showMessage('Sản phẩm đã có trong danh sách yêu thích!', 'info');
        return;
    }
    
    // Add product to wishlist
    if (currentProduct) {
        wishlist.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            image: currentProduct.image_url
        });
        
        // Save wishlist to localStorage
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        
        showMessage('Đã thêm vào danh sách yêu thích!', 'success');
        
        // Update button state
        updateWishlistButton(true);
    }
}

function updateWishlistButton(isInWishlist) {
    const wishlistBtn = document.querySelector('.btn-secondary');
    if (wishlistBtn) {
        if (isInWishlist) {
            wishlistBtn.innerHTML = '<i class="fas fa-heart"></i> Đã yêu thích';
            wishlistBtn.style.background = '#e74c3c';
            wishlistBtn.style.borderColor = '#e74c3c';
        } else {
            wishlistBtn.innerHTML = '<i class="far fa-heart"></i> Yêu thích';
            wishlistBtn.style.background = 'transparent';
            wishlistBtn.style.borderColor = '#2d5016';
        }
    }
}

function addToCartFromDetail(productId) {
    const quantity = parseInt(document.getElementById('quantity').value);
    
    // Find product details
    const product = currentProduct;
    if (!product) return;
    
    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already exists in cart
    const existingItem = cart.find(item => item.productId == productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image_url,
            quantity: quantity
        });
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showMessage(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, 'success');
    
    // Animate cart icon
    animateCartIcon();
    
    // Animate add to cart button
    const addToCartBtn = document.querySelector('.btn-add-cart');
    if (addToCartBtn) {
        addToCartBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            addToCartBtn.style.transform = 'scale(1)';
        }, 150);
    }
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
    
    // Insert at top of product detail section
    const productDetailSection = document.querySelector('.product-detail');
    productDetailSection.insertBefore(messageDiv, productDetailSection.firstChild);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// Check if product is in wishlist on page load
function checkWishlistStatus() {
    if (currentProduct) {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const isInWishlist = wishlist.some(item => item.id === currentProduct.id);
        updateWishlistButton(isInWishlist);
    }
}

// Call checkWishlistStatus after product is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(checkWishlistStatus, 1000);
});

