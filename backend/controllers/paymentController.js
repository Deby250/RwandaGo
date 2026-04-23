// ========================================
// PAYMENT CONTROLLER
// ========================================

const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const sendEmail = require('../utils/sendEmail');

exports.initiatePayment = async (req, res) => {
    const { bookingId, paymentMethod, amount } = req.body;
    
    const booking = await Booking.findById(bookingId).populate('user vehicle');
    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }
    
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized'
        });
    }
    
    let paymentType = 'deposit';
    let paymentAmount = booking.depositAmount;
    
    if (amount === booking.remainingAmount) {
        paymentType = 'remaining';
        paymentAmount = booking.remainingAmount;
    } else if (amount === booking.totalAmount) {
        paymentType = 'full';
        paymentAmount = booking.totalAmount;
    }
    
    const payment = await Payment.create({
        booking: bookingId,
        user: req.user.id,
        amount: paymentAmount,
        paymentType,
        method: paymentMethod,
        status: 'pending'
    });
    
    res.json({
        success: true,
        message: 'Payment initiated',
        data: {
            paymentId: payment._id,
            amount: paymentAmount,
            paymentType,
            transactionId: payment.transactionId
        }
    });
};

exports.verifyPayment = async (req, res) => {
    const { paymentId } = req.params;
    
    const payment = await Payment.findById(paymentId);
    if (!payment) {
        return res.status(404).json({
            success: false,
            message: 'Payment not found'
        });
    }
    
    // Simulate payment verification (in production, integrate with Stripe/PayPal)
    payment.status = 'completed';
    payment.paidAt = new Date();
    await payment.save();
    
    const booking = await Booking.findById(payment.booking).populate('user vehicle');
    
    await sendEmail({
        to: booking.user.email,
        subject: 'Payment Confirmed - RwandaGo',
        html: `<h1>Payment Confirmed!</h1><p>Your payment of $${payment.amount} for booking #${booking.bookingNumber} has been confirmed.</p>`
    });
    
    res.json({
        success: true,
        message: 'Payment verified successfully',
        data: payment
    });
};

exports.getPaymentHistory = async (req, res) => {
    const payments = await Payment.find({ user: req.user.id })
        .populate('booking', 'bookingNumber')
        .sort('-createdAt');
    
    res.json({
        success: true,
        count: payments.length,
        data: payments
    });
};

exports.getAllPayments = async (req, res) => {
    const payments = await Payment.find()
        .populate('user', 'firstName lastName email')
        .populate('booking', 'bookingNumber')
        .sort('-createdAt');
    
    res.json({
        success: true,
        count: payments.length,
        data: payments
    });
};