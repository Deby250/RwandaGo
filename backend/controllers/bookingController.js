// ========================================
// BOOKING CONTROLLER (MySQL)
// ========================================

const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

// Calculate price helper
const calculatePrice = (vehicle, startDate, endDate, extras) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    const basePrice = vehicle.price_per_day * days;
    
    let extrasTotal = 0;
    if (extras) {
        extras.forEach(extra => {
            extrasTotal += extra.price * days;
        });
    }
    
    const totalAmount = basePrice + extrasTotal;
    const depositAmount = totalAmount * 0.2;
    const remainingAmount = totalAmount - depositAmount;
    
    return { basePrice, extrasTotal, totalAmount, depositAmount, remainingAmount, days };
};

exports.createBooking = async (req, res) => {
    const { vehicleId, startDate, endDate, pickupLocation, returnLocation, extras, specialRequests } = req.body;
    
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
        return res.status(404).json({
            success: false,
            message: 'Vehicle not found'
        });
    }
    
    const isAvailable = await Vehicle.checkAvailability(vehicleId, startDate, endDate);
    if (!isAvailable) {
        return res.status(400).json({
            success: false,
            message: 'Vehicle is not available for selected dates'
        });
    }
    
    const { basePrice, extrasTotal, totalAmount, depositAmount, remainingAmount, days } = 
        calculatePrice(vehicle, startDate, endDate, extras);
    
    const booking = await Booking.create({
        userId: req.user.id,
        vehicleId,
        startDate,
        endDate,
        pickupLocation,
        returnLocation,
        durationDays: days,
        durationHours: 0,
        basePrice,
        extras: extras || [],
        extrasTotal,
        totalAmount,
        depositAmount,
        remainingAmount,
        specialRequests
    });
    
    res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking
    });
};

exports.getMyBookings = async (req, res) => {
    const bookings = await Booking.findByUser(req.user.id);
    
    res.json({
        success: true,
        count: bookings.length,
        data: bookings
    });
};

exports.getBookingById = async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }
    
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized'
        });
    }
    
    res.json({
        success: true,
        data: booking
    });
};

exports.cancelBooking = async (req, res) => {
    const { reason } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }
    
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized'
        });
    }
    
    const isCancellable = await Booking.isCancellable(req.params.id);
    if (!isCancellable) {
        return res.status(400).json({
            success: false,
            message: 'Booking cannot be cancelled less than 24 hours before pickup'
        });
    }
    
    const cancelledBooking = await Booking.cancel(req.params.id, reason);
    
    res.json({
        success: true,
        message: 'Booking cancelled successfully',
        data: cancelledBooking
    });
};

exports.getAllBookings = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {};
    
    if (req.query.status) filters.status = req.query.status;
    
    const result = await Booking.findAll(filters, page, limit);
    
    res.json({
        success: true,
        data: result.data,
        pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            pages: result.pages
        }
    });
};

exports.updateBookingStatus = async (req, res) => {
    const { status } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }
    
    const updatedBooking = await Booking.updateStatus(req.params.id, status);
    
    res.json({
        success: true,
        message: `Booking ${status} successfully`,
        data: updatedBooking
    });
};