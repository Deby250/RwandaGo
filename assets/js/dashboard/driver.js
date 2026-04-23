// ========================================
// DRIVER DASHBOARD - COMPLETE LOGIC
// Handles all driver dashboard functionality
// ========================================

class DriverDashboard {
    constructor() {
        this.currentUser = null;
        this.assignments = [];
        this.earnings = [];
        this.vehicle = null;
        this.init();
    }

    async init() {
        if (!this.checkAuth()) return;
        await this.loadUserData();
        await this.loadDashboardData();
        this.setupEventListeners();
        this.loadPageFromUrl();
    }

    checkAuth() {
        const user = sessionStorage.getItem('rwandago_user') || localStorage.getItem('rwandago_user');
        if (!user) { window.location.href = '../../login.html'; return false; }
        this.currentUser = JSON.parse(user);
        if (this.currentUser.role !== 'driver') { alert('Access denied. Driver portal only.'); window.location.href = '../../index.html'; return false; }
        return true;
    }

    loadUserData() {
        document.getElementById('userName').textContent = this.currentUser.name || 'Driver';
        document.getElementById('profileFirstName').value = this.currentUser.firstName || '';
        document.getElementById('profileLastName').value = this.currentUser.lastName || '';
        document.getElementById('profileEmail').value = this.currentUser.email || '';
        document.getElementById('profilePhone').value = this.currentUser.phone || '';
        document.getElementById('profileLicense').value = this.currentUser.license || 'DL12345678';
    }

    async loadDashboardData() {
        this.assignments = [
            { id: 1, time: '09:00 AM', customer: 'Sarah Chen', pickup: 'Kigali Marriott', destination: 'Volcanoes NP', status: 'pending', distance: '120 km', estimatedTime: '2.5 hours' },
            { id: 2, time: '02:00 PM', customer: 'John Doe', pickup: 'Hotel des Mille Collines', destination: 'Kigali Airport', status: 'pending', distance: '15 km', estimatedTime: '30 min' }
        ];
        
        this.earnings = [
            { id: 1, date: 'Dec 1, 2024', trip: 'Kigali → Volcanoes NP', amount: 150, status: 'paid' },
            { id: 2, date: 'Nov 28, 2024', trip: 'Hotel → Airport', amount: 75, status: 'paid' },
            { id: 3, date: 'Nov 25, 2024', trip: 'Kigali → Lake Kivu', amount: 200, status: 'paid' }
        ];
        
        this.vehicle = {
            name: 'Toyota RAV4', year: 2023, color: 'White', transmission: 'Automatic',
            plate: 'RAB 123A', mileage: '15,234 km', fuelLevel: 75, nextService: '2,000 km',
            insuranceExpiry: 'Dec 31, 2025', status: 'active'
        };
        
        this.updateStats();
        this.loadAssignments();
        this.loadEarnings();
        this.loadVehicleInfo();
    }

    updateStats() {
        const totalEarnings = this.earnings.reduce((sum, e) => sum + e.amount, 0);
        const weeklyEarnings = this.earnings.filter(e => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(e.date) >= weekAgo;
        }).reduce((sum, e) => sum + e.amount, 0);
        const completedTrips = this.assignments.filter(a => a.status === 'completed').length + 45;
        const rating = 4.9;
        
