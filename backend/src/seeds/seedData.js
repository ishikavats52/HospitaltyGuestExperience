import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { Location } from '../modules/locations/locations.model.js';
import { ServiceCatalogue } from '../modules/serviceCatalogue/serviceCatalogue.model.js';
import { ServiceAvailability } from '../modules/serviceAvailability/serviceAvailability.model.js';
import { SubscriptionPlan } from '../modules/plans/plans.model.js';
import { HotelSubscription } from '../modules/subscriptions/subscriptions.model.js';
import { Hotel } from '../modules/hotels/hotels.model.js';
import { Property } from '../modules/properties/properties.model.js';
import { User } from '../modules/users/users.model.js';
import { RoomType, Room } from '../modules/rooms/rooms.model.js';
import { Guest } from '../modules/guests/guests.model.js';
import { Booking } from '../modules/bookings/bookings.model.js';
import { Stay } from '../modules/stays/stays.model.js';
import { MenuCategory, MenuItem } from '../modules/menu/menu.model.js';
import { HotelService } from '../modules/services/services.model.js';

/**
 * Clean Slate Seeder:
 * Initialises platform foundation (SuperAdmin, Locations, Plans, Service Catalogue, Geo-rules)
 * Purges all fake/demo admins, reception staff, properties, and rooms so administrators
 * start fresh with their own custom real-world configurations.
 */
