-- LA CUISINE NGỌT Database Schema
-- SQL Server Database Script

-- Create Database
CREATE DATABASE LaCuisineNgot;
GO

USE LaCuisineNgot;
GO

-- 1. Users Table
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20),
    Address NVARCHAR(255),
    Role NVARCHAR(20) DEFAULT 'customer' CHECK (Role IN ('customer', 'admin')),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

-- 2. Categories Table
CREATE TABLE Categories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    ImageURL NVARCHAR(255),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- 3. Products Table
CREATE TABLE Products (
    ProductID INT IDENTITY(1,1) PRIMARY KEY,
    ProductName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000),
    Price DECIMAL(10,2) NOT NULL,
    CategoryID INT FOREIGN KEY REFERENCES Categories(CategoryID),
    ImageURL NVARCHAR(255),
    Ingredients NVARCHAR(1000),
    IsFeatured BIT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    StockQuantity INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

-- 4. Orders Table
CREATE TABLE Orders (
    OrderID INT IDENTITY(1,1) PRIMARY KEY,
    OrderNumber NVARCHAR(20) NOT NULL UNIQUE,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    TotalAmount DECIMAL(10,2) NOT NULL,
    Status NVARCHAR(20) DEFAULT 'pending' CHECK (Status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    ShippingAddress NVARCHAR(500) NOT NULL,
    ShippingPhone NVARCHAR(20) NOT NULL,
    Notes NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

-- 5. OrderDetails Table
CREATE TABLE OrderDetails (
    OrderDetailID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT FOREIGN KEY REFERENCES Orders(OrderID) ON DELETE CASCADE,
    ProductID INT FOREIGN KEY REFERENCES Products(ProductID),
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10,2) NOT NULL,
    TotalPrice DECIMAL(10,2) NOT NULL
);

-- 6. Promotions Table
CREATE TABLE Promotions (
    PromotionID INT IDENTITY(1,1) PRIMARY KEY,
    PromotionCode NVARCHAR(50) NOT NULL UNIQUE,
    PromotionName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500),
    DiscountType NVARCHAR(20) NOT NULL CHECK (DiscountType IN ('percentage', 'fixed')),
    DiscountValue DECIMAL(10,2) NOT NULL,
    MinOrderAmount DECIMAL(10,2) DEFAULT 0,
    MaxDiscountAmount DECIMAL(10,2),
    StartDate DATETIME2 NOT NULL,
    EndDate DATETIME2 NOT NULL,
    UsageLimit INT,
    UsedCount INT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- 7. Contacts Table
CREATE TABLE Contacts (
    ContactID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20),
    Company NVARCHAR(100),
    Subject NVARCHAR(200),
    Message NVARCHAR(1000) NOT NULL,
    Status NVARCHAR(20) DEFAULT 'new' CHECK (Status IN ('new', 'read', 'replied', 'closed')),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

-- 8. Cart Table (for persistent cart)
CREATE TABLE Cart (
    CartID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    ProductID INT FOREIGN KEY REFERENCES Products(ProductID),
    Quantity INT NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    UNIQUE(UserID, ProductID)
);

-- Create Indexes for better performance
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_Username ON Users(Username);
CREATE INDEX IX_Products_CategoryID ON Products(CategoryID);
CREATE INDEX IX_Products_IsActive ON Products(IsActive);
CREATE INDEX IX_Products_IsFeatured ON Products(IsFeatured);
CREATE INDEX IX_Orders_UserID ON Orders(UserID);
CREATE INDEX IX_Orders_Status ON Orders(Status);
CREATE INDEX IX_Orders_CreatedAt ON Orders(CreatedAt);
CREATE INDEX IX_OrderDetails_OrderID ON OrderDetails(OrderID);
CREATE INDEX IX_OrderDetails_ProductID ON OrderDetails(ProductID);
CREATE INDEX IX_Promotions_Code ON Promotions(PromotionCode);
CREATE INDEX IX_Promotions_IsActive ON Promotions(IsActive);
CREATE INDEX IX_Contacts_Status ON Contacts(Status);
CREATE INDEX IX_Cart_UserID ON Cart(UserID);

-- Insert sample data
-- Categories
INSERT INTO Categories (CategoryName, Description, ImageURL) VALUES
('Bánh sinh nhật', 'Những chiếc bánh đặc biệt cho ngày sinh nhật', 'assets/images/category-birthday.jpg'),
('Bánh cưới', 'Bánh cưới sang trọng cho ngày trọng đại', 'assets/images/category-wedding.jpg'),
('Bánh tráng miệng', 'Bánh ngọt thơm ngon cho bữa tráng miệng', 'assets/images/category-dessert.jpg'),
('Bánh theo mùa', 'Bánh đặc trưng theo từng mùa trong năm', 'assets/images/category-seasonal.jpg');

-- Products
INSERT INTO Products (ProductName, Description, Price, CategoryID, ImageURL, Ingredients, IsFeatured, StockQuantity) VALUES
('Bánh Kem Chocolate', 'Bánh kem chocolate thơm ngon với lớp kem mịn màng', 250000, 1, 'assets/images/cake1.jpg', 'Bột mì, trứng, sữa, chocolate, kem tươi', 1, 50),
('Bánh Kem Vanilla', 'Bánh kem vanilla truyền thống với hương vị tinh tế', 200000, 1, 'assets/images/cake2.jpg', 'Bột mì, trứng, sữa, vanilla, kem tươi', 1, 30),
('Bánh Kem Dâu Tây', 'Bánh kem dâu tây tươi ngon, ngọt ngào', 280000, 1, 'assets/images/cake3.jpg', 'Bột mì, trứng, sữa, dâu tây, kem tươi', 1, 25),
('Bánh Cưới 3 Tầng', 'Bánh cưới 3 tầng sang trọng cho ngày cưới', 1500000, 2, 'assets/images/wedding-cake.jpg', 'Bột mì, trứng, sữa, kem tươi, hoa trang trí', 0, 10),
('Tiramisu', 'Bánh tiramisu Ý thơm ngon, đậm đà', 180000, 3, 'assets/images/tiramisu.jpg', 'Bánh quy, mascarpone, cà phê, cacao', 0, 40),
('Cheesecake Dâu', 'Cheesecake dâu tây mát lạnh', 220000, 3, 'assets/images/cheesecake.jpg', 'Bánh quy, cream cheese, dâu tây, gelatin', 0, 35);

-- Admin user (password: admin123)
INSERT INTO Users (Username, Email, PasswordHash, FullName, Phone, Role) VALUES
('admin', 'admin@lacuisinengot.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', '0123456789', 'admin');

-- Sample customer (password: customer123)
INSERT INTO Users (Username, Email, PasswordHash, FullName, Phone, Address) VALUES
('customer1', 'customer@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Văn A', '0987654321', '123 Đường ABC, Quận 1, TP.HCM');

-- Sample promotions
INSERT INTO Promotions (PromotionCode, PromotionName, Description, DiscountType, DiscountValue, MinOrderAmount, StartDate, EndDate, UsageLimit) VALUES
('WELCOME10', 'Chào mừng khách hàng mới', 'Giảm 10% cho đơn hàng đầu tiên', 'percentage', 10, 200000, '2024-01-01', '2024-12-31', 100),
('SAVE50K', 'Tiết kiệm 50k', 'Giảm 50,000 VNĐ cho đơn hàng từ 500,000 VNĐ', 'fixed', 50000, 500000, '2024-01-01', '2024-12-31', 200);

-- Sample contact
INSERT INTO Contacts (FullName, Email, Phone, Company, Subject, Message) VALUES
('Nguyễn Thị B', 'nguyenthib@example.com', '0123456789', 'Công ty ABC', 'Tư vấn bánh cưới', 'Tôi muốn tư vấn về bánh cưới cho đám cưới vào tháng 6. Xin vui lòng liên hệ lại.');

-- Create stored procedures
-- Procedure to get featured products
CREATE PROCEDURE GetFeaturedProducts
AS
BEGIN
    SELECT p.*, c.CategoryName 
    FROM Products p
    INNER JOIN Categories c ON p.CategoryID = c.CategoryID
    WHERE p.IsFeatured = 1 AND p.IsActive = 1
    ORDER BY p.CreatedAt DESC;
END;
GO

-- Procedure to get products by category
CREATE PROCEDURE GetProductsByCategory
    @CategoryID INT
AS
BEGIN
    SELECT p.*, c.CategoryName 
    FROM Products p
    INNER JOIN Categories c ON p.CategoryID = c.CategoryID
    WHERE p.CategoryID = @CategoryID AND p.IsActive = 1
    ORDER BY p.ProductName;
END;
GO

-- Procedure to search products
CREATE PROCEDURE SearchProducts
    @SearchTerm NVARCHAR(200)
AS
BEGIN
    SELECT p.*, c.CategoryName 
    FROM Products p
    INNER JOIN Categories c ON p.CategoryID = c.CategoryID
    WHERE p.IsActive = 1 
    AND (p.ProductName LIKE '%' + @SearchTerm + '%' 
         OR p.Description LIKE '%' + @SearchTerm + '%'
         OR c.CategoryName LIKE '%' + @SearchTerm + '%')
    ORDER BY p.ProductName;
END;
GO

-- Procedure to create order
CREATE PROCEDURE CreateOrder
    @UserID INT,
    @OrderNumber NVARCHAR(20),
    @ShippingAddress NVARCHAR(500),
    @ShippingPhone NVARCHAR(20),
    @Notes NVARCHAR(500),
    @OrderID INT OUTPUT
AS
BEGIN
    DECLARE @TotalAmount DECIMAL(10,2) = 0;
    
    -- Calculate total from cart
    SELECT @TotalAmount = SUM(p.Price * c.Quantity)
    FROM Cart c
    INNER JOIN Products p ON c.ProductID = p.ProductID
    WHERE c.UserID = @UserID;
    
    -- Create order
    INSERT INTO Orders (OrderNumber, UserID, TotalAmount, ShippingAddress, ShippingPhone, Notes)
    VALUES (@OrderNumber, @UserID, @TotalAmount, @ShippingAddress, @ShippingPhone, @Notes);
    
    SET @OrderID = SCOPE_IDENTITY();
    
    -- Create order details
    INSERT INTO OrderDetails (OrderID, ProductID, Quantity, UnitPrice, TotalPrice)
    SELECT @OrderID, c.ProductID, c.Quantity, p.Price, p.Price * c.Quantity
    FROM Cart c
    INNER JOIN Products p ON c.ProductID = p.ProductID
    WHERE c.UserID = @UserID;
    
    -- Clear cart
    DELETE FROM Cart WHERE UserID = @UserID;
END;
GO

-- Procedure to get order statistics
CREATE PROCEDURE GetOrderStatistics
    @StartDate DATETIME2 = NULL,
    @EndDate DATETIME2 = NULL
AS
BEGIN
    IF @StartDate IS NULL SET @StartDate = DATEADD(MONTH, -1, GETDATE());
    IF @EndDate IS NULL SET @EndDate = GETDATE();
    
    SELECT 
        COUNT(*) as TotalOrders,
        SUM(TotalAmount) as TotalRevenue,
        AVG(TotalAmount) as AverageOrderValue,
        COUNT(CASE WHEN Status = 'delivered' THEN 1 END) as DeliveredOrders
    FROM Orders
    WHERE CreatedAt BETWEEN @StartDate AND @EndDate;
END;
GO

-- Create triggers for updated_at
CREATE TRIGGER TR_Users_UpdatedAt
ON Users
AFTER UPDATE
AS
BEGIN
    UPDATE Users 
    SET UpdatedAt = GETDATE()
    FROM Users u
    INNER JOIN inserted i ON u.UserID = i.UserID;
END;
GO

CREATE TRIGGER TR_Products_UpdatedAt
ON Products
AFTER UPDATE
AS
BEGIN
    UPDATE Products 
    SET UpdatedAt = GETDATE()
    FROM Products p
    INNER JOIN inserted i ON p.ProductID = i.ProductID;
END;
GO

CREATE TRIGGER TR_Orders_UpdatedAt
ON Orders
AFTER UPDATE
AS
BEGIN
    UPDATE Orders 
    SET UpdatedAt = GETDATE()
    FROM Orders o
    INNER JOIN inserted i ON o.OrderID = i.OrderID;
END;
GO

PRINT 'Database schema created successfully!';

