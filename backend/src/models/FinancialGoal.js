const mongoose = require('mongoose');

const financialGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['Savings', 'Debt Repayment', 'Emergency Fund', 'Investment', 'Purchase', 'Other']
  }
}, {
  timestamps: true
});

// Virtual field for progress percentage
financialGoalSchema.virtual('progress').get(function() {
  return this.targetAmount > 0 ? Math.round((this.currentAmount / this.targetAmount) * 100) : 0;
});

// Virtual field for remaining amount
financialGoalSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.targetAmount - this.currentAmount);
});

// Include virtuals when converting to JSON
financialGoalSchema.set('toJSON', { virtuals: true });

// Index for efficient querying
financialGoalSchema.index({ userId: 1, deadline: 1 });

module.exports = mongoose.model('FinancialGoal', financialGoalSchema); 