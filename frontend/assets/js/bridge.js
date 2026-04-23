// assets/js/bridge.js
// This file intercepts frontend calls and redirects to backend API

const API_BASE_URL = 'http://localhost:5000/api';

// Store the original functions
const originalFetch = window.fetch;
const originalLocalStorageSet = localStorage.setItem;
const originalLocalStorageGet = localStorage.getItem;
const originalSessionStorageSet = sessionStorage.setItem;
const originalSessionStorageGet = sessionStorage.getItem;

// Override fetch to add auth header
window.fetch = function(url, options = {}) {
    const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
    
    if (token && !url.includes('/auth/login') && !url.includes('/auth/register')) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }
    
    return originalFetch.call(this, url, options);
};

// Mock data to API mapping
const API_ENDPOINTS = {
    vehicles: '/vehicles',
    bookings: '/bookings',
    tours: '/tours',
    tickets: '/tickets',
    users: '/users'
};

// Global API service
window.RwandaGoAPI = {
    // Auth methods
    async login(email, password, rememberMe) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, rememberMe })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Login failed');
            }
            
            const data = await response.json();
            
            // Store in the appropriate storage
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('rwandago_token', data.token);
            storage.setItem('rwandago_user', JSON.stringify(data.user));
            storage.setItem('rwandago_role', data.user.role);
            
            return { success: true, user: data.user, role: data.user.role };
        } catch (error) {
            console.error('Login API error:', error);
            return { success: false, error: error.message };
        }
    },
    
    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Registration failed');
            }
            
            const data = await response.json();
            
            sessionStorage.setItem('rwandago_token', data.token);
            sessionStorage.setItem('rwandago_user', JSON.stringify(data.user));
            sessionStorage.setItem('rwandago_role', data.user.role);
            
            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async changePassword(currentPassword, newPassword) {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        return response.json();
    },
    
    // Vehicle methods
    async getVehicles(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/vehicles${params ? '?' + params : ''}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch vehicles');
        return response.json();
    },
    
    async getVehicle(id) {
        const response = await fetch(`${API_BASE_URL}/vehicles/${id}`);
        if (!response.ok) throw new Error('Vehicle not found');
        return response.json();
    },
    
    async checkAvailability(vehicleId, startDate, endDate) {
        const response = await fetch(
            `${API_BASE_URL}/vehicles/check-availability?vehicleId=${vehicleId}&startDate=${startDate}&endDate=${endDate}`
        );
        return response.json();
    },
    
    // Booking methods
    async createBooking(bookingData) {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Booking failed');
        }
        return response.json();
    },
    
    async getUserBookings(filters = {}) {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        const params = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/bookings/my${params ? '?' + params : ''}`;
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },
    
    async getBooking(id) {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },
    
    async cancelBooking(id, reason) {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        
        const response = await fetch(`${API_BASE_URL}/bookings/${id}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ reason })
        });
        return response.json();
    },
    
    // Tour methods
    async getTours(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/tours${params ? '?' + params : ''}`;
        
        const response = await fetch(url);
        return response.json();
    },
    
    async bookTour(tourId, bookingData) {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        
        const response = await fetch(`${API_BASE_URL}/tours/${tourId}/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData)
        });
        return response.json();
    },
    
    // Ticket methods
    async createTicket(ticketData) {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        
        const response = await fetch(`${API_BASE_URL}/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(ticketData)
        });
        return response.json();
    },
    
    async getUserTickets() {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        
        const response = await fetch(`${API_BASE_URL}/tickets/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },
    
    async addTicketReply(ticketId, message) {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        
        const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message })
        });
        return response.json();
    },
    
    // Admin methods
    async getAllVehicles() {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        const user = JSON.parse(token ? (localStorage.getItem('rwandago_user') || sessionStorage.getItem('rwandago_user')) : '{}');
        
        if (user.role !== 'admin') throw new Error('Unauthorized');
        
        const response = await fetch(`${API_BASE_URL}/vehicles`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },
    
    async createVehicle(vehicleData) {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        
        const response = await fetch(`${API_BASE_URL}/vehicles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(vehicleData)
        });
        return response.json();
    },
    
    async updateVehicle(id, vehicleData) {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        
        const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(vehicleData)
        });
        return response.json();
    },
    
    async deleteVehicle(id) {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        
        const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },
    
    async getAllBookings(filters = {}) {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        const params = new URLSearchParams(filters).toString();
        
        const response = await fetch(`${API_BASE_URL}/bookings/admin/all${params ? '?' + params : ''}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },
    
    async updateBookingStatus(id, status) {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        
        const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        return response.json();
    },
    
    async getAllTickets(filters = {}) {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        const params = new URLSearchParams(filters).toString();
        
        const response = await fetch(`${API_BASE_URL}/tickets/admin/all${params ? '?' + params : ''}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },
    
    async updateTicketStatus(id, status, assignedTo = null) {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        
        const response = await fetch(`${API_BASE_URL}/tickets/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status, assignedTo })
        });
        return response.json();
    },
    
    // Report methods
    async getDashboardStats() {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        
        const response = await fetch(`${API_BASE_URL}/reports/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },
    
    async getRevenueReport(period = 'month', startDate = null, endDate = null) {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        let url = `${API_BASE_URL}/reports/revenue?period=${period}`;
        if (startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },
    
    async getBookingReport(startDate = null, endDate = null) {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        let url = `${API_BASE_URL}/reports/bookings`;
        if (startDate && endDate) url += `?startDate=${startDate}&endDate=${endDate}`;
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },
    
    // Payment methods
    async processPayment(paymentData) {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        
        const response = await fetch(`${API_BASE_URL}/payments/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(paymentData)
        });
        return response.json();
    },
    
    // Emergency methods
    async reportEmergency(emergencyData) {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        
        const response = await fetch(`${API_BASE_URL}/emergencies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(emergencyData)
        });
        return response.json();
    },
    
    async getActiveEmergencies() {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        
        const response = await fetch(`${API_BASE_URL}/emergencies/active`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },
    
    async resolveEmergency(id) {
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        
        const response = await fetch(`${API_BASE_URL}/emergencies/${id}/resolve`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    }
};

// Override the mock login function in the frontend
// This will intercept the existing login/signup flows

// For login.html - override the form submit handler
if (document.getElementById('loginForm')) {
    const originalFormSubmit = document.getElementById('loginForm')?.onsubmit;
    
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;
        const rememberMe = document.getElementById('rememberMe')?.checked;
        
        const result = await window.RwandaGoAPI.login(email, password, rememberMe);
        
        if (result.success) {
            const roleRedirects = {
                'tourist': 'dashboard/tourist/index.html',
                'admin': 'dashboard/admin/index.html',
                'support': 'dashboard/support/index.html',
                'driver': 'dashboard/driver/index.html'
            };
            
            window.location.href = roleRedirects[result.role];
        } else {
            const alertDiv = document.getElementById('alert');
            if (alertDiv) {
                alertDiv.className = 'alert alert-error';
                alertDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${result.error}`;
                alertDiv.style.display = 'block';
            } else {
                alert(result.error);
            }
        }
    });
}