export const seedDatabase = async (force = false) => {
  try {
    const existingUsers = await User.find({});
    // If not forced and already has superadmin, keep current state
    if (!force && existingUsers && existingUsers.length > 0) {
      const hasSuper = existingUsers.some((u) => u.role === 'SUPER_ADMIN');
      if (hasSuper) {
        console.log(`[Seeder] Clean database active (${existingUsers.length} user(s)). Skipping seed.`);
        return;
      }
    }

    console.log('[Seeder] Starting clean slate database initialization...');

    // Clear all existing records (purge all fake admins, staff, hotels, properties, rooms)
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
      Guest.deleteMany({}),
      Booking.deleteMany({}),
      Stay.deleteMany({}),
      MenuCategory.deleteMany({}),
      MenuItem.deleteMany({}),
      HotelService.deleteMany({}),
    ]);

    const passwordHash = await bcrypt.hash('Admin@123', 10);

    // 1. Super Admin Account (Only permanent account needed to create new admins & properties)
    const superAdmin = await User.create({
      name: 'Platform Super Admin',
      email: 'superadmin@platform.com',
      phone: '+919876543210',
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    });

    // 2. Locations Hierarchy
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

    // 3. Subscription Plans (SaaS tiers for hotels)
    const freePlan = await SubscriptionPlan.create({
      name: 'Free Starter Plan',
      code: 'FREE',
      price: 0,
      isFreePlan: true,
      features: ['Contactless Check-In', 'Digital QR Pass', 'Free-Eligible Services', 'Basic Room Management'],
    });

    const basicPlan = await SubscriptionPlan.create({
      name: 'Hospitality Growth',
      code: 'BASIC',
      price: 2999,
      features: ['All Free Features', 'Paid Service Folio', 'In-Room Dining KDS', 'Multi-Property Hub'],
    });

    const premiumPlan = await SubscriptionPlan.create({
      name: 'Luxury Enterprise',
      code: 'PREMIUM',
      price: 7999,
      features: ['All Basic Features', 'Spa & Concierge Addons', 'Unlimited Rooms & Inventory', 'Priority Governance'],
    });

    // 4. Central Service Catalogue (Available for SuperAdmin and Hotel Admins)
    const roomService = await ServiceCatalogue.create({
      name: 'Room Service & Linen Refresh',
      code: 'ROOM_SERVICE',
      category: 'HOUSEKEEPING',
      description: 'Daily fresh towels, bed linens, and amenity top-ups',
      icon: 'sparkles',
      status: 'ACTIVE',
      isFreeByDefault: true,
      eligiblePlans: ['FREE', 'BASIC', 'PREMIUM'],
      createdBy: superAdmin._id,
    });

    const laundryService = await ServiceCatalogue.create({
      name: 'Express Garment Laundry',
      code: 'LAUNDRY',
      category: 'HOUSEKEEPING',
      description: 'Professional laundry and steam press',
      icon: 'shirt',
      status: 'ACTIVE',
      isFreeByDefault: true,
      eligiblePlans: ['FREE', 'BASIC', 'PREMIUM'],
      createdBy: superAdmin._id,
    });

    const airportPickup = await ServiceCatalogue.create({
      name: 'Chauffeured Airport Transfer',
      code: 'AIRPORT_PICKUP',
      category: 'TRANSPORT',
      description: 'Private luxury sedan transfer to and from international terminal',
      icon: 'car',
      status: 'ACTIVE',
      isFreeByDefault: true,
      eligiblePlans: ['FREE', 'BASIC', 'PREMIUM'],
      createdBy: superAdmin._id,
    });

    const spaWellness = await ServiceCatalogue.create({
      name: 'Ayurvedic Wellness & Spa',
      code: 'SPA',
      category: 'WELLNESS_SPA',
      description: 'Traditional 60-min herbal oil rejuvenating massage therapy',
      icon: 'heart-pulse',
      status: 'ACTIVE',
      isFreeByDefault: true,
      eligiblePlans: ['FREE', 'BASIC', 'PREMIUM'],
      createdBy: superAdmin._id,
    });

    const localTour = await ServiceCatalogue.create({
      name: 'Heritage Guided City Tour',
      code: 'LOCAL_TOUR',
      category: 'CONCIERGE',
      description: 'Official archaeological guide walking tour of local monuments and heritage',
      icon: 'compass',
      status: 'ACTIVE',
      isFreeByDefault: true,
      eligiblePlans: ['FREE', 'BASIC', 'PREMIUM'],
      createdBy: superAdmin._id,
    });

    const luggagePorter = await ServiceCatalogue.create({
      name: 'Luggage & Bellhop Assistance',
      code: 'LUGGAGE',
      category: 'CONCIERGE',
      description: 'Baggage delivery, check-in luggage storage and bellhop handling',
      icon: 'package',
      status: 'ACTIVE',
      isFreeByDefault: true,
      eligiblePlans: ['FREE', 'BASIC', 'PREMIUM'],
      createdBy: superAdmin._id,
    });

    // 5. Geolocation Rules
    const allServices = [roomService, laundryService, airportPickup, spaWellness, localTour, luggagePorter];
    const cities = ['New Delhi', 'Agra', 'Mumbai', 'Jaipur', 'Udaipur'];

    for (const city of cities) {
      for (const s of allServices) {
        await ServiceAvailability.create({
          serviceId: s._id,
          city,
          country: 'India',
          enabled: true,
          isFree: true,
          allowedPlans: ['FREE', 'BASIC', 'PREMIUM'],
        });
      }
    }

    // Global default fallback rule
    for (const s of allServices) {
      await ServiceAvailability.create({
        serviceId: s._id,
        country: 'India',
        enabled: true,
        isFree: true,
        allowedPlans: ['FREE', 'BASIC', 'PREMIUM'],
      });
    }

    console.log('[Seeder] Clean slate initialized successfully!');
    console.log('---------------------------------------------------------');
    console.log('Super Admin Login : superadmin@platform.com / Admin@123');
    console.log('Status            : 0 Fake Admins, 0 Fake Staff, 0 Fake Rooms');
    console.log('Ready for SuperAdmin to provision new hotel admin profiles.');
    console.log('---------------------------------------------------------');
  } catch (err) {
    console.error('[Seeder] Error during clean database initialization:', err);
  } finally {
    if (process.argv[1]?.endsWith('seedData.js')) {
      await disconnectDB();
    }
  }
};

// If run directly via CLI
if (process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase(true);
}
