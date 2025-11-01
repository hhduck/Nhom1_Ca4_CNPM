# BÁO CÁO ĐỒ ÁN CÔNG NGHỆ PHẦN MỀM
## Xây dựng Website Bán Bánh Kem Cao Cấp "La Cuisine Ngọt"

---

## MỤC LỤC

1. **LỜI NÓI ĐẦU** ........................................................................... 4

2. **PHÂN CÔNG THÀNH VIÊN TRONG NHÓM** ......................................... 5

3. **DANH MỤC HÌNH ẢNH** ................................................................. 6

4. **DANH MỤC BẢNG** ....................................................................... 7

5. **CHƯƠNG 1. KHẢO SÁT BÀI TOÁN** ...................................................... 8
   1.1. Mô tả yêu cầu bài toán ............................................................ 8
   1.2. Khảo sát bài toán .................................................................. 8
   1.3. Xác định thông tin cơ bản cho nghiệp vụ của bài toán ....................... 9
   1.4. Xây dựng biểu đồ mô tả nghiệp vụ và phân cấp chức năng ................... 10
   1.5. Xây dựng kế hoạch dự án đơn giản ............................................... 11

6. **CHƯƠNG 2. ĐẶC TẢ YÊU CẦU BÀI TOÁN** ........................................... 13
   2.1. Giới thiệu chung ................................................................... 13
   2.2. Biểu đồ use case ................................................................... 14
      2.2.1. Biểu đồ use case tổng quan ................................................. 14
      2.2.2. Biểu đồ use case phân rã mức 2 ............................................ 15
   2.3. Đặc tả use case .................................................................... 16
   2.4. Các yêu cầu phi chức năng ........................................................ 18

7. **CHƯƠNG 3. PHÂN TÍCH YÊU CẦU** ...................................................... 20
   3.1. Xác định các lớp phân tích ........................................................ 20
   3.2. Xây dựng biểu đồ trình tự ......................................................... 20
   3.3. Xây dựng biểu đồ lớp phân tích ................................................... 21
   3.4. Xây dựng biểu đồ thực thể liên kết (ERD) ....................................... 21

8. **CHƯƠNG 4. THIẾT KẾ CHƯƠNG TRÌNH** ................................................. 22
   4.1. Thiết kế kiến trúc .................................................................. 22
   4.2. Thiết kế cơ sở dữ liệu ............................................................. 22
   4.3. Thiết kế chi tiết các gói ........................................................... 24
   4.4. Thiết kế chi tiết lớp ............................................................... 25
   4.5. Sơ đồ lớp chi tiết .................................................................. 26
   4.6. Thiết kế giao diện .................................................................. 26

9. **CHƯƠNG 5. XÂY DỰNG CHƯƠNG TRÌNH MINH HỌA** .................................. 29
   5.1. Thư viện và công cụ sử dụng ...................................................... 29
   5.2. Kết quả chương trình minh họa .................................................... 29
   5.3. Giao diện minh hoạ các chức năng của chương trình ............................ 29

10. **CHƯƠNG 6. KIỂM THỬ CHƯƠNG TRÌNH** .............................................. 33
    6.1. Kiểm thử các chức năng đã thực hiện ........................................... 33
       6.1.1. Kiểm thử cho chức năng 1 ................................................... 33
       6.1.2. Kiểm thử cho chức năng 2 ................................................... 34
       6.1.3. Kiểm thử yêu cầu phi chức năng ............................................. 34

11. **CHƯƠNG 7. HƯỚNG DẪN CÀI ĐẶT VÀ SỬ DỤNG** .................................... 35
    7.1. Hướng dẫn cài đặt ................................................................. 35
    7.2. Đối tượng, phạm vi sử dụng ....................................................... 35
    7.3. Xác định các yêu cầu cài đặt ..................................................... 35
    7.4. Hướng dẫn chi tiết các bước cài đặt ............................................ 35
    7.5. Hướng dẫn sử dụng phần mềm ..................................................... 35

12. **KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN** .................................................. 36

13. **TÀI LIỆU THAM KHẢO** ................................................................ 37

14. **PHỤ LỤC** .............................................................................. 38

---

## LỜI NÓI ĐẦU

Đồ án "Xây dựng Website Bán Bánh Kem Cao Cấp La Cuisine Ngọt" được thực hiện nhằm mục đích nghiên cứu và phát triển một hệ thống thương mại điện tử hoàn chỉnh cho việc bán hàng trực tuyến các sản phẩm bánh kem cao cấp.

Với sự phát triển mạnh mẽ của công nghệ thông tin và thương mại điện tử, việc xây dựng một website bán hàng trực tuyến không chỉ giúp doanh nghiệp mở rộng thị trường mà còn tạo điều kiện thuận lợi cho khách hàng trong việc mua sắm. Đồ án này được phát triển với mục tiêu:

- Tạo ra một hệ thống quản lý và bán hàng trực tuyến hoàn chỉnh với đầy đủ tính năng cần thiết
- Phân quyền rõ ràng cho các vai trò khác nhau: Quản trị viên (Admin), Nhân viên (Staff), và Khách hàng (Customer)
- Xây dựng giao diện thân thiện, dễ sử dụng và responsive trên mọi thiết bị
- Đảm bảo tính bảo mật và hiệu năng của hệ thống
- Cung cấp các công cụ quản lý và báo cáo thống kê chi tiết cho quản trị viên

Đồ án được xây dựng bằng công nghệ web hiện đại: PHP cho backend, HTML/CSS/JavaScript cho frontend, MySQL cho database, và tích hợp các thư viện như Chart.js để tạo biểu đồ tương tác.

Nhóm tác giả xin chân thành cảm ơn giảng viên hướng dẫn đã tận tình chỉ dẫn và hỗ trợ trong suốt quá trình thực hiện đồ án này.

---

## PHÂN CÔNG THÀNH VIÊN TRONG NHÓM

*[Bảng phân công thành viên sẽ được bổ sung sau]*

| STT | Họ và tên | MSSV | Nhiệm vụ | Ghi chú |
|-----|-----------|------|----------|---------|
| 1   |           |      |          |         |
| 2   |           |      |          |         |
| 3   |           |      |          |         |
| 4   |           |      |          |         |

---

## DANH MỤC HÌNH ẢNH

*[Danh mục hình ảnh sẽ được bổ sung sau]*

| STT | Tên hình | Mô tả | Trang |
|-----|----------|-------|-------|
| 1   |          |       |       |
| 2   |          |       |       |

---

## DANH MỤC BẢNG

*[Danh mục bảng sẽ được bổ sung sau]*

| STT | Tên bảng | Mô tả | Trang |
|-----|----------|-------|-------|
| 1   |          |       |       |
| 2   |          |       |       |

---

## CHƯƠNG 1. KHẢO SÁT BÀI TOÁN

### 1.1. Mô tả yêu cầu bài toán

**La Cuisine Ngọt** là một cửa hàng chuyên cung cấp các loại bánh kem cao cấp với nhiều hương vị đa dạng như Entremet, Mousse, và các loại bánh truyền thống. Để mở rộng quy mô kinh doanh và phục vụ khách hàng tốt hơn, doanh nghiệp cần một hệ thống website bán hàng trực tuyến với các yêu cầu chính sau:

**Yêu cầu cho khách hàng:**
- Duyệt và tìm kiếm sản phẩm theo danh mục, giá, tên
- Xem chi tiết sản phẩm với đầy đủ thông tin (mô tả, giá, hình ảnh, thành phần, hướng dẫn sử dụng)
- Quản lý giỏ hàng (thêm, sửa, xóa sản phẩm)
- Đặt hàng với form đầy đủ thông tin giao hàng
- Theo dõi đơn hàng của mình
- Xem các chương trình khuyến mãi hiện có
- Quản lý thông tin cá nhân và đổi mật khẩu

**Yêu cầu cho nhân viên:**
- Xem và quản lý đơn hàng với khả năng cập nhật trạng thái
- Xử lý các yêu cầu liên hệ từ khách hàng
- Xử lý khiếu nại từ khách hàng
- Cập nhật thông tin cá nhân

**Yêu cầu cho quản trị viên:**
- Quản lý sản phẩm (thêm, sửa, xóa sản phẩm)
- Quản lý đơn hàng (xem, cập nhật trạng thái, xóa)
- Quản lý người dùng (thêm, sửa, xóa, khóa/mở khóa tài khoản)
- Quản lý khuyến mãi (tạo, sửa, xóa mã khuyến mãi)
- Xem báo cáo thống kê doanh thu theo tháng/năm với biểu đồ trực quan
- Quản lý khiếu nại và liên hệ

### 1.2. Khảo sát bài toán

**Phân tích thị trường:**

Thị trường bánh kem cao cấp tại Việt Nam đang phát triển mạnh mẽ với nhu cầu ngày càng tăng. Khách hàng không chỉ quan tâm đến chất lượng sản phẩm mà còn yêu cầu về trải nghiệm mua sắm tiện lợi, giao diện đẹp mắt, và dịch vụ chăm sóc khách hàng tốt.

**Nhu cầu của khách hàng:**
- Mua hàng trực tuyến 24/7 mà không cần đến cửa hàng
- Xem chi tiết sản phẩm với hình ảnh và mô tả đầy đủ
- Theo dõi đơn hàng trong suốt quá trình xử lý
- Nhận thông báo về các chương trình khuyến mãi

**Nhu cầu của doanh nghiệp:**
- Quản lý tập trung tất cả hoạt động kinh doanh
- Theo dõi doanh thu và báo cáo thống kê chi tiết
- Quản lý kho hàng và đơn hàng hiệu quả
- Tự động hóa các quy trình nghiệp vụ

**Khảo sát các website tương tự:**

Các website bán bánh online hiện tại thường có:
- Trang chủ với sản phẩm nổi bật
- Trang chi tiết sản phẩm với đầy đủ thông tin
- Chức năng giỏ hàng và thanh toán
- Quản lý đơn hàng cơ bản

Tuy nhiên, nhiều website thiếu:
- Hệ thống báo cáo thống kê chi tiết
- Quản lý khuyến mãi linh hoạt
- Phân quyền rõ ràng cho nhiều vai trò
- Xử lý khiếu nại và liên hệ chuyên nghiệp

**Giải pháp đề xuất:**

Xây dựng một hệ thống website hoàn chỉnh với:
- Giao diện hiện đại, responsive trên mọi thiết bị
- Hệ thống phân quyền 3 cấp (Admin, Staff, Customer)
- Báo cáo thống kê với biểu đồ trực quan
- Quản lý toàn diện từ sản phẩm đến đơn hàng, người dùng
- API RESTful để dễ dàng mở rộng trong tương lai

