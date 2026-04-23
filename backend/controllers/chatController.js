const db = require('../database/db');

const chatController = {
    async getMessages(req, res) {
        const { userId } = req.params;
        const currentUserId = req.user.id;
        
        try {
            const messages = await db.all(
                `SELECT * FROM chat_messages 
                 WHERE (sender_id = ? AND receiver_id = ?) 
                    OR (sender_id = ? AND receiver_id = ?)
                 ORDER BY created_at ASC`,
                [currentUserId, userId, userId, currentUserId]
            );
            
            res.json({ messages });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    async sendMessage(req, res) {
        const { receiverId, message } = req.body;
        
        try {
            const result = await db.run(
                `INSERT INTO chat_messages (room_id, sender_id, receiver_id, message)
                 VALUES (?, ?, ?, ?)`,
                [`${req.user.id}_${receiverId}`, req.user.id, receiverId, message]
            );
            
            res.status(201).json({
                success: true,
                messageId: result.lastID
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    async getConversations(req, res) {
        try {
            const conversations = await db.all(
                `SELECT DISTINCT 
                    u.id, u.first_name, u.last_name, u.profile_image,
                    (SELECT message FROM chat_messages 
                     WHERE (sender_id = u.id OR receiver_id = u.id) 
                     ORDER BY created_at DESC LIMIT 1) as last_message,
                    (SELECT created_at FROM chat_messages 
                     WHERE (sender_id = u.id OR receiver_id = u.id) 
                     ORDER BY created_at DESC LIMIT 1) as last_message_time
                 FROM users u
                 WHERE u.id IN (
                     SELECT sender_id FROM chat_messages WHERE receiver_id = ?
                     UNION
                     SELECT receiver_id FROM chat_messages WHERE sender_id = ?
                 )`,
                [req.user.id, req.user.id]
            );
            
            res.json({ conversations });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = chatController;