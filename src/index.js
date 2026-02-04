const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const cardRoutes = require('./routes/cardRoutes');
const userRoutes = require('./routes/userRoutes');
const { initializeDatabase } = require('./config/database');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Online Card Application Web Service',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      cards: '/api/cards'
    }
  });
});

app.use('/api/users', userRoutes);
app.use('/api/cards', cardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Visit http://localhost:${PORT} for API information`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

module.exports = app;
