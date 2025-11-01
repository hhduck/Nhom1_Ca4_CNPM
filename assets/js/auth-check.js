/**
 * Auth Check Utility - Kiểm tra status user và auto-logout nếu bị khóa
 * Sử dụng chung cho tất cả các trang
 */

// Function để check user status
async function checkUserStatus() {
    const currentUserData = localStorage.getItem('currentUser');
    const currentStaffData = localStorage.getItem('currentStaff');
    const jwtToken = localStorage.getItem('jwtToken');
    
    if (!jwtToken) return; // Không có token thì không check
    
    let userId = null;
    let userRole = null;
    
    // Lấy userId từ currentUser hoặc currentStaff
    if (currentStaffData) {
        try {
            const staff = JSON.parse(currentStaffData);
            userId = staff.id;
            userRole = staff.role || 'staff';
        } catch (e) {
            console.error('Error parsing staff data:', e);
        }
    } else if (currentUserData) {
        try {
            const user = JSON.parse(currentUserData);
            userId = user.id;
            userRole = user.role || 'customer';
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }
    
    if (!userId) return;
    
    try {
        // Xác định đường dẫn API đúng dựa trên vị trí hiện tại
        let apiPath = '../api/users.php/';
        // Nếu đang ở trong staff/, cần đi lên 2 cấp
        if (window.location.pathname.includes('/staff/')) {
            apiPath = '../../api/users.php/';
        }
        // Nếu đang ở root hoặc pages/, đi lên 1 cấp
        const response = await fetch(`${apiPath}${userId}`, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        
        if (!response.ok) {
            // Nếu 401/403, logout ngay
            if (response.status === 401 || response.status === 403) {
                let loginPath = '../pages/login/login.html';
                if (window.location.pathname.includes('/staff/')) {
                    loginPath = '../../pages/login/login.html';
                }
                performLogout(`${loginPath}?message=banned`);
                return;
            }
            return; // Lỗi khác thì bỏ qua
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
            const user = data.data;
            
            // Nếu status không phải 'active', logout
            if (user.status !== 'active') {
                alert('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.');
                let loginPath = '../pages/login/login.html';
                if (window.location.pathname.includes('/staff/')) {
                    loginPath = '../../pages/login/login.html';
                }
                performLogout(`${loginPath}?message=banned`);
            }
        }
    } catch (error) {
        console.error('Error checking user status:', error);
        // Không logout nếu có lỗi network, chỉ log
    }
}

// Function logout chung
function performLogout(redirectUrl = '../pages/login/login.html') {
    // Tự động điều chỉnh đường dẫn nếu đang ở trong staff/
    if (!redirectUrl.startsWith('http') && window.location.pathname.includes('/staff/')) {
        if (redirectUrl.startsWith('../')) {
            redirectUrl = '../' + redirectUrl;
        } else if (!redirectUrl.startsWith('../../')) {
            redirectUrl = '../../' + redirectUrl;
        }
    }
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentStaff');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('rememberMe');
    
    if (redirectUrl) {
        window.location.href = redirectUrl;
    }
}

// Check user status khi trang load và định kỳ
document.addEventListener('DOMContentLoaded', function() {
    // Check ngay khi load
    checkUserStatus();
    
    // Check định kỳ mỗi 30 giây
    setInterval(checkUserStatus, 30000);
});

// Check khi có API call bị 401/403
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    const response = await originalFetch(...args);
    
    // Nếu bị 401 hoặc 403, check xem có phải do bị khóa không
    if (response.status === 401 || response.status === 403) {
        const clonedResponse = response.clone();
        try {
            const data = await clonedResponse.json();
            if (data.message && (data.message.includes('khóa') || data.message.includes('banned') || data.message.includes('không hoạt động'))) {
                alert('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
                let loginPath = '../pages/login/login.html';
                if (window.location.pathname.includes('/staff/')) {
                    loginPath = '../../pages/login/login.html';
                }
                performLogout(`${loginPath}?message=banned`);
            }
        } catch (e) {
            // Không parse được JSON thì bỏ qua
        }
    }
    
    return response;
};

