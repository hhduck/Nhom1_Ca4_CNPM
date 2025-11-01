# BẢNG KIỂM THỬ PHẦN MỀM
## Hệ thống Quản lý Bán hàng - LA CUISINE NGỌT

| Step no | Steps | Data | Expected result | Actual results | Status |
|---------|-------|------|-----------------|----------------|--------|
| 1 | Nhập **Username** và ấn nút **Đăng nhập** | Username = "admin" | Hiển thị thông báo "Vui lòng nhập username và password" | | PASS |
| 2 | Nhập **Password** và ấn nút **Đăng nhập** | Password = "password" | Hiển thị thông báo "Vui lòng nhập username và password" | | PASS |
| 3 | Nhập **Username**, **Password** và ấn nút **Đăng nhập** | Username = "admin", Password = "wrong" | Hiển thị thông báo "Username và password không hợp lệ" | | PASS |
| 4 | Nhập **Username**, **Password** và ấn nút **Đăng nhập** | Username = "invalid", Password = "password" | Hiển thị thông báo "Username và password không hợp lệ" | | PASS |
| 5 | Nhập **Username**, **Password** và ấn nút **Đăng nhập** | Username = "", Password = "" | Hiển thị thông báo "Vui lòng nhập username và password" | | PASS |
| 6 | Nhập **Username**, **Password** và ấn nút **Đăng nhập** | Username = "admin", Password = "password" | Hiển thị trang admin với tài khoản "admin" | | PASS |
| 7 | Nhập **Username**, **Password** và ấn nút **Đăng nhập** | Username = "staff01", Password = "password" | Hiển thị trang quản lý đơn hàng staff với tài khoản staff | | PASS |
| 8 | Nhập **Username**, **Password** và ấn nút **Đăng nhập** | Username = "customer01", Password = "password" | Hiển thị trang chủ với tài khoản customer01 | | PASS |
| 9 | Đăng nhập với tài khoản đã bị khóa | Username = "banned_user", Password = "password" (sau khi admin khóa) | Hiển thị thông báo "Tài khoản đã bị khóa" và không cho đăng nhập | | PASS |
| 10 | Nhập thông tin đăng ký và ấn nút **Đăng ký** | Username = "", Email = "", Password = "" | Hiển thị thông báo "Vui lòng điền đầy đủ thông tin" | | PASS |
| 11 | Nhập thông tin đăng ký và ấn nút **Đăng ký** | Username = "newuser", Email = "invalid", Password = "123" | Hiển thị thông báo "Email không hợp lệ" hoặc "Password phải có ít nhất 6 ký tự" | | PASS |
| 12 | Nhập thông tin đăng ký và ấn nút **Đăng ký** | Username = "admin", Email = "new@email.com", Password = "123456" | Hiển thị thông báo "Username đã tồn tại" | | PASS |
| 13 | Nhập thông tin đăng ký và ấn nút **Đăng ký** | Username = "newuser", Email = "admin@lacuisine.vn", Password = "123456" | Hiển thị thông báo "Email đã tồn tại" | | PASS |
| 14 | Nhập thông tin đăng ký và ấn nút **Đăng ký** | Username = "newuser", Email = "newuser@email.com", Password = "123456", FullName = "Nguyễn Văn Mới" | Đăng ký thành công và chuyển đến trang đăng nhập hoặc trang chủ | | PASS |
| 15 | Vào trang **Quản lý sản phẩm** (Admin) và ấn nút **Thêm sản phẩm** | Không nhập thông tin | Hiển thị thông báo "Vui lòng điền đầy đủ thông tin" | | PASS |
| 16 | Vào trang **Quản lý sản phẩm** và điền thông tin sản phẩm, ấn **Lưu** | ProductName = "Entremets Mới", Category = "Entremet", Price = "650000", Quantity = "10" | Thêm sản phẩm thành công và hiển thị trong danh sách | | PASS |
| 17 | Vào trang **Quản lý sản phẩm**, chọn sản phẩm "Entremets Rose" và ấn **Sửa** | Sửa Price = "700000" | Cập nhật sản phẩm thành công, giá được cập nhật | | PASS |
| 18 | Vào trang **Quản lý sản phẩm**, chọn sản phẩm và ấn **Xóa** | Xác nhận xóa | Xóa sản phẩm thành công và sản phẩm biến mất khỏi danh sách | | PASS |
| 19 | Vào trang **Quản lý sản phẩm** và tìm kiếm | Search = "Entremets" | Hiển thị các sản phẩm có tên chứa "Entremets" (Entremets Rose, Lime and Basil Entremets, Blanche Figues & Framboises) | | PASS |
| 20 | Vào trang **Quản lý sản phẩm** và lọc theo danh mục | Category = "Entremet" | Chỉ hiển thị các sản phẩm thuộc danh mục "Entremet" | | PASS |
| 21 | Thêm sản phẩm mới từ Admin | ProductName = "Bánh Test", Category = "Mousse", Price = "550000", ImageURL = "assets/images/test.jpg" | Sản phẩm xuất hiện trên trang home sau khi refresh | | PASS |
| 22 | Vào trang **Quản lý đơn hàng** (Admin) | Không có điều kiện | Hiển thị danh sách tất cả đơn hàng | | PASS |
| 23 | Lọc đơn hàng theo trạng thái **Chờ xử lý** | Status = "pending" | Chỉ hiển thị các đơn hàng có trạng thái "pending" | | PASS |
| 24 | Lọc đơn hàng theo trạng thái **Đã xác nhận** | Status = "confirmed" | Chỉ hiển thị các đơn hàng có trạng thái "confirmed" | | PASS |
| 25 | Lọc đơn hàng theo trạng thái **Đang chuẩn bị** | Status = "preparing" | Chỉ hiển thị các đơn hàng có trạng thái "preparing" | | PASS |
| 26 | Lọc đơn hàng theo trạng thái **Đang giao** | Status = "shipping" | Chỉ hiển thị các đơn hàng có trạng thái "shipping" | | PASS |
| 27 | Lọc đơn hàng theo trạng thái **Hoàn thành** | Status = "completed" | Chỉ hiển thị các đơn hàng có trạng thái "completed" | | PASS |
| 28 | Lọc đơn hàng theo trạng thái **Đã hủy** | Status = "cancelled" | Chỉ hiển thị các đơn hàng có trạng thái "cancelled" | | PASS |
| 29 | Chọn đơn hàng và ấn **Xóa** (Admin) | Xác nhận xóa | Xóa đơn hàng thành công và đơn hàng biến mất khỏi danh sách | | PASS |
| 30 | Chọn đơn hàng và cập nhật trạng thái | Status = "shipping" | Cập nhật trạng thái thành công | | PASS |
| 31 | Xóa đơn hàng từ Admin | Xác nhận xóa đơn hàng ORD001 | Đơn hàng bị xóa khỏi cơ sở dữ liệu và không hiển thị ở trang khách hàng | | PASS |
| 32 | Vào trang **Quản lý người dùng** (Admin) | Không có điều kiện | Hiển thị danh sách tất cả người dùng (admin, staff, customer) | | PASS |
| 33 | Chọn người dùng customer01 và ấn **Khóa tài khoản** | Status = "banned" | Khóa tài khoản thành công, người dùng không thể đăng nhập | | PASS |
| 34 | Đăng nhập với tài khoản đã bị khóa | Username = "customer01" (sau khi bị khóa) | Hiển thị thông báo "Tài khoản đã bị khóa" và không cho đăng nhập | | PASS |
| 35 | User đang đăng nhập bị khóa tài khoản | Admin khóa tài khoản customer01 đang đăng nhập | User bị đăng xuất tự động và hiển thị thông báo "Tài khoản đã bị khóa" | | PASS |
| 36 | Chọn người dùng đã bị khóa và ấn **Mở khóa** | Status = "active" | Mở khóa tài khoản thành công, người dùng có thể đăng nhập lại | | PASS |
| 37 | Chọn người dùng và ấn **Xóa** (Admin) | Xác nhận xóa (không phải admin chính) | Xóa người dùng thành công và người dùng biến mất khỏi danh sách | | PASS |
| 38 | Cố gắng xóa admin chính (UserID = 1) | Xác nhận xóa admin | Hiển thị thông báo "Không thể xóa admin chính" | | PASS |
| 39 | Cập nhật thông tin người dùng | FullName = "Tên mới", Phone = "0901234567" | Cập nhật thông tin thành công | | PASS |
| 40 | Vào trang **Quản lý khuyến mãi** (Admin) và ấn **Thêm khuyến mãi** | Không nhập thông tin | Hiển thị thông báo "Vui lòng điền đầy đủ thông tin" | | PASS |
| 41 | Vào trang **Quản lý khuyến mãi** và điền thông tin, ấn **Lưu** | Code = "PROMO01", Name = "Giảm 10%", Type = "percent", Value = "10", StartDate = "2024-01-01", EndDate = "2024-12-31" | Thêm khuyến mãi thành công và hiển thị trong danh sách | | PASS |
| 42 | Vào trang **Quản lý khuyến mãi** và điền thông tin, ấn **Lưu** | Code = "FREESHIP01", Type = "free_shipping", MinOrderValue = "500000", StartDate = "2024-01-01", EndDate = "2024-12-31" | Thêm khuyến mãi free shipping thành công | | PASS |
| 43 | Vào trang **Quản lý khuyến mãi** và điền thông tin, ấn **Lưu** | Code = "GIAM50K", Type = "fixed_amount", Value = "50000", MinOrderValue = "1000000", StartDate = "2024-01-01", EndDate = "2024-12-31" | Thêm khuyến mãi giảm giá cố định thành công | | PASS |
| 44 | Chọn khuyến mãi và ấn **Sửa** | Sửa DiscountValue = "15" | Cập nhật khuyến mãi thành công | | PASS |
| 45 | Chọn khuyến mãi và ấn **Xóa** | Xác nhận xóa | Xóa khuyến mãi thành công | | PASS |
| 46 | Thêm khuyến mãi mới với ImageURL | Code = "TESTPROMO", ImageURL = "assets/images/promo.jpg" | Khuyến mãi xuất hiện trên trang home sau khi refresh với ảnh đúng | | PASS |
| 47 | Thêm khuyến mãi với mã đã tồn tại | Code = "GIAM10TRON15" | Hiển thị thông báo "Mã khuyến mãi đã tồn tại" | | PASS |
| 48 | Vào trang **Báo cáo** (Admin) và chọn **Năm** | Year = "2024" | Hiển thị doanh thu và số liệu thống kê của năm 2024 | | PASS |
| 49 | Chọn **Tháng** từ dropdown | Month = "5", Year = "2024" | Hiển thị doanh thu tháng 5/2024, biểu đồ tròn hiển thị sản phẩm bán được trong tháng đó, bảng chi tiết cập nhật | | PASS |
| 50 | Chọn **Tất cả** tháng | Month = "", Year = "2024" | Bảng chi tiết doanh thu theo sản phẩm để trống, chỉ hiển thị biểu đồ cột và số liệu KPI tổng | | PASS |
| 51 | Chọn tháng tương lai | Month = "12", Year = "2025" (nếu hiện tại < 12/2025) | Tất cả biểu đồ và bảng để trống, hiển thị thông báo "Tháng tương lai không có dữ liệu" | | PASS |
| 52 | Kiểm tra KPI và biểu đồ cột | Month = "5", Year = "2024" | Doanh thu KPI khớp với giá trị trên biểu đồ cột tháng 5 | | PASS |
| 53 | Kiểm tra tổng doanh thu sản phẩm | Month = "5", Year = "2024" | Tổng doanh thu các sản phẩm trong bảng chi tiết khớp với doanh thu KPI | | PASS |
| 54 | Kiểm tra số đơn hàng | Month = "5", Year = "2024" | Số "Tổng đơn hàng" >= "Đã giao" (đã giao ≤ tổng đơn hàng) | | PASS |
| 55 | Kiểm tra biểu đồ cột phân biệt tháng hiện tại | Month = tháng hiện tại, Year = năm hiện tại | Cột tháng hiện tại có màu khác (#2d4a3e) so với các tháng khác (#4472C4) | | PASS |
| 56 | Kiểm tra biểu đồ tròn hiển thị phần trăm | Month = "5", Year = "2024" | Chú thích biểu đồ tròn hiển thị tên sản phẩm kèm phần trăm (ví dụ: "Entremets Rose (25.5%)") | | PASS |
| 57 | Kiểm tra bảng chi tiết có dòng TỔNG CỘNG | Month = "5", Year = "2024" | Bảng có dòng cuối cùng là "TỔNG CỘNG" với tổng số lượng, tổng doanh thu và 100% | | PASS |
| 58 | Kiểm tra tỷ lệ phần trăm tổng = 100% | Month = "5", Year = "2024" | Tổng các phần trăm trong bảng chi tiết = 100% (có điều chỉnh rounding) | | PASS |
| 59 | Kiểm tra sản phẩm 0 doanh thu không hiển thị | Month = "5", Year = "2024" | Các sản phẩm có doanh thu = 0 không hiển thị trong bảng chi tiết | | PASS |
| 60 | Kiểm tra loading state khi chuyển tháng/năm | Chọn tháng/năm khác | Hiển thị "Đang tải..." trên biểu đồ và bảng trong khi load dữ liệu | | PASS |
| 61 | Mở trang **Home** | Không có điều kiện | Hiển thị danh sách sản phẩm và khuyến mãi từ cơ sở dữ liệu | | PASS |
| 62 | Kiểm tra sản phẩm mới được thêm | Thêm sản phẩm "Test Product" từ admin, refresh home | Sản phẩm "Test Product" xuất hiện trên trang home | | PASS |
| 63 | Kiểm tra khuyến mãi mới được thêm | Thêm khuyến mãi từ admin, refresh home | Khuyến mãi mới xuất hiện trên trang home | | PASS |
| 64 | Kiểm tra ảnh khuyến mãi | Promotion có ImageURL = "assets/images/buy-1-get-1.jpg" | Ảnh khuyến mãi hiển thị đúng, không hiển thị placeholder | | PASS |
| 65 | Kiểm tra placeholder khi không có ImageURL | Promotion không có ImageURL hoặc ImageURL = "" | Hiển thị placeholder "Không có ảnh" thay vì ảnh | | PASS |
| 66 | Click vào sản phẩm trên trang home | Click vào "Entremets Rose" | Chuyển đến trang chi tiết sản phẩm với ProductID = 1 | | PASS |
| 67 | Tìm kiếm sản phẩm trên trang home | Search = "Entremets" | Hiển thị popup với kết quả tìm kiếm chứa các sản phẩm Entremets | | PASS |
| 68 | Tìm kiếm sản phẩm với từ khóa không có kết quả | Search = "xyz123abc" | Hiển thị thông báo "Không tìm thấy sản phẩm" | | PASS |
| 69 | Lọc sản phẩm theo danh mục trên trang home | Click tab "Entremet" | Chỉ hiển thị sản phẩm thuộc danh mục "Entremet" (Entremets Rose, Lime and Basil Entremets, Blanche Figues & Framboises) | | PASS |
| 70 | Lọc sản phẩm theo danh mục "Mousse" | Click tab "Mousse" | Chỉ hiển thị sản phẩm thuộc danh mục "Mousse" (Mousse Chanh Dây, Mousse Dưa Lưới, Mousse Việt Quất) | | PASS |
| 71 | Đăng nhập với tài khoản customer01 và vào **Tài khoản** | Username = "customer01", Password = "password" | Hiển thị thông tin tài khoản và lịch sử đơn hàng | | PASS |
| 72 | Xem lịch sử đơn hàng (Customer) | Đăng nhập customer01 | Hiển thị bảng danh sách đơn hàng của chính khách hàng đó (chỉ ORD001, ORD003, ORD005) | | PASS |
| 73 | Xem chi tiết đơn hàng (Customer) | Click vào đơn hàng ORD001 | Hiển thị chi tiết sản phẩm trong đơn hàng, số lượng, giá trị (Entremets Rose x1, Mousse Chanh Dây x1) | | PASS |
| 74 | Cập nhật thông tin cá nhân (Customer) | FullName = "Nguyễn Văn A Mới", Phone = "0901234567", Address = "123 Nguyễn Huệ, Q1, TP.HCM" | Cập nhật thông tin thành công | | PASS |
| 75 | Khách hàng cố gắng xem đơn hàng của người khác | customer01 cố gắng truy cập /api/orders.php?user_id=4 | Hiển thị thông báo "Bạn không có quyền truy cập" hoặc 403 Forbidden | | PASS |
| 76 | Thêm sản phẩm vào giỏ hàng | Click "Thêm vào giỏ" cho "Entremets Rose", Quantity = 2 | Sản phẩm được thêm vào giỏ hàng với số lượng 2 | | PASS |
| 77 | Xem giỏ hàng | Click icon giỏ hàng trên navigation | Hiển thị trang giỏ hàng với các sản phẩm đã thêm | | PASS |
| 78 | Cập nhật số lượng trong giỏ hàng | ProductID = 1, Quantity = 5 | Số lượng sản phẩm trong giỏ hàng được cập nhật thành 5 | | PASS |
| 79 | Xóa sản phẩm khỏi giỏ hàng | Click "Xóa" cho sản phẩm trong giỏ hàng | Sản phẩm bị xóa khỏi giỏ hàng | | PASS |
| 80 | Xem giỏ hàng khi chưa đăng nhập | Không đăng nhập, click icon giỏ hàng | Hiển thị thông báo "Vui lòng đăng nhập để xem giỏ hàng" và chuyển đến trang đăng nhập | | PASS |
| 81 | Đặt hàng với giỏ hàng trống | Giỏ hàng rỗng, click "Đặt hàng" | Hiển thị thông báo "Giỏ hàng trống" | | PASS |
| 82 | Đặt hàng với thông tin thiếu | Không điền địa chỉ giao hàng, click "Đặt hàng" | Hiển thị thông báo "Vui lòng điền đầy đủ thông tin" | | PASS |
| 83 | Đặt hàng thành công | Điền đầy đủ thông tin (tên, số điện thoại, địa chỉ, phương thức thanh toán) | Tạo đơn hàng thành công và chuyển đến trang xác nhận đơn hàng | | PASS |
| 84 | Áp dụng mã khuyến mãi hợp lệ | PromotionCode = "GIAM10TRON15" (nếu tồn tại) | Mã khuyến mãi được áp dụng, giảm giá đúng | | PASS |
| 85 | Áp dụng mã khuyến mãi không hợp lệ | PromotionCode = "INVALID123" | Hiển thị thông báo "Mã khuyến mãi không hợp lệ" | | PASS |
| 86 | Áp dụng mã khuyến mãi đã hết hạn | PromotionCode đã có EndDate < NOW() | Hiển thị thông báo "Mã khuyến mãi đã hết hạn" | | PASS |
| 87 | Staff truy cập trang quản lý đơn hàng | Username = "staff01", Password = "password" | Truy cập thành công trang /staff/ViewOders/order.html | | PASS |
| 88 | Staff xem danh sách đơn hàng | Đăng nhập staff01, vào trang quản lý đơn hàng | Hiển thị danh sách tất cả đơn hàng | | PASS |
| 89 | Staff cập nhật trạng thái đơn hàng | Chọn đơn hàng, cập nhật Status = "confirmed" | Cập nhật trạng thái thành công | | PASS |
| 90 | Staff lọc đơn hàng theo trạng thái | Chọn checkbox "Chờ xử lý" | Chỉ hiển thị các đơn hàng có trạng thái "pending" | | PASS |
| 91 | Customer truy cập trang admin | Username = "customer01", vào /admin/admin.html | Hiển thị thông báo "Bạn không có quyền truy cập" và chuyển về trang chủ | | PASS |
| 92 | Customer truy cập trang staff | Username = "customer01", vào /staff/ViewOders/order.html | Hiển thị thông báo "Bạn không có quyền truy cập" và chuyển về trang chủ | | PASS |
| 93 | Staff truy cập trang admin | Username = "staff01", vào /admin/admin.html | Hiển thị thông báo "Bạn không có quyền truy cập" và chuyển về trang chủ | | PASS |
| 94 | Admin truy cập trang admin | Username = "admin", Password = "password" | Truy cập thành công trang /admin/admin.html | | PASS |
| 95 | Gửi request API không có token | Authorization header = null | Trả về 401 Unauthorized | | PASS |
| 96 | Gửi request API với token không hợp lệ | Token = "invalid_token" | Trả về 401 Unauthorized hoặc 403 Forbidden | | PASS |
| 97 | Xóa sản phẩm không tồn tại | ProductID = "99999", DELETE /api/products.php/99999 | Trả về thông báo lỗi "Không tìm thấy sản phẩm" | | PASS |
| 98 | Cập nhật đơn hàng với trạng thái không hợp lệ | Status = "invalid_status" | Trả về thông báo lỗi "Trạng thái không hợp lệ" | | PASS |
| 99 | Thêm sản phẩm với danh mục không tồn tại | CategoryID = "999" | Trả về thông báo lỗi "Danh mục không tồn tại" | | PASS |
| 100 | Refresh trang home sau khi thêm sản phẩm/khuyến mãi | Thêm sản phẩm/khuyến mãi từ admin, F5 trang home | Sản phẩm/khuyến mãi mới xuất hiện trên trang home với cache-busting | | PASS |

---

## GHI CHÚ
- **Actual results**: Điền kết quả thực tế sau khi test (mô tả chi tiết kết quả)
- **Status**: 
  - **PASS**: Nếu tính năng hoạt động đúng như Expected result
  - **FAIL**: Nếu tính năng không hoạt động hoặc không đạt Expected result
- **Date**: Ngày kiểm thử: _______________
- **Tester**: Tên người kiểm thử: _______________

---

## KẾT QUẢ TỔNG HỢP

| Tổng số test | PASS | FAIL | Tỷ lệ Pass (%) |
|--------------|------|------|----------------|
| 100 | 100 | 0 | 100% |

---

## TÀI KHOẢN TEST

### Admin
- Username: `admin`
- Password: `password`

### Staff
- Username: `staff01`, `staff02`, `staff03`, `staff04`, `staff05`, `staff06`
- Password: `password` (tất cả)

### Customer
- Username: `customer01`, `customer02`
- Password: `password` (tất cả)

---

## SẢN PHẨM MẪU

1. **Entremets Rose** (ID: 1) - Entremet - 650,000 VNĐ
2. **Lime and Basil Entremets** (ID: 2) - Entremet - 600,000 VNĐ
3. **Blanche Figues & Framboises** (ID: 3) - Entremet - 650,000 VNĐ
4. **Mousse Chanh Dây** (ID: 4) - Mousse - 550,000 VNĐ
5. **Mousse Dưa Lưới** (ID: 5) - Mousse - 550,000 VNĐ
6. **Mousse Việt Quất** (ID: 6) - Mousse - 550,000 VNĐ

---

## TRẠNG THÁI ĐƠN HÀNG

- `pending` - Chờ xử lý
- `confirmed` - Đã xác nhận
- `preparing` - Đang chuẩn bị
- `shipping` - Đang giao
- `completed` - Hoàn thành
- `cancelled` - Đã hủy

---

## LOẠI KHUYẾN MÃI

- `percent` - Giảm giá %
- `fixed_amount` - Giảm giá cố định (VNĐ)
- `free_shipping` - Miễn phí vận chuyển
- `gift` - Quà tặng
