// ========================================
// RWANDAGO - FAQ PAGE FUNCTIONALITY
// Handles FAQ accordion and search
// ========================================

class FAQPage {
    constructor() {
        this.faqs = [];
        this.filteredFaqs = [];
        this.currentCategory = 'all';
        this.currentSearch = '';
        this.init();
    }

    async init() {
        await this.loadFAQs();
        this.setupEventListeners();
        this.updateNavBar();
    }

    async loadFAQs() {
        this.faqs = [
            { id: 1, category: 'booking', question: 'How do I book a car?', answer: 'Simply create an account, select your pickup and return dates, choose a vehicle, and make the 20% deposit payment. Your booking will be confirmed instantly.', popular: true },
            { id: 2, category: 'booking', question: 'Can I modify my booking after confirmation?', answer: 'Yes, you can modify your booking up to 48 hours before pickup. Contact our support team to make changes.', popular: true },
            { id: 3, category: 'documents', question: 'What documents do I need to rent a car?', answer: 'You need a valid driver\'s license, passport, and international driving permit (if your license is not in English).', popular: true },
            { id: 4, category: 'documents', question: 'Is a deposit required?', answer: 'Yes, a 20% deposit is required to confirm your booking. The remaining balance is due upon vehicle pickup.', popular: false },
            { id: 5, category: 'insurance', question: 'Is insurance included?', answer: 'Basic insurance is included in all rentals. Premium insurance with zero excess is available as an add-on.', popular: true },
            { id: 6, category: 'insurance', question: 'What does the premium insurance cover?', answer: 'Premium insurance covers zero excess, tire and windshield damage, and roadside assistance.', popular: false },
            { id: 7, category: 'cancellation', question: 'What is the cancellation policy?', answer: 'Free cancellation up to 24 hours before pickup. After that, the deposit is non-refundable.', popular: true },
            { id: 8, category: 'cancellation', question: 'Can I get a refund if I cancel late?', answer: 'Cancellations within 24 hours of pickup will forfeit the deposit. No-shows are charged the full amount.', popular: false },
            { id: 9, category: 'payments', question: 'What payment methods do you accept?', answer: 'We accept credit cards (Visa, Mastercard, Amex), PayPal, and mobile money (MTN MoMo, Airtel Money).', popular: true },
            { id: 10, category: 'payments', question: 'Is my payment information secure?', answer: 'Yes, we use SSL encryption and PCI-compliant payment processors to secure your information.', popular: false },
            { id: 11, category: 'vehicle', question: 'What happens if the car breaks down?', answer: 'Call our 24/7 roadside assistance hotline at +250 788 123 456. We\'ll send help immediately.', popular: true },
            { id: 12, category: 'vehicle', question: 'Can I return the car to a different location?', answer: 'Yes, one-way rentals are available for an additional fee. Contact support for details.', popular: false },
            { id: 13, category: 'fuel', question: 'What is the fuel policy?', answer: 'We provide the car with a full tank. Please return it with a full tank, or you\'ll be charged for the missing fuel.', popular: true },
            { id: 14, category: 'fuel', question: 'What type of fuel do the cars use?', answer: 'Most vehicles use petrol (gasoline). Some SUVs and luxury vehicles use diesel. Check the vehicle details.', popular: false },
            { id: 15, category: 'age', question: 'Is there a minimum age requirement?', answer: 'You must be at least 21 years old to rent a vehicle. Drivers under 25 may incur a young driver surcharge.', popular: true }
        ];
        
        this.filteredFaqs = [...this.faqs];
        this.displayFAQs();
        this.updateCategoryCounts();
    }

    displayFAQs() {
        let filtered = [...this.faqs];
        
        // Filter by category
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(f => f.category === this.currentCategory);
        }
        
        // Filter by search
        if (this.currentSearch) {
            const searchLower = this.currentSearch.toLowerCase();
            filtered = filtered.filter(f => 
                f.question.toLowerCase().includes(searchLower) || 
                f.answer.toLowerCase().includes(searchLower)
            );
        }
        
