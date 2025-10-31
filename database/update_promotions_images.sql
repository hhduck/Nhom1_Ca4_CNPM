-- SQL script để cập nhật ImageURL cho các promotion hiện có
-- Chạy script này nếu database đã có dữ liệu promotion nhưng chưa có ImageURL

UPDATE Promotions 
SET ImageURL = 'assets/images/buy-1-get-1.jpg'
WHERE PromotionCode = 'GIAM10TRON15' AND (ImageURL IS NULL OR ImageURL = '');

UPDATE Promotions 
SET ImageURL = 'assets/images/free-ship.jpg'
WHERE PromotionCode = 'FREESHIPLOYAL' AND (ImageURL IS NULL OR ImageURL = '');

UPDATE Promotions 
SET ImageURL = 'assets/images/gg.jpg'
WHERE PromotionCode = 'FIRSTORDER10' AND (ImageURL IS NULL OR ImageURL = '');

