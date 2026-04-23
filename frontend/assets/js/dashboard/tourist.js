// ========================================
// TOURIST DASHBOARD - COMPLETE LOGIC
// Handles all tourist dashboard functionality
// ========================================

class TouristDashboard {
    constructor() {
        this.currentUser = null;
        this.bookings = [];
        this.vehicles = [];
        this.tours = [];
        this.currentPage = 'overview';
        this.init();
    }

    async init() {
        // Check authentication
        if (!this.checkAuth()) return;
        
        // Load user data
        await this.loadUserData();
        
        // Load initial data
        await this.loadDashboardData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial page
        this.loadPageFromUrl();
    }

    checkAuth() {
        const user = sessionStorage.getItem('rwandago_user') || localStorage.getItem('rwandago_user');
        if (!user) {
            window.location.href = '../../login.html';
            return false;
        }
        this.currentUser = JSON.parse(user);
        
        if (this.currentUser.role !== 'tourist') {
            alert('Access denied. Tourist portal only.');
            window.location.href = '../../index.html';
            return false;
        }
        return true;
    }

    async loadUserData() {
        document.getElementById('userName').textContent = this.currentUser.name || `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        document.getElementById('profileFirstName').value = this.currentUser.firstName || '';
        document.getElementById('profileLastName').value = this.currentUser.lastName || '';
        document.getElementById('profileEmail').value = this.currentUser.email || '';
        document.getElementById('profilePhone').value = this.currentUser.phone || '';
        document.getElementById('profilePassport').value = this.currentUser.passport || '';
        document.getElementById('profileAddress').value = this.currentUser.address || '';
    }

    async loadDashboardData() {
        // Mock data - Replace with API calls
        this.bookings = [
            { id: 'BK001', type: 'car', car: 'Toyota RAV4', startDate: '2024-12-01 10:00', endDate: '2024-12-05 10:00', amount: 275, status: 'active', paymentStatus: 'paid', pickupLocation: 'Kigali Airport' },
            { id: 'BK002', type: 'car', car: 'Suzuki Jimny', startDate: '2024-11-15 09:00', endDate: '2024-11-18 09:00', amount: 135, status: 'completed', paymentStatus: 'paid' },
            { id: 'BK003', type: 'tour', tour: 'Volcanoes National Park', startDate: '2024-10-20 08:00', endDate: '2024-10-22 18:00', amount: 500, status: 'completed', paymentStatus: 'paid' }
        ];

        this.vehicles = [
            { id: 1, name: 'Toyota RAV4', category: 'SUV', seats: 5, price: 55, available: true },
            { id: 2, name: 'Suzuki Jimny', category: 'SUV', seats: 4, price: 45, available: true },
            { id: 3, name: 'Mitsubishi Pajero', category: 'SUV', seats: 7, price: 85, available: true },
            { id: 4, name: 'Hyundai i10', category: 'Economy', seats: 4, price: 30, available: true }
        ];

        this.updateStats();
        this.updateActiveBooking();
        this.updateRecentBookings();
        this.updateRecommendedTours();
        this.populateVehicleSelect();
    }

    updateStats() {
        const activeBookings = this.bookings.filter(b => b.status === 'active').length;
        const completedBookings = this.bookings.filter(b => b.status === 'completed').length;
        const totalSpent = this.bookings.reduce((sum, b) => sum + b.amount, 0);
        
        document.getElementById('activeBookings').textContent = activeBookings;
        document.getElementById('completedTours').textContent = completedBookings;
        document.getElementById('totalHours').textContent = '48';
        document.getElementById('totalSpent').textContent = `$${totalSpent}`;
    }

    updateActiveBooking() {
        const activeBooking = this.bookings.find(b => b.status === 'active');
        const container = document.getElementById('activeBookingContent');
        
        if (activeBooking) {
            container.innerHTML = `
                <div class="active-trip-card">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3>${activeBooking.car || activeBooking.tour}</h3>
                        <span class="status-badge status-active">Active</span>
                    </div>
                    <div class="trip-info">
                        <div class="trip-info-item"><i class="fas fa-calendar-alt"></i><div><small>Pickup</small><div><strong>${activeBooking.startDate}</strong></div></div></div>
                        <div class="trip-info-item"><i class="fas fa-calendar-check"></i><div><small>Return</small><div><strong>${activeBooking.endDate}</strong></div></div></div>
                        <div class="trip-info-item"><i class="fas fa-map-marker-alt"></i><div><small>Location</small><div><strong>${activeBooking.pickupLocation || 'Kigali'}</strong></div></div></div>
                    </div>
                    <div class="trip-progress"><div class="progress-label"><span>Trip Progress</span><span>2 of 5 days</span></div><div class="progress-bar"><div class="progress-fill" style="width: 40%"></div></div></div>
                </div>
            `;
        } else {
            container.innerHTML = `<div class="text-center" style="padding: 2rem;"><i class="fas fa-car" style="font-size: 3rem; color: var(--gray);"></i><p>No active bookings</p><button class="btn-primary-sm" data-page="new-booking">Book a Vehicle</button></div>`;
        }
    }

    updateRecentBookings() {
        const recentBookings = this.bookings.slice(0, 5);
        const tbody = document.getElementById('recentBookingsList');
        if (recentBookings.length === 0) { tbody.innerHTML = '<tr><td colspan="7" class="text-center">No bookings found</td></tr>'; return; }
        tbody.innerHTML = recentBookings.map(booking => `
            <tr><td>${booking.id}</td><td>${booking.car || booking.tour || '-'}</td><td>${booking.startDate}</td><td>${booking.endDate}</td><td>$${booking.amount}</td>
            <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
            <td><button class="btn-sm btn-outline view-booking" data-id="${booking.id}">View</button></td></tr>
        `).join('');
        document.querySelectorAll('.view-booking').forEach(btn => btn.addEventListener('click', () => this.viewBookingDetails(btn.dataset.id)));
    }

    updateRecommendedTours() {
        const tours = [
            { id: 1, name: 'Volcanoes National Park', description: 'Gorilla trekking adventure', price: 500, image: '🏔️' },
            { id: 2, name: 'Nyungwe Forest Canopy', description: 'Walk among the treetops', price: 350, image: '🌳' },
            { id: 3, name: 'Lake Kivu Escape', description: 'Relaxing lakeside retreat', price: 450, image: '💧' }
        ];
        const container = document.getElementById('recommendedTours');
        container.innerHTML = tours.map(tour => `
            <div class="tour-suggestion" data-tour-id="${tour.id}"><div class="tour-suggestion-icon">${tour.image}</div>
            <div class="tour-suggestion-content"><h4>${tour.name}</h4><p>${tour.description}</p><div class="tour-price">$${tour.price}</div></div></div>
        `).join('');
        document.querySelectorAll('.tour-suggestion').forEach(el => el.addEventListener('click', () => window.location.href = 'tours.html'));
    }

    populateVehicleSelect() {
        const select = document.getElementById('vehicleSelect');
        if (!select) return;
        select.innerHTML = '<option value="">Choose a vehicle...</option>' + 
            this.vehicles.map(vehicle => `<option value="${vehicle.id}" data-price="${vehicle.price}">${vehicle.name} - ${vehicle.category} (${vehicle.seats} seats) - $${vehicle.price}/day</option>`).join('');
        select.addEventListener('change', () => this.updatePriceSummary());
    }

    updatePriceSummary() {
        const vehicleSelect = document.getElementById('vehicleSelect');
        const pickupDate = document.getElementById('pickupDate')?.value;
        const returnDate = document.getElementById('returnDate')?.value;
        if (!vehicleSelect?.value || !pickupDate || !returnDate) return;
        
        const vehicle = this.vehicles.find(v => v.id == vehicleSelect.value);
        if (!vehicle) return;
        
        const days = Math.ceil((new Date(returnDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24));
        if (days <= 0) return;
        
        const gps = document.getElementById('gpsService')?.checked ? 10 : 0;
        const guide = document.getElementById('guideService')?.checked ? 50 : 0;
        const insurance = document.getElementById('insuranceService')?.checked ? 15 : 0;
        
        const carTotal = vehicle.price * days;
        const extrasTotal = (gps + guide + insurance) * days;
        const total = carTotal + extrasTotal;
        const deposit = total * 0.2;
        
        document.getElementById('carPrice').textContent = `$${carTotal}`;
        let extrasHtml = '';
        if (gps > 0) extrasHtml += `<div class="price-details"><span>GPS Navigation:</span><span>$${gps * days}</span></div>`;
        if (guide > 0) extrasHtml += `<div class="price-details"><span>Professional Guide:</span><span>$${guide * days}</span></div>`;
        if (insurance > 0) extrasHtml += `<div class="price-details"><span>Premium Insurance:</span><span>$${insurance * days}</span></div>`;
        document.getElementById('extrasSummary').innerHTML = extrasHtml;
        document.getElementById('totalPrice').textContent = `$${total}`;
        document.getElementById('depositAmount').textContent = `$${deposit.toFixed(2)}`;
    }

    updateAllBookings() {
        const tbody = document.getElementById('allBookingsList');
        if (this.bookings.length === 0) { tbody.innerHTML = '<tr><td colspan="8" class="text-center">No bookings found</td></tr>'; return; }
        tbody.innerHTML = this.bookings.map(booking => `
            <tr><td>${booking.id}</td><td>${booking.car || booking.tour || '-'}</td><td>${booking.startDate}</td><td>${booking.endDate}</td>
            <td>$${booking.amount}</td><td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
            <td><span class="status-badge status-${booking.paymentStatus}">${booking.paymentStatus}</span></td>
            <td><button class="btn-sm btn-outline view-booking" data-id="${booking.id}">Details</button></td></tr>
        `).join('');
        document.querySelectorAll('.view-booking').forEach(btn => btn.addEventListener('click', () => this.viewBookingDetails(btn.dataset.id)));
    }

    viewBookingDetails(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (!booking) return;
        const modal = document.getElementById('bookingModal');
        const body = document.getElementById('bookingModalBody');
        body.innerHTML = `<div class="booking-details"><p><strong>Booking ID:</strong> ${booking.id}</p><p><strong>Type:</strong> ${booking.type === 'car' ? 'Car Rental' : 'Tour Package'}</p>
            <p><strong>Item:</strong> ${booking.car || booking.tour}</p><p><strong>Start Date:</strong> ${booking.startDate}</p><p><strong>End Date:</strong> ${booking.endDate}</p>
            <p><strong>Amount:</strong> $${booking.amount}</p><p><strong>Status:</strong> <span class="status-badge status-${booking.status}">${booking.status}</span></p>
            <p><strong>Payment Status:</strong> <span class="status-badge status-${booking.paymentStatus}">${booking.paymentStatus}</span></p></div>`;
        modal.style.display = 'flex';
        const cancelBtn = document.getElementById('cancelBookingBtn');
        if (booking.status === 'active') { cancelBtn.style.display = 'block'; cancelBtn.onclick = () => this.cancelBooking(booking.id); }
        else cancelBtn.style.display = 'none';
    }

    cancelBooking(bookingId) {
        if (confirm('Are you sure you want to cancel this booking?')) {
            const index = this.bookings.findIndex(b => b.id === bookingId);
            if (index !== -1) { this.bookings[index].status = 'cancelled'; this.bookings[index].paymentStatus = 'refunded'; this.updateStats(); this.updateRecentBookings(); this.updateAllBookings(); }
            document.getElementById('bookingModal').style.display = 'none';
            this.showNotification('Booking cancelled successfully', 'success');
        }
    }

    async handleNewBooking(e) {
        e.preventDefault();
        const pickupDate = document.getElementById('pickupDate')?.value;
        const returnDate = document.getElementById('returnDate')?.value;
        const pickupLocation = document.getElementById('pickupLocation')?.value;
        const returnLocation = document.getElementById('returnLocation')?.value;
        const vehicleId = document.getElementById('vehicleSelect')?.value;
        
        if (!pickupDate || !returnDate || !pickupLocation || !returnLocation || !vehicleId) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        const vehicle = this.vehicles.find(v => v.id == vehicleId);
        if (!vehicle) return;
        const days = Math.ceil((new Date(returnDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24));
        if (days <= 0) { this.showNotification('Return date must be after pickup date', 'error'); return; }
        
        this.showNotification('Booking created! Redirecting to payment...', 'success');
        setTimeout(() => window.location.href = '../../payment.html', 1500);
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i><span>${message}</span>`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    loadPageFromUrl() {
        const hash = window.location.hash.substring(1);
        const page = hash || 'overview';
        this.showPage(page);
    }

    showPage(pageName) {
        document.querySelectorAll('.page-content').forEach(page => page.style.display = 'none');
        const pageMap = { 'overview': 'overviewPage', 'bookings': 'bookingsPage', 'new-booking': 'newBookingPage', 'active-trip': 'activeTripPage', 'tours': 'toursPage', 'profile': 'profilePage', 'support': 'supportPage' };
        const pageId = pageMap[pageName];
        if (pageId) document.getElementById(pageId).style.display = 'block';
        
        const titles = { 'overview': 'Dashboard Overview', 'bookings': 'My Bookings', 'new-booking': 'New Booking', 'active-trip': 'Active Trip', 'tours': 'Tour Packages', 'profile': 'My Profile', 'support': 'Support Center' };
        document.getElementById('pageTitle').innerHTML = `<i class="fas ${this.getPageIcon(pageName)}"></i> ${titles[pageName] || 'Dashboard'}`;
        
        document.querySelectorAll('.sidebar-nav a').forEach(link => { link.classList.remove('active'); if (link.dataset.page === pageName) link.classList.add('active'); });
        if (pageName === 'bookings') this.updateAllBookings();
        else if (pageName === 'active-trip') this.updateActiveTripPage();
        this.currentPage = pageName;
        window.location.hash = pageName;
    }

    getPageIcon(pageName) {
        const icons = { 'overview': 'fa-tachometer-alt', 'bookings': 'fa-calendar-check', 'new-booking': 'fa-plus-circle', 'active-trip': 'fa-map-marked-alt', 'tours': 'fa-umbrella-beach', 'profile': 'fa-user', 'support': 'fa-headset' };
        return icons[pageName] || 'fa-dashboard';
    }

    updateActiveTripPage() {
        const activeBooking = this.bookings.find(b => b.status === 'active');
        const container = document.getElementById('activeTripContent');
        if (activeBooking) {
            container.innerHTML = `<div class="active-trip-card"><h3>${activeBooking.car || activeBooking.tour}</h3><div class="trip-info"><div><small>Pickup</small><div><strong>${activeBooking.startDate}</strong></div></div>
                <div><small>Return</small><div><strong>${activeBooking.endDate}</strong></div></div><div><small>Location</small><div><strong>${activeBooking.pickupLocation || 'Kigali'}</strong></div></div></div>
                <div class="trip-progress"><div class="progress-label"><span>Trip Progress</span><span>2 of 5 days</span></div><div class="progress-bar"><div class="progress-fill" style="width: 40%"></div></div></div></div>`;
        } else { container.innerHTML = '<div class="text-center"><p>No active trips</p><button class="btn-primary-sm" data-page="new-booking">Start a New Booking</button></div>'; }
    }

    setupEventListeners() {
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => { e.preventDefault(); const page = link.dataset.page; if (page) this.showPage(page); if (link.id === 'logoutBtn' || link.id === 'dropdownLogout') this.logout(); });
        });
        
        const userDropdown = document.getElementById('userDropdown');
        const dropdownMenu = document.getElementById('dropdownMenu');
        if (userDropdown) userDropdown.addEventListener('click', (e) => { e.stopPropagation(); dropdownMenu.classList.toggle('show'); });
        document.addEventListener('click', () => dropdownMenu?.classList.remove('show'));
        
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        if (menuToggle) menuToggle.addEventListener('click', () => sidebar.classList.toggle('active'));
        
        const bookingForm = document.getElementById('newBookingForm');
        if (bookingForm) bookingForm.addEventListener('submit', (e) => this.handleNewBooking(e));
        
        const editBtn = document.getElementById('editProfileBtn');
        const cancelBtn = document.getElementById('cancelEditBtn');
        if (editBtn) editBtn.addEventListener('click', () => this.toggleProfileEdit(true));
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.toggleProfileEdit(false));
        
        const profileForm = document.getElementById('profileForm');
        if (profileForm) profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        
        const passwordForm = document.getElementById('changePasswordForm');
        if (passwordForm) passwordForm.addEventListener('submit', (e) => this.handlePasswordChange(e));
        
        const ticketForm = document.getElementById('ticketForm');
        if (ticketForm) ticketForm.addEventListener('submit', (e) => this.handleTicketSubmit(e));
        
        const modalClose = document.querySelectorAll('.modal-close, .modal-close-btn');
        modalClose.forEach(el => el.addEventListener('click', () => document.getElementById('bookingModal')?.style.display = 'none'));
        
        window.addEventListener('hashchange', () => { const page = window.location.hash.substring(1) || 'overview'; this.showPage(page); });
    }

    toggleProfileEdit(editMode) {
        const inputs = ['profileFirstName', 'profileLastName', 'profilePhone', 'profilePassport', 'profileAddress'];
        const actions = document.getElementById('profileActions');
        inputs.forEach(id => { const input = document.getElementById(id); if (input) input.readOnly = !editMode; });
        if (actions) actions.style.display = editMode ? 'flex' : 'none';
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        this.currentUser.phone = document.getElementById('profilePhone').value;
        this.currentUser.passport = document.getElementById('profilePassport').value;
        this.currentUser.address = document.getElementById('profileAddress').value;
        const storage = localStorage.getItem('rwandago_user') ? localStorage : sessionStorage;
        storage.setItem('rwandago_user', JSON.stringify(this.currentUser));
        this.showNotification('Profile updated successfully!', 'success');
        this.toggleProfileEdit(false);
    }

    async handlePasswordChange(e) {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;
        if (newPassword !== confirmPassword) { this.showNotification('New passwords do not match', 'error'); return; }
        if (newPassword.length < 6) { this.showNotification('Password must be at least 6 characters', 'error'); return; }
        this.showNotification('Password changed successfully!', 'success');
        e.target.reset();
    }

    async handleTicketSubmit(e) {
        e.preventDefault();
        this.showNotification('Ticket submitted successfully! We\'ll respond within 24 hours.', 'success');
        e.target.reset();
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.clear();
            localStorage.removeItem('rwandago_user');
            localStorage.removeItem('rwandago_token');
            window.location.href = '../../login.html';
        }
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => { window.touristDashboard = new TouristDashboard(); });