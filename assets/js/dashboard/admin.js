// ========================================
// ADMIN DASHBOARD - COMPLETE LOGIC
// Handles all admin dashboard functionality
// ========================================

class AdminDashboard {
    constructor() {
        this.currentUser = null;
        this.vehicles = [];
        this.bookings = [];
        this.customers = [];
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
        if (this.currentUser.role !== 'admin') { alert('Access denied. Admin portal only.'); window.location.href = '../../index.html'; return false; }
        return true;
    }

    loadUserData() {
        document.getElementById('userName').textContent = this.currentUser.name || 'Admin';
    }

    async loadDashboardData() {
        // Mock data
        this.vehicles = [
            { id: 1, name: 'Toyota RAV4', plate: 'RAB 123A', price: 55, status: 'available', image: '🚙' },
            { id: 2, name: 'Suzuki Jimny', plate: 'RAB 456B', price: 45, status: 'rented', image: '🚘' },
            { id: 3, name: 'Mitsubishi Pajero', plate: 'RAB 789C', price: 85, status: 'available', image: '🚐' },
            { id: 4, name: 'Hyundai i10', plate: 'RAB 101D', price: 30, status: 'maintenance', image: '🚗' }
        ];
        
        this.bookings = [
            { id: 'BK001', customer: 'John Doe', vehicle: 'Toyota RAV4', startDate: 'Dec 1, 2024', endDate: 'Dec 5, 2024', amount: 275, status: 'active' },
            { id: 'BK002', customer: 'Sarah Chen', vehicle: 'Suzuki Jimny', startDate: 'Nov 15, 2024', endDate: 'Nov 18, 2024', amount: 135, status: 'completed' }
        ];
        
        this.customers = [
            { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+250788123456', role: 'tourist', status: 'active', totalBookings: 3 },
            { id: 2, name: 'Sarah Chen', email: 'sarah@example.com', phone: '+250788123457', role: 'tourist', status: 'active', totalBookings: 2 }
        ];
        
        this.updateStats();
        this.loadVehicles();
        this.loadBookings();
        this.loadCustomers();
    }

    updateStats() {
        const totalVehicles = this.vehicles.length;
        const activeBookings = this.bookings.filter(b => b.status === 'active').length;
        const totalCustomers = this.customers.length;
        const totalRevenue = this.bookings.reduce((sum, b) => sum + b.amount, 0);
        
        document.getElementById('totalVehicles').textContent = totalVehicles;
        document.getElementById('activeBookings').textContent = activeBookings;
        document.getElementById('totalCustomers').textContent = totalCustomers;
        document.getElementById('totalRevenue').textContent = `$${totalRevenue}`;
    }

    loadVehicles(filter = 'all', search = '') {
        let filtered = [...this.vehicles];
        if (filter !== 'all') filtered = filtered.filter(v => v.status === filter);
        if (search) filtered = filtered.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.plate.toLowerCase().includes(search.toLowerCase()));
        
        const tbody = document.getElementById('vehiclesList');
        if (!tbody) return;
        if (filtered.length === 0) { tbody.innerHTML = '<tr><td colspan="7" class="text-center">No vehicles found</td></tr>'; return; }
        tbody.innerHTML = filtered.map(v => `
            <tr><td>${v.id}</td><td style="font-size:1.5rem;">${v.image}</td><td>${v.name}</td><td>${v.plate}</td>
            <td>$${v.price}</td><td><span class="vehicle-status status-${v.status}">${v.status}</span></td>
            <td><button class="action-btn btn-edit" onclick="adminDashboard.editVehicle(${v.id})">Edit</button>
            <button class="action-btn btn-delete" onclick="adminDashboard.deleteVehicle(${v.id})">Delete</button></td></tr>
        `).join('');
    }

