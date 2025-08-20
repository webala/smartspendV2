const express = require('express');
const router = express.Router();
const {
  getConversations,
  getConversation,
  createConversation,
  deleteConversation
} = require('../controllers/ConversationController');
const authenticateToken = require('../middleware/auth');

// All routes are protected
router.use(authenticateToken);

// Conversation operations
router.get('/', getConversations);
router.get('/:conversationId', getConversation);
router.post('/', createConversation);
router.delete('/:conversationId', deleteConversation);

module.exports = router;
