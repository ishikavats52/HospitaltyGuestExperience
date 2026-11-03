import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { Location } from '../modules/locations/locations.model.js';
import { ServiceCatalogue } from '../modules/serviceCatalogue/serviceCatalogue.model.js';
import { ServiceAvailability } from '../modules/serviceAvailability/serviceAvailability.model.js';
import { SubscriptionPlan } from '../modules/plans/plans.model.js';
import { HotelSubscription } from '../modules/subscriptions/subscriptions.model.js';
import { Hotel } from '../modules/hotels/hotels.model.js';
import { Property } from '../modules/properties/properties.model.js';
import { User, USER_ROLES } from '../modules/users/users.model.js';
import { RoomType, Room } from '../modules/rooms/rooms.model.js';
import { Department, DEFAULT_DEPARTMENTS } from '../modules/users/departments.model.js';

/**
 * Enterprise Non-Destructive Seeder:
 * Guarantees foundational SuperAdmin, baseline Hotel Admin, property, and rooms exist
 * WITHOUT EVER WIPING existing real-world users, staff, bookings, or data.
 */
export const seedDatabase = async (force = false) => {
  try {
    const isExplicitWipe = force && process.argv.includes('--force-wipe');

    if (isExplicitWipe) {
      console.log('[Seeder] --force-wipe requested via CLI: Purging tables...');
      await Promise.all([
        Location.deleteMany({}),
        ServiceCatalogue.deleteMany({}),
        ServiceAvailability.deleteMany({}),
        SubscriptionPlan.deleteMany({}),
        HotelSubscription.deleteMany({}),
        Hotel.deleteMany({}),
        Property.deleteMany({}),
        User.deleteMany({}),
        RoomType.deleteMany({}),
        Room.deleteMany({}),
      ]);
    }

    const passwordHash = await bcrypt.hash('Admin@123', 10);
    const nowIso = new Date().toISOString();

    // 1. Ensure Platform Super Admin exists
    let superAdmin = await User.findOne({ email: 'superadmin@platform.com' });
    if (!superAdmin) {
      superAdmin = await User.create({
        _id: 'superadmin-01',
        id: 'superadmin-01',
        name: 'Platform Super Admin',
        email: 'superadmin@platform.com',
        phone: '+919876543210',
        passwordHash,
        role: USER_ROLES.SUPER_ADMIN,
        department: 'Platform Executive',
        status: 'ACTIVE',
        createdAt: nowIso,
        updatedAt: nowIso,
        createdBy: 'SYSTEM_INSTALL',
      });
      console.log('[Seeder] ✔ Provisioned Super Admin: superadmin@platform.com');
    }

    // 2. Ensure Default Hotel Tenant exists
    let defaultHotel = await Hotel.findOne({
      $or: [{ _id: 'hotel-royal-blue' }, { name: 'Royal Blue Hotel' }],
    });
    if (!defaultHotel) {
      defaultHotel = await Hotel.create({
        _id: 'hotel-royal-blue',
        id: 'hotel-royal-blue',
        name: 'Royal Blue Hotel',
        brand: 'Royal Blue Luxury Stays',
        code: 'RBL-101',
        contactEmail: 'ishivats251@gmail.com',
        contactPhone: '+917078813158',
        locationHierarchy: {
          country: 'India',
          state: 'Delhi',
          city: 'New Delhi',
          localArea: 'Central',
        },
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      console.log('[Seeder] ✔ Provisioned Hotel Tenant: Royal Blue Hotel');
    }

    // 3. Ensure Default Property exists
    let defaultProp = await Property.findOne({
      $or: [{ _id: 'prop-wing-01' }, { code: 'RBL-MAIN' }],
    });
    if (!defaultProp) {
      defaultProp = await Property.create({
        _id: 'prop-wing-01',
        id: 'prop-wing-01',
        hotelId: String(defaultHotel._id),
        name: 'Royal Blue Hotel Main Wing',
        code: 'RBL-MAIN',
        address: '12 Connaught Circus',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        phone: '+917078813158',
        email: 'ishivats251@gmail.com',
        totalRooms: 3,
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      console.log('[Seeder] ✔ Provisioned Property: Royal Blue Hotel Main Wing');
    }

    // 4. Ensure Default Hotel Admin profile exists
    let hotelAdmin = await User.findOne({ email: 'ishivats251@gmail.com' });
    if (!hotelAdmin) {
      hotelAdmin = await User.create({
        _id: 'admin-ishika-01',
        id: 'admin-ishika-01',
        name: 'Ishika Sharma',
        email: 'ishivats251@gmail.com',
        phone: '+917078813158',
        passwordHash,
        role: USER_ROLES.HOTEL_ADMIN,
        hotelId: String(defaultHotel._id),
        propertyId: String(defaultProp._id),
        propertyIds: [String(defaultProp._id)],
        department: 'Executive Management',
        status: 'ACTIVE',
        createdAt: nowIso,
        updatedAt: nowIso,
        createdBy: String(superAdmin._id),
      });
      console.log('[Seeder] ✔ Provisioned Hotel Admin: ishivats251@gmail.com');
    }

    // 5. Ensure Default Rooms exist
    const existingRooms = await Room.find({ propertyId: String(defaultProp._id) });
    if (!existingRooms || existingRooms.length === 0) {
      const defaultRooms = [
        {
          _id: 'room-101',
          id: 'room-101',
          hotelId: String(defaultHotel._id),
          propertyId: String(defaultProp._id),
          roomNumber: '101',
          floor: 1,
          roomTypeName: 'deluxe suit',
          pricePerNight: 4500,
          status: 'AVAILABLE',
          images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'],
          amenities: ['King Size Plush Bed', 'Smart 4K Ultra-HD TV', 'High-Speed Wi-Fi 6', 'Mini Bar & Refrigerator'],
          inventory: [
            { name: 'Egyptian Cotton Towels', quantity: 5, category: 'Linen' },
            { name: 'Feather Pillows', quantity: 4, category: 'Bedding' },
          ],
          createdAt: nowIso,
          updatedAt: nowIso,
        },
        {
          _id: 'room-102',
          id: 'room-102',
          hotelId: String(defaultHotel._id),
          propertyId: String(defaultProp._id),
          roomNumber: '102',
          floor: 1,
          roomTypeName: 'premium suit',
          pricePerNight: 4500,
          status: 'AVAILABLE',
          images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'],
          amenities: ['King Size Plush Bed', 'Smart 4K Ultra-HD TV', 'High-Speed Wi-Fi 6', 'Mini Bar & Refrigerator'],
          inventory: [
            { name: 'Egyptian Cotton Towels', quantity: 4, category: 'Linen' },
            { name: 'Bathrobes', quantity: 2, category: 'Linen' },
          ],
          createdAt: nowIso,
          updatedAt: nowIso,
        },
        {
          _id: 'room-201',
          id: 'room-201',
          hotelId: String(defaultHotel._id),
          propertyId: String(defaultProp._id),
          roomNumber: '201',
          floor: 2,
          roomTypeName: 'Basic suit',
          pricePerNight: 4500,
          status: 'AVAILABLE',
          images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'],
          amenities: ['King Size Plush Bed', 'Smart 4K Ultra-HD TV', 'High-Speed Wi-Fi 6', 'Mini Bar & Refrigerator'],
          inventory: [
            { name: 'Egyptian Cotton Towels', quantity: 3, category: 'Linen' },
          ],
          createdAt: nowIso,
          updatedAt: nowIso,
        },
      ];
      await Room.create(defaultRooms);
      console.log('[Seeder] ✔ Provisioned 3 Standard Rooms (101, 102, 201)');
    }

    // 6. Ensure Baseline Departments exist
    const existingDepts = await Department.find();
    if (!existingDepts || existingDepts.length === 0) {
      for (const d of DEFAULT_DEPARTMENTS) {
        await Department.create({
          hotelId: String(defaultHotel._id),
          name: d.name,
          code: d.code,
          subDepartments: d.subDepartments || [],
          isCustom: false,
          status: 'ACTIVE',
          createdAt: nowIso,
        });
      }
      console.log('[Seeder] ✔ Provisioned Core Departments (Booking Desk, Reception, Housekeeping, Kitchen, Accounts)');
    }

    // 7. Ensure Locations Hierarchy exists
    const existingLocations = await Location.find();
    if (!existingLocations || existingLocations.length === 0) {
      const india = await Location.create({ name: 'India', type: 'COUNTRY', code: 'IN' });
      const delhiState = await Location.create({ name: 'Delhi', type: 'STATE', parentId: india._id });
      const upState = await Location.create({ name: 'Uttar Pradesh', type: 'STATE', parentId: india._id });
      const mhState = await Location.create({ name: 'Maharashtra', type: 'STATE', parentId: india._id });
      const rjState = await Location.create({ name: 'Rajasthan', type: 'STATE', parentId: india._id });

      await Promise.all([
        Location.create({ name: 'New Delhi', type: 'CITY', parentId: delhiState._id }),
        Location.create({ name: 'Agra', type: 'CITY', parentId: upState._id }),
        Location.create({ name: 'Mumbai', type: 'CITY', parentId: mhState._id }),
        Location.create({ name: 'Jaipur', type: 'CITY', parentId: rjState._id }),
        Location.create({ name: 'Udaipur', type: 'CITY', parentId: rjState._id }),
      ]);
      console.log('[Seeder] ✔ Provisioned Baseline Locations');
    }

    // 8. Ensure Subscription Plans exist
    const existingPlans = await SubscriptionPlan.find();
    if (!existingPlans || existingPlans.length === 0) {
      await SubscriptionPlan.create([
        {
          name: 'Free Starter Plan',
          code: 'FREE',
          price: 0,
          isFreePlan: true,
          features: ['Contactless Check-In', 'Digital QR Pass', 'Free-Eligible Services', 'Basic Room Management'],
        },
        {
          name: 'Hospitality Growth',
          code: 'BASIC',
          price: 2999,
          features: ['All Free Features', 'Paid Service Folio', 'In-Room Dining KDS', 'Multi-Property Hub'],
        },
        {
          name: 'Luxury Enterprise',
          code: 'PREMIUM',
          price: 7999,
          features: ['All Basic Features', 'Spa & Concierge Addons', 'Unlimited Rooms & Inventory', 'Priority Governance'],
        },
      ]);
      console.log('[Seeder] ✔ Provisioned Subscription Plans');
    }

    // 9. Ensure Baseline Central Services exist
    const existingServices = await ServiceCatalogue.find();
    if (!existingServices || existingServices.length === 0) {
      const services = [
        {
          name: 'Room Service & Linen Refresh',
          code: 'ROOM_SERVICE',
          category: 'HOUSEKEEPING',
          description: 'Daily fresh towels, bed linens, and amenity top-ups',
          icon: 'sparkles',
          status: 'ACTIVE',
          isFreeByDefault: true,
          eligiblePlans: ['FREE', 'BASIC', 'PREMIUM'],
          createdBy: superAdmin._id,
        },
        {
          name: 'Express Garment Laundry',
          code: 'LAUNDRY',
          category: 'HOUSEKEEPING',
          description: 'Professional laundry and steam press',
          icon: 'shirt',
          status: 'ACTIVE',
          isFreeByDefault: true,
          eligiblePlans: ['FREE', 'BASIC', 'PREMIUM'],
          createdBy: superAdmin._id,
        },
        {
          name: 'Chauffeured Airport Transfer',
          code: 'AIRPORT_PICKUP',
          category: 'TRANSPORT',
          description: 'Private luxury sedan transfer to and from international terminal',
          icon: 'car',
          status: 'ACTIVE',
          isFreeByDefault: true,
          eligiblePlans: ['FREE', 'BASIC', 'PREMIUM'],
          createdBy: superAdmin._id,
        },
      ];
      await ServiceCatalogue.create(services);
      console.log('[Seeder] ✔ Provisioned Service Catalogue');
    }

    console.log('[Seeder] Baseline initialization complete: 100% Non-destructive & persistent.');
  } catch (err) {
    console.error('[Seeder] Initialization error:', err.message);
  } finally {
    if (process.argv[1]?.endsWith('seedData.js')) {
      await disconnectDB();
    }
  }
};

// If run directly via CLI with --force-wipe
if (process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase(process.argv.includes('--force-wipe')).then(() => {
    process.exit(0);
  });
}
