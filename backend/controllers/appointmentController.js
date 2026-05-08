const db = require('../config/db');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');
const crypto = require('crypto');

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
      if (typeof svcs === 'string') { try { svcs = JSON.parse(svcs); } catch(e) { svcs = []; } }
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
        try { services = JSON.parse(services); } catch(e) { services = []; }
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
      try { services = JSON.parse(services); } catch(e) { services = []; }
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
      try { services = JSON.parse(services); } catch(e) { services = []; }
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

    // Payment is verified. Update DB for all appointment IDs provided
    if (appointment_ids && appointment_ids.length > 0) {
      const idsStr = appointment_ids.map(() => '?').join(',');
      const params = ['Paid', 'Razorpay', razorpay_order_id, razorpay_payment_id, req.user.id, ...appointment_ids];

      const query = `
        UPDATE appointments 
        SET payment_status = ?, payment_method = ?, razorpay_order_id = ?, razorpay_payment_id = ?, paid_advance = TRUE 
        WHERE user_id = ? AND id IN (${idsStr})
      `;

      await db.execute(query, params);

      // Automatically generate bills for these appointments
      for (const id of appointment_ids) {
        try {
          // Calculate total amount for this appointment
          const [apptRows] = await db.execute('SELECT services, payment_status FROM appointments WHERE id = ?', [id]);
          if (apptRows.length > 0) {
            let services = apptRows[0].services;
            if (typeof services === 'string') {
              try { services = JSON.parse(services); } catch(e) { services = []; }
            }
            const totalAmount = services.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
            const billNumber = `BILL-${Date.now()}-${id}`;
            
            await db.execute(
              'INSERT INTO bills (appointment_id, bill_number, total_amount, payment_status) VALUES (?, ?, ?, ?)',
              [id, billNumber, totalAmount, 'Paid']
            );
          }
        } catch (billError) {
          console.error(`Failed to auto-generate bill for appointment ${id}:`, billError);
          // Don't fail the whole request if bill generation fails
        }
      }
    }

    res.json({ message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ message: 'Server error during payment verification', error: error.message });
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
        try { services = JSON.parse(services); } catch(e) { services = []; }
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
  try {
    // 1. Fetch appointment details
    const [apptRows] = await db.execute(`
      SELECT a.*, u.name as user_name, u.email, u.phone 
      FROM appointments a 
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `, [id]);

    if (apptRows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appt = apptRows[0];
    let services = appt.services;
    if (typeof services === 'string') {
      try { services = JSON.parse(services); } catch(e) { services = []; }
    }

    // 2. Calculate total amount
    const totalAmount = services.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

    // 3. Generate bill number
    const billNumber = `BILL-${Date.now()}-${id}`;

    // 4. Insert into bills table
    await db.execute(
      'INSERT INTO bills (appointment_id, bill_number, total_amount, payment_status) VALUES (?, ?, ?, ?)',
      [id, billNumber, totalAmount, appt.payment_status || 'Pending']
    );

    res.status(201).json({ 
      message: 'Bill generated successfully', 
      bill: {
        bill_number: billNumber,
        total_amount: totalAmount,
        customer_name: appt.user_name,
        customer_phone: appt.phone,
        services: services,
        date: appt.appointment_date,
        payment_status: appt.payment_status
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      // If bill already exists, fetch it
      try {
        const [billRows] = await db.execute('SELECT * FROM bills WHERE appointment_id = ?', [id]);
        return res.json({ message: 'Bill already exists', bill: billRows[0] });
      } catch (e) {
        return res.status(500).json({ message: 'Server error', error: e.message });
      }
    }
    res.status(500).json({ message: 'Server error', error: error.message });
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

      if (apptRows.length > 0 && (apptRows[0].payment_status === 'Paid' || apptRows[0].paid_advance == 1)) {
        console.log(`Appointment ${id} is paid. Generating bill...`);
        // Auto-generate bill since it's already paid but record is missing
        const appt = apptRows[0];
        let services = appt.services;
        if (typeof services === 'string') {
          try { services = JSON.parse(services); } catch(e) { services = []; }
        }
        const totalAmount = services.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
        const billNumber = `BILL-AUTO-${Date.now()}-${id}`;
        
        await db.execute(
          'INSERT INTO bills (appointment_id, bill_number, total_amount, payment_status) VALUES (?, ?, ?, ?)',
          [id, billNumber, totalAmount, appt.payment_status || 'Paid']
        );

        // Fetch the newly created bill with joined data
        const [newBillRows] = await db.execute(`
          SELECT b.*, a.appointment_date, a.appointment_time, a.services, a.payment_status, u.name as user_name, u.email, u.phone 
          FROM bills b
          JOIN appointments a ON b.appointment_id = a.id
          JOIN users u ON a.user_id = u.id
          WHERE b.appointment_id = ?
        `, [id]);
        
        if (newBillRows.length > 0) {
          const bill = newBillRows[0];
          if (typeof bill.services === 'string') {
            try { bill.services = JSON.parse(bill.services); } catch(e) { bill.services = []; }
          }
          return res.json(bill);
        }
      } else {
        console.log(`Appointment ${id} not found or not paid. Status: ${apptRows[0]?.payment_status}, Paid Advance: ${apptRows[0]?.paid_advance}`);
      }

      return res.status(404).json({ message: 'Bill not found or not generated yet.' });
    }

    const bill = billRows[0];
    if (typeof bill.services === 'string') {
      try { bill.services = JSON.parse(bill.services); } catch(e) { bill.services = []; }
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