### 1.3. Xác định thông tin cơ bản cho nghiệp vụ của bài toán

**Các actor trong hệ thống:**

1. **Khách hàng (Customer):** Người mua hàng, sử dụng website để xem sản phẩm, đặt hàng, theo dõi đơn hàng
2. **Nhân viên (Staff):** Quản lý đơn hàng, xử lý liên hệ và khiếu nại từ khách hàng
3. **Quản trị viên (Admin):** Quản lý toàn bộ hệ thống bao gồm sản phẩm, đơn hàng, người dùng, khuyến mãi, báo cáo

**Các đối tượng nghiệp vụ chính:**

1. **Sản phẩm (Product):** Thông tin sản phẩm bao gồm tên, mô tả, giá, hình ảnh, danh mục, số lượng tồn kho, trạng thái (có sẵn, hết hàng, ngừng bán)
2. **Đơn hàng (Order):** Thông tin đơn hàng bao gồm mã đơn, khách hàng, sản phẩm, số lượng, tổng tiền, trạng thái đơn hàng, phương thức thanh toán
3. **Người dùng (User):** Thông tin tài khoản bao gồm username, email, mật khẩu, họ tên, số điện thoại, địa chỉ, vai trò, trạng thái
4. **Khuyến mãi (Promotion):** Mã khuyến mãi với loại (giảm giá cố định, miễn phí vận chuyển), giá trị, thời gian hiệu lực
5. **Giỏ hàng (Cart):** Danh sách sản phẩm khách hàng đã chọn nhưng chưa đặt hàng
6. **Khiếu nại (Complaint):** Yêu cầu xử lý khiếu nại từ khách hàng
7. **Liên hệ (Contact):** Thông tin liên hệ từ khách hàng

**Quy trình nghiệp vụ:**

1. **Quy trình đặt hàng:**
   - Khách hàng duyệt sản phẩm → Thêm vào giỏ hàng → Xác nhận đơn hàng → Thanh toán → Đơn hàng chuyển sang trạng thái "Chờ xử lý"
   - Nhân viên/Admin nhận đơn → Chuyển trạng thái "Đã nhận đơn" → "Đang chuẩn bị" → "Đang giao" → "Giao hàng thành công" hoặc "Giao hàng thất bại"

2. **Quy trình quản lý sản phẩm:**
   - Admin thêm/sửa/xóa sản phẩm → Cập nhật database → Sản phẩm hiển thị trên trang chủ

3. **Quy trình báo cáo:**
   - Admin chọn tháng/năm → Hệ thống tính toán doanh thu, số đơn hàng → Hiển thị biểu đồ và bảng thống kê

### 1.4. Xây dựng biểu đồ mô tả nghiệp vụ và phân cấp chức năng

*[Biểu đồ mô tả nghiệp vụ sẽ được bổ sung sau]*

**Mô tả phân cấp chức năng:**

Hệ thống được chia thành các module chính:

**1. Module Khách hàng:**
- Duyệt sản phẩm và tìm kiếm
- Quản lý giỏ hàng
- Đặt hàng
- Theo dõi đơn hàng
- Quản lý tài khoản

**2. Module Nhân viên:**
- Quản lý đơn hàng
- Xử lý liên hệ
- Xử lý khiếu nại
- Quản lý hồ sơ nhân viên

**3. Module Quản trị viên:**
- Quản lý sản phẩm (CRUD)
- Quản lý đơn hàng (xem, cập nhật, xóa)
- Quản lý người dùng (CRUD, khóa/mở khóa)
- Quản lý khuyến mãi (CRUD)
- Báo cáo thống kê (doanh thu, sản phẩm bán chạy)
- Quản lý khiếu nại và liên hệ

### 1.5. Xây dựng kế hoạch dự án đơn giản

**Giai đoạn 1: Khảo sát và phân tích (Tuần 1-2)**
- Khảo sát yêu cầu bài toán
- Phân tích nghiệp vụ
- Xác định các actor và use case
- Thiết kế database schema

**Giai đoạn 2: Thiết kế (Tuần 3-4)**
- Thiết kế kiến trúc hệ thống
- Thiết kế database chi tiết
- Thiết kế giao diện người dùng
- Xây dựng ERD và các biểu đồ phân tích

**Giai đoạn 3: Xây dựng Backend (Tuần 5-7)**
- Xây dựng database với các bảng và dữ liệu mẫu
- Phát triển API RESTful cho các chức năng
- Xây dựng middleware xác thực và phân quyền
- Xử lý logic nghiệp vụ

**Giai đoạn 4: Xây dựng Frontend (Tuần 8-10)**
- Xây dựng giao diện trang chủ
- Xây dựng trang quản trị Admin
- Xây dựng trang quản lý đơn hàng cho Staff
- Xây dựng trang tài khoản khách hàng
- Tích hợp Chart.js cho báo cáo

**Giai đoạn 5: Kiểm thử và hoàn thiện (Tuần 11-12)**
- Kiểm thử các chức năng đã xây dựng
- Sửa lỗi và tối ưu hóa
- Hoàn thiện tài liệu
- Chuẩn bị báo cáo

---

## CHƯƠNG 2. ĐẶC TẢ YÊU CẦU BÀI TOÁN

### 2.1. Giới thiệu chung

**La Cuisine Ngọt** là website bán bánh kem cao cấp được phát triển với mục tiêu cung cấp một nền tảng thương mại điện tử hoàn chỉnh cho việc quản lý và bán hàng trực tuyến.

**Đối tượng sử dụng:**

1. **Khách hàng:** Người mua hàng sử dụng website để xem sản phẩm, đặt hàng, theo dõi đơn hàng của mình
2. **Nhân viên:** Nhân viên cửa hàng quản lý đơn hàng, xử lý yêu cầu từ khách hàng
3. **Quản trị viên:** Quản lý toàn bộ hệ thống bao gồm sản phẩm, đơn hàng, người dùng, khuyến mãi và xem báo cáo thống kê

**Phạm vi hệ thống:**

- Quản lý sản phẩm với đầy đủ thông tin (tên, mô tả, giá, hình ảnh, danh mục)
- Quản lý đơn hàng với các trạng thái: Chờ xử lý, Đã nhận đơn, Đang chuẩn bị, Đang giao, Giao hàng thành công, Giao hàng thất bại
- Quản lý người dùng với 3 vai trò: Admin, Staff, Customer
- Quản lý khuyến mãi với nhiều loại: Giảm giá cố định, Miễn phí vận chuyển
- Báo cáo thống kê doanh thu theo tháng/năm với biểu đồ trực quan
- Xử lý khiếu nại và liên hệ từ khách hàng

### 2.2. Biểu đồ use case

#### 2.2.1. Biểu đồ use case tổng quan

*[Biểu đồ use case tổng quan sẽ được bổ sung sau]*

**Mô tả:**

Biểu đồ use case tổng quan thể hiện 3 actor chính và các use case tương ứng:

**Actor: Khách hàng (Customer)**
- Đăng nhập/Đăng ký
- Duyệt sản phẩm
- Tìm kiếm sản phẩm
- Xem chi tiết sản phẩm
- Quản lý giỏ hàng
- Đặt hàng
- Theo dõi đơn hàng
- Xem khuyến mãi
- Quản lý tài khoản
- Đổi mật khẩu

**Actor: Nhân viên (Staff)**
- Đăng nhập
- Xem đơn hàng
- Cập nhật trạng thái đơn hàng
- Xử lý liên hệ
- Xử lý khiếu nại
- Quản lý hồ sơ nhân viên

**Actor: Quản trị viên (Admin)**
- Đăng nhập
- Quản lý sản phẩm (CRUD)
- Quản lý đơn hàng (xem, cập nhật, xóa)
- Quản lý người dùng (CRUD, khóa/mở khóa)
- Quản lý khuyến mãi (CRUD)
- Xem báo cáo thống kê
- Quản lý khiếu nại
- Quản lý liên hệ

#### 2.2.2. Biểu đồ use case phân rã mức 2

*[Biểu đồ use case phân rã mức 2 sẽ được bổ sung sau]*

**Mô tả:**

Các use case quan trọng được phân rã chi tiết:

**UC01: Quản lý đơn hàng (Admin/Staff)**
- Xem danh sách đơn hàng
- Lọc đơn hàng theo trạng thái
- Cập nhật trạng thái đơn hàng
- Xem chi tiết đơn hàng
- Xóa đơn hàng (chỉ Admin)

**UC02: Báo cáo thống kê (Admin)**
- Xem KPI tổng quan (doanh thu, số đơn hàng, số khách hàng)
- Xem biểu đồ doanh thu theo tháng
- Xem biểu đồ phân bổ doanh thu theo sản phẩm
- Xem bảng chi tiết doanh thu theo sản phẩm
- Lọc báo cáo theo tháng/năm

### 2.3. Đặc tả use case

**Bảng 2.1: Đặc tả Use Case - Đăng nhập**

| Thông tin | Mô tả |
|-----------|-------|
| Tên Use Case | UC01: Đăng nhập |
| Actor | Customer, Staff, Admin |
| Mô tả | Người dùng đăng nhập vào hệ thống bằng username và password |
| Tiền điều kiện | Người dùng chưa đăng nhập |
| Luồng sự kiện chính | 1. Người dùng nhập username và password<br>2. Hệ thống kiểm tra thông tin đăng nhập<br>3. Hệ thống kiểm tra trạng thái tài khoản (phải là 'active')<br>4. Hệ thống tạo JWT token và trả về<br>5. Lưu token vào localStorage<br>6. Chuyển hướng đến trang tương ứng |
| Luồng thay thế | 3a. Tài khoản không tồn tại hoặc sai mật khẩu → Hiển thị thông báo lỗi<br>3b. Tài khoản bị khóa (status = 'banned') → Từ chối đăng nhập |
| Hậu điều kiện | Người dùng đã đăng nhập thành công |

**Bảng 2.2: Đặc tả Use Case - Đặt hàng**

| Thông tin | Mô tả |
|-----------|-------|
| Tên Use Case | UC02: Đặt hàng |
| Actor | Customer |
| Mô tả | Khách hàng đặt hàng các sản phẩm đã thêm vào giỏ hàng |
| Tiền điều kiện | Khách hàng đã đăng nhập và có sản phẩm trong giỏ hàng |
| Luồng sự kiện chính | 1. Khách hàng vào trang giỏ hàng<br>2. Kiểm tra và điều chỉnh số lượng sản phẩm<br>3. Nhập thông tin giao hàng<br>4. Chọn mã khuyến mãi (nếu có)<br>5. Xác nhận đơn hàng<br>6. Chọn phương thức thanh toán (VNPay)<br>7. Hệ thống tạo đơn hàng với trạng thái "Chờ xử lý"<br>8. Hiển thị trang xác nhận đơn hàng |
| Luồng thay thế | 2a. Sản phẩm hết hàng → Cập nhật số lượng hoặc xóa khỏi giỏ<br>4a. Mã khuyến mãi không hợp lệ → Hiển thị thông báo lỗi |
| Hậu điều kiện | Đơn hàng được tạo thành công |

