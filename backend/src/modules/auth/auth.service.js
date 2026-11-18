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

    if (user.status === 'DEACTIVATED' || user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      throw new Error('Your profile has been deactivated by SuperAdmin. Please contact them.');
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
    return { bookingNumber: bookingNumber?.trim(), phone, message: 'Direct access active' };
  }

  static async verifyGuestOtp({ bookingNumber }) {
    if (!bookingNumber || !bookingNumber.trim()) {
      throw new Error('Booking reference or room allocation number is required');
    }

    const formattedBk = bookingNumber.trim().toUpperCase();

    let booking = await Booking.findOne({ bookingNumber: formattedBk })
      .populate('guestId')
      .populate('hotelId')
      .populate('propertyId');

    if (!booking) {
      booking = await Booking.findById(bookingNumber.trim()).catch(() => null);
    }

    if (!booking) {
      const allBk = await Booking.find().catch(() => []);
      booking = allBk.find((b) => b.bookingNumber && b.bookingNumber.toUpperCase() === formattedBk);
    }

    if (!booking) {
      throw new Error(`Reservation '${bookingNumber}' not found. Please verify your reference with the reception desk.`);
    }

    let stay = await Stay.findOne({ bookingId: booking._id });

    if (!stay) {
      stay = await Stay.create({
        hotelId: booking.hotelId?._id || booking.hotelId || 'HOTEL-DELHI-01',
        propertyId: booking.propertyId?._id || booking.propertyId || 'PROP-DELHI-01',
        bookingId: booking._id,
        guestId: booking.guestId?._id || booking.guestId,
        roomId: booking.roomId || null,
        roomNumber: booking.roomNumber || 'Assigned',
        status: booking.status === 'CHECKED_IN' ? 'CHECKED_IN' : 'BOOKING_CONFIRMED',
        isVerified: booking.status === 'CHECKED_IN',
        createdAt: new Date().toISOString(),
      });
    }

    const finalStayId = stay._id;
    const finalHotelId = booking.hotelId?._id || booking.hotelId || stay.hotelId;

    const token = this.generateToken({
      isGuest: true,
      role: 'GUEST',
      bookingId: booking._id,
      stayId: finalStayId,
      guestId: booking.guestId?._id || booking.guestId,
      hotelId: finalHotelId,
      propertyId: booking.propertyId?._id || stay?.propertyId,
      guestName: booking.guestName || booking.guestId?.name || 'In-Stay Guest',
      roomNumber: booking.roomNumber || stay?.roomNumber || 'Assigned',
    }, '7d');

    return { token, booking, stay };
  }
}
