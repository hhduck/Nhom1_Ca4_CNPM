-- ============================================
-- LA CUISINE NGỌT - MYSQL DATABASE SCHEMA
-- Hệ thống quản lý bánh trực tuyến
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS lacuisinengot
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE lacuisinengot;

-- ============================================
-- 1. USERS TABLE
-- ============================================
DROP TABLE IF EXISTS Users;

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

-- ============================================
-- 2. CATEGORIES TABLE
-- ============================================
DROP TABLE IF EXISTS Categories;

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

-- ============================================
-- 3. PRODUCTS TABLE
-- ============================================
DROP TABLE IF EXISTS Products;

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
    Weight DECIMAL(8,2), -- gram
    Ingredients TEXT,
    Allergens VARCHAR(200),
    ShelfLife INT, -- days
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

-- ============================================
-- 4. PRODUCT_IMAGES TABLE
-- ============================================
DROP TABLE IF EXISTS ProductImages;

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

-- ============================================
-- 5. ORDERS TABLE
-- ============================================
DROP TABLE IF EXISTS Orders;

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

-- ============================================
-- 6. ORDER_ITEMS TABLE
-- ============================================
DROP TABLE IF EXISTS OrderItems;

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

-- ============================================
-- 7. ORDER_STATUS_HISTORY TABLE
-- ============================================
DROP TABLE IF EXISTS OrderStatusHistory;

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

-- ============================================
-- 8. PROMOTIONS TABLE
-- ============================================
DROP TABLE IF EXISTS Promotions;

