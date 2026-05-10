ALTER TABLE bills
  ADD COLUMN customer_name VARCHAR(100) NULL AFTER bill_number,
  ADD COLUMN customer_phone VARCHAR(20) NULL AFTER customer_name,
  ADD COLUMN customer_email VARCHAR(100) NULL AFTER customer_phone,
  ADD COLUMN services JSON NULL AFTER customer_email,
  ADD COLUMN razorpay_order_id VARCHAR(255) NULL AFTER payment_status,
  ADD COLUMN razorpay_payment_id VARCHAR(255) NULL AFTER razorpay_order_id,
  ADD COLUMN sms_status ENUM('pending', 'sent', 'failed', 'skipped') DEFAULT 'pending' AFTER razorpay_payment_id,
  ADD COLUMN sms_error TEXT NULL AFTER sms_status,
  ADD COLUMN sms_sent_at TIMESTAMP NULL AFTER sms_error,
  ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;
