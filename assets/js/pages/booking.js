// ========================================
// RWANDAGO - BOOKING PAGE FUNCTIONALITY
// Handles booking confirmation, payment, and cancellation
// ========================================

class BookingPage {
    constructor() {
        this.booking = null;
        this.payment = null;
        this.init();
    }

    async init() {
        this.checkAuthentication();
        await this.loadBookingData();
        this.setupEventListeners();
        this.initPaymentForm();
    }

    checkAuthentication() {
        const user = sessionStorage.getItem('rwandago_user') || localStorage.getItem('rwandago_user');
        if (!user) {
            // Save current URL to redirect back after login
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
            window.location.href = '../login.html';
            return;
        }
        this.currentUser = JSON.parse(user);
    }

    async loadBookingData() {
        // Get booking ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const bookingId = urlParams.get('id');
        
        if (bookingId) {
            await this.fetchBookingDetails(bookingId);
        } else {
            // Check for session storage
            const savedBooking = sessionStorage.getItem('currentBooking');
            if (savedBooking) {
                this.booking = JSON.parse(savedBooking);
                this.displayBookingDetails();
            } else {
                // Mock booking data for demo
                this.booking = {
                    id: 'BK' + Date.now(),
                    bookingNumber: 'BK' + new Date().getFullYear() + Math.floor(Math.random() * 10000),
                    vehicle: {
                        name: 'Toyota RAV4',
                        image: '🚙',
                        pricePerDay: 55
                    },
                    startDate: '2024-12-01 10:00',
                    endDate: '2024-12-05 10:00',
                    duration: { days: 4, hours: 0 },
                    pickupLocation: 'Kigali International Airport',
                    returnLocation: 'Kigali International Airport',
                    basePrice: 220,
                    extras: [
                        { name: 'GPS Navigation', price: 40 },
                        { name: 'Premium Insurance', price: 60 }
                    ],
                    extrasTotal: 100,
                    totalAmount: 320,
                    depositAmount: 64,
                    remainingAmount: 256,
                    status: 'pending',
                    paymentStatus: 'pending'
                };
                this.displayBookingDetails();
            }
        }
    }

    async fetchBookingDetails(bookingId) {
        // In production, fetch from API
        // const response = await fetch(`/api/bookings/${bookingId}`);
        // this.booking = await response.json();
        
        // Mock data for demo
        this.booking = {
            id: bookingId,
            bookingNumber: 'BK202412001234',
            vehicle: {
                name: 'Toyota RAV4',
                image: '🚙',
                pricePerDay: 55
            },
            startDate: '2024-12-01 10:00',
            endDate: '2024-12-05 10:00',
            duration: { days: 4, hours: 0 },
            pickupLocation: 'Kigali International Airport',
            returnLocation: 'Kigali International Airport',
            basePrice: 220,
            extras: [
                { name: 'GPS Navigation', price: 40 },
                { name: 'Professional Guide', price: 200 },
                { name: 'Premium Insurance', price: 60 }
            ],
            extrasTotal: 300,
            totalAmount: 520,
            depositAmount: 104,
            remainingAmount: 416,
            status: 'pending',
            paymentStatus: 'pending'
        };
        
        this.displayBookingDetails();
    }

