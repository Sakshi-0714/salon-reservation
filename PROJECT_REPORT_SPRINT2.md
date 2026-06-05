# SALON RESERVATION AND SCHEDULING SYSTEM — StaySync (Sprint 2)

---

## CHAPTER 6: IMPLEMENTATION

*(This chapter is reserved for actual screenshots and code snippets from developed components. Screenshots should be captioned with figure numbers following the format "Figure 6.X: Description" and centralized. Each figure should be followed by four to five lines of descriptive text explaining the depicted component or functionality.)*

### 6.1 AUTHENTICATION MODULE

(Add screenshots and code snippets here)

### 6.2 USER DASHBOARD MODULE

(Add screenshots and code snippets here)

### 6.3 ADMIN MODULE

(Add screenshots and code snippets here)

### 6.4 PAYMENT MODULE

(Add screenshots and code snippets here)

---

## CHAPTER 7: TESTING AND EVALUATION

### 7.1 UNIT TESTING

Unit testing was conducted to verify the correctness of individual functions and modules in isolation. Each backend controller function and frontend utility function was tested independently to ensure it produces expected outputs for given inputs.

**Table 7.1: Unit Test Cases — Authentication Module**

| Test Case ID | Component | Test Description | Input | Expected Output | Actual Output | Status |
|-------------|-----------|-----------------|-------|-----------------|---------------|--------|
| UT-01 | validatePassword() | Test password with less than six characters | "Ab1" | Error: Password must be at least 6 characters | Error: Password must be at least 6 characters | Pass |
| UT-02 | validatePassword() | Test password without uppercase letter | "abcdef1" | Error: Password must contain at least 1 uppercase letter | Error: Password must contain at least 1 uppercase letter | Pass |
| UT-03 | validatePassword() | Test password without numeric digit | "Abcdef" | Error: Password must contain at least 1 number | Error: Password must contain at least 1 number | Pass |
| UT-04 | validatePassword() | Test valid password | "Abcdef1" | null (no error) | null | Pass |
| UT-05 | validatePhone() | Test phone number with fewer than ten digits | "98765" | Error: Mobile number must be exactly 10 digits | Error: Mobile number must be exactly 10 digits | Pass |
| UT-06 | validatePhone() | Test valid ten-digit number | "9876543210" | null (no error) | null | Pass |
| UT-07 | generateToken() | Test JWT token generation | id=1, role="user" | Valid JWT string | Valid JWT string containing encoded payload | Pass |
| UT-08 | parseServices() | Test JSON string parsing | '[\{"name":"Haircut"\}]' | Array with one object | Array with one object | Pass |
| UT-09 | parseServices() | Test invalid JSON string | "invalid" | Empty array | Empty array | Pass |
| UT-10 | calculateBillTotal() | Test total with mixed statuses | Services array with one Approved at 50, one Cancelled at 30 | 50.00 | 50.00 | Pass |
| UT-11 | formatPhoneNumber() | Test ten-digit Indian number | "9876543210" | "+919876543210" | "+919876543210" | Pass |
| UT-12 | formatPhoneNumber() | Test twelve-digit number starting with 91 | "919876543210" | "+919876543210" | "+919876543210" | Pass |
| UT-13 | getBillNumberFromPhone() | Test bill number from phone | phone="9876543210", apptId=5 | "9876543210" | "9876543210" | Pass |
| UT-14 | getBillNumberFromPhone() | Test fallback when phone is empty | phone="", apptId=5 | "APPT-5" | "APPT-5" | Pass |

**Table 7.2: Unit Test Cases — Frontend Validation Functions**

