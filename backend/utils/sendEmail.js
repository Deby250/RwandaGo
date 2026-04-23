// ========================================
// EMAIL UTILITY
// ========================================

const nodemailer = require('nodemailer');

// Create transporter (configure with your email service)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
    }
});

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email body (HTML)
 * @param {string} options.text - Email body (plain text)
 */
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@rwandago.com',
            to,
            subject,
            html: html || undefined,
            text: text || undefined
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
};

/**
 * Send booking confirmation email
 */
const sendBookingConfirmation = async (user, booking) => {
    const subject = 'Booking Confirmation - RwandaGo';
    const html = `
        <h2>Booking Confirmed!</h2>
        <p>Dear ${user.firstName},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <ul>
            <li>Booking Number: ${booking.booking_number}</li>
            <li>Start Date: ${booking.start_date}</li>
            <li>End Date: ${booking.end_date}</li>
            <li>Total Amount: $${booking.total_amount}</li>
        </ul>
        <p>Thank you for choosing RwandaGo!</p>
    `;
    
    return sendEmail({ to: user.email, subject, html });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
    const subject = 'Password Reset - RwandaGo';
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const html = `
        <h2>Password Reset Request</h2>
        <p>Dear ${user.firstName},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
    `;
    
    return sendEmail({ to: user.email, subject, html });
};

module.exports = {
    sendEmail,
    sendBookingConfirmation,
    sendPasswordResetEmail
};