    displayBookingDetails() {
        const container = document.getElementById('bookingDetails');
        if (!container) return;
        
        container.innerHTML = `
            <div class="booking-summary">
                <div class="booking-header">
                    <h3>Booking #${this.booking.bookingNumber}</h3>
                    <span class="status-badge status-${this.booking.status}">${this.booking.status}</span>
                </div>
                
                <div class="booking-vehicle">
                    <div class="vehicle-icon">${this.booking.vehicle.image}</div>
                    <div class="vehicle-info">
                        <h4>${this.booking.vehicle.name}</h4>
                        <p>$${this.booking.vehicle.pricePerDay} / day</p>
                    </div>
                </div>
                
                <div class="booking-dates">
                    <div class="date-item">
                        <i class="fas fa-calendar-alt"></i>
                        <div>
                            <small>Pickup</small>
                            <strong>${this.formatDate(this.booking.startDate)}</strong>
                            <p>${this.booking.pickupLocation}</p>
                        </div>
                    </div>
                    <div class="date-item">
                        <i class="fas fa-calendar-check"></i>
                        <div>
                            <small>Return</small>
                            <strong>${this.formatDate(this.booking.endDate)}</strong>
                            <p>${this.booking.returnLocation}</p>
                        </div>
                    </div>
                </div>
                
                <div class="price-breakdown">
                    <h4>Price Breakdown</h4>
                    <div class="price-row">
                        <span>Car Rental (${this.booking.duration.days} days)</span>
                        <span>$${this.booking.basePrice}</span>
                    </div>
                    ${this.booking.extras.map(extra => `
                        <div class="price-row">
                            <span>${extra.name}</span>
                            <span>$${extra.price}</span>
                        </div>
                    `).join('')}
                    <div class="price-row total">
                        <span><strong>Total Amount</strong></span>
                        <span><strong>$${this.booking.totalAmount}</strong></span>
                    </div>
                    <div class="price-row deposit">
                        <span>Deposit (20%)</span>
                        <span>$${this.booking.depositAmount}</span>
                    </div>
                    <div class="price-row remaining">
                        <span>Remaining due at pickup</span>
                        <span>$${this.booking.remainingAmount}</span>
                    </div>
                </div>
            </div>
        `;
        
        this.updatePaymentStatus();
    }

    updatePaymentStatus() {
        const statusContainer = document.getElementById('paymentStatus');
        if (!statusContainer) return;
        
        if (this.booking.paymentStatus === 'paid' || this.booking.depositPaid) {
            statusContainer.innerHTML = `
                <div class="payment-success">
                    <i class="fas fa-check-circle"></i>
                    <h3>Payment Confirmed!</h3>
                    <p>Your deposit of $${this.booking.depositAmount} has been received.</p>
                    <p>A confirmation email has been sent to your registered email address.</p>
                    <button class="btn-primary" onclick="window.location.href='../dashboard/tourist/active-trip.html'">
                        View My Trip
                    </button>
                </div>
            `;
        } else if (this.booking.paymentStatus === 'failed') {
            statusContainer.innerHTML = `
                <div class="payment-failed">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Payment Failed</h3>
                    <p>We couldn't process your payment. Please try again.</p>
                    <button class="btn-primary" onclick="bookingPage.retryPayment()">
                        Retry Payment
                    </button>
                </div>
            `;
        }
    }

