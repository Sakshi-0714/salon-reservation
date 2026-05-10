const express = require('express');
const router = express.Router();
const { getAllStaff, getStaffStatus, addStaff, updateStaff, deleteStaff } = require('../controllers/staffController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/status', getStaffStatus);

router.route('/')
    .get(protect, admin, getAllStaff)
    .post(protect, admin, addStaff);

router.route('/:id')
    .put(protect, admin, updateStaff)
    .delete(protect, admin, deleteStaff);

module.exports = router;
