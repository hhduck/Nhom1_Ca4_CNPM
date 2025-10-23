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
(4, 'customer02', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Trần Thị B', 'customer02@email.com', '0904567890', 'customer', 'active');

-- 3. Products
INSERT INTO Products (ProductID, ProductName, CategoryID, Description, Price, OriginalPrice, Quantity, Status, ImageURL, Weight, ShelfLife, IsFeatured) VALUES
(1, 'Entremets Rose', 1, 'Bánh kem kiểu Pháp cao cấp với mousse hương hồng', 650000, 750000, 15, 'available', '../../assets/images/Entremets Rose.jpg', 500, 3, TRUE),
(2, 'Lime and Basil Entremets', 1, 'Entremet chanh và húng quế', 600000, 680000, 12, 'available', '../../assets/images/Lime and Basil Entremets.jpg', 500, 3, TRUE),
(3, 'Blanche Figues & Framboises', 1, 'Entremet sang trọng với sung trắng và phúc bồn tử', 650000, 750000, 10, 'available', '../../assets/images/Blanche Figues & Framboises.jpg', 550, 3, TRUE),
(4, 'Mousse Chanh Dây', 2, 'Bánh mousse chanh dây tươi mát', 550000, 600000, 25, 'available', '../../assets/images/Mousse Chanh dây.jpg', 450, 2, TRUE),
(5, 'Mousse Dưa Lưới', 2, 'Mousse dưa lưới ngọt thanh', 550000, 600000, 20, 'available', '../../assets/images/Mousse Dưa lưới.jpg', 450, 2, TRUE),
(6, 'Mousse Việt Quất', 2, 'Mousse việt quất chua ngọt', 550000, 600000, 18, 'available', '../../assets/images/Mousse Việt quất.jpg', 450, 2, FALSE),
(7, 'Rustic Coffee Cake', 3, 'Bánh kem cà phê phong cách rustic', 450000, 500000, 15, 'available', '../../assets/images/Earl Grey Bloom.jpg', 600, 3, FALSE),
(8, 'Serenity Cake', 3, 'Bánh kem truyền thống thanh lịch', 500000, 550000, 12, 'available', '../../assets/images/Rectangle 298.png', 650, 3, FALSE),
(9, 'Strawberry Cloud Cake', 3, 'Bánh kem dâu tây mây', 500000, 550000, 10, 'available', '../../assets/images/Strawberry Cloud Cake.jpg', 650, 3, TRUE),
(10, 'Nón Sinh Nhật', 4, 'Nón sinh nhật xinh xắn', 10000, 10000, 200, 'available', '../../assets/images/Rectangle 312.png', 20, 365, FALSE),
(11, 'Pháo Hoa', 4, 'Pháo hoa trang trí bánh', 55000, 55000, 150, 'available', '../../assets/images/Rectangle 309.png', 50, 365, FALSE),
(12, 'Bóng Bay và Dây Trang Trí', 4, 'Set bóng bay và dây trang trí', 40000, 40000, 100, 'available', '../../assets/images/Rectangle 306.png', 100, 365, FALSE);

-- 4. Promotions
INSERT INTO Promotions (PromotionID, PromotionCode, PromotionName, Description, PromotionType, DiscountValue, MinOrderValue, Quantity, StartDate, EndDate, Status, CustomerType, CreatedBy) VALUES
(1, 'FREESHIP2025', 'Miễn phí vận chuyển', 'Miễn phí ship cho đơn hàng từ 500k', 'free_shipping', 0, 500000, -1, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'active', 'all', 1),
(2, 'NEWUSER10', 'Giảm 10% cho khách mới', 'Giảm 10% cho đơn hàng đầu tiên', 'percent', 10, 300000, 100, '2025-01-01 00:00:00', '2025-06-30 23:59:59', 'active', 'new', 1),
(3, 'GIAM50K', 'Giảm 50K', 'Giảm 50,000đ cho đơn từ 500k', 'fixed_amount', 50000, 500000, 50, '2025-01-15 00:00:00', '2025-02-15 23:59:59', 'active', 'all', 1);

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
(1, '../../assets/images/Entremets Rose.jpg', 'Entremets Rose - View 1', TRUE, 1),
(2, '../../assets/images/Lime and Basil Entremets.jpg', 'Lime and Basil - View 1', TRUE, 1),
(3, '../../assets/images/Blanche Figues & Framboises.jpg', 'Blanche Figues - View 1', TRUE, 1);

-- 14. Promotion Usage
INSERT INTO PromotionUsage (PromotionID, UserID, OrderID, DiscountAmount, UsedAt) VALUES
(2, 4, 2, 50000, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 3, 5, 100000, DATE_SUB(NOW(), INTERVAL 25 DAY));

-- Cập nhật số lần sử dụng khuyến mãi
UPDATE Promotions SET UsedCount = 1 WHERE PromotionID = 2;
UPDATE Promotions SET UsedCount = 1 WHERE PromotionID = 3;

-- Cập nhật số lượng đã bán cho sản phẩm
UPDATE Products SET SoldCount = 3 WHERE ProductID = 1;
UPDATE Products SET SoldCount = 2 WHERE ProductID = 4;
UPDATE Products SET SoldCount = 1 WHERE ProductID = 2;
UPDATE Products SET SoldCount = 1 WHERE ProductID = 3;
UPDATE Products SET SoldCount = 1 WHERE ProductID = 5;
UPDATE Products SET SoldCount = 1 WHERE ProductID = 6;
UPDATE Products SET SoldCount = 1 WHERE ProductID = 7;
UPDATE Products SET SoldCount = 1 WHERE ProductID = 8;
UPDATE Products SET SoldCount = 2 WHERE ProductID = 9;
UPDATE Products SET SoldCount = 5 WHERE ProductID = 10;
UPDATE Products SET SoldCount = 1 WHERE ProductID = 11;

-- ============================================
-- THÔNG BÁO HOÀN TẤT
-- ============================================
SELECT 'Database created successfully!' as Status,
       'lacuisinengot' as DatabaseName,
       '14 tables' as TablesCreated,
       'FULL DATA: 4 users, 12 products, 5 orders, 5 reviews, 3 complaints' as SampleData;
