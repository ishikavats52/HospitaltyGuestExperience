import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/staff/login', AuthController.loginStaff);
router.post('/guest/send-otp', AuthController.sendGuestOtp);
router.post('/guest/verify-otp', AuthController.verifyGuestOtp);
router.get('/me', authenticate, AuthController.getMe);

export default router;
