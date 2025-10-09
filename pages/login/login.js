/**
 * Login Page JavaScript
 * Handles login functionality for LA CUISINE NGỌT
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.id) {
        showMessage('Bạn đã đăng nhập!', 'info');
        setTimeout(() => {
            window.location.href = '../home/home.html';
        }, 1500);
        return;
    }

    // Setup form handling
    setupLoginForm();
});

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin(e);
    });

    // Add real-time validation
    const inputs = loginForm.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

function handleLogin(e) {
    const form = e.target;
    const formData = new FormData(form);
    
    const username = formData.get('username').trim();
    const password = formData.get('password');
    const rememberMe = formData.get('rememberMe');
    
    // Validate form
    if (!validateLoginForm(username, password)) {
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('.btn-submit');
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Đang đăng nhập...';
    
    // Simulate API call
    setTimeout(() => {
        performLogin(username, password, rememberMe);
    }, 1500);
}

function validateLoginForm(username, password) {
    let isValid = true;
    
    // Clear previous errors
    clearAllErrors();
    
    // Validate username
    if (!username) {
        showFieldError('username', 'Vui lòng nhập tên đăng nhập hoặc email');
        isValid = false;
    } else if (username.length < 3) {
        showFieldError('username', 'Tên đăng nhập phải có ít nhất 3 ký tự');
        isValid = false;
    }
    
    // Validate password
    if (!password) {
        showFieldError('password', 'Vui lòng nhập mật khẩu');
        isValid = false;
    } else if (password.length < 6) {
        showFieldError('password', 'Mật khẩu phải có ít nhất 6 ký tự');
        isValid = false;
    }
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    clearFieldError(field);
    
    switch(fieldName) {
        case 'username':
            if (!value) {
                showFieldError(fieldName, 'Vui lòng nhập tên đăng nhập hoặc email');
            } else if (value.length < 3) {
                showFieldError(fieldName, 'Tên đăng nhập phải có ít nhất 3 ký tự');
            } else {
                showFieldSuccess(fieldName);
            }
            break;
            
        case 'password':
            if (!value) {
                showFieldError(fieldName, 'Vui lòng nhập mật khẩu');
            } else if (value.length < 6) {
                showFieldError(fieldName, 'Mật khẩu phải có ít nhất 6 ký tự');
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

function clearAllErrors() {
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('error', 'success');
        const errorMessage = group.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    });
}

function performLogin(username, password, rememberMe) {
    // In production, this would be an actual API call
    const mockUsers = [
        {
            id: 1,
            username: 'admin',
            email: 'admin@lacuisinengot.com',
            password: 'admin123',
            role: 'admin',
            fullName: 'Quản trị viên'
        },
        {
            id: 2,
            username: 'customer',
            email: 'customer@example.com',
            password: 'customer123',
            role: 'customer',
            fullName: 'Khách hàng'
        }
    ];
    
    // Find user
    const user = mockUsers.find(u => 
        (u.username === username || u.email === username) && 
        u.password === password
    );
    
    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.classList.remove('loading');
    submitBtn.textContent = 'Đăng nhập';
    
    if (user) {
        // Remove password from user object
        const { password, ...userWithoutPassword } = user;
        
        // Store user data
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        // Store demo JWT token for admin API access
        localStorage.setItem('jwtToken', 'demo');
        
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        showMessage('Đăng nhập thành công!', 'success');
        
        // Redirect based on role
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = '../../admin/admin.html';
            } else {
                window.location.href = '../home/home.html';
            }
        }, 1500);
        
    } else {
        showMessage('Tên đăng nhập hoặc mật khẩu không đúng!', 'error');
    }
}

function forgotPassword() {
    const email = prompt('Nhập email của bạn để đặt lại mật khẩu:');
    if (email) {
        if (validateEmail(email)) {
            // In production, implement password reset functionality
            showMessage('Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn!', 'info');
        } else {
            showMessage('Email không hợp lệ!', 'error');
        }
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Utility function for showing messages
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at top of form container
    const formContainer = document.querySelector('.form-container');
    formContainer.insertBefore(messageDiv, formContainer.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Handle Enter key in form
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const form = document.getElementById('loginForm');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
});

// Auto-focus on username field
window.addEventListener('load', function() {
    const usernameField = document.getElementById('username');
    if (usernameField) {
        usernameField.focus();
    }
});

