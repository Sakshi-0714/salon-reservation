const db = require('../config/db');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sendBillSMS, formatPhoneNumber } = require('../utils/smsService');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0].trim();

const getBillNumberFromPhone = (phone, appointmentId) => {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits || `APPT-${appointmentId}`;
};

const parseServices = (services) => {
  if (typeof services !== 'string') return Array.isArray(services) ? services : [];
  try {
    return JSON.parse(services);
  } catch (error) {
    return [];
  }
};

const calculateBillTotal = (services) => services.reduce((sum, service) => {
  const status = String(service.status || '').toLowerCase();
  if (['not available', 'rejected', 'cancelled'].includes(status)) return sum;
  return sum + (Number(service.price) || 0);
}, 0);

const createPaidBillAndSendSMS = async (connection, appointmentId, userId, paymentDetails) => {
  const [apptRows] = await connection.execute(`
    SELECT a.id, a.services, a.payment_status, a.appointment_date, a.appointment_time,
           u.phone, u.name as user_name, u.email
    FROM appointments a
    JOIN users u ON a.user_id = u.id
    WHERE a.id = ? AND a.user_id = ? AND a.payment_status = 'Paid' AND a.razorpay_payment_id IS NOT NULL
  `, [appointmentId, userId]);

  if (apptRows.length === 0) {
    throw new Error(`Appointment ${appointmentId} is not confirmed as paid`);
  }

  const appt = apptRows[0];
  const services = parseServices(appt.services);
  const totalAmount = calculateBillTotal(services);
  const billReference = getBillNumberFromPhone(appt.phone, appointmentId);
  const billDetails = {
    billNumber: billReference,
    totalAmount: totalAmount.toFixed(2),
    userName: appt.user_name,
    appointmentDate: appt.appointment_date,
    appointmentTime: appt.appointment_time,
  };

  const [existingBills] = await connection.execute(
    'SELECT sms_status FROM bills WHERE appointment_id = ?',
    [appointmentId]
  );
  const shouldSendSms = existingBills[0]?.sms_status !== 'sent';
  const formattedPhone = formatPhoneNumber(appt.phone);
  let smsStatus = 'skipped';
  let smsError = null;

  if (!shouldSendSms) {
    smsStatus = 'sent';
  } else if (formattedPhone) {
    try {
      const smsResult = await sendBillSMS(formattedPhone, billDetails);
      smsStatus = smsResult.success ? 'sent' : 'failed';
      smsError = smsResult.success ? null : smsResult.error || 'SMS delivery failed';
    } catch (error) {
      smsStatus = 'failed';
      smsError = error.message || 'SMS delivery failed';
      console.error(`Bill SMS failed for appointment ${appointmentId}:`, smsError);
    }
  } else {
    smsError = 'Registered mobile number is not available';
  }

  await connection.execute(`
    INSERT INTO bills (
      appointment_id, bill_number, customer_name, customer_phone, customer_email,
      services, total_amount, payment_status, razorpay_order_id, razorpay_payment_id,
      sms_status, sms_error, sms_sent_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Paid', ?, ?, ?, ?, ${shouldSendSms && smsStatus === 'sent' ? 'CURRENT_TIMESTAMP' : 'NULL'})
    ON DUPLICATE KEY UPDATE
      bill_number = VALUES(bill_number),
      customer_name = VALUES(customer_name),
      customer_phone = VALUES(customer_phone),
      customer_email = VALUES(customer_email),
      services = VALUES(services),
      total_amount = VALUES(total_amount),
      payment_status = 'Paid',
      razorpay_order_id = VALUES(razorpay_order_id),
      razorpay_payment_id = VALUES(razorpay_payment_id),
      sms_status = VALUES(sms_status),
      sms_error = VALUES(sms_error),
      sms_sent_at = COALESCE(VALUES(sms_sent_at), sms_sent_at)
  `, [
    appointmentId,
    billReference,
    appt.user_name,
    appt.phone,
    appt.email,
    JSON.stringify(services),
    totalAmount,
    paymentDetails.razorpay_order_id,
    paymentDetails.razorpay_payment_id,
    smsStatus,
    smsError,
  ]);

  return {
    appointment_id: appointmentId,
    bill_number: billReference,
    total_amount: totalAmount,
    customer_name: appt.user_name,
    customer_phone: appt.phone,
    sms_status: smsStatus,
  };
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  const { appointment_date, appointment_time, paid_advance, services } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Fetch staff assignments
    const [allStaff] = await connection.execute('SELECT name, assigned_service, status FROM staff');
    const staffMap = {};
    const staffStatusMap = {};
    allStaff.forEach(s => {
      if (s.assigned_service) {
        const trimmedService = s.assigned_service.trim();
        staffMap[trimmedService] = s.name;
        staffStatusMap[trimmedService] = s.status;
      }
    });

    // Check staff status
    for (const s of services) {
      const baseName = s.name.split(' - ')[0].trim();
      if (staffStatusMap[baseName] === 'Inactive') {
        await connection.rollback();
        return res.status(400).json({ message: `${baseName} service is currently unavailable.` });
      }
    }

    const resolvedServices = services.map(s => {
      const baseName = s.name.split(' - ')[0].trim();
      return { ...s, assigned_staff: staffMap[baseName] || 'Unassigned' };
    });

    // 2. FOR UPDATE: Lock existing appointments for this slot to prevent race conditions
    console.log(`Locking and checking availability for Date: ${appointment_date}, Time: ${appointment_time}`);
    const [existingAppointments] = await connection.execute(
      'SELECT id, services FROM appointments WHERE appointment_date = DATE(?) AND appointment_time = TIME(?) FOR UPDATE',
      [appointment_date, appointment_time]
    );

    const isAlreadyBooked = existingAppointments.some(row => {
      let svcs = row.services;
      if (typeof svcs === 'string') { try { svcs = JSON.parse(svcs); } catch (e) { svcs = []; } }
      return svcs.some(s => s.status !== 'Rejected' && s.status !== 'Not Available' && s.status !== 'Cancelled');
    });

    if (isAlreadyBooked) {
      console.log('Slot is already taken. Rolling back.');
      await connection.rollback();
      return res.status(400).json({ message: 'This time slot is already booked. Please select another time.' });
    }

    // 3. Insert new appointment
    const [result] = await connection.execute(
      'INSERT INTO appointments (user_id, appointment_date, appointment_time, paid_advance, services) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, appointment_date, appointment_time, paid_advance || false, JSON.stringify(resolvedServices)]
    );

    await connection.commit();
    res.status(201).json({ id: result.insertId, message: 'Appointment booked successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Create Appointment Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    connection.release();
  }
};

// @desc    Get logged in user appointments
// @route   GET /api/appointments/myappointments
// @access  Private
const getMyAppointments = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT a.* 
      FROM appointments a 
      WHERE a.user_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `, [req.user.id]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private/Admin
const getAppointments = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT a.*, u.name as user_name, u.email, u.phone 
      FROM appointments a 
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `);

    // Fetch current staff mapping to fill gaps for older appointments
    const [allStaff] = await db.execute('SELECT name, assigned_service FROM staff');
    const staffMap = {};
    allStaff.forEach(s => {
      staffMap[s.assigned_service] = s.name;
    });

    const resolvedRows = rows.map(row => {
      let services = row.services;
      if (typeof services === 'string') {
        try { services = JSON.parse(services); } catch (e) { services = []; }
      }

      const resolvedServices = services.map(s => {
        const baseName = s.name.split(' - ')[0].trim();
        return {
          ...s,
          assigned_staff: s.assigned_staff || staffMap[baseName] || 'Unassigned'
        };
      });

      return { ...row, services: resolvedServices };
    });

    res.json(resolvedRows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update appointment status
// @route   PATCH /api/appointments/:id/status
// @access  Private/Admin
const updateAppointmentStatus = async (req, res) => {
  const { status, serviceIndex } = req.body;
  try {
    const [rows] = await db.execute(`
      SELECT a.services, a.appointment_date, a.appointment_time, u.email, u.name as user_name 
      FROM appointments a 
      JOIN users u ON a.user_id = u.id 
      WHERE a.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    let services = rows[0].services;
    if (typeof services === 'string') {
      services = JSON.parse(services);
    }

    if (services[serviceIndex]) {
      services[serviceIndex].status = status;
    }

    await db.execute(
      'UPDATE appointments SET services = ? WHERE id = ?',
      [JSON.stringify(services), req.params.id]
    );

    // If all services are reviewed (not pending), and email hasn't been sent yet
    const allReviewed = services.every(s => s.status !== 'Pending');
    if (allReviewed && !services[0].emailSent && status !== 'Completed') {
      services[0].emailSent = true;

      // Save the emailSent flag
      await db.execute(
        'UPDATE appointments SET services = ? WHERE id = ?',
        [JSON.stringify(services), req.params.id]
      );

      // Build consolidated email
      let summaryStr = services.map(s => {
        let mark = s.status === 'Approved' ? '✅ Approved' : (s.status === 'Not Available' ? '❌ Not Available' : s.status);
        return `- ${s.name} (₹${s.price}): ${mark}`;
      }).join('\n');

      const mailOptions = {
        from: `"StaySync Admin" <${process.env.SMTP_EMAIL}>`,
        to: rows[0].email,
        subject: 'Appointment Update - StaySync Salon',
        text: `Hello ${rows[0].user_name},\n\nYour appointment session on ${new Date(rows[0].appointment_date).toLocaleDateString()} at ${rows[0].appointment_time} has been reviewed.\n\nServices Review:\n${summaryStr}\n\nThank you for choosing StaySync Salon!`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.error("Error sending email:", error);
      });
    }

    // Send email when marked as completed
    if (status === 'Completed') {
      const mailOptions = {
        from: `"StaySync Admin" <${process.env.SMTP_EMAIL}>`,
        to: rows[0].email,
        subject: 'Treatment Completed - StaySync Salon',
        text: `Hello ${rows[0].user_name},\n\nYour treatment for ${services[serviceIndex].name} on ${new Date(rows[0].appointment_date).toLocaleDateString()} at ${rows[0].appointment_time} is now marked as Completed.\n\nPlease log in to your appointments page to leave a review for this service: ${frontendUrl}/appointments \n\nThank you for choosing StaySync Salon!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #d4af37; text-align: center;">Treatment Completed</h2>
            <p>Hello <strong>${rows[0].user_name}</strong>,</p>
            <p>Your treatment for <strong>${services[serviceIndex].name}</strong> on ${new Date(rows[0].appointment_date).toLocaleDateString()} at ${rows[0].appointment_time} is now marked as Completed.</p>
            <p>We hope you had a great experience! We would love to hear your feedback.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}/appointments" style="background-color: #d4af37; color: black; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">Give a Review</a>
            </div>
            <p>Thank you for choosing StaySync Salon!</p>
          </div>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.error("Error sending completion email:", error);
      });
    }

    res.json({ message: 'Appointment status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Cancel entire appointment session
// @route   PATCH /api/appointments/:id/cancel
// @access  Private/Admin
const cancelSession = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT a.services, a.appointment_date, a.appointment_time, u.email, u.name as user_name 
      FROM appointments a 
      JOIN users u ON a.user_id = u.id 
      WHERE a.id = ?
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ message: 'Appointment not found' });

    let services = rows[0].services;
    if (typeof services === 'string') {
      try { services = JSON.parse(services); } catch (e) { services = []; }
    }

    services = services.map(s => ({ ...s, status: 'Cancelled' }));

    await db.execute(
      'UPDATE appointments SET services = ? WHERE id = ?',
      [JSON.stringify(services), req.params.id]
    );

    if (rows[0].email) {
      const mailOptions = {
        from: `"StaySync Admin" <${process.env.SMTP_EMAIL}>`,
        to: rows[0].email,
        subject: 'Appointment Cancelled - StaySync Salon',
        text: `Hello ${rows[0].user_name},\n\nUnfortunately, your entire appointment session on ${new Date(rows[0].appointment_date).toLocaleDateString()} at ${rows[0].appointment_time} has been cancelled by the administrator.\n\nPlease contact us or book another session.\n\nThank you for understanding.`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.error("Error sending cancellation email:", error);
      });
    }

    res.json({ message: 'Session cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Cancel appointment session by User
// @route   PATCH /api/appointments/:id/user-cancel
// @access  Private
const userCancelSession = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT a.services, a.appointment_date, a.appointment_time, u.email, u.name as user_name 
      FROM appointments a 
      JOIN users u ON a.user_id = u.id 
      WHERE a.id = ? AND a.user_id = ?
    `, [req.params.id, req.user.id]);

    if (rows.length === 0) return res.status(404).json({ message: 'Appointment not found or not authorized' });

    let services = rows[0].services;
    if (typeof services === 'string') {
      try { services = JSON.parse(services); } catch (e) { services = []; }
    }

    services = services.map(s => ({ ...s, status: 'Cancelled' }));

    await db.execute(
      'UPDATE appointments SET services = ? WHERE id = ?',
      [JSON.stringify(services), req.params.id]
    );

    if (rows[0].email) {
      const mailOptions = {
        from: `"StaySync Admin" <${process.env.SMTP_EMAIL}>`,
        to: rows[0].email,
        subject: 'Appointment Cancelled - StaySync Salon',
        text: `Hello ${rows[0].user_name},\n\nYou have successfully cancelled your appointment session on ${new Date(rows[0].appointment_date).toLocaleDateString()} at ${rows[0].appointment_time}.\n\nWe hope to see you again soon.`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.error("Error sending cancellation email:", error);
      });
    }

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark appointment as paid
// @route   PATCH /api/appointments/:id/pay
// @access  Private
const payAppointment = async (req, res) => {
  try {
    const [result] = await db.execute(
      'UPDATE appointments SET paid_advance = TRUE WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found or not authorized' });
    }

    res.json({ message: 'Payment marked correctly in database' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark appointment for in-person payment
// @route   PATCH /api/appointments/:id/pay-in-person
// @access  Private
const payInPerson = async (req, res) => {
  try {
    const [result] = await db.execute(
      'UPDATE appointments SET pay_in_person = TRUE, payment_status = ? WHERE id = ? AND user_id = ?',
      ['In Person', req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found or not authorized' });
    }

    res.json({ message: 'Marked as pay in person in database' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create Razorpay Order
// @route   POST /api/appointments/razorpay-order
// @access  Private
const createRazorpayOrder = async (req, res) => {
  const { amount } = req.body; // Amount in paise

  if (!amount) {
    return res.status(400).json({ message: 'Amount is required' });
  }

  try {
    const options = {
      amount: amount,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: 'Failed to create Razorpay order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order', error: error.message });
  }
};

// @desc    Get Razorpay Key
// @route   GET /api/appointments/razorpay-key
// @access  Private
const getRazorpayKey = (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_id' });
};

// @desc    Verify Razorpay Payment and Update Appointment
// @route   POST /api/appointments/verify-payment
// @access  Private
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointment_ids } = req.body;

  const connection = await db.getConnection();
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';

    // Create signature to verify
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed: Invalid signature' });
    }

    if (!Array.isArray(appointment_ids) || appointment_ids.length === 0) {
      return res.status(400).json({ message: 'At least one appointment id is required' });
    }

    await connection.beginTransaction();

    // Payment is verified. Update DB for all appointment IDs provided
    const paidBills = [];
    if (appointment_ids.length > 0) {
      const idsStr = appointment_ids.map(() => '?').join(',');
      const params = ['Paid', 'Razorpay', razorpay_order_id, razorpay_payment_id, req.user.id, ...appointment_ids];

      const query = `
        UPDATE appointments 
        SET payment_status = ?, payment_method = ?, razorpay_order_id = ?, razorpay_payment_id = ?, paid_advance = TRUE 
        WHERE user_id = ? AND id IN (${idsStr})
      `;

      const [updateResult] = await connection.execute(query, params);

      if (updateResult.affectedRows !== appointment_ids.length) {
        await connection.rollback();
        return res.status(404).json({ message: 'One or more appointments were not found for this user' });
      }

      for (const id of appointment_ids) {
        const bill = await createPaidBillAndSendSMS(connection, id, req.user.id, {
          razorpay_order_id,
          razorpay_payment_id,
        });
        paidBills.push(bill);
      }
    }

    await connection.commit();
    res.json({ message: 'Payment verified successfully', bills: paidBills });
  } catch (error) {
    await connection.rollback();
    console.error('Verify Payment Error:', error);
    if (['ER_BAD_FIELD_ERROR', 'ER_NO_SUCH_TABLE'].includes(error.code)) {
      return res.status(500).json({
        message: 'Payment was verified, but bill generation failed because the backend database schema is not updated. Please redeploy/restart the backend so the bill table migration runs.',
        error: error.message
      });
    }

    res.status(500).json({ message: 'Server error during payment verification', error: error.message });
  } finally {
    connection.release();
  }
};

// @desc    Search appointments by user phone number
// @route   GET /api/appointments/search/:phone
// @access  Private/Admin
const searchAppointmentsByPhone = async (req, res) => {
  const { phone } = req.params;
  try {
    const [rows] = await db.execute(`
      SELECT a.*, u.name as user_name, u.email, u.phone 
      FROM appointments a 
      JOIN users u ON a.user_id = u.id
      WHERE u.phone LIKE ? OR u.name LIKE ?
      ORDER BY a.created_at DESC
    `, [`%${phone}%`, `%${phone}%`]);

    const resolvedRows = rows.map(row => {
      let services = row.services;
      if (typeof services === 'string') {
        try { services = JSON.parse(services); } catch (e) { services = []; }
      }
      return { ...row, services };
    });

    res.json(resolvedRows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a bill for an appointment
// @route   POST /api/appointments/:id/bill
// @access  Private/Admin
const createBill = async (req, res) => {
  const { id } = req.params;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Fetch appointment details
    const [apptRows] = await connection.execute(`
      SELECT a.*, u.name as user_name, u.email, u.phone 
      FROM appointments a 
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `, [id]);

    if (apptRows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appt = apptRows[0];
    if (appt.payment_status !== 'Paid' || !appt.razorpay_payment_id) {
      await connection.rollback();
      return res.status(400).json({ message: 'Bill can be generated only after successful Razorpay payment confirmation.' });
    }

    const bill = await createPaidBillAndSendSMS(connection, id, appt.user_id, {
      razorpay_order_id: appt.razorpay_order_id,
      razorpay_payment_id: appt.razorpay_payment_id,
    });

    await connection.commit();

    res.status(201).json({
      message: 'Bill generated successfully',
      bill
    });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      // If bill already exists, fetch it
      try {
        const [billRows] = await db.execute(`
          SELECT b.*, a.appointment_date, a.appointment_time, a.services, a.payment_status, u.name as user_name, u.email, u.phone 
          FROM bills b
          JOIN appointments a ON b.appointment_id = a.id
          JOIN users u ON a.user_id = u.id
          WHERE b.appointment_id = ?
        `, [id]);
        const bill = billRows[0];
        if (bill && typeof bill.services === 'string') {
          try { bill.services = JSON.parse(bill.services); } catch (e) { bill.services = []; }
        }
        return res.json({ message: 'Bill already exists', bill });
      } catch (e) {
        return res.status(500).json({ message: 'Server error', error: e.message });
      }
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    connection.release();
  }
};

// @desc    Get bill details
// @route   GET /api/appointments/:id/bill
// @access  Private
const getBill = async (req, res) => {
  const { id } = req.params;
  try {
    const [billRows] = await db.execute(`
      SELECT b.*, a.appointment_date, a.appointment_time, a.services, a.payment_status, u.name as user_name, u.email, u.phone 
      FROM bills b
      JOIN appointments a ON b.appointment_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE b.appointment_id = ?
    `, [id]);

    if (billRows.length === 0) {
      console.log(`Bill not found for appointment ${id}. Checking appointment status...`);
      // If bill not found, check if the appointment is already paid
      const [apptRows] = await db.execute(`
        SELECT a.*, u.name as user_name, u.email, u.phone 
        FROM appointments a 
        JOIN users u ON a.user_id = u.id
        WHERE a.id = ?
      `, [id]);

      console.log(`Appointment ${id} bill is missing. Status: ${apptRows[0]?.payment_status}, Razorpay Payment: ${apptRows[0]?.razorpay_payment_id || 'none'}`);

      return res.status(404).json({ message: 'Bill not found or not generated yet.' });
    }

    const bill = billRows[0];
    if (typeof bill.services === 'string') {
      try { bill.services = JSON.parse(bill.services); } catch (e) { bill.services = []; }
    }

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getAppointments,
  updateAppointmentStatus,
  cancelSession,
  payAppointment,
  payInPerson,
  userCancelSession,
  createRazorpayOrder,
  verifyPayment,
  getRazorpayKey,
  searchAppointmentsByPhone,
  createBill,
  getBill
};
