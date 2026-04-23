const express = require('express');
const emergencyController = require('../controllers/emergencyController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, emergencyController.reportEmergency);
router.get('/active', authenticateToken, requireRole(['admin', 'support']), emergencyController.getActiveEmergencies);
router.put('/:id/resolve', authenticateToken, requireRole(['admin', 'support']), emergencyController.resolveEmergency);

module.exports = router;