| Test Case ID | Component | Test Description | Input | Expected Output | Actual Output | Status |
|-------------|-----------|-----------------|-------|-----------------|---------------|--------|
| UT-15 | validateEmail() | Test invalid email format | "userexample" | "Please enter a valid email address" | "Please enter a valid email address" | Pass |
| UT-16 | validateEmail() | Test valid email format | "user@example.com" | Empty string (no error) | Empty string | Pass |
| UT-17 | getPasswordStrength() | Test weak password | "a" | level: 1, label: "Weak" | level: 1, label: "Weak" | Pass |
| UT-18 | getPasswordStrength() | Test strong password | "Abcdef123" | level: 3, label: "Strong" | level: 3, label: "Strong" | Pass |
| UT-19 | isPasswordValid() | Test password meeting all rules | "Test123" | true | true | Pass |
| UT-20 | isPasswordValid() | Test password missing uppercase | "test123" | false | false | Pass |

### 7.2 FUNCTIONALITY TESTING

Functionality testing was performed to verify that each feature of the system operates correctly according to the functional requirements specified in Chapter 4.

**Table 7.3: Functionality Test Cases**

| Test Case ID | Module | Test Scenario | Steps | Expected Result | Actual Result | Status |
|-------------|--------|--------------|-------|-----------------|---------------|--------|
| FT-01 | Authentication | New user registration with valid data | 1. Navigate to Auth page 2. Enter name, email, phone 3. Click Send Verification Code 4. Enter received OTP 5. Set password 6. Submit | User account created, redirected to login | User account created, success message displayed, redirected to login | Pass |
| FT-02 | Authentication | Registration with existing email | 1. Navigate to Auth page 2. Enter previously registered email 3. Click Send Verification Code | Error message: "User already exists with this email" | Error displayed as expected | Pass |
| FT-03 | Authentication | Login with valid credentials | 1. Enter registered email and password 2. Click Log In | JWT token stored, redirected to landing page | Login successful, token stored in localStorage | Pass |
| FT-04 | Authentication | Login with incorrect password | 1. Enter registered email 2. Enter wrong password 3. Click Log In | Error message: "Invalid email or password" | Error displayed as expected | Pass |
| FT-05 | Authentication | Password reset flow | 1. Click Forgot Password 2. Enter email 3. Submit reset code 4. Enter new password | Password updated, user can login with new password | Password reset successful, login confirmed | Pass |
| FT-06 | Services | Browse service catalogue | 1. Navigate to Services page 2. Observe category sections | All four categories displayed with respective services | Categories and services rendered correctly | Pass |
| FT-07 | Services | Add services to booking cart | 1. Browse services 2. Click Add on multiple services | Services appear in sidebar with running total | Selected services displayed with correct total | Pass |
| FT-08 | Booking | Book appointment with valid date and time | 1. Select services 2. Choose future date 3. Choose time 4. Click Confirm Booking | Appointment created, confirmation message shown | Booking confirmed, appointment visible in My Appointments | Pass |
| FT-09 | Booking | Attempt booking on already-booked slot | 1. Book a time slot 2. Another user attempts same slot | Error message: "This time slot is already booked" | Conflict detected, error message displayed | Pass |
| FT-10 | Booking | Attempt booking for past date | 1. Select services 2. Try to pick a past date in the date picker | Date picker prevents selection of past dates | Past dates are disabled in the calendar control | Pass |
| FT-11 | Payment | Online payment via Razorpay | 1. View appointment 2. Click Pay Online Now 3. Complete Razorpay checkout | Payment verified, status updated to Paid, bill generated | Payment processed, bill created, SMS attempted | Pass |
| FT-12 | Payment | Select pay-in-person option | 1. View appointment 2. Click Pay In Person | Appointment marked as pay-in-person | Status updated, "Pay In Person" label displayed | Pass |
| FT-13 | Admin | Approve a service in appointment | 1. Login as admin 2. Navigate to Admin Dashboard 3. Click Approve on a service | Service status changes to Approved | Status updated to Approved in real-time | Pass |
| FT-14 | Admin | Mark service as completed | 1. Login as admin 2. Click Complete on a service | Service status changes to Completed, email notification sent | Status updated, completion email sent to customer | Pass |
| FT-15 | Admin | Cancel entire session | 1. Login as admin 2. Click Cancel Entire Session 3. Confirm dialog | All services marked Cancelled, email sent | Session cancelled, notification dispatched | Pass |
| FT-16 | Admin | Search appointments by phone | 1. Enter phone number in search bar 2. Click Search | Matching appointments displayed | Results filtered correctly by phone number | Pass |
| FT-17 | User | Cancel own appointment | 1. View My Appointments 2. Click Cancel Booking 3. Confirm | Appointment marked as Cancelled | Status updated, confirmation email sent | Pass |
| FT-18 | User | Submit review for completed service | 1. View completed appointment 2. Click Give Review 3. Rate and comment 4. Submit | Review saved, displayed on landing page | Review submitted successfully | Pass |
| FT-19 | Admin | Add new staff member | 1. Navigate to Staff page 2. Fill form 3. Submit | Staff record created, service assignment updated | Staff added, reflected in service listings | Pass |
| FT-20 | Admin | Deactivate staff member | 1. Edit staff record 2. Set status to Inactive 3. Save | Staff marked inactive, corresponding service shows as Unavailable | Service availability updated on booking page | Pass |

