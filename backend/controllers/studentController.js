const Student = require('../models/Student');

// @desc    Create a new student
// @route   POST /api/students
// @access  Private (Trainer only)
const createStudent = async (req, res) => {
  try {
    const { user, age, weight, height, medicalRestrictions } = req.body;

    const student = await Student.create({
      user,
      trainer: req.user._id, // Add trainer ID from logged user
      age,
      weight,
      height,
      medicalRestrictions
    });

    res.status(201).json(student);
  } catch (error) {
    console.log('Error details:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all students for a trainer
// @route   GET /api/students
// @access  Private (Trainer only)
const getStudents = async (req, res) => {
  try {
    const students = await Student.find({ trainer: req.user._id })
      .populate({
        path: 'user',
        select: 'name email',
        model: 'User'
      })
      .select('user age weight height medicalRestrictions')
      .sort('-createdAt');

    console.log('Found students:', students); // For debugging

    res.json(students);
  } catch (error) {
    console.log('Error:', error); // For debugging
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email')
      .populate('trainer', 'name email');

    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Trainer only)
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.trainer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update student profile by student
// @route   PUT /api/students/profile
// @access  Private (Student only)
const updateStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const { weight, height, age, medicalRestrictions } = req.body;

    student.weight = weight || student.weight;
    student.height = height || student.height;
    student.age = age || student.age;
    student.medicalRestrictions = medicalRestrictions || student.medicalRestrictions;

    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Trainer only)
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.trainer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await student.remove();
    res.json({ message: 'Student removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add training history
// @route   POST /api/students/:id/history
// @access  Private (Trainer only)
const addTrainingHistory = async (req, res) => {
  try {
    const { startDate, endDate, notes } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.trainingHistory.push({
      startDate,
      endDate,
      notes
    });

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getStudentProfile = async (req, res) => {
    try {
        const student = await Student.findOne({ 
            user: req.params.userId,
            active: true 
        });
        
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  updateStudentProfile,
  deleteStudent,
  addTrainingHistory,
  getStudentProfile  // Add this line
};