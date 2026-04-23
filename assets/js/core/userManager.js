// ========================================
// RWANDAGO - USER MANAGEMENT SYSTEM
// Handles user registration, login, and persistent storage
// ========================================

class UserManager {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = null;
        this.savedCredentials = this.loadSavedCredentials();
        this.init();
    }

    init() {
        // Load users from localStorage
        this.loadUsers();
        // Check for existing session
        this.checkExistingSession();
        // Auto-fill saved credentials on login page
        this.autoFillCredentials();
    }

    // Load all users from localStorage
    loadUsers() {
        const storedUsers = localStorage.getItem('rwandago_users');
        if (storedUsers) {
            return JSON.parse(storedUsers);
        }
        // Initialize with demo users
        return this.getDefaultUsers();
    }

    // Get default demo users
    getDefaultUsers() {
        return [
            {
                id: 'user_1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'tourist@rwandago.com',
                password: this.hashPassword('password123'),
                phone: '+250788123456',
                role: 'tourist',
                isActive: true,
                isVerified: true,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                preferences: {
                    notifications: true,
                    language: 'en',
                    currency: 'USD'
                }
            },
            {
                id: 'user_2',
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@rwandago.com',
                password: this.hashPassword('password123'),
                phone: '+250788123457',
                role: 'admin',
                isActive: true,
                isVerified: true,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                preferences: {
                    notifications: true,
                    language: 'en',
                    currency: 'USD'
                }
            },
            {
                id: 'user_3',
                firstName: 'Support',
                lastName: 'Agent',
                email: 'support@rwandago.com',
                password: this.hashPassword('password123'),
                phone: '+250788123458',
                role: 'support',
                isActive: true,
                isVerified: true,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                preferences: {
                    notifications: true,
                    language: 'en',
                    currency: 'USD'
                }
            },
            {
                id: 'user_4',
                firstName: 'Driver',
                lastName: 'Guide',
                email: 'driver@rwandago.com',
                password: this.hashPassword('password123'),
                phone: '+250788123459',
                role: 'driver',
                isActive: true,
                isVerified: true,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                preferences: {
                    notifications: true,
                    language: 'en',
                    currency: 'USD'
                }
            }
        ];
    }

    // Simple hash function (in production, use bcrypt on backend)
    hashPassword(password) {
        // This is a simple hash for demo purposes
        // In production, this should be done on the backend
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            hash = ((hash << 5) - hash) + password.charCodeAt(i);
            hash |= 0;
        }
        return hash.toString();
    }

    // Verify password
    verifyPassword(inputPassword, storedHash) {
        return this.hashPassword(inputPassword) === storedHash;
    }

    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('rwandago_users', JSON.stringify(this.users));
    }

    // Save user session
    saveSession(user, remember = false) {
        this.currentUser = user;
        const sessionData = {
            user: user,
            token: 'session_' + Date.now(),
            loginTime: new Date().toISOString()
        };
        
        if (remember) {
            localStorage.setItem('rwandago_session', JSON.stringify(sessionData));
            // Save credentials for auto-fill
            this.saveCredentials(user.email, '');
        } else {
            sessionStorage.setItem('rwandago_session', JSON.stringify(sessionData));
        }
        
        // Update last login
        const userIndex = this.users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            this.users[userIndex].lastLogin = new Date().toISOString();
            this.saveUsers();
        }
    }

    // Load saved credentials
    loadSavedCredentials() {
        const saved = localStorage.getItem('rwandago_saved_credentials');
        if (saved) {
            return JSON.parse(saved);
        }
        return null;
    }

    // Save credentials for auto-fill
    saveCredentials(email, password) {
        const credentials = {
            email: email,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem('rwandago_saved_credentials', JSON.stringify(credentials));
    }

    // Clear saved credentials
    clearSavedCredentials() {
        localStorage.removeItem('rwandago_saved_credentials');
    }

    // Auto-fill credentials on login page
    autoFillCredentials() {
        if (window.location.pathname.includes('login.html') && this.savedCredentials) {
            const emailInput = document.getElementById('email');
            const rememberCheckbox = document.getElementById('rememberMe');
            if (emailInput) {
                emailInput.value = this.savedCredentials.email;
                if (rememberCheckbox) {
                    rememberCheckbox.checked = true;
                }
            }
        }
    }

    // Check existing session
    checkExistingSession() {
        const session = localStorage.getItem('rwandago_session') || sessionStorage.getItem('rwandago_session');
        if (session) {
            const sessionData = JSON.parse(session);
            this.currentUser = sessionData.user;
            return true;
        }
        return false;
    }

    // Register new user
    register(userData) {
        // Check if email already exists
        const existingUser = this.users.find(u => u.email === userData.email);
        if (existingUser) {
            return {
                success: false,
                message: 'An account with this email already exists'
            };
        }

        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: this.hashPassword(userData.password),
            phone: userData.phone,
            role: userData.role || 'tourist',
            isActive: true,
            isVerified: false,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            preferences: {
                notifications: true,
                language: 'en',
                currency: 'USD'
            }
        };

        this.users.push(newUser);
        this.saveUsers();

        // Auto-login after registration
        this.saveSession(newUser, false);

        return {
            success: true,
            message: 'Account created successfully',
            user: {
                id: newUser.id,
                name: `${newUser.firstName} ${newUser.lastName}`,
                email: newUser.email,
                role: newUser.role,
                phone: newUser.phone
            }
        };
    }

    // Login user
    login(email, password, remember = false) {
        const user = this.users.find(u => u.email === email);
        
        if (!user) {
            return {
                success: false,
                message: 'No account found with this email'
            };
        }

        if (!this.verifyPassword(password, user.password)) {
            return {
                success: false,
                message: 'Incorrect password'
            };
        }

        if (!user.isActive) {
            return {
                success: false,
                message: 'Your account has been deactivated. Please contact support.'
            };
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        this.saveUsers();

        // Save session
        this.saveSession(user, remember);

        return {
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                role: user.role,
                phone: user.phone,
                firstName: user.firstName,
                lastName: user.lastName
            }
        };
    }

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('rwandago_session');
        sessionStorage.removeItem('rwandago_session');
    }

    // Get current user
    getCurrentUser() {
        if (this.currentUser) return this.currentUser;
        
        const session = localStorage.getItem('rwandago_session') || sessionStorage.getItem('rwandago_session');
        if (session) {
            const sessionData = JSON.parse(session);
            this.currentUser = sessionData.user;
            return this.currentUser;
        }
        return null;
    }

    // Update user profile
    updateProfile(userId, updates) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...updates };
            this.saveUsers();
            
            // Update session if current user
            if (this.currentUser && this.currentUser.id === userId) {
                this.currentUser = { ...this.currentUser, ...updates };
                this.saveSession(this.currentUser, true);
            }
            
            return {
                success: true,
                message: 'Profile updated successfully',
                user: this.users[userIndex]
            };
        }
        
        return {
            success: false,
            message: 'User not found'
        };
    }

    // Change password
    changePassword(userId, currentPassword, newPassword) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        if (!this.verifyPassword(currentPassword, user.password)) {
            return {
                success: false,
                message: 'Current password is incorrect'
            };
        }

        user.password = this.hashPassword(newPassword);
        this.saveUsers();

        return {
            success: true,
            message: 'Password changed successfully'
        };
    }

    // Get all users (admin only)
    getAllUsers() {
        return this.users.map(user => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
        }));
    }

    // Get user by ID
    getUserById(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            return {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                phone: user.phone,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                preferences: user.preferences
            };
        }
        return null;
    }

    // Toggle user status (admin only)
    toggleUserStatus(userId) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex].isActive = !this.users[userIndex].isActive;
            this.saveUsers();
            return {
                success: true,
                message: `User ${this.users[userIndex].isActive ? 'activated' : 'deactivated'} successfully`
            };
        }
        return {
            success: false,
            message: 'User not found'
        };
    }

    // Delete user (admin only)
    deleteUser(userId) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.users.splice(userIndex, 1);
            this.saveUsers();
            return {
                success: true,
                message: 'User deleted successfully'
            };
        }
        return {
            success: false,
            message: 'User not found'
        };
    }

    // Get saved emails for login page (auto-suggest)
    getSavedEmails() {
        const emails = this.users.map(u => u.email);
        return [...new Set(emails)]; // Remove duplicates
    }
}

// Create global user manager instance
const userManager = new UserManager();

// Make available globally
window.userManager = userManager;