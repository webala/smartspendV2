const Conversation = require('../models/Conversation');

// Get user's conversations
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({ userId })
      .select('title lastUpdated isActive')
      .sort({ lastUpdated: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a specific conversation
const getConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new conversation
const createConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title } = req.body;

    const conversation = new Conversation({
      userId,
      title: title || 'New Conversation',
    });

    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a conversation
const deleteConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findOneAndDelete({
      _id: conversationId,
      userId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getConversations,
  getConversation,
  createConversation,
  deleteConversation
};
