// ========================================
// HELPER FUNCTIONS
// ========================================

const moment = require('moment');

const formatDate = (date, format = 'YYYY-MM-DD HH:mm') => {
    return moment(date).format(format);
};

const calculateDaysBetween = (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);
    return end.diff(start, 'days');
};

const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
};

const generateRandomString = (length = 8) => {
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
};

const sanitizeUser = (user) => {
    return {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt
    };
};

module.exports = {
    formatDate,
    calculateDaysBetween,
    formatCurrency,
    generateRandomString,
    sanitizeUser
};