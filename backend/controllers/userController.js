// ========================================
// USER CONTROLLER (MySQL)
// ========================================

const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const users = await User.findAll(limit, (page - 1) * limit);
    const total = await User.count();
    
    res.json({
        success: true,
        count: users.length,
        total,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: users
    });
};

// @desc    Get single user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }
    
    res.json({
        success: true,
        data: user
    });
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    const { firstName, lastName, phone, passportNumber, nationality, role, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }
    
    const updates = {
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        phone: phone || user.phone,
        passportNumber: passportNumber || user.passportNumber,
        nationality: nationality || user.nationality,
        role: role || user.role,
        isActive: isActive !== undefined ? isActive : user.isActive
    };
    
    const updatedUser = await User.update(req.params.id, updates);
    
    res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
    });
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }
    
    await User.delete(req.params.id);
    
    res.json({
        success: true,
        message: 'User deleted successfully'
    });
};

// @desc    Toggle user active status (Admin only)
// @route   PATCH /api/users/:id/toggle-status
// @access  Private/Admin
exports.toggleUserStatus = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }
    
    const updatedUser = await User.update(req.params.id, { isActive: !user.isActive });
    
    res.json({
        success: true,
        message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
        data: { isActive: updatedUser.isActive }
    });
};

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats
// @access  Private/Admin
exports.getUserStats = async (req, res) => {
    const { query } = require('../config/database');
    
    const totalUsers = await query('SELECT COUNT(*) as count FROM users');
    const activeUsers = await query('SELECT COUNT(*) as count FROM users WHERE isActive = TRUE');
    const tourists = await query('SELECT COUNT(*) as count FROM users WHERE role = "tourist"');
    const admins = await query('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
    const support = await query('SELECT COUNT(*) as count FROM users WHERE role = "support"');
    const drivers = await query('SELECT COUNT(*) as count FROM users WHERE role = "driver"');
    
    const recentUsers = await query(
        'SELECT id, firstName, lastName, email, role, createdAt FROM users ORDER BY createdAt DESC LIMIT 5'
    );
    
    res.json({
        success: true,
        data: {
            total: totalUsers[0].count,
            active: activeUsers[0].count,
            byRole: {
                tourist: tourists[0].count,
                admin: admins[0].count,
                support: support[0].count,
                driver: drivers[0].count
            },
            recent: recentUsers
        }
    });
};