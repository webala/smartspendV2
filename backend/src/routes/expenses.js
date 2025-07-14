const express = require('express');
const router = express.Router();
const { 
  createExpense, 
  getExpenses, 
  updateExpense, 
  deleteExpense, 
  getExpenseAnalytics 
} = require('../controllers/ExpenseController');
const authenticateToken = require('../middleware/auth');

// All routes are protected
router.use(authenticateToken);

// Analytics (must come before parameterized routes)
router.get('/analytics', getExpenseAnalytics);

// CRUD operations
router.post('/', createExpense);
router.get('/', getExpenses);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router; 