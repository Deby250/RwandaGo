// ========================================
// SUPPORT CONTROLLER
// ========================================

const SupportTicket = require('../models/SupportTicket');
const sendEmail = require('../utils/sendEmail');

exports.createTicket = async (req, res) => {
    const { subject, category, priority, message } = req.body;
    
    const ticket = await SupportTicket.create({
        user: req.user.id,
        subject,
        category,
        priority,
        messages: [{
            sender: req.user.id,
            message,
            isStaff: false
        }]
    });
    
    res.status(201).json({
        success: true,
        message: 'Ticket created successfully',
        data: ticket
    });
};

exports.getMyTickets = async (req, res) => {
    const tickets = await SupportTicket.find({ user: req.user.id })
        .sort('-createdAt');
    
    res.json({
        success: true,
        count: tickets.length,
        data: tickets
    });
};

exports.getTicketById = async (req, res) => {
    const ticket = await SupportTicket.findById(req.params.id)
        .populate('user', 'firstName lastName email')
        .populate('messages.sender', 'firstName lastName role');
    
    if (!ticket) {
        return res.status(404).json({
            success: false,
            message: 'Ticket not found'
        });
    }
    
    if (ticket.user._id.toString() !== req.user.id && req.user.role !== 'support' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to view this ticket'
        });
    }
    
    res.json({
        success: true,
        data: ticket
    });
};

exports.replyToTicket = async (req, res) => {
    const { message } = req.body;
    
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
        return res.status(404).json({
            success: false,
            message: 'Ticket not found'
        });
    }
    
    ticket.messages.push({
        sender: req.user.id,
        message,
        isStaff: req.user.role === 'support' || req.user.role === 'admin'
    });
    
    if (ticket.status === 'open' && (req.user.role === 'support' || req.user.role === 'admin')) {
        ticket.status = 'in-progress';
    }
    
    await ticket.save();
    
    await sendEmail({
        to: ticket.user.email,
        subject: `New reply on ticket #${ticket.ticketNumber}`,
        html: `<h1>New Reply</h1><p>There is a new reply on your support ticket.</p><a href="${process.env.FRONTEND_URL}/support/tickets/${ticket._id}">View Ticket</a>`
    });
    
    res.json({
        success: true,
        message: 'Reply sent successfully',
        data: ticket
    });
};

exports.updateTicketStatus = async (req, res) => {
    const { status } = req.body;
    
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
        return res.status(404).json({
            success: false,
            message: 'Ticket not found'
        });
    }
    
    ticket.status = status;
    if (status === 'resolved') {
        ticket.resolvedAt = new Date();
        ticket.resolvedBy = req.user.id;
    }
    await ticket.save();
    
    res.json({
        success: true,
        message: `Ticket status updated to ${status}`,
        data: ticket
    });
};

exports.getAllTickets = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    
    let query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    
    const total = await SupportTicket.countDocuments(query);
    const tickets = await SupportTicket.find(query)
        .populate('user', 'firstName lastName email')
        .sort('-createdAt')
        .limit(limit)
        .skip(startIndex);
    
    res.json({
        success: true,
        count: tickets.length,
        total,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        data: tickets
    });
};