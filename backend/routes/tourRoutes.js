const express = require('express');
const tourController = require('../controllers/tourController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', tourController.getAllTours);
router.get('/:id', tourController.getTour);
router.post('/:id/book', authenticateToken, tourController.bookTour);

module.exports = router;