const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500', 'null', 'file://'],
        credentials: true
    }
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500', 'null', 'file://'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes - Create these files if they don't exist
let authRoutes, userRoutes, vehicleRoutes, bookingRoutes, tourRoutes, ticketRoutes, chatRoutes, emergencyRoutes, paymentRoutes, reportRoutes;

try {
    authRoutes = require('./routes/auth');
    userRoutes = require('./routes/users');
    vehicleRoutes = require('./routes/vehicles');
    bookingRoutes = require('./routes/bookings');
    tourRoutes = require('./routes/tours');
    ticketRoutes = require('./routes/tickets');
    chatRoutes = require('./routes/chat');
    emergencyRoutes = require('./routes/emergencies');
    paymentRoutes = require('./routes/payments');
    reportRoutes = require('./routes/reports');
} catch (err) {
    console.log('Some route files not found yet, using fallback routes');
    
    // Fallback routes
    const fallbackRouter = express.Router();
    fallbackRouter.get('/', (req, res) => res.json({ message: 'API endpoint - to be implemented' }));
    
    authRoutes = fallbackRouter;
    userRoutes = fallbackRouter;
    vehicleRoutes = fallbackRouter;
    bookingRoutes = fallbackRouter;
    tourRoutes = fallbackRouter;
    ticketRoutes = fallbackRouter;
    chatRoutes = fallbackRouter;
    emergencyRoutes = fallbackRouter;
    paymentRoutes = fallbackRouter;
    reportRoutes = fallbackRouter;
}

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);

// Default route
app.get('/', (req, res) => {
    res.json({ message: 'RwandaGo API is running', version: '1.0.0' });
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API is working!' });
});

// Socket.IO for real-time chat
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });
    
    socket.on('send_message', (data) => {
        io.to(data.roomId).emit('receive_message', data);
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
});

module.exports = { app, io };