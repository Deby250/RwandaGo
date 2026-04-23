const db = require('../database/db');
const { generateTicketNumber } = require('../utils/helpers');

const emergencyController = {
    async reportEmergency(req, res) {
        const { location, latitude, longitude, issueType, description } = req.body;
        
        try {
            const emergencyNumber = `EMG${Date.now()}`;
            
            const result = await db.run(
                `INSERT INTO emergencies 
                 (emergency_number, user_id, location, latitude, longitude, issue_type, description)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [emergencyNumber, req.user.id, location, latitude, longitude, issueType, description]
            );
            
            res.status(201).json({
                success: true,
                message: 'Emergency reported successfully',
                emergencyId: result.lastID,
                emergencyNumber
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    async getActiveEmergencies(req, res) {
        try {
            const emergencies = await db.all(
                `SELECT e.*, u.first_name, u.last_name, u.phone
                 FROM emergencies e
                 JOIN users u ON e.user_id = u.id
                 WHERE e.status IN ('active', 'in_progress')
                 ORDER BY 
                     CASE e.priority 
                         WHEN 'critical' THEN 1 
                         WHEN 'high' THEN 2 
                         ELSE 3 
                     END,
                     e.created_at ASC`
            );
            
            res.json({ emergencies });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    async resolveEmergency(req, res) {
        const { id } = req.params;
        
        try {
            await db.run(
                `UPDATE emergencies 
                 SET status = 'resolved', 
                     resolved_at = CURRENT_TIMESTAMP,
                     assigned_to = ?
                 WHERE id = ?`,
                [req.user.id, id]
            );
            
            res.json({ success: true, message: 'Emergency resolved' });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = emergencyController;