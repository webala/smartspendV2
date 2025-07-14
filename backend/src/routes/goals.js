const express = require('express');
const router = express.Router();
const { 
  createGoal, 
  getGoals, 
  updateGoal, 
  deleteGoal, 
  updateGoalProgress, 
  getGoalAnalytics 
} = require('../controllers/FinancialGoalController');
const authenticateToken = require('../middleware/auth');

// All routes are protected
router.use(authenticateToken);

// Analytics (must come before parameterized routes)
router.get('/analytics', getGoalAnalytics);

// CRUD operations
router.post('/', createGoal);
router.get('/', getGoals);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

// Progress tracking
router.put('/:id/progress', updateGoalProgress);

module.exports = router; 