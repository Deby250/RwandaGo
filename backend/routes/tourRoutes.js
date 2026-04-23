// ========================================
// TOUR ROUTES
// ========================================

const express = require('express');
const router = express.Router();
const {
    getTours,
    getTourById,
    createTour,
    updateTour,
    deleteTour,
    checkAvailability
} = require('../controllers/tourController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getTours);
router.get('/check-availability', checkAvailability);
router.get('/:id', getTourById);
router.post('/', protect, authorize('admin'), createTour);
router.put('/:id', protect, authorize('admin'), updateTour);
router.delete('/:id', protect, authorize('admin'), deleteTour);

module.exports = router;