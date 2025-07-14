const FinancialGoal = require('../models/FinancialGoal');

// Create a new financial goal
const createGoal = async (req, res) => {
  try {
    const { title, targetAmount, deadline, category, currentAmount } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!title || !targetAmount || !deadline) {
      return res.status(400).json({ error: 'Title, target amount, and deadline are required' });
    }

    const goal = new FinancialGoal({
      userId,
      title,
      targetAmount,
      deadline: new Date(deadline),
      category,
      currentAmount: currentAmount || 0
    });

    await goal.save();

    res.status(201).json({
      message: 'Financial goal created successfully',
      goal
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all goals for user
const getGoals = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category, status } = req.query;

    // Build query
    const query = { userId };
    
    if (category) {
      query.category = category;
    }

    const goals = await FinancialGoal.find(query).sort({ deadline: 1 });

    // Filter by status if provided
    let filteredGoals = goals;
    if (status) {
      filteredGoals = goals.filter(goal => {
        const now = new Date();
        const isCompleted = goal.currentAmount >= goal.targetAmount;
        const isOverdue = now > goal.deadline && !isCompleted;
        
        switch (status) {
          case 'completed':
            return isCompleted;
          case 'active':
            return !isCompleted && !isOverdue;
          case 'overdue':
            return isOverdue;
          default:
            return true;
        }
      });
    }

    res.json({
      goals: filteredGoals,
      totalGoals: goals.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a goal
const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, targetAmount, currentAmount, deadline, category } = req.body;
    const userId = req.user._id;

    const goal = await FinancialGoal.findOne({ _id: id, userId });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Update fields
    if (title !== undefined) goal.title = title;
    if (targetAmount !== undefined) goal.targetAmount = targetAmount;
    if (currentAmount !== undefined) goal.currentAmount = currentAmount;
    if (deadline !== undefined) goal.deadline = new Date(deadline);
    if (category !== undefined) goal.category = category;

    await goal.save();

    res.json({
      message: 'Goal updated successfully',
      goal
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a goal
const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const goal = await FinancialGoal.findOneAndDelete({ _id: id, userId });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update goal progress
const updateGoalProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.user._id;

    if (amount === undefined || amount < 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const goal = await FinancialGoal.findOne({ _id: id, userId });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    goal.currentAmount = amount;
    await goal.save();

    res.json({
      message: 'Goal progress updated successfully',
      goal
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get goal analytics
const getGoalAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const goals = await FinancialGoal.find({ userId });
    
    const analytics = {
      totalGoals: goals.length,
      completedGoals: goals.filter(goal => goal.currentAmount >= goal.targetAmount).length,
      activeGoals: goals.filter(goal => {
        const now = new Date();
        const isCompleted = goal.currentAmount >= goal.targetAmount;
        const isOverdue = now > goal.deadline && !isCompleted;
        return !isCompleted && !isOverdue;
      }).length,
      overdueGoals: goals.filter(goal => {
        const now = new Date();
        const isCompleted = goal.currentAmount >= goal.targetAmount;
        return now > goal.deadline && !isCompleted;
      }).length,
      totalTargetAmount: goals.reduce((sum, goal) => sum + goal.targetAmount, 0),
      totalCurrentAmount: goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
    };

    analytics.overallProgress = analytics.totalTargetAmount > 0 
      ? Math.round((analytics.totalCurrentAmount / analytics.totalTargetAmount) * 100)
      : 0;

    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  getGoalAnalytics
}; 