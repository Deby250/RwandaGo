// ========================================
// RWANDAGO BACKEND - MAIN SERVER (MySQL)
// ========================================

require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const tourRoutes = require('./routes/tourRoutes');
const supportRoutes = require('./routes/supportRoutes');

// Import middleware
const { errorHandler } = require('./middleware/errorMiddleware');
const { connectDB } = require('./config/database');

// Initialize Express
const app = express();

// ========================================
// DATABASE CONNECTION
// ========================================
connectDB();

// ========================================
// MIDDLEWARE
// ========================================
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// ========================================
// API ROUTES
// ========================================

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'RwandaGo API is running',
        timestamp: new Date().toISOString(),
        database: 'MySQL'
    });
});

app.get('/api', (req, res) => {
    res.json({
        version: '1.0.0',
        name: 'RwandaGo API',
        description: 'Car Rental & Touring System API',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            vehicles: '/api/vehicles',
            bookings: '/api/bookings',
            payments: '/api/payments',
            tours: '/api/tours',
            support: '/api/support'
        }
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/support', supportRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`
    });
});

// Error handler
app.use(errorHandler);

// ========================================
// START SERVER
// ========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});