    initPaymentForm() {
        const paymentForm = document.getElementById('paymentForm');
        if (!paymentForm) return;
        
        // Set minimum date for card expiry
        const expiryInput = document.getElementById('cardExpiry');
        if (expiryInput) {
            const today = new Date();
            const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            expiryInput.min = minDate;
        }
        
        // Format card number input
        const cardNumberInput = document.getElementById('cardNumber');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{4})/g, '$1 ').trim();
                e.target.value = value.substring(0, 19);
            });
        }
        
        // Format expiry date
        if (expiryInput) {
            expiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2);
                }
                e.target.value = value.substring(0, 5);
            });
        }
        
        // Format CVV
        const cvvInput = document.getElementById('cardCvv');
        if (cvvInput) {
            cvvInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
            });
        }
    }

    async processPayment(e) {
        e.preventDefault();
        
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
        
        if (!paymentMethod) {
            this.showNotification('Please select a payment method', 'error');
            return;
        }
        
        if (paymentMethod === 'credit_card') {
            const cardName = document.getElementById('cardName')?.value;
            const cardNumber = document.getElementById('cardNumber')?.value;
            const cardExpiry = document.getElementById('cardExpiry')?.value;
            const cardCvv = document.getElementById('cardCvv')?.value;
            
            if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
                this.showNotification('Please fill in all card details', 'error');
                return;
            }
            
            if (cardNumber.replace(/\s/g, '').length < 16) {
                this.showNotification('Please enter a valid card number', 'error');
                return;
            }
            
            if (cardCvv.length < 3) {
                this.showNotification('Please enter a valid CVV', 'error');
                return;
            }
        }
        
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        this.setLoading(submitBtn, true);
        
        // Simulate payment processing
        setTimeout(() => {
            // Random success/failure for demo (90% success rate)
            const isSuccess = Math.random() < 0.9;
            
            if (isSuccess) {
                this.booking.paymentStatus = 'paid';
                this.booking.depositPaid = true;
                this.booking.status = 'confirmed';
                
                // Save to session storage
                sessionStorage.setItem('currentBooking', JSON.stringify(this.booking));
                
                this.showNotification('Payment successful! Redirecting to confirmation...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'booking-confirmation.html';
                }, 1500);
            } else {
                this.booking.paymentStatus = 'failed';
                this.showNotification('Payment failed. Please try again.', 'error');
                this.updatePaymentStatus();
                this.setLoading(submitBtn, false);
            }
        }, 2000);
    }

    async cancelBooking() {
        if (confirm('Are you sure you want to cancel this booking?')) {
            const cancellationReason = prompt('Please provide a reason for cancellation (optional):');
            
            this.showNotification('Cancelling booking...', 'info');
            
            // Simulate API call
            setTimeout(() => {
                this.booking.status = 'cancelled';
                this.booking.paymentStatus = 'refunded';
                
                this.showNotification('Booking cancelled successfully. Refund will be processed within 5-7 business days.', 'success');
                
                setTimeout(() => {
                    window.location.href = 'booking-cancelled.html';
                }, 2000);
            }, 1000);
        }
    }

    retryPayment() {
        window.location.reload();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    setLoading(button, isLoading) {
        if (button) {
            if (isLoading) {
                button.disabled = true;
                button.dataset.originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            } else {
                button.disabled = false;
                button.innerHTML = button.dataset.originalText || 'Pay Now';
            }
        }
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i><span>${message}</span>`;
        document.body.appendChild(notification);
        
        // Add styles if not present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 10000;
                    animation: slideInRight 0.3s ease;
                    border-left: 4px solid;
                }
                .notification-success { border-left-color: #27ae60; }
                .notification-error { border-left-color: #e74c3c; }
                .notification-info { border-left-color: #e67e22; }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => notification.remove(), 3000);
    }

    setupEventListeners() {
        // Payment form submission
        const paymentForm = document.getElementById('paymentForm');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => this.processPayment(e));
        }
        
        // Cancel booking button
        const cancelBtn = document.getElementById('cancelBookingBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelBooking());
        }
        
        // Payment method selection
        const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
        paymentMethods.forEach(method => {
            method.addEventListener('change', () => {
                const creditCardForm = document.getElementById('creditCardForm');
                if (creditCardForm) {
                    creditCardForm.style.display = method.value === 'credit_card' ? 'block' : 'none';
                }
            });
        });
        
        // Print booking details
        const printBtn = document.getElementById('printBookingBtn');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }
        
        // Download invoice
        const downloadBtn = document.getElementById('downloadInvoiceBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadInvoice();
            });
        }
    }

    downloadInvoice() {
        // Create invoice HTML
        const invoiceHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${this.booking.bookingNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .invoice-details { margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    .total { font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>RwandaGo Invoice</h1>
                    <p>Booking #${this.booking.bookingNumber}</p>
                </div>
                <div class="invoice-details">
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Customer:</strong> ${this.currentUser?.name || 'N/A'}</p>
                </div>
                <table>
                    <tr><th>Description</th><th>Amount</th></tr>
                    <tr><td>Car Rental (${this.booking.duration.days} days)</td><td>$${this.booking.basePrice}</td></tr>
                    ${this.booking.extras.map(extra => `<tr><td>${extra.name}</td><td>$${extra.price}</td></tr>`).join('')}
                    <tr class="total"><td><strong>Total</strong></td><td><strong>$${this.booking.totalAmount}</strong></td></tr>
                    <tr><td>Deposit Paid</td><td>$${this.booking.depositAmount}</td></tr>
                    <tr><td>Remaining Balance</td><td>$${this.booking.remainingAmount}</td></tr>
                </table>
                <p style="margin-top: 30px;">Thank you for choosing RwandaGo!</p>
            </body>
            </html>
        `;
        
        // Create blob and download
        const blob = new Blob([invoiceHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${this.booking.bookingNumber}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Invoice downloaded successfully', 'success');
    }
}

// Initialize booking page
let bookingPage;
document.addEventListener('DOMContentLoaded', () => {
    bookingPage = new BookingPage();
    window.bookingPage = bookingPage;
});