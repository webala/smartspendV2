const axios = require('axios');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const FinancialGoal = require('../models/FinancialGoal');

// Ollama API configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

// Helper function to call Ollama API
const callOllama = async (prompt) => {
  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false
    }, {
      timeout: 60000 // 60 second timeout
    });

    return response.data.response;
  } catch (error) {
    console.error('Ollama API error:', error.message);
    throw new Error('AI service unavailable');
  }
};

// Helper function to generate a meaningful conversation title from a question
const generateConversationTitle = (question) => {
  // Remove common question starters
  const cleanQuestion = question
    .trim()
    .replace(/^(can you|could you|please|hey|hi|hello|um|so|well|okay|basically|)/i, '')
    .replace(/[?.,!]/g, '')
    .trim();

  // Split into words
  const words = cleanQuestion.split(' ');

  if (words.length <= 5) {
    // If the question is short, use it as is
    return cleanQuestion.charAt(0).toUpperCase() + cleanQuestion.slice(1);
  }

  // Try to find key phrases that indicate the topic
  const topicIndicators = [
    'about', 'regarding', 'concerning', 'on', 'for', 'with',
    'budget', 'savings', 'income', 'expenses', 'investing',
    'debt', 'mortgage', 'loan', 'credit', 'retirement',
    'investment', 'tax', 'insurance'
  ];

  let title = '';
  
  // Look for topic indicators and use the following words
  for (let i = 0; i < words.length - 1; i++) {
    if (topicIndicators.includes(words[i].toLowerCase())) {
      // Take up to 3 words after the indicator
      title = words.slice(i + 1, i + 4).join(' ');
      break;
    }
  }

  // If no topic indicator found, take first 4-5 meaningful words
  if (!title) {
    title = words
      .filter(word => word.length > 2) // Skip very short words
      .slice(0, 4)
      .join(' ');
  }

  // Capitalize first letter and add "Advice on" prefix
  return 'Advice on ' + title.charAt(0).toUpperCase() + title.slice(1);
};

// Get financial advice from Ollama
const Conversation = require('../models/Conversation');

