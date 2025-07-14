const BuddyRelationship = require('../models/BuddyRelationship');
const User = require('../models/User');
const FinancialGoal = require('../models/FinancialGoal');

// Send a buddy request
const sendBuddyRequest = async (req, res) => {
  try {
    const { email, username } = req.body;
    const userId1 = req.user._id;

    // Validate input
    if (!email && !username) {
      return res.status(400).json({ error: 'Email or username is required' });
    }

    // Find the user to send request to
    const query = email ? { email } : { username };
    const targetUser = await User.findOne(query);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId2 = targetUser._id;

    // Check if user is trying to add themselves
    if (userId1.equals(userId2)) {
      return res.status(400).json({ error: 'Cannot send buddy request to yourself' });
    }

    // Check if relationship already exists (in either direction)
    const existingRelationship = await BuddyRelationship.findOne({
      $or: [
        { userId1, userId2 },
        { userId1: userId2, userId2: userId1 }
      ]
    });

    if (existingRelationship) {
      return res.status(400).json({ 
        error: existingRelationship.status === 'pending' 
          ? 'Buddy request already sent' 
          : 'Users are already buddies'
      });
    }

    // Create new buddy relationship
    const buddyRelationship = new BuddyRelationship({
      userId1,
      userId2,
      status: 'pending'
    });

    await buddyRelationship.save();

    res.status(201).json({
      message: 'Buddy request sent successfully',
      request: {
        id: buddyRelationship._id,
        to: {
          id: targetUser._id,
          username: targetUser.username,
          email: targetUser.email
        },
        status: buddyRelationship.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Accept a buddy request
const acceptBuddyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find the buddy request
    const buddyRequest = await BuddyRelationship.findOne({
      _id: id,
      userId2: userId,
      status: 'pending'
    });

    if (!buddyRequest) {
      return res.status(404).json({ error: 'Buddy request not found' });
    }

    // Accept the request
    buddyRequest.status = 'accepted';
    await buddyRequest.save();

    // Get the other user's info
    const otherUser = await User.findById(buddyRequest.userId1);

    res.json({
      message: 'Buddy request accepted successfully',
      buddy: {
        id: otherUser._id,
        username: otherUser.username,
        email: otherUser.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get pending buddy requests
const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get requests sent to this user
    const incomingRequests = await BuddyRelationship.find({
      userId2: userId,
      status: 'pending'
    }).populate('userId1', 'username email');

    // Get requests sent by this user
    const outgoingRequests = await BuddyRelationship.find({
      userId1: userId,
      status: 'pending'
    }).populate('userId2', 'username email');

    res.json({
      incomingRequests: incomingRequests.map(req => ({
        id: req._id,
        from: {
          id: req.userId1._id,
          username: req.userId1.username,
          email: req.userId1.email
        },
        createdAt: req.createdAt
      })),
      outgoingRequests: outgoingRequests.map(req => ({
        id: req._id,
        to: {
          id: req.userId2._id,
          username: req.userId2.username,
          email: req.userId2.email
        },
        createdAt: req.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get list of buddies and their goals
const getBuddies = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get accepted buddy relationships
    const relationships = await BuddyRelationship.find({
      $or: [
        { userId1: userId, status: 'accepted' },
        { userId2: userId, status: 'accepted' }
      ]
    });

    // Get buddy user IDs
    const buddyIds = relationships.map(rel => 
      rel.userId1.equals(userId) ? rel.userId2 : rel.userId1
    );

    // Get buddy details
    const buddies = await User.find({
      _id: { $in: buddyIds }
    }, 'username email');

    // Get goals for each buddy
    const buddyGoals = await FinancialGoal.find({
      userId: { $in: buddyIds }
    });

    // Combine buddy info with their goals
    const buddiesWithGoals = buddies.map(buddy => {
      const goals = buddyGoals.filter(goal => goal.userId.equals(buddy._id));
      return {
        id: buddy._id,
        username: buddy.username,
        email: buddy.email,
        goals: goals.map(goal => ({
          id: goal._id,
          title: goal.title,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          progress: goal.progress,
          deadline: goal.deadline,
          category: goal.category
        }))
      };
    });

    res.json({
      buddies: buddiesWithGoals,
      totalBuddies: buddiesWithGoals.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove a buddy
const removeBuddy = async (req, res) => {
  try {
    const { id } = req.params; // This is the buddy's user ID
    const userId = req.user._id;

    // Find and delete the relationship
    const relationship = await BuddyRelationship.findOneAndDelete({
      $or: [
        { userId1: userId, userId2: id },
        { userId1: id, userId2: userId }
      ],
      status: 'accepted'
    });

    if (!relationship) {
      return res.status(404).json({ error: 'Buddy relationship not found' });
    }

    res.json({ message: 'Buddy removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Reject a buddy request
const rejectBuddyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find and delete the pending request
    const buddyRequest = await BuddyRelationship.findOneAndDelete({
      _id: id,
      userId2: userId,
      status: 'pending'
    });

    if (!buddyRequest) {
      return res.status(404).json({ error: 'Buddy request not found' });
    }

    res.json({ message: 'Buddy request rejected successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  sendBuddyRequest,
  acceptBuddyRequest,
  getPendingRequests,
  getBuddies,
  removeBuddy,
  rejectBuddyRequest
}; 