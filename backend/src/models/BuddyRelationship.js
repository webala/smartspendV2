const mongoose = require('mongoose');

const buddyRelationshipSchema = new mongoose.Schema({
  userId1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userId2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'accepted'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Ensure unique buddy relationships (prevent duplicates)
buddyRelationshipSchema.index({ userId1: 1, userId2: 1 }, { unique: true });

// Prevent users from being buddies with themselves
buddyRelationshipSchema.pre('save', function(next) {
  if (this.userId1.equals(this.userId2)) {
    return next(new Error('User cannot be buddy with themselves'));
  }
  next();
});

module.exports = mongoose.model('BuddyRelationship', buddyRelationshipSchema); 