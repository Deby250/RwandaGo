// ========================================
// CREATE DATABASE SCRIPT
// Run: npm run db:create
// ========================================

const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }
    
    console.log('✅ Connected to MySQL server');
    
    const dbName = process.env.DB_NAME || 'rwandago';
    
    connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, (err, result) => {
        if (err) {
            console.error('❌ Failed to create database:', err.message);
            process.exit(1);
        }
        
        console.log(`✅ Database '${dbName}' created or already exists`);
        connection.end();
        process.exit(0);
    });
});