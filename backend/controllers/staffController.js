const db = require('../config/db');

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private/Admin
const getAllStaff = async (req, res) => {
    try {
        const [staff] = await db.execute('SELECT * FROM staff');
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching staff' });
    }
};

// @desc    Add new staff
// @route   POST /api/staff
// @access  Private/Admin
const addStaff = async (req, res) => {
    const { name, assigned_service, phone, address, status } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO staff (name, assigned_service, phone, address, status) VALUES (?, ?, ?, ?, ?)',
            [name, assigned_service, phone, address, status || 'Active']
        );
        
        // Update service assignment if provided
        if (assigned_service) {
            await db.execute(
                'UPDATE services SET assigned_staff = ? WHERE name = ?',
                [name, assigned_service]
            );
        }

        res.status(201).json({ id: result.insertId, message: 'Staff added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding staff' });
    }
};

// @desc    Update staff
// @route   PUT /api/staff/:id
// @access  Private/Admin
const updateStaff = async (req, res) => {
    const { id } = req.params;
    const { name, assigned_service, phone, address, status } = req.body;
    try {
        // Get old staff info to update service name if needed
        const [oldStaff] = await db.execute('SELECT name, assigned_service FROM staff WHERE id = ?', [id]);
        
        await db.execute(
            'UPDATE staff SET name = ?, assigned_service = ?, phone = ?, address = ?, status = ? WHERE id = ?',
            [name, assigned_service, phone, address, status, id]
        );

        // Update service assignment
        if (assigned_service) {
             // Clear old assignment if name changed
            if (oldStaff.length > 0 && oldStaff[0].name !== name) {
                await db.execute('UPDATE services SET assigned_staff = NULL WHERE assigned_staff = ?', [oldStaff[0].name]);
            }
            await db.execute(
                'UPDATE services SET assigned_staff = ? WHERE name = ?',
                [name, assigned_service]
            );
        }

        res.json({ message: 'Staff updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating staff' });
    }
};

// @desc    Delete staff
// @route   DELETE /api/staff/:id
// @access  Private/Admin
const deleteStaff = async (req, res) => {
    const { id } = req.params;
    try {
        const [staff] = await db.execute('SELECT name FROM staff WHERE id = ?', [id]);
        if (staff.length > 0) {
            await db.execute('UPDATE services SET assigned_staff = NULL WHERE assigned_staff = ?', [staff[0].name]);
        }
        await db.execute('DELETE FROM staff WHERE id = ?', [id]);
        res.json({ message: 'Staff removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting staff' });
    }
};

module.exports = {
    getAllStaff,
    addStaff,
    updateStaff,
    deleteStaff
};
