// ========================================
// SUPPORT DASHBOARD - COMPLETE LOGIC
// Handles all support dashboard functionality
// ========================================

class SupportDashboard {
    constructor() {
        this.currentUser = null;
        this.tickets = [];
        this.customers = [];
        this.activeChat = null;
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
        if (this.currentUser.role !== 'support') { alert('Access denied. Support portal only.'); window.location.href = '../../index.html'; return false; }
        return true;
    }

    loadUserData() {
        document.getElementById('userName').textContent = this.currentUser.name || 'Support';
    }

    async loadDashboardData() {
        this.tickets = [
            { id: 'TKT001', customer: 'John Doe', subject: 'Late Return Issue', priority: 'high', status: 'open', date: 'Dec 1, 2024', messages: [{ sender: 'John Doe', message: 'I returned my car late, what are the charges?', date: 'Dec 1, 2024' }] },
            { id: 'TKT002', customer: 'Sarah Chen', subject: 'Payment Failed', priority: 'medium', status: 'in-progress', date: 'Nov 30, 2024', messages: [{ sender: 'Sarah Chen', message: 'My payment keeps failing', date: 'Nov 30, 2024' }] },
            { id: 'TKT003', customer: 'Maria Garcia', subject: 'Vehicle Issue', priority: 'high', status: 'open', date: 'Nov 29, 2024', messages: [{ sender: 'Maria Garcia', message: 'Check engine light is on', date: 'Nov 29, 2024' }] }
        ];
        
        this.customers = [
            { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+250788123456', totalTickets: 2, status: 'active' },
            { id: 2, name: 'Sarah Chen', email: 'sarah@example.com', phone: '+250788123457', totalTickets: 1, status: 'active' }
        ];
        
        this.updateStats();
        this.loadTickets();
        this.loadCustomers();
    }

    updateStats() {
        const openTickets = this.tickets.filter(t => t.status === 'open').length;
        const inProgressTickets = this.tickets.filter(t => t.status === 'in-progress').length;
        const resolvedTickets = this.tickets.filter(t => t.status === 'resolved').length;
        
        document.getElementById('openTickets').textContent = openTickets;
        document.getElementById('inProgressTickets').textContent = inProgressTickets;
        document.getElementById('resolvedTickets').textContent = resolvedTickets;
        document.getElementById('totalCustomers').textContent = this.customers.length;
    }

    loadTickets(filter = 'all', search = '') {
        let filtered = [...this.tickets];
        if (filter !== 'all') filtered = filtered.filter(t => t.status === filter);
        if (search) filtered = filtered.filter(t => t.id.toLowerCase().includes(search.toLowerCase()) || t.customer.toLowerCase().includes(search.toLowerCase()));
        
        const tbody = document.getElementById('ticketsList');
        if (!tbody) return;
        if (filtered.length === 0) { tbody.innerHTML = '<tr><td colspan="6" class="text-center">No tickets found</td></tr>'; return; }
        tbody.innerHTML = filtered.map(t => `
            <tr>
                <td>${t.id}</td><td>${t.customer}</td><td>${t.subject}</td>
                <td><span class="priority-${t.priority}">${t.priority}</span></td>
                <td><span class="ticket-status status-${t.status === 'open' ? 'open' : t.status === 'in-progress' ? 'progress' : 'resolved'}">${t.status}</span></td>
                <td><button class="action-btn" onclick="supportDashboard.viewTicket('${t.id}')">View</button>
                <button class="action-btn" onclick="supportDashboard.updateTicketStatus('${t.id}')">Update</button></td>
            </tr>
        `).join('');
    }

    loadCustomers(search = '') {
        let filtered = [...this.customers];
        if (search) filtered = filtered.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));
        