    loadBookings(filter = 'all', search = '') {
        let filtered = [...this.bookings];
        if (filter !== 'all') filtered = filtered.filter(b => b.status === filter);
        if (search) filtered = filtered.filter(b => b.id.toLowerCase().includes(search.toLowerCase()) || b.customer.toLowerCase().includes(search.toLowerCase()));
        
        const tbody = document.getElementById('bookingsList');
        if (!tbody) return;
        if (filtered.length === 0) { tbody.innerHTML = '<tr><td colspan="7" class="text-center">No bookings found</td></tr>'; return; }
        tbody.innerHTML = filtered.map(b => `
            <tr><td>${b.id}</td><td>${b.customer}</td><td>${b.vehicle}</td><td>${b.startDate} - ${b.endDate}</td>
            <td>$${b.amount}</td><td><span class="booking-status status-${b.status}">${b.status}</span></td>
            <td><button class="action-btn btn-view" onclick="adminDashboard.viewBooking('${b.id}')">View</button>
            <button class="action-btn btn-update" onclick="adminDashboard.updateBookingStatus('${b.id}')">Update</button></td></tr>
        `).join('');
    }

    loadCustomers(search = '') {
        let filtered = [...this.customers];
        if (search) filtered = filtered.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));
        
        const tbody = document.getElementById('customersList');
        if (!tbody) return;
        if (filtered.length === 0) { tbody.innerHTML = '<tr><td colspan="7" class="text-center">No customers found</td></tr>'; return; }
        tbody.innerHTML = filtered.map(c => `
            <tr><td>${c.id}</td><td>${c.name}</td><td>${c.email}</td><td>${c.phone}</td>
            <td>${c.role}</td><td><span class="user-status status-${c.status}">${c.status}</span></td>
            <td><button class="action-btn btn-edit" onclick="adminDashboard.editCustomer(${c.id})">Edit</button>
            <button class="action-btn btn-block" onclick="adminDashboard.toggleCustomerStatus(${c.id})">${c.status === 'active' ? 'Block' : 'Activate'}</button></td></tr>
        `).join('');
    }

    addVehicle(vehicleData) {
        const newId = this.vehicles.length + 1;
        const newVehicle = { id: newId, ...vehicleData, image: '🚙' };
        this.vehicles.push(newVehicle);
        this.loadVehicles();
        this.updateStats();
        this.showNotification('Vehicle added successfully', 'success');
    }

    editVehicle(id) {
        const vehicle = this.vehicles.find(v => v.id === id);
        if (vehicle) {
            document.getElementById('modalTitle').textContent = 'Edit Vehicle';
            document.getElementById('vehicleName').value = vehicle.name;
            document.getElementById('vehicleBrand').value = vehicle.brand || '';
            document.getElementById('vehicleModel').value = vehicle.model || '';
            document.getElementById('vehicleYear').value = vehicle.year || 2023;
            document.getElementById('vehicleSeats').value = vehicle.seats || 5;
            document.getElementById('vehiclePrice').value = vehicle.price;
            document.getElementById('vehiclePlate').value = vehicle.plate;
            document.getElementById('vehicleStatus').value = vehicle.status;
            document.getElementById('vehicleModal').style.display = 'flex';
            window.editingVehicleId = id;
        }
    }

    deleteVehicle(id) {
        if (confirm('Are you sure you want to delete this vehicle?')) {
            this.vehicles = this.vehicles.filter(v => v.id !== id);
            this.loadVehicles();
            this.updateStats();
            this.showNotification('Vehicle deleted successfully', 'success');
        }
    }

    saveVehicle() {
        const vehicleData = {
            name: document.getElementById('vehicleName').value,
            brand: document.getElementById('vehicleBrand').value,
            model: document.getElementById('vehicleModel').value,
            year: parseInt(document.getElementById('vehicleYear').value),
            seats: parseInt(document.getElementById('vehicleSeats').value),
            price: parseInt(document.getElementById('vehiclePrice').value),
            plate: document.getElementById('vehiclePlate').value,
            status: document.getElementById('vehicleStatus').value
        };
        
        if (window.editingVehicleId) {
            const index = this.vehicles.findIndex(v => v.id === window.editingVehicleId);
            if (index !== -1) { this.vehicles[index] = { ...this.vehicles[index], ...vehicleData }; this.showNotification('Vehicle updated successfully', 'success'); }
        } else {
            this.addVehicle(vehicleData);
        }
        document.getElementById('vehicleModal').style.display = 'none';
        this.loadVehicles();
        this.updateStats();
    }

    viewBooking(id) {
        const booking = this.bookings.find(b => b.id === id);
        if (booking) {
            alert(`Booking Details:\nID: ${booking.id}\nCustomer: ${booking.customer}\nVehicle: ${booking.vehicle}\nAmount: $${booking.amount}\nStatus: ${booking.status}`);
        }
    }

    updateBookingStatus(id) {
        const booking = this.bookings.find(b => b.id === id);
        if (booking) {
            const newStatus = prompt('Enter new status (active, pending, completed, cancelled):', booking.status);
            if (newStatus && ['active', 'pending', 'completed', 'cancelled'].includes(newStatus)) {
                booking.status = newStatus;
                this.loadBookings();
                this.updateStats();
                this.showNotification(`Booking ${id} status updated to ${newStatus}`, 'success');
            }
        }
    }

    editCustomer(id) {
        alert(`Edit customer ${id} - Feature coming soon`);
    }

    toggleCustomerStatus(id) {
        const customer = this.customers.find(c => c.id === id);
        if (customer) {
            customer.status = customer.status === 'active' ? 'inactive' : 'active';
            this.loadCustomers();
            this.showNotification(`Customer ${customer.status === 'active' ? 'activated' : 'blocked'} successfully`, 'success');
        }
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
        const pageMap = { 'overview': 'overviewPage', 'vehicles': 'vehiclesPage', 'bookings': 'bookingsPage', 'customers': 'customersPage', 'reports': 'reportsPage', 'settings': 'settingsPage' };
        const pageId = pageMap[pageName];
        if (pageId) document.getElementById(pageId).style.display = 'block';
        
        const titles = { 'overview': 'Dashboard Overview', 'vehicles': 'Vehicle Management', 'bookings': 'All Bookings', 'customers': 'Customer Management', 'reports': 'Reports & Analytics', 'settings': 'System Settings' };
        document.getElementById('pageTitle').innerHTML = `<i class="fas ${this.getPageIcon(pageName)}"></i> ${titles[pageName] || 'Dashboard'}`;
        
        document.querySelectorAll('.sidebar-nav a').forEach(link => { link.classList.remove('active'); if (link.dataset.page === pageName) link.classList.add('active'); });
        if (pageName === 'vehicles') this.loadVehicles();
        else if (pageName === 'bookings') this.loadBookings();
        else if (pageName === 'customers') this.loadCustomers();
        window.location.hash = pageName;
    }

    getPageIcon(pageName) {
        const icons = { 'overview': 'fa-tachometer-alt', 'vehicles': 'fa-car', 'bookings': 'fa-calendar-check', 'customers': 'fa-users', 'reports': 'fa-chart-line', 'settings': 'fa-cog' };
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
        
        const addVehicleBtn = document.getElementById('addVehicleBtn');
        if (addVehicleBtn) addVehicleBtn.addEventListener('click', () => { document.getElementById('modalTitle').textContent = 'Add New Vehicle'; document.getElementById('vehicleForm')?.reset(); document.getElementById('vehicleModal').style.display = 'flex'; window.editingVehicleId = null; });
        
        const saveVehicleBtn = document.getElementById('saveVehicleBtn');
        if (saveVehicleBtn) saveVehicleBtn.addEventListener('click', () => this.saveVehicle());
        
        const modalClose = document.querySelectorAll('.close, .modal-close');
        modalClose.forEach(el => el.addEventListener('click', () => document.getElementById('vehicleModal')?.style.display = 'none'));
        
        const filterChips = document.querySelectorAll('.filter-chip');
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                filterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                const filter = chip.dataset.filter;
                const search = document.getElementById('searchVehicle')?.value || '';
                if (document.getElementById('vehiclesList')) this.loadVehicles(filter, search);
                else if (document.getElementById('bookingsList')) this.loadBookings(filter, search);
            });
        });
        
        const searchInput = document.getElementById('searchVehicle');
        if (searchInput) searchInput.addEventListener('input', (e) => { const filter = document.querySelector('.filter-chip.active')?.dataset.filter || 'all'; this.loadVehicles(filter, e.target.value); });
        
        window.addEventListener('hashchange', () => { const page = window.location.hash.substring(1) || 'overview'; this.showPage(page); });
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
document.addEventListener('DOMContentLoaded', () => { window.adminDashboard = new AdminDashboard(); });