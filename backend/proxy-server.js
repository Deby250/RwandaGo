const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

// Your actual paths - ADJUST THESE IF NEEDED
const FRONTEND_PATH = 'C:\\Users\\UMWALI DEBORAH\\Desktop\\RwandaGo';
const BACKEND_PATH = __dirname;

console.log('📁 Looking for frontend files in:', FRONTEND_PATH);

// Check if index.html exists
if (fs.existsSync(path.join(FRONTEND_PATH, 'index.html'))) {
    console.log('✅ Found index.html');
} else {
    console.log('❌ index.html NOT found at:', FRONTEND_PATH);
    console.log('Please update FRONTEND_PATH in the script');
}

// Mock data that matches what frontend expects
const mockData = {
    vehicles: [
        { id: 1, name: 'Toyota RAV4', brand: 'Toyota', price: 55, seats: 5, status: 'available', image: '🚙' },
        { id: 2, name: 'Suzuki Jimny', brand: 'Suzuki', price: 45, seats: 4, status: 'available', image: '🚘' },
        { id: 3, name: 'Mitsubishi Pajero', brand: 'Mitsubishi', price: 85, seats: 7, status: 'available', image: '🚐' },
        { id: 4, name: 'Hyundai i10', brand: 'Hyundai', price: 30, seats: 4, status: 'available', image: '🚗' },
        { id: 5, name: 'Toyota Camry', brand: 'Toyota', price: 65, seats: 5, status: 'available', image: '🚙' }
    ],
    users: {
        'tourist@rwandago.com': { password: 'password123', role: 'tourist', name: 'John Doe', firstName: 'John', lastName: 'Doe' },
        'admin@rwandago.com': { password: 'password123', role: 'admin', name: 'Admin User', firstName: 'Admin', lastName: 'User' },
        'support@rwandago.com': { password: 'password123', role: 'support', name: 'Support Agent', firstName: 'Support', lastName: 'Agent' },
        'driver@rwandago.com': { password: 'password123', role: 'driver', name: 'Driver Guide', firstName: 'Driver', lastName: 'Guide' }
    }
};

// Serve static files from frontend directory
app.use(express.static(FRONTEND_PATH));

// Also serve assets folder
app.use('/assets', express.static(path.join(FRONTEND_PATH, 'assets')));

// API endpoints that frontend expects
app.get('/api/vehicles', (req, res) => {
    res.json({ vehicles: mockData.vehicles });
});

app.get('/api/vehicles/:id', (req, res) => {
    const vehicle = mockData.vehicles.find(v => v.id == req.params.id);
    res.json({ vehicle });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = mockData.users[email];
    
    if (user && user.password === password) {
        res.json({
            success: true,
            token: 'mock-token-' + Date.now(),
            user: { 
                id: 1, 
                email, 
                name: user.name, 
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role 
            },
            role: user.role
        });
    } else {
        res.status(401).json({ error: 'Invalid email or password' });
    }
});

app.post('/api/auth/register', (req, res) => {
    const { firstName, lastName, email, phone, password, role } = req.body;
    res.json({
        success: true,
        token: 'mock-token-' + Date.now(),
        user: { id: Date.now(), firstName, lastName, email, phone, role }
    });
});

app.post('/api/auth/change-password', (req, res) => {
    res.json({ success: true, message: 'Password changed successfully' });
});

app.get('/api/auth/me', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    res.json({ user: { id: 1, name: 'John Doe', email: 'tourist@rwandago.com', role: 'tourist' } });
});

app.post('/api/bookings', (req, res) => {
    const { vehicleId, startDate, endDate, totalAmount } = req.body;
    res.json({
        success: true,
        bookingId: Date.now(),
        bookingNumber: 'BK' + Date.now(),
        depositAmount: totalAmount * 0.2,
        totalAmount: totalAmount
    });
});

app.get('/api/bookings/my', (req, res) => {
    res.json({
        bookings: [
            { id: 'BK001', bookingNumber: 'BK001', vehicle: 'Toyota RAV4', startDate: '2024-12-01', endDate: '2024-12-05', amount: 275, status: 'active', paymentStatus: 'deposit_paid' },
            { id: 'BK002', bookingNumber: 'BK002', vehicle: 'Suzuki Jimny', startDate: '2024-11-15', endDate: '2024-11-18', amount: 135, status: 'completed', paymentStatus: 'fully_paid' }
        ]
    });
});

app.get('/api/bookings/:id', (req, res) => {
    res.json({
        booking: {
            id: req.params.id,
            bookingNumber: 'BK001',
            vehicle: 'Toyota RAV4',
            startDate: '2024-12-01',
            endDate: '2024-12-05',
            amount: 275,
            status: 'active'
        }
    });
});

app.post('/api/bookings/:id/cancel', (req, res) => {
    res.json({ success: true, message: 'Booking cancelled successfully' });
});

app.get('/api/tours', (req, res) => {
    res.json({
        tours: [
            { id: 1, name: 'Volcanoes National Park', description: 'Gorilla trekking adventure', price: 500, duration: '2 days', category: 'adventure', image: '🏔️' },
            { id: 2, name: 'Nyungwe Forest Canopy', description: 'Walk among the treetops', price: 350, duration: '2 days', category: 'nature', image: '🌳' },
            { id: 3, name: 'Lake Kivu Escape', description: 'Relaxing lakeside retreat', price: 450, duration: '3 days', category: 'relaxation', image: '💧' },
            { id: 4, name: 'Akagera Safari', description: 'Big five wildlife experience', price: 400, duration: '2 days', category: 'wildlife', image: '🦒' }
        ]
    });
});

app.post('/api/tickets', (req, res) => {
    res.json({ success: true, ticketId: Date.now(), ticketNumber: 'TKT' + Date.now() });
});

app.get('/api/tickets/my', (req, res) => {
    res.json({ tickets: [] });
});

app.get('/api/users/profile', (req, res) => {
    res.json({ user: { firstName: 'John', lastName: 'Doe', email: 'tourist@rwandago.com', phone: '+250788123456' } });
});

app.put('/api/users/profile', (req, res) => {
    res.json({ success: true, message: 'Profile updated' });
});

app.get('/api/reports/dashboard', (req, res) => {
    res.json({ stats: { activeBookings: 1, completedTours: 5, totalSpent: 1250 } });
});

// Catch all - serve index.html for any unmatched routes (for SPA routing)
app.get('*', (req, res) => {
    const indexPath = path.join(FRONTEND_PATH, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send(`
            <h1>File Not Found</h1>
            <p>Could not find index.html at: ${FRONTEND_PATH}</p>
            <p>Please check your folder path.</p>
        `);
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n✅ RwandaGo Proxy Server Running!`);
    console.log(`🌐 Open your browser to: http://localhost:${PORT}`);
    console.log(`\n📝 Demo Login:`);
    console.log(`   Email: tourist@rwandago.com`);
    console.log(`   Password: password123`);
    console.log(`\n📁 Frontend path: ${FRONTEND_PATH}`);
    console.log(`\n🚀 No frontend or backend changes needed!\n`);
});