const User = require('../models/User');
const Student = require('../models/Student');

// Get all users with role 'student' who aren't assigned to a trainer
const getAvailableStudents = async (req, res) => {
    try {
        // Find all students that aren't already assigned to a trainer
        const assignedStudentIds = await Student.distinct('user');
        const availableStudents = await User.find({ 
            role: 'student',
            _id: { $nin: assignedStudentIds }
        }).select('name email _id');
        
        res.json(availableStudents);
    } catch (error) {
        console.error('Error in getAvailableStudents:', error);
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getAvailableStudents
};