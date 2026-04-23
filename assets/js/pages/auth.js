// ========================================
// RWANDAGO - AUTHENTICATION PAGE FUNCTIONALITY
// Handles login, signup with auto-login, password reset
// ========================================

class AuthPage {
    constructor() {
        this.currentPage = window.location.pathname.includes('login.html') ? 'login' : 'signup';
        this.demoUsers = {
            'tourist@rwandago.com': { password: 'password123', role: 'tourist', name: 'John Doe', firstName: 'John', lastName: 'Doe', phone: '+250788123456' },
            'admin@rwandago.com': { password: 'password123', role: 'admin', name: 'Admin User', firstName: 'Admin', lastName: 'User', phone: '+250788123457' },
            'support@rwandago.com': { password: 'password123', role: 'support', name: 'Support Agent', firstName: 'Support', lastName: 'Agent', phone: '+250788123458' },
            'driver@rwandago.com': { password: 'password123', role: 'driver', name: 'Driver Guide', firstName: 'Driver', lastName: 'Guide', phone: '+250788123459' }
        };
        this.init();
    }

    async init() {
        this.checkExistingSession();
        this.loadAdditionalUsers();
        this.setupEventListeners();
        this.setupPasswordToggle();
        this.setupFormValidation();
        
        if (this.currentPage === 'signup') {
            this.setupAutoFillForDemo();
        }
    }

    checkExistingSession() {
        const user = sessionStorage.getItem('rwandago_user') || localStorage.getItem('rwandago_user');
        if (user) {
            const userData = JSON.parse(user);
            const roleRedirects = {
                'tourist': '../dashboard/tourist/index.html',
                'admin': '../dashboard/admin/index.html',
                'support': '../dashboard/support/index.html',
                'driver': '../dashboard/driver/index.html'
            };
            if (roleRedirects[userData.role]) {
                window.location.href = roleRedirects[userData.role];
            }
        }
    }

