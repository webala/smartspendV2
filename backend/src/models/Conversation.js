const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  messages: [messageSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Update lastUpdated timestamp on new messages
conversationSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Method to add a message to the conversation
conversationSchema.methods.addMessage = function(role, content) {
  this.messages.push({ role, content });
  if (this.messages.length > 10) { // Keep only last 10 messages (5 exchanges)
    this.messages = this.messages.slice(-10);
  }
  return this.save();
};

// Method to get conversation context (last 5 exchanges)
conversationSchema.methods.getContext = function() {
  return this.messages.slice(-10).map(msg => ({
    role: msg.role,
    content: msg.content
  }));
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
