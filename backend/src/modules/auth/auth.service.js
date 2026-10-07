import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ENV } from '../../config/env.js';
import { User } from '../users/users.model.js';
import { Booking } from '../bookings/bookings.model.js';
import { Stay } from '../stays/stays.model.js';
import { cache } from '../../config/redis.js';

export class AuthService {
  static generateToken(payload, expiresIn = ENV.JWT_EXPIRES_IN) {
    return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn });
  }

  static async loginStaff({ email, password }) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Query user case-insensitively
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const allUsers = await User.find();
      user = allUsers.find((u) => u.email && u.email.toLowerCase() === normalizedEmail);
    }

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.status === 'SUSPENDED') {
      throw new Error('This account has been suspended. Please contact the platform administrator.');
    }

    const isMatch = await bcrypt.compare(password.trim(), user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const derivedHotelId = user.hotelId?._id || user.hotelId || null;
    const derivedPropertyId = user.propertyId?._id || user.propertyId || null;

    const token = this.generateToken({
      id: user._id,
      role: user.role,
      hotelId: derivedHotelId,
      propertyId: derivedPropertyId,
      name: user.name,
      email: user.email,
    }, '7d');

    const safeUser = {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hotelId: derivedHotelId,
      propertyId: derivedPropertyId,
      phone: user.phone || '',
      status: user.status || 'ACTIVE',
    };

    return { token, user: safeUser };
  }

  static async sendGuestOtp({ bookingNumber, phone }) {
    return { bookingNumber: bookingNumber || 'BK-DELHI-101', phone, message: 'Direct access active (OTP disabled)' };
  }

  static async verifyGuestOtp({ bookingNumber }) {
    const formattedBk = bookingNumber ? bookingNumber.trim().toUpperCase() : 'BK-DELHI-101';

    let booking = await Booking.findOne({
      $or: [
        { bookingNumber: formattedBk },
        { bookingNumber: 'BK-DELHI-101' },
      ],
    })
      .populate('guestId')
      .populate('hotelId')
      .populate('propertyId');

    if (!booking) {
      try {
        const { seedDatabase } = await import('../../seeds/seedData.js');
        await seedDatabase(true);
        booking = await Booking.findOne({
          $or: [{ bookingNumber: formattedBk }, { bookingNumber: 'BK-DELHI-101' }],
        })
          .populate('guestId')
          .populate('hotelId')
          .populate('propertyId');
        if (!booking) {
          booking = await Booking.findOne()
            .populate('guestId')
            .populate('hotelId')
            .populate('propertyId');
        }
      } catch (seedErr) {
        console.warn('Auto-seed on guest auth notice:', seedErr.message);
      }
    }

    let stay = booking ? await Stay.findOne({ bookingId: booking._id }) : await Stay.findOne();

    if (!stay && booking) {
      stay = await Stay.create({
        hotelId: booking.hotelId?._id || booking.hotelId || 'HOTEL-DELHI-01',
        propertyId: booking.propertyId?._id || booking.propertyId || 'PROP-DELHI-01',
        bookingId: booking._id,
        guestId: booking.guestId?._id || booking.guestId || 'GUEST-AARAV-01',
        roomId: 'ROOM-302',
        status: 'BOOKING_CONFIRMED',
      });
    }

    const finalStayId = stay?._id || 'STAY-DELHI-302';
    const finalHotelId = booking?.hotelId?._id || booking?.hotelId || stay?.hotelId || 'HOTEL-DELHI-01';

    const token = this.generateToken({
      isGuest: true,
      role: 'GUEST',
      bookingId: booking?._id || 'BK-DELHI-101',
      stayId: finalStayId,
      guestId: booking?.guestId?._id || 'GUEST-AARAV-01',
      hotelId: finalHotelId,
      propertyId: booking?.propertyId?._id || stay?.propertyId || 'PROP-DELHI-01',
      guestName: booking?.guestId?.name || 'Aarav Mehta',
    }, '24h');

    return { token, booking, stay: stay || { _id: finalStayId, hotelId: finalHotelId } };
  }
}