**Bảng 2.3: Đặc tả Use Case - Quản lý đơn hàng (Admin/Staff)**

| Thông tin | Mô tả |
|-----------|-------|
| Tên Use Case | UC03: Quản lý đơn hàng |
| Actor | Admin, Staff |
| Mô tả | Admin/Staff xem và cập nhật trạng thái đơn hàng |
| Tiền điều kiện | Đã đăng nhập với vai trò Admin hoặc Staff |
| Luồng sự kiện chính | 1. Vào trang quản lý đơn hàng<br>2. Xem danh sách đơn hàng<br>3. Lọc đơn hàng theo trạng thái (nếu cần)<br>4. Chọn đơn hàng cần cập nhật<br>5. Cập nhật trạng thái đơn hàng<br>6. Hệ thống lưu trạng thái mới và ghi nhận lịch sử thay đổi |
| Luồng thay thế | 5a. Trạng thái không hợp lệ → Hiển thị thông báo lỗi |
| Hậu điều kiện | Trạng thái đơn hàng được cập nhật thành công |

**Bảng 2.4: Đặc tả Use Case - Xem báo cáo thống kê (Admin)**

| Thông tin | Mô tả |
|-----------|-------|
| Tên Use Case | UC04: Xem báo cáo thống kê |
| Actor | Admin |
| Mô tả | Admin xem báo cáo doanh thu và thống kê sản phẩm |
| Tiền điều kiện | Đã đăng nhập với vai trò Admin |
| Luồng sự kiện chính | 1. Vào trang báo cáo<br>2. Chọn năm và tháng (hoặc "Tất cả" tháng)<br>3. Hệ thống tính toán doanh thu, số đơn hàng, số khách hàng<br>4. Hiển thị KPI tổng quan<br>5. Hiển thị biểu đồ cột doanh thu theo tháng<br>6. Hiển thị biểu đồ tròn phân bổ doanh thu theo sản phẩm<br>7. Hiển thị bảng chi tiết doanh thu theo sản phẩm |
| Luồng thay thế | 2a. Chọn tháng tương lai → Hiển thị thông báo "Không có dữ liệu"<br>2b. Chọn "Tất cả" tháng → Bảng chi tiết để trống |
| Hậu điều kiện | Báo cáo được hiển thị đầy đủ và chính xác |

### 2.4. Các yêu cầu phi chức năng

**Yêu cầu về bảo mật:**
- Hệ thống sử dụng JWT token cho xác thực người dùng
- Mật khẩu được hash bằng bcrypt (`PASSWORD_DEFAULT`)
- Sử dụng prepared statements (PDO) để ngăn chặn SQL injection
- Input được sanitize để ngăn chặn XSS attacks
- Tài khoản bị khóa (banned) không thể đăng nhập
- Client-side check tự động đăng xuất nếu tài khoản bị khóa khi đang sử dụng
- Phân quyền rõ ràng: Admin có quyền cao nhất, Staff quản lý đơn hàng, Customer chỉ xem/đặt hàng

**Yêu cầu về hiệu năng:**
- Trang web responsive trên mọi thiết bị (mobile, tablet, desktop)
- Tối ưu hóa hình ảnh và tài nguyên
- Sử dụng cache headers để quản lý cache phía client
- Database indexes để tăng tốc truy vấn

**Yêu cầu về khả năng mở rộng:**
- Kiến trúc RESTful API cho phép dễ dàng mở rộng
- Tách biệt frontend và backend
- Database được thiết kế với foreign keys và indexes
- Code được tổ chức theo module rõ ràng

**Yêu cầu về giao diện:**
- Giao diện hiện đại, thân thiện với người dùng
- Sử dụng Google Fonts và Font Awesome icons
- Màu sắc và layout nhất quán trên toàn bộ website
- Loading states để cung cấp feedback cho người dùng

**Yêu cầu về độ tin cậy:**
- Error handling toàn diện với logging
- Transaction support cho các thao tác quan trọng (xóa đơn hàng, cập nhật số lượng)
- Validation đầu vào ở cả client và server side

---

## CHƯƠNG 3. PHÂN TÍCH YÊU CẦU

### 3.1. Xác định các lớp phân tích

Hệ thống được phân tích thành các lớp chính:

**1. Lớp User (Người dùng)**
- Thuộc tính: UserID, Username, Email, PasswordHash, FullName, Phone, Address, Role, Status
- Phương thức: authenticate(), updateProfile(), changePassword()

**2. Lớp Product (Sản phẩm)**
- Thuộc tính: ProductID, ProductName, CategoryID, Description, Price, Quantity, Status, ImageURL
- Phương thức: create(), update(), delete(), getById(), search()

**3. Lớp Order (Đơn hàng)**
- Thuộc tính: OrderID, OrderCode, CustomerID, TotalAmount, FinalAmount, OrderStatus, PaymentMethod
- Phương thức: create(), updateStatus(), delete(), getByCustomer()

**4. Lớp OrderItem (Chi tiết đơn hàng)**
- Thuộc tính: OrderItemID, OrderID, ProductID, Quantity, Subtotal
- Phương thức: add(), remove(), update()

**5. Lớp Cart (Giỏ hàng)**
- Thuộc tính: CartID, UserID, ProductID, Quantity
- Phương thức: add(), update(), remove(), clear()

**6. Lớp Promotion (Khuyến mãi)**
- Thuộc tính: PromotionID, PromotionCode, PromotionType, DiscountValue, StartDate, EndDate
- Phương thức: validate(), apply()

**7. Lớp Complaint (Khiếu nại)**
- Thuộc tính: ComplaintID, OrderID, CustomerID, Title, Content, Status
- Phương thức: create(), updateStatus(), reply()

**8. Lớp Contact (Liên hệ)**
- Thuộc tính: ContactID, Name, Email, Subject, Message, Status
- Phương thức: create(), updateStatus()

**9. Lớp Report (Báo cáo)**
- Phương thức: getRevenueStats(), getProductStats(), getOrderStats()

### 3.2. Xây dựng biểu đồ trình tự

*[Biểu đồ trình tự sẽ được bổ sung sau]*

**Mô tả quy trình đặt hàng:**

1. Customer gửi request xem giỏ hàng
2. Frontend gọi API GET /api/cart.php
3. Backend lấy dữ liệu từ Cart table
4. Backend trả về danh sách sản phẩm trong giỏ
5. Customer điền form đặt hàng
6. Customer xác nhận đặt hàng
7. Frontend gọi API POST /api/orders.php
8. Backend validate thông tin
9. Backend tạo Order trong database (status = 'pending')
10. Backend tạo OrderItems từ Cart
11. Backend xóa Cart
12. Backend trả về OrderID
13. Frontend chuyển hướng đến trang xác nhận đơn hàng

**Mô tả quy trình cập nhật trạng thái đơn hàng:**

1. Staff/Admin chọn đơn hàng cần cập nhật
2. Staff/Admin chọn trạng thái mới
3. Frontend gọi API PUT /api/orders.php/{id}
4. Backend kiểm tra quyền (requireStaff hoặc checkAdminPermission)
5. Backend validate trạng thái mới
6. Backend cập nhật OrderStatus trong database
7. Backend ghi nhận vào OrderStatusHistory
8. Nếu trạng thái = 'delivery_successful': Cập nhật SoldCount cho Products
9. Backend trả về kết quả
10. Frontend cập nhật UI

### 3.3. Xây dựng biểu đồ lớp phân tích

*[Biểu đồ lớp phân tích sẽ được bổ sung sau]*

**Mối quan hệ giữa các lớp:**

- **User** có quan hệ 1-n với **Order** (một user có thể có nhiều đơn hàng)
- **Order** có quan hệ 1-n với **OrderItem** (một đơn hàng có nhiều sản phẩm)
- **OrderItem** có quan hệ n-1 với **Product** (nhiều OrderItem tham chiếu đến một Product)
- **User** có quan hệ 1-n với **Cart** (một user có một giỏ hàng với nhiều sản phẩm)
- **Cart** có quan hệ n-1 với **Product**
- **User** có quan hệ 1-n với **Complaint** (một user có thể có nhiều khiếu nại)
- **Complaint** có quan hệ n-1 với **Order**
- **Promotion** được sử dụng trong **Order** (một đơn hàng có thể có một mã khuyến mãi)

### 3.4. Xây dựng biểu đồ thực thể liên kết (ERD)

*[Biểu đồ ERD sẽ được bổ sung sau]*

**Mô tả cơ sở dữ liệu:**

Hệ thống có 15 bảng chính:

1. **Users** - Quản lý người dùng (Admin, Staff, Customer)
   - Khóa chính: UserID
   - Quan hệ: 1-n với Orders, Cart, Complaints, Contacts

2. **Categories** - Danh mục sản phẩm
   - Khóa chính: CategoryID
   - Quan hệ: 1-n với Products (self-referencing với ParentID)

3. **Products** - Sản phẩm
   - Khóa chính: ProductID
   - Khóa ngoại: CategoryID → Categories
   - Quan hệ: 1-n với OrderItems, Cart, ProductImages, Reviews

4. **ProductImages** - Hình ảnh sản phẩm
   - Khóa chính: ImageID
   - Khóa ngoại: ProductID → Products

5. **Orders** - Đơn hàng
   - Khóa chính: OrderID
   - Khóa ngoại: CustomerID → Users, StaffID → Users
   - Quan hệ: 1-n với OrderItems, OrderStatusHistory, Complaints

6. **OrderItems** - Chi tiết đơn hàng
   - Khóa chính: OrderItemID
   - Khóa ngoại: OrderID → Orders, ProductID → Products

7. **OrderStatusHistory** - Lịch sử thay đổi trạng thái đơn hàng
   - Khóa chính: HistoryID
   - Khóa ngoại: OrderID → Orders, ChangedBy → Users

8. **Promotions** - Khuyến mãi
   - Khóa chính: PromotionID
   - Quan hệ: 1-n với PromotionUsage

9. **PromotionUsage** - Lịch sử sử dụng khuyến mãi
   - Khóa chính: UsageID
   - Khóa ngoại: OrderID → Orders, PromotionID → Promotions

