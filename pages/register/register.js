/**
 * Register Page JavaScript
 * Handles registration functionality for LA CUISINE NGỌT
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
    setupRegisterForm();
});

function setupRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegistration(e);
    });

    // Add real-time validation
    const inputs = registerForm.querySelectorAll('input[required], textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
            if (this.name === 'password') {
                checkPasswordStrength(this.value);
            }
        });
    });

    // Special handling for password confirmation
    const confirmPassword = document.getElementById('confirmPassword');
    confirmPassword.addEventListener('input', function() {
        validatePasswordConfirmation();
    });
}

function handleRegistration(e) {
    const form = e.target;
    const formData = new FormData(form);
    
    const userData = {
        firstName: formData.get('firstName').trim(),
        lastName: formData.get('lastName').trim(),
        email: formData.get('email').trim(),
        phone: formData.get('phone').trim(),
        username: formData.get('username').trim(),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        address: formData.get('address').trim(),
        agreeTerms: formData.get('agreeTerms')
    };
    
    // Validate form
    if (!validateRegisterForm(userData)) {
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('.btn-submit');
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Đang đăng ký...';
    
    // Simulate API call
    setTimeout(() => {
        performRegistration(userData);
    }, 2000);
}

function validateRegisterForm(userData) {
    let isValid = true;
    
    // Clear previous errors
    clearAllErrors();
    
    // Validate first name
    if (!userData.firstName) {
        showFieldError('firstName', 'Vui lòng nhập họ');
        isValid = false;
    } else if (userData.firstName.length < 2) {
        showFieldError('firstName', 'Họ phải có ít nhất 2 ký tự');
        isValid = false;
    }
    
    // Validate last name
    if (!userData.lastName) {
        showFieldError('lastName', 'Vui lòng nhập tên');
        isValid = false;
    } else if (userData.lastName.length < 2) {
        showFieldError('lastName', 'Tên phải có ít nhất 2 ký tự');
        isValid = false;
    }
    
    // Validate email
    if (!userData.email) {
        showFieldError('email', 'Vui lòng nhập email');
        isValid = false;
    } else if (!validateEmail(userData.email)) {
        showFieldError('email', 'Email không hợp lệ');
        isValid = false;
    }
    
    // Validate phone
    if (!userData.phone) {
        showFieldError('phone', 'Vui lòng nhập số điện thoại');
        isValid = false;
    } else if (!validatePhone(userData.phone)) {
        showFieldError('phone', 'Số điện thoại không hợp lệ');
        isValid = false;
    }
    
    // Validate username
    if (!userData.username) {
        showFieldError('username', 'Vui lòng nhập tên đăng nhập');
        isValid = false;
    } else if (userData.username.length < 3) {
        showFieldError('username', 'Tên đăng nhập phải có ít nhất 3 ký tự');
        isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
        showFieldError('username', 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới');
        isValid = false;
    }
    
    // Validate password
    if (!userData.password) {
        showFieldError('password', 'Vui lòng nhập mật khẩu');
        isValid = false;
    } else if (userData.password.length < 6) {
        showFieldError('password', 'Mật khẩu phải có ít nhất 6 ký tự');
        isValid = false;
    }
    
    // Validate password confirmation
    if (!userData.confirmPassword) {
        showFieldError('confirmPassword', 'Vui lòng xác nhận mật khẩu');
        isValid = false;
    } else if (userData.password !== userData.confirmPassword) {
        showFieldError('confirmPassword', 'Mật khẩu xác nhận không khớp');
        isValid = false;
    }
    
    // Validate terms agreement
    if (!userData.agreeTerms) {
        showMessage('Vui lòng đồng ý với điều khoản sử dụng', 'error');
        isValid = false;
    }
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    clearFieldError(field);
    
    switch(fieldName) {
        case 'firstName':
        case 'lastName':
            if (!value) {
                showFieldError(fieldName, `Vui lòng nhập ${fieldName === 'firstName' ? 'họ' : 'tên'}`);
            } else if (value.length < 2) {
                showFieldError(fieldName, `${fieldName === 'firstName' ? 'Họ' : 'Tên'} phải có ít nhất 2 ký tự`);
            } else {
                showFieldSuccess(fieldName);
            }
            break;
            
        case 'email':
            if (!value) {
                showFieldError(fieldName, 'Vui lòng nhập email');
            } else if (!validateEmail(value)) {
                showFieldError(fieldName, 'Email không hợp lệ');
            } else {
                showFieldSuccess(fieldName);
            }
            break;
            
        case 'phone':
            if (!value) {
                showFieldError(fieldName, 'Vui lòng nhập số điện thoại');
            } else if (!validatePhone(value)) {
                showFieldError(fieldName, 'Số điện thoại không hợp lệ');
            } else {
                showFieldSuccess(fieldName);
            }
            break;
            
        case 'username':
            if (!value) {
                showFieldError(fieldName, 'Vui lòng nhập tên đăng nhập');
            } else if (value.length < 3) {
                showFieldError(fieldName, 'Tên đăng nhập phải có ít nhất 3 ký tự');
            } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                showFieldError(fieldName, 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới');
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
                checkPasswordStrength(value);
            }
            break;
    }
}

function validatePasswordConfirmation() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    clearFieldError(document.getElementById('confirmPassword'));
    
    if (!confirmPassword) {
        showFieldError('confirmPassword', 'Vui lòng xác nhận mật khẩu');
    } else if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'Mật khẩu xác nhận không khớp');
    } else {
        showFieldSuccess('confirmPassword');
    }
}

function checkPasswordStrength(password) {
    const strengthIndicator = document.querySelector('.password-strength') || createPasswordStrengthIndicator();
    
    let strength = 'weak';
    let message = 'Mật khẩu yếu';
    
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
        strength = 'strong';
        message = 'Mật khẩu mạnh';
    } else if (password.length >= 6) {
        strength = 'medium';
        message = 'Mật khẩu trung bình';
    }
    
    strengthIndicator.className = `password-strength ${strength}`;
    strengthIndicator.textContent = message;
}

function createPasswordStrengthIndicator() {
    const passwordField = document.getElementById('password');
    const formGroup = passwordField.closest('.form-group');
    
    const indicator = document.createElement('div');
    indicator.className = 'password-strength';
    formGroup.appendChild(indicator);
    
    return indicator;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
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

function performRegistration(userData) {
    // In production, this would be an actual API call
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if username or email already exists
    const userExists = existingUsers.find(user => 
        user.username === userData.username || user.email === userData.email
    );
    
    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.classList.remove('loading');
    submitBtn.textContent = 'Đăng ký';
    
    if (userExists) {
        if (userExists.username === userData.username) {
            showMessage('Tên đăng nhập đã được sử dụng!', 'error');
        } else {
            showMessage('Email đã được sử dụng!', 'error');
        }
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        address: userData.address,
        role: 'customer',
        createdAt: new Date().toISOString()
    };
    
    // Add to users list
    existingUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(existingUsers));
    
    showMessage('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.', 'success');
    
    // Redirect to login page
    setTimeout(() => {
        window.location.href = '../login/login.html';
    }, 2000);
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
        const form = document.getElementById('registerForm');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
});

// Auto-focus on first name field
window.addEventListener('load', function() {
    const firstNameField = document.getElementById('firstName');
    if (firstNameField) {
        firstNameField.focus();
    }
});

