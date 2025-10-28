/**
 * Image Handler for LA CUISINE NGỌT
 * Handles image loading, fallbacks, and lazy loading
 */

class ImageHandler {

    init() {
        this.setupImageFallbacks();
        this.setupLazyLoading();
        this.preloadCriticalImages();
    }

    /**
     * Setup fallback images for all img elements
     */
    setupImageFallbacks() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Add error handler if not already present
            if (!img.hasAttribute('data-fallback-set')) {
                img.setAttribute('data-fallback-set', 'true');
                
                img.addEventListener('error', (e) => {
                    const target = e.target;
                    const src = target.src;
                    
                    // Determine fallback based on context
                    let fallback = this.placeholderCake;
                    
                    if (src.includes('team') || src.includes('person') || src.includes('member')) {
                        fallback = this.placeholderPerson;
                    }
                    
                    // Only set fallback if not already a placeholder
                    if (!src.includes('placeholder')) {
                        target.src = fallback;
                        target.alt = 'Hình ảnh placeholder';
                    }
                });
            }
        });
    }

    /**
     * Setup lazy loading for images
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            });

            // Observe all images with data-src attribute
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    /**
     * Load image with fallback
     */
    loadImage(img) {
        const src = img.dataset.src;
        if (src) {
            img.src = src;
            img.removeAttribute('data-src');
        }
    }

    /**
     * Preload critical images
     */
    preloadCriticalImages() {
        const criticalImages = [
        ];

        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    /**
     * Get image with fallback
     */
    getImageWithFallback(src, type = 'cake') {
        return new Promise((resolve) => {
            const img = new Image();
            
            img.onload = () => resolve(src);
            img.onerror = () => {
                const fallback = type === 'person' ? this.placeholderPerson : this.placeholderCake;
                resolve(fallback);
            };
            
            img.src = src;
        });
    }

    /**
     * Create responsive image element
     */
    createResponsiveImage(src, alt, className = '') {
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        img.className = className;
        img.loading = 'lazy';
        
        // Add error handler
        img.addEventListener('error', () => {
            const fallback = alt.toLowerCase().includes('person') ? 
                this.placeholderPerson : this.placeholderCake;
            img.src = fallback;
        });
        
        return img;
    }

    /**
     * Update product images in grid
     */
    updateProductImages(products) {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach((card, index) => {
            const img = card.querySelector('.product-image');
            if (img && products[index]) {
                const product = products[index];
                img.src = product.image_url || this.placeholderCake;
                img.alt = product.name || 'Sản phẩm';
            }
        });
    }

    /**
     * Update cart item images
     */
    updateCartImages(cartItems) {
        const cartImages = document.querySelectorAll('.cart-item-image');
        
        cartImages.forEach((img, index) => {
            if (cartItems[index]) {
                const item = cartItems[index];
                img.src = item.image || this.placeholderCake;
                img.alt = item.name || 'Sản phẩm';
            }
        });
    }

    /**
     * Optimize image loading
     */
    optimizeImageLoading() {
        // Add loading="lazy" to all images
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            img.loading = 'lazy';
        });

        // Add decoding="async" for better performance
        images.forEach(img => {
            img.decoding = 'async';
        });
    }

    /**
     * Handle image loading errors gracefully
     */
    handleImageError(img) {
        const src = img.src;
        let fallback = this.placeholderCake;
        
        // Determine fallback based on context
        if (src.includes('team') || src.includes('person') || src.includes('member')) {
            fallback = this.placeholderPerson;
        }
        
        // Only set fallback if not already a placeholder
        if (!src.includes('placeholder')) {
            img.src = fallback;
            img.alt = 'Hình ảnh placeholder';
            
            // Add error class for styling
            img.classList.add('image-error');
        }
    }

    /**
     * Preload images for better performance
     */
    preloadImages(urls) {
        urls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = url;
            document.head.appendChild(link);
        });
    }

    /**
     * Get image dimensions
     */
    getImageDimensions(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight
                });
            };
            img.onerror = () => resolve({ width: 0, height: 0 });
            img.src = src;
        });
    }

    /**
     * Create image with aspect ratio
     */
    createAspectRatioImage(src, alt, aspectRatio = '4:3', className = '') {
        const container = document.createElement('div');
        container.className = `aspect-ratio-container ${className}`;
        container.style.aspectRatio = aspectRatio;
        
        const img = this.createResponsiveImage(src, alt);
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        
        container.appendChild(img);
        return container;
    }
}

// Initialize image handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.imageHandler = new ImageHandler();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageHandler;
}

