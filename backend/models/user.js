// ========================================
// USER MODEL (MySQL)
// ========================================

const db = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
    // Find user by email
    findByEmail: async (email) => {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const users = await db.query(sql, [email]);
        return users[0] || null;
    },

    // Find user by ID
    findById: async (id) => {
        const sql = 'SELECT * FROM users WHERE id = ?';
        const users = await db.query(sql, [id]);
        return users[0] || null;
    },

    // Get all users with pagination
    findAll: async (limit = 10, offset = 0) => {
        const sql = 'SELECT id, first_name, last_name, email, phone, role, status, created_at, updated_at FROM users LIMIT ? OFFSET ?';
        return await db.query(sql, [limit, offset]);
    },

    // Count total users
    count: async () => {
        const sql = 'SELECT COUNT(*) as total FROM users';
        const result = await db.query(sql);
        return result[0].total;
    },

    // Create new user
    create: async (userData) => {
        const { firstName, lastName, email, password, phone, role } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const sql = 'INSERT INTO users (first_name, last_name, email, password, phone, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const result = await db.query(sql, [firstName, lastName, email, hashedPassword, phone, role || 'tourist', 'active']);
        
        return await User.findById(result.insertId);
    },

    // Update user
    update: async (id, userData) => {
        const fields = [];
        const values = [];
        
        if (userData.firstName) {
            fields.push('first_name = ?');
            values.push(userData.firstName);
        }
        if (userData.lastName) {
            fields.push('last_name = ?');
            values.push(userData.lastName);
        }
        if (userData.phone) {
            fields.push('phone = ?');
            values.push(userData.phone);
        }
        if (userData.email) {
            fields.push('email = ?');
            values.push(userData.email);
        }
        
        if (fields.length === 0) return null;
        
        values.push(id);
        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        await db.query(sql, values);
        
        return await User.findById(id);
    },

    // Delete user
    delete: async (id) => {
        const sql = 'DELETE FROM users WHERE id = ?';
        await db.query(sql, [id]);
        return true;
    },

    // Toggle user status
    toggleStatus: async (id) => {
        const user = await User.findById(id);
        if (!user) return null;
        
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        const sql = 'UPDATE users SET status = ? WHERE id = ?';
        await db.query(sql, [newStatus, id]);
        
        return await User.findById(id);
    },

    // Compare password
    comparePassword: async (candidatePassword, hashedPassword) => {
        return await bcrypt.compare(candidatePassword, hashedPassword);
    }
};

module.exports = User;