        document.getElementById('totalEarnings').textContent = `$${totalEarnings}`;
        document.getElementById('weeklyEarnings').textContent = `$${weeklyEarnings}`;
        document.getElementById('completedTrips').textContent = completedTrips;
        document.getElementById('driverRating').textContent = rating;
    }

    loadAssignments(filter = 'all') {
        let filtered = [...this.assignments];
        if (filter !== 'all') filtered = filtered.filter(a => a.status === filter);
        
        const tbody = document.getElementById('assignmentsList');
        if (!tbody) return;
        if (filtered.length === 0) { tbody.innerHTML = '<tr><td colspan="6" class="text-center">No assignments found</td></tr>'; return; }
        tbody.innerHTML = filtered.map(a => `
            <tr>
                <td>${a.time}</td><td>${a.customer}</td><td>${a.pickup}</td><td>${a.destination}</td>
                <td><span class="assignment-status status-${a.status === 'in-progress' ? 'inprogress' : a.status}">${a.status}</span></td>
                <td><button class="action-btn" onclick="driverDashboard.updateAssignment(${a.id})">Update</button></td>
            </tr>
        `).join('');
    }

    loadEarnings() {
        const tbody = document.getElementById('earningsList');
        if (!tbody) return;
        if (this.earnings.length === 0) { tbody.innerHTML = '<tr><td colspan="4" class="text-center">No earnings found</td></tr>'; return; }
        tbody.innerHTML = this.earnings.map(e => `
            <tr><td>${e.date}</td><td>${e.trip}</td><td class="transaction-amount">+$${e.amount}</td><td>${e.status}</td></tr>
        `).join('');
    }

    loadVehicleInfo() {
        const container = document.getElementById('vehicleInfoContent');
        if (!container) return;
        container.innerHTML = `
            <div class="vehicle-detail"><div class="vehicle-image">🚙</div>
            <div class="vehicle-info"><h3>${this.vehicle.name}</h3><p>${this.vehicle.year} • ${this.vehicle.color} • ${this.vehicle.transmission}</p>
            <div class="info-grid"><div class="info-item"><label>Plate Number</label><br><value>${this.vehicle.plate}</value></div>
            <div class="info-item"><label>Current Mileage</label><br><value>${this.vehicle.mileage}</value></div>
            <div class="info-item"><label>Fuel Level</label><br><value>${this.vehicle.fuelLevel}%</value><div class="progress-bar"><div class="progress-fill" style="width:${this.vehicle.fuelLevel}%"></div></div></div>
            <div class="info-item"><label>Next Service</label><br><value>${this.vehicle.nextService}</value></div>
            <div class="info-item"><label>Insurance Expiry</label><br><value>${this.vehicle.insuranceExpiry}</value></div>
            <div class="info-item"><label>Status</label><br><value><span class="status-badge status-active">${this.vehicle.status}</span></value></div></div></div></div>
        `;
    }

    updateAssignment(id) {
        const assignment = this.assignments.find(a => a.id === id);
        if (assignment) {
            const newStatus = prompt('Update status (pending, in-progress, completed):', assignment.status);
            if (newStatus && ['pending', 'in-progress', 'completed'].includes(newStatus)) {
                assignment.status = newStatus;
                this.loadAssignments();
                this.showNotification(`Assignment ${id} updated to ${newStatus}`, 'success');
                if (newStatus === 'completed') {
                    this.earnings.unshift({ id: Date.now(), date: new Date().toLocaleDateString(), trip: `${assignment.pickup} → ${assignment.destination}`, amount: 100, status: 'pending' });
                    this.loadEarnings();
                    this.updateStats();
                }
            }
        }
    }

    startNavigation(destination) {
        alert(`Starting navigation to ${destination}`);
        this.showNotification(`Navigation started to ${destination}`, 'info');
    }

    withdrawEarnings() {
        alert('Withdrawal request submitted. Funds will be transferred within 3-5 business days.');
        this.showNotification('Withdrawal request submitted successfully', 'success');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i><span>${message}</span>`;
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
        const pageMap = { 'overview': 'overviewPage', 'assignments': 'assignmentsPage', 'routes': 'routesPage', 'earnings': 'earningsPage', 'vehicle': 'vehiclePage', 'profile': 'profilePage' };
        const pageId = pageMap[pageName];
        if (pageId) document.getElementById(pageId).style.display = 'block';
        
        const titles = { 'overview': 'Driver Overview', 'assignments': 'My Assignments', 'routes': 'Today\'s Routes', 'earnings': 'My Earnings', 'vehicle': 'My Vehicle', 'profile': 'My Profile' };
        document.getElementById('pageTitle').innerHTML = `<i class="fas ${this.getPageIcon(pageName)}"></i> ${titles[pageName] || 'Dashboard'}`;
        
        document.querySelectorAll('.sidebar-nav a').forEach(link => { link.classList.remove('active'); if (link.dataset.page === pageName) link.classList.add('active'); });
        if (pageName === 'assignments') this.loadAssignments();
        else if (pageName === 'earnings') this.loadEarnings();
        else if (pageName === 'vehicle') this.loadVehicleInfo();
        window.location.hash = pageName;
    }

    getPageIcon(pageName) {
        const icons = { 'overview': 'fa-tachometer-alt', 'assignments': 'fa-tasks', 'routes': 'fa-route', 'earnings': 'fa-money-bill', 'vehicle': 'fa-car', 'profile': 'fa-user' };
        return icons[pageName] || 'fa-dashboard';
    }

    setupEventListeners() {
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => { e.preventDefault(); const page = link.dataset.page; if (page) this.showPage(page); if (link.id === 'logoutBtn' || link.id === 'dropdownLogout') this.logout(); });
        });
        
        const userDropdown = document.getElementById('userDropdown');
        const dropdownMenu = document.querySelector('.dropdown-menu');
        if (userDropdown) userDropdown.addEventListener('click', (e) => { e.stopPropagation(); dropdownMenu.classList.toggle('show'); });
        document.addEventListener('click', () => dropdownMenu?.classList.remove('show'));
        
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        if (menuToggle) menuToggle.addEventListener('click', () => sidebar.classList.toggle('active'));
        
        const filterChips = document.querySelectorAll('.filter-chip');
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                filterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                const filter = chip.dataset.filter;
                if (document.getElementById('assignmentsList')) this.loadAssignments(filter);
            });
        });
        
        const startBtns = document.querySelectorAll('.btn-start');
        startBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const routeText = btn.closest('.route-item')?.querySelector('.route-details')?.innerText || '';
                this.startNavigation(routeText);
            });
        });
        
        const withdrawBtn = document.getElementById('withdrawBtn');
        if (withdrawBtn) withdrawBtn.addEventListener('click', () => this.withdrawEarnings());
        
        const editBtn = document.getElementById('editProfileBtn');
        const cancelBtn = document.getElementById('cancelEditBtn');
        if (editBtn) editBtn.addEventListener('click', () => this.toggleProfileEdit(true));
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.toggleProfileEdit(false));
        
        const profileForm = document.getElementById('profileForm');
        if (profileForm) profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) passwordForm.addEventListener('submit', (e) => this.handlePasswordChange(e));
        
        window.addEventListener('hashchange', () => { const page = window.location.hash.substring(1) || 'overview'; this.showPage(page); });
    }

    toggleProfileEdit(editMode) {
        const inputs = ['profileFirstName', 'profileLastName', 'profilePhone', 'profileLicense'];
        const actions = document.getElementById('profileActions');
        inputs.forEach(id => { const input = document.getElementById(id); if (input) input.readOnly = !editMode; });
        if (actions) actions.style.display = editMode ? 'flex' : 'none';
        const editBtn = document.getElementById('editProfileBtn');
        if (editBtn) editBtn.style.display = editMode ? 'none' : 'block';
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        this.currentUser.firstName = document.getElementById('profileFirstName').value;
        this.currentUser.lastName = document.getElementById('profileLastName').value;
        this.currentUser.phone = document.getElementById('profilePhone').value;
        this.currentUser.license = document.getElementById('profileLicense').value;
        const storage = localStorage.getItem('rwandago_user') ? localStorage : sessionStorage;
        storage.setItem('rwandago_user', JSON.stringify(this.currentUser));
        this.showNotification('Profile updated successfully!', 'success');
        this.toggleProfileEdit(false);
    }

    async handlePasswordChange(e) {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (newPassword !== confirmPassword) { this.showNotification('New passwords do not match', 'error'); return; }
        if (newPassword.length < 6) { this.showNotification('Password must be at least 6 characters', 'error'); return; }
        this.showNotification('Password changed successfully!', 'success');
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
document.addEventListener('DOMContentLoaded', () => { window.driverDashboard = new DriverDashboard(); });