### 7.3 INTEGRATION TESTING

Integration testing verified that different modules of the system interact correctly when combined. The focus was on data flow across module boundaries and consistency of state between frontend and backend components.

**Table 7.4: Integration Test Cases**

| Test Case ID | Modules Integrated | Test Scenario | Expected Behaviour | Actual Behaviour | Status |
|-------------|-------------------|--------------|-------------------|-----------------|--------|
| IT-01 | Authentication + Appointment | Authenticated user creates booking | JWT token from login is sent in Authorization header with booking request. Backend decodes token to extract user ID and creates appointment linked to that user. | Appointment created with correct user_id foreign key. | Pass |
| IT-02 | Appointment + Payment | User pays for booked appointment | After booking, user initiates Razorpay payment. On successful verification, appointment payment_status updates to Paid and bill record is generated in bills table with correct appointment_id foreign key. | Payment status updated, bill generated with correct linkage. | Pass |
| IT-03 | Payment + SMS | Bill generation triggers SMS | Upon bill creation, system formats phone number and dispatches SMS via configured provider. Bill record stores sms_status as sent or failed with error details. | SMS dispatched, status recorded in bill record. | Pass |
| IT-04 | Staff + Services + Booking | Inactive staff prevents booking | Admin marks staff as Inactive. Frontend fetches staff status and disables the Add button on corresponding service card. User cannot add unavailable services to cart. | Service card displays "Unavailable" with greyed-out appearance. | Pass |
| IT-05 | Appointment + Email | Status change triggers email | Admin approves all services in a session. Backend detects all services are reviewed, composes a consolidated status email, and sends it to the customer's registered email via SMTP. | Email sent with correct service status summary. | Pass |
| IT-06 | Authentication + Admin Route | Non-admin access to admin routes | Regular user attempts to call admin-only API endpoint with their JWT token. Backend admin middleware checks role field in decoded token and returns 401 Unauthorized. | Access denied with appropriate error message. | Pass |
| IT-07 | Booking + Database Locking | Concurrent booking on same slot | Two simultaneous booking requests target the same date and time. Database FOR UPDATE lock ensures the first transaction commits while the second receives a conflict error. | First booking succeeds, second receives "slot already booked" error. | Pass |
| IT-08 | Review + Landing Page | Submitted review appears on homepage | User submits a five-star review for a completed service. Landing page fetches latest reviews from the API and renders the new review in the testimonials grid. | Review appears on landing page with correct rating, comment, and author name. | Pass |
| IT-09 | Profile + Payment | Phone number validation before payment | User with missing phone number clicks Pay Online. System validates phone, detects invalid number, and redirects to Profile page. After updating phone, user can proceed with payment. | Redirect to profile works, payment proceeds after update. | Pass |
| IT-10 | Admin + Bill Modal | Admin generates and views bill | Admin clicks View Bill on a paid appointment. If no bill exists, system auto-generates it. Bill modal displays customer details, itemized services, total amount, and payment reference. | Bill generated on demand and displayed correctly in modal. | Pass |

