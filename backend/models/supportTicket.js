// ========================================
// SUPPORT TICKET MODEL (MySQL)
// ========================================

const db = require('../config/database');
const { generateRandomString } = require('../utils/helpers');

const SupportTicket = {
    // Find ticket by ID
    findById: async (id) => {
        const sql = 'SELECT * FROM support_tickets WHERE id = ?';
        const tickets = await db.query(sql, [id]);
        return tickets[0] || null;
    },

    // Find ticket by ticket number
    findByTicketNumber: async (ticketNumber) => {
        const sql = 'SELECT * FROM support_tickets WHERE ticket_number = ?';
        const tickets = await db.query(sql, [ticketNumber]);
        return tickets[0] || null;
    },

    // Get all tickets with pagination
    findAll: async (limit = 10, offset = 0) => {
        const sql = 'SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT ? OFFSET ?';
        return await db.query(sql, [limit, offset]);
    },

    // Get tickets by user ID
    findByUserId: async (userId) => {
        const sql = 'SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC';
        return await db.query(sql, [userId]);
    },

    // Count total tickets
    count: async () => {
        const sql = 'SELECT COUNT(*) as total FROM support_tickets';
        const result = await db.query(sql);
        return result[0].total;
    },

    // Create new ticket
    create: async (ticketData) => {
        const { user_id, subject, category, description, priority } = ticketData;
        
        const ticketNumber = 'TKT-' + generateRandomString(8);
        
        const sql = `INSERT INTO support_tickets (ticket_number, user_id, subject, category, description, priority, status) 
                     VALUES (?, ?, ?, ?, ?, ?, 'open')`;
        const result = await db.query(sql, [ticketNumber, user_id, subject, category, description, priority || 'medium']);
        
        return await SupportTicket.findById(result.insertId);
    },

    // Update ticket
    update: async (id, ticketData) => {
        const fields = [];
        const values = [];
        
        const allowedFields = ['subject', 'category', 'description', 'priority', 'status', 'assigned_to', 'response'];
        
        for (const [key, value] of Object.entries(ticketData)) {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        if (fields.length === 0) return null;
        
        values.push(id);
        const sql = `UPDATE support_tickets SET ${fields.join(', ')} WHERE id = ?`;
        await db.query(sql, values);
        
        return await SupportTicket.findById(id);
    },

    // Update ticket status
    updateStatus: async (id, status) => {
        const sql = 'UPDATE support_tickets SET status = ? WHERE id = ?';
        await db.query(sql, [status, id]);
        return await SupportTicket.findById(id);
    },

    // Delete ticket
    delete: async (id) => {
        const sql = 'DELETE FROM support_tickets WHERE id = ?';
        await db.query(sql, [id]);
        return true;
    },

    // Get tickets by status
    findByStatus: async (status) => {
        const sql = 'SELECT * FROM support_tickets WHERE status = ? ORDER BY created_at DESC';
        return await db.query(sql, [status]);
    },

    // Assign ticket
    assignTicket: async (id, assignedTo) => {
        const sql = 'UPDATE support_tickets SET assigned_to = ?, status = "in_progress" WHERE id = ?';
        await db.query(sql, [assignedTo, id]);
        return await SupportTicket.findById(id);
    }
};

module.exports = SupportTicket;