CREATE TABLE Promotions (
    PromotionID INT AUTO_INCREMENT PRIMARY KEY,
    PromotionCode VARCHAR(50) NOT NULL UNIQUE,
    PromotionName VARCHAR(200) NOT NULL,
    Description TEXT,
    PromotionType ENUM('percent', 'fixed_amount', 'free_shipping', 'gift') NOT NULL,
    DiscountValue DECIMAL(10,2) DEFAULT 0,
    MinOrderValue DECIMAL(10,2) DEFAULT 0,
    MaxDiscount DECIMAL(10,2),
    Quantity INT DEFAULT -1, -- -1 = unlimited
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

-- ============================================
-- 9. PROMOTION_USAGE TABLE
-- ============================================
DROP TABLE IF EXISTS PromotionUsage;

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

-- ============================================
-- 10. COMPLAINTS TABLE
-- ============================================
DROP TABLE IF EXISTS Complaints;

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

-- ============================================
-- 11. COMPLAINT_RESPONSES TABLE
-- ============================================
DROP TABLE IF EXISTS ComplaintResponses;

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

-- ============================================
-- 12. REVIEWS TABLE
-- ============================================
DROP TABLE IF EXISTS Reviews;

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

-- ============================================
-- 13. CART TABLE
-- ============================================
DROP TABLE IF EXISTS Cart;

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

-- ============================================
-- 14. WISHLIST TABLE
-- ============================================
DROP TABLE IF EXISTS Wishlist;

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
-- INDEXES
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
-- INSERT SAMPLE DATA
-- ============================================

-- Categories
INSERT INTO Categories (CategoryID, CategoryName, Description, Slug, IsActive, DisplayOrder) VALUES
(1, 'Entremet', 'Bánh entremet cao cấp với nhiều lớp hương vị tinh tế', 'entremet', TRUE, 1),
(2, 'Mousse', 'Bánh mousse mềm mịn, nhẹ nhàng', 'mousse', TRUE, 2),
(3, 'Truyền thống', 'Bánh truyền thống Việt Nam', 'truyen-thong', TRUE, 3),
(4, 'Phụ kiện', 'Các phụ kiện trang trí bánh', 'phu-kien', TRUE, 4);

-- Users
INSERT INTO Users (UserID, Username, PasswordHash, FullName, Email, Phone, Role, Status) VALUES
(1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Quản trị viên', 'admin@lacuisine.vn', '0901234567', 'admin', 'active'),
(2, 'staff01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nhân viên 1', 'staff01@lacuisine.vn', '0902345678', 'staff', 'active'),
(3, 'customer01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Văn A', 'customer01@email.com', '0903456789', 'customer', 'active'),
(4, 'customer02', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Trần Thị B', 'customer02@email.com', '0904567890', 'customer', 'active');

-- Products
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

-- Promotions
INSERT INTO Promotions (PromotionID, PromotionCode, PromotionName, Description, PromotionType, DiscountValue, MinOrderValue, Quantity, StartDate, EndDate, Status, CustomerType, CreatedBy) VALUES
(1, 'FREESHIP2025', 'Miễn phí vận chuyển', 'Miễn phí ship cho đơn hàng từ 500k', 'free_shipping', 0, 500000, -1, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'active', 'all', 1),
(2, 'NEWUSER10', 'Giảm 10% cho khách mới', 'Giảm 10% cho đơn hàng đầu tiên', 'percent', 10, 300000, 100, '2025-01-01 00:00:00', '2025-06-30 23:59:59', 'active', 'new', 1),
(3, 'GIAM50K', 'Giảm 50K', 'Giảm 50,000đ cho đơn từ 500k', 'fixed_amount', 50000, 500000, 50, '2025-01-15 00:00:00', '2025-02-15 23:59:59', 'active', 'all', 1);

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- SP: Get all products with category info
DELIMITER //
CREATE PROCEDURE sp_GetAllProducts(
    IN p_Search VARCHAR(200),
    IN p_CategoryID INT,
    IN p_Status VARCHAR(20)
)
BEGIN
    SELECT 
        p.ProductID,
        p.ProductName,
        p.Description,
        p.Price,
        p.OriginalPrice,
        p.Quantity,
        p.Status,
        p.ImageURL,
        p.IsFeatured,
        p.Views,
        p.SoldCount,
        c.CategoryID,
        c.CategoryName
    FROM Products p
    LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
    WHERE 
        (p_Search IS NULL OR p.ProductName LIKE CONCAT('%', p_Search, '%') OR p.Description LIKE CONCAT('%', p_Search, '%') OR c.CategoryName LIKE CONCAT('%', p_Search, '%'))
        AND (p_CategoryID IS NULL OR p.CategoryID = p_CategoryID)
        AND (p_Status IS NULL OR p.Status = p_Status)
    ORDER BY p.CreatedAt DESC;
END //
DELIMITER ;

-- SP: Get product by ID
DELIMITER //
CREATE PROCEDURE sp_GetProductByID(IN p_ProductID INT)
BEGIN
    SELECT 
        p.*,
        c.CategoryName
    FROM Products p
    LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
    WHERE p.ProductID = p_ProductID;
END //
DELIMITER ;

-- SP: Get all orders with filters
DELIMITER //
CREATE PROCEDURE sp_GetAllOrders(
    IN p_Search VARCHAR(200),
    IN p_Status VARCHAR(20)
)
BEGIN
    SELECT 
        o.OrderID,
        o.OrderCode,
        o.CustomerID,
        o.CustomerName,
        o.CustomerPhone,
        o.CustomerEmail,
        o.ShippingAddress,
        o.Ward,
        o.District,
        o.City,
        o.TotalAmount,
        o.DiscountAmount,
        o.ShippingFee,
        o.FinalAmount,
        o.PaymentMethod,
        o.PaymentStatus,
        o.OrderStatus,
        o.CreatedAt,
        o.UpdatedAt,
        u.FullName as CustomerFullName
    FROM Orders o
    LEFT JOIN Users u ON o.CustomerID = u.UserID
    WHERE 
        (p_Search IS NULL OR o.OrderCode LIKE CONCAT('%', p_Search, '%') OR o.CustomerName LIKE CONCAT('%', p_Search, '%'))
        AND (p_Status IS NULL OR o.OrderStatus = p_Status)
    ORDER BY o.CreatedAt DESC;
END //
DELIMITER ;

-- SP: Get order detail with items
DELIMITER //
CREATE PROCEDURE sp_GetOrderDetail(IN p_OrderID INT)
BEGIN
    -- Order info
    SELECT 
        o.*,
        u.FullName as CustomerFullName
    FROM Orders o
    LEFT JOIN Users u ON o.CustomerID = u.UserID
    WHERE o.OrderID = p_OrderID;
    
    -- Order items
    SELECT 
        oi.*,
        p.ImageURL
    FROM OrderItems oi
    LEFT JOIN Products p ON oi.ProductID = p.ProductID
    WHERE oi.OrderID = p_OrderID;
END //
DELIMITER ;

-- SP: Update order status
DELIMITER //
CREATE PROCEDURE sp_UpdateOrderStatus(
    IN p_OrderID INT,
    IN p_NewStatus VARCHAR(20),
    IN p_ChangedBy INT,
    IN p_Note VARCHAR(255)
)
BEGIN
    DECLARE v_OldStatus VARCHAR(20);
    
    -- Get old status
    SELECT OrderStatus INTO v_OldStatus FROM Orders WHERE OrderID = p_OrderID;
    
    -- Update order
    UPDATE Orders 
    SET 
        OrderStatus = p_NewStatus,
        UpdatedAt = CURRENT_TIMESTAMP,
        ConfirmedAt = CASE WHEN p_NewStatus = 'confirmed' THEN CURRENT_TIMESTAMP ELSE ConfirmedAt END,
        CompletedAt = CASE WHEN p_NewStatus = 'completed' THEN CURRENT_TIMESTAMP ELSE CompletedAt END,
        CancelledAt = CASE WHEN p_NewStatus = 'cancelled' THEN CURRENT_TIMESTAMP ELSE CancelledAt END
    WHERE OrderID = p_OrderID;
    
    -- Insert history
    INSERT INTO OrderStatusHistory (OrderID, OldStatus, NewStatus, ChangedBy, Note)
    VALUES (p_OrderID, v_OldStatus, p_NewStatus, p_ChangedBy, p_Note);
    
    -- Update product sold count if completed
    IF p_NewStatus = 'completed' THEN
        UPDATE Products p
        INNER JOIN OrderItems oi ON p.ProductID = oi.ProductID
        SET p.SoldCount = p.SoldCount + oi.Quantity
        WHERE oi.OrderID = p_OrderID;
    END IF;
END //
DELIMITER ;

-- SP: Get all users
DELIMITER //
CREATE PROCEDURE sp_GetAllUsers(
    IN p_Search VARCHAR(200),
    IN p_Role VARCHAR(20)
)
BEGIN
    SELECT 
        UserID,
        Username,
        Email,
        FullName,
        Phone,
        Address,
        Role,
        Status,
        CreatedAt,
        LastLogin
    FROM Users
    WHERE 
        (p_Search IS NULL OR Username LIKE CONCAT('%', p_Search, '%') OR FullName LIKE CONCAT('%', p_Search, '%') OR Email LIKE CONCAT('%', p_Search, '%'))
        AND (p_Role IS NULL OR Role = p_Role)
    ORDER BY CreatedAt DESC;
END //
DELIMITER ;

-- SP: Get dashboard statistics
DELIMITER //
CREATE PROCEDURE sp_GetDashboardStats(IN p_Period VARCHAR(10))
BEGIN
    DECLARE v_StartDate TIMESTAMP;
    
    IF p_Period = 'month' THEN
        SET v_StartDate = DATE_SUB(NOW(), INTERVAL 1 MONTH);
    ELSE
        SET v_StartDate = DATE_SUB(NOW(), INTERVAL 1 YEAR);
    END IF;
    
    -- Revenue and orders
    SELECT 
        COALESCE(SUM(CASE WHEN OrderStatus = 'completed' THEN FinalAmount ELSE 0 END), 0) as Revenue,
        COUNT(*) as TotalOrders,
        SUM(CASE WHEN OrderStatus = 'completed' THEN 1 ELSE 0 END) as DeliveredOrders,
        (SELECT COUNT(*) FROM Users WHERE Role = 'customer' AND CreatedAt >= v_StartDate) as NewCustomers
    FROM Orders
    WHERE CreatedAt >= v_StartDate;
    
    -- Top products
    SELECT 
        p.ProductName,
        SUM(oi.Quantity) as QuantitySold,
        SUM(oi.Subtotal) as Revenue
    FROM OrderItems oi
    INNER JOIN Products p ON oi.ProductID = p.ProductID
    INNER JOIN Orders o ON oi.OrderID = o.OrderID
    WHERE o.OrderStatus = 'completed' AND o.CreatedAt >= v_StartDate
    GROUP BY p.ProductID, p.ProductName
    ORDER BY Revenue DESC
    LIMIT 10;
END //
DELIMITER ;

-- SP: Get revenue chart data
DELIMITER //
CREATE PROCEDURE sp_GetRevenueChartData(IN p_Period VARCHAR(10))
BEGIN
    IF p_Period = 'month' THEN
        -- Last 10 months
        SELECT 
            DATE_FORMAT(CreatedAt, '%m') as Period,
            SUM(CASE WHEN OrderStatus = 'completed' THEN FinalAmount ELSE 0 END) as Revenue
        FROM Orders
        WHERE CreatedAt >= DATE_SUB(NOW(), INTERVAL 10 MONTH)
        GROUP BY DATE_FORMAT(CreatedAt, '%Y-%m'), DATE_FORMAT(CreatedAt, '%m')
        ORDER BY DATE_FORMAT(CreatedAt, '%Y-%m');
    ELSE
        -- Last 12 months by year
        SELECT 
            YEAR(CreatedAt) as Period,
            SUM(CASE WHEN OrderStatus = 'completed' THEN FinalAmount ELSE 0 END) as Revenue
        FROM Orders
        WHERE CreatedAt >= DATE_SUB(NOW(), INTERVAL 5 YEAR)
        GROUP BY YEAR(CreatedAt)
        ORDER BY YEAR(CreatedAt);
    END IF;
END //
DELIMITER ;

-- SP: Get product sales chart data
DELIMITER //
CREATE PROCEDURE sp_GetProductSalesChartData()
BEGIN
    SELECT 
        p.ProductName,
        COUNT(oi.OrderItemID) as Quantity
    FROM OrderItems oi
    INNER JOIN Products p ON oi.ProductID = p.ProductID
    INNER JOIN Orders o ON oi.OrderID = o.OrderID
    WHERE o.OrderStatus = 'completed'
    GROUP BY p.ProductID, p.ProductName
    ORDER BY Quantity DESC
    LIMIT 5;
END //
DELIMITER ;

-- SP: Get all promotions
DELIMITER //
CREATE PROCEDURE sp_GetAllPromotions(IN p_Status VARCHAR(20))
BEGIN
    SELECT *
    FROM Promotions
    WHERE p_Status IS NULL OR Status = p_Status
    ORDER BY CreatedAt DESC;
END //
DELIMITER ;

-- SP: Get all complaints
DELIMITER //
CREATE PROCEDURE sp_GetAllComplaints(
    IN p_Search VARCHAR(200),
    IN p_Status VARCHAR(20)
)
BEGIN
    SELECT 
        c.ComplaintID,
        c.ComplaintCode,
        c.OrderID,
        c.CustomerID,
        c.ComplaintType,
        c.Title,
        c.Content,
        c.Status,
        c.Priority,
        c.Resolution,
        c.CompensationType,
        c.CompensationValue,
        c.CreatedAt,
        c.UpdatedAt,
        o.OrderCode,
        u.FullName as CustomerName,
        u.Phone as CustomerPhone,
        o.ShippingAddress
    FROM Complaints c
    INNER JOIN Orders o ON c.OrderID = o.OrderID
    INNER JOIN Users u ON c.CustomerID = u.UserID
    WHERE 
        (p_Search IS NULL OR c.ComplaintCode LIKE CONCAT('%', p_Search, '%') OR c.Title LIKE CONCAT('%', p_Search, '%'))
        AND (p_Status IS NULL OR c.Status = p_Status)
    ORDER BY c.CreatedAt DESC;
END //
DELIMITER ;

-- SP: Update complaint status
DELIMITER //
CREATE PROCEDURE sp_UpdateComplaintStatus(
    IN p_ComplaintID INT,
    IN p_NewStatus VARCHAR(20)
)
BEGIN
    UPDATE Complaints
    SET 
        Status = p_NewStatus,
        UpdatedAt = CURRENT_TIMESTAMP,
        ResolvedAt = CASE WHEN p_NewStatus = 'resolved' THEN CURRENT_TIMESTAMP ELSE ResolvedAt END,
        ClosedAt = CASE WHEN p_NewStatus = 'closed' THEN CURRENT_TIMESTAMP ELSE ClosedAt END
    WHERE ComplaintID = p_ComplaintID;
END //
DELIMITER ;

-- ============================================
-- VIEWS
-- ============================================

-- View: Best selling products
CREATE OR REPLACE VIEW vw_BestSellingProducts AS
SELECT 
    p.ProductID,
    p.ProductName,
    p.Price,
    p.ImageURL,
    c.CategoryName,
    COALESCE(SUM(oi.Quantity), 0) as TotalSold,
    COALESCE(SUM(oi.Subtotal), 0) as TotalRevenue,
    COALESCE(AVG(CAST(r.Rating as DECIMAL(3,2))), 0) as AvgRating,
    COUNT(DISTINCT r.ReviewID) as ReviewCount
FROM Products p
LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
LEFT JOIN OrderItems oi ON p.ProductID = oi.ProductID
LEFT JOIN Orders o ON oi.OrderID = o.OrderID AND o.OrderStatus = 'completed'
LEFT JOIN Reviews r ON p.ProductID = r.ProductID AND r.Status = 'approved'
GROUP BY p.ProductID, p.ProductName, p.Price, p.ImageURL, c.CategoryName;

-- View: Customer statistics
CREATE OR REPLACE VIEW vw_CustomerStatistics AS
SELECT 
    u.UserID,
    u.FullName,
    u.Email,
    u.Phone,
    u.CreatedAt as RegistrationDate,
    COUNT(o.OrderID) as TotalOrders,
    COALESCE(SUM(o.FinalAmount), 0) as TotalSpent,
    COALESCE(AVG(o.FinalAmount), 0) as AvgOrderValue,
    MAX(o.CreatedAt) as LastOrderDate
FROM Users u
LEFT JOIN Orders o ON u.UserID = o.CustomerID AND o.OrderStatus != 'cancelled'
WHERE u.Role = 'customer'
GROUP BY u.UserID, u.FullName, u.Email, u.Phone, u.CreatedAt;

-- View: Order summary
CREATE OR REPLACE VIEW vw_OrderSummary AS
SELECT 
    OrderStatus,
    COUNT(*) as OrderCount,
    SUM(FinalAmount) as TotalAmount,
    AVG(FinalAmount) as AvgAmount,
    MIN(CreatedAt) as EarliestOrder,
    MAX(CreatedAt) as LatestOrder
FROM Orders
GROUP BY OrderStatus;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Update product stock after order
DELIMITER //
CREATE TRIGGER tr_UpdateStock_AfterOrderItem
AFTER INSERT ON OrderItems
FOR EACH ROW
BEGIN
    UPDATE Products p
    SET 
        p.Quantity = p.Quantity - NEW.Quantity,
        p.Status = CASE 
            WHEN (p.Quantity - NEW.Quantity) <= 0 THEN 'out_of_stock'
            ELSE p.Status
        END
    WHERE p.ProductID = NEW.ProductID;
END //
DELIMITER ;

-- Trigger: Auto-update timestamps
DELIMITER //
CREATE TRIGGER tr_Products_UpdateTimestamp
BEFORE UPDATE ON Products
FOR EACH ROW
BEGIN
    SET NEW.UpdatedAt = CURRENT_TIMESTAMP;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER tr_Orders_UpdateTimestamp
BEFORE UPDATE ON Orders
FOR EACH ROW
BEGIN
    SET NEW.UpdatedAt = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: Calculate discount amount
DELIMITER //
CREATE FUNCTION fn_CalculateDiscount(
    p_PromotionCode VARCHAR(50),
    p_OrderAmount DECIMAL(12,2)
)
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_Discount DECIMAL(10,2) DEFAULT 0;
    DECLARE v_Type VARCHAR(20);
    DECLARE v_Value DECIMAL(10,2);
    DECLARE v_MaxDiscount DECIMAL(10,2);
    
    SELECT 
        PromotionType,
        DiscountValue,
        MaxDiscount
    INTO v_Type, v_Value, v_MaxDiscount
    FROM Promotions
    WHERE PromotionCode = p_PromotionCode
        AND Status = 'active'
        AND NOW() BETWEEN StartDate AND EndDate
        AND p_OrderAmount >= MinOrderValue
        AND (Quantity = -1 OR UsedCount < Quantity);
    
    IF v_Type = 'percent' THEN
        SET v_Discount = p_OrderAmount * v_Value / 100;
        IF v_MaxDiscount IS NOT NULL AND v_Discount > v_MaxDiscount THEN
            SET v_Discount = v_MaxDiscount;
        END IF;
    ELSEIF v_Type = 'fixed_amount' THEN
        SET v_Discount = v_Value;
    END IF;
    
    RETURN v_Discount;
END //
DELIMITER ;

-- Function: Check if promotion is valid
DELIMITER //
CREATE FUNCTION fn_IsPromotionValid(
    p_PromotionCode VARCHAR(50),
    p_OrderAmount DECIMAL(12,2)
)
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_IsValid BOOLEAN DEFAULT FALSE;
    
    IF EXISTS (
        SELECT 1
        FROM Promotions
        WHERE PromotionCode = p_PromotionCode
            AND Status = 'active'
            AND NOW() BETWEEN StartDate AND EndDate
            AND p_OrderAmount >= MinOrderValue
            AND (Quantity = -1 OR UsedCount < Quantity)
    ) THEN
        SET v_IsValid = TRUE;
    END IF;
    
    RETURN v_IsValid;
END //
DELIMITER ;

SELECT 'Database schema, stored procedures, views, triggers, and functions created successfully!' as Message;