### 7.4 VERIFICATION AND VALIDATION TESTING

**Verification** confirms that the product is built correctly according to design specifications. **Validation** confirms that the product meets actual user needs and expectations.

**Verification Activities Performed:**

| Activity | Description | Outcome |
|----------|-------------|---------|
| Code Review | All controller functions reviewed for correct error handling, input validation, and response formatting | All functions follow consistent patterns with try-catch blocks and meaningful HTTP status codes |
| Schema Validation | Database schema compared against ER diagram to verify all entities, attributes, and relationships are correctly implemented | All seven tables (users, services, appointments, verification_codes, reviews, staff, bills) match design with correct data types and constraints |
| API Contract Validation | Each REST endpoint tested to confirm correct HTTP methods, URL patterns, request body formats, and response structures | All 22 API endpoints conform to documented specifications |
| Authentication Flow Validation | Token generation, verification, and role-based access control tested end-to-end | JWT tokens correctly encode user ID and role; middleware correctly blocks unauthorized and unauthenticated access |
| Transaction Integrity Verification | Database transactions for appointment booking and payment verification tested for atomicity | Transactions either fully commit or fully rollback; no partial state observed |

**Validation Activities Performed:**

| Activity | Description | Outcome |
|----------|-------------|---------|
| User Acceptance Testing | Representative users navigated the system to complete booking, payment, and review workflows | Users completed all workflows without guidance; interface deemed intuitive |
| Admin Workflow Validation | Salon administrator tested appointment management, staff CRUD, and analytics dashboard | All admin functions operated as expected; search and filter features found useful |
| Payment Gateway Validation | End-to-end payment tested using Razorpay test mode with test card numbers and UPI IDs | Payments processed, verified, and recorded correctly; signature validation confirmed |
| Responsive Design Validation | Application tested on mobile (375px), tablet (768px), and desktop (1920px) viewports | Layout adapts correctly; all interactive elements remain accessible at all viewport sizes |
| Error Handling Validation | Invalid inputs, network failures, and edge cases tested to verify graceful degradation | Meaningful error messages displayed; no unhandled exceptions or blank screens observed |
| Cross-Browser Validation | Application tested on Chrome, Firefox, Edge, and Safari | Consistent rendering and functionality across all tested browsers |

---

## CHAPTER 8: FUTURE ENHANCEMENTS

### 8.1 FUNCTIONALITY AND USER EXPERIENCE

The current implementation of StaySync provides a solid foundation for salon reservation management. Several enhancements can be introduced in subsequent development cycles to expand functionality and elevate the overall user experience.

**Multi-language Support:** Implementing internationalization (i18n) would allow the application to serve users in regional languages beyond English. This is particularly relevant for salons operating in linguistically diverse regions where customers may prefer interfaces in Hindi, Kannada, Marathi, or other regional languages. React-based i18n libraries such as react-i18next can facilitate this without restructuring the existing component architecture.

**Push Notification System:** Currently, appointment status updates are communicated through email. Integrating browser push notifications using the Web Push API would enable real-time alerts when an appointment is approved, completed, or cancelled, even when the user is not actively browsing the application. This reduces dependency on email checking and provides a more immediate communication channel.

**Loyalty and Rewards Programme:** Introducing a points-based loyalty system would encourage repeat visits. Customers could accumulate points for each completed appointment and redeem them for discounts on future bookings. The backend would require a new points ledger table and corresponding API endpoints to track accrual and redemption transactions.

**Advanced Service Customization:** Allowing services to have configurable durations and multiple pricing tiers (for example, short hair versus long hair pricing for haircuts) would enable more accurate scheduling and pricing. This enhancement would involve extending the services table schema and updating the booking logic to account for variable appointment durations when checking time slot availability.

