const Income = require('../models/Income');

// Set or update monthly income
const setIncome = async (req, res) => {
  try {
    const { amount, month, description } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!amount || !month) {
      return res.status(400).json({ error: 'Amount and month are required' });
    }

    // Validate month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Month must be in YYYY-MM format' });
    }

    // Try to find existing income for this month
    let income = await Income.findOne({ userId, month });

    if (income) {
      // Update existing income
      income.amount = amount;
      income.description = description || income.description;
      await income.save();

      res.json({
        message: 'Income updated successfully',
        income
      });
    } else {
      // Create new income entry
      income = new Income({
        userId,
        amount,
        month,
        description
      });

      await income.save();

      res.status(201).json({
        message: 'Income created successfully',
        income
      });
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Income for this month already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user's income history
const getIncome = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year, limit = 12 } = req.query;

    // Build query
    const query = { userId };
    
    if (year) {
      query.month = { $regex: `^${year}-` };
    }

    const incomes = await Income.find(query)
      .sort({ month: -1 })
      .limit(parseInt(limit));

    // Calculate total income
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

    res.json({
      incomes,
      totalIncome,
      monthsRecorded: incomes.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get income for a specific month
const getIncomeByMonth = async (req, res) => {
  try {
    const { month } = req.params;
    const userId = req.user._id;

    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Month must be in YYYY-MM format' });
    }

    const income = await Income.findOne({ userId, month });

    if (!income) {
      return res.status(404).json({ error: 'Income not found for this month' });
    }

    res.json({ income });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete an income entry
const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const income = await Income.findOneAndDelete({ _id: id, userId });
    
    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }

    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get income analytics
const getIncomeAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year } = req.query;

    // Build query
    const query = { userId };
    
    if (year) {
      query.month = { $regex: `^${year}-` };
    }

    const incomes = await Income.find(query).sort({ month: 1 });

    // Calculate analytics
    const analytics = {
      totalIncome: incomes.reduce((sum, income) => sum + income.amount, 0),
      averageIncome: incomes.length > 0 ? incomes.reduce((sum, income) => sum + income.amount, 0) / incomes.length : 0,
      monthsRecorded: incomes.length,
      highestIncome: incomes.length > 0 ? Math.max(...incomes.map(i => i.amount)) : 0,
      lowestIncome: incomes.length > 0 ? Math.min(...incomes.map(i => i.amount)) : 0,
      monthlyData: incomes.map(income => ({
        month: income.month,
        amount: income.amount,
        description: income.description
      }))
    };

    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  setIncome,
  getIncome,
  getIncomeByMonth,
  deleteIncome,
  getIncomeAnalytics
}; 