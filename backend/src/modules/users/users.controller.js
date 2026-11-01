import bcrypt from 'bcryptjs';
import { User, USER_ROLES } from './users.model.js';
import { Department, DEFAULT_DEPARTMENTS } from './departments.model.js';
import { Hotel } from '../hotels/hotels.model.js';
import { Property } from '../properties/properties.model.js';
import { Room, RoomType } from '../rooms/rooms.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';

const DEFAULT_ROOM_IMAGES = [
  'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
];

const DEFAULT_AMENITIES = [
  'King Size Plush Bed',
  'Smart 4K Ultra-HD TV',
  'High-Speed Wi-Fi 6',
  'Mini Bar & Refrigerator',
  'Climate Controlled AC',
  'Premium Espresso Machine',
  'Electronic Safe Locker',
];

const DEFAULT_INVENTORY = [
  { name: 'Egyptian Cotton Bath Towels', quantity: 4, category: 'Linen' },
  { name: 'Feather Comfort Pillows', quantity: 4, category: 'Bedding' },
  { name: 'Luxury Cotton Bathrobes', quantity: 2, category: 'Linen' },
  { name: 'Nespresso Pods & Kettle Set', quantity: 1, category: 'Appliances' },
  { name: 'High-Velocity Hair Dryer', quantity: 1, category: 'Appliances' },
  { name: 'RFID Smart Room Keys', quantity: 2, category: 'Access' },
];

