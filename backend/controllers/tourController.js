// ========================================
// TOUR CONTROLLER (MySQL)
// ========================================

const { query } = require('../config/database');

// @desc    Get all tours
// @route   GET /api/tours
// @access  Public
exports.getTours = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    
    let sql = 'SELECT * FROM tours WHERE isActive = TRUE';
    const params = [];
    
    if (req.query.category) {
        sql += ' AND category = ?';
        params.push(req.query.category);
    }
    
    if (req.query.featured === 'true') {
        sql += ' AND featured = TRUE';
    }
    
    if (req.query.search) {
        sql += ' AND (name LIKE ? OR description LIKE ?)';
        params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }
    
    sql += ' ORDER BY featured DESC, rating DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const tours = await query(sql, params);
    
    const countSql = 'SELECT COUNT(*) as total FROM tours WHERE isActive = TRUE';
    const total = await query(countSql);
    
    res.json({
        success: true,
        count: tours.length,
        total: total[0].total,
        pagination: {
            page,
            limit,
            total: total[0].total,
            pages: Math.ceil(total[0].total / limit)
        },
        data: tours
    });
};

// @desc    Get tour by ID
// @route   GET /api/tours/:id
// @access  Public
exports.getTourById = async (req, res) => {
    const sql = 'SELECT * FROM tours WHERE id = ? AND isActive = TRUE';
    const tours = await query(sql, [req.params.id]);
    const tour = tours[0];
    
    if (!tour) {
        return res.status(404).json({
            success: false,
            message: 'Tour not found'
        });
    }
    
    res.json({
        success: true,
        data: tour
    });
};

// @desc    Create tour (Admin only)
// @route   POST /api/tours
// @access  Private/Admin
exports.createTour = async (req, res) => {
    const {
        name, slug, description, shortDescription, durationDays, durationNights,
        priceAdult, priceChild, priceInfant, groupMin, groupMax, category,
        difficulty, highlights, inclusions, exclusions, startLocation, endLocation,
        isActive, featured
    } = req.body;
    
    const sql = `
        INSERT INTO tours (
            name, slug, description, shortDescription, durationDays, durationNights,
            priceAdult, priceChild, priceInfant, groupMin, groupMax, category,
            difficulty, highlights, inclusions, exclusions, startLocation, endLocation,
            isActive, featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [
        name, slug, description, shortDescription, durationDays, durationNights,
        priceAdult, priceChild || null, priceInfant || null, groupMin || 1, groupMax,
        category, difficulty || 'moderate', JSON.stringify(highlights || []),
        JSON.stringify(inclusions || []), JSON.stringify(exclusions || []),
        startLocation, endLocation, isActive !== false, featured || false
    ]);
    
    res.status(201).json({
        success: true,
        message: 'Tour created successfully',
        data: { id: result.insertId }
    });
};

// @desc    Update tour (Admin only)
// @route   PUT /api/tours/:id
// @access  Private/Admin
exports.updateTour = async (req, res) => {
    const tour = await query('SELECT * FROM tours WHERE id = ?', [req.params.id]);
    if (!tour[0]) {
        return res.status(404).json({
            success: false,
            message: 'Tour not found'
        });
    }
    
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(req.body)) {
        if (value !== undefined) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    }
    values.push(req.params.id);
    
    await query(`UPDATE tours SET ${fields.join(', ')} WHERE id = ?`, values);
    
    res.json({
        success: true,
        message: 'Tour updated successfully'
    });
};

// @desc    Delete tour (Admin only)
// @route   DELETE /api/tours/:id
// @access  Private/Admin
exports.deleteTour = async (req, res) => {
    const tour = await query('SELECT * FROM tours WHERE id = ?', [req.params.id]);
    if (!tour[0]) {
        return res.status(404).json({
            success: false,
            message: 'Tour not found'
        });
    }
    
    await query('DELETE FROM tours WHERE id = ?', [req.params.id]);
    
    res.json({
        success: true,
        message: 'Tour deleted successfully'
    });
};

// @desc    Check tour availability
// @route   GET /api/tours/check-availability
// @access  Public
exports.checkAvailability = async (req, res) => {
    const { tourId, startDate, endDate } = req.query;
    
    const tour = await query('SELECT * FROM tours WHERE id = ?', [tourId]);
    if (!tour[0]) {
        return res.status(404).json({
            success: false,
            message: 'Tour not found'
        });
    }
    
    // Check if tour has available dates
    // This is simplified - you can expand based on your needs
    res.json({
        success: true,
        available: true
    });
};