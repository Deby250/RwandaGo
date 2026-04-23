// ========================================
// RWANDAGO - HOMEPAGE FUNCTIONALITY
// Handles all homepage interactions
// ========================================

class HomePage {
    constructor() {
        this.vehicles = [];
        this.testimonials = [];
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.updateNavBar();
        this.initAnimations();
    }

    async loadData() {
        // Vehicle data
        this.vehicles = [
            { id: 1, name: 'Toyota RAV4', category: 'suv', seats: 5, bags: 3, transmission: 'Automatic', fuel: 'Petrol', price: 55, image: '🚙', available: true },
            { id: 2, name: 'Suzuki Jimny', category: 'suv', seats: 4, bags: 2, transmission: 'Manual', fuel: 'Petrol', price: 45, image: '🚘', available: true },
            { id: 3, name: 'Mitsubishi Pajero', category: 'suv', seats: 7, bags: 4, transmission: 'Automatic', fuel: 'Diesel', price: 85, image: '🚐', available: true },
            { id: 4, name: 'Hyundai i10', category: 'economy', seats: 4, bags: 2, transmission: 'Manual', fuel: 'Petrol', price: 30, image: '🚗', available: true }
        ];

        // Testimonials data
        this.testimonials = [
            { id: 1, name: 'Sarah Johnson', country: 'USA', date: 'Aug 2024', rating: 5, comment: 'Amazing service! The car was waiting at the airport exactly when I arrived. The GPS made it so easy to find all the tourist sites.', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
            { id: 2, name: 'David Chen', country: 'China', date: 'Sep 2024', rating: 5, comment: 'RwandaGo made our gorilla trekking trip perfect. The guide was knowledgeable and the car was in excellent condition.', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
            { id: 3, name: 'Maria Garcia', country: 'Spain', date: 'Oct 2024', rating: 5, comment: 'Best car rental experience in Africa! The exact-hour booking matched our flight perfectly. Highly recommend!', avatar: 'https://randomuser.me/api/portraits/women/3.jpg' }
        ];

        this.displayVehicles();
        this.displayTestimonials();
        this.updateStats();
    }

    displayVehicles() {
        const vehiclesGrid = document.getElementById('vehiclesGrid');
        if (!vehiclesGrid) return;

        vehiclesGrid.innerHTML = this.vehicles.map(vehicle => `
            <div class="vehicle-card" data-id="${vehicle.id}">
                <div class="vehicle-image">${vehicle.image}</div>
                <div class="vehicle-info">
                    <h3>${vehicle.name}</h3>
                    <div class="vehicle-specs">
                        <span><i class="fas fa-users"></i> ${vehicle.seats} seats</span>
                        <span><i class="fas fa-suitcase"></i> ${vehicle.bags} bags</span>
                        <span><i class="fas fa-cog"></i> ${vehicle.transmission}</span>
                    </div>
                    <div class="vehicle-price">
                        $${vehicle.price} <span>/ day</span>
                    </div>
                    <button class="btn-book" onclick="homePage.handleBooking(${vehicle.id})">
                        <i class="fas fa-calendar-check"></i> Book Now
                    </button>
                </div>
            </div>
        `).join('');
    }

    displayTestimonials() {
        const testimonialsContainer = document.querySelector('.testimonials-slider');
        if (!testimonialsContainer) return;

        testimonialsContainer.innerHTML = this.testimonials.map(testimonial => `
            <div class="testimonial-card">
                <div class="testimonial-content">
                    <i class="fas fa-quote-left"></i>
                    <p>${testimonial.comment}</p>
                </div>
                <div class="testimonial-author">
                    <img src="${testimonial.avatar}" alt="${testimonial.name}">
                    <div>
                        <h4>${testimonial.name}</h4>
                        <p>${testimonial.country} - ${testimonial.date}</p>
                        <div class="rating">${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const stats = {
            travelers: 1250,
            vehicles: 24,
            support: '24/7',
            rating: 4.9
        };

        document.getElementById('statTravelers')?.setAttribute('data-count', stats.travelers);
        document.getElementById('statVehicles')?.setAttribute('data-count', stats.vehicles);
        document.getElementById('statRating')?.setAttribute('data-count', stats.rating);
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
                    'tourist': 'dashboard/tourist/index.html',
                    'admin': 'dashboard/admin/index.html',
                    'support': 'dashboard/support/index.html',
                    'driver': 'dashboard/driver/index.html'
                };
                window.location.href = roleRedirects[userData.role] || 'index.html';
            };
        } else {
            loginBtn.innerHTML = '<i class="fas fa-user"></i> Sign In';
            loginBtn.href = 'login.html';
        }
    }

    handleBooking(vehicleId) {
        const user = sessionStorage.getItem('rwandago_user') || localStorage.getItem('rwandago_user');
        if (user) {
            window.location.href = 'dashboard/tourist/new-booking.html';
        } else {
            sessionStorage.setItem('redirectAfterLogin', `dashboard/tourist/new-booking.html?vehicle=${vehicleId}`);
            window.location.href = 'login.html';
        }
    }

    handleQuickBooking(e) {
        e.preventDefault();
        const pickupDate = document.getElementById('pickupDate')?.value;
        const returnDate = document.getElementById('returnDate')?.value;
        const pickupLocation = document.getElementById('pickupLocation')?.value;

        if (!pickupDate || !returnDate || !pickupLocation) {
            this.showNotification('Please fill in all booking fields', 'error');
            return;
        }

        const user = sessionStorage.getItem('rwandago_user') || localStorage.getItem('rwandago_user');
        if (user) {
            sessionStorage.setItem('quickBookingData', JSON.stringify({ pickupDate, returnDate, pickupLocation }));
            window.location.href = 'dashboard/tourist/new-booking.html';
        } else {
            sessionStorage.setItem('redirectAfterLogin', 'dashboard/tourist/new-booking.html');
            sessionStorage.setItem('quickBookingData', JSON.stringify({ pickupDate, returnDate, pickupLocation }));
            window.location.href = 'login.html';
        }
    }

    handleContactSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const name = form.querySelector('input[placeholder="Your Name"]')?.value;
        const email = form.querySelector('input[placeholder="Your Email"]')?.value;
        const message = form.querySelector('textarea')?.value;

        if (!name || !email || !message) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        // Simulate sending email
        this.showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        form.reset();
    }

    handleNewsletterSubmit(e) {
        e.preventDefault();
        const input = e.target.querySelector('input');
        const email = input?.value;

        if (!email || !this.validateEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        this.showNotification('Subscribed successfully! Check your email for updates.', 'success');
        input.value = '';
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i><span>${message}</span>`;
        document.body.appendChild(notification);
        
        // Add styles if not already present
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

    initAnimations() {
        // Counter animation for stats
        const counters = document.querySelectorAll('.stat-item h3');
        counters.forEach(counter => {
            const updateCount = () => {
                const target = parseInt(counter.getAttribute('data-count') || counter.innerText);
                const current = parseInt(counter.innerText);
                const increment = target / 50;
                if (current < target) {
                    counter.innerText = Math.ceil(current + increment);
                    setTimeout(updateCount, 20);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });

        // Fade-in animation on scroll
        const fadeElements = document.querySelectorAll('.vehicle-card, .feature-card, .tour-card, .destination-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        fadeElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    }

    setupEventListeners() {
        // Mobile menu toggle
        const hamburger = document.querySelector('.mobile-menu');
        const navLinks = document.querySelector('.nav-links');
        if (hamburger) {
            hamburger.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                navbar.classList.toggle('scrolled', window.scrollY > 50);
            }
        });

        // Quick booking form
        const quickBookingForm = document.getElementById('quickBookingForm');
        if (quickBookingForm) {
            quickBookingForm.addEventListener('submit', (e) => this.handleQuickBooking(e));
        }

        // Contact form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }

        // Newsletter form
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => this.handleNewsletterSubmit(e));
        }

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    navLinks?.classList.remove('active');
                }
            });
        });
    }
}

// Initialize homepage when DOM is ready
let homePage;
document.addEventListener('DOMContentLoaded', () => {
    homePage = new HomePage();
    window.homePage = homePage;
});