**Customer Appointment History Analytics:** Providing users with a personal dashboard showing their visit frequency, favourite services, total spending over time, and upcoming appointment reminders would add substantial value. Visualization through charts would make this data immediately comprehensible.

**Online Chat Support:** Embedding a real-time chat widget would allow customers to communicate directly with salon staff for queries about services, availability, or special requests before booking. Solutions based on WebSocket technology or integrations with third-party chat platforms like Tawk.to could be evaluated.

**Waitlist Management:** When a preferred time slot is already booked, offering users the option to join a waitlist for that slot would improve booking flexibility. If the original booking is cancelled, the waitlisted user would receive an automatic notification and the opportunity to claim the slot.

### 8.2 PERFORMANCE AND SCALABILITY

**Database Query Optimization:** As the volume of appointment and billing records grows, implementing database indexing strategies on frequently queried columns such as appointment_date, user_id, and payment_status would maintain query performance. Additionally, partitioning the appointments table by date ranges could improve query response times for historical data retrieval.

**Caching Layer Implementation:** Introducing an in-memory caching solution such as Redis for frequently accessed and relatively static data, including the service catalogue and staff status listings, would reduce database load and improve response times for read-heavy operations. Cache invalidation strategies would ensure data freshness when services or staff records are updated.

**Microservices Architecture Migration:** The current monolithic backend architecture, while appropriate for the initial deployment scale, could be decomposed into independent microservices (authentication service, appointment service, payment service, notification service) as user volume increases. This would enable independent scaling of individual modules based on their specific load characteristics.

**Content Delivery Network Integration:** Serving static frontend assets through a CDN with geographically distributed edge servers would reduce page load times for users accessing the application from different regions. Vercel already provides CDN capabilities, but additional optimization through asset compression and image optimization pipelines would further improve performance.

**Load Testing and Auto-Scaling:** Implementing automated load testing using tools such as Apache JMeter or k6 would establish performance baselines and identify bottleneck thresholds. Coupling this with auto-scaling configurations on the hosting platform would ensure the system maintains acceptable response times during traffic spikes, such as during festive seasons or promotional campaigns.

**Database Connection Pool Tuning:** The current fixed connection pool limit of ten connections would need to be dynamically adjusted based on observed concurrent usage patterns. Implementing connection pool monitoring and alerting would help identify when the pool size needs to be increased to prevent connection wait queues.

---

## CHAPTER 9: RESULTS AND DISCUSSION

The StaySync Salon Reservation and Scheduling System was successfully developed, tested, and deployed as a fully operational web application. This chapter presents the key outcomes achieved during the development process and discusses observations, challenges encountered, and their resolutions.

**Successful Module Implementation:**
All four primary modules were developed and integrated to form a cohesive system. The Authentication Module supports complete user lifecycle management including registration with OTP verification, secure login, password reset, and profile updates. The User Dashboard Module provides customers with a transparent view of their appointment statuses and payment options. The Admin Module delivers comprehensive operational control over appointments, staff, and analytics. The Payment Module facilitates secure online transactions through the Razorpay gateway with automated bill generation and SMS notifications.

**Database Design and Integrity:**
The MySQL database schema comprising seven interrelated tables (users, services, appointments, verification_codes, reviews, staff, and bills) proved robust in maintaining data consistency throughout all testing scenarios. Foreign key constraints with CASCADE delete rules ensured that when a user account is removed, all dependent records including appointments, reviews, and bills are automatically cleaned up, preventing orphaned data.

**Concurrency Handling:**
The implementation of SELECT FOR UPDATE row-level locking within database transactions effectively prevented double-booking scenarios. During integration testing, simultaneous booking attempts on the same time slot were correctly serialized, with the first request succeeding and subsequent requests receiving informative conflict messages. This approach proved more reliable than application-level checks alone, as it handles race conditions at the database engine level.

