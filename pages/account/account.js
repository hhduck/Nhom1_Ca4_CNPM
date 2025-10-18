// Bật/tắt hiển thị mật khẩu
document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', () => {
      const input = document.getElementById(icon.dataset.target);
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      icon.classList.toggle('fa-eye');
      icon.classList.toggle('fa-eye-slash');
    });
  });document.querySelector('.save-btn').addEventListener('click', (e) => {
    e.preventDefault(); // Ngăn form reload trang
  
    const data = {
      name: document.querySelector('input[type="text"]').value,
      email: document.querySelector('input[type="email"]').value,
      phone: document.querySelector('input[type="tel"]').value,
      address: document.querySelector('input[type="text"]:last-of-type').value,
    };
  
    // Ví dụ gửi dữ liệu đến server
    fetch('https://example.com/api/update-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => alert('✅ Lưu thay đổi thành công!'))
    .catch(err => alert('❌ Có lỗi xảy ra, vui lòng thử lại.'));
  });