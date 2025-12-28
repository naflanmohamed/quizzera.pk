const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// ===== MIDDLEWARE =====

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8080',
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ===== ROUTES =====

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Quizzera API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Category routes
app.use('/api/categories', require('./routes/categories'));

// Quiz routes
app.use('/api/quizzes', require('./routes/quizzes'));

// Question routes
app.use('/api/questions', require('./routes/questions'));

// Attempt routes
app.use('/api/attempts', require('./routes/attempts'));

// Resource routes (PDFs)
app.use('/api/resources', require('./routes/resources'));

// Blog routes
app.use('/api/blogs', require('./routes/blogs'));

// ===== ERROR HANDLING =====

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ===== START SERVER =====

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║     🚀 Quizzera API Server            ║
  ╠═══════════════════════════════════════╣
  ║  Environment: ${process.env.NODE_ENV?.padEnd(22)}║
  ║  Port: ${String(PORT).padEnd(30)}║
  ║  URL: http://localhost:${PORT}           ║
  ╚═══════════════════════════════════════╝
  
  📚 API Endpoints:
  ────────────────────────────────────────
  Auth:       /api/auth
  Categories: /api/categories
  Quizzes:    /api/quizzes
  Questions:  /api/questions
  Attempts:   /api/attempts
  Resources:  /api/resources/pdfs
  Blogs:      /api/blogs
  ────────────────────────────────────────
  `);
});
