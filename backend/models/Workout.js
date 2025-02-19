const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sets: {
    type: Number,
    required: true
  },
  reps: {
    type: Number,
    required: true
  },
  weight: {
    type: Number
  },
  notes: String
});

const workoutSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true // Adding index for student field
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weekDay: {
    type: Number,
    required: true
  },
  focus: {
    type: String,
    required: true
  },
  exercises: [{
    name: String,
    sets: Number,
    reps: Number,
    weight: Number,
    notes: String
  }],
  active: {
    type: Boolean,
    default: true,
    index: true // Adding index for active field
  },
  startDate: {
    type: Date,
    default: Date.now
  }
});

// Compound index for frequently used combination
workoutSchema.index({ student: 1, active: 1 });

module.exports = mongoose.model('Workout', workoutSchema);