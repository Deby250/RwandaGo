// ========================================
// PAYMENT MODEL (MySQL)
// ========================================

const db = require('../config/database');

const Payment = {
    // Find payment by ID
    findById: async (id) => {
        const sql = 'SELECT * FROM payments WHERE id = ?';
        const payments = await db.query(sql, [id]);
        return payments[0] || null;
    },

    // Find payment by booking ID
    findByBookingId: async (bookingId) => {
        const sql = 'SELECT * FROM payments WHERE booking_id = ?';
        return await db.query(sql, [bookingId]);
    },

    // Get all payments with pagination
    findAll: async (limit = 10, offset = 0) => {
        const sql = 'SELECT * FROM payments ORDER BY created_at DESC LIMIT ? OFFSET ?';
        return await db.query(sql, [limit, offset]);
    },

    // Count total payments
    count: async () => {
        const sql = 'SELECT COUNT(*) as total FROM payments';
        const result = await db.query(sql);
        return result[0].total;
    },

    // Create new payment
    create: async (paymentData) => {
        const { booking_id, user_id, amount, currency, payment_method, transaction_id, status, payment_details } = paymentData;
        
        const sql = `INSERT INTO payments (booking_id, user_id, amount, currency, payment_method, transaction_id, status, payment_details) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const result = await db.query(sql, [booking_id, user_id, amount, currency || 'USD', payment_method, transaction_id, status || 'pending', JSON.stringify(paymentDetails || {})]);
        
        return await Payment.findById(result.insertId);
    },

    // Update payment
    update: async (id, paymentData) => {
        const fields = [];
        const values = [];
        
        const allowedFields = ['amount', 'currency', 'payment_method', 'transaction_id', 'status', 'payment_details'];
        
        for (const [key, value] of Object.entries(paymentData)) {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = ?`);
                values.push(key === 'payment_details' ? JSON.stringify(value) : value);
            }
        }
        
        if (fields.length === 0) return null;
        
        values.push(id);
        const sql = `UPDATE payments SET ${fields.join(', ')} WHERE id = ?`;
        await db.query(sql, values);
        
        return await Payment.findById(id);
    },

    // Update payment status
    updateStatus: async (id, status) => {
        const sql = 'UPDATE payments SET status = ? WHERE id = ?';
        await db.query(sql, [status, id]);
        return await Payment.findById(id);
    },

    // Delete payment
    delete: async (id) => {
        const sql = 'DELETE FROM payments WHERE id = ?';
        await db.query(sql, [id]);
        return true;
    },

    // Get payments by status
    findByStatus: async (status) => {
        const sql = 'SELECT * FROM payments WHERE status = ? ORDER BY created_at DESC';
        return await db.query(sql, [status]);
    },

    // Get payments by user ID
    findByUserId: async (userId) => {
        const sql = 'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC';
        return await db.query(sql, [userId]);
    }
};

module.exports = Payment;