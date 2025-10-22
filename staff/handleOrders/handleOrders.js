document.addEventListener('DOMContentLoaded', function () {
    // Lấy tất cả các nút lọc
    const filterButtons = document.querySelectorAll('.filter-btn');
    // Lấy tất cả các hàng dữ liệu
    const tableRows = document.querySelectorAll('.table-row');

    // Thêm sự kiện 'click' cho mỗi nút lọc
    filterButtons.forEach(button => {
        button.addEventListener('click', function () {

            // 1. Lấy giá trị bộ lọc từ nội dung text của nút
            // .trim() để xóa khoảng trắng (ví dụ ở nút "Tất cả ")
            // .toLowerCase() để chuyển thành chữ thường ("Đã giao" -> "đã giao")
            const filterValue = this.textContent.trim().toLowerCase();

            // 2. Cập nhật giao diện (class "active-filter")
            // Xóa class 'active-filter' khỏi nút đang active hiện tại
            document.querySelector('.filter-btn.active-filter').classList.remove('active-filter');
            // Thêm class 'active-filter' cho nút vừa được nhấp
            this.classList.add('active-filter');

            // 3. Thực hiện lọc dữ liệu
            tableRows.forEach(row => {
                // Lấy trạng thái của hàng (ô thứ 4)
                const rowStatus = row.querySelector('.cell-data:nth-child(4)').textContent.trim().toLowerCase();

                // 4. Quyết định Ẩn / Hiện
                if (filterValue === 'tất cả') {
                    // Nếu bấm "Tất cả", luôn hiển thị hàng
                    row.style.display = 'grid';
                } else if (rowStatus === filterValue) {
                    // Nếu trạng thái của hàng khớp với bộ lọc, hiển thị nó
                    row.style.display = 'grid';
                } else {
                    // Ngược lại, ẩn hàng đi
                    row.style.display = 'none';
                }
            });
        });
    });
});