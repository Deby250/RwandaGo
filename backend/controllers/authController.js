// ========================================
// AUTH CONTROLLER (MySQL) - FIXED VERSION
// ========================================

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    const { firstName, lastName, email, password, phone, role } = req.body;
    
    console.log('📝 Registration attempt:', { email, firstName, lastName });
    
    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'User already exists with this email'
        });
    }
    
    // Create user
    const user = await User.create({
        firstName, lastName, email, password, phone, role: role || 'tourist'
    });
    
    console.log('✅ User created:', { id: user.id, email: user.email });
    
    const token = generateToken(user.id, user.role);
    
    res.status(201).json({
        success: true,
        message: 'User created successfully',
        token,
        user: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
            phone: user.phone
        }
    });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt:', { email });
    
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }
    
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
        console.log('❌ User not found:', email);
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
        });
    }
    
    console.log('✅ User found:', { id: user.id, email: user.email, role: user.role });
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔑 Password match:', isMatch);
    
    if (!isMatch) {
        console.log('❌ Password mismatch for:', email);
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
        });
    }
    
    // Check if active
    if (!user.isActive) {
        return res.status(401).json({
            success: false,
            message: 'Your account has been deactivated'
        });
    }
    
    // Update last login
    await User.updateLastLogin(user.id);
    
    // Generate token
    const token = generateToken(user.id, user.role);
    
    console.log('✅ Login successful for:', email);
    
    res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
            phone: user.phone
        }
    });
};

exports.getMe = async (req, res) => {
    const user = await User.findById(req.user.id);
    
    res.json({
        success: true,
        user: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            passportNumber: user.passportNumber,
            nationality: user.nationality
        }
    });
};

exports.updateProfile = async (req, res) => {
    const updates = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        passportNumber: req.body.passportNumber,
        nationality: req.body.nationality
    };
    
    const user = await User.update(req.user.id, updates);
    
    res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
            phone: user.phone
        }
    });
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findByEmail(req.user.email);
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Current password is incorrect'
        });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(req.user.id, { password: hashedPassword });
    
    res.json({
        success: true,
        message: 'Password changed successfully'
    });
};