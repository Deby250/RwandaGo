const db = require('../database/db');
const { generateBookingNumber } = require('../utils/helpers');

const tourController = {
    async getAllTours(req, res) {
        const { category, search } = req.query;
        
        let query = 'SELECT * FROM tours WHERE is_active = 1';
        const params = [];
        
        if (category && category !== 'all') {
            query += ' AND category = ?';
            params.push(category);
        }
        
        if (search) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        query += ' ORDER BY featured DESC, created_at DESC';
        
        try {
            const tours = await db.all(query, params);
            res.json({ tours });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    async getTour(req, res) {
        const { id } = req.params;
        
        try {
            const tour = await db.get('SELECT * FROM tours WHERE id = ? AND is_active = 1', [id]);
            if (!tour) {
                return res.status(404).json({ error: 'Tour not found' });
            }
            res.json({ tour });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    async bookTour(req, res) {
        const { id } = req.params;
        const { bookingDate, numberOfAdults, numberOfChildren, numberOfInfants, specialRequests } = req.body;
        
        try {
            const tour = await db.get('SELECT * FROM tours WHERE id = ?', [id]);
            if (!tour) {
                return res.status(404).json({ error: 'Tour not found' });
            }
            
            const totalPrice = (numberOfAdults * tour.price_adult) +
                              (numberOfChildren * (tour.price_child || 0)) +
                              (numberOfInfants * (tour.price_infant || 0));
            
            const bookingNumber = generateBookingNumber();
            
            const result = await db.run(
                `INSERT INTO tour_bookings 
                 (booking_number, user_id, tour_id, booking_date, number_of_adults, 
                  number_of_children, number_of_infants, total_price, special_requests)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [bookingNumber, req.user.id, id, bookingDate, numberOfAdults, 
                 numberOfChildren, numberOfInfants, totalPrice, specialRequests]
            );
            
            res.status(201).json({
                success: true,
                message: 'Tour booked successfully',
                bookingId: result.lastID,
                bookingNumber,
                totalPrice
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = tourController;