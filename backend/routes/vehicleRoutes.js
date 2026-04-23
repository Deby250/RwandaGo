// ========================================
// VEHICLE ROUTES
// ========================================

const express = require('express');
const router = express.Router();
const {
    getVehicles,
    getAvailableVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getVehicles);
router.get('/available', getAvailableVehicles);
router.get('/:id', getVehicleById);
router.post('/', protect, authorize('admin'), createVehicle);
router.put('/:id', protect, authorize('admin'), updateVehicle);
router.delete('/:id', protect, authorize('admin'), deleteVehicle);

module.exports = router;