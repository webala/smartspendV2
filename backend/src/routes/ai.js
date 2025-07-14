const express = require('express');
const router = express.Router();
const { 
  getFinancialAdvice, 
  analyzeSpending, 
  getBudgetRecommendations 
} = require('../controllers/FinancialAgentController');
const authenticateToken = require('../middleware/auth');

// All routes are protected
router.use(authenticateToken);

// AI operations
router.post('/advice', getFinancialAdvice);
router.post('/analyze', analyzeSpending);
router.post('/budget', getBudgetRecommendations);

module.exports = router; 