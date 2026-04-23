// ========================================
// RWANDAGO - CONFIGURATION
// API endpoints and app settings
// ========================================

const APP_CONFIG = {
    name: 'RwandaGo',
    version: '1.0.0',
    environment: 'development',
    
    api: {
        baseUrl: 'http://localhost:5000/api',
        timeout: 30000,
    },
    
    payment: {
        depositPercentage: 20,
        currency: 'USD',
    },
    
    contact: {
        phone: '+250788123456',
        email: 'support@rwandago.rw',
        emergency: '+250788123457',
        whatsapp: '+250788123456',
    }
};

const ROLE_REDIRECTS = {
    'tourist': 'dashboard/tourist/index.html',
    'admin': 'dashboard/admin/index.html',
    'support': 'dashboard/support/index.html',
    'driver': 'dashboard/driver/index.html'
};