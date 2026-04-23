// ========================================
// BOOKING MODEL (MySQL)
// ========================================

const db = require('../config/database');
const { generateRandomString } = require('../utils/helpers');

const Booking = {
    // Find booking by ID
    findById: async (id) => {
        const sql = 'SELECT * FROM bookings WHERE id = ?';
        const bookings = await db.query(sql, [id]);
        return bookings[0] || null;
    },

    // Find booking by booking number
    findByBookingNumber: async (bookingNumber) => {
        const sql = 'SELECT * FROM bookings WHERE booking_number = ?';
        const bookings = await db.query(sql, [bookingNumber]);
        return bookings[0] || null;
    },

    // Get all bookings with pagination
    findAll: async (limit = 10, offset = 0) => {
        const sql = 'SELECT * FROM bookings ORDER BY created_at DESC LIMIT ? OFFSET ?';
        return await db.query(sql, [limit, offset]);
    },

    // Get bookings by user ID
    findByUserId: async (userId) => {
        const sql = 'SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC';
        return await db.query(sql, [userId]);
    },

    // Count total bookings
    count: async () => {
        const sql = 'SELECT COUNT(*) as total FROM bookings';
        const result = await db.query(sql);
        return result[0].total;
    },

    // Create new booking
    create: async (bookingData) => {
        const { user_id, vehicle_id, tour_id, start_date, end_date, pickup_location, dropoff_location, total_days, total_price, status } = bookingData;
        
        const bookingNumber = 'RG-' + generateRandomString(8);
        
        const sql = `INSERT INTO bookings (booking_number, user_id, vehicle_id, tour_id, start_date, end_date, pickup_location, dropoff_location, total_days, total_price, status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const result = await db.query(sql, [bookingNumber, user_id, vehicle_id, tour_id || null, start_date, end_date, pickup_location, dropoff_location, total_days, total_price, status || 'pending']);
        
        return await Booking.findById(result.insertId);
    },

    // Update booking
    update: async (id, bookingData) => {
        const fields = [];
        const values = [];
        
        const allowedFields = ['start_date', 'end_date', 'pickup_location', 'dropoff_location', 'total_days', 'total_price', 'status', 'notes'];
        
        for (const [key, value] of Object.entries(bookingData)) {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        if (fields.length === 0) return null;
        
        values.push(id);
        const sql = `UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`;
        await db.query(sql, values);
        
        return await Booking.findById(id);
    },

    // Update booking status
    updateStatus: async (id, status) => {
        const sql = 'UPDATE bookings SET status = ? WHERE id = ?';
        await db.query(sql, [status, id]);
        return await Booking.findById(id);
    },

    // Delete booking
    delete: async (id) => {
        const sql = 'DELETE FROM bookings WHERE id = ?';
        await db.query(sql, [id]);
        return true;
    },

    // Get bookings by status
    findByStatus: async (status) => {
        const sql = 'SELECT * FROM bookings WHERE status = ? ORDER BY created_at DESC';
        return await db.query(sql, [status]);
    }
};

module.exports = Booking;