    loadAdditionalUsers() {
        const savedUsers = localStorage.getItem('rwandago_users');
        if (savedUsers) {
            const additionalUsers = JSON.parse(savedUsers);
            additionalUsers.forEach(user => {
                this.demoUsers[user.email] = {
                    password: user.password,
                    role: user.role,
                    name: user.name,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone
                };
            });
        }
    }

    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Signup form submission
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Forgot password link
        const forgotLink = document.getElementById('forgotPassword');
        if (forgotLink) {
            forgotLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showForgotPasswordModal();
            });
        }

        // Social login buttons
        const googleBtn = document.getElementById('googleLogin');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => this.handleSocialLogin('google'));
        }

        const facebookBtn = document.getElementById('facebookLogin');
        if (facebookBtn) {
            facebookBtn.addEventListener('click', () => this.handleSocialLogin('facebook'));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;
        const rememberMe = document.getElementById('rememberMe')?.checked;

        if (!email || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        this.setLoading(true, 'login');

        // Simulate API call
        setTimeout(() => {
            const userData = this.demoUsers[email];
            
            if (userData && userData.password === password) {
                const user = {
                    id: Date.now(),
                    email: email,
                    name: userData.name,
                    role: userData.role,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phone: userData.phone,
                    loginTime: new Date().toISOString()
                };
                
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem('rwandago_user', JSON.stringify(user));
                storage.setItem('rwandago_token', 'demo_token_' + Date.now());
                storage.setItem('rwandago_role', user.role);
                
                this.showSuccess('Login successful! Redirecting...');
                
                const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
                if (redirectUrl) {
                    sessionStorage.removeItem('redirectAfterLogin');
                    setTimeout(() => { window.location.href = redirectUrl; }, 1500);
                } else {
                    const roleRedirects = {
                        'tourist': '../dashboard/tourist/index.html',
                        'admin': '../dashboard/admin/index.html',
                        'support': '../dashboard/support/index.html',
                        'driver': '../dashboard/driver/index.html'
                    };
                    setTimeout(() => { window.location.href = roleRedirects[user.role]; }, 1500);
                }
            } else {
                this.showError('Invalid email or password. Please try again or create an account.');
                this.setLoading(false, 'login');
            }
        }, 1000);
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName')?.value;
        const lastName = document.getElementById('lastName')?.value;
        const email = document.getElementById('email')?.value;
        const phone = document.getElementById('phone')?.value;
        const password = document.getElementById('password')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        const role = document.getElementById('userRole')?.value;
        const termsAccepted = document.getElementById('termsCheckbox')?.checked;

        // Validation
        if (!firstName || !lastName || !email || !phone || !password) {
            this.showError('Please fill in all required fields');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        // Check if email already exists
        if (this.demoUsers[email]) {
            this.showError('An account with this email already exists. Please login instead.');
            setTimeout(() => { window.location.href = 'login.html'; }, 2000);
            return;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        if (!termsAccepted) {
            this.showError('Please accept the Terms & Conditions');
            return;
        }

        this.setLoading(true, 'signup');

        // Simulate API call
        setTimeout(() => {
            const newUser = {
                id: Date.now(),
                email: email,
                firstName: firstName,
                lastName: lastName,
                name: `${firstName} ${lastName}`,
                phone: phone,
                role: role || 'tourist',
                passport: '',
                createdAt: new Date().toISOString()
            };
            
            // Add to demo users
            this.demoUsers[email] = {
                password: password,
                role: newUser.role,
                name: newUser.name,
                firstName: firstName,
                lastName: lastName,
                phone: phone
            };
            
            // Save to localStorage for persistence
            const existingUsers = JSON.parse(localStorage.getItem('rwandago_users') || '[]');
            existingUsers.push(newUser);
            localStorage.setItem('rwandago_users', JSON.stringify(existingUsers));
            
            // AUTO-LOGIN: Save session immediately
            sessionStorage.setItem('rwandago_user', JSON.stringify(newUser));
            sessionStorage.setItem('rwandago_token', 'demo_token_' + Date.now());
            sessionStorage.setItem('rwandago_role', newUser.role);
            
            this.showSuccess('Account created successfully! Redirecting to dashboard...');
            
            const roleRedirects = {
                'tourist': '../dashboard/tourist/index.html',
                'admin': '../dashboard/admin/index.html',
                'support': '../dashboard/support/index.html',
                'driver': '../dashboard/driver/index.html'
            };
            
            setTimeout(() => {
                window.location.href = roleRedirects[newUser.role];
            }, 1500);
        }, 1500);
    }

    async handleSocialLogin(provider) {
        this.showInfo(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login is coming soon!`);
    }

    showForgotPasswordModal() {
        const email = prompt('Please enter your email address to reset your password:');
        if (email && this.validateEmail(email)) {
            if (this.demoUsers[email]) {
                this.showInfo(`Password reset link has been sent to ${email}!`);
            } else {
                this.showError('No account found with this email address');
            }
        } else if (email) {
            this.showError('Please enter a valid email address');
        }
    }

    setupPasswordToggle() {
        const toggleButtons = document.querySelectorAll('.toggle-password');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                const input = document.getElementById(targetId);
                if (input) {
                    const type = input.type === 'password' ? 'text' : 'password';
                    input.type = type;
                    btn.classList.toggle('fa-eye');
                    btn.classList.toggle('fa-eye-slash');
                }
            });
        });
    }

    setupFormValidation() {
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        
        if (password && confirmPassword) {
            const validateMatch = () => {
                if (password.value !== confirmPassword.value) {
                    confirmPassword.setCustomValidity('Passwords do not match');
                } else {
                    confirmPassword.setCustomValidity('');
                }
            };
            password.addEventListener('change', validateMatch);
            confirmPassword.addEventListener('keyup', validateMatch);
        }
        
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                if (emailInput.value && !this.validateEmail(emailInput.value)) {
                    emailInput.setCustomValidity('Please enter a valid email address');
                } else {
                    emailInput.setCustomValidity('');
                }
            });
        }
    }

    setupAutoFillForDemo() {
        const demoAccounts = document.querySelectorAll('.demo-credentials code');
        demoAccounts.forEach(code => {
            code.addEventListener('click', () => {
                const text = code.textContent;
                if (text.includes('@')) {
                    const emailInput = document.getElementById('email');
                    if (emailInput) emailInput.value = text;
                } else if (text === 'password123') {
                    const passwordInput = document.getElementById('password');
                    if (passwordInput) passwordInput.value = text;
                    const confirmInput = document.getElementById('confirmPassword');
                    if (confirmInput) confirmInput.value = text;
                }
            });
        });
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    setLoading(isLoading, formType) {
        const submitBtn = document.querySelector(`#${formType}Form button[type="submit"], .btn-${formType}`);
        if (submitBtn) {
            if (isLoading) {
                submitBtn.disabled = true;
                submitBtn.dataset.originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${formType === 'login' ? 'Signing in...' : 'Creating account...'}`;
            } else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = submitBtn.dataset.originalText || (formType === 'login' ? 'Sign In' : 'Create Account');
            }
        }
    }

    showError(message) { this.showAlert(message, 'error'); }
    showSuccess(message) { this.showAlert(message, 'success'); }
    showInfo(message) { this.showAlert(message, 'info'); }

    showAlert(message, type) {
        const alertDiv = document.getElementById('alert');
        if (alertDiv) {
            alertDiv.className = `alert alert-${type}`;
            alertDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
            alertDiv.style.display = 'block';
            setTimeout(() => { alertDiv.style.display = 'none'; }, 5000);
        } else {
            alert(message);
        }
    }
}

// Initialize auth page
let authPage;
document.addEventListener('DOMContentLoaded', () => {
    authPage = new AuthPage();
    window.authPage = authPage;
});