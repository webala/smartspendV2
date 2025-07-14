const Expense = require('../models/Expense');

// Create a new expense
const createExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!amount || !category || !date) {
      return res.status(400).json({ error: 'Amount, category, and date are required' });
    }

    const expense = new Expense({
      userId,
      amount,
      category,
      description,
      date: new Date(date)
    });

    await expense.save();

    res.status(201).json({
      message: 'Expense created successfully',
      expense
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all expenses for user
const getExpenses = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category, startDate, endDate, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { userId };
    
    if (category) {
      query.category = category;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalExpenses = await Expense.countDocuments(query);
    const totalAmount = await Expense.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      expenses,
      totalExpenses,
      totalAmount: totalAmount[0]?.total || 0,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalExpenses / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update an expense
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, description, date } = req.body;
    const userId = req.user._id;

    const expense = await Expense.findOne({ _id: id, userId });
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Update fields
    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category;
    if (description !== undefined) expense.description = description;
    if (date !== undefined) expense.date = new Date(date);

    await expense.save();

    res.json({
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete an expense
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const expense = await Expense.findOneAndDelete({ _id: id, userId });
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get expense analytics
const getExpenseAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year, month } = req.query;

    const matchStage = { userId };
    
    if (year && month) {
      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      matchStage.date = { $gte: startDate, $lte: endDate };
    }

    const analytics = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getExpenseAnalytics
}; 