const getFinancialAdvice = async (req, res) => {
  try {
    const userId = req.user._id;
    const { question, context, conversationId } = req.body;
    
    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, userId });
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
    } else {
      // Generate a meaningful title from the question
      const title = generateConversationTitle(question);
      conversation = new Conversation({
        userId,
        title
      });
    }

    // Get user's financial data
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    // Get recent expenses (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const expenses = await Expense.find({
      userId,
      date: { $gte: threeMonthsAgo }
    }).sort({ date: -1 });

    // Get recent income
    const incomes = await Income.find({
      userId,
      month: { $gte: currentMonth.slice(0, 4) + '-01' }
    }).sort({ month: -1 }).limit(3);

    // Get active goals
    const goals = await FinancialGoal.find({
      userId,
      deadline: { $gte: new Date() }
    }).sort({ deadline: 1 });

    // Calculate totals
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    
    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    // Create context for AI
    const financialContext = `
User's Financial Data:
- Total Income (last 3 months): ks ${totalIncome}
- Total Expenses (last 3 months): ksh ${totalExpenses}
- Net Savings: ksh ${totalIncome - totalExpenses}
- Expenses by Category: ${JSON.stringify(expensesByCategory)}
- Active Financial Goals: ${goals.map(g => `${g.title} (Target: ksh ${g.targetAmount}, Current: ksh ${g.currentAmount}, Progress: ${g.progress}%)`).join(', ')}
- Number of Active Goals: ${goals.length}

${context ? `Additional Context: ${context}` : ''}

Question: ${question || 'Please provide general financial advice based on my data.'}

Please provide personalized financial advice based on this data. Be specific and actionable.

`;

    // Get conversation history context
    const conversationContext = conversation.getContext();
    const conversationHistory = conversationContext.map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    // Combine conversation history with financial context
    const fullContext = `
${conversationHistory ? `Previous Conversation:\n${conversationHistory}\n\n` : ''}
${financialContext}
`;

    const aiResponse = await callOllama(fullContext);

    // Save the exchange to conversation
    await conversation.addMessage('user', question);
    await conversation.addMessage('assistant', aiResponse);

    res.json({
      advice: aiResponse,
      metadata: {
        totalExpenses,
        totalIncome,
        netSavings: totalIncome - totalExpenses,
        activeGoals: goals.length,
        expenseCategories: Object.keys(expensesByCategory).length
      },
      conversation: {
        id: conversation._id,
        title: conversation.title,
        messages: conversation.messages
      }
    });
  } catch (error) {
    if (error.message === 'AI service unavailable') {
      return res.status(503).json({ error: 'AI service is currently unavailable. Please try again later.' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Analyze spending patterns
const analyzeSpending = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = 'month' } = req.query; // month, quarter, year

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get expenses for the period
    const expenses = await Expense.find({
      userId,
      date: { $gte: startDate, $lte: now }
    }).sort({ date: -1 });

    // Get income for comparison
    const incomes = await Income.find({
      userId,
      month: { $gte: startDate.toISOString().slice(0, 7) }
    });

    // Calculate analytics
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    
    const expensesByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const averageDaily = totalExpenses / Math.max(1, Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)));
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Create analysis prompt
    const analysisPrompt = `
Financial Spending Analysis for ${period}:

Period: ${startDate.toDateString()} to ${now.toDateString()}
Total Expenses: $${totalExpenses}
Total Income: $${totalIncome}
Average Daily Spending: $${averageDaily.toFixed(2)}
Savings Rate: ${savingsRate.toFixed(1)}%

Spending by Category:
${Object.entries(expensesByCategory)
  .sort(([,a], [,b]) => b - a)
  .map(([category, amount]) => `- ${category}: $${amount} (${((amount/totalExpenses)*100).toFixed(1)}%)`)
  .join('\n')}

Please analyze this spending data and provide:
1. Key insights about spending patterns
2. Areas where spending could be optimized
3. Specific recommendations for improvement
4. Comparison with typical spending patterns
5. Suggestions for better budgeting

Be specific and actionable in your recommendations.
`;

    const aiAnalysis = await callOllama(analysisPrompt);

    res.json({
      analysis: aiAnalysis,
      data: {
        period,
        totalExpenses,
        totalIncome,
        netSavings: totalIncome - totalExpenses,
        savingsRate: savingsRate.toFixed(1),
        averageDaily: averageDaily.toFixed(2),
        expensesByCategory,
        topCategories: Object.entries(expensesByCategory)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([category, amount]) => ({
            category,
            amount,
            percentage: ((amount/totalExpenses)*100).toFixed(1)
          }))
      }
    });
  } catch (error) {
    if (error.message === 'AI service unavailable') {
      return res.status(503).json({ error: 'AI service is currently unavailable. Please try again later.' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Get budget recommendations
const getBudgetRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { monthlyIncome } = req.body;

    // Get user's historical spending data
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const expenses = await Expense.find({
      userId,
      date: { $gte: threeMonthsAgo }
    });

    const goals = await FinancialGoal.find({
      userId,
      deadline: { $gte: new Date() }
    });

    // Calculate average monthly expenses by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    // Average over 3 months
    Object.keys(expensesByCategory).forEach(category => {
      expensesByCategory[category] = expensesByCategory[category] / 3;
    });

    const totalGoalAmount = goals.reduce((sum, goal) => sum + goal.remainingAmount, 0);
    const totalCurrentExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);

    const budgetPrompt = `
Create a personalized budget recommendation:

Monthly Income: $${monthlyIncome}
Current Average Monthly Expenses: $${totalCurrentExpenses.toFixed(2)}
Current Spending by Category:
${Object.entries(expensesByCategory)
  .map(([category, amount]) => `- ${category}: $${amount.toFixed(2)}`)
  .join('\n')}

Financial Goals:
${goals.map(goal => `- ${goal.title}: Need $${goal.remainingAmount} by ${goal.deadline.toDateString()}`).join('\n')}

Please create a detailed monthly budget recommendation that includes:
1. Recommended spending limits for each category
2. Savings allocation
3. Goal-specific savings amounts
4. Emergency fund recommendations
5. Areas to cut spending if needed
6. Realistic percentages for each category

Use the 50/30/20 rule as a baseline but adjust based on the user's specific situation and goals.
`;

    const budgetAdvice = await callOllama(budgetPrompt);

    res.json({
      recommendations: budgetAdvice,
      currentData: {
        monthlyIncome,
        currentExpenses: totalCurrentExpenses.toFixed(2),
        currentSavings: (monthlyIncome - totalCurrentExpenses).toFixed(2),
        expensesByCategory,
        goalsRequiredSavings: totalGoalAmount,
        activeGoals: goals.length
      }
    });
  } catch (error) {
    if (error.message === 'AI service unavailable') {
      return res.status(503).json({ error: 'AI service is currently unavailable. Please try again later.' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getFinancialAdvice,
  analyzeSpending,
  getBudgetRecommendations
}; 