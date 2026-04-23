// ========================================
// VEHICLE MODEL (MySQL)
// ========================================

const db = require('../config/database');

const Vehicle = {
    // Find all available vehicles
    findAvailable: async () => {
        const sql = 'SELECT * FROM vehicles WHERE status = "available" AND is_active = TRUE';
        return await db.query(sql);
    },

    // Find vehicle by ID
    findById: async (id) => {
        const sql = 'SELECT * FROM vehicles WHERE id = ?';
        const vehicles = await db.query(sql, [id]);
        return vehicles[0] || null;
    },

    // Get all vehicles with pagination
    findAll: async (limit = 10, offset = 0) => {
        const sql = 'SELECT * FROM vehicles WHERE is_active = TRUE LIMIT ? OFFSET ?';
        return await db.query(sql, [limit, offset]);
    },

    // Count total vehicles
    count: async () => {
        const sql = 'SELECT COUNT(*) as total FROM vehicles WHERE is_active = TRUE';
        const result = await db.query(sql);
        return result[0].total;
    },

    // Create new vehicle
    create: async (vehicleData) => {
        const { name, brand, model, year, category, transmission, fuel_type, seats, luggage_capacity, doors, price_per_day, deposit, features, location, plate_number, mileage, color } = vehicleData;
        
        const sql = `INSERT INTO vehicles (name, brand, model, year, category, transmission, fuel_type, seats, luggage_capacity, doors, price_per_day, deposit, features, location, plate_number, mileage, color, status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')`;
        const result = await db.query(sql, [name, brand, model, year, category, transmission, fuel_type, seats, luggage_capacity, doors, price_per_day, deposit, JSON.stringify(features), location, plate_number, mileage, color]);
        
        return await Vehicle.findById(result.insertId);
    },

    // Update vehicle
    update: async (id, vehicleData) => {
        const fields = [];
        const values = [];
        
        const allowedFields = ['name', 'brand', 'model', 'year', 'category', 'transmission', 'fuel_type', 'seats', 'luggage_capacity', 'doors', 'price_per_day', 'deposit', 'features', 'location', 'plate_number', 'mileage', 'color', 'status'];
        
        for (const [key, value] of Object.entries(vehicleData)) {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = ?`);
                values.push(key === 'features' ? JSON.stringify(value) : value);
            }
        }
        
        if (fields.length === 0) return null;
        
        values.push(id);
        const sql = `UPDATE vehicles SET ${fields.join(', ')} WHERE id = ?`;
        await db.query(sql, values);
        
        return await Vehicle.findById(id);
    },

    // Delete vehicle (soft delete)
    delete: async (id) => {
        const sql = 'UPDATE vehicles SET is_active = FALSE WHERE id = ?';
        await db.query(sql, [id]);
        return true;
    },

    // Update vehicle status
    updateStatus: async (id, status) => {
        const sql = 'UPDATE vehicles SET status = ? WHERE id = ?';
        await db.query(sql, [status, id]);
        return await Vehicle.findById(id);
    },

    // Get vehicles by category
    findByCategory: async (category) => {
        const sql = 'SELECT * FROM vehicles WHERE category = ? AND status = "available" AND is_active = TRUE';
        return await db.query(sql, [category]);
    },

    // Search vehicles
    search: async (filters) => {
        let sql = 'SELECT * FROM vehicles WHERE is_active = TRUE';
        const params = [];
        
        if (filters.category) {
            sql += ' AND category = ?';
            params.push(filters.category);
        }
        if (filters.transmission) {
            sql += ' AND transmission = ?';
            params.push(filters.transmission);
        }
        if (filters.seats) {
            sql += ' AND seats >= ?';
            params.push(filters.seats);
        }
        if (filters.maxPrice) {
            sql += ' AND price_per_day <= ?';
            params.push(filters.maxPrice);
        }
        
        return await db.query(sql, params);
    }
};

module.exports = Vehicle;