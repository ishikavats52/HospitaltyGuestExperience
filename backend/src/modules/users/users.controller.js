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

  /**
   * Hotel Admin / Super Admin gets all staff/employees for their hotel
   */
  static async getStaff(req, res, next) {
    try {
      const hotelId = req.tenant.isSuperAdmin && !req.tenant.hotelId ? null : req.tenant.hotelId;
      const allUsers = await User.find();

      let staffUsers = allUsers.filter((u) => {
        // Exclude super admins from staff list
        if (u.role === USER_ROLES.SUPER_ADMIN) return false;
        // If hotel admin, only show users belonging to this hotel
        if (hotelId) {
          const userHotelId = u.hotelId?._id || u.hotelId;
          return String(userHotelId) === String(hotelId);
        }
        return true;
      });

      const properties = await Property.find();

      const enrichedStaff = staffUsers.map((staff) => {
        const propId = staff.propertyId?._id || staff.propertyId;
        const property = properties.find((p) => String(p._id) === String(propId));

        return {
          _id: staff._id,
          name: staff.name,
          email: staff.email,
          role: staff.role,
          phone: staff.phone || '',
          status: staff.status || 'ACTIVE',
          hotelId: staff.hotelId?._id || staff.hotelId,
          propertyId: propId || null,
          propertyName: property ? property.name : 'Main Wing / Property',
          createdAt: staff.createdAt,
        };
      });

      return ApiResponse.success(res, 'Hotel staff members fetched', enrichedStaff);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Hotel Admin / Super Admin creates a new Employee / Staff account in DynamoDB
   */
  static async createStaff(req, res, next) {
    try {
      const { name, email, password, role, propertyId, phone } = req.body;

      if (!name || !name.trim()) {
        return ApiResponse.error(res, 'Employee full name is required', 400);
      }
      if (!email || !email.trim()) {
        return ApiResponse.error(res, 'Valid work email is required', 400);
      }
      if (!password || password.trim().length < 6) {
        return ApiResponse.error(res, 'Password must be at least 6 characters long', 400);
      }

      const allowedRoles = [
        USER_ROLES.RECEPTION,
        USER_ROLES.KITCHEN,
        USER_ROLES.HOUSEKEEPING,
        USER_ROLES.ACCOUNTS,
        USER_ROLES.HOTEL_ADMIN,
      ];

      const staffRole = role && allowedRoles.includes(role.toUpperCase())
        ? role.toUpperCase()
        : USER_ROLES.RECEPTION;

      // Determine hotelId from tenant or body
      let targetHotelId = req.tenant.hotelId || req.body.hotelId;
      if (!targetHotelId && req.user?.hotelId) {
        targetHotelId = req.user.hotelId?._id || req.user.hotelId;
      }

      if (!targetHotelId) {
        return ApiResponse.error(res, 'Hotel assignment required for staff creation', 400);
      }

      const hotel = await Hotel.findById(targetHotelId);
      if (!hotel) {
        return ApiResponse.error(res, 'Assigned hotel tenant does not exist', 404);
      }

      let property = null;
      if (propertyId) {
        property = await Property.findById(propertyId);
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Check if email already exists
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

      // Create new Employee in DynamoDB
      const newStaff = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: phone ? phone.trim() : '',
        role: staffRole,
        hotelId: String(hotel._id),
        propertyId: property ? String(property._id) : (req.user?.propertyId || null),
        status: 'ACTIVE',
        createdBy: req.user?.id || req.user?._id || 'ADMIN',
        createdAt: new Date().toISOString(),
      });

      const responseData = {
        _id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
        hotelId: newStaff.hotelId,
        hotelName: hotel.name,
        propertyId: newStaff.propertyId,
        propertyName: property ? property.name : 'Main Wing',
        phone: newStaff.phone,
        status: newStaff.status,
        createdAt: newStaff.createdAt,
      };

      return ApiResponse.success(
        res,
        `Employee account created successfully for '${newStaff.name}' with role ${newStaff.role}`,
        responseData,
        201
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete an Employee account
   */
  static async deleteStaff(req, res, next) {
    try {
      const { id } = req.params;
      const staff = await User.findById(id);
      if (!staff) {
        return ApiResponse.error(res, 'Employee account not found', 404);
      }

      if (staff.role === USER_ROLES.SUPER_ADMIN) {
        return ApiResponse.error(res, 'Cannot delete Super Admin account', 403);
      }

      await User.deleteMany({ _id: id });
      return ApiResponse.success(res, `Employee account '${staff.name}' deleted successfully`);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Toggle Employee status (ACTIVE / SUSPENDED)
   */
  static async toggleStaffStatus(req, res, next) {
    try {
      const { id } = req.params;
      const staff = await User.findById(id);
      if (!staff) {
        return ApiResponse.error(res, 'Employee account not found', 404);
      }

      const nextStatus = staff.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
      staff.status = nextStatus;
      if (staff.save) {
        await staff.save();
      } else {
        await User.findByIdAndUpdate(id, { status: nextStatus });
      }

      return ApiResponse.success(res, `Employee status updated to ${nextStatus}`, {
        _id: staff._id,
        status: nextStatus,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Reset Employee password
   */
  static async resetStaffPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.trim().length < 6) {
        return ApiResponse.error(res, 'New password must be at least 6 characters long', 400);
      }

      const staff = await User.findById(id);
      if (!staff) {
        return ApiResponse.error(res, 'Employee account not found', 404);
      }

      const passwordHash = await bcrypt.hash(newPassword.trim(), 10);
      staff.passwordHash = passwordHash;
      if (staff.save) {
        await staff.save();
      } else {
        await User.findByIdAndUpdate(id, { passwordHash });
      }

      return ApiResponse.success(res, `Password reset successfully for employee ${staff.name}`);
    } catch (err) {
      next(err);
    }
  }
}

