const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');
require('dotenv').config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const goalRoutes = require('./routes/goals');
const incomeRoutes = require('./routes/income');
const buddyRoutes = require('./routes/buddies');
const aiRoutes = require('./routes/ai');
const dashboardRoutes = require('./routes/dashboard');

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'SmartSpend V2 API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      expenses: '/expenses',
      goals: '/goals',
      income: '/income',
      buddies: '/buddies',
      ai: '/ai',
      dashboard: '/dashboard'
    }
  });
});

app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/expenses', expenseRoutes);
app.use('/goals', goalRoutes);
app.use('/income', incomeRoutes);
app.use('/buddies', buddyRoutes);
app.use('/ai', aiRoutes);
app.use('/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 