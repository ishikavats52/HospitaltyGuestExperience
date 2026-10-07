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

export const seedDatabase = async (force = false) => {
  try {
    const existingUsers = await User.find({});
    if (!force && existingUsers && existingUsers.length > 0) {
      console.log(`[Seeder] Database already populated with ${existingUsers.length} users. Skipping seed.`);
      return;
    }

    console.log('[Seeder] Starting data population...');

    // Clear existing records
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

    // 1. Super Admin User
    const superAdmin = await User.create({
      name: 'Platform Super Admin',
      email: 'superadmin@platform.com',
      phone: '+919876543210',
      passwordHash,
      role: 'SUPER_ADMIN',
    });

    // 2. Locations Hierarchy
    const india = await Location.create({ name: 'India', type: 'COUNTRY', code: 'IN' });
    const delhiState = await Location.create({ name: 'Delhi', type: 'STATE', parentId: india._id });
    const upState = await Location.create({ name: 'Uttar Pradesh', type: 'STATE', parentId: india._id });
    const delhiCity = await Location.create({ name: 'Delhi', type: 'CITY', parentId: delhiState._id });
    const agraCity = await Location.create({ name: 'Agra', type: 'CITY', parentId: upState._id });

    // 3. Subscription Plans
    const freePlan = await SubscriptionPlan.create({
      name: 'Free Starter Plan',
      code: 'FREE',
      price: 0,
      isFreePlan: true,
      features: ['Contactless Check-In', 'Digital QR Pass', 'Free-Eligible Services'],
    });

    const basicPlan = await SubscriptionPlan.create({
      name: 'Hospitality Growth',
      code: 'BASIC',
      price: 2999,
      features: ['All Free Features', 'Paid Service Folio', 'In-Room Dining KDS'],
    });

    const premiumPlan = await SubscriptionPlan.create({
      name: 'Luxury Enterprise',
      code: 'PREMIUM',
      price: 7999,
      features: ['All Basic Features', 'Spa & Concierge Addons', 'Unlimited Rooms'],
    });

    // 4. Central Service Catalogue
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
      isFreeByDefault: false,
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
      isFreeByDefault: false,
      eligiblePlans: ['BASIC', 'PREMIUM'],
      createdBy: superAdmin._id,
    });

    const spaWellness = await ServiceCatalogue.create({
      name: 'Ayurvedic Wellness & Spa',
      code: 'SPA',
      category: 'WELLNESS_SPA',
      description: 'Traditional 60-min herbal oil rejuvenating massage therapy',
      icon: 'heart-pulse',
      status: 'ACTIVE',
      isFreeByDefault: false,
      eligiblePlans: ['PREMIUM'],
      createdBy: superAdmin._id,
    });

    const localTour = await ServiceCatalogue.create({
      name: 'Taj Mahal Heritage Guided Tour',
      code: 'LOCAL_TOUR',
      category: 'CONCIERGE',
      description: 'Official archaeological guide walking tour of monuments',
      icon: 'compass',
      status: 'ACTIVE',
      isFreeByDefault: true,
      eligiblePlans: ['FREE', 'BASIC', 'PREMIUM'],
      createdBy: superAdmin._id,
    });

    // 5. Geolocation Rules (Delhi vs Agra rules as specified in Section 5)
    // Delhi rules:
    await ServiceAvailability.create([
      { serviceId: roomService._id, city: 'Delhi', enabled: true, isFree: true, allowedPlans: ['FREE', 'BASIC', 'PREMIUM'] },
      { serviceId: laundryService._id, city: 'Delhi', enabled: true, isFree: true, allowedPlans: ['FREE', 'BASIC', 'PREMIUM'] },
      { serviceId: airportPickup._id, city: 'Delhi', enabled: true, isFree: false, allowedPlans: ['BASIC', 'PREMIUM'] },
      { serviceId: spaWellness._id, city: 'Delhi', enabled: true, isFree: false, allowedPlans: ['PREMIUM'] },
    ]);

    // Agra rules:
    await ServiceAvailability.create([
      { serviceId: roomService._id, city: 'Agra', enabled: true, isFree: true, allowedPlans: ['FREE', 'BASIC', 'PREMIUM'] },
      { serviceId: localTour._id, city: 'Agra', enabled: true, isFree: true, allowedPlans: ['FREE', 'BASIC', 'PREMIUM'] },
      { serviceId: airportPickup._id, city: 'Agra', enabled: false, allowedPlans: [] }, // Explicitly disabled
    ]);

    // 6. Hotel Tenants
    // Hotel 1: Grand Delhi (on Free Plan)
    const hotelDelhi = await Hotel.create({
      name: 'Hotel Grand Delhi',
      brand: 'Grand Heritage Hotels',
      code: 'HGD-DELHI',
      locationHierarchy: { country: 'India', state: 'Delhi', city: 'Delhi', localArea: 'Connaught Place' },
      contactEmail: 'contact@hotelgranddelhi.com',
      contactPhone: '+911123456789',
    });

    await HotelSubscription.create({
      hotelId: hotelDelhi._id,
      planId: freePlan._id,
      status: 'ACTIVE',
      startDate: new Date(),
    });

    // Hotel 2: Imperial Agra (on Basic Plan)
    const hotelAgra = await Hotel.create({
      name: 'The Imperial Agra',
      brand: 'Imperial Resorts',
      code: 'IMP-AGRA',
      locationHierarchy: { country: 'India', state: 'Uttar Pradesh', city: 'Agra', localArea: 'Taj Ganj' },
      contactEmail: 'info@imperialagra.com',
      contactPhone: '+915622345678',
    });

    await HotelSubscription.create({
      hotelId: hotelAgra._id,
      planId: basicPlan._id,
      status: 'ACTIVE',
      startDate: new Date(),
    });

    // 7. Properties
    const propDelhi = await Property.create({
      hotelId: hotelDelhi._id,
      name: 'Grand Delhi Main Wing',
      code: 'GD-CP-01',
      address: '12 Barakhamba Road, Connaught Place, New Delhi',
      locationId: delhiCity._id,
    });

    const propAgra = await Property.create({
      hotelId: hotelAgra._id,
      name: 'Imperial Heritage Resort',
      code: 'IMP-TJ-01',
      address: 'Near East Gate Taj Mahal, Taj Ganj, Agra',
      locationId: agraCity._id,
    });

    // 8. Staff accounts
    const delhiAdmin = await User.create({
      hotelId: hotelDelhi._id,
      propertyId: propDelhi._id,
      name: 'Rajesh Sharma (Hotel Admin)',
      email: 'admin.delhi@hotelgrand.com',
      passwordHash,
      role: 'HOTEL_ADMIN',
    });

    const delhiReception = await User.create({
      hotelId: hotelDelhi._id,
      propertyId: propDelhi._id,
      name: 'Pooja Verma (Reception)',
      email: 'reception.delhi@hotelgrand.com',
      passwordHash,
      role: 'RECEPTION',
    });

    const delhiKitchen = await User.create({
      hotelId: hotelDelhi._id,
      propertyId: propDelhi._id,
      name: 'Chef Sanjeev (Kitchen)',
      email: 'kitchen.delhi@hotelgrand.com',
      passwordHash,
      role: 'KITCHEN',
    });

    // 9. Hotel Service Enablements
    await HotelService.create([
      {
        hotelId: hotelDelhi._id,
        propertyId: propDelhi._id,
        serviceId: roomService._id,
        enabled: true,
        isComplimentary: true,
        price: 0,
      },
      {
        hotelId: hotelDelhi._id,
        propertyId: propDelhi._id,
        serviceId: laundryService._id,
        enabled: true,
        isComplimentary: true, // Free in Delhi
        price: 0,
      },
    ]);

    // 10. Rooms & Types
    const deluxeType = await RoomType.create({
      hotelId: hotelDelhi._id,
      propertyId: propDelhi._id,
      name: 'Deluxe Heritage Suite',
      code: 'DLX-SUITE',
      basePrice: 4500,
      amenities: ['King Bed', 'High Speed WiFi', 'City View', 'Mini Bar'],
    });

    const room302 = await Room.create({
      hotelId: hotelDelhi._id,
      propertyId: propDelhi._id,
      roomTypeId: deluxeType._id,
      roomNumber: '302',
      floor: 3,
      status: 'AVAILABLE',
    });

    const room305 = await Room.create({
      hotelId: hotelDelhi._id,
      propertyId: propDelhi._id,
      roomTypeId: deluxeType._id,
      roomNumber: '305',
      floor: 3,
      status: 'OCCUPIED',
    });

    const room201 = await Room.create({
      hotelId: hotelDelhi._id,
      propertyId: propDelhi._id,
      roomTypeId: deluxeType._id,
      roomNumber: '201',
      floor: 2,
      status: 'AVAILABLE',
    });

    // 11. Guest, Booking & Stays
    // Guest 1: Aarav Mehta (New arrival, KYC Pending Check-in)
    const guestAarav = await Guest.create({
      hotelId: hotelDelhi._id,
      name: 'Aarav Mehta',
      email: 'aarav.mehta@example.com',
      phone: '9876543210',
      idType: 'AADHAAR',
      idNumber: '412630822252',
      isVerified: false,
      idDocumentUrl: null,
      selfieUrl: null,
      signatureUrl: null,
    });

    const checkInDate = new Date();
    const checkOutDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

    const booking = await Booking.create({
      hotelId: hotelDelhi._id,
      propertyId: propDelhi._id,
      guestId: guestAarav._id,
      bookingNumber: 'BK-DELHI-101',
      phone: '9876543210',
      roomTypeId: deluxeType._id,
      checkInDate,
      checkOutDate,
      totalAmount: 9000,
      status: 'CONFIRMED',
    });

    await Stay.create({
      hotelId: hotelDelhi._id,
      propertyId: propDelhi._id,
      bookingId: booking._id,
      guestId: guestAarav._id,
      roomId: room302._id,
      status: 'BOOKING_CONFIRMED',
      idType: 'AADHAAR',
      idNumber: '412630822252',
      idDocumentUrl: null,
      selfieUrl: null,
      signatureUrl: null,
      isVerified: false,
    });

    // Guest 2: Priya Sharma (Checked-in with complete Aadhaar & Selfie KYC)
    const guestPriya = await Guest.create({
      hotelId: hotelDelhi._id,
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '9811223344',
      idType: 'AADHAAR',
      idNumber: '891044321980',
      isVerified: true,
      idDocumentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
      selfieUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      signatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"><path d="M10 25 Q 35 5, 65 25 T 110 20" stroke="%23946E3A" stroke-width="2" fill="none"/></svg>',
    });

    const bookingPriya = await Booking.create({
      hotelId: hotelDelhi._id,
      propertyId: propDelhi._id,
      guestId: guestPriya._id,
      bookingNumber: 'BK-DELHI-202',
      phone: '9811223344',
      roomTypeId: deluxeType._id,
      checkInDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      totalAmount: 9000,
      status: 'CONFIRMED',
    });

    await Stay.create({
      hotelId: hotelDelhi._id,
      propertyId: propDelhi._id,
      bookingId: bookingPriya._id,
      guestId: guestPriya._id,
      roomId: room305._id,
      status: 'CHECKED_IN',
      checkedInAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      idType: 'AADHAAR',
      idNumber: '891044321980',
      idDocumentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
      selfieUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      signatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"><path d="M10 25 Q 35 5, 65 25 T 110 20" stroke="%23946E3A" stroke-width="2" fill="none"/></svg>',
      isVerified: true,
    });

    // Guest 3: Vikram Verma (Completed Stay - Checked Out)
    const guestVikram = await Guest.create({
      hotelId: hotelDelhi._id,
      name: 'Vikram Verma',
      email: 'vikram.verma@example.com',
      phone: '9822334455',
      idType: 'AADHAAR',
      idNumber: '772199043218',
      isVerified: true,
      idDocumentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
      selfieUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      signatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"><path d="M10 20 Q 30 10, 60 25 T 100 15" stroke="%23946E3A" stroke-width="2" fill="none"/></svg>',
    });

    const bookingVikram = await Booking.create({
      hotelId: hotelDelhi._id,
      propertyId: propDelhi._id,
      guestId: guestVikram._id,
      bookingNumber: 'BK-DELHI-098',
      phone: '9822334455',
      roomTypeId: deluxeType._id,
      checkInDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
      checkOutDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
      totalAmount: 9000,
      status: 'CONFIRMED',
    });

    await Stay.create({
      hotelId: hotelDelhi._id,
      propertyId: propDelhi._id,
      bookingId: bookingVikram._id,
      guestId: guestVikram._id,
      roomId: room201._id,
      status: 'CHECKED_OUT',
      checkedInAt: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(),
      checkedOutAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      idType: 'AADHAAR',
      idNumber: '772199043218',
      idDocumentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
      selfieUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      signatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"><path d="M10 20 Q 30 10, 60 25 T 100 15" stroke="%23946E3A" stroke-width="2" fill="none"/></svg>',
      isVerified: true,
    });

    // 12. Menu Items
    const fnbCategory = await MenuCategory.create({
      hotelId: hotelDelhi._id,
      propertyId: propDelhi._id,
      name: 'Signature Indian Curries & Mains',
      displayOrder: 1,
      isActive: true,
    });

    const beverageCategory = await MenuCategory.create({
      hotelId: hotelDelhi._id,
      propertyId: propDelhi._id,
      name: 'Artisanal Beverages & Desserts',
      displayOrder: 2,
      isActive: true,
    });

    await MenuItem.create([
      {
        hotelId: hotelDelhi._id,
        propertyId: propDelhi._id,
        categoryId: fnbCategory._id,
        name: 'Paneer Makhani with Garlic Naan',
        description: 'Cottage cheese simmered in buttery satin tomato gravy with freshly baked naan',
        price: 450,
        isVeg: true,
        isAvailable: true,
      },
      {
        hotelId: hotelDelhi._id,
        propertyId: propDelhi._id,
        categoryId: fnbCategory._id,
        name: 'Dal Makhani Heritage Style',
        description: 'Slow-cooked black lentils simmered overnight with cream and smoked spices',
        price: 380,
        isVeg: true,
        isAvailable: true,
      },
      {
        hotelId: hotelDelhi._id,
        propertyId: propDelhi._id,
        categoryId: fnbCategory._id,
        name: 'Royal Awadhi Dum Biryani',
        description: 'Fragrant long-grain basmati rice layered with royal aromatic spices & saffron',
        price: 520,
        isVeg: true,
        isAvailable: true,
      },
      {
        hotelId: hotelDelhi._id,
        propertyId: propDelhi._id,
        categoryId: beverageCategory._id,
        name: 'Adrak Masala Chai & Cookies',
        description: 'Freshly brewed ginger cardamom tea served with house baked almond cookies',
        price: 180,
        isVeg: true,
        isAvailable: true,
      },
      {
        hotelId: hotelDelhi._id,
        propertyId: propDelhi._id,
        categoryId: beverageCategory._id,
        name: 'Warm Gulab Jamun with Saffron Rabri',
        description: 'Golden fried milk dumplings served in reduced saffron infused cream',
        price: 260,
        isVeg: true,
        isAvailable: true,
      },
    ]);

    console.log('[Seeder] Database successfully seeded with realistic multi-tenant data!');
    console.log('---------------------------------------------------------');
    console.log('Super Admin Login : superadmin@platform.com  / Admin@123');
    console.log('Delhi Admin Login : admin.delhi@hotelgrand.com / Admin@123');
    console.log('Guest Reservation : Booking Number: BK-DELHI-101 / Phone: 9876543210 (OTP: 123456)');
    console.log('---------------------------------------------------------');
  } catch (err) {
    console.error('[Seeder] Error during database seeding:', err);
  } finally {
    if (process.argv[1]?.endsWith('seedData.js')) {
      await disconnectDB();
    }
  }
};

// If run directly via CLI
if (process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase();
}
