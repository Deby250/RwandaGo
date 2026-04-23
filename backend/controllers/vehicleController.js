// ========================================
// VEHICLE CONTROLLER
// ========================================

const Vehicle = require('../models/Vehicle');

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
exports.getVehicles = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const startIndex = (page - 1) * limit;
    
    let query = { isActive: true };
    
    if (req.query.category) query.category = req.query.category;
    if (req.query.transmission) query.transmission = req.query.transmission;
    if (req.query.search) query.name = { $regex: req.query.search, $options: 'i' };
    
    if (req.query.minPrice || req.query.maxPrice) {
        query.pricePerDay = {};
        if (req.query.minPrice) query.pricePerDay.$gte = parseInt(req.query.minPrice);
        if (req.query.maxPrice) query.pricePerDay.$lte = parseInt(req.query.maxPrice);
    }
    
    const total = await Vehicle.countDocuments(query);
    const vehicles = await Vehicle.find(query)
        .sort('-createdAt')
        .limit(limit)
        .skip(startIndex);
    
    res.json({
        success: true,
        count: vehicles.length,
        total,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        data: vehicles
    });
};

// @desc    Get available vehicles
// @route   GET /api/vehicles/available
// @access  Public
exports.getAvailableVehicles = async (req, res) => {
    const { startDate, endDate, category } = req.query;
    
    if (!startDate || !endDate) {
        return res.status(400).json({
            success: false,
            message: 'Start date and end date are required'
        });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let query = { isActive: true, status: 'available' };
    if (category) query.category = category;
    
    const vehicles = await Vehicle.find(query);
    
    const availableVehicles = [];
    for (const vehicle of vehicles) {
        const isAvailable = await vehicle.isAvailable(start, end);
        if (isAvailable) availableVehicles.push(vehicle);
    }
    
    res.json({
        success: true,
        count: availableVehicles.length,
        data: availableVehicles
    });
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
exports.getVehicleById = async (req, res) => {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
        return res.status(404).json({
            success: false,
            message: 'Vehicle not found'
        });
    }
    
    res.json({
        success: true,
        data: vehicle
    });
};

// @desc    Create vehicle (Admin only)
// @route   POST /api/vehicles
// @access  Private/Admin
exports.createVehicle = async (req, res) => {
    const vehicle = await Vehicle.create(req.body);
    
    res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        data: vehicle
    });
};

// @desc    Update vehicle (Admin only)
// @route   PUT /api/vehicles/:id
// @access  Private/Admin
exports.updateVehicle = async (req, res) => {
    let vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
        return res.status(404).json({
            success: false,
            message: 'Vehicle not found'
        });
    }
    
    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    
    res.json({
        success: true,
        message: 'Vehicle updated successfully',
        data: vehicle
    });
};

// @desc    Delete vehicle (Admin only)
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
exports.deleteVehicle = async (req, res) => {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
        return res.status(404).json({
            success: false,
            message: 'Vehicle not found'
        });
    }
    
    await vehicle.deleteOne();
    
    res.json({
        success: true,
        message: 'Vehicle deleted successfully'
    });
};