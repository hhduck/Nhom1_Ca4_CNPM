-- ============================================
-- LA CUISINE NGỌT - DATABASE HOÀN CHỈNH
-- ĐÃ SỬA LỖI DELIMITER
-- ============================================

-- Xóa database cũ nếu có
DROP DATABASE IF EXISTS lacuisinengot;

-- Tạo database mới
CREATE DATABASE lacuisinengot
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE lacuisinengot;

-- ============================================
-- TẠO CÁC BẢNG
-- ============================================

-- 1. USERS
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    Phone VARCHAR(20),
    Address VARCHAR(255),
    Role ENUM('customer', 'staff', 'admin') DEFAULT 'customer',
    Status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    Avatar VARCHAR(255),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    LastLogin TIMESTAMP NULL
);

-- 2. CATEGORIES
CREATE TABLE Categories (
    CategoryID INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(100) NOT NULL,
    Description TEXT,
    Slug VARCHAR(100) UNIQUE,
    ParentID INT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    DisplayOrder INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ParentID) REFERENCES Categories(CategoryID)
);

-- 3. PRODUCTS
CREATE TABLE Products (
    ProductID INT AUTO_INCREMENT PRIMARY KEY,
    ProductName VARCHAR(200) NOT NULL,
    CategoryID INT,
    Description TEXT,
    Price DECIMAL(10,2) NOT NULL,
    OriginalPrice DECIMAL(10,2),
    Quantity INT DEFAULT 0,
    Unit VARCHAR(20) DEFAULT 'cái',
    Status ENUM('available', 'out_of_stock', 'discontinued') DEFAULT 'available',
    ImageURL VARCHAR(255),
    Weight DECIMAL(8,2),
    Ingredients TEXT,
    Allergens VARCHAR(200),
    ShelfLife INT,
    StorageConditions VARCHAR(255),
    ShortIntro TEXT,
    ShortParagraph TEXT,
    Structure TEXT,
    `Usage` TEXT,
    Bonus TEXT,
    Views INT DEFAULT 0,
    SoldCount INT DEFAULT 0,
    IsFeatured BOOLEAN DEFAULT FALSE,
    IsNew BOOLEAN DEFAULT FALSE,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);

-- 4. PRODUCT_IMAGES
CREATE TABLE ProductImages (
    ImageID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL,
    ImageURL VARCHAR(255) NOT NULL,
    AltText VARCHAR(200),
    IsPrimary BOOLEAN DEFAULT FALSE,
    DisplayOrder INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE
);

-- 5. ORDERS
CREATE TABLE Orders (
    OrderID INT AUTO_INCREMENT PRIMARY KEY,
    OrderCode VARCHAR(20) NOT NULL UNIQUE,
    CustomerID INT NOT NULL,
    CustomerName VARCHAR(100),
    CustomerPhone VARCHAR(15),
    CustomerEmail VARCHAR(100),
    ShippingAddress VARCHAR(255) NOT NULL,
    Ward VARCHAR(50),
    District VARCHAR(50),
    City VARCHAR(50),
    TotalAmount DECIMAL(12,2) NOT NULL,
    DiscountAmount DECIMAL(10,2) DEFAULT 0,
    ShippingFee DECIMAL(10,2) DEFAULT 0,
    FinalAmount DECIMAL(12,2) NOT NULL,
    PaymentMethod ENUM('cod', 'bank_transfer', 'momo', 'zalopay', 'vnpay') DEFAULT 'cod',
    PaymentStatus ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    OrderStatus ENUM('pending', 'confirmed', 'preparing', 'shipping', 'completed', 'cancelled') DEFAULT 'pending',
    Note TEXT,
    CancelReason TEXT NULL DEFAULT NULL,
    DeliveryDate DATE,
    DeliveryTime VARCHAR(20),
    PromotionCode VARCHAR(50),
    StaffID INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ConfirmedAt TIMESTAMP NULL,
    CompletedAt TIMESTAMP NULL,
    CancelledAt TIMESTAMP NULL,
    CancellationReason TEXT,
    FOREIGN KEY (CustomerID) REFERENCES Users(UserID),
    FOREIGN KEY (StaffID) REFERENCES Users(UserID)
);

-- 6. ORDER_ITEMS
CREATE TABLE OrderItems (
    OrderItemID INT AUTO_INCREMENT PRIMARY KEY,
    OrderID INT NOT NULL,
    ProductID INT NOT NULL,
    ProductName VARCHAR(200),
    ProductPrice DECIMAL(10,2) NOT NULL,
    Quantity INT NOT NULL,
    Subtotal DECIMAL(12,2) NOT NULL,
    Note VARCHAR(255),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

-- 7. ORDER_STATUS_HISTORY
CREATE TABLE OrderStatusHistory (
    HistoryID INT AUTO_INCREMENT PRIMARY KEY,
    OrderID INT NOT NULL,
    OldStatus VARCHAR(20),
    NewStatus VARCHAR(20) NOT NULL,
    ChangedBy INT,
    Note VARCHAR(255),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ChangedBy) REFERENCES Users(UserID)
);

-- 8. PROMOTIONS
CREATE TABLE Promotions (
    PromotionID INT AUTO_INCREMENT PRIMARY KEY,
    PromotionCode VARCHAR(50) NOT NULL UNIQUE,
    PromotionName VARCHAR(200) NOT NULL,
    Description TEXT,
    PromotionType ENUM('percent', 'fixed_amount', 'free_shipping', 'gift') NOT NULL,
    DiscountValue DECIMAL(10,2) DEFAULT 0,
    MinOrderValue DECIMAL(10,2) DEFAULT 0,
    MaxDiscount DECIMAL(10,2),
    Quantity INT DEFAULT -1,
    UsedCount INT DEFAULT 0,
    UsageLimitPerUser INT DEFAULT 1,
    StartDate TIMESTAMP NOT NULL,
    EndDate TIMESTAMP NOT NULL,
    Status ENUM('pending', 'active', 'expired', 'cancelled') DEFAULT 'pending',
    ImageURL VARCHAR(255),
    ApplicableProducts JSON,
    ApplicableCategories JSON,
    CustomerType ENUM('all', 'new', 'loyal') DEFAULT 'all',
    CreatedBy INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);

-- 9. PROMOTION_USAGE
CREATE TABLE PromotionUsage (
    UsageID INT AUTO_INCREMENT PRIMARY KEY,
    PromotionID INT NOT NULL,
    UserID INT NOT NULL,
    OrderID INT NOT NULL,
    DiscountAmount DECIMAL(10,2) NOT NULL,
    UsedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PromotionID) REFERENCES Promotions(PromotionID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID)
);

-- 10. COMPLAINTS
CREATE TABLE Complaints (
    ComplaintID INT AUTO_INCREMENT PRIMARY KEY,
    ComplaintCode VARCHAR(20) NOT NULL UNIQUE,
    OrderID INT NOT NULL,
    CustomerID INT NOT NULL,
    ComplaintType ENUM('product_quality', 'delivery', 'service', 'other') NOT NULL,
    Title VARCHAR(200) NOT NULL,
    Content TEXT NOT NULL,
    Images JSON,
    Status ENUM('pending', 'processing', 'resolved', 'closed', 'rejected') DEFAULT 'pending',
    Priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    AssignedTo INT,
    Resolution TEXT,
    CompensationType ENUM('refund', 'replacement', 'voucher', 'none'),
    CompensationValue DECIMAL(10,2),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ResolvedAt TIMESTAMP NULL,
    ClosedAt TIMESTAMP NULL,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    FOREIGN KEY (CustomerID) REFERENCES Users(UserID),
    FOREIGN KEY (AssignedTo) REFERENCES Users(UserID)
);

-- 11. COMPLAINT_RESPONSES
CREATE TABLE ComplaintResponses (
    ResponseID INT AUTO_INCREMENT PRIMARY KEY,
    ComplaintID INT NOT NULL,
    UserID INT NOT NULL,
    UserType ENUM('customer', 'staff', 'admin') NOT NULL,
    Content TEXT NOT NULL,
    Attachments JSON,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ComplaintID) REFERENCES Complaints(ComplaintID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- 12. REVIEWS
CREATE TABLE Reviews (
    ReviewID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL,
    UserID INT NOT NULL,
    OrderID INT,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Title VARCHAR(200),
    Content TEXT,
    Images JSON,
    IsVerifiedPurchase BOOLEAN DEFAULT FALSE,
    HelpfulCount INT DEFAULT 0,
    Status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    AdminReply TEXT,
    RepliedAt TIMESTAMP NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID)
);

