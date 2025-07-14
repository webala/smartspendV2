const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  month: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}$/ // YYYY-MM format
  },
  description: {
    type: String,
    trim: true,
    default: 'Monthly Income'
  }
}, {
  timestamps: true
});

// Ensure one income entry per user per month
incomeSchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Income', incomeSchema); 