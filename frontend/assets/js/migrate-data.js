// assets/js/migrate-data.js
// Run this once to migrate mock data to backend

async function migrateMockData() {
    console.log('Starting data migration...');
    
    // Migrate vehicles
    const vehicles = [
        { name: 'Toyota RAV4', brand: 'Toyota', model: 'RAV4', year: 2023, category: 'suv', transmission: 'Automatic', fuelType: 'Petrol', seats: 5, luggageCapacity: 3, doors: 4, pricePerDay: 55, depositAmount: 110, plateNumber: 'RAB 123A', color: 'White', location: 'Kigali Airport', status: 'available' },
        { name: 'Suzuki Jimny', brand: 'Suzuki', model: 'Jimny', year: 2023, category: 'suv', transmission: 'Manual', fuelType: 'Petrol', seats: 4, luggageCapacity: 2, doors: 3, pricePerDay: 45, depositAmount: 90, plateNumber: 'RAB 456B', color: 'Green', location: 'Downtown Kigali', status: 'available' },
        { name: 'Mitsubishi Pajero', brand: 'Mitsubishi', model: 'Pajero', year: 2022, category: 'suv', transmission: 'Automatic', fuelType: 'Diesel', seats: 7, luggageCapacity: 4, doors: 5, pricePerDay: 85, depositAmount: 170, plateNumber: 'RAB 789C', color: 'Silver', location: 'Kigali Airport', status: 'available' },
        { name: 'Hyundai i10', brand: 'Hyundai', model: 'i10', year: 2023, category: 'economy', transmission: 'Manual', fuelType: 'Petrol', seats: 4, luggageCapacity: 2, doors: 4, pricePerDay: 30, depositAmount: 60, plateNumber: 'RAB 101D', color: 'Red', location: 'Kigali Airport', status: 'available' },
        { name: 'Toyota Camry', brand: 'Toyota', model: 'Camry', year: 2023, category: 'sedan', transmission: 'Automatic', fuelType: 'Petrol', seats: 5, luggageCapacity: 3, doors: 4, pricePerDay: 65, depositAmount: 130, plateNumber: 'RAB 202E', color: 'Black', location: 'Downtown Kigali', status: 'available' }
    ];
    
    for (const vehicle of vehicles) {
        try {
            await window.RwandaGoAPI.createVehicle(vehicle);
            console.log(`Migrated vehicle: ${vehicle.name}`);
        } catch (error) {
            console.error(`Failed to migrate ${vehicle.name}:`, error);
        }
    }
    
    console.log('Migration complete!');
}

// Uncomment to run migration
// migrateMockData();