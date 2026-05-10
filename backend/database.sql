-- Run this file inside the target database.
-- Railway MySQL usually uses the database from MYSQL_PUBLIC_URL, commonly `railway`.
-- For local MySQL, create/select your local DB first, for example:
-- CREATE DATABASE IF NOT EXISTS salon_db;
-- USE salon_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  lat DECIMAL(10, 8),   
  lng DECIMAL(11, 8),   
  address VARCHAR(255),
  assigned_staff VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  services JSON NOT NULL,
  paid_advance BOOLEAN DEFAULT FALSE,
  pay_in_person BOOLEAN DEFAULT FALSE,
  payment_status VARCHAR(50) DEFAULT 'Pending',
  payment_method VARCHAR(50) DEFAULT NULL,
  razorpay_order_id VARCHAR(255) DEFAULT NULL,
  razorpay_payment_id VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Verification codes table for OTP verification (registration & password reset)
CREATE TABLE IF NOT EXISTS verification_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_expires (expires_at)
);

-- Reviews table for customer testimonials
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  service_name VARCHAR(100) NOT NULL,
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_service_review (user_id, service_name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  assigned_service VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL UNIQUE,
  bill_number VARCHAR(100) NOT NULL,
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(100),
  services JSON,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'Pending',
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  sms_status ENUM('pending', 'sent', 'failed', 'skipped') DEFAULT 'pending',
  sms_error TEXT,
  sms_sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

-- Cleanup old data if re-running
DELETE FROM services;
DELETE FROM staff;

-- Insert all required services
INSERT IGNORE INTO services (category, name, description, price, image_url, lat, lng, address, assigned_staff) VALUES
-- Hair Services
('Hair Services', 'Haircut', 'Trim, layers, step cut, etc.', 30.00, NULL, 40.7128, -74.0060, '123 Wellness Ave, NY', 'Anjali Patil'),
('Hair Services', 'Hair Styling', 'Blow dry, curls, straightening', 40.00, NULL, 40.7128, -74.0060, '123 Wellness Ave, NY', 'Sneha Jadhav'),
('Hair Services', 'Hair Wash & Conditioning', 'Deep cleansing and conditioning', 20.00, NULL, 40.7128, -74.0060, '123 Wellness Ave, NY', 'Pooja Shinde'),
('Hair Services', 'Hair Spa', 'Relaxing and nourishing hair spa', 50.00, NULL, 40.7128, -74.0060, '123 Wellness Ave, NY', 'Neha Pawar'),
('Hair Services', 'Hair Coloring', 'Global, highlights, balayage', 80.00, NULL, 40.7128, -74.0060, '123 Wellness Ave, NY', 'Priya Chavan'),
('Hair Services', 'Keratin / Smoothening / Rebonding', 'Professional hair smoothing treatments', 150.00, NULL, 40.7128, -74.0060, '123 Wellness Ave, NY', 'Riya More'),

-- Skin / Face Services
('Skin / Face Services', 'Facial', 'Fruit, gold, diamond, anti-aging', 60.00, NULL, 40.7589, -73.9851, '456 Calm Street, NY', 'Kavya Gowda'),
('Skin / Face Services', 'Cleanup', 'Deep face cleanup', 35.00, NULL, 40.7589, -73.9851, '456 Calm Street, NY', 'Aishwarya Naik'),
('Skin / Face Services', 'Bleach', 'Face and neck bleach', 25.00, NULL, 40.7589, -73.9851, '456 Calm Street, NY', 'Swati Reddy'),
('Skin / Face Services', 'Detan', 'Tan removal treatment', 30.00, NULL, 40.7589, -73.9851, '456 Calm Street, NY', 'Nisha Madar'),
('Skin / Face Services', 'Threading', 'Eyebrows, upper lip, forehead', 15.00, NULL, 40.7589, -73.9851, '456 Calm Street, NY', 'Komal Patil'),
('Skin / Face Services', 'Face massage', 'Relaxing face massage', 25.00, NULL, 40.7589, -73.9851, '456 Calm Street, NY', 'Shreya Kori'),

-- Body Services
('Body Services', 'Waxing ', 'Full body or partial waxing', 55.00, NULL, 40.7306, -73.9352, '123 Wellness Ave, NY', 'Meena Khot'),
('Body Services', 'Body polishing', 'Full body exfoliation and polishing', 80.00, NULL, 40.7306, -73.9352, '123 Wellness Ave, NY', 'Tanvi Kadam'),
('Body Services', 'Body spa', 'Luxurious body spa', 100.00, NULL, 40.7306, -73.9352, '123 Wellness Ave, NY', 'Deepika Dhangar'),
('Body Services', 'Body massage', 'Deep tissue or Swedish massage', 90.00, NULL, 40.7306, -73.9352, '123 Wellness Ave, NY', 'Bhavna Kamble'),

-- Makeup Services
('Makeup Services', 'Party makeup', 'Elegant makeup for parties', 70.00, NULL, 40.7549, -73.9840, '456 Calm Street, NY', 'Radhika Gowda'),
('Makeup Services', 'Engagement makeup', 'Special engagement makeup', 150.00, NULL, 40.7549, -73.9840, '456 Calm Street, NY', 'Simran Patil'),
('Makeup Services', 'Bridal makeup', 'Complete bridal makeup package', 300.00, NULL, 40.7549, -73.9840, '456 Calm Street, NY', 'Pooja Jadhav'),
('Makeup Services', 'HD / Airbrush makeup', 'Flawless HD or airbrush makeup', 200.00, NULL, 40.7549, -73.9840, '456 Calm Street, NY', 'Kritika Bable');

INSERT IGNORE INTO staff (name, assigned_service, phone, address, status) VALUES
('Anjali Patil', 'Haircut', '9876543210', 'Tilakwadi, Belagavi', 'Active'),
('Sneha Jadhav', 'Hair Styling', '9876543211', 'Shahapur, Belagavi', 'Active'),
('Pooja Shinde', 'Hair Wash & Conditioning', '9876543212', 'Raviwar Peth, Belagavi', 'Active'),
('Neha Pawar', 'Hair Spa', '9876543213', 'Angol, Belagavi', 'Active'),
('Priya Chavan', 'Hair Coloring', '9876543214', 'Mahantesh Nagar, Belagavi', 'Active'),
('Riya More', 'Keratin / Smoothening / Rebonding', '9876543215', 'Vadgaon, Belagavi', 'Active'),
('Kavya Gowda', 'Facial', '9876543216', 'RPD Cross, Belagavi', 'Active'),
('Aishwarya Naik', 'Cleanup', '9876543217', 'Camp, Belagavi', 'Active'),
('Swati Reddy', 'Bleach', '9876543218', 'Sadashiv Nagar, Belagavi', 'Active'),
('Nisha Madar', 'Detan', '9876543219', 'Udyambag, Belagavi', 'Active'),
('Komal Patil', 'Threading', '9876543220', 'Hindwadi, Belagavi', 'Active'),
('Shreya Kori', 'Face massage', '9876543221', 'Khasbag, Belagavi', 'Active'),
('Meena Khot', 'Waxing ', '9876543222', 'Hanuman Nagar, Belagavi', 'Active'),
('Tanvi Kadam', 'Body polishing', '9876543223', 'Auto Nagar, Belagavi', 'Active'),
('Deepika Dhangar', 'Body spa', '9876543224', 'Nehru Nagar, Belagavi', 'Active'),
('Bhavna Kamble', 'Body massage', '9876543225', 'Peeranwadi, Belagavi', 'Active'),
('Radhika Gowda', 'Party makeup', '9876543226', 'Khade Bazar, Belagavi', 'Active'),
('Simran Patil', 'Engagement makeup', '9876543227', 'Bhagya Nagar, Belagavi', 'Active'),
('Pooja Jadhav', 'Bridal makeup', '9876543228', 'Subhash Nagar, Belagavi', 'Active'),
('Kritika Bable', 'HD / Airbrush makeup', '9876543229', 'Fort Road, Belagavi', 'Active');
