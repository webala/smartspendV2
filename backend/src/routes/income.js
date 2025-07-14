const express = require('express');
const router = express.Router();
const { 
  setIncome, 
  getIncome, 
  getIncomeByMonth, 
  deleteIncome, 
  getIncomeAnalytics 
} = require('../controllers/IncomeController');
const authenticateToken = require('../middleware/auth');

// All routes are protected
router.use(authenticateToken);

// Analytics (must come before parameterized routes)
router.get('/analytics', getIncomeAnalytics);

// Income operations
router.post('/', setIncome);
router.get('/', getIncome);
router.get('/:month', getIncomeByMonth);
router.delete('/:id', deleteIncome);

module.exports = router; 