const express = require('express');
const router = express.Router();
const { protect, trainer } = require('../middleware/authMiddleware');
const { getAvailableStudents } = require('../controllers/userController');

// Route to get available students
router.get('/students', protect, trainer, getAvailableStudents);

module.exports = router;