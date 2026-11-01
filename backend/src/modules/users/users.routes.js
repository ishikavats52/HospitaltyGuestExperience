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
router.get('/admins/:id/details', authenticate, requireSuperAdmin, UsersController.getAdminDetails);
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

// Departments & Sub-Departments Hierarchy Management (Multi-functionality)
router.get('/departments', authenticate, enforceTenantIsolation, UsersController.getDepartments);
router.post('/departments', authenticate, enforceTenantIsolation, requireHotelAdmin, UsersController.createDepartment);
router.post('/departments/:id/subdepartments', authenticate, enforceTenantIsolation, requireHotelAdmin, UsersController.addSubDepartment);
router.delete('/departments/:id', authenticate, enforceTenantIsolation, requireHotelAdmin, UsersController.deleteDepartment);
router.delete('/departments/:id/subdepartments/:subName', authenticate, enforceTenantIsolation, requireHotelAdmin, UsersController.deleteSubDepartment);

export default router;
