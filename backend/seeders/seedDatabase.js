// ========================================
// DATABASE SEEDER WITH AUTO TABLE CREATION
// Run: npm run seed
// ========================================

const bcrypt = require('bcryptjs');
const { query, connectDB } = require('../config/database');

const users = [
    {
        firstName: 'John', lastName: 'Doe', email: 'tourist@rwandago.com',
        password: 'password123', phone: '+250788123456', role: 'tourist'
    },
    {
        firstName: 'Admin', lastName: 'User', email: 'admin@rwandago.com',
        password: 'password123', phone: '+250788123457', role: 'admin'
    },
    {
        firstName: 'Support', lastName: 'Agent', email: 'support@rwandago.com',
        password: 'password123', phone: '+250788123458', role: 'support'
    },
    {
        firstName: 'Driver', lastName: 'Guide', email: 'driver@rwandago.com',
        password: 'password123', phone: '+250788123459', role: 'driver'
    }
];

const vehicles = [
    {
        name: 'Toyota RAV4', brand: 'Toyota', model: 'RAV4', year: 2023,
        category: 'suv', transmission: 'Automatic', fuelType: 'Petrol',
        seats: 5, luggageCapacity: 3, doors: 4, pricePerDay: 55, deposit: 110,
        features: JSON.stringify(['GPS', 'Bluetooth', 'Backup Camera']),
        location: 'Kigali Airport', plateNumber: 'RAB 123A', color: 'White'
    },
    {
        name: 'Suzuki Jimny', brand: 'Suzuki', model: 'Jimny', year: 2023,
        category: 'suv', transmission: 'Manual', fuelType: 'Petrol',
        seats: 4, luggageCapacity: 2, doors: 3, pricePerDay: 45, deposit: 90,
        features: JSON.stringify(['Bluetooth', 'Off-road capable']),
        location: 'Downtown Kigali', plateNumber: 'RAB 456B', color: 'Green'
    },
    {
        name: 'Mitsubishi Pajero', brand: 'Mitsubishi', model: 'Pajero', year: 2022,
        category: 'suv', transmission: 'Automatic', fuelType: 'Diesel',
        seats: 7, luggageCapacity: 4, doors: 5, pricePerDay: 85, deposit: 170,
        features: JSON.stringify(['GPS', 'Bluetooth', 'Cruise Control']),
        location: 'Kigali Airport', plateNumber: 'RAB 789C', color: 'Silver'
    },
    {
        name: 'Hyundai i10', brand: 'Hyundai', model: 'i10', year: 2023,
        category: 'economy', transmission: 'Manual', fuelType: 'Petrol',
        seats: 4, luggageCapacity: 2, doors: 4, pricePerDay: 30, deposit: 60,
        features: JSON.stringify(['USB Port', 'Air Conditioning']),
        location: 'Kigali Airport', plateNumber: 'RAB 101D', color: 'Red'
    },
    {
        name: 'Toyota Camry', brand: 'Toyota', model: 'Camry', year: 2023,
        category: 'sedan', transmission: 'Automatic', fuelType: 'Petrol',
        seats: 5, luggageCapacity: 3, doors: 4, pricePerDay: 65, deposit: 130,
        features: JSON.stringify(['GPS', 'Bluetooth', 'Leather Seats']),
        location: 'Downtown Kigali', plateNumber: 'RAB 202E', color: 'Black'
    }
];

const tours = [
    {
        name: 'Volcanoes National Park Adventure',
        slug: 'volcanoes-national-park',
        description: 'Experience the majestic mountain gorillas in their natural habitat. This once-in-a-lifetime adventure takes you through the misty mountains.',
        shortDescription: 'Gorilla trekking adventure in the misty mountains',
        duration_days: 2, duration_nights: 1,
        price_adult: 500, price_child: 350, price_infant: 100,
        group_min: 1, group_max: 8,
        category: 'adventure', difficulty: 'moderate',
        highlights: JSON.stringify(['Gorilla trekking', 'Mountain views', 'Cultural experience']),
        inclusions: JSON.stringify(['Park fees', 'Guide', 'Transportation', 'Water']),
        exclusions: JSON.stringify(['Tips', 'Personal expenses']),
        start_location: 'Kigali', end_location: 'Volcanoes National Park',
        is_active: true, featured: true, rating: 4.9, total_reviews: 156
    },
    {
        name: 'Nyungwe Forest Canopy Walk',
        slug: 'nyungwe-forest-canopy',
        description: 'Walk among the treetops in ancient rainforest. Experience the only canopy walk in East Africa.',
        shortDescription: 'Walk among the treetops in ancient rainforest',
        duration_days: 2, duration_nights: 1,
        price_adult: 350, price_child: 250, price_infant: 80,
        group_min: 1, group_max: 10,
        category: 'nature', difficulty: 'easy',
        highlights: JSON.stringify(['Canopy walk', 'Chimpanzee tracking', 'Waterfalls']),
        inclusions: JSON.stringify(['Park fees', 'Guide', 'Transportation', 'Water']),
        exclusions: JSON.stringify(['Tips', 'Personal expenses']),
        start_location: 'Kigali', end_location: 'Nyungwe Forest',
        is_active: true, featured: true, rating: 4.8, total_reviews: 98
    },
    {
        name: 'Lake Kivu Escape',
        slug: 'lake-kivu-escape',
        description: 'Relaxing lakeside retreat with water activities. Perfect for unwinding after gorilla trekking.',
        shortDescription: 'Relaxing lakeside retreat with water activities',
        duration_days: 3, duration_nights: 2,
        price_adult: 450, price_child: 300, price_infant: 100,
        group_min: 1, group_max: 12,
        category: 'relaxation', difficulty: 'easy',
        highlights: JSON.stringify(['Boat cruise', 'Kayaking', 'Beach relaxation']),
        inclusions: JSON.stringify(['Accommodation', 'Meals', 'Boat tour']),
        exclusions: JSON.stringify(['Tips', 'Personal expenses']),
        start_location: 'Kigali', end_location: 'Lake Kivu',
        is_active: true, featured: true, rating: 4.7, total_reviews: 89
    },
    {
        name: 'Akagera Safari',
        slug: 'akagera-safari',
        description: 'Big five wildlife experience in savannah. Spot elephants, lions, giraffes, and more.',
        shortDescription: 'Big five wildlife experience in savannah',
        duration_days: 2, duration_nights: 1,
        price_adult: 400, price_child: 280, price_infant: 90,
        group_min: 1, group_max: 12,
        category: 'wildlife', difficulty: 'easy',
        highlights: JSON.stringify(['Game drive', 'Boat safari', 'Bird watching']),
        inclusions: JSON.stringify(['Park fees', 'Game drive vehicle', 'Guide', 'Meals']),
        exclusions: JSON.stringify(['Tips', 'Personal expenses']),
        start_location: 'Kigali', end_location: 'Akagera National Park',
        is_active: true, featured: true, rating: 4.9, total_reviews: 124
    }
];

