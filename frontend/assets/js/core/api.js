// ========================================
// RWANDAGO - API SERVICE
// Backend communication
// ========================================

class APIService {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
        this.token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
    }

    async request(endpoint, options = {}) {
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, { ...options, headers });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Request failed');
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(email, password) {
        return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    }
    async register(userData) {
        return this.request('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
    }

    // Vehicles
    async getVehicles() { return this.request('/vehicles'); }
    async getVehicle(id) { return this.request(`/vehicles/${id}`); }

    // Bookings
    async createBooking(data) { return this.request('/bookings', { method: 'POST', body: JSON.stringify(data) }); }
    async getBookings() { return this.request('/bookings'); }
    async cancelBooking(id) { return this.request(`/bookings/${id}/cancel`, { method: 'PUT' }); }
}

const api = new APIService();