10. **Cart** - Giỏ hàng
    - Khóa chính: CartID
    - Khóa ngoại: UserID → Users, ProductID → Products

11. **Wishlist** - Danh sách yêu thích
    - Khóa chính: WishlistID
    - Khóa ngoại: UserID → Users, ProductID → Products

12. **Complaints** - Khiếu nại
    - Khóa chính: ComplaintID
    - Khóa ngoại: OrderID → Orders, CustomerID → Users, AssignedTo → Users

13. **ComplaintResponses** - Phản hồi khiếu nại
    - Khóa chính: ResponseID
    - Khóa ngoại: ComplaintID → Complaints, UserID → Users

14. **Reviews** - Đánh giá sản phẩm
    - Khóa chính: ReviewID
    - Khóa ngoại: ProductID → Products, UserID → Users, OrderID → Orders

15. **Contacts** - Liên hệ
    - Khóa chính: ContactID
    - Quan hệ: n-1 với Users (nếu user đã đăng nhập)

**Các ràng buộc:**
- Foreign keys với ON DELETE CASCADE cho OrderItems, OrderStatusHistory
- UNIQUE constraints cho Username, Email, OrderCode, PromotionCode
- CHECK constraints cho Rating (1-5), OrderStatus, PaymentStatus
- Indexes trên các trường thường xuyên query: Email, Role, CategoryID, OrderStatus, CreatedAt

---

## CHƯƠNG 4. THIẾT KẾ CHƯƠNG TRÌNH

### 4.1. Thiết kế kiến trúc

Hệ thống được thiết kế theo mô hình kiến trúc 3 lớp (3-tier architecture):

**Lớp 1: Presentation Layer (Frontend)**
- **Công nghệ:** HTML5, CSS3, JavaScript (ES6+)
- **Thư viện:** Chart.js 3.9.1 (biểu đồ), Font Awesome 6.x (icons), Google Fonts (typography)
- **Chức năng:**
  - Hiển thị giao diện người dùng
  - Xử lý tương tác người dùng
  - Gọi API để lấy/dữ liệu
  - Xử lý client-side validation
  - Quản lý authentication state (JWT token trong localStorage)

**Lớp 2: Business Logic Layer (Backend API)**
- **Công nghệ:** PHP 7.4+, PDO (Prepared Statements)
- **Kiến trúc:** RESTful API
- **Chức năng:**
  - Xử lý logic nghiệp vụ
  - Xác thực và phân quyền (JWT, middleware)
  - Validate đầu vào
  - Giao tiếp với database
  - Trả về JSON responses

**Lớp 3: Data Layer (Database)**
- **Công nghệ:** MySQL 5.7+ / MariaDB
- **Chức năng:**
  - Lưu trữ dữ liệu
  - Đảm bảo tính toàn vẹn dữ liệu (Foreign Keys, Constraints)
  - Tối ưu truy vấn (Indexes)

**Luồng hoạt động:**
1. User tương tác với Frontend (HTML/JS)
2. Frontend gửi HTTP request đến Backend API (PHP)
3. Backend xử lý logic và truy vấn Database (MySQL)
4. Database trả về dữ liệu cho Backend
5. Backend xử lý và format JSON response
6. Frontend nhận response và cập nhật UI

### 4.2. Thiết kế cơ sở dữ liệu

**Database: `lacuisinengot`**
- Character set: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`

**Bảng 4.1: Cấu trúc bảng Users**

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| UserID | INT | PRIMARY KEY, AUTO_INCREMENT | ID người dùng |
| Username | VARCHAR(50) | UNIQUE, NOT NULL | Tên đăng nhập |
| Email | VARCHAR(100) | UNIQUE, NOT NULL | Email |
| PasswordHash | VARCHAR(255) | NOT NULL | Mật khẩu đã hash |
| FullName | VARCHAR(100) | NOT NULL | Họ và tên |
| Phone | VARCHAR(20) | NULL | Số điện thoại |
| Address | VARCHAR(255) | NULL | Địa chỉ |
| Role | ENUM | DEFAULT 'customer' | Vai trò: customer, staff, admin |
| Status | ENUM | DEFAULT 'active' | Trạng thái: active, inactive, banned |
| CreatedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| UpdatedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Ngày cập nhật |

**Bảng 4.2: Cấu trúc bảng Products**

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| ProductID | INT | PRIMARY KEY, AUTO_INCREMENT | ID sản phẩm |
| ProductName | VARCHAR(200) | NOT NULL | Tên sản phẩm |
| CategoryID | INT | FOREIGN KEY → Categories | ID danh mục |
| Description | TEXT | NULL | Mô tả chi tiết |
| Price | DECIMAL(10,2) | NOT NULL | Giá bán |
| OriginalPrice | DECIMAL(10,2) | NULL | Giá gốc (để hiển thị giảm giá) |
| Quantity | INT | DEFAULT 0 | Số lượng tồn kho |
| Status | ENUM | DEFAULT 'available' | Trạng thái: available, out_of_stock, discontinued |
| ImageURL | VARCHAR(255) | NULL | Đường dẫn ảnh |
| CreatedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| UpdatedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Ngày cập nhật |

**Bảng 4.3: Cấu trúc bảng Orders**

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| OrderID | INT | PRIMARY KEY, AUTO_INCREMENT | ID đơn hàng |
| OrderCode | VARCHAR(20) | UNIQUE, NOT NULL | Mã đơn hàng |
| CustomerID | INT | FOREIGN KEY → Users, NOT NULL | ID khách hàng |
| TotalAmount | DECIMAL(12,2) | NOT NULL | Tổng tiền |
| DiscountAmount | DECIMAL(10,2) | DEFAULT 0 | Số tiền giảm |
| ShippingFee | DECIMAL(10,2) | DEFAULT 0 | Phí vận chuyển |
| FinalAmount | DECIMAL(12,2) | NOT NULL | Tổng tiền cuối cùng |
| PaymentMethod | ENUM | DEFAULT 'vnpay' | Phương thức thanh toán: vnpay |
| PaymentStatus | ENUM | DEFAULT 'paid' | Trạng thái thanh toán: pending, paid, failed, refunded |
| OrderStatus | ENUM | DEFAULT 'pending' | Trạng thái đơn hàng: pending, order_received, preparing, delivering, delivery_successful, delivery_failed |
| ShippingAddress | VARCHAR(255) | NOT NULL | Địa chỉ giao hàng |
| CreatedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| UpdatedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Ngày cập nhật |

**Bảng 4.4: Cấu trúc bảng OrderItems**

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| OrderItemID | INT | PRIMARY KEY, AUTO_INCREMENT | ID chi tiết đơn hàng |
| OrderID | INT | FOREIGN KEY → Orders, NOT NULL | ID đơn hàng |
| ProductID | INT | FOREIGN KEY → Products, NOT NULL | ID sản phẩm |
| Quantity | INT | NOT NULL | Số lượng |
| Subtotal | DECIMAL(12,2) | NOT NULL | Thành tiền |

**Bảng 4.5: Cấu trúc bảng Promotions**

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| PromotionID | INT | PRIMARY KEY, AUTO_INCREMENT | ID khuyến mãi |
| PromotionCode | VARCHAR(50) | UNIQUE, NOT NULL | Mã khuyến mãi |
| PromotionName | VARCHAR(200) | NOT NULL | Tên khuyến mãi |
| PromotionType | ENUM | NOT NULL | Loại: fixed_amount, free_shipping |
| DiscountValue | DECIMAL(10,2) | NULL | Giá trị giảm (cho fixed_amount) |
| MinOrderValue | DECIMAL(10,2) | NULL | Giá trị đơn hàng tối thiểu |
| StartDate | TIMESTAMP | NOT NULL | Ngày bắt đầu |
| EndDate | TIMESTAMP | NOT NULL | Ngày kết thúc |
| Status | ENUM | DEFAULT 'pending' | Trạng thái: pending, active, expired, cancelled |
| ImageURL | VARCHAR(255) | NULL | Đường dẫn ảnh khuyến mãi |

**Indexes quan trọng:**
- `IX_Users_Email` trên `Users(Email)` - Tăng tốc tìm kiếm user theo email
- `IX_Users_Role` trên `Users(Role)` - Tăng tốc lọc user theo role
- `IX_Products_CategoryID` trên `Products(CategoryID)` - Tăng tốc lọc sản phẩm theo danh mục
- `IX_Orders_CustomerID` trên `Orders(CustomerID)` - Tăng tốc tìm đơn hàng của khách hàng
- `IX_Orders_Status` trên `Orders(OrderStatus)` - Tăng tốc lọc đơn hàng theo trạng thái
- `IX_Orders_CreatedAt` trên `Orders(CreatedAt)` - Tăng tốc truy vấn báo cáo theo thời gian

### 4.3. Thiết kế chi tiết các gói

**Cấu trúc thư mục dự án:**

```
Nhom1_Ca4_CNPM/
├── admin/                      # Module quản trị viên
│   ├── admin.html             # Giao diện admin dashboard
│   ├── admin.css              # Style cho admin
│   └── admin.js               # Logic quản lý: sản phẩm, đơn hàng, người dùng, khuyến mãi, báo cáo
│
├── api/                        # Backend API
│   ├── auth/                   # Module xác thực
│   │   ├── login.php          # API đăng nhập
│   │   ├── register.php       # API đăng ký
│   │   ├── forgot-password.php # API quên mật khẩu
│   │   └── middleware.php     # Middleware xác thực và phân quyền
│   ├── config/
│   │   └── database.php       # Kết nối database và helper functions
│   ├── products.php           # API CRUD sản phẩm
│   ├── orders.php             # API CRUD đơn hàng
│   ├── users.php              # API CRUD người dùng, đổi mật khẩu
│   ├── promotions.php         # API CRUD khuyến mãi
│   ├── cart.php               # API giỏ hàng
│   ├── categories.php         # API danh mục
│   ├── reports.php            # API báo cáo thống kê
│   ├── complaints.php         # API khiếu nại
│   ├── contacts.php           # API liên hệ
│   └── reviews.php            # API đánh giá
│
├── pages/                      # Module khách hàng
│   ├── home/                  # Trang chủ
│   ├── product/               # Chi tiết sản phẩm
│   ├── cart/                  # Giỏ hàng
│   ├── checkout/              # Thanh toán
│   ├── login/                 # Đăng nhập
│   ├── register/              # Đăng ký
│   └── account/               # Tài khoản khách hàng
│
├── staff/                      # Module nhân viên
│   ├── ViewOders/             # Xem và quản lý đơn hàng
│   ├── handleComplaint/        # Xử lý khiếu nại
│   ├── handleContact/         # Xử lý liên hệ
│   └── staffProfile/          # Hồ sơ nhân viên
│
├── assets/                     # Tài nguyên tĩnh
│   ├── css/                   # Stylesheet chung
│   ├── js/                    # JavaScript chung (main.js, auth-check.js)
│   └── images/                # Hình ảnh sản phẩm, khuyến mãi
│
└── database/
    └── schema.sql             # Script tạo database và dữ liệu mẫu
