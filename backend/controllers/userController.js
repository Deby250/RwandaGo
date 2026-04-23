const db = require('../database/db');

const userController = {
    async getProfile(req, res) {
        try {
            const user = await db.get(
                `SELECT id, first_name, last_name, email, phone, passport_number, 
                        nationality, profile_image, role, created_at
                 FROM users WHERE id = ?`,
                [req.user.id]
            );
            res.json({ user });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    async updateProfile(req, res) {
        const { firstName, lastName, phone, passportNumber, nationality } = req.body;
        
        try {
            await db.run(
                `UPDATE users 
                 SET first_name = COALESCE(?, first_name),
                     last_name = COALESCE(?, last_name),
                     phone = COALESCE(?, phone),
                     passport_number = COALESCE(?, passport_number),
                     nationality = COALESCE(?, nationality),
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [firstName, lastName, phone, passportNumber, nationality, req.user.id]
            );
            
            res.json({ success: true, message: 'Profile updated successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    async getAllUsers(req, res) {
        try {
            const users = await db.all(
                `SELECT id, first_name, last_name, email, phone, role, is_active, created_at
                 FROM users ORDER BY created_at DESC`
            );
            res.json({ users });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    async updateUserStatus(req, res) {
        const { id } = req.params;
        const { isActive } = req.body;
        
        try {
            await db.run('UPDATE users SET is_active = ? WHERE id = ?', [isActive, id]);
            res.json({ success: true, message: 'User status updated' });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = userController;