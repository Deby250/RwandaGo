// ========================================
// RWANDAGO - CONTACT PAGE FUNCTIONALITY
// Handles contact form, map, and support
// ========================================

class ContactPage {
    constructor() {
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.updateNavBar();
        this.initMap();
        this.loadFAQs();
    }

    setupEventListeners() {
        // Mobile menu
        const hamburger = document.querySelector('.mobile-menu');
        const navLinks = document.querySelector('.nav-links');
        if (hamburger) {
            hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));
        }
        
        // Contact form submission
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }
        
        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                navbar.classList.toggle('scrolled', window.scrollY > 50);
            }
        });
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    handleContactSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('contactName')?.value;
        const email = document.getElementById('contactEmail')?.value;
        const phone = document.getElementById('contactPhone')?.value;
        const subject = document.getElementById('contactSubject')?.value;
        const message = document.getElementById('contactMessage')?.value;
        
        // Validation
        if (!name || !email || !subject || !message) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (!this.validateEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Simulate sending message
        this.showNotification('Sending your message...', 'info');
        
        setTimeout(() => {
            this.showNotification('Message sent successfully! We\'ll get back to you within 24 hours.', 'success');
            e.target.reset();
            
            // Optional: Send to backend
            // this.sendToBackend({ name, email, phone, subject, message });
        }, 1500);
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    async sendToBackend(data) {
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to send message');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    initMap() {
        // Simulate map initialization
        // In production, integrate Google Maps or OpenStreetMap
        const mapContainer = document.getElementById('mapContainer');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #e9ecef; border-radius: 12px;">
                    <i class="fas fa-map-marker-alt" style="font-size: 3rem; color: #e67e22; margin-bottom: 1rem;"></i>
                    <h3>RwandaGo Headquarters</h3>
                    <p>KG 123 St, Kigali Heights<br>Kigali, Rwanda</p>
                    <button class="btn-sm btn-outline" onclick="window.open('https://maps.google.com/?q=Kigali+Rwanda', '_blank')">
                        <i class="fas fa-external-link-alt"></i> Open in Google Maps
                    </button>
                </div>
            `;
        }
    }

    loadFAQs() {
        const faqs = [
            { question: 'How do I book a car?', answer: 'Simply create an account, select your pickup and return dates, choose a vehicle, and make the 20% deposit payment. Your booking will be confirmed instantly.' },
            { question: 'What documents do I need?', answer: 'You need a valid driver\'s license, passport, and international driving permit (if your license is not in English).' },
            { question: 'Is insurance included?', answer: 'Yes, basic insurance is included. Premium insurance with zero excess is available as an add-on.' },
            { question: 'What is the cancellation policy?', answer: 'Free cancellation up to 24 hours before pickup. After that, the deposit is non-refundable.' },
            { question: 'Can I extend my rental?', answer: 'Yes, contact support at least 24 hours before your return time to request an extension.' },
            { question: 'What happens if I have an accident?', answer: 'Call our emergency hotline immediately at +250 788 123 456. We\'ll assist you with roadside assistance and insurance claims.' }
        ];
        
        const faqContainer = document.getElementById('faqContainer');
        if (faqContainer) {
            faqContainer.innerHTML = faqs.map(faq => `
                <div class="faq-item">
                    <div class="faq-question" onclick="contactPage.toggleFAQ(this)">
                        ${faq.question}
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="faq-answer">${faq.answer}</div>
                </div>
            `).join('');
        }
    }

    toggleFAQ(element) {
        element.classList.toggle('active');
        const answer = element.nextElementSibling;
        answer.classList.toggle('show');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i><span>${message}</span>`;
        document.body.appendChild(notification);
        
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
}

// Initialize contact page
let contactPage;
document.addEventListener('DOMContentLoaded', () => {
    contactPage = new ContactPage();
    window.contactPage = contactPage;
});