export class UsersController {
  /**
   * Super Admin creates a new Hotel Admin profile with multiple properties, rooms, and inventory
   */
  static async createAdmin(req, res, next) {
    try {
      const {
        name,
        email,
        password,
        hotelId,
        hotelName,
        propertyId,
        phone,
        properties: inputProperties,
      } = req.body;

      if (!name || !name.trim()) {
        return ApiResponse.error(res, 'Admin full name is required', 400);
      }
      if (!email || !email.trim()) {
        return ApiResponse.error(res, 'Valid work email address is required', 400);
      }
      if (!password || password.trim().length < 6) {
        return ApiResponse.error(res, 'Password must be at least 6 characters long', 400);
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

      // Hotel Tenant Resolution or Creation
      let assignedHotel = null;
      if (hotelId) {
        assignedHotel = await Hotel.findById(hotelId);
      }

      if (!assignedHotel) {
        const brandName = hotelName?.trim() || `${name.trim()}'s Luxury Hotels & Resorts`;
        const brandCode = brandName.substring(0, 3).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
        assignedHotel = await Hotel.create({
          name: brandName,
          brand: brandName,
          code: brandCode,
          contactEmail: normalizedEmail,
          contactPhone: phone?.trim() || '+919876543210',
          locationHierarchy: {
            country: 'India',
            state: 'Delhi',
            city: 'New Delhi',
            localArea: 'Central',
          },
          createdAt: new Date().toISOString(),
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password.trim(), 10);

      // Create Admin User
      const newAdmin = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: phone ? phone.trim() : '',
        role: USER_ROLES.HOTEL_ADMIN,
        hotelId: String(assignedHotel._id),
        status: 'ACTIVE',
        createdBy: req.user?.id || req.user?._id || 'SUPER_ADMIN',
        createdAt: new Date().toISOString(),
      });

      const createdProperties = [];
      const createdRooms = [];
      let totalInventoryCount = 0;

      // Handle properties creation
      if (Array.isArray(inputProperties) && inputProperties.length > 0) {
        for (let i = 0; i < inputProperties.length; i++) {
          const propData = inputProperties[i];
          const propName = propData.name?.trim() || `${assignedHotel.name} - Wing ${i + 1}`;
          const propCode =
            propData.code?.trim() ||
            propName.substring(0, 3).toUpperCase() + '-' + Math.floor(10 + Math.random() * 90);

          const propRecord = await Property.create({
            hotelId: String(assignedHotel._id),
            adminId: String(newAdmin._id),
            name: propName,
            code: propCode,
            address: propData.address?.trim() || 'Central Boulevard',
            city: propData.city?.trim() || 'New Delhi',
            state: propData.state?.trim() || 'Delhi',
            country: propData.country?.trim() || 'India',
            phone: propData.phone?.trim() || newAdmin.phone || '',
            email: propData.email?.trim() || newAdmin.email || '',
            totalRooms: Array.isArray(propData.rooms) ? propData.rooms.length : 0,
            createdAt: new Date().toISOString(),
          });

          createdProperties.push(propRecord);

          // Handle rooms for this property
          if (Array.isArray(propData.rooms) && propData.rooms.length > 0) {
            for (let r = 0; r < propData.rooms.length; r++) {
              const roomData = propData.rooms[r];
              const roomNumber = roomData.roomNumber?.trim() || `${(i + 1) * 100 + r + 1}`;
              const floor = Number(roomData.floor) || (i + 1);
              const roomTypeName = roomData.roomType || roomData.roomTypeName || 'Deluxe Suite';
              const pricePerNight = Number(roomData.pricePerNight) || 4500;

              // Find or create RoomType
              let roomType = await RoomType.findOne({ name: roomTypeName });
              if (!roomType) {
                roomType = await RoomType.create({
                  hotelId: String(assignedHotel._id),
                  propertyId: String(propRecord._id),
                  name: roomTypeName,
                  code: roomTypeName.substring(0, 3).toUpperCase(),
                  basePrice: pricePerNight,
                  amenities: Array.isArray(roomData.amenities) && roomData.amenities.length > 0
                    ? roomData.amenities
                    : DEFAULT_AMENITIES,
                });
              }

              const roomImages = Array.isArray(roomData.images) && roomData.images.length > 0
                ? roomData.images
                : [DEFAULT_ROOM_IMAGES[r % DEFAULT_ROOM_IMAGES.length]];

              const roomAmenities = Array.isArray(roomData.amenities) && roomData.amenities.length > 0
                ? roomData.amenities
                : DEFAULT_AMENITIES;

              const roomInventory = Array.isArray(roomData.inventory) && roomData.inventory.length > 0
                ? roomData.inventory
                : DEFAULT_INVENTORY;

              totalInventoryCount += roomInventory.length;

              const roomRecord = await Room.create({
                hotelId: String(assignedHotel._id),
                propertyId: String(propRecord._id),
                roomTypeId: String(roomType._id),
                roomTypeName,
                roomNumber,
                floor,
                pricePerNight,
                status: roomData.status || 'AVAILABLE',
                images: roomImages,
                amenities: roomAmenities,
                inventory: roomInventory,
                createdAt: new Date().toISOString(),
              });

              createdRooms.push(roomRecord);
            }
          }
        }
      } else {
        // Backwards compatibility for single property assignment
        let targetProp = null;
        if (propertyId) {
          targetProp = await Property.findById(propertyId);
        }
        if (!targetProp) {
          targetProp = await Property.create({
            hotelId: String(assignedHotel._id),
            adminId: String(newAdmin._id),
            name: `${assignedHotel.name} Main Wing`,
            code: `${assignedHotel.code}-MAIN`,
            address: '12 Connaught Circus',
            city: 'New Delhi',
            state: 'Delhi',
            country: 'India',
            phone: newAdmin.phone,
            email: newAdmin.email,
            totalRooms: 3,
            createdAt: new Date().toISOString(),
          });
        }
        createdProperties.push(targetProp);

        // Create standard default rooms
        const defaultRoomConfigs = [
          { num: '101', floor: 1, type: 'Executive Suite', price: 5500 },
          { num: '201', floor: 2, type: 'Deluxe Heritage Room', price: 4200 },
          { num: '301', floor: 3, type: 'Presidential Penthouse', price: 9500 },
        ];

        for (const cfg of defaultRoomConfigs) {
          const rm = await Room.create({
            hotelId: String(assignedHotel._id),
            propertyId: String(targetProp._id),
            roomNumber: cfg.num,
            floor: cfg.floor,
            roomTypeName: cfg.type,
            pricePerNight: cfg.price,
            status: 'AVAILABLE',
            images: [DEFAULT_ROOM_IMAGES[Math.floor(Math.random() * DEFAULT_ROOM_IMAGES.length)]],
            amenities: DEFAULT_AMENITIES,
            inventory: DEFAULT_INVENTORY,
            createdAt: new Date().toISOString(),
          });
          createdRooms.push(rm);
          totalInventoryCount += DEFAULT_INVENTORY.length;
        }
      }

      // Update admin with primary property and property IDs
      const propertyIds = createdProperties.map((p) => String(p._id));
      newAdmin.propertyId = propertyIds[0] || null;
      newAdmin.propertyIds = propertyIds;
      if (newAdmin.save) {
        await newAdmin.save();
      } else {
        await User.findByIdAndUpdate(newAdmin._id, { propertyId: propertyIds[0], propertyIds });
      }

      const responseData = {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        hotelId: assignedHotel._id,
        hotelName: assignedHotel.name,
        hotelCode: assignedHotel.code,
        propertyId: newAdmin.propertyId,
        propertyName: createdProperties[0]?.name || 'Primary Property',
        propertyIds,
        propertiesCount: createdProperties.length,
        roomsCount: createdRooms.length,
        inventoryCount: totalInventoryCount,
        phone: newAdmin.phone,
        status: newAdmin.status,
        createdAt: newAdmin.createdAt,
      };

      return ApiResponse.success(
        res,
        `Hotel Admin profile created successfully with ${createdProperties.length} property/properties and ${createdRooms.length} room(s)!`,
        responseData,
        201
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Super Admin lists all Hotel Admin profiles with enriched property and room counts
   */
  static async getAdmins(req, res, next) {
    try {
      const allUsers = await User.find();
      const adminUsers = allUsers.filter((u) => u.role === USER_ROLES.HOTEL_ADMIN);

      const hotels = await Hotel.find();
      const properties = await Property.find();
      const rooms = await Room.find();

      const enrichedAdmins = adminUsers.map((admin) => {
        const adminId = String(admin._id);
        const hotelId = String(admin.hotelId?._id || admin.hotelId);

        // Find all properties owned or linked to this admin
        const adminProperties = properties.filter((p) => {
          const matchAdmin = String(p.adminId) === adminId;
          const matchHotel = hotelId && String(p.hotelId?._id || p.hotelId) === hotelId;
          const matchPropertyIds = Array.isArray(admin.propertyIds) && admin.propertyIds.map(String).includes(String(p._id));
          return matchAdmin || matchPropertyIds || (matchHotel && !p.adminId);
        });

        // Find all rooms under admin's properties
        const propIds = adminProperties.map((p) => String(p._id));
        const adminRooms = rooms.filter((r) => {
          const rPropId = String(r.propertyId?._id || r.propertyId);
          const rHotelId = String(r.hotelId?._id || r.hotelId);
          return propIds.includes(rPropId) || (hotelId && rHotelId === hotelId);
        });

        const totalInventory = adminRooms.reduce((acc, r) => acc + (Array.isArray(r.inventory) ? r.inventory.length : 0), 0);

        const hotel = hotels.find((h) => String(h._id) === hotelId);
        const primaryProp = adminProperties[0] || properties.find((p) => String(p._id) === String(admin.propertyId));

        return {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          phone: admin.phone || '',
          status: admin.status || 'ACTIVE',
          hotelId: admin.hotelId,
          hotelName: hotel ? hotel.name : 'Independent Hotel Group',
          hotelCode: hotel ? hotel.code : '',
          hotelCity: hotel?.locationHierarchy?.city || primaryProp?.city || '',
          propertyId: admin.propertyId,
          propertyName: primaryProp ? primaryProp.name : `${adminProperties.length} Properties`,
          properties: adminProperties,
          propertiesCount: adminProperties.length,
          roomsCount: adminRooms.length,
          inventoryCount: totalInventory,
          createdAt: admin.createdAt,
        };
      });

      return ApiResponse.success(res, 'Hotel Admin profiles fetched', enrichedAdmins);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Super Admin gets full 360 profile details for an admin (all properties, rooms, images, inventory)
   */
  static async getAdminDetails(req, res, next) {
    try {
      const { id } = req.params;
      const admin = await User.findById(id);
      if (!admin) {
        return ApiResponse.error(res, 'Admin profile not found', 404);
      }

      const hotelId = String(admin.hotelId?._id || admin.hotelId);
      const hotel = hotelId ? await Hotel.findById(hotelId) : null;

      const [allProperties, allRooms, allStaff] = await Promise.all([
        Property.find(),
        Room.find(),
        User.find(),
      ]);

      const adminProperties = allProperties.filter((p) => {
        const matchAdmin = String(p.adminId) === String(admin._id);
        const matchHotel = hotelId && String(p.hotelId?._id || p.hotelId) === hotelId;
        const matchPropIds = Array.isArray(admin.propertyIds) && admin.propertyIds.map(String).includes(String(p._id));
        return matchAdmin || matchPropIds || (matchHotel && !p.adminId);
      });

      const propIds = adminProperties.map((p) => String(p._id));
      const adminRooms = allRooms.filter((r) => {
        const rPropId = String(r.propertyId?._id || r.propertyId);
        const rHotelId = String(r.hotelId?._id || r.hotelId);
        return propIds.includes(rPropId) || (hotelId && rHotelId === hotelId);
      });

      const staffMembers = allStaff.filter((u) => {
        if (u.role === USER_ROLES.SUPER_ADMIN || String(u._id) === String(admin._id)) return false;
        const uHotelId = String(u.hotelId?._id || u.hotelId);
        return hotelId && uHotelId === hotelId;
      });

      // Group rooms by property
      const propertiesWithRooms = adminProperties.map((prop) => {
        const pRooms = adminRooms.filter((r) => String(r.propertyId?._id || r.propertyId) === String(prop._id));
        return {
          ...prop,
          rooms: pRooms,
          roomsCount: pRooms.length,
          availableRooms: pRooms.filter((r) => r.status === 'AVAILABLE').length,
          occupiedRooms: pRooms.filter((r) => r.status === 'OCCUPIED').length,
        };
      });

      return ApiResponse.success(res, 'Admin 360 profile fetched successfully', {
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone || '',
          status: admin.status || 'ACTIVE',
          role: admin.role,
          createdAt: admin.createdAt,
        },
        hotel: hotel || { name: 'Hotel Group', code: 'GRP' },
        properties: propertiesWithRooms,
        totalProperties: adminProperties.length,
        totalRooms: adminRooms.length,
        totalInventory: adminRooms.reduce((acc, r) => acc + (Array.isArray(r.inventory) ? r.inventory.length : 0), 0),
        staffCount: staffMembers.length,
        staff: staffMembers.map((s) => ({ _id: s._id, name: s.name, email: s.email, role: s.role, status: s.status })),
      });
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
   * Super Admin toggles active/deactivated status of an Admin
   */
  static async toggleAdminStatus(req, res, next) {
    try {
      const { id } = req.params;
      const admin = await User.findById(id);
      if (!admin) {
        return ApiResponse.error(res, 'Admin profile not found', 404);
      }

      const nextStatus = admin.status === 'DEACTIVATED' || admin.status === 'SUSPENDED' ? 'ACTIVE' : 'DEACTIVATED';
      admin.status = nextStatus;
      if (admin.save) {
        await admin.save();
      } else {
        await User.findByIdAndUpdate(id, { status: nextStatus });
      }

      return ApiResponse.success(res, `Admin profile status updated to ${nextStatus}`, {
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
        if (u.role === USER_ROLES.SUPER_ADMIN) return false;
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
          department: staff.department || staff.role,
          subDepartment: staff.subDepartment || '',
          phone: staff.phone || '',
          status: staff.status || 'ACTIVE',
          hotelId: staff.hotelId?._id || staff.hotelId,
          propertyId: propId,
          propertyName: property ? property.name : 'Main Wing',
          createdAt: staff.createdAt,
        };
      });

      return ApiResponse.success(res, 'Staff members fetched successfully', enrichedStaff);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Hotel Admin creates a staff member with Department & Sub-department (Multifunctionality)
   */
  static async createStaff(req, res, next) {
    try {
      const { name, email, password, role, department, subDepartment, propertyId, phone } = req.body;
      const hotelId = req.tenant.hotelId || req.user?.hotelId;

      if (!name || !name.trim()) return ApiResponse.error(res, 'Staff name is required', 400);
      if (!email || !email.trim()) return ApiResponse.error(res, 'Staff email is required', 400);
      if (!password || password.trim().length < 6) return ApiResponse.error(res, 'Password must be at least 6 characters', 400);

      const normalizedEmail = email.trim().toLowerCase();
      const allUsers = await User.find();
      if (allUsers.some((u) => u.email && u.email.toLowerCase() === normalizedEmail)) {
        return ApiResponse.error(res, `Account with email '${normalizedEmail}' already exists.`, 400);
      }

      const passwordHash = await bcrypt.hash(password.trim(), 10);
      const assignedRole = role || (department ? department.toUpperCase().replace(/[^A-Z0-9]/g, '_') : 'RECEPTION');

      const newStaff = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: phone ? phone.trim() : '',
        role: assignedRole,
        department: department || assignedRole,
        subDepartment: subDepartment ? subDepartment.trim() : '',
        hotelId: String(hotelId),
        propertyId: propertyId ? String(propertyId) : null,
        status: 'ACTIVE',
        createdBy: req.user?.id || req.user?._id,
        createdAt: new Date().toISOString(),
      });

      return ApiResponse.success(res, `Staff member '${newStaff.name}' created successfully`, newStaff, 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Hotel Admin deletes a staff member
   */
  static async deleteStaff(req, res, next) {
    try {
      const { id } = req.params;
      const staff = await User.findById(id);
      if (!staff) return ApiResponse.error(res, 'Staff member not found', 404);
      if (staff.role === USER_ROLES.SUPER_ADMIN || staff.role === USER_ROLES.HOTEL_ADMIN) {
        return ApiResponse.error(res, 'Cannot delete an administrator account via staff endpoint', 403);
      }
      await User.deleteMany({ _id: id });
      return ApiResponse.success(res, `Staff member '${staff.name}' deleted successfully`);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Hotel Admin toggles staff status
   */
  static async toggleStaffStatus(req, res, next) {
    try {
      const { id } = req.params;
      const staff = await User.findById(id);
      if (!staff) return ApiResponse.error(res, 'Staff member not found', 404);
      const nextStatus = staff.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
      staff.status = nextStatus;
      if (staff.save) {
        await staff.save();
      } else {
        await User.findByIdAndUpdate(id, { status: nextStatus });
      }
      return ApiResponse.success(res, `Staff status updated to ${nextStatus}`, { _id: id, status: nextStatus });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Hotel Admin resets staff password
   */
  static async resetStaffPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      if (!newPassword || newPassword.trim().length < 6) {
        return ApiResponse.error(res, 'New password must be at least 6 characters', 400);
      }
      const staff = await User.findById(id);
      if (!staff) return ApiResponse.error(res, 'Staff member not found', 404);
      const passwordHash = await bcrypt.hash(newPassword.trim(), 10);
      staff.passwordHash = passwordHash;
      if (staff.save) {
        await staff.save();
      } else {
        await User.findByIdAndUpdate(id, { passwordHash });
      }
      return ApiResponse.success(res, `Password reset successfully for ${staff.name}`);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Fetch all departments and their sub-departments for the hotel
   */
  static async getDepartments(req, res, next) {
    try {
      const hotelId = req.tenant.hotelId || req.user?.hotelId || 'HOTEL-DEFAULT';
      const allDepts = await Department.find();
      let hotelDepts = allDepts.filter((d) => !d.hotelId || String(d.hotelId) === String(hotelId));

      // Seed defaults if this hotel has no departments configured yet
      if (hotelDepts.length === 0) {
        hotelDepts = [];
        for (const def of DEFAULT_DEPARTMENTS) {
          const created = await Department.create({
            ...def,
            hotelId: String(hotelId),
            createdAt: new Date().toISOString(),
          });
          hotelDepts.push(created);
        }
      }

      return ApiResponse.success(res, 'Departments and sub-departments fetched successfully', hotelDepts);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Create a new custom department / role
   */
  static async createDepartment(req, res, next) {
    try {
      const { name, code, description, subDepartments, icon } = req.body;
      const hotelId = req.tenant.hotelId || req.user?.hotelId || 'HOTEL-DEFAULT';

      if (!name || !name.trim()) {
        return ApiResponse.error(res, 'Department name is required', 400);
      }

      const cleanName = name.trim();
      const cleanCode = (code || cleanName).toUpperCase().replace(/[^A-Z0-9]/g, '_');

      const allDepts = await Department.find();
      const existing = allDepts.find(
        (d) =>
          String(d.hotelId) === String(hotelId) &&
          (d.name?.toLowerCase() === cleanName.toLowerCase() || d.code === cleanCode)
      );

      if (existing) {
        return ApiResponse.error(res, `Department '${cleanName}' already exists.`, 400);
      }

      const initialSubs = Array.isArray(subDepartments)
        ? subDepartments.map((s) => (typeof s === 'string' ? s.trim() : s?.name?.trim())).filter(Boolean)
        : [];

      const newDept = await Department.create({
        hotelId: String(hotelId),
        name: cleanName,
        code: cleanCode,
        description: description?.trim() || `Department of ${cleanName}`,
        icon: icon || 'Briefcase',
        subDepartments: initialSubs,
        isSystem: false,
        createdAt: new Date().toISOString(),
      });

      return ApiResponse.success(res, `Department '${newDept.name}' created successfully`, newDept, 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Add a sub-department / multifunctionality under a department
   */
  static async addSubDepartment(req, res, next) {
    try {
      const { id } = req.params;
      const { subDepartment, name } = req.body;
      const targetSub = (subDepartment || name || '').trim();

      if (!targetSub) {
        return ApiResponse.error(res, 'Sub-department name is required', 400);
      }

      const allDepts = await Department.find();
      let dept = allDepts.find((d) => String(d._id) === String(id) || d.code === id);
      if (!dept) {
        return ApiResponse.error(res, 'Department not found', 404);
      }

      const currentSubs = Array.isArray(dept.subDepartments) ? [...dept.subDepartments] : [];
      if (!currentSubs.includes(targetSub)) {
        currentSubs.push(targetSub);
      }

      if (dept.save) {
        dept.subDepartments = currentSubs;
        await dept.save();
      } else {
        await Department.findByIdAndUpdate(dept._id, { subDepartments: currentSubs });
      }

      return ApiResponse.success(res, `Sub-department '${targetSub}' added to ${dept.name}`, {
        _id: dept._id,
        name: dept.name,
        subDepartments: currentSubs,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete a custom department
   */
  static async deleteDepartment(req, res, next) {
    try {
      const { id } = req.params;
      const dept = await Department.findById(id);
      if (!dept) {
        return ApiResponse.error(res, 'Department not found', 404);
      }
      if (dept.isSystem) {
        return ApiResponse.error(res, 'Cannot delete core system department. You can customize its sub-departments.', 400);
      }

      await Department.deleteMany({ _id: id });
      return ApiResponse.success(res, `Department '${dept.name}' deleted successfully`);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete a sub-department from a department
   */
  static async deleteSubDepartment(req, res, next) {
    try {
      const { id, subName } = req.params;
      const decodedSubName = decodeURIComponent(subName);

      const allDepts = await Department.find();
      let dept = allDepts.find((d) => String(d._id) === String(id) || d.code === id);
      if (!dept) {
        return ApiResponse.error(res, 'Department not found', 404);
      }

      const currentSubs = Array.isArray(dept.subDepartments) ? [...dept.subDepartments] : [];
      const updatedSubs = currentSubs.filter((s) => s !== decodedSubName);

      if (dept.save) {
        dept.subDepartments = updatedSubs;
        await dept.save();
      } else {
        await Department.findByIdAndUpdate(dept._id, { subDepartments: updatedSubs });
      }

      return ApiResponse.success(res, `Sub-department '${decodedSubName}' removed`, {
        _id: dept._id,
        subDepartments: updatedSubs,
      });
    } catch (err) {
      next(err);
    }
  }
}
