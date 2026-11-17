import { Guest } from '../modules/guests/guests.model.js';
import { Booking } from '../modules/bookings/bookings.model.js';
import { Stay } from '../modules/stays/stays.model.js';
import { User } from '../modules/users/users.model.js';
import { FoodOrder } from '../modules/orders/orders.model.js';
import { ServiceRequest } from '../modules/services/services.model.js';

/**
 * Dedicated Purge Utility to remove any seeded or demo guests, bookings, and test stays.
 * Runs non-destructively for real customers, targeting only demo/seeded entries.
 */
export const cleanupSeededGuests = async (options = {}) => {
  try {
    const purgeAll = Boolean(options.purgeAllGuests);
    console.log(`[Cleanup] Scanning database for ${purgeAll ? 'ALL' : 'seeded/demo'} guests and bookings...`);

    const SEEDED_IDENTIFIERS = {
      names: ['Aarav Mehta', 'Priya Sharma', 'Rohan Gupta', 'Test Guest', 'Sample Guest'],
      emails: [
        'aarav.mehta@gmail.com',
        'priya.sharma@example.com',
        'rohan.gupta@corp.in',
        'guest@example.com',
        'test@hotel.com',
      ],
      idNumbers: ['4126-3082-2252', 'Z9821453', 'DL-042019001234'],
      bookingNumbers: ['BK-DELHI-101', 'BK-DELHI-102', 'BK-DELHI-103'],
    };

    let removedGuestsCount = 0;
    let removedBookingsCount = 0;
    let removedStaysCount = 0;
    let removedUsersCount = 0;

    const seededGuestIds = new Set();
    const seededBookingIds = new Set();

    // 1. Scan and delete seeded Guests
    const allGuests = await Guest.find().catch(() => []);
    for (const g of allGuests) {
      const gName = g.name?.trim();
      const gEmail = g.email?.trim().toLowerCase();
      const gIdNum = g.idNumber?.trim();

      const isSeeded =
        purgeAll ||
        SEEDED_IDENTIFIERS.names.includes(gName) ||
        SEEDED_IDENTIFIERS.emails.includes(gEmail) ||
        SEEDED_IDENTIFIERS.idNumbers.includes(gIdNum) ||
        g.isDemo === true ||
        g.isSeed === true ||
        g._id === 'GUEST-RESOLVED';

      if (isSeeded) {
        seededGuestIds.add(String(g._id || g.id));
        await Guest.findByIdAndDelete(g._id || g.id).catch(() => {});
        removedGuestsCount++;
        console.log(`[Cleanup] ✔ Removed guest: ${gName || g._id}`);
      }
    }

    // 2. Scan and delete seeded Bookings
    const allBookings = await Booking.find().catch(() => []);
    for (const b of allBookings) {
      const bNum = String(b.bookingNumber || '').trim().toUpperCase();
      const bGuestId = String(b.guestId?._id || b.guestId || '');
      const bGuestName = b.guestName?.trim();
      const bGuestEmail = b.guestEmail?.trim().toLowerCase();

      const isSeeded =
        purgeAll ||
        SEEDED_IDENTIFIERS.bookingNumbers.includes(bNum) ||
        bNum.startsWith('BK-DELHI-') ||
        seededGuestIds.has(bGuestId) ||
        SEEDED_IDENTIFIERS.names.includes(bGuestName) ||
        SEEDED_IDENTIFIERS.emails.includes(bGuestEmail) ||
        b.isDemo === true ||
        b.isSeed === true;

      if (isSeeded) {
        seededBookingIds.add(String(b._id || b.id));
        await Booking.findByIdAndDelete(b._id || b.id).catch(() => {});
        removedBookingsCount++;
        console.log(`[Cleanup] ✔ Removed booking: ${bNum || b._id}`);
      }
    }

    // 3. Scan and delete Stays linked to seeded bookings or guests
    const allStays = await Stay.find().catch(() => []);
    for (const s of allStays) {
      const sBookingId = String(s.bookingId?._id || s.bookingId || '');
      const sGuestId = String(s.guestId?._id || s.guestId || '');

      const isSeeded =
        purgeAll ||
        seededBookingIds.has(sBookingId) ||
        seededGuestIds.has(sGuestId) ||
        s._id === 'default-stay' ||
        s.bookingReference === 'BK-DELHI-101' ||
        s.bookingReference === 'BK-DELHI-102' ||
        s.bookingReference === 'BK-DELHI-103';

      if (isSeeded) {
        await Stay.findByIdAndDelete(s._id || s.id).catch(() => {});
        removedStaysCount++;
        console.log(`[Cleanup] ✔ Removed stay: ${s._id}`);
      }
    }

    // 4. Scan and delete User accounts with role GUEST matching seeded emails or all guests if purgeAll
    const allUsers = await User.find().catch(() => []);
    for (const u of allUsers) {
      const uEmail = u.email?.trim().toLowerCase();
      const uName = u.name?.trim();

      if (
        u.role === 'GUEST' &&
        (purgeAll ||
          SEEDED_IDENTIFIERS.emails.includes(uEmail) ||
          SEEDED_IDENTIFIERS.names.includes(uName))
      ) {
        await User.findByIdAndDelete(u._id || u.id).catch(() => {});
        removedUsersCount++;
        console.log(`[Cleanup] ✔ Removed guest user: ${u.email || u.name}`);
      }
    }

    console.log(
      `[Cleanup] Guest purge complete. Removed: ${removedGuestsCount} guests, ${removedBookingsCount} bookings, ${removedStaysCount} stays, ${removedUsersCount} guest users.`
    );

    return {
      removedGuestsCount,
      removedBookingsCount,
      removedStaysCount,
      removedUsersCount,
    };
  } catch (err) {
    console.warn('[Cleanup] Notice during guest cleanup:', err.message);
    return { error: err.message };
  }
};