        this.filteredFaqs = filtered;
        this.renderFAQs();
        this.updateResultsCount();
    }

    renderFAQs() {
        const container = document.getElementById('faqContainer');
        if (!container) return;
        
        if (this.filteredFaqs.length === 0) {
            container.innerHTML = `
                <div class="no-results" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-search" style="font-size: 3rem; color: #ccc;"></i>
                    <h3>No FAQs found</h3>
                    <p>Try a different search term or category</p>
                    <button class="btn-primary" onclick="faqPage.resetFilters()">Reset Filters</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.filteredFaqs.map(faq => `
            <div class="faq-item" data-category="${faq.category}">
                <div class="faq-question" onclick="faqPage.toggleFAQ(this)">
                    ${faq.question}
                    ${faq.popular ? '<span class="popular-badge">Popular</span>' : ''}
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="faq-answer">${faq.answer}</div>
            </div>
        `).join('');
        
        // Add styles if not present
        if (!document.querySelector('#faq-styles')) {
            const style = document.createElement('style');
            style.id = 'faq-styles';
            style.textContent = `
                .faq-item {
                    background: white;
                    border-radius: 12px;
                    margin-bottom: 1rem;
                    overflow: hidden;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                }
                .faq-question {
                    padding: 1.25rem;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: 600;
                    background: white;
                    transition: all 0.3s;
                }
                .faq-question:hover {
                    background: #f8f9fa;
                }
                .faq-question.active {
                    background: #f8f9fa;
                    border-bottom: 1px solid #e0e0e0;
                }
                .faq-question i {
                    transition: transform 0.3s;
                    color: #e67e22;
                }
                .faq-question.active i {
                    transform: rotate(180deg);
                }
                .faq-answer {
                    padding: 0 1.25rem;
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease, padding 0.3s ease;
                    color: #6c757d;
                    line-height: 1.6;
                }
                .faq-answer.show {
                    padding: 1.25rem;
                    max-height: 500px;
                }
                .popular-badge {
                    background: #e67e22;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: normal;
                    margin-left: 0.5rem;
                }
            `;
            document.head.appendChild(style);
        }
    }

    updateCategoryCounts() {
        const categories = ['all', 'booking', 'documents', 'insurance', 'cancellation', 'payments', 'vehicle', 'fuel', 'age'];
        categories.forEach(cat => {
            const count = cat === 'all' ? this.faqs.length : this.faqs.filter(f => f.category === cat).length;
            const filterBtn = document.querySelector(`.filter-chip[data-category="${cat}"]`);
            if (filterBtn) {
                filterBtn.innerHTML = `${cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)} <span class="count">(${count})</span>`;
            }
        });
    }

    updateResultsCount() {
        const countElement = document.getElementById('resultsCount');
        if (countElement) {
            countElement.textContent = `Found ${this.filteredFaqs.length} FAQ${this.filteredFaqs.length !== 1 ? 's' : ''}`;
        }
    }

    toggleFAQ(element) {
        element.classList.toggle('active');
        const answer = element.nextElementSibling;
        answer.classList.toggle('show');
    }

    searchFAQs() {
        const searchInput = document.getElementById('searchFAQs');
        if (searchInput) {
            this.currentSearch = searchInput.value;
            this.displayFAQs();
        }
    }

    filterByCategory(category) {
        this.currentCategory = category;
        
        // Update active state
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.remove('active');
            if (chip.dataset.category === category) {
                chip.classList.add('active');
            }
        });
        
        this.displayFAQs();
        
        // Update URL
        const params = new URLSearchParams();
        if (category !== 'all') params.set('category', category);
        if (this.currentSearch) params.set('search', this.currentSearch);
        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.pushState({}, '', newUrl);
    }

    resetFilters() {
        this.currentCategory = 'all';
        this.currentSearch = '';
        
        // Update UI
        document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
        document.querySelector('.filter-chip[data-category="all"]')?.classList.add('active');
        const searchInput = document.getElementById('searchFAQs');
        if (searchInput) searchInput.value = '';
        
        this.displayFAQs();
        
        // Update URL
        window.history.pushState({}, '', window.location.pathname);
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
        
        // Filter chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                this.filterByCategory(chip.dataset.category);
            });
        });
        
        // Search input with debounce
        const searchInput = document.getElementById('searchFAQs');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.currentSearch = e.target.value;
                    this.displayFAQs();
                    
                    // Update URL
                    const params = new URLSearchParams();
                    if (this.currentCategory !== 'all') params.set('category', this.currentCategory);
                    if (this.currentSearch) params.set('search', this.currentSearch);
                    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
                    window.history.pushState({}, '', newUrl);
                }, 300);
            });
        }
        
        // Reset button
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
        
        // Load filters from URL
        const params = new URLSearchParams(window.location.search);
        if (params.has('category')) {
            this.currentCategory = params.get('category');
            const chip = document.querySelector(`.filter-chip[data-category="${this.currentCategory}"]`);
            if (chip) chip.classList.add('active');
        }
        if (params.has('search')) {
            this.currentSearch = params.get('search');
            if (searchInput) searchInput.value = this.currentSearch;
        }
        this.displayFAQs();
    }
}

// Initialize FAQ page
let faqPage;
document.addEventListener('DOMContentLoaded', () => {
    faqPage = new FAQPage();
    window.faqPage = faqPage;
});