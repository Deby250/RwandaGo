// ========================================
// MYSQL DATABASE CONNECTION WITH AUTO TABLE CREATION
// ========================================

const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3308,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rwandago_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Promisify for async/await
const promisePool = pool.promise();

// Execute query helper
const query = async (sql, params = []) => {
    try {
        const [rows] = await promisePool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// Create all tables
const createTables = async () => {
    console.log('📋 Creating database tables...');
    
    // Users table
    await query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            passport_number VARCHAR(50),
            nationality VARCHAR(50) DEFAULT 'Other',
            date_of_birth DATE,
            address_street VARCHAR(255),
            address_city VARCHAR(100),
            address_country VARCHAR(100),
            profile_image VARCHAR(255) DEFAULT 'default-avatar.png',
            role ENUM('tourist', 'admin', 'support', 'driver') DEFAULT 'tourist',
            is_active BOOLEAN DEFAULT TRUE,
            is_verified BOOLEAN DEFAULT FALSE,
            last_login DATETIME,
            password_reset_token VARCHAR(255),
            password_reset_expires DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_role (role)
        )
    `);
    console.log('✅ Users table ready');

    // Vehicles table
    await query(`
        CREATE TABLE IF NOT EXISTS vehicles (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            brand VARCHAR(50) NOT NULL,
            model VARCHAR(50) NOT NULL,
            year INT NOT NULL,
            category ENUM('economy', 'sedan', 'suv', 'luxury', 'van', 'truck') NOT NULL,
            transmission ENUM('Manual', 'Automatic') NOT NULL,
            fuel_type ENUM('Petrol', 'Diesel', 'Electric', 'Hybrid') NOT NULL,
            seats INT NOT NULL,
            luggage_capacity INT NOT NULL,
            doors INT NOT NULL,
            price_per_day DECIMAL(10,2) NOT NULL,
            deposit DECIMAL(10,2) NOT NULL,
            features JSON,
            location ENUM('Kigali Airport', 'Downtown Kigali', 'Hotel des Mille Collines') NOT NULL,
            plate_number VARCHAR(20) UNIQUE NOT NULL,
            mileage INT DEFAULT 0,
            color VARCHAR(30) NOT NULL,
            status ENUM('available', 'rented', 'maintenance', 'reserved') DEFAULT 'available',
            rating DECIMAL(3,2) DEFAULT 0,
            total_reviews INT DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_category (category),
            INDEX idx_status (status),
            INDEX idx_price (price_per_day)
        )
    `);
    console.log('✅ Vehicles table ready');

    // Tours table
    await query(`
        CREATE TABLE IF NOT EXISTS tours (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(200) NOT NULL,
            slug VARCHAR(200) UNIQUE NOT NULL,
            description TEXT NOT NULL,
            short_description VARCHAR(500) NOT NULL,
            duration_days INT NOT NULL,
            duration_nights INT DEFAULT 0,
            price_adult DECIMAL(10,2) NOT NULL,
            price_child DECIMAL(10,2),
            price_infant DECIMAL(10,2),
            group_min INT DEFAULT 1,
            group_max INT NOT NULL,
            category ENUM('adventure', 'nature', 'cultural', 'wildlife', 'relaxation', 'city') NOT NULL,
            difficulty ENUM('easy', 'moderate', 'challenging') DEFAULT 'moderate',
            highlights JSON,
            inclusions JSON,
            exclusions JSON,
            start_location VARCHAR(200) NOT NULL,
            end_location VARCHAR(200) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            featured BOOLEAN DEFAULT FALSE,
            rating DECIMAL(3,2) DEFAULT 0,
            total_reviews INT DEFAULT 0,
            tags JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_category (category),
            INDEX idx_featured (featured)
        )
    `);
    console.log('✅ Tours table ready');

    // Bookings table
    await query(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INT PRIMARY KEY AUTO_INCREMENT,
            booking_number VARCHAR(20) UNIQUE NOT NULL,
            user_id INT NOT NULL,
            vehicle_id INT NOT NULL,
            tour_id INT NULL,
            start_date DATETIME NOT NULL,
            end_date DATETIME NOT NULL,
            pickup_location VARCHAR(100) NOT NULL,
            return_location VARCHAR(100) NOT NULL,
            duration_days INT NOT NULL,
            duration_hours INT DEFAULT 0,
            base_price DECIMAL(10,2) NOT NULL,
            extras JSON,
            extras_total DECIMAL(10,2) DEFAULT 0,
            total_amount DECIMAL(10,2) NOT NULL,
            deposit_amount DECIMAL(10,2) NOT NULL,
            remaining_amount DECIMAL(10,2) NOT NULL,
            deposit_paid BOOLEAN DEFAULT FALSE,
            status ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled') DEFAULT 'pending',
            payment_status ENUM('pending', 'deposit_paid', 'fully_paid', 'refunded') DEFAULT 'pending',
            special_requests TEXT,
            cancellation_reason TEXT,
            cancelled_at DATETIME,
            completed_at DATETIME,
            rating INT CHECK (rating BETWEEN 1 AND 5),
            review TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
            FOREIGN KEY (tour_id) REFERENCES tours(id),
            INDEX idx_user (user_id),
            INDEX idx_vehicle (vehicle_id),
            INDEX idx_status (status),
            INDEX idx_dates (start_date, end_date)
        )
    `);
    console.log('✅ Bookings table ready');

    // Payments table
    await query(`
        CREATE TABLE IF NOT EXISTS payments (
            id INT PRIMARY KEY AUTO_INCREMENT,
            booking_id INT NOT NULL,
            user_id INT NOT NULL,
            transaction_id VARCHAR(50) UNIQUE NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            currency VARCHAR(3) DEFAULT 'USD',
            payment_type ENUM('deposit', 'remaining', 'full') NOT NULL,
            method ENUM('credit_card', 'debit_card', 'paypal', 'mobile_money', 'bank_transfer', 'cash') NOT NULL,
            status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
            receipt_url VARCHAR(255),
            refund_amount DECIMAL(10,2) DEFAULT 0,
            refund_reason TEXT,
            refunded_at DATETIME,
            paid_at DATETIME,
            failed_reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            INDEX idx_booking (booking_id),
            INDEX idx_user (user_id),
            INDEX idx_transaction (transaction_id)
        )
    `);
    console.log('✅ Payments table ready');

    // Support Tickets table
    await query(`
        CREATE TABLE IF NOT EXISTS support_tickets (
            id INT PRIMARY KEY AUTO_INCREMENT,
            ticket_number VARCHAR(20) UNIQUE NOT NULL,
            user_id INT NOT NULL,
            assigned_to INT NULL,
            subject VARCHAR(200) NOT NULL,
            category ENUM('booking', 'payment', 'vehicle', 'tour', 'account', 'technical', 'other') NOT NULL,
            priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
            status ENUM('open', 'in-progress', 'resolved', 'closed') DEFAULT 'open',
            resolved_at DATETIME,
            resolved_by INT,
            rating INT CHECK (rating BETWEEN 1 AND 5),
            feedback TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (assigned_to) REFERENCES users(id),
            INDEX idx_user (user_id),
            INDEX idx_status (status),
            INDEX idx_priority (priority)
        )
    `);
    console.log('✅ Support Tickets table ready');

    // Ticket Messages table
    await query(`
        CREATE TABLE IF NOT EXISTS ticket_messages (
            id INT PRIMARY KEY AUTO_INCREMENT,
            ticket_id INT NOT NULL,
            sender_id INT NOT NULL,
            message TEXT NOT NULL,
            attachments JSON,
            is_staff BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
            FOREIGN KEY (sender_id) REFERENCES users(id),
            INDEX idx_ticket (ticket_id)
        )
    `);
    console.log('✅ Ticket Messages table ready');

    // Reviews table
    await query(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            booking_id INT NOT NULL,
            vehicle_id INT NULL,
            tour_id INT NULL,
            rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (booking_id) REFERENCES bookings(id),
            FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
            FOREIGN KEY (tour_id) REFERENCES tours(id),
            INDEX idx_user (user_id),
            INDEX idx_vehicle (vehicle_id),
            INDEX idx_tour (tour_id)
        )
    `);
    console.log('✅ Reviews table ready');
    
    console.log('🎉 All tables created successfully!');
};

// Test connection and create tables
const connectDB = async () => {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ MySQL Connected successfully');
        connection.release();
        
        // Create tables
        await createTables();
        
        return true;
    } catch (error) {
        console.error('❌ MySQL Connection failed:', error.message);
        console.log('\n💡 Troubleshooting tips:');
        console.log('   1. Make sure MySQL is installed and running');
        console.log('   2. Check your .env file credentials');
        console.log('   3. Create the database manually: CREATE DATABASE rwandago;');
        console.log('   4. Then run: npm run seed\n');
        return false;
    }
};

module.exports = { pool: promisePool, query, connectDB };