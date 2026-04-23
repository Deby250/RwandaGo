// ========================================
// RWANDAGO - SESSION MANAGEMENT
// Integrates with UserManager for persistent sessions
// ========================================

class SessionManager {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.loadSession();
    }

    loadSession() {
        // Try to load from userManager first
        if (window.userManager) {
            const user = window.userManager.getCurrentUser();
            if (user) {
                this.currentUser = user;
                this.token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
                return true;
            }
        }
        
        // Fallback to direct storage
        const token = localStorage.getItem('rwandago_token') || sessionStorage.getItem('rwandago_token');
        const user = localStorage.getItem('rwandago_user') || sessionStorage.getItem('rwandago_user');
        
        if (token && user) {
            this.token = token;
            this.currentUser = JSON.parse(user);
            return true;
        }
        return false;
    }

    saveSession(user, token, remember = false) {
        this.currentUser = user;
        this.token = token;
        
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('rwandago_token', token);
        storage.setItem('rwandago_user', JSON.stringify(user));
        storage.setItem('rwandago_role', user.role);
        
        if (window.userManager) {
            window.userManager.saveSession(user, remember);
        }
    }

    clearSession() {
        this.currentUser = null;
        this.token = null;
        
        localStorage.removeItem('rwandago_token');
        localStorage.removeItem('rwandago_user');
        localStorage.removeItem('rwandago_role');
        sessionStorage.removeItem('rwandago_token');
        sessionStorage.removeItem('rwandago_user');
        sessionStorage.removeItem('rwandago_role');
        
        if (window.userManager) {
            window.userManager.logout();
        }
    }

    getCurrentUser() {
        if (this.currentUser) return this.currentUser;
        if (window.userManager) return window.userManager.getCurrentUser();
        return null;
    }

    isAuthenticated() {
        return this.currentUser !== null || (window.userManager && window.userManager.getCurrentUser() !== null);
    }

    getUserRole() {
        const user = this.getCurrentUser();
        return user?.role || null;
    }

    getUserName() {
        const user = this.getCurrentUser();
        return user?.name || user?.firstName || 'User';
    }

    redirectToDashboard() {
        const role = this.getUserRole();
        const redirects = {
            'tourist': 'dashboard/tourist/index.html',
            'admin': 'dashboard/admin/index.html',
            'support': 'dashboard/support/index.html',
            'driver': 'dashboard/driver/index.html'
        };
        const redirectUrl = redirects[role];
        if (redirectUrl) {
            window.location.href = redirectUrl;
        } else {
            window.location.href = 'index.html';
        }
    }

    logout() {
        this.clearSession();
        window.location.href = 'login.html';
    }
}

// Create global session instance
const session = new SessionManager();

// Helper functions
function protectPage(allowedRoles = null) {
    if (!session.isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (allowedRoles && !allowedRoles.includes(session.getUserRole())) {
        alert('Access denied.');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

function redirectIfLoggedIn() {
    if (session.isAuthenticated()) {
        session.redirectToDashboard();
    }
}