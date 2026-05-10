# Salon Reservation API Documentation

## Base URL
- **Development**: `http://localhost:5000`
- **Production**: `https://salon-backend-xxxxx.onrender.com`

## Authentication
Most endpoints require JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

## API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123"
}

Response: 200 OK
{
  "id": 1,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "user"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "id": 1,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "user"
}
```

### Appointment Endpoints

#### Create Appointment
```
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "appointment_date": "2024-06-15",
  "appointment_time": "14:30",
  "paid_advance": false,
  "services": [
    {
      "id": 1,
      "name": "Haircut",
      "price": 500
    }
  ]
}

Response: 201 Created
{
  "id": 5,
  "message": "Appointment booked successfully"
}
```

#### Get My Appointments
```
GET /api/appointments/myappointments
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 5,
    "appointment_date": "2024-06-15",
    "appointment_time": "14:30",
    "services": [
      {
        "id": 1,
        "name": "Haircut",
        "price": 500,
        "status": "Pending"
      }
    ],
    "payment_status": "Pending",
    "paid_advance": false
  }
]
```

#### Create Razorpay Order
```
POST /api/appointments/razorpay-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50000  // Amount in paise (₹500)
}

Response: 200 OK
{
  "id": "order_1A2b3C4d5E6f7G",
  "amount": 50000,
  "currency": "INR",
  "status": "created"
}
```

#### Verify Razorpay Payment
```
POST /api/appointments/verify-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "razorpay_order_id": "order_1A2b3C4d5E6f7G",
  "razorpay_payment_id": "pay_1A2b3C4d5E6f7G",
  "razorpay_signature": "signature_hash",
  "appointment_ids": [5]
}

Response: 200 OK
{
  "message": "Payment verified successfully"
}

** AUTO ACTIONS ON SUCCESS **
- Payment status updated to "Paid"
- Bill automatically generated
- SMS sent to customer's phone via backend mock SMS log
- Bill details stored in database
```

### Bill Endpoints

#### Get Bill Details
```
GET /api/appointments/:id/bill
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 12,
  "appointment_id": 5,
  "bill_number": "9876543210",  // Based on customer's phone number
  "total_amount": 500,
  "payment_status": "Paid",
  "appointment_date": "2024-06-15",
  "appointment_time": "14:30",
  "user_name": "John Doe",
  "phone": "9876543210",
  "services": [
    {
      "id": 1,
      "name": "Haircut",
      "price": 500
    }
  ]
}
```

#### Create Bill (Admin Manual)
```
POST /api/appointments/:id/bill
Authorization: Bearer <admin_token>

Response: 201 Created
{
  "message": "Bill generated successfully",
  "bill": {
    "bill_number": "9876543210",
    "total_amount": 500,
    "customer_name": "John Doe",
    "customer_phone": "9876543210",
    "payment_status": "Pending"
  }
}

** NOTE **
If payment_status is "Paid" or paid_advance is true, SMS is sent automatically
```

### Service Endpoints

#### Get All Services
```
GET /api/services

Response: 200 OK
[
  {
    "id": 1,
    "category": "Hair Services",
    "name": "Haircut",
    "description": "Trim, layers, step cut, etc.",
    "price": 500,
    "assigned_staff": "Anjali Patil"
  }
]
```

### Review Endpoints

#### Add Review
```
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "service_name": "Haircut",
  "rating": 5,
  "comment": "Excellent service!"
}

Response: 201 Created
{
  "id": 8,
  "message": "Review added successfully"
}
```

#### Get All Reviews
```
GET /api/reviews

Response: 200 OK
[
  {
    "id": 8,
    "user_name": "John Doe",
    "service_name": "Haircut",
    "rating": 5,
    "comment": "Excellent service!",
    "created_at": "2024-06-15T10:30:00.000Z"
  }
]
```

## Bill Generation & SMS Flow

### Automatic Trigger
After successful Razorpay payment verification, the backend:

1. **Updates Appointment**
   - Sets `payment_status = "Paid"`
   - Sets `payment_method = "Razorpay"`
   - Records `razorpay_order_id` and `razorpay_payment_id`

2. **Generates Bill**
   - Creates bill record in database
   - Uses customer's phone number as `bill_number` reference
   - Records `total_amount` from services
   - Sets payment status to "Paid"

3. **Sends SMS** (if Mock SMS configured)
   - Formats phone number to international format (+91xxxxxxxxxx)
   - Sends bill details via SMS to customer's phone
   - Includes:
     - Bill reference number
     - Total amount
     - Appointment date and time
     - Customer name

### SMS Format
```
Dear John Doe,

Your appointment bill has been generated!

Bill Reference: 9876543210
Total Amount: ₹500
Appointment Date: 2024-06-15
Appointment Time: 14:30
Payment Status: Paid

Thank you for choosing StaySync Salon!
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "message": "No authorization token provided"
}
```

### 404 Not Found
```json
{
  "message": "Appointment not found"
}
```

### 500 Server Error
```json
{
  "message": "Server error",
  "error": "Detailed error message"
}
```

## Test Credentials (Development)

### Razorpay Test Card
- Card Number: `4111 1111 1111 1111`
- Expiry: `12/25`
- CVV: `123`
- OTP: `123456`

## Mock SMS Configuration

Mock SMS is simulated in the backend by logging the message payload and recipient details. No external SMS provider credentials or phone number configuration are required.

## Rate Limiting
Currently not implemented. Consider adding for production:
- 100 requests/minute per IP
- 1000 requests/day per user

## CORS Configuration
Frontend origin validation:
- `FRONTEND_URL` environment variable controls allowed origins
- Multiple origins: `https://app.com,https://app2.com`

## Environment Variables Required

```
# Database
DB_HOST=mysql-host
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=salon_db

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# Email
SMTP_EMAIL=email@gmail.com
SMTP_PASSWORD=app-password

# Frontend
FRONTEND_URL=https://frontend.app

# Server
PORT=5000
NODE_ENV=production
```

---

**Last Updated**: May 2024
**API Version**: 1.0


