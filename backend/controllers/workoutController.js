const Workout = require('../models/Workout');

// @desc    Create a new workout
// @route   POST /api/workouts
// @access  Private (Trainer only)
const createWorkout = async (req, res) => {
  try {
    const { student, weekDay, focus, exercises } = req.body;

    const workout = await Workout.create({
      student,
      trainer: req.user._id,
      weekDay,
      focus,
      exercises
    });

    res.status(201).json(workout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all workouts for a student
// @route   GET /api/workouts/student/:studentId
// @access  Private
const getStudentWorkouts = async (req, res) => {
    try {
        console.log('StudentId received:', req.params.studentId); // Debug line
        
        if (!req.params.studentId) {
            return res.status(400).json({ message: 'Student ID is required' });
        }

        const workouts = await Workout.find({
            student: req.params.studentId,
            active: true
        }).sort('weekDay');

        console.log('Workouts found:', workouts); // Debug line

        res.json({
            workouts,
            success: true
        });
    } catch (error) {
        console.error('Error in getStudentWorkouts:', error); // Debug line
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get workout by ID
// @route   GET /api/workouts/:id
// @access  Private
const getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (workout) {
      res.json(workout);
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private (Trainer only)
const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    if (workout.trainer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedWorkout = await Workout.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedWorkout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete workout (soft delete)
// @route   DELETE /api/workouts/:id
// @access  Private (Trainer only)
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    if (workout.trainer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    workout.active = false;
    workout.deletedAt = new Date();
    await workout.save();

    res.json({ message: 'Workout deactivated' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get workout duration for a student
// @route   GET /api/workouts/duration/:studentId
// @access  Private (Trainer only)
const getWorkoutDuration = async (req, res) => {
  try {
    const workouts = await Workout.find({
      student: req.params.studentId,
      active: true
    }).select('startDate');

    const durations = workouts.map(workout => {
      const duration = Math.floor((Date.now() - workout.startDate) / (1000 * 60 * 60 * 24));
      return {
        workoutId: workout._id,
        durationInDays: duration
      };
    });

    res.json(durations);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createWorkout,
  getStudentWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  getWorkoutDuration
};