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
    return ApiResponse.success(res, 'Current session details', {
      user: userData,
      tenant: req.tenant,
    });
  }
}