**Payment Integration Outcomes:**
The Razorpay integration was tested extensively using the test mode environment. Order creation, checkout overlay rendering, payment processing, and HMAC-SHA256 signature verification all functioned as designed. The system correctly handled payment success, payment failure, and payment dismissal (user closing the checkout overlay) scenarios. Bill generation occurred atomically within the same database transaction as payment status updates, ensuring no partial state could occur.

**Email and SMS Delivery:**
SMTP-based email delivery through Gmail was configured with application-specific passwords. The system demonstrated reliable OTP delivery and appointment status notification dispatch. A graceful fallback mechanism was implemented: if SMTP fails, the system returns the OTP code directly in the API response for development convenience, ensuring the workflow is not blocked by email configuration issues. SMS delivery through SMSLocal was implemented with comprehensive error handling, including specific error code mapping for all documented SMSLocal API error responses.

**Responsive User Interface:**
The React-based frontend successfully adapts to multiple viewport sizes. The dark-themed interface with accent colours provides a visually cohesive experience. Interactive elements including the step indicator for registration, expandable service cards with accordion behaviour, star rating input for reviews, and the Razorpay checkout overlay all render and function correctly across Chrome, Firefox, Edge, and Safari browsers.

**Challenges and Resolutions:**

| Challenge | Resolution |
|-----------|-----------|
| Time format inconsistencies between JavaScript Date objects and MySQL TIME columns caused booking conflict checks to fail | Configured the mysql2 connection pool with dateStrings: true to preserve string formats and used explicit DATE() and TIME() casting in SQL queries |
| Concurrent booking requests could bypass application-level availability checks due to race conditions | Implemented database-level FOR UPDATE locking within explicit transactions to serialize concurrent access to the same time slot |
| Razorpay checkout script loading failures on slow network connections | Implemented a dynamic script loader with Promise-based resolution that checks for existing script elements before injection, preventing duplicate loads |
| Service card accordion expansion caused sibling cards in the CSS grid to stretch vertically | Applied align-items: start to the grid container, ensuring each card maintains its natural height independently |
| SMTP configuration failures during deployment blocked the entire registration flow | Implemented a graceful fallback that detects SMTP availability at startup and switches to mock mode, returning codes directly when email delivery is unavailable |

**Performance Observations:**
Under normal operating conditions with a single-user or low-concurrency access pattern, API response times averaged under two hundred milliseconds for standard CRUD operations. Page load times on first visit were within three seconds, with subsequent navigations benefiting from React's single-page application architecture that avoids full page reloads.

---

## CHAPTER 10: CONCLUSION

The StaySync Salon Reservation and Scheduling System was conceived, designed, developed, and deployed as a comprehensive solution to the operational challenges faced by modern salons in managing appointments, services, and payments. The project successfully delivered a fully functional web-based platform that bridges the gap between traditional manual salon management and the expectations of digitally connected customers.

The system addresses the core problem statement by automating the appointment lifecycle from initial service discovery through payment confirmation. Customers benefit from a self-service interface where they can browse categorized services with transparent pricing, book appointments at convenient time slots with confidence that their reservation is protected against double-booking, and complete payments securely through an integrated payment gateway. The elimination of phone-based booking and manual record-keeping reduces friction for both customers and salon operators.

The four implemented modules work in concert to deliver end-to-end functionality. The Authentication Module establishes a secure foundation with multi-step OTP-verified registration and token-based session management. The User Dashboard Module empowers customers with visibility into their appointment statuses and payment history. The Admin Module equips salon managers with tools for efficient appointment review, staff management, and operational insights through analytics dashboards. The Payment Module completes the transaction cycle with Razorpay integration, automated bill generation, and SMS notification delivery.

From a technical perspective, the project demonstrates the effectiveness of a modern full-stack architecture. React on the frontend delivers a responsive, component-based interface that adapts to diverse screen sizes. Node.js with Express on the backend provides an efficient, event-driven platform for handling API requests with proper authentication middleware and role-based access control. MySQL serves as a reliable relational data store with transaction support and referential integrity enforcement that proved essential for preventing data inconsistencies in concurrent access scenarios.

