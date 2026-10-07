import { Router } from 'express';
import { User } from './users.model.js';
import { UsersController } from './users.controller.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware.js';
import { requireHotelAdmin, requireSuperAdmin } from '../../middleware/role.middleware.js';

const router = Router();

// Super Admin: Hotel Admin Profile Management Endpoints
router.get('/admins', authenticate, requireSuperAdmin, UsersController.getAdmins);
router.post('/admins', authenticate, requireSuperAdmin, UsersController.createAdmin);
router.delete('/admins/:id', authenticate, requireSuperAdmin, UsersController.deleteAdmin);
router.patch('/admins/:id/status', authenticate, requireSuperAdmin, UsersController.toggleAdminStatus);
router.patch('/admins/:id/password', authenticate, requireSuperAdmin, UsersController.resetAdminPassword);

// Hotel Staff Management (Hotel Admin & Super Admin)
router.get('/staff', authenticate, enforceTenantIsolation, requireHotelAdmin, UsersController.getStaff);
router.post('/staff', authenticate, enforceTenantIsolation, requireHotelAdmin, UsersController.createStaff);
router.delete('/staff/:id', authenticate, enforceTenantIsolation, requireHotelAdmin, UsersController.deleteStaff);
router.patch('/staff/:id/status', authenticate, enforceTenantIsolation, requireHotelAdmin, UsersController.toggleStaffStatus);
router.patch('/staff/:id/password', authenticate, enforceTenantIsolation, requireHotelAdmin, UsersController.resetStaffPassword);

export default router;
