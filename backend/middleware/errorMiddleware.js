// ========================================
// ERROR HANDLING MIDDLEWARE
// ========================================

const errorHandler = (err, req, res, next) => {
    console.error(err);
    
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = { errorHandler };