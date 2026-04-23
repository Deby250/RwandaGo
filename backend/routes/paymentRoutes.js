const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/process', authenticateToken, paymentController.processPayment);
router.get('/history', authenticateToken, paymentController.getPaymentHistory);
router.get('/:id', authenticateToken, paymentController.getPaymentDetails);

module.exports = router;