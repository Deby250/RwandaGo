// ========================================
// SUPPORT ROUTES
// ========================================

const express = require('express');
const router = express.Router();
const {
    createTicket,
    getMyTickets,
    getTicketById,
    replyToTicket,
    updateTicketStatus,
    getAllTickets
} = require('../controllers/supportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/tickets', protect, createTicket);
router.get('/tickets/my-tickets', protect, getMyTickets);
router.get('/tickets', protect, authorize('support', 'admin'), getAllTickets);
router.get('/tickets/:id', protect, getTicketById);
router.post('/tickets/:id/reply', protect, replyToTicket);
router.put('/tickets/:id/status', protect, authorize('support', 'admin'), updateTicketStatus);

module.exports = router;