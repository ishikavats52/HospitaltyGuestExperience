import bcrypt from 'bcryptjs';
import { User, USER_ROLES } from './users.model.js';
import { Hotel } from '../hotels/hotels.model.js';
import { Property } from '../properties/properties.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class UsersController {
  /**
   * Super Admin creates a new Hotel Admin profile
   */
  static async createAdmin(req, res, next) {
    try {
      const { name, email, password, hotelId, propertyId, phone } = req.body;

      if (!name || !name.trim()) {
        return ApiResponse.error(res, 'Admin full name is required', 400);
      }
      if (!email || !email.trim()) {
        return ApiResponse.error(res, 'Valid work email address is required', 400);
      }
      if (!password || password.trim().length < 6) {
        return ApiResponse.error(res, 'Password must be at least 6 characters long', 400);
      }
      if (!hotelId) {
        return ApiResponse.error(res, 'Hotel tenant assignment is required', 400);
      }

      // Check if hotel exists
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return ApiResponse.error(res, 'Assigned hotel tenant does not exist', 404);
      }

      // Check property if specified
      let property = null;
      if (propertyId) {
        property = await Property.findById(propertyId);
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Check for existing user with this email (case-insensitive)
      const allUsers = await User.find();
      const existingUser = allUsers.find(
        (u) => u.email && u.email.toLowerCase() === normalizedEmail
      );
      if (existingUser) {
        return ApiResponse.error(
          res,
          `An account with email '${normalizedEmail}' already exists. Please choose a different email.`,
          400
        );
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password.trim(), 10);

      // Create admin user record
      const newAdmin = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: phone ? phone.trim() : '',
        role: USER_ROLES.HOTEL_ADMIN,
        hotelId: String(hotel._id),
        propertyId: property ? String(property._id) : null,
        status: 'ACTIVE',
        createdBy: req.user?.id || req.user?._id || 'SUPER_ADMIN',
        createdAt: new Date().toISOString(),
      });

      const responseData = {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        hotelId: newAdmin.hotelId,
        hotelName: hotel.name,
        hotelCode: hotel.code,
        hotelCity: hotel.locationHierarchy?.city || '',
        propertyId: newAdmin.propertyId,
        propertyName: property ? property.name : 'Main / All Wings',
        phone: newAdmin.phone,
        status: newAdmin.status,
        createdAt: newAdmin.createdAt,
      };

      return ApiResponse.success(
        res,
        `Hotel Admin profile created successfully for ${hotel.name}`,
        responseData,
        201
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Super Admin lists all Hotel Admin profiles
   */
  static async getAdmins(req, res, next) {
    try {
      const allUsers = await User.find();
      const adminUsers = allUsers.filter((u) => u.role === USER_ROLES.HOTEL_ADMIN);

      const hotels = await Hotel.find();
      const properties = await Property.find();

      const enrichedAdmins = adminUsers.map((admin) => {
        const hotel = hotels.find((h) => String(h._id) === String(admin.hotelId));
        const property = properties.find((p) => String(p._id) === String(admin.propertyId));

        return {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          phone: admin.phone || '',
          status: admin.status || 'ACTIVE',
          hotelId: admin.hotelId,
          hotelName: hotel ? hotel.name : 'Unassigned Hotel',
          hotelCode: hotel ? hotel.code : '',
          hotelCity: hotel?.locationHierarchy?.city || '',
          propertyId: admin.propertyId,
          propertyName: property ? property.name : 'All Wings / Main',
          createdAt: admin.createdAt,
        };
      });

      return ApiResponse.success(res, 'Hotel Admin profiles fetched', enrichedAdmins);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Super Admin deletes a Hotel Admin profile
   */
  static async deleteAdmin(req, res, next) {
    try {
      const { id } = req.params;
      const admin = await User.findById(id);
      if (!admin) {
        return ApiResponse.error(res, 'Admin profile not found', 404);
      }

      if (admin.role !== USER_ROLES.HOTEL_ADMIN) {
        return ApiResponse.error(res, 'Cannot delete non-hotel-admin account via this endpoint', 400);
      }

      await User.deleteMany({ _id: id });
      return ApiResponse.success(res, `Admin profile for '${admin.name}' deleted successfully`);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Super Admin toggles active/suspended status of an Admin
   */
  static async toggleAdminStatus(req, res, next) {
    try {
      const { id } = req.params;
      const admin = await User.findById(id);
      if (!admin) {
        return ApiResponse.error(res, 'Admin profile not found', 404);
      }

      const nextStatus = admin.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
      admin.status = nextStatus;
      if (admin.save) {
        await admin.save();
      } else {
        await User.findByIdAndUpdate(id, { status: nextStatus });
      }

      return ApiResponse.success(res, `Admin status updated to ${nextStatus}`, {
        _id: admin._id,
        status: nextStatus,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Super Admin resets an Admin's password
   */
  static async resetAdminPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.trim().length < 6) {
        return ApiResponse.error(res, 'New password must be at least 6 characters long', 400);
      }

      const admin = await User.findById(id);
      if (!admin) {
        return ApiResponse.error(res, 'Admin profile not found', 404);
      }

      const passwordHash = await bcrypt.hash(newPassword.trim(), 10);
      admin.passwordHash = passwordHash;
      if (admin.save) {
        await admin.save();
      } else {
        await User.findByIdAndUpdate(id, { passwordHash });
      }

      return ApiResponse.success(res, `Password reset successfully for ${admin.name}`);
    } catch (err) {
      next(err);
    }
  }
}
