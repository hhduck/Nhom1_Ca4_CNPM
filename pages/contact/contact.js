/**
 * Contact Page JavaScript
 * Handles contact form functionality for LA CUISINE NGỌT
 */

// Load contact page on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    setupContactForm();
    setupFAQ();
    updateCartCount();
    setupSearchFunctionality();
});

function setupContactForm() {
    const form = document.getElementById('contactForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleContact(e);
    });
    
    // Real-time validation
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
    
    // Phone number formatting
    document.getElementById('phone').addEventListener('input', function() {
        const phone = this.value.replace(/\D/g, '');
        this.value = phone;
    });
    
    // Auto-save form data
    setupAutoSave();
}

function setupFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            const answer = item.querySelector('.faq-answer');
            const icon = item.querySelector('.faq-question i');
            
            // Close other open items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').style.display = 'none';
                    otherItem.querySelector('.faq-question i').style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
            
            if (item.classList.contains('active')) {
                answer.style.display = 'block';
                icon.style.transform = 'rotate(180deg)';
            } else {
                answer.style.display = 'none';
                icon.style.transform = 'rotate(0deg)';
            }
        });
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

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    clearFieldError(field);
    
    switch(fieldName) {
        case 'fullName':
            if (!value) {
                showFieldError(fieldName, 'Vui lòng nhập họ và tên');
            } else if (value.length < 2) {
                showFieldError(fieldName, 'Họ và tên phải có ít nhất 2 ký tự');
            } else {
                showFieldSuccess(fieldName);
            }
            break;
            
        case 'email':
            if (!value) {
                showFieldError(fieldName, 'Vui lòng nhập email');
            } else if (!isValidEmail(value)) {
                showFieldError(fieldName, 'Email không hợp lệ');
            } else {
                showFieldSuccess(fieldName);
            }
            break;
            
        case 'phone':
            if (value && !isValidPhone(value)) {
                showFieldError(fieldName, 'Số điện thoại không hợp lệ');
            } else if (value) {
                showFieldSuccess(fieldName);
            }
            break;
            
        case 'subject':
            if (!value) {
                showFieldError(fieldName, 'Vui lòng chọn chủ đề');
            } else {
                showFieldSuccess(fieldName);
            }
            break;
            
        case 'message':
            if (!value) {
                showFieldError(fieldName, 'Vui lòng nhập nội dung');
            } else if (value.length < 10) {
                showFieldError(fieldName, 'Nội dung phải có ít nhất 10 ký tự');
            } else {
                showFieldSuccess(fieldName);
            }
            break;
    }
}

function showFieldError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    const formGroup = field.closest('.form-group');
    
    formGroup.classList.add('error');
    formGroup.classList.remove('success');
    
    // Remove existing error message
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    formGroup.appendChild(errorDiv);
}

function showFieldSuccess(fieldName) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    const formGroup = field.closest('.form-group');
    
    formGroup.classList.add('success');
    formGroup.classList.remove('error');
    
    // Remove error message if exists
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    formGroup.classList.remove('error', 'success');
    
    const errorMessage = formGroup.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