The testing and evaluation phase confirmed that the system meets its functional and non-functional requirements. Unit tests validated individual function correctness, functionality tests confirmed feature-level behaviour, and integration tests verified cross-module data flow consistency. The system passed verification against its design specifications and validation against user expectations through acceptance testing.

The project also identified clear pathways for future enhancement, including multi-language support, push notifications, loyalty programmes, and architectural evolution toward microservices for improved scalability. These enhancements can be pursued incrementally without requiring fundamental restructuring of the existing codebase.

In conclusion, the StaySync system successfully achieves its objective of providing a smooth, organized, and efficient salon reservation experience. It transforms the traditionally manual and error-prone appointment management process into a streamlined digital workflow that benefits customers, staff, and salon administrators alike.

---

## CHAPTER 11: REFERENCES

1. React Documentation. "Getting Started with React." Meta Platforms, Inc. Available at: https://react.dev/learn. Accessed: April 2026.

2. Express.js Documentation. "Express — Fast, Unopinionated, Minimalist Web Framework for Node.js." OpenJS Foundation. Available at: https://expressjs.com/. Accessed: April 2026.

3. MySQL Documentation. "MySQL 8.0 Reference Manual." Oracle Corporation. Available at: https://dev.mysql.com/doc/refman/8.0/en/. Accessed: April 2026.

4. Razorpay Documentation. "Razorpay Integration Guide — Standard Checkout." Razorpay Software Private Limited. Available at: https://razorpay.com/docs/payments/server-integration/nodejs/. Accessed: May 2026.

5. JSON Web Tokens. "Introduction to JSON Web Tokens." Auth0 Inc. Available at: https://jwt.io/introduction. Accessed: April 2026.

6. Node.js Documentation. "Node.js v18 Documentation." OpenJS Foundation. Available at: https://nodejs.org/docs/latest-v18.x/api/. Accessed: April 2026.

7. bcrypt npm Package. "bcrypt — A Library to Help You Hash Passwords." Kelect Inc. Available at: https://www.npmjs.com/package/bcrypt. Accessed: April 2026.

8. Nodemailer Documentation. "Nodemailer — Send Emails from Node.js." Available at: https://nodemailer.com/about/. Accessed: April 2026.

9. React Router Documentation. "React Router v7 — Declarative Routing for React." Remix Software Inc. Available at: https://reactrouter.com/. Accessed: April 2026.

10. Leaflet Documentation. "Leaflet — An Open-Source JavaScript Library for Mobile-Friendly Interactive Maps." Available at: https://leafletjs.com/reference.html. Accessed: April 2026.

11. Recharts Documentation. "Recharts — A Composable Charting Library Built on React Components." Available at: https://recharts.org/en-US/. Accessed: April 2026.

12. Axios Documentation. "Axios — Promise Based HTTP Client for the Browser and Node.js." Available at: https://axios-http.com/docs/intro. Accessed: April 2026.

13. Pressman, R. S. and Maxim, B. R. "Software Engineering: A Practitioner's Approach." 9th Edition, McGraw-Hill Education, 2019.

14. Sommerville, I. "Software Engineering." 10th Edition, Pearson Education, 2015.

15. MySQL Documentation. "InnoDB Locking and Transaction Model." Oracle Corporation. Available at: https://dev.mysql.com/doc/refman/8.0/en/innodb-locking-transaction-model.html. Accessed: April 2026.

16. OWASP Foundation. "OWASP Top Ten Web Application Security Risks." Available at: https://owasp.org/www-project-top-ten/. Accessed: April 2026.

17. Fielding, R. T. "Architectural Styles and the Design of Network-based Software Architectures." Doctoral Dissertation, University of California, Irvine, 2000.

---

*End of Sprint 2 — Chapters 6 through 11*
