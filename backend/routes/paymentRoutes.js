// ========================================
// PAYMENT ROUTES
// ========================================

const express = require('express');
const router = express.Router();
const {
    initiatePayment,
    verifyPayment,
    getPaymentHistory,
    getAllPayments
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/initiate', protect, initiatePayment);
router.get('/verify/:paymentId', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);
router.get('/', protect, authorize('admin'), getAllPayments);

module.exports = router;