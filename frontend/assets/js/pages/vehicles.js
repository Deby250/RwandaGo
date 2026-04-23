// ========================================
// RWANDAGO - VEHICLES PAGE FUNCTIONALITY
// Handles vehicle listing, filtering, and search
// ========================================

class VehiclesPage {
    constructor() {
        this.vehicles = [];
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.currentSort = 'price-asc';
        this.currentPage = 1;
        this.itemsPerPage = 9;
        this.init();
    }

    async init() {
        await this.loadVehicles();
        this.setupEventListeners();
        this.updateNavBar();
        this.loadFiltersFromURL();
    }

    async loadVehicles() {
        // Vehicle data - In production, fetch from API
        this.vehicles = [
            { id: 1, name: 'Toyota RAV4', category: 'suv', seats: 5, bags: 3, transmission: 'Automatic', fuel: 'Petrol', price: 55, image: '🚙', available: true, rating: 4.8, reviews: 45 },
            { id: 2, name: 'Suzuki Jimny', category: 'suv', seats: 4, bags: 2, transmission: 'Manual', fuel: 'Petrol', price: 45, image: '🚘', available: true, rating: 4.6, reviews: 32 },
            { id: 3, name: 'Mitsubishi Pajero', category: 'suv', seats: 7, bags: 4, transmission: 'Automatic', fuel: 'Diesel', price: 85, image: '🚐', available: true, rating: 4.9, reviews: 67 },
            { id: 4, name: 'Hyundai i10', category: 'economy', seats: 4, bags: 2, transmission: 'Manual', fuel: 'Petrol', price: 30, image: '🚗', available: true, rating: 4.5, reviews: 28 },
            { id: 5, name: 'Toyota Camry', category: 'sedan', seats: 5, bags: 3, transmission: 'Automatic', fuel: 'Petrol', price: 65, image: '🚙', available: true, rating: 4.7, reviews: 41 },
            { id: 6, name: 'Mercedes C-Class', category: 'luxury', seats: 5, bags: 3, transmission: 'Automatic', fuel: 'Petrol', price: 120, image: '🏎️', available: true, rating: 4.9, reviews: 53 },
            { id: 7, name: 'Land Cruiser', category: 'luxury', seats: 8, bags: 5, transmission: 'Automatic', fuel: 'Diesel', price: 150, image: '🚙', available: true, rating: 4.9, reviews: 89 },
            { id: 8, name: 'Nissan Note', category: 'economy', seats: 5, bags: 2, transmission: 'Automatic', fuel: 'Petrol', price: 35, image: '🚗', available: true, rating: 4.4, reviews: 23 },
            { id: 9, name: 'Honda CR-V', category: 'suv', seats: 5, bags: 4, transmission: 'Automatic', fuel: 'Petrol', price: 70, image: '🚙', available: false, rating: 4.7, reviews: 38 },
            { id: 10, name: 'Ford Ranger', category: 'suv', seats: 5, bags: 4, transmission: 'Manual', fuel: 'Diesel', price: 90, image: '🚙', available: true, rating: 4.8, reviews: 42 }
        ];

        this.displayVehicles();
        this.updateFilterCounts();
    }

    displayVehicles() {
        let filtered = this.filterVehicles();
        filtered = this.sortVehicles(filtered);
        
        const totalPages = Math.ceil(filtered.length / this.itemsPerPage);
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginated = filtered.slice(start, start + this.itemsPerPage);
        
        this.renderVehicles(paginated);
        this.renderPagination(totalPages);
        this.updateResultsCount(filtered.length);
    }

    filterVehicles() {
        let filtered = [...this.vehicles];
        
        // Apply category filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(v => v.category === this.currentFilter);
        }
        
        // Apply search filter
        if (this.currentSearch) {
            const searchLower = this.currentSearch.toLowerCase();
            filtered = filtered.filter(v => 
                v.name.toLowerCase().includes(searchLower) ||
                v.category.toLowerCase().includes(searchLower)
            );
        }
        
