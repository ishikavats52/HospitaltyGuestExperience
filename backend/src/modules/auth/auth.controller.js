import { AuthService } from './auth.service.js';
import { User } from '../users/users.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class AuthController {
  static async loginStaff(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.loginStaff({ email, password });
      return ApiResponse.success(res, 'Login successful', result);
    } catch (err) {
      return ApiResponse.error(res, err.message, 401);
    }
  }

  static async sendGuestOtp(req, res, next) {
    try {
      const { bookingNumber, phone } = req.body;
      const result = await AuthService.sendGuestOtp({ bookingNumber, phone });
      return ApiResponse.success(res, result.message, result);
    } catch (err) {
      return ApiResponse.error(res, err.message, 400);
    }
  }

  static async verifyGuestOtp(req, res, next) {
    try {
      const { bookingNumber, otp } = req.body;
      const result = await AuthService.verifyGuestOtp({ bookingNumber, otp });
      return ApiResponse.success(res, 'Guest authenticated successfully', result);
    } catch (err) {
      return ApiResponse.error(res, err.message, 401);
    }
  }

  static async getMe(req, res) {
    let userData = req.user || req.guest;
    if (userData && userData.id && !userData.isGuest && userData.role !== 'GUEST') {
      try {
        const dbUser = await User.findById(userData.id);
        if (dbUser) {
          userData = {
            ...userData,
            _id: dbUser._id,
            id: dbUser._id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            hotelId: dbUser.hotelId?._id || dbUser.hotelId || userData.hotelId || null,
            propertyId: dbUser.propertyId?._id || dbUser.propertyId || userData.propertyId || null,
            status: dbUser.status || 'ACTIVE',
            phone: dbUser.phone || '',
          };
        }
      } catch (_) {}
    }

    if (userData && (userData.isGuest || userData.role === 'GUEST')) {
      try {
        const { Stay } = await import('../stays/stays.model.js');
        const { Guest } = await import('../guests/guests.model.js');
        const { Booking } = await import('../bookings/bookings.model.js');

        const stayId = userData.stayId || (typeof userData.stay === 'string' ? userData.stay : userData.stay?._id);
        let stay = stayId ? await Stay.findById(stayId) : null;
        if (!stay && userData.bookingId) {
          stay = await Stay.findOne({ bookingId: userData.bookingId });
        }
        if (!stay) {
          stay = await Stay.findOne();
        }

        if (stay) {
          userData.stay = stay;
          userData.stayId = stay._id;
        }

        let guest = null;
        if (userData.guestId) {
          guest = await Guest.findById(userData.guestId);
        } else if (stay?.guestId) {
          const gId = typeof stay.guestId === 'object' ? stay.guestId._id || stay.guestId : stay.guestId;
          guest = await Guest.findById(gId);
        }
        if (guest) {
          userData.guest = guest;
          userData.guestName = guest.name;
        }

        let booking = null;
        if (userData.bookingId) {
          booking = await Booking.findById(userData.bookingId);
        } else if (stay?.bookingId) {
          const bId = typeof stay.bookingId === 'object' ? stay.bookingId._id || stay.bookingId : stay.bookingId;
          booking = await Booking.findById(bId);
        }
        if (booking) {
          userData.booking = booking;
        }
      } catch (_) {}
    }

    return ApiResponse.success(res, 'Current session details', {
      user: userData,
      tenant: req.tenant,
    });
  }
}
