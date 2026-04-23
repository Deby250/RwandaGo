// Quick fix: Drop and recreate database
const mysql = require('mysql2');

const conn = mysql.createConnection({
    host: 'localhost',
    port: 3308,
    user: 'root',
    password: ''
});

conn.connect((err) => {
    if (err) {
        console.log('Connection error:', err.message);
        process.exit(1);
    }
    
    console.log('Connected to MySQL');
    
    conn.query('DROP DATABASE IF EXISTS rwandago_db', (e, r) => {
        if (e) {
            console.log('Drop error:', e.message);
        } else {
            console.log('✅ Database dropped');
            conn.query('CREATE DATABASE rwandago_db', (e2, r2) => {
                if (e2) {
                    console.log('Create error:', e2.message);
                } else {
                    console.log('✅ Database recreated');
                }
                conn.end();
                process.exit(0);
            });
        }
    });
});