const express = require('express');
const router = express.Router();
const { protect, trainer } = require('../middleware/authMiddleware');
const {
  createWorkout,
  getStudentWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  getWorkoutDuration
} = require('../controllers/workoutController');

// Student workout routes
router.get('/student/:studentId', protect, getStudentWorkouts);
router.get('/duration/:studentId', protect, getWorkoutDuration);

// Base workout routes
router.post('/', protect, trainer, createWorkout);

// Individual workout routes
router.route('/:id')
  .get(protect, getWorkoutById)
  .put(protect, trainer, updateWorkout)
  .delete(protect, trainer, deleteWorkout);

module.exports = router;