```

**Mô tả các gói:**

**Gói `admin/`:** Chứa code cho admin dashboard, bao gồm quản lý sản phẩm, đơn hàng, người dùng, khuyến mãi và xem báo cáo với biểu đồ tương tác.

**Gói `api/`:** Chứa tất cả các API endpoints, được tổ chức theo chức năng. Mỗi file PHP xử lý một resource cụ thể (products, orders, users, ...).

**Gói `pages/`:** Chứa các trang frontend cho khách hàng, mỗi trang có HTML, CSS và JS riêng.

**Gói `staff/`:** Chứa các trang quản lý cho nhân viên, tập trung vào xử lý đơn hàng và yêu cầu từ khách hàng.

**Gói `assets/`:** Chứa các tài nguyên dùng chung như CSS, JavaScript, hình ảnh.

### 4.4. Thiết kế chi tiết lớp

**Lớp Database (api/config/database.php):**
- **Phương thức:**
  - `getConnection()`: Tạo kết nối PDO đến MySQL database
  - `closeConnection()`: Đóng kết nối

**Lớp Middleware (api/auth/middleware.php):**
- **Phương thức:**
  - `getBearerToken()`: Lấy JWT token từ Authorization header
  - `validateToken($token)`: Validate JWT token và trả về user info
  - `requireAuth()`: Yêu cầu người dùng đã đăng nhập
  - `requireStaff()`: Yêu cầu role là Staff hoặc Admin
  - `checkAdminPermission()`: Chỉ Admin được truy cập
  - `requireOwnerOrAdmin($userId)`: Owner của resource hoặc Admin

**Lớp Products API (api/products.php):**
- **Phương thức:**
  - `getAllProducts($db, $params)`: Lấy danh sách sản phẩm (có filter/search)
  - `getProductById($db, $id)`: Lấy chi tiết sản phẩm
  - `createProduct($db, $data)`: Tạo sản phẩm mới (Admin)
  - `updateProduct($db, $id, $data)`: Cập nhật sản phẩm (Admin)
  - `deleteProduct($db, $id)`: Xóa sản phẩm (Admin)

**Lớp Orders API (api/orders.php):**
- **Phương thức:**
  - `getAllOrders($db, $customerId)`: Lấy danh sách đơn hàng (có thể filter theo customer)
  - `getOrderById($db, $id)`: Lấy chi tiết đơn hàng
  - `createOrder($db, $data)`: Tạo đơn hàng mới
  - `updateOrder($db, $id, $data)`: Cập nhật đơn hàng (trạng thái, thông tin) (Staff/Admin)
  - `deleteOrder($db, $id)`: Xóa đơn hàng và các record liên quan (Admin)

**Lớp Reports API (api/reports.php):**
- **Phương thức:**
  - `getReports($db, $params)`: Lấy dữ liệu báo cáo theo tháng/năm
  - Tính toán: KPI (doanh thu, số đơn hàng, số khách hàng), biểu đồ doanh thu theo tháng, phân bổ doanh thu theo sản phẩm

**Lớp Users API (api/users.php):**
- **Phương thức:**
  - `getAllUsers($db, $params)`: Lấy danh sách users (Admin)
  - `getUserById($db, $id)`: Lấy chi tiết user (Owner/Admin)
  - `createUser($db, $data)`: Tạo user mới (Admin)
  - `updateUser($db, $id, $data)`: Cập nhật user (Owner có thể cập nhật thông tin cá nhân, Admin có thể cập nhật tất cả)
  - `deleteUser($db, $id)`: Xóa user (Admin, không cho xóa admin chính)
  - `changePassword($db, $userId, $oldPassword, $newPassword)`: Đổi mật khẩu (Owner/Admin)

### 4.5. Sơ đồ lớp chi tiết

*[Sơ đồ lớp chi tiết sẽ được bổ sung sau]*

**Mô tả mối quan hệ giữa các lớp:**

- **Database** được sử dụng bởi tất cả các API classes
- **Middleware** được gọi bởi tất cả API endpoints để kiểm tra quyền truy cập
- **Products API** tương tác với bảng Products và Categories
- **Orders API** tương tác với bảng Orders, OrderItems, OrderStatusHistory
- **Users API** tương tác với bảng Users
- **Reports API** truy vấn từ nhiều bảng để tính toán thống kê
- Tất cả API classes sử dụng **Database** để kết nối và thực hiện truy vấn

### 4.6. Thiết kế giao diện

**Nguyên tắc thiết kế:**
- Giao diện hiện đại, tối giản, dễ sử dụng
- Responsive design cho mọi thiết bị (mobile, tablet, desktop)
- Màu sắc nhất quán: Nâu (#8B4513) cho header/footer, trắng cho nội dung
- Typography: Sử dụng Google Fonts (Inter, Inspiration, Crimson Text, Dancing Script)

**Trang chủ (pages/home/home.html):**
- Header: Logo, menu navigation, icon tìm kiếm, icon giỏ hàng, icon user
- Banner: Hiển thị khuyến mãi nổi bật
- Danh sách sản phẩm: Grid layout với cards, hiển thị hình ảnh, tên, giá
- Filter: Lọc theo danh mục (Entremet, Mousse, Truyền thống, Phụ kiện)
- Footer: Thông tin liên hệ, link mạng xã hội

**Trang chi tiết sản phẩm (pages/product/product.html):**
- Hình ảnh sản phẩm lớn
- Tên, giá, mô tả ngắn
- Thông tin chi tiết: Cấu trúc, hướng dẫn sử dụng, quà tặng (ẩn nếu là "Phụ kiện")
- Nút "Thêm vào giỏ hàng"
- Form chọn số lượng

**Trang quản trị Admin (admin/admin.html):**
- Sidebar navigation: Dashboard, Sản phẩm, Đơn hàng, Người dùng, Khuyến mãi, Báo cáo, Khiếu nại, Liên hệ
- Dashboard: KPI cards (Doanh thu, Tổng đơn hàng, Đã giao, Khách hàng mới)
- Báo cáo: 
  - Dropdown chọn năm và tháng
  - Biểu đồ cột: Doanh thu theo tháng (Chart.js)
  - Biểu đồ tròn: Phân bổ doanh thu theo sản phẩm (Chart.js)
  - Bảng chi tiết: Doanh thu theo sản phẩm với dòng TỔNG CỘNG
- Modal forms cho CRUD operations

**Trang quản lý đơn hàng Staff (staff/ViewOders/order.html):**
- Filter checkboxes: Lọc theo trạng thái đơn hàng
- Danh sách đơn hàng: Cards hoặc bảng với đầy đủ thông tin
- Nút cập nhật trạng thái cho mỗi đơn hàng
- Modal để xem chi tiết đơn hàng

**Responsive Breakpoints:**
- Mobile: 320px - 480px
- Tablet: 481px - 768px
- Desktop: 769px - 1024px
- Large Desktop: 1025px+

---

## CHƯƠNG 5. XÂY DỰNG CHƯƠNG TRÌNH MINH HỌA

### 5.1. Thư viện và công cụ sử dụng

**Frontend:**
- **HTML5**: Cấu trúc semantic, sử dụng các thẻ `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- **CSS3**: 
  - Flexbox và Grid Layout cho responsive design
  - CSS Animations cho hiệu ứng chuyển động
  - CSS Variables cho quản lý màu sắc nhất quán
- **JavaScript (ES6+)**:
  - Arrow functions, Destructuring, Template literals
  - Fetch API cho HTTP requests
  - LocalStorage để lưu JWT token và user info
  - Async/Await cho xử lý bất đồng bộ
- **Chart.js 3.9.1**: Thư viện tạo biểu đồ tương tác (bar chart, pie chart)
- **Font Awesome 6.x**: Icon library
- **Google Fonts**: Typography (Inter, Inspiration, Crimson Text, Dancing Script)

**Backend:**
- **PHP 7.4+**: Server-side scripting language
- **PDO (PHP Data Objects)**: Database abstraction layer với prepared statements để ngăn chặn SQL injection
- **JWT (JSON Web Token)**: Đơn giản hóa với base64 encoding cho authentication (trong production nên dùng thư viện chuyên dụng)

**Database:**
- **MySQL 5.7+ / MariaDB**: Relational database management system
- Character set: `utf8mb4` để hỗ trợ emoji và ký tự đặc biệt

**Development Tools:**
- **XAMPP**: Apache, MySQL, PHP development environment
- **phpMyAdmin**: Web interface để quản lý MySQL database
- **Visual Studio Code**: Code editor
- **Git**: Version control system

**Các công cụ hỗ trợ:**
- **Postman / Browser DevTools**: Testing API endpoints
- **Chrome DevTools**: Debugging frontend, kiểm tra Network requests

### 5.2. Kết quả chương trình minh họa

**Tổng kết các tính năng đã hoàn thành:**

**1. Database:**
- 15 bảng được tạo với đầy đủ foreign keys và constraints
- Indexes được tạo trên các trường thường xuyên query
- Dữ liệu mẫu phong phú: 9+ sản phẩm, 9 users (1 admin, 6 staff, 2 customers), 20+ đơn hàng, 3 khuyến mãi

**2. Backend API:**
- 20+ API endpoints được phát triển:
  - Authentication: login, register, forgot-password
  - Products: CRUD operations
  - Orders: CRUD, update status, delete
  - Users: CRUD, change password, ban/unban
  - Promotions: CRUD
  - Reports: statistics với filter theo tháng/năm
  - Cart: add, update, remove
  - Categories: CRUD
  - Complaints: CRUD, reply
  - Contacts: CRUD
  - Reviews: CRUD

**3. Frontend:**
- 10+ trang được xây dựng:
  - Trang chủ với filter sản phẩm
  - Chi tiết sản phẩm
  - Giỏ hàng và thanh toán
  - Đăng nhập/Đăng ký
  - Tài khoản khách hàng
  - Admin dashboard với báo cáo
  - Quản lý đơn hàng (Staff)
  - Xử lý khiếu nại và liên hệ

