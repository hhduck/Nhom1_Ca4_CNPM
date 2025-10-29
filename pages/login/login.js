/**
 * Login Page JavaScript
 * Handles login functionality for LA CUISINE NGỌT
 */

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is already logged in - Cải thiện logic
    const userData = localStorage.getItem('currentUser');
    const jwtToken = localStorage.getItem('jwtToken');

    if (userData && jwtToken) {
        try {
            const currentUser = JSON.parse(userData);
            if (currentUser && currentUser.id) {
                // Kiểm tra xem có parameter ?force_login trong URL không
                const urlParams = new URLSearchParams(window.location.search);
                const forceLogin = urlParams.get('force_login');

                if (forceLogin === 'true') {
                    // Nếu có force_login=true, cho phép đăng nhập lại
                    console.log('Force login được yêu cầu, cho phép đăng nhập lại');
                    setupLoginForm();
                    return;
                }

                // Nếu không có force_login, redirect về home
                showMessage('Bạn đã đăng nhập! Đang chuyển hướng...', 'info');
                setTimeout(() => {
                    window.location.href = '../home/home.html';
                }, 1500);
                return;
            }
        } catch (error) {
            console.error('Lỗi parse user data:', error);
            // Xóa data lỗi
            localStorage.removeItem('currentUser');
            localStorage.removeItem('jwtToken');
        }
    }

    // Setup form login nếu chưa đăng nhập
    setupLoginForm();
});

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        handleLogin(e);
    });

    // Add real-time validation
    const inputs = loginForm.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            validateField(this);
        });

        input.addEventListener('input', function () {
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

    // ✅ FIX: Gọi API ngay lập tức thay vì setTimeout
    performLogin(username, password, rememberMe);
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

    switch (fieldName) {
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

async function performLogin(username, password, rememberMe) {
    try {
        const response = await fetch('../../api/auth/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const submitBtn = document.querySelector('.btn-submit');
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Đăng nhập';

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

        if (data.success) {
            const user = data.data.user;
            const token = data.data.token;

            // ✅ FIX: LƯU ĐÚNG CHO TỪNG VAI TRÒ
            if (user.role === 'admin') {
                // Admin cần cả 2 keys để tương thích với cả admin panel và các trang khác
                localStorage.setItem('currentUser', JSON.stringify(user));
                localStorage.setItem('currentStaff', JSON.stringify(user));
            } else if (user.role === 'staff') {
                localStorage.setItem('currentStaff', JSON.stringify(user));
                // Staff cũng cần currentUser để một số trang dùng chung
                localStorage.setItem('currentUser', JSON.stringify(user));
            } else {
                // Customer chỉ cần currentUser
                localStorage.setItem('currentUser', JSON.stringify(user));
            }

            localStorage.setItem('jwtToken', token);

            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }

            showMessage(`Đăng nhập thành công! Chào mừng ${data.data.user.full_name}!`, 'success');

            // Redirect based on role
            setTimeout(() => {
                if (data.data.user.role === 'admin') {
                    window.location.href = '../../admin/admin.html';
                } else if (data.data.user.role === 'staff') {
                    window.location.href = '../../staff/ViewOders/order.html';
                } else {
                    window.location.href = '../home/home.html';
                }
            }, 1500);

        } else {
            showMessage(data.message || 'Đăng nhập thất bại!', 'error');
        }

    } catch (error) {
        console.error('Login error:', error);

        const submitBtn = document.querySelector('.btn-submit');
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Đăng nhập';

        console.log('API không hoạt động, sử dụng mock data...');
        performLoginWithMockData(username, password, rememberMe);
    }
}

// Fallback function với mock data
function performLoginWithMockData(username, password, rememberMe) {
    const mockUsers = [
        {
            id: 1,
            username: 'admin',
            email: 'admin@lacuisine.vn',
            password: 'password', // ✅ FIX: Sử dụng password đúng từ database
            role: 'admin',
            full_name: 'Quản trị viên'
        },
        {
            id: 2,
            username: 'staff01',
            email: 'staff01@lacuisine.vn',
            password: 'password', // ✅ FIX: Sử dụng password đúng từ database
            role: 'staff',
            full_name: 'Nhân viên 1'
        },
        {
            id: 3,
            username: 'customer01',
            email: 'customer01@email.com',
            password: 'password', // ✅ FIX: Sử dụng password đúng từ database
            role: 'customer',
            full_name: 'Nguyễn Văn A'
        }
    ];

    // Find user
    const user = mockUsers.find(u =>
        (u.username === username || u.email === username) &&
        u.password === password
    );

    if (user) {
        // Remove password from user object
        const { password, ...userWithoutPassword } = user;

        // ✅ SỬA LỖI: KIỂM TRA VAI TRÒ MOCK
        if (user.role === 'staff' || user.role === 'admin') {
            localStorage.setItem('currentStaff', JSON.stringify(userWithoutPassword));
        } else {
            localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        }

        localStorage.setItem('jwtToken', 'demo');

        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }

        showMessage(`Đăng nhập thành công! (Mock data) Chào mừng ${user.full_name}!`, 'success');

        // Redirect based on role
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = '../../admin/admin.html';
            } else if (user.role === 'staff') {
                window.location.href = '../../staff/ViewOders/order.html';
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
// 👁️ Toggle show/hide password
document.addEventListener('DOMContentLoaded', function () {
    const togglePassword = document.querySelector('.toggle-password');
    const passwordField = document.getElementById('password');

    if (togglePassword && passwordField) {
        togglePassword.addEventListener('click', function () {
            const isHidden = passwordField.type === 'password';
            passwordField.type = isHidden ? 'text' : 'password';
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
});


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
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const form = document.getElementById('loginForm');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
});

// Auto-focus on username field
window.addEventListener('load', function () {
    const usernameField = document.getElementById('username');
    if (usernameField) {
        usernameField.focus();
    }
});

