const express = require('express');
const router = express.Router();
const { 
  sendBuddyRequest, 
  acceptBuddyRequest, 
  getPendingRequests, 
  getBuddies, 
  removeBuddy, 
  rejectBuddyRequest 
} = require('../controllers/BuddyController');
const authenticateToken = require('../middleware/auth');

// All routes are protected
router.use(authenticateToken);

// Buddy operations
router.post('/request', sendBuddyRequest);
router.post('/accept/:id', acceptBuddyRequest);
router.post('/reject/:id', rejectBuddyRequest);
router.get('/requests', getPendingRequests);
router.get('/', getBuddies);
router.delete('/:id', removeBuddy);

module.exports = router; 