**4. Tính năng đặc biệt:**
- Báo cáo thống kê với biểu đồ tương tác (Chart.js)
- Phân quyền 3 cấp rõ ràng (Admin, Staff, Customer)
- Client-side authentication check tự động đăng xuất nếu tài khoản bị khóa
- Cache-busting để đảm bảo dữ liệu mới nhất
- Responsive design trên mọi thiết bị
- Xử lý ẩn "THÔNG TIN SẢN PHẨM" cho sản phẩm "Phụ kiện"

**5. Bảo mật:**
- Password hashing với bcrypt
- SQL injection prevention với prepared statements
- XSS protection với input sanitization
- JWT token authentication
- Authorization middleware cho mọi API endpoint

### 5.3. Giao diện minh hoạ các chức năng của chương trình

*[Các hình ảnh minh họa sẽ được bổ sung sau]*

**Mô tả các màn hình chính:**

**1. Trang chủ:**
- Header với logo, menu navigation, icon tìm kiếm, giỏ hàng, user
- Banner khuyến mãi lớn với hình ảnh và thông tin mã khuyến mãi
- Grid layout hiển thị sản phẩm với cards: hình ảnh, tên sản phẩm, giá, nút "Xem chi tiết"
- Filter tabs để lọc sản phẩm theo danh mục
- Footer với thông tin liên hệ

**2. Trang chi tiết sản phẩm:**
- Hình ảnh sản phẩm bên trái
- Thông tin sản phẩm bên phải: tên, giá, mô tả ngắn
- Form chọn số lượng và nút "Thêm vào giỏ hàng"
- Section "THÔNG TIN SẢN PHẨM" (ẩn nếu sản phẩm là "Phụ kiện"):
  - Cấu trúc bánh
  - Hướng dẫn sử dụng
  - Quà tặng đi kèm

**3. Trang quản trị Admin - Dashboard:**
- Sidebar navigation với các mục: Dashboard, Sản phẩm, Đơn hàng, Người dùng, Khuyến mãi, Báo cáo, Khiếu nại, Liên hệ
- KPI cards: 4 thẻ hiển thị Doanh thu, Tổng đơn hàng, Đã giao, Khách hàng mới
- Dropdown chọn năm và tháng
- Biểu đồ cột: Doanh thu theo tháng (12 tháng), tháng hiện tại có màu khác
- Biểu đồ tròn: Phân bổ doanh thu theo sản phẩm với phần trăm trong chú thích
- Bảng chi tiết: Doanh thu theo sản phẩm với dòng TỔNG CỘNG ở cuối

**4. Trang quản lý đơn hàng (Staff):**
- Filter checkboxes: Chờ xử lý, Đã nhận đơn, Đang chuẩn bị, Đang giao, Giao hàng thành công, Giao hàng thất bại
- Danh sách đơn hàng dạng cards hoặc bảng: Mã đơn, Ngày đặt, Khách hàng, Tổng tiền, Trạng thái
- Dropdown hoặc modal để cập nhật trạng thái đơn hàng

**5. Trang tài khoản khách hàng:**
- Tab: Thông tin cá nhân, Đơn hàng của tôi, Đổi mật khẩu
- Form cập nhật thông tin: Tên, Số điện thoại, Địa chỉ
- Bảng hiển thị đơn hàng: Mã đơn, Ngày đặt, Sản phẩm, Tổng tiền, Trạng thái

**6. Trang giỏ hàng:**
- Danh sách sản phẩm đã chọn với hình ảnh, tên, giá, số lượng, thành tiền
- Nút "Xóa" cho mỗi sản phẩm
- Tổng tiền tạm tính
- Nút "Tiến hành đặt hàng"

---

## CHƯƠNG 6. KIỂM THỬ CHƯƠNG TRÌNH

### 6.1. Kiểm thử các chức năng đã thực hiện

#### 6.1.1. Kiểm thử cho chức năng 1: Quản lý đăng nhập và đăng ký

**Bảng 6.1: Test cases cho chức năng đăng nhập**

| STT | Test Case | Input | Expected Output | Actual Output | Status |
|-----|-----------|-------|----------------|---------------|--------|
| 1 | Đăng nhập thành công (Admin) | Username: admin<br>Password: password | Đăng nhập thành công, chuyển đến admin dashboard | PASS | PASS |
| 2 | Đăng nhập thành công (Staff) | Username: staff01<br>Password: password | Đăng nhập thành công, chuyển đến trang quản lý đơn hàng | PASS | PASS |
| 3 | Đăng nhập thành công (Customer) | Username: customer01<br>Password: password | Đăng nhập thành công, chuyển đến trang chủ | PASS | PASS |
| 4 | Đăng nhập với username sai | Username: wronguser<br>Password: password | Hiển thị thông báo "Tên đăng nhập hoặc mật khẩu không đúng" | PASS | PASS |
| 5 | Đăng nhập với password sai | Username: admin<br>Password: wrongpass | Hiển thị thông báo "Tên đăng nhập hoặc mật khẩu không đúng" | PASS | PASS |
| 6 | Đăng nhập với tài khoản bị khóa | Username: banned_user<br>Password: password | Hiển thị thông báo "Tài khoản đã bị khóa" | PASS | PASS |
| 7 | Đăng ký tài khoản mới | Username, Email, Password hợp lệ | Tài khoản được tạo thành công, chuyển đến trang đăng nhập | PASS | PASS |
| 8 | Đăng ký với email đã tồn tại | Email đã có trong hệ thống | Hiển thị thông báo "Email đã được sử dụng" | PASS | PASS |
| 9 | Quên mật khẩu | Email hợp lệ | Mật khẩu được reset về "123456", hiển thị thông báo thành công | PASS | PASS |
| 10 | Quên mật khẩu với email không tồn tại | Email không có trong hệ thống | Hiển thị thông báo "Email không tồn tại" | PASS | PASS |

**Bảng 6.2: Test cases cho chức năng đổi mật khẩu**

| STT | Test Case | Input | Expected Output | Actual Output | Status |
|-----|-----------|-------|----------------|---------------|--------|
| 1 | Đổi mật khẩu với mật khẩu cũ đúng | Old password đúng, new password hợp lệ | Mật khẩu được cập nhật thành công | PASS | PASS |
| 2 | Đổi mật khẩu với mật khẩu cũ sai | Old password sai | Hiển thị thông báo "Mật khẩu cũ không đúng" | PASS | PASS |
| 3 | Đổi mật khẩu với mật khẩu mới quá ngắn | New password < 6 ký tự | Hiển thị thông báo "Mật khẩu phải có ít nhất 6 ký tự" | PASS | PASS |
| 4 | Đổi mật khẩu với xác nhận mật khẩu không khớp | New password ≠ confirm password | Hiển thị thông báo "Mật khẩu xác nhận không khớp" | PASS | PASS |

#### 6.1.2. Kiểm thử cho chức năng 2: Quản lý đơn hàng

**Bảng 6.3: Test cases cho quản lý đơn hàng (Admin/Staff)**

| STT | Test Case | Input | Expected Output | Actual Output | Status |
|-----|-----------|-------|----------------|---------------|--------|
| 1 | Xem danh sách đơn hàng | Đăng nhập với Admin/Staff | Hiển thị tất cả đơn hàng | PASS | PASS |
| 2 | Lọc đơn hàng theo trạng thái "Chờ xử lý" | Chọn filter "Chờ xử lý" | Chỉ hiển thị đơn hàng có trạng thái "pending" | PASS | PASS |
| 3 | Lọc đơn hàng theo trạng thái "Giao hàng thành công" | Chọn filter "Giao hàng thành công" | Chỉ hiển thị đơn hàng có trạng thái "delivery_successful" | PASS | PASS |
| 4 | Cập nhật trạng thái đơn hàng | Chọn đơn hàng, chọn trạng thái mới | Trạng thái được cập nhật, lịch sử được ghi nhận | PASS | PASS |
| 5 | Xóa đơn hàng (Admin) | Đăng nhập với Admin, chọn xóa đơn hàng | Đơn hàng và các record liên quan được xóa | PASS | PASS |
| 6 | Xóa đơn hàng (Staff - không có quyền) | Đăng nhập với Staff, chọn xóa đơn hàng | Hiển thị thông báo "Không có quyền" hoặc nút xóa bị ẩn | PASS | PASS |
| 7 | Xem chi tiết đơn hàng | Click vào đơn hàng | Hiển thị đầy đủ thông tin: sản phẩm, số lượng, giá, tổng tiền | PASS | PASS |
| 8 | Customer xem đơn hàng của mình | Đăng nhập với Customer | Chỉ hiển thị đơn hàng của chính khách hàng đó | PASS | PASS |

**Bảng 6.4: Test cases cho quản lý sản phẩm (Admin)**

| STT | Test Case | Input | Expected Output | Actual Output | Status |
|-----|-----------|-------|----------------|---------------|--------|
| 1 | Thêm sản phẩm mới | Điền form đầy đủ, submit | Sản phẩm được tạo, xuất hiện trên trang chủ | PASS | PASS |
| 2 | Sửa sản phẩm | Chọn sản phẩm, cập nhật thông tin, submit | Thông tin sản phẩm được cập nhật | PASS | PASS |
| 3 | Xóa sản phẩm | Chọn xóa sản phẩm, xác nhận | Sản phẩm bị xóa khỏi database và không hiển thị trên trang chủ | PASS | PASS |
| 4 | Tìm kiếm sản phẩm | Nhập tên sản phẩm | Hiển thị kết quả tìm kiếm | PASS | PASS |
| 5 | Lọc sản phẩm theo danh mục | Chọn danh mục | Chỉ hiển thị sản phẩm thuộc danh mục đó | PASS | PASS |

**Bảng 6.5: Test cases cho báo cáo thống kê (Admin)**

| STT | Test Case | Input | Expected Output | Actual Output | Status |
|-----|-----------|-------|----------------|---------------|--------|
| 1 | Xem báo cáo tháng hiện tại | Chọn năm và tháng hiện tại | Hiển thị KPI, biểu đồ cột, biểu đồ tròn, bảng chi tiết | PASS | PASS |
| 2 | Xem báo cáo tháng trong quá khứ | Chọn năm và tháng đã qua | Hiển thị dữ liệu của tháng đó | PASS | PASS |
| 3 | Xem báo cáo "Tất cả" tháng | Chọn năm, chọn "Tất cả" tháng | Biểu đồ cột hiển thị cả năm, bảng chi tiết để trống | PASS | PASS |
| 4 | Chọn tháng tương lai | Chọn năm và tháng tương lai | Hiển thị thông báo "Không có dữ liệu", biểu đồ và bảng để trống | PASS | PASS |
| 5 | Kiểm tra tổng phần trăm = 100% | Xem bảng chi tiết | Tổng phần trăm các sản phẩm = 100% | PASS | PASS |
| 6 | Kiểm tra dòng TỔNG CỘNG | Xem bảng chi tiết | Có dòng TỔNG CỘNG ở cuối bảng với tổng số lượng, tổng doanh thu, 100% | PASS | PASS |
| 7 | Kiểm tra tháng hiện tại có màu khác | Xem biểu đồ cột | Tháng hiện tại có màu #2d4a3e, các tháng khác màu #4472C4 | PASS | PASS |
| 8 | Kiểm tra phần trăm trong chú thích biểu đồ tròn | Xem biểu đồ tròn | Mỗi sản phẩm hiển thị phần trăm (XX.X%) trong chú thích | PASS | PASS |

