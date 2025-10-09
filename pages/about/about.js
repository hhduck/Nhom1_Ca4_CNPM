/**
 * About Page JavaScript
 * Handles about page functionality for LA CUISINE NGỌT
 */

// Load about page on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    animateNumbers();
    setupScrollAnimations();
    updateCartCount();
    setupSearchFunctionality();
});

function animateNumbers() {
    const numbers = document.querySelectorAll('.achievement-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalNumber = target.textContent.replace(/[^\d]/g, '');
                const suffix = target.textContent.replace(/[\d]/g, '');
                animateNumber(target, 0, parseInt(finalNumber), 2000, suffix);
                observer.unobserve(target);
            }
        });
    }, {
        threshold: 0.5
    });
    
    numbers.forEach(number => {
        observer.observe(number);
    });
}

function animateNumber(element, start, end, duration, suffix = '') {
    const startTime = performance.now();
    const isDecimal = element.textContent.includes('.');
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        
        const current = start + (end - start) * easeOutCubic;
        const displayNumber = isDecimal ? current.toFixed(1) : Math.floor(current);
        
        element.textContent = formatNumber(displayNumber) + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.value-item, .team-member, .achievement-item, .certification-item, .mission, .vision');
    
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

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Parallax effect for hero section
function setupParallaxEffect() {
    const hero = document.querySelector('.about-hero');
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

// Team member hover effects
function setupTeamMemberEffects() {
    const teamMembers = document.querySelectorAll('.team-member');
    
    teamMembers.forEach(member => {
        const photo = member.querySelector('.member-photo');
        const name = member.querySelector('h3');
        const role = member.querySelector('.member-role');
        
        member.addEventListener('mouseenter', function() {
            if (photo) photo.style.transform = 'scale(1.05)';
            if (name) name.style.color = '#2d5016';
            if (role) role.style.color = '#4a7c59';
        });
        
        member.addEventListener('mouseleave', function() {
            if (photo) photo.style.transform = 'scale(1)';
            if (name) name.style.color = '#333';
            if (role) role.style.color = '#2d5016';
        });
    });
}

// Initialize team member effects
document.addEventListener('DOMContentLoaded', function() {
    setupTeamMemberEffects();
});

// Value items hover effects
function setupValueItemEffects() {
    const valueItems = document.querySelectorAll('.value-item');
    
    valueItems.forEach(item => {
        const icon = item.querySelector('.value-icon');
        const title = item.querySelector('h3');
        
        item.addEventListener('mouseenter', function() {
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
                icon.style.boxShadow = '0 15px 30px rgba(45, 80, 22, 0.4)';
            }
            if (title) title.style.color = '#2d5016';
        });
        
        item.addEventListener('mouseleave', function() {
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
                icon.style.boxShadow = '0 8px 20px rgba(45, 80, 22, 0.3)';
            }
            if (title) title.style.color = '#333';
        });
    });
}

// Initialize value item effects
document.addEventListener('DOMContentLoaded', function() {
    setupValueItemEffects();
});

// Smooth scroll for internal links
function setupSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize smooth scroll
document.addEventListener('DOMContentLoaded', function() {
    setupSmoothScroll();
});

// Loading animation for images
function setupImageLoading() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
            this.style.transform = 'scale(1)';
        });
        
        // Set initial state
        img.style.opacity = '0';
        img.style.transform = 'scale(0.9)';
        img.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
    });
}

// Initialize image loading
document.addEventListener('DOMContentLoaded', function() {
    setupImageLoading();
});

// CTA button click tracking
function setupCTATracking() {
    const ctaButtons = document.querySelectorAll('.cta-buttons a');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            console.log(`CTA clicked: ${buttonText}`);
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

// Initialize CTA tracking
document.addEventListener('DOMContentLoaded', function() {
    setupCTATracking();
});

// Intersection Observer for fade-in animations
function setupFadeInAnimations() {
    const fadeElements = document.querySelectorAll('.story-text, .story-image, .values-section, .team-section, .achievements-section, .certifications-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    fadeElements.forEach(element => {
        element.classList.add('fade-in');
        observer.observe(element);
    });
}

// Initialize fade-in animations
document.addEventListener('DOMContentLoaded', function() {
    setupFadeInAnimations();
});

// Add CSS for fade-in animations
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
    }
    
    .fade-in-visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    .value-icon,
    .member-photo,
    .cert-icon {
        transition: all 0.3s ease;
    }
    
    .team-member h3,
    .team-member .member-role {
        transition: color 0.3s ease;
    }
    
    .value-item h3 {
        transition: color 0.3s ease;
    }
    
    .cta-buttons a {
        transition: transform 0.2s ease;
    }
`;
document.head.appendChild(style);