const seedDatabase = async () => {
    try {
        console.log('🗑️ Clearing existing data...');
        
        // Delete in correct order (due to foreign keys)
        await query('DELETE FROM ticket_messages');
        await query('DELETE FROM support_tickets');
        await query('DELETE FROM payments');
        await query('DELETE FROM reviews');
        await query('DELETE FROM bookings');
        await query('DELETE FROM tours');
        await query('DELETE FROM vehicles');
        await query('DELETE FROM users');
        
        console.log('✅ Existing data cleared');
        
        // Insert users
        console.log('📥 Seeding users...');
        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await query(
                `INSERT INTO users (first_name, last_name, email, password, phone, role) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [user.firstName, user.lastName, user.email, hashedPassword, user.phone, user.role]
            );
        }
        console.log(`✅ ${users.length} users inserted`);
        
        // Insert vehicles
        console.log('📥 Seeding vehicles...');
        for (const vehicle of vehicles) {
            await query(
                `INSERT INTO vehicles (
                    name, brand, model, year, category, transmission, fuel_type,
                    seats, luggage_capacity, doors, price_per_day, deposit,
                    features, location, plate_number, color
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [vehicle.name, vehicle.brand, vehicle.model, vehicle.year, vehicle.category,
                 vehicle.transmission, vehicle.fuelType, vehicle.seats, vehicle.luggageCapacity,
                 vehicle.doors, vehicle.pricePerDay, vehicle.deposit, vehicle.features,
                 vehicle.location, vehicle.plateNumber, vehicle.color]
            );
        }
        console.log(`✅ ${vehicles.length} vehicles inserted`);
        
        // Insert tours
        console.log('📥 Seeding tours...');
        for (const tour of tours) {
            await query(
                `INSERT INTO tours (
                    name, slug, description, short_description, duration_days, duration_nights,
                    price_adult, price_child, price_infant, group_min, group_max,
                    category, difficulty, highlights, inclusions, exclusions,
                    start_location, end_location, is_active, featured, rating, total_reviews
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [tour.name, tour.slug, tour.description, tour.short_description,
                 tour.duration_days, tour.duration_nights, tour.price_adult, tour.price_child,
                 tour.price_infant, tour.group_min, tour.group_max, tour.category,
                 tour.difficulty, tour.highlights, tour.inclusions, tour.exclusions,
                 tour.start_location, tour.end_location, tour.is_active, tour.featured,
                 tour.rating, tour.total_reviews]
            );
        }
        console.log(`✅ ${tours.length} tours inserted`);
        
        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📋 Demo Accounts:');
        console.log('   ┌─────────────────┬──────────────────────────────┬─────────────┐');
        console.log('   │ Role            │ Email                        │ Password    │');
        console.log('   ├─────────────────┼──────────────────────────────┼─────────────┤');
        console.log('   │ Tourist         │ tourist@rwandago.com         │ password123 │');
        console.log('   │ Admin           │ admin@rwandago.com           │ password123 │');
        console.log('   │ Support         │ support@rwandago.com         │ password123 │');
        console.log('   │ Driver          │ driver@rwandago.com          │ password123 │');
        console.log('   └─────────────────┴──────────────────────────────┴─────────────┘');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
};

// Run seeder
const run = async () => {
    console.log('\n🚀 RwandaGo Database Seeder\n');
    console.log('=' .repeat(50));
    
    const connected = await connectDB();
    if (!connected) {
        console.log('\n❌ Cannot proceed without database connection.\n');
        process.exit(1);
    }
    
    await seedDatabase();
};

run();