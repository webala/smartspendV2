const Expense = require('../models/Expense');
const Income = require('../models/Income');
const FinancialGoal = require('../models/FinancialGoal');
const BuddyRelationship = require('../models/BuddyRelationship');

// Get dashboard overview data
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get current month and year
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentMonthStr = `${currentYear}-${currentMonth}`;
    
    // Start of current month
    const startOfMonth = new Date(currentYear, now.getMonth(), 1);
    const endOfMonth = new Date(currentYear, now.getMonth() + 1, 0);

    // Parallel data fetching for better performance
    const [
      monthlyExpenseData,
      currentMonthIncome,
      recentExpenses,
      activeGoals,
      buddyCount
    ] = await Promise.all([
      // Get current month expenses with total
      Expense.aggregate([
        {
          $match: {
            userId,
            date: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Get current month income
      Income.findOne({ userId, month: currentMonthStr }),
      
      // Get recent expenses (last 5)
      Expense.find({ userId })
        .sort({ date: -1 })
        .limit(5)
        .select('amount category description date'),
      
      // Get active goals
      FinancialGoal.find({ userId })
        .sort({ deadline: 1 })
        .select('title targetAmount currentAmount deadline category'),
      
      // Get buddy count
      BuddyRelationship.countDocuments({
        $or: [
          { userId1: userId, status: 'accepted' },
          { userId2: userId, status: 'accepted' }
        ]
      })
    ]);

    // Process the data
    const totalExpenses = monthlyExpenseData[0]?.totalAmount || 0;
    const monthlyIncome = currentMonthIncome?.amount || 0;
    
    // Calculate goal statistics
    const goalStats = {
      total: activeGoals.length,
      active: 0,
      completed: 0
    };
    
    const processedGoals = activeGoals.map(goal => {
      const progress = goal.targetAmount > 0 
        ? Math.round((goal.currentAmount / goal.targetAmount) * 100) 
        : 0;
      
      const isCompleted = goal.currentAmount >= goal.targetAmount;
      const isOverdue = now > goal.deadline && !isCompleted;
      
      if (isCompleted) {
        goalStats.completed++;
      } else if (!isOverdue) {
        goalStats.active++;
      }
      
      return {
        id: goal._id,
        title: goal.title,
        current: goal.currentAmount,
        target: goal.targetAmount,
        progress,
        deadline: goal.deadline,
        category: goal.category,
        isCompleted,
        isOverdue
      };
    });

    // Calculate budget overview
    const remainingBudget = monthlyIncome - totalExpenses;
    const budgetUsedPercentage = monthlyIncome > 0 
      ? Math.round((totalExpenses / monthlyIncome) * 100) 
      : 0;

    // Format recent expenses
    const formattedRecentExpenses = recentExpenses.map(expense => ({
      id: expense._id,
      description: expense.description || 'No description',
      amount: expense.amount,
      category: expense.category,
      date: expense.date.toISOString().split('T')[0] // Format as YYYY-MM-DD
    }));

    // Prepare response
    const dashboardData = {
      overview: {
        totalExpenses,
        monthlyIncome,
        remainingBudget,
        budgetUsedPercentage,
        activeGoals: goalStats.active,
        totalBuddies: buddyCount
      },
      recentExpenses: formattedRecentExpenses,
      goals: processedGoals.slice(0, 3), // Show only top 3 goals on dashboard
      goalStats,
      currentMonth: currentMonthStr,
      lastUpdated: new Date().toISOString()
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get dashboard analytics (monthly trends, etc.)
const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { months = 6 } = req.query; // Default to last 6 months
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
    
    // Get monthly expense trends
    const expenseTrends = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get category breakdown for current month
    const categoryBreakdown = await Expense.aggregate([
      {
        $match: {
          userId,
          date: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0)
          }
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    res.json({
      expenseTrends: expenseTrends.map(trend => ({
        month: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`,
        amount: trend.totalAmount,
        count: trend.count
      })),
      categoryBreakdown: categoryBreakdown.map(cat => ({
        category: cat._id,
        amount: cat.totalAmount,
        count: cat.count
      }))
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getDashboardData,
  getDashboardAnalytics
};
