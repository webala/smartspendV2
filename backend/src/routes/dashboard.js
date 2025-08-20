const express = require('express');
const router = express.Router();
const { 
  getDashboardData, 
  getDashboardAnalytics 
} = require('../controllers/DashboardController');
const authenticateToken = require('../middleware/auth');

// All routes are protected
router.use(authenticateToken);

// Dashboard routes
router.get('/', getDashboardData);
router.get('/analytics', getDashboardAnalytics);

module.exports = router;