// For signup.html - override the form submit handler
if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName')?.value;
        const lastName = document.getElementById('lastName')?.value;
        const email = document.getElementById('email')?.value;
        const phone = document.getElementById('phone')?.value;
        const password = document.getElementById('password')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        const role = document.getElementById('userRole')?.value || 'tourist';
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        const result = await window.RwandaGoAPI.register({
            firstName, lastName, email, phone, password, role
        });
        
        if (result.success) {
            const roleRedirects = {
                'tourist': 'dashboard/tourist/index.html',
                'admin': 'dashboard/admin/index.html',
                'support': 'dashboard/support/index.html',
                'driver': 'dashboard/driver/index.html'
            };
            
            window.location.href = roleRedirects[role] || 'dashboard/tourist/index.html';
        } else {
            alert(result.error);
        }
    });
}

// Override demo credentials fill function
window.fillCredentials = async function(email, password) {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput && passwordInput) {
        emailInput.value = email;
        passwordInput.value = password;
        
        const alertDiv = document.getElementById('alert');
        if (alertDiv) {
            alertDiv.className = 'alert alert-info';
            alertDiv.innerHTML = '<i class="fas fa-info-circle"></i> Credentials filled! Click Sign In to continue.';
            alertDiv.style.display = 'block';
            
            setTimeout(() => {
                if (alertDiv) alertDiv.style.display = 'none';
            }, 3000);
        }
    }
};

// Override the handleBooking function for index.html
window.handleBooking = async function() {
    const user = sessionStorage.getItem('rwandago_user') || localStorage.getItem('rwandago_user');
    if (user) {
        window.location.href = 'dashboard/tourist/new-booking.html';
    } else {
        window.location.href = 'login.html';
    }
};

// Initialize socket connection for real-time features
class RwandaGoSocket {
    constructor() {
        this.socket = null;
        this.connected = false;
    }
    
    connect() {
        if (this.socket && this.connected) return;
        
        this.socket = io('http://localhost:5000', {
            transports: ['websocket'],
            reconnection: true
        });
        
        this.socket.on('connect', () => {
            console.log('Socket connected');
            this.connected = true;
        });
        
        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.connected = false;
        });
        
        return this.socket;
    }
    
    joinRoom(roomId) {
        if (this.socket && this.connected) {
            this.socket.emit('join_room', roomId);
        }
    }
    
    sendMessage(data) {
        if (this.socket && this.connected) {
            this.socket.emit('send_message', data);
        }
    }
    
    onMessage(callback) {
        if (this.socket) {
            this.socket.on('receive_message', callback);
        }
    }
}

window.RwandaGoSocket = new RwandaGoSocket();

console.log('RwandaGo Backend Bridge Loaded Successfully');