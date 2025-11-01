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
        let apiPath = '';
        const pathname = window.location.pathname;
        
        // Tính toán số cấp cần đi lên để ra root của dự án
        // Dự án có cấu trúc: /Nhom1_Ca4_CNPM/{pages|staff|admin}/{subfolder}/{file}.html
        // Từ file HTML, cần đi lên về root (Nhom1_Ca4_CNPM/) rồi vào api/
        // Ví dụ: pages/home/home.html -> ../../api/ (lên 2 cấp)
        const pathParts = pathname.split('/').filter(p => p);
        const projectName = 'Nhom1_Ca4_CNPM';
        const projectIndex = pathParts.indexOf(projectName);
        
        if (projectIndex >= 0 && pathParts.length > projectIndex + 1) {
            // Tìm được project name trong path và có phần tử sau project name
            // Số cấp cần đi lên = số phần tử sau project name (không tính file cuối)
            // Ví dụ: ['Nhom1_Ca4_CNPM', 'pages', 'home', 'home.html'] -> 2 cấp (pages, home)
            const levelsUp = pathParts.length - projectIndex - 1;
            // Trừ đi 1 vì file HTML không tính là cấp
            apiPath = '../'.repeat(levelsUp - 1) + 'api/users.php/';
        } else {
            // Nếu không tìm thấy hoặc đang ở root, thử xác định bằng cách khác
            if (pathname.includes('/pages/') && pathname.split('/pages/')[1].includes('/')) {
                // pages/{subfolder}/{file} -> ../../api/
                apiPath = '../../api/users.php/';
            } else if (pathname.includes('/pages/')) {
                // pages/{file} -> ../api/
                apiPath = '../api/users.php/';
            } else if (pathname.includes('/staff/') && pathname.split('/staff/')[1].includes('/')) {
                // staff/{subfolder}/{file} -> ../../api/
                apiPath = '../../api/users.php/';
            } else if (pathname.includes('/staff/')) {
                // staff/{file} -> ../api/
                apiPath = '../api/users.php/';
            } else if (pathname.includes('/admin/')) {
                // admin/{file} -> ../api/
                apiPath = '../api/users.php/';
            } else {
                // Fallback: dùng đường dẫn tuyệt đối từ root
                apiPath = '/Nhom1_Ca4_CNPM/api/users.php/';
            }
        }
        
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
    localStorage.removeItem('cart'); // Xóa giỏ hàng khi logout
    
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

