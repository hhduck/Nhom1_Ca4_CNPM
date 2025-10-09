/**
 * Home Page JavaScript
 * Handles home page functionality for LA CUISINE NGỌT
 */

// Load home page on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupSearchFunctionality();
    updateCartCount();
    setupNewsletterForm();
    setupScrollAnimations();
    setupProductInteractions();
});

function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    const products = [
        {
            id: 1,
            name: "Bánh Kem Chocolate",
            description: "Bánh kem chocolate thơm ngon với lớp kem mịn màng",
            price: 250000,
            image: "../../assets/images/cake1.jpg"
        },
        {
            id: 2,
            name: "Bánh Kem Vanilla",
            description: "Bánh kem vanilla truyền thống với hương vị tinh tế",
            price: 200000,
            image: "../../assets/images/cake2.jpg"
        },
        {
            id: 3,
            name: "Bánh Kem Dâu Tây",
            description: "Bánh kem dâu tây tươi ngon, ngọt ngào",
            price: 280000,
            image: "../../assets/images/cake3.jpg"
        },
        {
            id: 4,
            name: "Bánh Cưới 3 Tầng",
            description: "Bánh cưới 3 tầng sang trọng cho ngày cưới",
            price: 1500000,
            image: "../../assets/images/wedding-cake.jpg"
        },
        {
            id: 5,
            name: "Tiramisu",
            description: "Bánh tiramisu Ý thơm ngon, đậm đà",
            price: 180000,
            image: "../../assets/images/tiramisu.jpg"
        },
        {
            id: 6,
            name: "Cheesecake Dâu",
            description: "Cheesecake dâu tây mát lạnh",
            price: 220000,
            image: "../../assets/images/cheesecake.jpg"
        }
    ];

    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='../../assets/images/placeholder-cake.jpg'">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${formatPrice(product.price)}</div>
                <button class="btn-add-cart" data-product-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i>
                    Thêm vào giỏ
                </button>
                <a href="../product-detail/product-detail.html?id=${product.id}" class="btn-view-detail">
                    <i class="fas fa-eye"></i>
                    Xem chi tiết
                </a>
            </div>
        </div>
    `).join('');
}

function setupProductInteractions() {
    // Add to cart functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-add-cart') || e.target.closest('.btn-add-cart')) {
            const button = e.target.classList.contains('btn-add-cart') ? e.target : e.target.closest('.btn-add-cart');
            const productId = button.getAttribute('data-product-id');
            addToCart(productId);
        }
    });
}

function addToCart(productId) {
    // Get product data
    const productCard = document.querySelector(`[data-product-id="${productId}"]`);
    if (!productCard) return;
    
    const productName = productCard.querySelector('.product-name').textContent;
    const productPrice = productCard.querySelector('.product-price').textContent;
    const productImage = productCard.querySelector('.product-image').src;
    
    // Get current cart
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already exists in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showAddToCartMessage(productName);
    
    // Add animation to button
    const button = document.querySelector(`[data-product-id="${productId}"]`);
    if (button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }
}

function showAddToCartMessage(productName) {
    // Remove existing message
    const existingMessage = document.querySelector('.add-to-cart-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create success message
    const message = document.createElement('div');
    message.className = 'add-to-cart-message';
    message.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Đã thêm "${productName}" vào giỏ hàng!</span>
    `;
    
    // Add to page
    document.body.appendChild(message);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 3000);
}

function setupSearchFunctionality() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
}

function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (query) {
        // Redirect to products page with search query
        window.location.href = `../products/products.html?search=${encodeURIComponent(query)}`;
    }
}

function setupNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const name = this.querySelector('input[type="text"]').value.trim();
        const email = this.querySelector('input[type="email"]').value.trim();
        
        if (!name || !email) {
            showMessage('Vui lòng điền đầy đủ thông tin!', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showMessage('Email không hợp lệ!', 'error');
            return;
        }
        
        // Simulate newsletter subscription
        showMessage('Cảm ơn bạn đã đăng ký nhận tin!', 'success');
        this.reset();
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
    
    // Insert at top of page
    document.body.insertBefore(messageDiv, document.body.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

function setupScrollAnimations() {
    // Animate elements on scroll
    const animatedElements = document.querySelectorAll('.offer-card, .product-card, .blog-card, .menu-category, .review-card, .best-seller-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(element);
    });
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

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// Parallax effect for hero section
function setupParallaxEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    });
}

// Initialize parallax effect
document.addEventListener('DOMContentLoaded', function() {
    setupParallaxEffect();
});

// Counter animation for statistics
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        element.textContent = Math.floor(current);
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        }
    }, 20);
}

// Initialize counter animation
document.addEventListener('DOMContentLoaded', function() {
    animateCounters();
});

// Add CSS for messages and animations
const style = document.createElement('style');
style.textContent = `
    .add-to-cart-message {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease-out;
    }
    
    .message {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease-out;
    }
    
    .message.success {
        background: #28a745;
        color: white;
    }
    
    .message.error {
        background: #dc3545;
        color: white;
    }
    
    .message.info {
        background: #17a2b8;
        color: white;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .btn-add-cart,
    .btn-view-detail {
        transition: all 0.3s ease;
    }
    
    .btn-add-cart i,
    .btn-view-detail i {
        margin-right: 5px;
    }
`;
document.head.appendChild(style);

