<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Thanh toán và giao hàng | La Cuisine Ngọt</title>

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Crimson+Text:wght@400;600&family=Inspiration&display=swap" rel="stylesheet">

  <!-- CSS -->
  <link rel="stylesheet" href="../../assets/css/style.css">
  <link rel="stylesheet" href="../../assets/css/animations.css">
  <link rel="stylesheet" href="home.css">
  <link rel="stylesheet" href="pay.css">

  <!-- Font Awesome -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body>

  <!-- NAVIGATION -->
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-logo">
        <a href="../home/home.html">La Cuisine Ngọt</a>
      </div>

      <ul class="nav-menu">
        <li><a href="../home/home.html#products">SẢN PHẨM</a></li>
        <li><a href="../home/home.html#khuyenmai">KHUYẾN MÃI</a></li>
        <li><a href="../home/home.html#contact">LIÊN HỆ</a></li>
        <div class="nav-icons">
          <a href="../cart/cart.html" class="nav-cart" aria-label="Giỏ hàng">
            <i class="fas fa-shopping-cart"></i>
          </a>
        </div>
        <li><a href="../login/login.html" class="nav-login">ĐĂNG NHẬP/ĐĂNG KÍ</a></li>
      </ul>
    </div>
  </nav>

  <!-- MAIN CONTENT -->
  <main class="container page">
    <section class="box checkout">
      <h1 class="page-title">Thanh toán và giao hàng</h1>
      
      <form id="checkoutForm" class="checkout-form" autocomplete="off" novalidate>
        <div class="form-grid">
          
          <!-- CỘT 1 - THÔNG TIN NGƯỜI DÙNG -->
          <div class="form-col">
            <h3 class="form-title">Thông tin người dùng</h3>

            <div class="form-group">
              <label>Họ và tên <span class="required">*</span></label>
              <input name="fullname" required type="text" placeholder="Nguyễn Văn A">
              <span class="error-msg" id="nameError"></span>
            </div>

            <div class="form-group">
              <label>Số điện thoại <span class="required">*</span></label>
              <input name="phone" required type="tel" placeholder="09x xxx xxxx">
              <span class="error-msg" id="phoneError"></span>
            </div>

            <div class="form-group">
              <label>Địa chỉ mail <span class="required">*</span></label>
              <input name="email" required type="text" placeholder="email@domain.com">
              <span class="error-msg" id="emailError"></span>
            </div>
          </div>

          <!-- CỘT 2 - THÔNG TIN GIAO HÀNG -->
          <div class="form-col">
            <h3 class="form-title">Thông tin giao hàng</h3>

            <div class="form-group delivery-method">
              <label for="delivery">Phương thức nhận hàng <span class="required">*</span></label>
              <div class="delivery-options">
                <label><input type="radio" name="delivery" value="store"> Nhận trực tiếp tại cửa hàng</label>
                <label><input type="radio" name="delivery" value="delivery"> Giao hàng tận nơi</label>
              </div>
            </div>

            <div class="delivery-info">
              <div class="form-group">
                <label for="city">Tỉnh / Thành phố</label>
                <select id="city" name="city">
                  <option value="">-- Chọn tỉnh / thành phố --</option>
                  <option value="hcm">TP.HCM</option>
                  <option value="ld">Lâm Đồng</option>
                  <option value="kh">Khánh Hòa</option>
                </select>
              </div>

              <div class="form-group">
                <label for="ward">Phường / Xã</label>
                <select id="ward" name="ward">
                  <option value="">-- Chọn phường / xã --</option>
                </select>
              </div>

              <div class="form-group">
                <label for="address">Địa chỉ cụ thể</label>
                <input type="text" id="address" name="address" placeholder="Số nhà, tên đường...">
              </div>
            </div>
          </div>

          <!-- CỘT 3 - THỜI GIAN VÀ GHI CHÚ -->
          <div class="form-col">
            <div class="form-group">
              <h3 class="form-title">Thời gian nhận bánh</h3>
              <label for="deliveryTime">Ngày - giờ nhận bánh <span class="required">*</span></label>
              <input name="deliveryTime" id="deliveryTime" required type="datetime-local">
              <span class="error-msg" id="timeError"></span>
            </div>

            <div class="form-group">
              <h3 class="form-title">Ghi chú cho Ngọt</h3>
              <textarea id="note" name="note" placeholder="Ví dụ: Ghi 'Happy Birthday Mẹ' màu vàng"></textarea>
            </div>
          </div>
        </div>

        <!-- ĐƠN HÀNG -->
        <h3 class="form-title">Đơn hàng của bạn</h3>
        <?php
        require_once '../../api/config/database.php';
        
        // Tạo kết nối và lấy PDO
        $database = new Database();
        $conn = $database->getConnection();

        $sql = "
            SELECT PromotionID, PromotionCode, PromotionName, Description, PromotionType, DiscountValue
            FROM Promotions
            WHERE Status = 'active'
              AND StartDate <= NOW()
              AND EndDate >= NOW()
              AND (Quantity = -1 OR Quantity > UsedCount)
        ";

        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $promotions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        ?>

        <div class="promotion-section">
        <h3>🎁 Chọn khuyến mãi</h3>

        <select id="promotionSelect" name="promotion">
          <option value="">-- Không áp dụng --</option>

          <?php foreach ($promotions as $promo): ?>
            <option 
              value="<?= htmlspecialchars($promo['PromotionCode']) ?>"
              data-type="<?= htmlspecialchars($promo['PromotionType']) ?>"
              data-value="<?= htmlspecialchars($promo['DiscountValue']) ?>"
            >
              <?= htmlspecialchars($promo['PromotionName']) ?> — <?= htmlspecialchars($promo['Description']) ?>
            </option>
          <?php endforeach; ?>
        </select>
      </div>


        <div class="order-table-wrap">
          <table class="order-table" id="orderTable">
            <thead>
              <tr>
                <th>Tên sản phẩm</th>
                <th>Số lượng</th>
                <th>Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr data-price="500000">
                <td>
                  <div class="prod-title">Mousse Chanh dây</div>
                </td>
                <td class="td-qty">1</td>
                <td class="td-price">500.000</td>
              </tr>
              <tr data-price="650000">
                <td>
                  <div class="prod-title">Entremets Rose</div>
                </td>
                <td class="td-qty">1</td>
                <td class="td-price">650.000</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TỔNG TIỀN & NÚT -->
        <div class="order-footer">
          <div class="totals">
            <div><span>Tạm tính</span><strong id="subtotal">1.150.000</strong></div>
            <div><span>Phí vận chuyển</span><strong id="shipping">Miễn phí</strong></div>
            <div><span>VAT (8%)</span><strong id="vat">92.000</strong></div>
            <div class="total-line"><span>Tổng tiền</span><strong id="grandtotal">1.242.000</strong></div>
          </div>

          <button id="placeOrder" class="btn">Đặt hàng</button>
        </div>
      </form>
    </section>
  </main>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-left">
        <h2 class="footer-logo">La Cuisine Ngọt</h2>
        <div class="social-links">
          <a href="https://www.facebook.com/LaCuisineNgot" target="_blank" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
          <a href="https://www.instagram.com/LaCuisineNgot" target="_blank" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
        </div>
      </div>

      <div class="footer-right">
        <p><b>Ngọt GO TO (TP.HCM)</b><br>123 An Dương Vương, phường Chợ Quán, TP.HCM</p>
        <p><b>Ngọt INSIDE (Phan Rang)</b><br>85 Ngô Gia Tự, p. Phan Rang, Khánh Hòa</p>
        <p><b>Ngọt AROUND (Phan Thiết)</b><br>86 Nguyễn Tất Thành, p. Phan Thiết, Lâm Đồng</p>
      </div>
    </div>
  </footer>

  <script src="pay.js"></script>
</body>
</html>
