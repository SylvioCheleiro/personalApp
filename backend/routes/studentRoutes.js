const express = require('express');
const router = express.Router();
const Student = require('../models/Student'); // Add this line
const { protect, trainer, student } = require('../middleware/authMiddleware');
const {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    updateStudentProfile,
    deleteStudent,
    addTrainingHistory,
    getStudentProfile
} = require('../controllers/studentController');

// Student profile routes
router.put('/profile', protect, student, updateStudentProfile);
router.get('/profile/:userId', protect, getStudentProfile);
router.get('/user/:userId', protect, async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.params.userId });
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }
        res.json(student);
    } catch (error) {
        console.error('Error fetching student:', error); // Add debug log
        res.status(400).json({ message: error.message });
    }
});

// Base routes
router.route('/')
    .post(protect, trainer, createStudent)
    .get(protect, trainer, getStudents);

// Individual student routes
router.route('/:id')
    .get(protect, getStudentById)
    .put(protect, trainer, updateStudent)
    .delete(protect, trainer, deleteStudent);

router.post('/:id/history', protect, trainer, addTrainingHistory);

module.exports = router;