#### 6.1.3. Kiểm thử yêu cầu phi chức năng

**Bảng 6.6: Test cases cho bảo mật**

| STT | Test Case | Input | Expected Output | Actual Output | Status |
|-----|-----------|-------|----------------|---------------|--------|
| 1 | SQL Injection Prevention | Nhập `'; DROP TABLE Users; --` vào form | Input được sanitize, không thực hiện được SQL injection | PASS | PASS |
| 2 | XSS Prevention | Nhập `<script>alert('XSS')</script>` vào form | Input được sanitize, script không được thực thi | PASS | PASS |
| 3 | Unauthorized Access - Customer truy cập admin | Customer cố gắng truy cập `/admin/admin.html` | Redirect về trang chủ hoặc hiển thị "Không có quyền" | PASS | PASS |
| 4 | Unauthorized Access - Staff truy cập user management | Staff cố gắng truy cập phần quản lý người dùng | Hiển thị "Không có quyền" | PASS | PASS |
| 5 | JWT Token Expired | Sử dụng token đã hết hạn | Redirect về trang đăng nhập | PASS | PASS |
| 6 | Tài khoản bị khóa tự động đăng xuất | Đang đăng nhập, tài khoản bị khóa bởi Admin | Tự động đăng xuất, hiển thị thông báo "Tài khoản đã bị khóa" | PASS | PASS |
| 7 | Password Hash | Kiểm tra mật khẩu trong database | Mật khẩu được hash bằng bcrypt, không lưu plain text | PASS | PASS |

**Bảng 6.7: Test cases cho Responsive Design**

| STT | Test Case | Input | Expected Output | Actual Output | Status |
|-----|-----------|-------|----------------|---------------|--------|
| 1 | Responsive trên Mobile (320px-480px) | Xem trang trên điện thoại | Layout tự động điều chỉnh, menu có thể collapse | PASS | PASS |
| 2 | Responsive trên Tablet (481px-768px) | Xem trang trên tablet | Layout phù hợp với màn hình tablet | PASS | PASS |
| 3 | Responsive trên Desktop (769px+) | Xem trang trên desktop | Layout hiển thị đầy đủ, sidebar hiển thị | PASS | PASS |
| 4 | Images responsive | Xem hình ảnh trên các thiết bị khác nhau | Hình ảnh tự động resize, không bị overflow | PASS | PASS |

**Bảng 6.8: Test cases cho Performance**

| STT | Test Case | Input | Expected Output | Actual Output | Status |
|-----|-----------|-------|----------------|---------------|--------|
| 1 | Loading time trang chủ | Truy cập trang chủ | Trang chủ load trong < 3 giây | PASS | PASS |
| 2 | API response time | Gọi API lấy danh sách sản phẩm | Response trong < 1 giây | PASS | PASS |
| 3 | Cache headers | Kiểm tra response headers | API có cache headers phù hợp | PASS | PASS |
| 4 | Database query optimization | Thực hiện truy vấn báo cáo | Query sử dụng indexes, thời gian < 2 giây | PASS | PASS |

---

## CHƯƠNG 7. HƯỚNG DẪN CÀI ĐẶT VÀ SỬ DỤNG

### 7.1. Hướng dẫn cài đặt

**Yêu cầu hệ thống:**
- Hệ điều hành: Windows 10/11 hoặc Linux, macOS
- XAMPP (Apache + MySQL + PHP): Version 7.4+ hoặc 8.0+
- Web browser: Chrome, Firefox, Edge (phiên bản mới nhất)
- Kết nối Internet: Để tải các thư viện CDN (Chart.js, Font Awesome, Google Fonts)

**Các bước cài đặt:**

**Bước 1: Cài đặt XAMPP**
1. Tải XAMPP từ https://www.apachefriends.org/
2. Cài đặt XAMPP (để mặc định C:\xampp)
3. Khởi động XAMPP Control Panel
4. Start Apache và MySQL services