        return filtered;
    }

    sortVehicles(vehicles) {
        const sorted = [...vehicles];
        switch(this.currentSort) {
            case 'price-asc':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-desc':
                return sorted.sort((a, b) => b.price - a.price);
            case 'name-asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return sorted.sort((a, b) => b.name.localeCompare(a.name));
            case 'rating-desc':
                return sorted.sort((a, b) => b.rating - a.rating);
            default:
                return sorted;
        }
    }

    renderVehicles(vehicles) {
        const container = document.getElementById('vehiclesGrid');
        if (!container) return;
        
        if (vehicles.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-car" style="font-size: 3rem; color: #ccc;"></i>
                    <h3>No vehicles found</h3>
                    <p>Try adjusting your filters or search criteria</p>
                    <button class="btn-primary" onclick="vehiclesPage.resetFilters()">Reset Filters</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = vehicles.map(vehicle => `
            <div class="vehicle-card" data-id="${vehicle.id}">
                <div class="vehicle-image">${vehicle.image}</div>
                <div class="vehicle-info">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3>${vehicle.name}</h3>
                        <div class="rating">
                            <i class="fas fa-star" style="color: #f39c12;"></i>
                            <span>${vehicle.rating}</span>
                            <span style="font-size: 0.7rem;">(${vehicle.reviews})</span>
                        </div>
                    </div>
                    <div class="vehicle-specs">
                        <span><i class="fas fa-users"></i> ${vehicle.seats} seats</span>
                        <span><i class="fas fa-suitcase"></i> ${vehicle.bags} bags</span>
                        <span><i class="fas fa-cog"></i> ${vehicle.transmission}</span>
                        <span><i class="fas fa-gas-pump"></i> ${vehicle.fuel}</span>
                    </div>
                    <div class="vehicle-price">
                        $${vehicle.price} <span>/ day</span>
                    </div>
                    <button class="btn-book" onclick="vehiclesPage.bookVehicle(${vehicle.id})" ${!vehicle.available ? 'disabled' : ''}>
                        ${vehicle.available ? '<i class="fas fa-calendar-check"></i> Book Now' : '<i class="fas fa-clock"></i> Currently Unavailable'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderPagination(totalPages) {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer || totalPages <= 1) {
            if (paginationContainer) paginationContainer.innerHTML = '';
            return;
        }
        
        let html = `<button class="page-btn" onclick="vehiclesPage.goToPage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
        
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="vehiclesPage.goToPage(${i})">${i}</button>`;
        }
        
        if (totalPages > 5) {
            html += `<span>...</span>`;
            html += `<button class="page-btn" onclick="vehiclesPage.goToPage(${totalPages})">${totalPages}</button>`;
        }
        
        html += `<button class="page-btn" onclick="vehiclesPage.goToPage(${this.currentPage + 1})" ${this.currentPage === totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
        
        paginationContainer.innerHTML = html;
    }

    updateResultsCount(count) {
        const countElement = document.getElementById('resultsCount');
        if (countElement) {
            countElement.textContent = `Showing ${count} vehicle${count !== 1 ? 's' : ''}`;
        }
    }

    updateFilterCounts() {
        const categories = ['all', 'suv', 'sedan', 'economy', 'luxury'];
        categories.forEach(cat => {
            const count = cat === 'all' ? this.vehicles.length : this.vehicles.filter(v => v.category === cat).length;
            const filterBtn = document.querySelector(`.filter-btn[data-filter="${cat}"]`);
            if (filterBtn) {
                filterBtn.innerHTML = `${cat === 'all' ? 'All Vehicles' : cat.charAt(0).toUpperCase() + cat.slice(1)} <span class="count">(${count})</span>`;
            }
        });
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filterVehicles().length / this.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        this.currentPage = page;
        this.displayVehicles();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    resetFilters() {
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.currentSort = 'price-asc';
        this.currentPage = 1;
        
        // Update UI
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.filter-btn[data-filter="all"]')?.classList.add('active');
        document.getElementById('searchInput')?.value = '';
        document.getElementById('sortSelect')?.value = 'price-asc';
        
        this.displayVehicles();
        this.updateURLParams();
    }

    updateURLParams() {
        const params = new URLSearchParams();
        if (this.currentFilter !== 'all') params.set('category', this.currentFilter);
        if (this.currentSearch) params.set('search', this.currentSearch);
        if (this.currentSort !== 'price-asc') params.set('sort', this.currentSort);
        
        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.pushState({}, '', newUrl);
    }

    loadFiltersFromURL() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('category')) {
            this.currentFilter = params.get('category');
            const filterBtn = document.querySelector(`.filter-btn[data-filter="${this.currentFilter}"]`);
            if (filterBtn) filterBtn.classList.add('active');
        }
        if (params.has('search')) {
            this.currentSearch = params.get('search');
            document.getElementById('searchInput').value = this.currentSearch;
        }
        if (params.has('sort')) {
            this.currentSort = params.get('sort');
            document.getElementById('sortSelect').value = this.currentSort;
        }
        this.displayVehicles();
    }

    bookVehicle(vehicleId) {
        const vehicle = this.vehicles.find(v => v.id === vehicleId);
        if (!vehicle || !vehicle.available) {
            homePage?.showNotification('This vehicle is currently unavailable', 'error');
            return;
        }
        
        const user = sessionStorage.getItem('rwandago_user') || localStorage.getItem('rwandago_user');
        if (user) {
            sessionStorage.setItem('selectedVehicle', JSON.stringify(vehicle));
            window.location.href = '../dashboard/tourist/new-booking.html';
        } else {
            sessionStorage.setItem('redirectAfterLogin', '../dashboard/tourist/new-booking.html');
            sessionStorage.setItem('selectedVehicle', JSON.stringify(vehicle));
            window.location.href = '../login.html';
        }
    }

    updateNavBar() {
        const loginBtn = document.getElementById('loginBtn');
        const user = sessionStorage.getItem('rwandago_user') || localStorage.getItem('rwandago_user');
        
        if (user) {
            const userData = JSON.parse(user);
            loginBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${userData.name || 'Account'}`;
            loginBtn.href = '#';
            loginBtn.onclick = (e) => {
                e.preventDefault();
                const roleRedirects = {
                    'tourist': '../dashboard/tourist/index.html',
                    'admin': '../dashboard/admin/index.html',
                    'support': '../dashboard/support/index.html',
                    'driver': '../dashboard/driver/index.html'
                };
                window.location.href = roleRedirects[userData.role] || '../index.html';
            };
        } else {
            loginBtn.innerHTML = '<i class="fas fa-user"></i> Sign In';
            loginBtn.href = '../login.html';
        }
    }

    setupEventListeners() {
        // Mobile menu
        const hamburger = document.querySelector('.mobile-menu');
        const navLinks = document.querySelector('.nav-links');
        if (hamburger) {
            hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));
        }
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.currentPage = 1;
                this.displayVehicles();
                this.updateURLParams();
            });
        });
        
        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.currentSearch = e.target.value;
                    this.currentPage = 1;
                    this.displayVehicles();
                    this.updateURLParams();
                }, 300);
            });
        }
        
        // Sort select
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.currentPage = 1;
                this.displayVehicles();
                this.updateURLParams();
            });
        }
        
        // Reset filters button
        const resetBtn = document.getElementById('resetFiltersBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }
        
        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                navbar.classList.toggle('scrolled', window.scrollY > 50);
            }
        });
        
        // Handle browser back/forward
        window.addEventListener('popstate', () => this.loadFiltersFromURL());
    }
}

// Initialize vehicles page
let vehiclesPage;
document.addEventListener('DOMContentLoaded', () => {
    vehiclesPage = new VehiclesPage();
    window.vehiclesPage = vehiclesPage;
});