async function handleContact(e) {
    const formData = new FormData(e.target);
    const contactData = {
        fullName: formData.get('fullName').trim(),
        email: formData.get('email').trim(),
        phone: formData.get('phone').trim(),
        company: formData.get('company').trim(),
        subject: formData.get('subject'),
        message: formData.get('message').trim(),
        agreeTerms: formData.get('agreeTerms')
    };
    
    // Validate required fields
    if (!validateContactForm(contactData)) {
        return;
    }
    
    try {
        // Show loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Save contact message to localStorage (simulate)
        const contactMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        const messageData = {
            id: 'MSG' + Date.now(),
            ...contactData,
            status: 'new',
            created_at: new Date().toISOString()
        };
        contactMessages.push(messageData);
        localStorage.setItem('contactMessages', JSON.stringify(contactMessages));
        
        // Show success message
        showMessage('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.', 'success');
        
        // Reset form
        e.target.reset();
        
        // Clear all field states
        clearAllFieldStates();
        
    } catch (error) {
        console.error('Contact form error:', error);
        showMessage('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại!', 'error');
    } finally {
        // Reset button
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
}

function validateContactForm(data) {
    let isValid = true;
    
    // Clear all errors
    clearAllFieldStates();
    
    // Validate full name
    if (!data.fullName) {
        showFieldError('fullName', 'Vui lòng nhập họ và tên');
        isValid = false;
    } else if (data.fullName.length < 2) {
        showFieldError('fullName', 'Họ và tên phải có ít nhất 2 ký tự');
        isValid = false;
    }
    
    // Validate email
    if (!data.email) {
        showFieldError('email', 'Vui lòng nhập email');
        isValid = false;
    } else if (!isValidEmail(data.email)) {
        showFieldError('email', 'Email không hợp lệ');
        isValid = false;
    }
    
    // Validate phone (optional)
    if (data.phone && !isValidPhone(data.phone)) {
        showFieldError('phone', 'Số điện thoại không hợp lệ');
        isValid = false;
    }
    
    // Validate subject
    if (!data.subject) {
        showFieldError('subject', 'Vui lòng chọn chủ đề');
        isValid = false;
    }
    
    // Validate message
    if (!data.message) {
        showFieldError('message', 'Vui lòng nhập nội dung');
        isValid = false;
    } else if (data.message.length < 10) {
        showFieldError('message', 'Nội dung phải có ít nhất 10 ký tự');
        isValid = false;
    }
    
    // Validate terms agreement
    if (!data.agreeTerms) {
        showMessage('Vui lòng đồng ý với chính sách bảo mật!', 'error');
        isValid = false;
    }
    
    return isValid;
}

function clearAllFieldStates() {
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('error', 'success');
        const errorMessage = group.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone);
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
    
    // Insert at top of contact section
    const contactSection = document.querySelector('.contact-section');
    contactSection.insertBefore(messageDiv, contactSection.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

function showPrivacyPolicy() {
    const modal = document.createElement('div');
    modal.className = 'privacy-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Chính sách bảo mật</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <h4>1. Thu thập thông tin</h4>
                <p>Chúng tôi chỉ thu thập thông tin cần thiết để cung cấp dịch vụ và liên hệ với bạn.</p>
                
                <h4>2. Sử dụng thông tin</h4>
                <p>Thông tin của bạn được sử dụng để:</p>
                <ul>
                    <li>Xử lý yêu cầu tư vấn</li>
                    <li>Gửi thông tin về sản phẩm và dịch vụ</li>
                    <li>Cải thiện chất lượng dịch vụ</li>
                </ul>
                
                <h4>3. Bảo mật thông tin</h4>
                <p>Chúng tôi cam kết bảo mật thông tin cá nhân của bạn và không chia sẻ với bên thứ ba.</p>
                
                <h4>4. Quyền của bạn</h4>
                <p>Bạn có quyền yêu cầu xem, sửa đổi hoặc xóa thông tin cá nhân của mình.</p>
            </div>
            <div class="modal-footer">
                <button class="btn-primary" onclick="closePrivacyModal()">Đóng</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal handlers
    modal.querySelector('.close-modal').addEventListener('click', closePrivacyModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closePrivacyModal();
        }
    });
}

function closePrivacyModal() {
    const modal = document.querySelector('.privacy-modal');
    if (modal) {
        modal.remove();
    }
}

function setupAutoSave() {
    const form = document.getElementById('contactForm');
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            saveFormData();
        });
    });
    
    // Load saved data on page load
    loadSavedFormData();
}

function saveFormData() {
    const form = document.getElementById('contactForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    localStorage.setItem('contactFormData', JSON.stringify(data));
}

function loadSavedFormData() {
    const savedData = localStorage.getItem('contactFormData');
    if (savedData) {
        const data = JSON.parse(savedData);
        Object.keys(data).forEach(key => {
            const field = document.querySelector(`[name="${key}"]`);
            if (field && field.type !== 'checkbox') {
                field.value = data[key];
            } else if (field && field.type === 'checkbox') {
                field.checked = data[key] === 'on';
            }
        });
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

// Add CSS for privacy modal
const style = document.createElement('style');
style.textContent = `
    .privacy-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease-out;
    }
    
    .modal-content {
        background: white;
        border-radius: 15px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 30px;
        border-bottom: 1px solid #eee;
    }
    
    .modal-header h3 {
        margin: 0;
        color: #2d5016;
        font-size: 1.5rem;
    }
    
    .close-modal {
        background: none;
        border: none;
        font-size: 2rem;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal-body {
        padding: 30px;
    }
    
    .modal-body h4 {
        color: #2d5016;
        margin: 20px 0 10px 0;
        font-size: 1.2rem;
    }
    
    .modal-body p {
        color: #666;
        line-height: 1.6;
        margin-bottom: 15px;
    }
    
    .modal-body ul {
        color: #666;
        padding-left: 20px;
    }
    
    .modal-footer {
        padding: 20px 30px;
        border-top: 1px solid #eee;
        text-align: right;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideIn {
        from { transform: translateY(-50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