        const tbody = document.getElementById('customersList');
        if (!tbody) return;
        if (filtered.length === 0) { tbody.innerHTML = '<tr><td colspan="6" class="text-center">No customers found</td></tr>'; return; }
        tbody.innerHTML = filtered.map(c => `
            <tr><td>${c.id}</td><td>${c.name}</td><td>${c.email}</td><td>${c.phone}</td><td>${c.totalTickets}</td>
            <td><button class="action-btn" onclick="supportDashboard.viewCustomer(${c.id})">View Details</button></td>
        </tr>
        `).join('');
    }

    viewTicket(id) {
        const ticket = this.tickets.find(t => t.id === id);
        if (!ticket) return;
        
        const modal = document.getElementById('ticketModal');
        const modalBody = document.getElementById('ticketModalBody');
        
        modalBody.innerHTML = `
            <p><strong>Ticket ID:</strong> ${ticket.id}</p>
            <p><strong>Customer:</strong> ${ticket.customer}</p>
            <p><strong>Subject:</strong> ${ticket.subject}</p>
            <p><strong>Priority:</strong> ${ticket.priority}</p>
            <p><strong>Status:</strong> ${ticket.status}</p>
            <p><strong>Date:</strong> ${ticket.date}</p>
            <div class="message-bubble"><strong>${ticket.messages[0].sender}:</strong><br>${ticket.messages[0].message}<br><small>${ticket.messages[0].date}</small></div>
            <textarea id="replyMessage" class="w-100" rows="3" placeholder="Type your reply..."></textarea>
        `;
        modal.style.display = 'flex';
        
        const replyBtn = document.getElementById('replyBtn');
        if (replyBtn) replyBtn.onclick = () => {
            const reply = document.getElementById('replyMessage').value;
            if (reply.trim()) {
                ticket.messages.push({ sender: 'Support Agent', message: reply, date: new Date().toLocaleDateString() });
                this.showNotification(`Reply sent to ${ticket.customer}`, 'success');
                modal.style.display = 'none';
                this.loadTickets();
            } else { alert('Please enter a reply message'); }
        };
    }

    updateTicketStatus(id) {
        const ticket = this.tickets.find(t => t.id === id);
        if (ticket) {
            const newStatus = prompt('Enter new status (open, in-progress, resolved, closed):', ticket.status);
            if (newStatus && ['open', 'in-progress', 'resolved', 'closed'].includes(newStatus)) {
                ticket.status = newStatus;
                this.loadTickets();
                this.updateStats();
                this.showNotification(`Ticket ${id} status updated to ${newStatus}`, 'success');
            }
        }
    }

    viewCustomer(id) {
        const customer = this.customers.find(c => c.id === id);
        if (customer) {
            alert(`Customer Details:\nName: ${customer.name}\nEmail: ${customer.email}\nPhone: ${customer.phone}\nTotal Tickets: ${customer.totalTickets}\nStatus: ${customer.status}`);
        }
    }

    sendChatMessage() {
        const input = document.getElementById('chatInput');
        if (input && input.value.trim()) {
            const messagesDiv = document.getElementById('chatMessages');
            const newMessage = document.createElement('div');
            newMessage.className = 'message agent';
            newMessage.innerHTML = `<div class="message-bubble">${input.value}</div>`;
            messagesDiv.appendChild(newMessage);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
            input.value = '';
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
        const pageMap = { 'overview': 'overviewPage', 'tickets': 'ticketsPage', 'chat': 'chatPage', 'emergency': 'emergencyPage', 'customers': 'customersPage' };
        const pageId = pageMap[pageName];
        if (pageId) document.getElementById(pageId).style.display = 'block';
        
        const titles = { 'overview': 'Support Overview', 'tickets': 'Support Tickets', 'chat': 'Live Chat', 'emergency': 'Emergency Calls', 'customers': 'Customers' };
        document.getElementById('pageTitle').innerHTML = `<i class="fas ${this.getPageIcon(pageName)}"></i> ${titles[pageName] || 'Dashboard'}`;
        
        document.querySelectorAll('.sidebar-nav a').forEach(link => { link.classList.remove('active'); if (link.dataset.page === pageName) link.classList.add('active'); });
        if (pageName === 'tickets') this.loadTickets();
        else if (pageName === 'customers') this.loadCustomers();
        window.location.hash = pageName;
    }

    getPageIcon(pageName) {
        const icons = { 'overview': 'fa-tachometer-alt', 'tickets': 'fa-ticket-alt', 'chat': 'fa-comments', 'emergency': 'fa-ambulance', 'customers': 'fa-users' };
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
        
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) sendBtn.addEventListener('click', () => this.sendChatMessage());
        
        const chatInput = document.getElementById('chatInput');
        if (chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.sendChatMessage(); });
        
        const filterChips = document.querySelectorAll('.filter-chip');
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                filterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                const filter = chip.dataset.filter;
                if (document.getElementById('ticketsList')) this.loadTickets(filter);
            });
        });
        
        const modalClose = document.querySelectorAll('.close, .modal-close');
        modalClose.forEach(el => el.addEventListener('click', () => document.getElementById('ticketModal')?.style.display = 'none'));
        
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
document.addEventListener('DOMContentLoaded', () => { window.supportDashboard = new SupportDashboard(); });