**Bước 2: Copy project vào thư mục htdocs**
1. Copy toàn bộ thư mục `Nhom1_Ca4_CNPM` vào `C:\xampp\htdocs\`
2. Đảm bảo đường dẫn là: `C:\xampp\htdocs\Nhom1_Ca4_CNPM\`

**Bước 3: Import Database**
1. Mở phpMyAdmin: http://localhost/phpmyadmin
2. Click tab "SQL" hoặc "Import"
3. Chọn file `database/schema.sql` từ project
4. Click "Go" để thực thi
5. Kiểm tra database `lacuisinengot` đã được tạo với 15 bảng

**Bước 4: Cấu hình Database Connection (nếu cần)**
- File: `api/config/database.php`
- Mặc định:
  - Host: `localhost`
  - Database: `lacuisinengot`
  - Username: `root`
  - Password: `` (để trống nếu XAMPP không có password)

### 7.2. Đối tượng, phạm vi sử dụng

**Đối tượng sử dụng:**
- **Khách hàng:** Người mua hàng muốn mua bánh kem trực tuyến
- **Nhân viên:** Nhân viên cửa hàng quản lý đơn hàng và xử lý yêu cầu khách hàng
- **Quản trị viên:** Người quản lý toàn bộ hệ thống, sản phẩm, đơn hàng, người dùng, khuyến mãi

**Phạm vi sử dụng:**
- Website bán hàng trực tuyến cho cửa hàng bánh kem
- Hệ thống quản lý đơn hàng và kho hàng
- Hệ thống báo cáo thống kê doanh thu
- Hệ thống quản lý khuyến mãi
- Hệ thống xử lý khiếu nại và liên hệ

### 7.3. Xác định các yêu cầu cài đặt

**Yêu cầu phần mềm:**
- XAMPP 7.4+ (bao gồm Apache, MySQL, PHP)
- Web browser hiện đại (Chrome, Firefox, Edge)
- Code editor (Visual Studio Code, Sublime Text, Notepad++) - để chỉnh sửa code (tùy chọn)

**Yêu cầu phần cứng:**
- CPU: Intel Core i3 trở lên hoặc tương đương
- RAM: Tối thiểu 4GB (khuyến nghị 8GB)
- Dung lượng ổ cứng: Tối thiểu 500MB trống
- Kết nối Internet: Để tải CDN libraries

**Yêu cầu hệ điều hành:**
- Windows 10/11
- Linux (Ubuntu, Debian, CentOS)
- macOS

**Không yêu cầu:**
- Server hosting (có thể chạy trên localhost)
- Domain name (không cần thiết cho development)

### 7.4. Hướng dẫn chi tiết các bước cài đặt

**Bước 1: Cài đặt XAMPP**
1. Tải XAMPP từ trang chủ: https://www.apachefriends.org/
2. Chạy file installer và làm theo hướng dẫn
3. Chọn các components: Apache, MySQL, PHP, phpMyAdmin
4. Chọn thư mục cài đặt (mặc định: C:\xampp)
5. Hoàn tất cài đặt

**Bước 2: Copy project**
1. Copy thư mục `Nhom1_Ca4_CNPM` vào `C:\xampp\htdocs\`
2. Đảm bảo cấu trúc: `C:\xampp\htdocs\Nhom1_Ca4_CNPM\`

**Bước 3: Khởi động services**
1. Mở XAMPP Control Panel
2. Click "Start" cho Apache
3. Click "Start" cho MySQL
4. Kiểm tra cả 2 services đều hiển thị màu xanh (running)

**Bước 4: Import database**
1. Mở trình duyệt, truy cập: http://localhost/phpmyadmin
2. Click tab "SQL" hoặc "Import"
3. Chọn file: `C:\xampp\htdocs\Nhom1_Ca4_CNPM\database\schema.sql`
4. Click "Go" để import
5. Đợi thông báo "Import has been successfully finished"
6. Kiểm tra database `lacuisinengot` đã được tạo với 15 bảng

**Bước 5: Truy cập website**
1. Mở trình duyệt
2. Truy cập: http://localhost/Nhom1_Ca4_CNPM/pages/home/home.html
3. Website sẽ hiển thị trang chủ

**Bước 6: Đăng nhập để kiểm tra**
1. Truy cập: http://localhost/Nhom1_Ca4_CNPM/pages/login/login.html
2. Đăng nhập với:
   - Admin: username `admin`, password `password`
   - Staff: username `staff01`, password `password`
   - Customer: username `customer01`, password `password`

### 7.5. Hướng dẫn sử dụng phần mềm

**Hướng dẫn cho Khách hàng:**
1. **Đăng ký tài khoản:** Truy cập trang đăng ký, điền thông tin, submit
2. **Đăng nhập:** Nhập username và password, click "Đăng nhập"
3. **Duyệt sản phẩm:** Trang chủ hiển thị tất cả sản phẩm, có thể lọc theo danh mục
4. **Xem chi tiết sản phẩm:** Click vào sản phẩm để xem thông tin chi tiết
5. **Thêm vào giỏ hàng:** Chọn số lượng, click "Thêm vào giỏ hàng"
6. **Đặt hàng:** Vào giỏ hàng, điền thông tin giao hàng, xác nhận đơn hàng
7. **Theo dõi đơn hàng:** Vào "Tài khoản" → "Đơn hàng của tôi" để xem đơn hàng

**Hướng dẫn cho Nhân viên:**
1. **Đăng nhập:** Sử dụng tài khoản Staff (ví dụ: `staff01` / `password`)
2. **Quản lý đơn hàng:** Vào "Quản lý đơn hàng", xem danh sách, lọc theo trạng thái
3. **Cập nhật trạng thái đơn hàng:** Chọn đơn hàng, chọn trạng thái mới, submit
4. **Xử lý khiếu nại:** Vào "Xử lý khiếu nại", xem danh sách, cập nhật trạng thái, phản hồi
5. **Xử lý liên hệ:** Vào "Xử lý liên hệ", xem danh sách, cập nhật trạng thái

**Hướng dẫn cho Quản trị viên:**
1. **Đăng nhập:** Sử dụng tài khoản Admin (`admin` / `password`)
2. **Quản lý sản phẩm:** Vào "Sản phẩm", thêm/sửa/xóa sản phẩm
3. **Quản lý đơn hàng:** Vào "Đơn hàng", xem, cập nhật, xóa đơn hàng
4. **Quản lý người dùng:** Vào "Người dùng", thêm/sửa/xóa, khóa/mở khóa tài khoản
5. **Quản lý khuyến mãi:** Vào "Khuyến mãi", tạo/sửa/xóa mã khuyến mãi
6. **Xem báo cáo:** Vào "Báo cáo", chọn năm và tháng, xem KPI, biểu đồ, bảng chi tiết
7. **Quản lý khiếu nại và liên hệ:** Xem và xử lý các yêu cầu từ khách hàng

---

## KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

### Kết luận

Đồ án "Xây dựng Website Bán Bánh Kem Cao Cấp La Cuisine Ngọt" đã được hoàn thành với đầy đủ các yêu cầu cơ bản của một hệ thống thương mại điện tử:

**Những gì đã đạt được:**

1. **Hệ thống quản lý hoàn chỉnh:**
   - Quản lý sản phẩm với đầy đủ thông tin (tên, mô tả, giá, hình ảnh, danh mục)
   - Quản lý đơn hàng với 6 trạng thái từ "Chờ xử lý" đến "Giao hàng thành công/thất bại"
   - Quản lý người dùng với 3 vai trò rõ ràng: Admin, Staff, Customer
   - Quản lý khuyến mãi với nhiều loại: Giảm giá cố định, Miễn phí vận chuyển

2. **Báo cáo thống kê chi tiết:**
   - KPI tổng quan: Doanh thu, Tổng đơn hàng, Đã giao, Khách hàng mới
   - Biểu đồ cột: Doanh thu theo tháng với phân biệt tháng hiện tại
   - Biểu đồ tròn: Phân bổ doanh thu theo sản phẩm với phần trăm
   - Bảng chi tiết: Doanh thu theo sản phẩm với dòng TỔNG CỘNG

3. **Bảo mật và phân quyền:**
   - JWT token authentication
   - Password hashing với bcrypt
   - SQL injection prevention với prepared statements
   - XSS protection với input sanitization
   - Phân quyền rõ ràng với middleware functions
   - Tự động đăng xuất nếu tài khoản bị khóa

4. **Giao diện thân thiện:**
   - Responsive design trên mọi thiết bị
   - Giao diện hiện đại, dễ sử dụng
   - Loading states để cung cấp feedback

5. **API RESTful:**
   - 20+ API endpoints được tổ chức rõ ràng
   - JSON responses nhất quán
   - Error handling toàn diện

**Đánh giá:**
Đồ án đã đáp ứng đầy đủ các yêu cầu đề ra, cung cấp một nền tảng thương mại điện tử hoàn chỉnh cho việc bán hàng trực tuyến với đầy đủ tính năng quản lý và báo cáo. Hệ thống được thiết kế với kiến trúc rõ ràng, dễ bảo trì và mở rộng.

### Hướng phát triển

**1. Tích hợp cổng thanh toán:**
- Tích hợp VNPay để xử lý thanh toán trực tuyến thực sự
- Tích hợp MoMo, ZaloPay để đa dạng phương thức thanh toán
- Xử lý callback từ cổng thanh toán để cập nhật PaymentStatus

**2. Phát triển hệ thống đánh giá đầy đủ:**
- Cho phép khách hàng đánh giá sản phẩm sau khi nhận hàng
- Hiển thị rating và reviews trên trang sản phẩm
- Quản lý reviews (duyệt/từ chối) cho Admin

**3. Cải thiện validation và logic nghiệp vụ:**
- Validation số lượng giỏ hàng không vượt quá tồn kho
- Validation chuyển trạng thái đơn hàng theo workflow đúng (không cho phép chuyển ngược)
- Validation mã khuyến mãi hết lượt sử dụng

**4. Tối ưu hóa hiệu suất:**
- Implement caching cho API responses
- Optimize database queries với JOIN hiệu quả hơn
- Lazy loading cho hình ảnh sản phẩm
- Minify CSS và JavaScript

**5. Tính năng nâng cao:**
- Email notifications cho đơn hàng mới, thay đổi trạng thái
- SMS notifications cho khách hàng
- Wishlist (danh sách yêu thích) đầy đủ chức năng
- Tìm kiếm nâng cao với filters (giá, danh mục, rating)
- Pagination cho danh sách sản phẩm, đơn hàng

**6. Bảo mật nâng cao:**
- Implement JWT thực sự với thư viện chuyên dụng (firebase/php-jwt)
- Rate limiting cho API endpoints
- CSRF protection
- Input validation toàn diện hơn

**7. Trải nghiệm người dùng:**
- Real-time updates với WebSocket
- Push notifications cho trình duyệt
- Dark mode
- Đa ngôn ngữ (Tiếng Việt, Tiếng Anh)

**8. Mobile App:**
- Phát triển mobile app (React Native hoặc Flutter)
- Tích hợp API hiện có
- Push notifications cho mobile

---

## TÀI LIỆU THAM KHẢO

1. **PHP Manual**, https://www.php.net/manual/en/
   - Tài liệu chính thức về PHP, PDO, password hashing

2. **MySQL Documentation**, https://dev.mysql.com/doc/
   - Tài liệu về MySQL, SQL syntax, indexes, foreign keys

3. **Chart.js Documentation**, https://www.chartjs.org/docs/latest/
   - Hướng dẫn sử dụng Chart.js để tạo biểu đồ tương tác

4. **RESTful API Design Best Practices**, https://restfulapi.net/
   - Các best practices trong thiết kế RESTful API

5. **JWT Authentication Guide**, https://jwt.io/
   - Giới thiệu về JSON Web Token và cách sử dụng

6. **MDN Web Docs**, https://developer.mozilla.org/
   - Tài liệu về HTML, CSS, JavaScript (ES6+)

7. **Font Awesome Icons**, https://fontawesome.com/icons
   - Thư viện icon được sử dụng trong dự án

8. **Google Fonts**, https://fonts.google.com/
   - Typography: Inter, Inspiration, Crimson Text, Dancing Script

9. **W3Schools**, https://www.w3schools.com/
   - Tutorials về HTML, CSS, JavaScript, PHP, MySQL

10. **Stack Overflow**, https://stackoverflow.com/
    - Cộng đồng hỏi đáp về lập trình

11. **Git Documentation**, https://git-scm.com/doc
    - Tài liệu về Git version control system

12. **XAMPP Documentation**, https://www.apachefriends.org/docs.html
    - Hướng dẫn sử dụng XAMPP development environment

---

## PHỤ LỤC

### Phụ lục 1: Danh sách API Endpoints

**Authentication:**
- `POST /api/auth/login.php` - Đăng nhập
- `POST /api/auth/register.php` - Đăng ký
- `POST /api/auth/forgot-password.php` - Quên mật khẩu

**Products:**
- `GET /api/products.php` - Lấy danh sách sản phẩm
- `GET /api/products.php?id={id}` - Lấy chi tiết sản phẩm
- `POST /api/products.php` - Tạo sản phẩm (Admin)
- `PUT /api/products.php/{id}` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products.php/{id}` - Xóa sản phẩm (Admin)

**Orders:**
- `GET /api/orders.php` - Lấy danh sách đơn hàng (Staff/Admin)
- `GET /api/orders.php?user_id={id}` - Lấy đơn hàng của customer
- `POST /api/orders.php` - Tạo đơn hàng mới
- `PUT /api/orders.php/{id}` - Cập nhật đơn hàng (Staff/Admin)
- `DELETE /api/orders.php/{id}` - Xóa đơn hàng (Admin)

**Users:**
- `GET /api/users.php` - Danh sách users (Admin)
- `GET /api/users.php/{id}` - Chi tiết user (Owner/Admin)
- `POST /api/users.php` - Tạo user (Admin)
- `PUT /api/users.php/{id}` - Cập nhật user (Owner/Admin)
- `POST /api/users.php/{id}/change-password` - Đổi mật khẩu (Owner/Admin)
- `DELETE /api/users.php/{id}` - Xóa user (Admin)

**Reports:**
- `GET /api/reports.php?period=month` - Báo cáo tháng hiện tại
- `GET /api/reports.php?period=year` - Báo cáo năm hiện tại
- `GET /api/reports.php?month={m}&year={y}` - Báo cáo tháng cụ thể
- `GET /api/reports.php?year={y}` - Báo cáo cả năm

### Phụ lục 2: Cấu trúc Database Schema

**15 bảng chính:**
1. Users - Người dùng
2. Categories - Danh mục sản phẩm
3. Products - Sản phẩm
4. ProductImages - Hình ảnh sản phẩm
5. Orders - Đơn hàng
6. OrderItems - Chi tiết đơn hàng
7. OrderStatusHistory - Lịch sử thay đổi trạng thái
8. Promotions - Khuyến mãi
9. PromotionUsage - Lịch sử sử dụng khuyến mãi
10. Cart - Giỏ hàng
11. Wishlist - Danh sách yêu thích
12. Complaints - Khiếu nại
13. ComplaintResponses - Phản hồi khiếu nại
14. Reviews - Đánh giá sản phẩm
15. Contacts - Liên hệ

### Phụ lục 3: Tài khoản đăng nhập mẫu

**Admin:**
- Username: `admin`
- Password: `password`

**Staff:**
- Username: `staff01`, `staff02`, `staff03`, `staff04`, `staff05`, `staff06`
- Password: `password` (cho tất cả)

**Customer:**
- Username: `customer01`, `customer02`
- Password: `password` (cho tất cả)

### Phụ lục 4: Cấu trúc Project

```
Nhom1_Ca4_CNPM/
├── admin/          # Admin dashboard
├── api/            # Backend API
├── assets/         # Static resources
├── database/       # Database schema
├── pages/          # Customer pages
├── staff/          # Staff pages
└── README.md       # Project documentation
```

### Phụ lục 5: Code Snippets

**Ví dụ API Response (Success):**
```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "id": 1,
    "name": "Sản phẩm",
    "price": 650000
  }
}
```

**Ví dụ API Response (Error):**
```json
{
  "success": false,
  "message": "Không tìm thấy sản phẩm"
}
```

**Ví dụ JWT Token Structure:**
```javascript
{
  "user_id": 1,
  "username": "admin",
  "role": "admin",
  "exp": 1735689600
}
```

---

**Made with ❤️ by Team Nhóm 1 - Ca 4 - CNPM**
