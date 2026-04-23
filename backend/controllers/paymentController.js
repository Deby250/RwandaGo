const db = require('../database/db');
const { generateTransactionId } = require('../utils/helpers');

const paymentController = {
    async processPayment(req, res) {
        const { bookingId, amount, paymentMethod, paymentType } = req.body;
        
        try {
            const transactionId = generateTransactionId();
            
            // In production, integrate with Stripe/PayPal here
            // For demo, we'll simulate successful payment
            
            const result = await db.run(
                `INSERT INTO payments 
                 (transaction_id, booking_id, user_id, amount, payment_type, payment_method, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [transactionId, bookingId, req.user.id, amount, paymentType, paymentMethod, 'success']
            );
            
            // Update booking payment status
            if (paymentType === 'deposit') {
                await db.run(
                    `UPDATE bookings SET deposit_paid = 1, payment_status = 'deposit_paid' WHERE id = ?`,
                    [bookingId]
                );
            } else if (paymentType === 'full') {
                await db.run(
                    `UPDATE bookings SET deposit_paid = 1, payment_status = 'fully_paid' WHERE id = ?`,
                    [bookingId]
                );
            }
            
            res.json({
                success: true,
                message: 'Payment processed successfully',
                transactionId,
                paymentId: result.lastID
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    async getPaymentHistory(req, res) {
        try {
            const payments = await db.all(
                `SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC`,
                [req.user.id]
            );
            
            res.json({ payments });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    async getPaymentDetails(req, res) {
        const { id } = req.params;
        
        try {
            const payment = await db.get(
                `SELECT * FROM payments WHERE id = ? AND user_id = ?`,
                [id, req.user.id]
            );
            
            if (!payment) {
                return res.status(404).json({ error: 'Payment not found' });
            }
            
            res.json({ payment });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = paymentController;