-- 13. CART
CREATE TABLE Cart (
    CartID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    Note VARCHAR(255),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(UserID, ProductID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE
);

-- 14. WISHLIST
CREATE TABLE Wishlist (
    WishlistID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    ProductID INT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(UserID, ProductID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE
);

-- ============================================
-- TẠO INDEXES
-- ============================================
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_Role ON Users(Role);
CREATE INDEX IX_Products_CategoryID ON Products(CategoryID);
CREATE INDEX IX_Products_Status ON Products(Status);
CREATE INDEX IX_Products_IsFeatured ON Products(IsFeatured);
CREATE INDEX IX_Orders_CustomerID ON Orders(CustomerID);
CREATE INDEX IX_Orders_Status ON Orders(OrderStatus);
CREATE INDEX IX_Orders_CreatedAt ON Orders(CreatedAt);
CREATE INDEX IX_Promotions_Code ON Promotions(PromotionCode);
CREATE INDEX IX_Promotions_Status ON Promotions(Status);
CREATE INDEX IX_Complaints_Status ON Complaints(Status);

-- ============================================
-- INSERT DỮ LIỆU MẪU
-- ============================================

-- 1. Categories
INSERT INTO Categories (CategoryID, CategoryName, Description, Slug, IsActive, DisplayOrder) VALUES
(1, 'Entremet', 'Bánh entremet cao cấp với nhiều lớp hương vị tinh tế', 'entremet', TRUE, 1),
(2, 'Mousse', 'Bánh mousse mềm mịn, nhẹ nhàng', 'mousse', TRUE, 2),
(3, 'Truyền thống', 'Bánh truyền thống Việt Nam', 'truyen-thong', TRUE, 3),
(4, 'Phụ kiện', 'Các phụ kiện trang trí bánh', 'phu-kien', TRUE, 4);

-- 2. Users (Password cho tất cả: password)
INSERT INTO Users (UserID, Username, PasswordHash, FullName, Email, Phone, Role, Status) VALUES
(1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Quản trị viên', 'admin@lacuisine.vn', '0901234567', 'admin', 'active'),
(2, 'staff01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nhân viên 1', 'staff01@lacuisine.vn', '0902345678', 'staff', 'active'),
(3, 'customer01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Văn A', 'customer01@email.com', '0903456789', 'customer', 'active'),
(4, 'customer02', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Trần Thị B', 'customer02@email.com', '0904567890', 'customer', 'active'),
(5, 'staff02', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lê Thị Cẩm', 'cam.le@lacuisine.vn', '0902111222', 'staff', 'active'),
(6, 'staff03', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Phạm Văn Dũng', 'dung.pham@lacuisine.vn', '0903222333', 'staff', 'active'),
(7, 'staff04', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bùi Minh Tuấn', 'tuan.bui@lacuisine.vn', '0904333444', 'staff', 'active'),
(8, 'staff05', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Vũ Hoàng Oanh', 'oanh.vu@lacuisine.vn', '0905444555', 'staff', 'active'),
(9, 'staff06', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Đặng Gia Hân', 'han.dang@lacuisine.vn', '0906555666', 'staff', 'active');

-- 3. Products
INSERT INTO Products (ProductID, ProductName, CategoryID, Description, Price, OriginalPrice, Quantity, Status, ImageURL, Weight, ShelfLife, IsFeatured, ShortIntro, ShortParagraph, Structure, `Usage`, Bonus) VALUES
(1, 'Entremets Rose', 1, '<p>Một chiếc entremets tựa như đoá hồng nở trong nắng sớm — nhẹ nhàng, tinh khôi và ngọt ngào theo cách riêng. Entremets Rose là sự hòa quyện giữa vải thiều mọng nước, mâm xôi chua thanh, phô mai trắng béo mịn và hương hoa hồng phảng phất, tạo nên cảm giác trong trẻo, nữ tính và đầy tinh tế.</p>', 650000, 750000, 15, 'available', 'assets/images/entremets-rose.jpg', 500, 3, TRUE, '<b>Hoa hồng – Vải thiều – Mâm xôi – Phô mai trắng</b>', 'Chiếc entremets nhẹ như một khúc nhạc Pháp, hòa quyện hương hoa hồng thanh thoát, vải thiều ngọt mát, mâm xôi chua nhẹ và mousse phô mai trắng béo mềm. Từng lớp bánh được sắp đặt tỉ mỉ để mang đến cảm giác trong trẻo, tinh khôi và đầy nữ tính — một "nụ hồng ngọt ngào" dành cho những tâm hồn yêu sự dịu dàng.', '<ul><li><b>Lớp 1 – Biscuit Madeleine Framboise:</b> Cốt bánh mềm nhẹ, thấm vị chua thanh tự nhiên từ mâm xôi tươi.</li><li><b>Lớp 2 – Confit Framboise:</b> Mứt mâm xôi cô đặc nấu chậm, giữ trọn vị chua ngọt tươi mới.</li><li><b>Lớp 3 – Crémeux Litchi Rose:</b> Nhân kem vải thiều hòa cùng hương hoa hồng – mềm mịn, thanh tao và thơm dịu.</li><li><b>Lớp 4 – Mousse Fromage Blanc:</b> Lớp mousse phô mai trắng mịn như mây, mang vị béo nhẹ và cảm giác tan ngay nơi đầu lưỡi.</li><li><b>Lớp 5 – Shortbread:</b> Đế bánh bơ giòn tan, tạo điểm nhấn hài hòa cho tổng thể.</li></ul><p>Trang trí bằng hoa edible, mâm xôi tươi và lớp xịt nhung trắng (velours) — tinh khôi, thanh lịch.</p>', '<ul class="no-dot"><li>Bảo quản bánh trong hộp kín, giữ ở ngăn mát tủ lạnh (2–6°C).</li><li>Tránh để bánh tiếp xúc trực tiếp với ánh nắng hoặc nhiệt độ phòng quá lâu.</li><li>Bánh ngon nhất khi dùng trong vòng 24 giờ kể từ lúc nhận.</li><li>Nên dùng muỗng lạnh để cảm nhận rõ từng tầng hương vị – mềm, mịn và tan chảy tinh tế.</li></ul>', '<ul class="no-dot"><li>Bộ dao, muỗng và dĩa gỗ mang phong cách thủ công, tinh tế.</li><li>Hộp nến nhỏ để bạn dễ dàng biến chiếc bánh thành món quà hoặc điểm nhấn cho những dịp đặc biệt.</li><li>Thiệp cảm ơn La Cuisine Ngọt – gửi gắm lời chúc ngọt ngào kèm thông điệp từ trái tim.</li></ul>'),
(2, 'Lime and Basil Entremets', 1, '<p>Bánh Entremets Chanh – Húng Quế là sự hòa quyện hoàn hảo giữa vị chua dịu của chanh xanh tươi và hương thơm thanh khiết của lá húng quế. Lớp mousse chanh mịn màng, vừa tươi vừa nhẹ, được điểm xuyết bằng những lá húng quế nghiền nhẹ, tạo cảm giác tươi mới và thanh thoát.</p>', 600000, 680000, 12, 'available', 'assets/images/lime-and-basil-entremets.jpg', 500, 3, TRUE, 'Chanh, Húng Quế và Kem Tươi', 'Chiếc entremets mang sắc xanh ngọc thạch quyến rũ, là bản hòa tấu bất ngờ giữa vị chua sáng rỡ của những trái chanh xanh căng mọng và hương thơm ấm áp, nồng nàn của húng quế.', '<ul><li><b>Lớp 1 – Biscuit Sablé (Đế bánh giòn):</b> Đế bơ giòn rụm, tạo độ tương phản hoàn hảo với phần mousse mềm mại phía trên.</li><li><b>Lớp 2 – Crèmeux Citron Vert (Kem chanh xanh):</b> Nhân kem chua dịu, đậm đặc từ nước cốt và vỏ chanh, mang vị chua thanh khiết, tươi mát.</li><li><b>Lớp 3 – Mousse Basilic (Mousse húng quế):</b> Lớp mousse nhẹ, xốp, thấm đượm hương thơm tinh tế của lá húng quế.</li><li><b>Lớp 4 – Gelée chanh:</b> Một lớp gelée chanh mỏng, tăng độ tươi mới và tạo chiều sâu cho bánh.</li><li><b>Lớp 5 – Miroir Glaze Vert:</b> Lớp phủ bóng màu xanh lá ngọc, giữ độ ẩm và tạo vẻ ngoài hấp dẫn.</li></ul><p>Trang trí: lát chanh tươi và lá húng quế (hoặc bạc hà), điểm xuyết chút đường bột.</p>', '<ul class="no-dot"><li>Bảo quản bánh trong hộp kín, giữ ở ngăn mát tủ lạnh (2–6°C).</li><li>Tránh để bánh tiếp xúc trực tiếp với ánh nắng hoặc nhiệt độ phòng quá lâu.</li><li>Bánh ngon nhất khi dùng trong vòng 24 giờ kể từ lúc nhận.</li><li>Nên dùng muỗng lạnh để cảm nhận rõ từng tầng hương vị – mềm, mịn và tan chảy tinh tế.</li></ul>', '<ul class="no-dot"><li>Bộ dao, muỗng và dĩa gỗ mang phong cách thủ công, tinh tế.</li><li>Hộp nến nhỏ để bạn dễ dàng biến chiếc bánh thành món quà hoặc điểm nhấn cho những dịp đặc biệt.</li><li>Thiệp cảm ơn La Cuisine Ngọt – gửi gắm lời chúc ngọt ngào kèm thông điệp từ trái tim.</li></ul>'),
(3, 'Blanche Figues & Framboises', 1, '<p>Có những ngày, chỉ cần một miếng bánh thôi cũng đủ khiến lòng nhẹ đi đôi chút. Entremets Sung – Mâm Xôi – Sô Cô La Trắng là bản giao hưởng giữa vị chua thanh của mâm xôi, độ ngọt dịu của sung chín và sự béo mịn, thanh tao của sô cô la trắng.</p>', 650000, 750000, 10, 'available', 'assets/images/blanche-figues&framboises.jpg', 550, 3, TRUE, 'Sung – Mâm Xôi – Sô Cô La Trắng', 'Chiếc entremets mang vẻ tinh tế với lớp gương sô cô la trắng bóng mịn bao phủ. Bên trong là bánh bông xốp mâm xôi, compoté sung – mâm xôi dẻo thơm và mousse sô cô la trắng béo nhẹ, tan ngay trong miệng.', '<ul><li><b>Lớp 1 – Cốt bánh mâm xôi:</b> Bánh bông xốp mềm nhẹ, thấm vị chua thanh tự nhiên từ mâm xôi tươi.</li><li><b>Lớp 2 – Compoté sung – mâm xôi:</b> Hỗn hợp trái cây nấu chậm giữ cấu trúc và hương vị.</li><li><b>Lớp 3 – Mousse sô cô la trắng:</b> Mềm mượt, nhẹ bẫng như mây với sô cô la trắng cao cấp.</li><li><b>Lớp 4 – Gương sô cô la trắng:</b> Phủ bề mặt bằng glaçage mịn như lụa.</li></ul>', '<ul class="no-dot"><li>Bảo quản bánh trong hộp kín, giữ ở ngăn mát tủ lạnh (2–6°C).</li><li>Tránh để bánh tiếp xúc trực tiếp với ánh nắng hoặc nhiệt độ phòng quá lâu.</li><li>Bánh ngon nhất khi dùng trong vòng 24 giờ kể từ lúc nhận.</li><li>Nên dùng muỗng lạnh để cảm nhận rõ từng tầng hương vị – mềm, mịn và tan chảy tinh tế.</li></ul>', '<ul class="no-dot"><li>Bộ dao, muỗng và dĩa gỗ mang phong cách thủ công, tinh tế.</li><li>Hộp nến nhỏ để bạn dễ dàng biến chiếc bánh thành món quà hoặc điểm nhấn cho những dịp đặc biệt.</li><li>Thiệp cảm ơn La Cuisine Ngọt – gửi gắm lời chúc ngọt ngào kèm thông điệp từ trái tim.</li></ul>'),
(4, 'Mousse Chanh Dây', 2, '<p>Bánh Mousse Chanh Dây là món tráng miệng tinh tế, mang đến cảm giác tươi mát và sảng khoái ngay từ muỗng đầu tiên. Bánh hòa quyện hoàn hảo vị chua thanh của chanh dây với lớp mousse whipping mềm mịn, béo nhẹ, tan chảy trên đầu lưỡi mà vẫn giữ sự nhẹ nhàng, không ngấy.</p>', 550000, 600000, 25, 'available', 'assets/images/mousse-chanh-day.jpg', 450, 2, TRUE, 'Chanh dây, whipping cream, phô mai mascarpone', 'Chiếc Mousse Chanh Dây là sự kết hợp tinh tế của hương vị nhiệt đới tươi mới. Lớp custard chua thanh hòa quyện cùng những miếng chanh dây mọng nước, điểm xuyết lớp mousse whipping mềm mịn, béo nhẹ, tan ngay trên đầu lưỡi.', '<ul><li><b>Lớp 1 – Đế bánh (Base Cookie / Biscuit):</b> Đế giòn rụm, thơm bơ.</li><li><b>Lớp 2 – Kem chanh dây + Whipping & Mascarpone:</b> Mousse mềm mượt, béo nhẹ và chua thanh.</li><li><b>Lớp 3 – Gelée chanh dây:</b> Lớp gelée tươi mát, hơi sánh nhẹ tăng độ sống động.</li></ul>', '<ul class="no-dot"><li>Bảo quản bánh trong hộp kín, giữ ở ngăn mát tủ lạnh (2–6°C).</li><li>Tránh để bánh tiếp xúc trực tiếp với ánh nắng hoặc nhiệt độ phòng quá lâu.</li><li>Bánh ngon nhất khi dùng trong vòng 24 giờ kể từ lúc nhận.</li><li>Nên dùng muỗng lạnh để cảm nhận rõ từng tầng hương vị – mềm, mịn và tan chảy tinh tế.</li></ul>', '<ul class="no-dot"><li>Bộ dao, muỗng và dĩa gỗ mang phong cách thủ công, tinh tế.</li><li>Hộp nến nhỏ để bạn dễ dàng biến chiếc bánh thành món quà hoặc điểm nhấn cho những dịp đặc biệt.</li><li>Thiệp cảm ơn La Cuisine Ngọt – gửi gắm lời chúc ngọt ngào kèm thông điệp từ trái tim.</li></ul>'),
(5, 'Mousse Dưa Lưới', 2, '<p>Ra đời giữa những ngày oi ả của Sài Gòn, chiếc Bánh Dưa Lưới như mang đến một khoảng trời mát lành và thanh khiết. Lớp mousse mềm mại từ phô mai tươi và kem sữa hòa quyện hoàn hảo với dưa lưới mật Fuji nấu chậm, bên trong là những miếng dưa tươi mọng cùng cốt bánh gato vani ẩm mềm và một chút rượu dưa lưới nồng nàn, tạo nên hương vị tinh tế, dịu dàng nhưng đầy ấn tượng.</p>', 550000, 600000, 20, 'available', 'assets/images/mousse-dua-luoi.jpg', 450, 2, TRUE, 'Dưa lưới hữu cơ, kem sữa, phô mai Mascarpone', 'Bánh có vị thơm và béo nhẹ nhàng từ phô mai tươi kết hợp cùng kem sữa và dưa lưới mật Fuji nấu chậm, bên trong là rất nhiều dưa lưới tươi và cốt bánh gato vani, cùng với một ít rượu dưa lưới nồng nàn.', '<ul><li><b>Lớp 1 – Bánh bông lan vị vani (Vanilla Génoise):</b> Cốt bánh xốp mềm, ẩm mượt.</li><li><b>Lớp 2 – Dưa lưới mật tươi thái hạt lựu:</b> Miếng dưa tươi căng mọng.</li><li><b>Lớp 3 – Mousse dưa lưới:</b> Mousse mềm mượt, béo nhẹ.</li></ul>', '<ul class="no-dot"><li>Bảo quản bánh trong hộp kín, giữ ở ngăn mát tủ lạnh (2–6°C).</li><li>Tránh để bánh tiếp xúc trực tiếp với ánh nắng hoặc nhiệt độ phòng quá lâu.</li><li>Bánh ngon nhất khi dùng trong vòng 24 giờ kể từ lúc nhận.</li><li>Nên dùng muỗng lạnh để cảm nhận rõ từng tầng hương vị – mềm, mịn và tan chảy tinh tế.</li></ul>', '<ul class="no-dot"><li>Bộ dao, muỗng và dĩa gỗ mang phong cách thủ công, tinh tế.</li><li>Hộp nến nhỏ để bạn dễ dàng biến chiếc bánh thành món quà hoặc điểm nhấn cho những dịp đặc biệt.</li><li>Thiệp cảm ơn La Cuisine Ngọt – gửi gắm lời chúc ngọt ngào kèm thông điệp từ trái tim.</li></ul>'),
(6, 'Mousse Việt Quất', 2, '<p>Bánh Mousse Việt Quất là sự kết hợp hoàn hảo giữa vị chua nhẹ thanh mát của quả việt quất và vị béo ngậy của kem tươi. Lớp mousse mịn màng, tan ngay trong miệng, mang lại cảm giác nhẹ nhàng, tươi mới nhưng vẫn đậm đà hương vị tự nhiên. Bánh được điểm xuyết những quả việt quất tươi trên mặt, tạo vẻ ngoài vừa tinh tế vừa sang trọng.</p>', 550000, 600000, 18, 'available', 'assets/images/mousse-viet-quat.jpg', 450, 2, FALSE, 'Việt quất, whipping cream', 'Mousse Việt Quất chinh phục vị giác bằng sắc tím quyến rũ và hương vị trái cây thanh mát. Lớp mousse mềm mượt, hòa quyện cùng vị chua nhẹ, mang lại cảm giác thanh tao và dễ chịu.', '<ul><li><b>Lớp 1 – Đế bánh bơ giòn:</b> Lớp đế cookie được nướng thủ công đến độ vàng ươm, giòn tan, mang hương bơ thơm dịu và vị ngọt vừa phải.</li><li><b>Lớp 2 – Mousse việt quất:</b> Lớp mousse tím nhạt mịn màng như nhung, hoà quyện giữa vị chua thanh của việt quất tươi và vị béo nhẹ của kem tươi.</li><li><b>Lớp 3 – Phủ việt quất tươi:</b> Bề mặt bánh được phủ đầy những quả việt quất tươi mọng nước, điểm xuyết sắc tím quyến rũ.</li></ul>', '<ul class="no-dot"><li>Bảo quản bánh trong hộp kín, giữ ở ngăn mát tủ lạnh (2–6°C).</li><li>Tránh để bánh tiếp xúc trực tiếp với ánh nắng hoặc nhiệt độ phòng quá lâu.</li><li>Bánh ngon nhất khi dùng trong vòng 24 giờ kể từ lúc nhận.</li><li>Nên dùng muỗng lạnh để cảm nhận rõ từng tầng hương vị – mềm, mịn và tan chảy tinh tế.</li></ul>', '<ul class="no-dot"><li>Bộ dao, muỗng và dĩa gỗ mang phong cách thủ công, tinh tế.</li><li>Hộp nến nhỏ để bạn dễ dàng biến chiếc bánh thành món quà hoặc điểm nhấn cho những dịp đặc biệt.</li><li>Thiệp cảm ơn La Cuisine Ngọt – gửi gắm lời chúc ngọt ngào kèm thông điệp từ trái tim.</li></ul>'),
(7, 'Orange Serenade', 3, '<p>Orange Serenade được lấy cảm hứng từ tách trà Earl Grey ấm áp và lát cam tươi mát của mùa hè. Cốt bánh được ủ cùng trà bá tước, mang lại hương trà dịu nhẹ, thanh thoát. Xen giữa các lớp bánh là phần xốt cam chua ngọt và kem phô mai béo mịn — hòa quyện vừa đủ để tạo nên vị ngọt thanh, tròn đầy.</p>', 550000, 600000, 15, 'available', 'assets/images/orange-serenade.jpg', 600, 3, FALSE, 'Cam tươi, Earl Grey, kem phô mai, whipping cream', 'Chiếc bánh là sự kết hợp thanh tao giữa vị trà bá tước Earl Grey dịu nhẹ và vị cam tươi sáng chua ngọt. Cảm giác béo mịn, thoang thoảng hương trà và thoảng vị cam mọng nước như một buổi chiều hè dịu nắng.', '<ul><li><b>Lớp 1 – Gato trà bá tước (Earl Grey sponge):</b> Cốt bánh mềm ẩm, ủ cùng trà bá tước.</li><li><b>Lớp 2 – Jelly cam (Orange jelly):</b> Thạch cam mát lạnh, dẻo nhẹ.</li><li><b>Lớp 3 – Kem phô mai cam (Orange cream cheese):</b> Kem phô mai chua nhẹ, béo mịn.</li><li><b>Lớp 4 – Earl Grey cream:</b> Lớp kem trà mịn mượt.</li></ul>', '<ul class="no-dot"><li>Bảo quản bánh trong hộp kín, giữ ở ngăn mát tủ lạnh (2–6°C).</li><li>Tránh để bánh tiếp xúc trực tiếp với ánh nắng hoặc nhiệt độ phòng quá lâu.</li><li>Bánh ngon nhất khi dùng trong vòng 24 giờ kể từ lúc nhận.</li><li>Nên dùng muỗng lạnh để cảm nhận rõ từng tầng hương vị – mềm, mịn và tan chảy tinh tế.</li></ul>', '<ul class="no-dot"><li>Bộ dao, muỗng và dĩa gỗ mang phong cách thủ công, tinh tế.</li><li>Hộp nến nhỏ để bạn dễ dàng biến chiếc bánh thành món quà hoặc điểm nhấn cho những dịp đặc biệt.</li><li>Thiệp cảm ơn La Cuisine Ngọt – gửi gắm lời chúc ngọt ngào kèm thông điệp từ trái tim.</li></ul>'),
(8, 'Strawberry Cloud Cake', 3, '<p>Strawberry Cloud Cake là chiếc bánh mang phong vị tươi sáng của những trái dâu mọng và việt quất ngọt thanh, kết hợp cùng lớp kem tươi mềm nhẹ và cốt bánh vani thơm dịu. Mỗi lát bánh là sự giao hòa giữa vị trái cây tươi mát, vị ngọt dịu của kem và cốt bánh ẩm mịn, tạo nên cảm giác trong trẻo và đầy sức sống.</p>', 500000, 550000, 12, 'available', 'assets/images/strawberry-cloud-cake.jpg', 650, 3, FALSE, 'Dâu tươi, việt quất, kem tươi Pháp, cốt bánh vanilla mềm ẩm', 'Chiếc bánh kem mang sắc trắng thanh khiết, điểm xuyết tầng dâu đỏ và việt quất xanh tím rực rỡ. Từng lớp bánh là sự hòa quyện giữa vị béo nhẹ của kem tươi, vị ngọt thanh của trái cây và cốt bánh vanilla mềm mịn — đơn giản mà tinh tế, như một áng mây ngọt ngào dành tặng những khoảnh khắc yêu thương.', '<ul><li><b>Lớp 1 – Cốt bánh vanilla mềm ẩm:</b> Lớp nền truyền thống, mềm mịn.</li><li><b>Lớp 2 – Kem tươi whipping nhẹ béo:</b> Kem đánh bông mềm mịn.</li><li><b>Lớp 3 – Mặt bánh phủ dâu tây & việt quất tươi:</b> Trái cây tươi trang trí trên mặt.</li></ul>', '<ul class="no-dot"><li>Bảo quản bánh trong hộp kín, giữ ở ngăn mát tủ lạnh (2–6°C).</li><li>Tránh để bánh tiếp xúc trực tiếp với ánh nắng hoặc nhiệt độ phòng quá lâu.</li><li>Bánh ngon nhất khi dùng trong vòng 24 giờ kể từ lúc nhận.</li><li>Nên dùng muỗng lạnh để cảm nhận rõ từng tầng hương vị – mềm, mịn và tan chảy tinh tế.</li></ul>', '<ul class="no-dot"><li>Bộ dao, muỗng và dĩa gỗ mang phong cách thủ công, tinh tế.</li><li>Hộp nến nhỏ để bạn dễ dàng biến chiếc bánh thành món quà hoặc điểm nhấn cho những dịp đặc biệt.</li><li>Thiệp cảm ơn La Cuisine Ngọt – gửi gắm lời chúc ngọt ngào kèm thông điệp từ trái tim.</li></ul>'),
(9, 'Earl Grey Bloom', 3, '<p>Earl Grey Bloom là bản hòa ca của trà, trái cây và hương hoa — chiếc bánh dành riêng cho những ai yêu nét đẹp nhẹ nhàng, thanh lịch. Cốt bánh mềm mịn được ủ với lá trà bá tước hảo hạng, tỏa hương thơm thanh mát đặc trưng của cam bergamot.</p>', 500000, 550000, 10, 'available', 'assets/images/earl-grey-bloom.jpg', 650, 3, TRUE, 'Trà bá tước, xoài tươi, dâu tây, whipping cream', 'Chiếc bánh là phiên bản đặc biệt của dòng Earl Grey cake — mang hương vị thanh nhã, nhẹ nhàng và đầy nữ tính. Lớp cốt trà bá tước thơm dịu kết hợp cùng vị trái cây tươi chua ngọt, tạo nên tổng thể hài hòa, tinh tế và dễ chịu.', '<ul><li><b>Lớp 1 – Cốt bánh Earl Grey:</b> Bông lan mềm ẩm, ủ cùng trà bá tước.</li><li><b>Lớp 2 – Nhân trái cây tươi:</b> Xoài chín và dâu tây tươi xen kẽ.</li><li><b>Lớp 3 – Kem Earl Grey:</b> Kem whipping pha chiết xuất trà bá tước.</li></ul>', '<ul class="no-dot"><li>Bảo quản bánh trong hộp kín, giữ ở ngăn mát tủ lạnh (2–6°C).</li><li>Tránh để bánh tiếp xúc trực tiếp với ánh nắng hoặc nhiệt độ phòng quá lâu.</li><li>Bánh ngon nhất khi dùng trong vòng 24 giờ kể từ lúc nhận.</li><li>Nên dùng muỗng lạnh để cảm nhận rõ từng tầng hương vị – mềm, mịn và tan chảy tinh tế.</li></ul>', '<ul class="no-dot"><li>Bộ dao, muỗng và dĩa gỗ mang phong cách thủ công, tinh tế.</li><li>Hộp nến nhỏ để bạn dễ dàng biến chiếc bánh thành món quà hoặc điểm nhấn cho những dịp đặc biệt.</li><li>Thiệp cảm ơn La Cuisine Ngọt – gửi gắm lời chúc ngọt ngào kèm thông điệp từ trái tim.</li></ul>'),
(10, 'Nón Sinh Nhật', 4, 'Nón sinh nhật xinh xắn', 10000, 10000, 200, 'available', 'assets/images/non.jpg', 20, 365, FALSE, '', '', '', '', ''),
(11, 'Pháo Hoa', 4, 'Pháo hoa trang trí bánh', 55000, 55000, 150, 'available', 'assets/images/phaohoa.jpg', 50, 365, FALSE, '', '', '', '', ''),
(12, 'Bóng Bay và Dây Trang Trí', 4, 'Set bóng bay và dây trang trí', 40000, 40000, 100, 'available', 'assets/images/trang-tri.jpg', 100, 365, FALSE, '', '', '', '', '');

-- 4. Promotions
-- Note: Promotion INSERTs with ImageURL are below (lines 425-465)
-- This old INSERT is kept for reference but will be replaced by the ones below with ImageURL
-- INSERT INTO Promotions
--   (PromotionCode, PromotionName, PromotionType, DiscountValue, MinOrderValue, Status, StartDate, EndDate, ImageURL)
-- VALUES
--   ('GIAM10TRON15', 'Giảm 10% cho đơn từ 150.000đ', 'percent', 10, 150000, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'assets/images/buy-1-get-1.jpg'),
--   ('FREESHIPLOYAL', 'Miễn phí giao hàng khách hàng thân thiết', 'free_shipping', 0, 0, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'assets/images/free-ship.jpg'),
--   ('FIRSTORDER10', 'Giảm 10% cho đơn hàng đầu tiên trong năm', 'percent', 10, 0, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 365 DAY), 'assets/images/gg.jpg');

-- 5. Orders (Đơn hàng mẫu)
INSERT INTO Orders (OrderID, OrderCode, CustomerID, CustomerName, CustomerPhone, CustomerEmail, ShippingAddress, Ward, District, City, TotalAmount, DiscountAmount, ShippingFee, FinalAmount, PaymentMethod, PaymentStatus, OrderStatus, Note, CreatedAt, CompletedAt) VALUES
(1, 'ORD001', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1200000, 0, 30000, 1230000, 'cod', 'paid', 'completed', NULL, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'ORD002', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1100000, 50000, 30000, 1080000, 'bank_transfer', 'paid', 'shipping', NULL, DATE_SUB(NOW(), INTERVAL 2 DAY), NULL),
(3, 'ORD003', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1750000, 0, 30000, 1780000, 'momo', 'paid', 'preparing', 'Giao sau 15h', DATE_SUB(NOW(), INTERVAL 1 DAY), NULL),
(4, 'ORD004', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1000000, 0, 30000, 1030000, 'cod', 'pending', 'pending', NULL, NOW(), NULL),
(5, 'ORD005', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 2200000, 100000, 30000, 2130000, 'bank_transfer', 'paid', 'completed', NULL, DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 22 DAY));

-- 6. Order Items (Chi tiết đơn hàng)
INSERT INTO OrderItems (OrderID, ProductID, ProductName, ProductPrice, Quantity, Subtotal, Note) VALUES
-- Đơn 1
(1, 1, 'Entremets Rose', 650000, 1, 650000, NULL),
(1, 4, 'Mousse Chanh Dây', 550000, 1, 550000, NULL),
-- Đơn 2
(2, 2, 'Lime and Basil Entremets', 600000, 1, 600000, NULL),
(2, 5, 'Mousse Dưa Lưới', 550000, 1, 550000, NULL),
-- Đơn 3
(3, 3, 'Blanche Figues & Framboises', 650000, 1, 650000, 'Ít ngọt'),
(3, 9, 'Strawberry Cloud Cake', 500000, 1, 500000, NULL),
(3, 6, 'Mousse Việt Quất', 550000, 1, 550000, NULL),
(3, 10, 'Nón Sinh Nhật', 10000, 5, 50000, NULL),
-- Đơn 4
(4, 7, 'Rustic Coffee Cake', 450000, 1, 450000, NULL),
(4, 8, 'Serenity Cake', 500000, 1, 500000, NULL),
(4, 11, 'Pháo Hoa', 55000, 1, 55000, NULL),
-- Đơn 5
(5, 1, 'Entremets Rose', 650000, 2, 1300000, NULL),
(5, 4, 'Mousse Chanh Dây', 550000, 1, 550000, NULL),
(5, 9, 'Strawberry Cloud Cake', 500000, 1, 500000, NULL);

-- 7. Order Status History
INSERT INTO OrderStatusHistory (OrderID, OldStatus, NewStatus, ChangedBy, Note, CreatedAt) VALUES
(1, 'pending', 'confirmed', 1, 'Đơn hàng đã được xác nhận', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, 'confirmed', 'preparing', 1, 'Đang chuẩn bị bánh', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, 'preparing', 'shipping', 1, 'Đã giao cho shipper', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, 'shipping', 'completed', 1, 'Giao hàng thành công', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'pending', 'confirmed', 1, 'Đơn hàng đã được xác nhận', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'confirmed', 'preparing', 1, 'Đang chuẩn bị bánh', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 'preparing', 'shipping', 1, 'Đang giao hàng', NOW()),
(3, 'pending', 'confirmed', 1, 'Đơn hàng đã xác nhận', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 'confirmed', 'preparing', 1, 'Đang chuẩn bị', NOW()),
(5, 'pending', 'completed', 1, 'Đơn hàng hoàn thành', DATE_SUB(NOW(), INTERVAL 22 DAY));

-- 8. Reviews (Đánh giá sản phẩm)
INSERT INTO Reviews (ProductID, UserID, OrderID, Rating, Title, Content, IsVerifiedPurchase, Status, CreatedAt) VALUES
(1, 3, 1, 5, 'Bánh rất ngon!', 'Entremets Rose vị ngon, đẹp mắt, phục vụ tiệc sinh nhật rất ổn. Sẽ ủng hộ shop tiếp!', TRUE, 'approved', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 3, 1, 4, 'Mousse chanh dây tươi mát', 'Vị chanh dây rất thơm, bánh mềm mịn. Chỉ có điều hơi chua một chút với mình.', TRUE, 'approved', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 4, 2, 5, 'Tuyệt vời!', 'Bánh Lime and Basil độc đáo, kết hợp vị chanh và húng quế rất mới lạ. Recommend!', TRUE, 'approved', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 3, 5, 5, 'Chất lượng tuyệt hảo', 'Blanche Figues & Framboises xứng đáng 5 sao. Sang trọng, ngon miệng.', TRUE, 'approved', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(9, 3, 5, 4, 'Bánh dâu ngon', 'Strawberry Cloud Cake nhẹ nhàng, vị dâu tươi. Đóng gói đẹp.', TRUE, 'pending', DATE_SUB(NOW(), INTERVAL 20 DAY));

-- 9. Complaints (Khiếu nại)
INSERT INTO Complaints (ComplaintID, ComplaintCode, OrderID, CustomerID, ComplaintType, Title, Content, Status, Priority, CreatedAt, Resolution, ResolvedAt) VALUES
(1, 'CPL001', 1, 3, 'product_quality', 'Bánh bị móp một góc', 'Khi nhận hàng, bánh Entremets Rose bị móp góc do quá trình vận chuyển. Tôi muốn được đổi sản phẩm mới.', 'processing', 'high', DATE_SUB(NOW(), INTERVAL 3 DAY), NULL, NULL),
(2, 'CPL002', 5, 3, 'delivery', 'Giao hàng trễ 1 ngày', 'Đơn hàng được hẹn giao vào ngày 20/12 nhưng đến ngày 21/12 mới nhận được.', 'resolved', 'medium', DATE_SUB(NOW(), INTERVAL 10 DAY), 'Shop xin lỗi khách hàng và đã hoàn lại 50,000đ phí ship. Đã tặng voucher 100,000đ cho lần mua tiếp theo.', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 'CPL003', 2, 4, 'service', 'Nhân viên tư vấn chưa nhiệt tình', 'Khi gọi điện hỏi về sản phẩm, nhân viên trả lời khá nhanh và không giải thích rõ ràng.', 'pending', 'low', DATE_SUB(NOW(), INTERVAL 1 DAY), NULL, NULL);

-- 10. Complaint Responses
INSERT INTO ComplaintResponses (ComplaintID, UserID, UserType, Content, CreatedAt) VALUES
(1, 1, 'admin', 'Chúng tôi xin lỗi về sự cố này. Shop sẽ giao sản phẩm mới cho bạn trong ngày hôm nay.', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 3, 'customer', 'Cảm ơn shop đã xử lý nhanh chóng!', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 1, 'admin', 'Shop rất vui khi bạn hài lòng. Mong bạn tiếp tục ủng hộ!', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- 11. Cart (Giỏ hàng mẫu)
INSERT INTO Cart (UserID, ProductID, Quantity, Note) VALUES
(3, 7, 1, NULL),
(3, 12, 2, NULL),
(4, 1, 1, 'Ít ngọt nhé shop'),
(4, 10, 3, NULL);

-- 12. Wishlist (Danh sách yêu thích)
INSERT INTO Wishlist (UserID, ProductID) VALUES
(3, 2),
(3, 6),
(4, 3),
(4, 8);

-- 13. Product Images (Hình ảnh sản phẩm)
INSERT INTO ProductImages (ProductID, ImageURL, AltText, IsPrimary, DisplayOrder) VALUES
(1, 'assets/images/entremets-rose.jpg', 'Entremets Rose - View 1', TRUE, 1),
(2, 'assets/images/lime-and-basil-entremets.jpg', 'Lime and Basil - View 1', TRUE, 1),
(3, 'assets/images/blanche-figues&framboises.jpg', 'Blanche Figues - View 1', TRUE, 1);

-- 14. Promotion Usage & New Promotions (FIXED no duplicate)
INSERT INTO Promotions 
  (PromotionCode, PromotionName, Description, PromotionType, DiscountValue, MinOrderValue, Quantity, StartDate, EndDate, Status, CustomerType, CreatedBy, ImageURL)
VALUES
  ('GIAM10TRON15', 'Giảm 10% cho đơn trên 1.500.000đ', 
   'Giảm 10% giá trị đơn hàng từ 1.500.000đ.', 
   'percent', 10, 1500000, 200, '2025-11-01 00:00:00', '2025-11-15 23:59:59', 
   'active', 'all', 1, 'assets/images/buy-1-get-1.jpg')
ON DUPLICATE KEY UPDATE
    PromotionName = VALUES(PromotionName),
    Description   = VALUES(Description),
    DiscountValue = VALUES(DiscountValue),
    Status        = VALUES(Status),
    ImageURL      = VALUES(ImageURL);

INSERT INTO Promotions 
  (PromotionCode, PromotionName, Description, PromotionType, DiscountValue, MinOrderValue, Quantity, StartDate, EndDate, Status, CustomerType, CreatedBy, ImageURL)
VALUES
  ('FREESHIPLOYAL', 'Miễn phí giao hàng', 
   'Áp dụng cho khách hàng thân thiết.', 
   'free_shipping', 0, 0, -1, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 
   'active', 'loyal', 1, 'assets/images/free-ship.jpg')
ON DUPLICATE KEY UPDATE
    PromotionName = VALUES(PromotionName),
    Description   = VALUES(Description),
    Status        = VALUES(Status),
    ImageURL      = VALUES(ImageURL);

INSERT INTO Promotions 
  (PromotionCode, PromotionName, Description, PromotionType, DiscountValue, MinOrderValue, Quantity, StartDate, EndDate, Status, CustomerType, CreatedBy, ImageURL)
VALUES
  ('FIRSTORDER10', 'Giảm 10% cho đơn hàng đầu tiên trong năm', 
   'Áp dụng giảm 10% cho đơn hàng đầu tiên của mỗi khách hàng trong năm.', 
   'percent', 10, 0, -1, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 
   'active', 'all', 1, 'assets/images/gg.jpg')
ON DUPLICATE KEY UPDATE
    PromotionName = VALUES(PromotionName),
    Description   = VALUES(Description),
    DiscountValue = VALUES(DiscountValue),
    Status        = VALUES(Status),
    ImageURL      = VALUES(ImageURL);

-- Thêm vào cuối file schema.sql trước phần INSERT dữ liệu mẫu

-- 15. CONTACTS (Bảng mới)
CREATE TABLE Contacts (
    ContactID INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID INT NOT NULL,              -- ID của khách hàng gửi (từ bảng Users)
    Subject VARCHAR(255) NOT NULL,        -- Tiêu đề liên hệ
    Message TEXT NOT NULL,                -- Nội dung liên hệ
    Status ENUM('pending', 'responded') DEFAULT 'pending', -- Trạng thái
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,         -- Ngày gửi
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Ngày cập nhật trạng thái
    RespondedBy INT NULL,                 -- ID nhân viên đã phản hồi (từ bảng Users)
    RespondedAt TIMESTAMP NULL,           -- Thời điểm phản hồi

    FOREIGN KEY (CustomerID) REFERENCES Users(UserID),
    FOREIGN KEY (RespondedBy) REFERENCES Users(UserID)
);

-- Thêm Index
CREATE INDEX IX_Contacts_Status ON Contacts(Status);
CREATE INDEX IX_Contacts_CustomerID ON Contacts(CustomerID);

-- (Optional) Thêm dữ liệu mẫu nếu muốn
-- INSERT INTO Contacts (CustomerID, Subject, Message) VALUES
-- (3, 'Hỏi về bánh Entremet', 'Cho mình hỏi bánh Entremet Rose còn hàng không?'),
-- (4, 'Góp ý về giao hàng', 'Shipper giao hàng hơi chậm, mong shop cải thiện.');

-- (Optional) Thêm dữ liệu mẫu cho bảng Contacts
INSERT INTO Contacts (CustomerID, Subject, Message, Status, CreatedAt) VALUES
(3, 'Hỏi về bánh Entremet', 'Cho mình hỏi bánh Entremets Rose còn hàng không?', 'pending', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 'Góp ý về giao hàng', 'Shipper giao hàng hôm qua hơi chậm, mong shop có thể cải thiện dịch vụ.', 'pending', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 'Yêu cầu tư vấn bánh Mousse', 'Mình muốn đặt bánh Mousse Chanh Dây cho tiệc sinh nhật 10 người, shop tư vấn giúp mình kích thước nhé.', 'responded', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, 'Phản hồi về chất lượng Strawberry Cloud Cake', 'Bánh Strawberry Cloud Cake lần trước mình đặt rất ngon, cảm ơn shop!', 'responded', DATE_SUB(NOW(), INTERVAL 3 DAY));

-- Cập nhật trạng thái và người phản hồi cho các liên hệ mẫu đã phản hồi
-- Giả sử nhân viên staff01 (UserID=2) đã phản hồi
UPDATE Contacts SET RespondedBy = 2, RespondedAt = DATE_SUB(NOW(), INTERVAL 4 DAY) WHERE ContactID = 3; -- Mousse Chanh Dây
UPDATE Contacts SET RespondedBy = 2, RespondedAt = DATE_SUB(NOW(), INTERVAL 2 DAY) WHERE ContactID = 4; -- Strawberry Cloud Cake

-- ============================================
-- DỮ LIỆU MẪU CHO BÁO CÁO: Orders năm 2024 và 2025
-- ============================================

-- Năm 2024: 12 tháng với doanh thu mẫu
INSERT INTO Orders (OrderCode, CustomerID, CustomerName, CustomerPhone, CustomerEmail, ShippingAddress, Ward, District, City, TotalAmount, DiscountAmount, ShippingFee, FinalAmount, PaymentMethod, PaymentStatus, OrderStatus, CreatedAt, CompletedAt) VALUES
-- Tháng 1/2024
('ORD20240101', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1500000, 0, 30000, 1530000, 'cod', 'paid', 'completed', '2024-01-15 10:00:00', '2024-01-17 14:00:00'),
('ORD20240102', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 2200000, 100000, 30000, 2130000, 'bank_transfer', 'paid', 'completed', '2024-01-20 11:00:00', '2024-01-22 15:00:00'),
-- Tháng 2/2024
('ORD20240201', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1800000, 50000, 30000, 1780000, 'cod', 'paid', 'completed', '2024-02-10 09:00:00', '2024-02-12 13:00:00'),
('ORD20240202', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1300000, 0, 30000, 1330000, 'momo', 'paid', 'completed', '2024-02-25 14:00:00', '2024-02-27 16:00:00'),
-- Tháng 3/2024
('ORD20240301', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1950000, 0, 30000, 1980000, 'cod', 'paid', 'completed', '2024-03-05 10:00:00', '2024-03-07 14:00:00'),
('ORD20240302', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1650000, 50000, 30000, 1630000, 'bank_transfer', 'paid', 'completed', '2024-03-18 11:00:00', '2024-03-20 15:00:00'),
-- Tháng 4/2024
('ORD20240401', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 2100000, 100000, 30000, 2030000, 'cod', 'paid', 'completed', '2024-04-12 09:00:00', '2024-04-14 13:00:00'),
('ORD20240402', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1400000, 0, 30000, 1430000, 'momo', 'paid', 'completed', '2024-04-28 14:00:00', '2024-04-30 16:00:00'),
-- Tháng 5/2024
('ORD20240501', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1750000, 0, 30000, 1780000, 'cod', 'paid', 'completed', '2024-05-08 10:00:00', '2024-05-10 14:00:00'),
('ORD20240502', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1900000, 50000, 30000, 1880000, 'bank_transfer', 'paid', 'completed', '2024-05-22 11:00:00', '2024-05-24 15:00:00'),
-- Tháng 6/2024
('ORD20240601', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 2250000, 100000, 30000, 2180000, 'cod', 'paid', 'completed', '2024-06-03 09:00:00', '2024-06-05 13:00:00'),
('ORD20240602', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1550000, 0, 30000, 1580000, 'momo', 'paid', 'completed', '2024-06-19 14:00:00', '2024-06-21 16:00:00'),
-- Tháng 7/2024
('ORD20240701', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1850000, 50000, 30000, 1830000, 'cod', 'paid', 'completed', '2024-07-11 10:00:00', '2024-07-13 14:00:00'),
('ORD20240702', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 2000000, 0, 30000, 2030000, 'bank_transfer', 'paid', 'completed', '2024-07-26 11:00:00', '2024-07-28 15:00:00'),
-- Tháng 8/2024
('ORD20240801', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1650000, 0, 30000, 1680000, 'cod', 'paid', 'completed', '2024-08-07 09:00:00', '2024-08-09 13:00:00'),
('ORD20240802', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 2150000, 100000, 30000, 2080000, 'momo', 'paid', 'completed', '2024-08-23 14:00:00', '2024-08-25 16:00:00'),
-- Tháng 9/2024
('ORD20240901', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1950000, 50000, 30000, 1930000, 'cod', 'paid', 'completed', '2024-09-14 10:00:00', '2024-09-16 14:00:00'),
('ORD20240902', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1700000, 0, 30000, 1730000, 'bank_transfer', 'paid', 'completed', '2024-09-29 11:00:00', '2024-10-01 15:00:00'),
-- Tháng 10/2024
('ORD20241001', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 2050000, 0, 30000, 2080000, 'cod', 'paid', 'completed', '2024-10-09 09:00:00', '2024-10-11 13:00:00'),
('ORD20241002', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1800000, 50000, 30000, 1780000, 'momo', 'paid', 'completed', '2024-10-24 14:00:00', '2024-10-26 16:00:00'),
-- Tháng 11/2024
('ORD20241101', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1900000, 100000, 30000, 1830000, 'cod', 'paid', 'completed', '2024-11-05 10:00:00', '2024-11-07 14:00:00'),
('ORD20241102', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1600000, 0, 30000, 1630000, 'bank_transfer', 'paid', 'completed', '2024-11-20 11:00:00', '2024-11-22 15:00:00'),
-- Tháng 12/2024
('ORD20241201', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 2400000, 100000, 30000, 2330000, 'cod', 'paid', 'completed', '2024-12-12 09:00:00', '2024-12-14 13:00:00'),
('ORD20241202', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 2200000, 0, 30000, 2230000, 'momo', 'paid', 'completed', '2024-12-28 14:00:00', '2024-12-30 16:00:00'),
-- Năm 2025: 10 tháng (tháng 1-10)
-- Tháng 1/2025
('ORD20250101', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1600000, 0, 30000, 1630000, 'cod', 'paid', 'completed', '2025-01-10 10:00:00', '2025-01-12 14:00:00'),
('ORD20250102', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1950000, 50000, 30000, 1930000, 'bank_transfer', 'paid', 'completed', '2025-01-25 11:00:00', '2025-01-27 15:00:00'),
-- Tháng 2/2025
('ORD20250201', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1850000, 0, 30000, 1880000, 'cod', 'paid', 'completed', '2025-02-08 09:00:00', '2025-02-10 13:00:00'),
('ORD20250202', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 2100000, 100000, 30000, 2030000, 'momo', 'paid', 'completed', '2025-02-22 14:00:00', '2025-02-24 16:00:00'),
-- Tháng 3/2025
('ORD20250301', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1750000, 50000, 30000, 1730000, 'cod', 'paid', 'completed', '2025-03-15 10:00:00', '2025-03-17 14:00:00'),
('ORD20250302', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 2000000, 0, 30000, 2030000, 'bank_transfer', 'paid', 'completed', '2025-03-28 11:00:00', '2025-03-30 15:00:00'),
-- Tháng 4/2025
('ORD20250401', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1900000, 0, 30000, 1930000, 'cod', 'paid', 'completed', '2025-04-12 09:00:00', '2025-04-14 13:00:00'),
('ORD20250402', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 2250000, 100000, 30000, 2180000, 'momo', 'paid', 'completed', '2025-04-26 14:00:00', '2025-04-28 16:00:00'),
-- Tháng 5/2025
('ORD20250501', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1650000, 50000, 30000, 1630000, 'cod', 'paid', 'completed', '2025-05-09 10:00:00', '2025-05-11 14:00:00'),
('ORD20250502', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 2150000, 0, 30000, 2180000, 'bank_transfer', 'paid', 'completed', '2025-05-23 11:00:00', '2025-05-25 15:00:00'),
-- Tháng 6/2025
('ORD20250601', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1800000, 0, 30000, 1830000, 'cod', 'paid', 'completed', '2025-06-06 09:00:00', '2025-06-08 13:00:00'),
('ORD20250602', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1950000, 50000, 30000, 1930000, 'momo', 'paid', 'completed', '2025-06-20 14:00:00', '2025-06-22 16:00:00'),
-- Tháng 7/2025
('ORD20250701', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 2050000, 100000, 30000, 1980000, 'cod', 'paid', 'completed', '2025-07-13 10:00:00', '2025-07-15 14:00:00'),
('ORD20250702', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1700000, 0, 30000, 1730000, 'bank_transfer', 'paid', 'completed', '2025-07-27 11:00:00', '2025-07-29 15:00:00'),
-- Tháng 8/2025
('ORD20250801', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1850000, 50000, 30000, 1830000, 'cod', 'paid', 'completed', '2025-08-10 09:00:00', '2025-08-12 13:00:00'),
('ORD20250802', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 2200000, 0, 30000, 2230000, 'momo', 'paid', 'completed', '2025-08-24 14:00:00', '2025-08-26 16:00:00'),
-- Tháng 9/2025
('ORD20250901', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1950000, 100000, 30000, 1880000, 'cod', 'paid', 'completed', '2025-09-07 10:00:00', '2025-09-09 14:00:00'),
('ORD20250902', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1600000, 0, 30000, 1630000, 'bank_transfer', 'paid', 'completed', '2025-09-21 11:00:00', '2025-09-23 15:00:00'),
-- Tháng 10/2025
('ORD20251001', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 2100000, 0, 30000, 2130000, 'cod', 'paid', 'completed', '2025-10-14 09:00:00', '2025-10-16 13:00:00'),
('ORD20251002', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1800000, 50000, 30000, 1780000, 'momo', 'paid', 'completed', '2025-10-28 14:00:00', '2025-10-30 16:00:00'),
-- Thêm đơn hàng cho mỗi tháng để đủ dữ liệu khớp với biểu đồ cột
-- Tháng 1/2024 - thêm 3 đơn hàng
('ORD20240103', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 2000000, 50000, 30000, 1980000, 'cod', 'paid', 'completed', '2024-01-08 14:00:00', '2024-01-10 16:00:00'),
('ORD20240104', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1600000, 0, 30000, 1630000, 'momo', 'paid', 'completed', '2024-01-18 11:00:00', '2024-01-20 15:00:00'),
('ORD20240105', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1900000, 100000, 30000, 1830000, 'bank_transfer', 'paid', 'completed', '2024-01-25 10:00:00', '2024-01-27 14:00:00'),
-- Tháng 2/2024 - thêm 3 đơn hàng
('ORD20240203', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1650000, 0, 30000, 1680000, 'cod', 'paid', 'completed', '2024-02-05 09:00:00', '2024-02-07 13:00:00'),
('ORD20240204', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1700000, 50000, 30000, 1680000, 'momo', 'paid', 'completed', '2024-02-15 14:00:00', '2024-02-17 16:00:00'),
('ORD20240205', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1550000, 50000, 30000, 1530000, 'bank_transfer', 'paid', 'completed', '2024-02-20 10:00:00', '2024-02-22 14:00:00'),
-- Tháng 3/2024 - thêm 3 đơn hàng
('ORD20240303', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1850000, 100000, 30000, 1780000, 'cod', 'paid', 'completed', '2024-03-10 11:00:00', '2024-03-12 15:00:00'),
('ORD20240304', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1750000, 0, 30000, 1780000, 'momo', 'paid', 'completed', '2024-03-22 09:00:00', '2024-03-24 13:00:00'),
('ORD20240305', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1600000, 50000, 30000, 1580000, 'bank_transfer', 'paid', 'completed', '2024-03-28 14:00:00', '2024-03-30 16:00:00'),
-- Tháng 4/2024 - thêm 3 đơn hàng
('ORD20240403', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1650000, 50000, 30000, 1630000, 'cod', 'paid', 'completed', '2024-04-05 10:00:00', '2024-04-07 14:00:00'),
('ORD20240404', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1900000, 100000, 30000, 1830000, 'momo', 'paid', 'completed', '2024-04-15 11:00:00', '2024-04-17 15:00:00'),
('ORD20240405', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1700000, 0, 30000, 1730000, 'bank_transfer', 'paid', 'completed', '2024-04-22 09:00:00', '2024-04-24 13:00:00'),
-- Tháng 5/2024 - thêm 5 đơn hàng (để có tổng Subtotal khớp với biểu đồ)
('ORD20240503', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1650000, 50000, 30000, 1630000, 'cod', 'paid', 'completed', '2024-05-03 09:00:00', '2024-05-05 13:00:00'),
('ORD20240504', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1950000, 100000, 30000, 1880000, 'momo', 'paid', 'completed', '2024-05-12 14:00:00', '2024-05-14 16:00:00'),
('ORD20240505', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1800000, 0, 30000, 1830000, 'bank_transfer', 'paid', 'completed', '2024-05-17 10:00:00', '2024-05-19 14:00:00'),
('ORD20240506', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 2000000, 50000, 30000, 1980000, 'cod', 'paid', 'completed', '2024-05-26 11:00:00', '2024-05-28 15:00:00'),
('ORD20240507', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1750000, 100000, 30000, 1680000, 'momo', 'paid', 'completed', '2024-05-29 09:00:00', '2024-05-31 13:00:00'),
-- Tháng 6/2024 - thêm 3 đơn hàng
('ORD20240603', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1700000, 0, 30000, 1730000, 'cod', 'paid', 'completed', '2024-06-10 14:00:00', '2024-06-12 16:00:00'),
('ORD20240604', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1900000, 50000, 30000, 1880000, 'momo', 'paid', 'completed', '2024-06-14 10:00:00', '2024-06-16 14:00:00'),
('ORD20240605', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1600000, 50000, 30000, 1580000, 'bank_transfer', 'paid', 'completed', '2024-06-25 11:00:00', '2024-06-27 15:00:00'),
-- Tháng 7/2024 - thêm 3 đơn hàng
('ORD20240703', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1650000, 50000, 30000, 1630000, 'cod', 'paid', 'completed', '2024-07-05 09:00:00', '2024-07-07 13:00:00'),
('ORD20240704', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1950000, 100000, 30000, 1880000, 'momo', 'paid', 'completed', '2024-07-16 14:00:00', '2024-07-18 16:00:00'),
('ORD20240705', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1800000, 0, 30000, 1830000, 'bank_transfer', 'paid', 'completed', '2024-07-22 10:00:00', '2024-07-24 14:00:00'),
-- Tháng 8/2024 - thêm 3 đơn hàng
('ORD20240803', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1700000, 50000, 30000, 1680000, 'cod', 'paid', 'completed', '2024-08-12 14:00:00', '2024-08-14 16:00:00'),
('ORD20240804', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1950000, 100000, 30000, 1880000, 'momo', 'paid', 'completed', '2024-08-18 09:00:00', '2024-08-20 13:00:00'),
('ORD20240805', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1600000, 0, 30000, 1630000, 'bank_transfer', 'paid', 'completed', '2024-08-28 11:00:00', '2024-08-30 15:00:00'),
-- Tháng 9/2024 - thêm 3 đơn hàng
('ORD20240903', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1650000, 50000, 30000, 1630000, 'cod', 'paid', 'completed', '2024-09-08 10:00:00', '2024-09-10 14:00:00'),
('ORD20240904', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1900000, 100000, 30000, 1830000, 'momo', 'paid', 'completed', '2024-09-19 14:00:00', '2024-09-21 16:00:00'),
('ORD20240905', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1750000, 0, 30000, 1780000, 'bank_transfer', 'paid', 'completed', '2024-09-25 09:00:00', '2024-09-27 13:00:00'),
-- Tháng 10/2024 - thêm 5 đơn hàng (tháng này có doanh thu cao)
('ORD20241003', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 2250000, 100000, 30000, 2180000, 'cod', 'paid', 'completed', '2024-10-03 11:00:00', '2024-10-05 15:00:00'),
('ORD20241004', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 2400000, 0, 30000, 2430000, 'momo', 'paid', 'completed', '2024-10-13 09:00:00', '2024-10-15 13:00:00'),
('ORD20241005', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 2100000, 50000, 30000, 2080000, 'bank_transfer', 'paid', 'completed', '2024-10-19 14:00:00', '2024-10-21 16:00:00'),
('ORD20241006', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1950000, 100000, 30000, 1880000, 'cod', 'paid', 'completed', '2024-10-27 10:00:00', '2024-10-29 14:00:00'),
('ORD20241007', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 2200000, 50000, 30000, 2180000, 'momo', 'paid', 'completed', '2024-10-30 11:00:00', '2024-11-01 15:00:00'),
-- Tháng 11/2024 - thêm 3 đơn hàng
('ORD20241103', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1750000, 50000, 30000, 1730000, 'cod', 'paid', 'completed', '2024-11-10 09:00:00', '2024-11-12 13:00:00'),
('ORD20241104', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1900000, 100000, 30000, 1830000, 'momo', 'paid', 'completed', '2024-11-15 14:00:00', '2024-11-17 16:00:00'),
('ORD20241105', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1650000, 0, 30000, 1680000, 'bank_transfer', 'paid', 'completed', '2024-11-25 10:00:00', '2024-11-27 14:00:00'),
-- Tháng 12/2024 - thêm 3 đơn hàng
('ORD20241203', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 2100000, 100000, 30000, 2030000, 'cod', 'paid', 'completed', '2024-12-05 11:00:00', '2024-12-07 15:00:00'),
('ORD20241204', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 2350000, 0, 30000, 2380000, 'momo', 'paid', 'completed', '2024-12-18 09:00:00', '2024-12-20 13:00:00'),
('ORD20241205', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1950000, 50000, 30000, 1930000, 'bank_transfer', 'paid', 'completed', '2024-12-23 14:00:00', '2024-12-25 16:00:00'),
-- Năm 2025 - thêm đơn hàng cho mỗi tháng
-- Tháng 1/2025 - thêm 3 đơn hàng
('ORD20250103', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1800000, 50000, 30000, 1780000, 'cod', 'paid', 'completed', '2025-01-05 09:00:00', '2025-01-07 13:00:00'),
('ORD20250104', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 2000000, 100000, 30000, 1930000, 'momo', 'paid', 'completed', '2025-01-15 14:00:00', '2025-01-17 16:00:00'),
('ORD20250105', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1750000, 0, 30000, 1780000, 'bank_transfer', 'paid', 'completed', '2025-01-28 10:00:00', '2025-01-30 14:00:00'),
-- Tháng 2/2025 - thêm 3 đơn hàng
('ORD20250203', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1750000, 50000, 30000, 1730000, 'cod', 'paid', 'completed', '2025-02-03 11:00:00', '2025-02-05 15:00:00'),
('ORD20250204', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1950000, 100000, 30000, 1880000, 'momo', 'paid', 'completed', '2025-02-14 09:00:00', '2025-02-16 13:00:00'),
('ORD20250205', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1650000, 0, 30000, 1680000, 'bank_transfer', 'paid', 'completed', '2025-02-26 14:00:00', '2025-02-28 16:00:00'),
-- Tháng 3/2025 - thêm 3 đơn hàng
('ORD20250303', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1800000, 50000, 30000, 1780000, 'cod', 'paid', 'completed', '2025-03-05 10:00:00', '2025-03-07 14:00:00'),
('ORD20250304', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1900000, 100000, 30000, 1830000, 'momo', 'paid', 'completed', '2025-03-12 11:00:00', '2025-03-14 15:00:00'),
('ORD20250305', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1600000, 0, 30000, 1630000, 'bank_transfer', 'paid', 'completed', '2025-03-22 09:00:00', '2025-03-24 13:00:00'),
-- Tháng 4/2025 - thêm 3 đơn hàng
('ORD20250403', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1750000, 50000, 30000, 1730000, 'cod', 'paid', 'completed', '2025-04-05 14:00:00', '2025-04-07 16:00:00'),
('ORD20250404', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 2000000, 100000, 30000, 1930000, 'momo', 'paid', 'completed', '2025-04-18 10:00:00', '2025-04-20 14:00:00'),
('ORD20250405', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1800000, 0, 30000, 1830000, 'bank_transfer', 'paid', 'completed', '2025-04-29 11:00:00', '2025-05-01 15:00:00'),
-- Tháng 5/2025 - thêm 5 đơn hàng
('ORD20250503', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1750000, 50000, 30000, 1730000, 'cod', 'paid', 'completed', '2025-05-04 09:00:00', '2025-05-06 13:00:00'),
('ORD20250504', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1950000, 100000, 30000, 1880000, 'momo', 'paid', 'completed', '2025-05-11 14:00:00', '2025-05-13 16:00:00'),
('ORD20250505', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1800000, 0, 30000, 1830000, 'bank_transfer', 'paid', 'completed', '2025-05-17 10:00:00', '2025-05-19 14:00:00'),
('ORD20250506', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 2000000, 50000, 30000, 1980000, 'cod', 'paid', 'completed', '2025-05-26 11:00:00', '2025-05-28 15:00:00'),
('ORD20250507', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1700000, 100000, 30000, 1630000, 'momo', 'paid', 'completed', '2025-05-30 09:00:00', '2025-06-01 13:00:00'),
-- Tháng 6/2025 - thêm 3 đơn hàng
('ORD20250603', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1750000, 50000, 30000, 1730000, 'cod', 'paid', 'completed', '2025-06-10 14:00:00', '2025-06-12 16:00:00'),
('ORD20250604', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1900000, 100000, 30000, 1830000, 'momo', 'paid', 'completed', '2025-06-14 10:00:00', '2025-06-16 14:00:00'),
('ORD20250605', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1600000, 0, 30000, 1630000, 'bank_transfer', 'paid', 'completed', '2025-06-25 11:00:00', '2025-06-27 15:00:00'),
-- Tháng 7/2025 - thêm 3 đơn hàng
('ORD20250703', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1750000, 50000, 30000, 1730000, 'cod', 'paid', 'completed', '2025-07-05 09:00:00', '2025-07-07 13:00:00'),
('ORD20250704', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1950000, 100000, 30000, 1880000, 'momo', 'paid', 'completed', '2025-07-16 14:00:00', '2025-07-18 16:00:00'),
('ORD20250705', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1800000, 0, 30000, 1830000, 'bank_transfer', 'paid', 'completed', '2025-07-22 10:00:00', '2025-07-24 14:00:00'),
-- Tháng 8/2025 - thêm 3 đơn hàng
('ORD20250803', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1750000, 50000, 30000, 1730000, 'cod', 'paid', 'completed', '2025-08-12 14:00:00', '2025-08-14 16:00:00'),
('ORD20250804', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1950000, 100000, 30000, 1880000, 'momo', 'paid', 'completed', '2025-08-18 09:00:00', '2025-08-20 13:00:00'),
('ORD20250805', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1600000, 0, 30000, 1630000, 'bank_transfer', 'paid', 'completed', '2025-08-28 11:00:00', '2025-08-30 15:00:00'),
-- Tháng 9/2025 - thêm 3 đơn hàng
('ORD20250903', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1750000, 50000, 30000, 1730000, 'cod', 'paid', 'completed', '2025-09-08 10:00:00', '2025-09-10 14:00:00'),
('ORD20250904', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 1900000, 100000, 30000, 1830000, 'momo', 'paid', 'completed', '2025-09-19 14:00:00', '2025-09-21 16:00:00'),
('ORD20250905', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1650000, 0, 30000, 1680000, 'bank_transfer', 'paid', 'completed', '2025-09-25 09:00:00', '2025-09-27 13:00:00'),
-- Tháng 10/2025 - thêm 5 đơn hàng (tháng này có doanh thu cao)
('ORD20251003', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 2200000, 100000, 30000, 2130000, 'cod', 'paid', 'completed', '2025-10-05 11:00:00', '2025-10-07 15:00:00'),
('ORD20251004', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 2350000, 0, 30000, 2380000, 'momo', 'paid', 'completed', '2025-10-12 09:00:00', '2025-10-14 13:00:00'),
('ORD20251005', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 2100000, 50000, 30000, 2080000, 'bank_transfer', 'paid', 'completed', '2025-10-19 14:00:00', '2025-10-21 16:00:00'),
('ORD20251006', 3, 'Nguyễn Văn A', '0903456789', 'customer01@email.com', '123 Nguyễn Huệ', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1950000, 100000, 30000, 1880000, 'cod', 'paid', 'completed', '2025-10-22 10:00:00', '2025-10-24 14:00:00'),
('ORD20251007', 4, 'Trần Thị B', '0904567890', 'customer02@email.com', '456 Lê Lợi', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 2000000, 50000, 30000, 1980000, 'momo', 'paid', 'completed', '2025-10-29 11:00:00', '2025-10-31 15:00:00');
-- Tháng 11-12/2025: Không có đơn hàng (sẽ hiển thị 0 trên biểu đồ)

-- Thêm OrderItems cho các đơn hàng mẫu năm 2024-2025
-- Mỗi đơn hàng có 1-3 sản phẩm để đa dạng
INSERT INTO OrderItems (OrderID, ProductID, ProductName, ProductPrice, Quantity, Subtotal) VALUES
-- Orders 2024
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240101'), 1, 'Entremets Rose', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240101'), 4, 'Mousse Chanh Dây', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240102'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240201'), 3, 'Blanche Figues & Framboises', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240201'), 6, 'Mousse Việt Quất', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240202'), 4, 'Mousse Chanh Dây', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240202'), 5, 'Mousse Dưa Lưới', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240301'), 1, 'Entremets Rose', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240301'), 2, 'Lime and Basil Entremets', 600000, 1, 600000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240302'), 9, 'Strawberry Cloud Cake', 500000, 2, 1000000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240401'), 7, 'Orange Serenade', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240401'), 8, 'Earl Grey Bloom', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240402'), 5, 'Mousse Dưa Lưới', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240402'), 6, 'Mousse Việt Quất', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240501'), 1, 'Entremets Rose', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240501'), 4, 'Mousse Chanh Dây', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240502'), 3, 'Blanche Figues & Framboises', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240601'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240601'), 9, 'Strawberry Cloud Cake', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240602'), 4, 'Mousse Chanh Dây', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240701'), 3, 'Blanche Figues & Framboises', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240701'), 6, 'Mousse Việt Quất', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240702'), 1, 'Entremets Rose', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240702'), 8, 'Earl Grey Bloom', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240801'), 5, 'Mousse Dưa Lưới', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240802'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240901'), 2, 'Lime and Basil Entremets', 600000, 1, 600000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240901'), 9, 'Strawberry Cloud Cake', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240902'), 4, 'Mousse Chanh Dây', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241001'), 3, 'Blanche Figues & Framboises', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241001'), 7, 'Orange Serenade', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241002'), 1, 'Entremets Rose', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241002'), 6, 'Mousse Việt Quất', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241101'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241102'), 5, 'Mousse Dưa Lưới', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241201'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241201'), 9, 'Strawberry Cloud Cake', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241202'), 3, 'Blanche Figues & Framboises', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241202'), 8, 'Earl Grey Bloom', 500000, 1, 500000),
-- Orders 2025
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250101'), 4, 'Mousse Chanh Dây', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250102'), 1, 'Entremets Rose', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250102'), 2, 'Lime and Basil Entremets', 600000, 1, 600000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250201'), 3, 'Blanche Figues & Framboises', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250201'), 6, 'Mousse Việt Quất', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250202'), 9, 'Strawberry Cloud Cake', 500000, 2, 1000000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250301'), 5, 'Mousse Dưa Lưới', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250302'), 1, 'Entremets Rose', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250302'), 7, 'Orange Serenade', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250401'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250402'), 3, 'Blanche Figues & Framboises', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250402'), 8, 'Earl Grey Bloom', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250501'), 4, 'Mousse Chanh Dây', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250502'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250601'), 6, 'Mousse Việt Quất', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250602'), 9, 'Strawberry Cloud Cake', 500000, 2, 1000000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250701'), 3, 'Blanche Figues & Framboises', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250701'), 5, 'Mousse Dưa Lưới', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250702'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250801'), 1, 'Entremets Rose', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250801'), 4, 'Mousse Chanh Dây', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250802'), 7, 'Orange Serenade', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250901'), 3, 'Blanche Figues & Framboises', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250901'), 8, 'Earl Grey Bloom', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250902'), 6, 'Mousse Việt Quất', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20251001'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20251002'), 9, 'Strawberry Cloud Cake', 500000, 2, 1000000),
-- OrderItems cho các đơn hàng mới (thêm nhiều đơn hàng cho mỗi tháng)
-- Tháng 1/2024 - OrderItems cho ORD20240103, ORD20240104, ORD20240105
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240103'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240103'), 8, 'Earl Grey Bloom', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240104'), 5, 'Mousse Dưa Lưới', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240104'), 6, 'Mousse Việt Quất', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240105'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240105'), 9, 'Strawberry Cloud Cake', 500000, 1, 500000),
-- Tháng 2/2024 - OrderItems cho ORD20240203, ORD20240204, ORD20240205
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240203'), 3, 'Blanche Figues & Framboises', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240203'), 4, 'Mousse Chanh Dây', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240204'), 7, 'Orange Serenade', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240204'), 8, 'Earl Grey Bloom', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240205'), 5, 'Mousse Dưa Lưới', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240205'), 6, 'Mousse Việt Quất', 550000, 1, 550000),
-- Tháng 3/2024 - OrderItems cho ORD20240303, ORD20240304, ORD20240305
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240303'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240303'), 4, 'Mousse Chanh Dây', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240304'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240304'), 9, 'Strawberry Cloud Cake', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240305'), 3, 'Blanche Figues & Framboises', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240305'), 8, 'Earl Grey Bloom', 500000, 1, 500000),
-- Tháng 4/2024 - OrderItems cho ORD20240403, ORD20240404, ORD20240405
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240403'), 6, 'Mousse Việt Quất', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240403'), 7, 'Orange Serenade', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240404'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240404'), 4, 'Mousse Chanh Dây', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240405'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240405'), 9, 'Strawberry Cloud Cake', 500000, 1, 500000),
-- Tháng 5/2024 - OrderItems cho ORD20240503, ORD20240504, ORD20240505, ORD20240506, ORD20240507
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240503'), 5, 'Mousse Dưa Lưới', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240503'), 6, 'Mousse Việt Quất', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240504'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240504'), 3, 'Blanche Figues & Framboises', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240505'), 7, 'Orange Serenade', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240505'), 8, 'Earl Grey Bloom', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240506'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240506'), 9, 'Strawberry Cloud Cake', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240507'), 4, 'Mousse Chanh Dây', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240507'), 5, 'Mousse Dưa Lưới', 550000, 1, 550000),
-- Tháng 6/2024 - OrderItems cho ORD20240603, ORD20240604, ORD20240605
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240603'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240603'), 6, 'Mousse Việt Quất', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240604'), 3, 'Blanche Figues & Framboises', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240604'), 8, 'Earl Grey Bloom', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240605'), 4, 'Mousse Chanh Dây', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240605'), 7, 'Orange Serenade', 550000, 1, 550000),
-- Tháng 7/2024 - OrderItems cho ORD20240703, ORD20240704, ORD20240705
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240703'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240703'), 9, 'Strawberry Cloud Cake', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240704'), 5, 'Mousse Dưa Lưới', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240704'), 6, 'Mousse Việt Quất', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240705'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240705'), 8, 'Earl Grey Bloom', 500000, 1, 500000),
-- Tháng 8/2024 - OrderItems cho ORD20240803, ORD20240804, ORD20240805
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240803'), 3, 'Blanche Figues & Framboises', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240803'), 4, 'Mousse Chanh Dây', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240804'), 7, 'Orange Serenade', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240804'), 9, 'Strawberry Cloud Cake', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240805'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240805'), 6, 'Mousse Việt Quất', 550000, 1, 550000),
-- Tháng 9/2024 - OrderItems cho ORD20240903, ORD20240904, ORD20240905
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240903'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240903'), 5, 'Mousse Dưa Lưới', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240904'), 3, 'Blanche Figues & Framboises', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240904'), 8, 'Earl Grey Bloom', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240905'), 4, 'Mousse Chanh Dây', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20240905'), 7, 'Orange Serenade', 550000, 1, 550000),
-- Tháng 10/2024 - OrderItems cho ORD20241003, ORD20241004, ORD20241005, ORD20241006, ORD20241007
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241003'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241003'), 3, 'Blanche Figues & Framboises', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241004'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241004'), 4, 'Mousse Chanh Dây', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241004'), 9, 'Strawberry Cloud Cake', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241005'), 5, 'Mousse Dưa Lưới', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241005'), 6, 'Mousse Việt Quất', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241005'), 7, 'Orange Serenade', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241006'), 8, 'Earl Grey Bloom', 500000, 2, 1000000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241006'), 1, 'Entremets Rose', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241007'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241007'), 3, 'Blanche Figues & Framboises', 650000, 1, 650000),
-- Tháng 11/2024 - OrderItems cho ORD20241103, ORD20241104, ORD20241105
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241103'), 4, 'Mousse Chanh Dây', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241103'), 9, 'Strawberry Cloud Cake', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241104'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241104'), 8, 'Earl Grey Bloom', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241105'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241105'), 6, 'Mousse Việt Quất', 550000, 1, 550000),
-- Tháng 12/2024 - OrderItems cho ORD20241203, ORD20241204, ORD20241205
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241203'), 3, 'Blanche Figues & Framboises', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241203'), 5, 'Mousse Dưa Lưới', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241204'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241204'), 4, 'Mousse Chanh Dây', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241204'), 7, 'Orange Serenade', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241205'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20241205'), 9, 'Strawberry Cloud Cake', 500000, 1, 500000),
-- Năm 2025 - OrderItems cho các đơn hàng mới
-- Tháng 1/2025 - OrderItems cho ORD20250103, ORD20250104, ORD20250105
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250103'), 6, 'Mousse Việt Quất', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250103'), 7, 'Orange Serenade', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250104'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250104'), 3, 'Blanche Figues & Framboises', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250105'), 4, 'Mousse Chanh Dây', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250105'), 8, 'Earl Grey Bloom', 500000, 1, 500000),
-- Tháng 2/2025 - OrderItems cho ORD20250203, ORD20250204, ORD20250205
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250203'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250203'), 9, 'Strawberry Cloud Cake', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250204'), 5, 'Mousse Dưa Lưới', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250204'), 6, 'Mousse Việt Quất', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250205'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250205'), 7, 'Orange Serenade', 550000, 1, 550000),
-- Tháng 3/2025 - OrderItems cho ORD20250303, ORD20250304, ORD20250305
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250303'), 3, 'Blanche Figues & Framboises', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250303'), 8, 'Earl Grey Bloom', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250304'), 4, 'Mousse Chanh Dây', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250304'), 9, 'Strawberry Cloud Cake', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250305'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250305'), 5, 'Mousse Dưa Lưới', 550000, 1, 550000),
-- Tháng 4/2025 - OrderItems cho ORD20250403, ORD20250404, ORD20250405
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250403'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250403'), 6, 'Mousse Việt Quất', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250404'), 7, 'Orange Serenade', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250404'), 3, 'Blanche Figues & Framboises', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250405'), 4, 'Mousse Chanh Dây', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250405'), 9, 'Strawberry Cloud Cake', 500000, 1, 500000),
-- Tháng 5/2025 - OrderItems cho ORD20250503, ORD20250504, ORD20250505, ORD20250506, ORD20250507
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250503'), 5, 'Mousse Dưa Lưới', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250503'), 8, 'Earl Grey Bloom', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250504'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250504'), 2, 'Lime and Basil Entremets', 600000, 1, 600000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250505'), 6, 'Mousse Việt Quất', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250505'), 7, 'Orange Serenade', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250506'), 3, 'Blanche Figues & Framboises', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250506'), 9, 'Strawberry Cloud Cake', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250507'), 4, 'Mousse Chanh Dây', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250507'), 5, 'Mousse Dưa Lưới', 550000, 1, 550000),
-- Tháng 6/2025 - OrderItems cho ORD20250603, ORD20250604, ORD20250605
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250603'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250603'), 8, 'Earl Grey Bloom', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250604'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250604'), 6, 'Mousse Việt Quất', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250605'), 4, 'Mousse Chanh Dây', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250605'), 9, 'Strawberry Cloud Cake', 500000, 1, 500000),
-- Tháng 7/2025 - OrderItems cho ORD20250703, ORD20250704, ORD20250705
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250703'), 3, 'Blanche Figues & Framboises', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250703'), 7, 'Orange Serenade', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250704'), 5, 'Mousse Dưa Lưới', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250704'), 8, 'Earl Grey Bloom', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250705'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250705'), 4, 'Mousse Chanh Dây', 550000, 1, 550000),
-- Tháng 8/2025 - OrderItems cho ORD20250803, ORD20250804, ORD20250805
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250803'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250803'), 6, 'Mousse Việt Quất', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250804'), 3, 'Blanche Figues & Framboises', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250804'), 9, 'Strawberry Cloud Cake', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250805'), 7, 'Orange Serenade', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250805'), 8, 'Earl Grey Bloom', 500000, 1, 500000),
-- Tháng 9/2025 - OrderItems cho ORD20250903, ORD20250904, ORD20250905
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250903'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250903'), 5, 'Mousse Dưa Lưới', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250904'), 4, 'Mousse Chanh Dây', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250904'), 3, 'Blanche Figues & Framboises', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250905'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20250905'), 7, 'Orange Serenade', 550000, 1, 550000),
-- Tháng 10/2025 - OrderItems cho ORD20251003, ORD20251004, ORD20251005, ORD20251006, ORD20251007
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20251003'), 6, 'Mousse Việt Quất', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20251003'), 1, 'Entremets Rose', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20251003'), 9, 'Strawberry Cloud Cake', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20251004'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20251004'), 3, 'Blanche Figues & Framboises', 650000, 1, 650000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20251004'), 4, 'Mousse Chanh Dây', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20251005'), 5, 'Mousse Dưa Lưới', 550000, 2, 1100000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20251005'), 7, 'Orange Serenade', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20251005'), 8, 'Earl Grey Bloom', 500000, 1, 500000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20251006'), 1, 'Entremets Rose', 650000, 2, 1300000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20251006'), 4, 'Mousse Chanh Dây', 550000, 1, 550000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20251007'), 2, 'Lime and Basil Entremets', 600000, 2, 1200000),
((SELECT OrderID FROM Orders WHERE OrderCode = 'ORD20251007'), 6, 'Mousse Việt Quất', 550000, 1, 550000);


