import express from 'express';
import {
  adminLogin,
  sendBackupOtp,
  setup2FA,
  confirm2FA,
  disable2FA,
  verify2FA
} from '../controllers/adminAuth.controller.js';

const router = express.Router();

router.post('/login', adminLogin);
router.post('/send-backup-otp', sendBackupOtp);
router.post('/setup-2fa', setup2FA);
router.post('/confirm-2fa', confirm2FA);
router.post('/disable-2fa', disable2FA);
router.post('/verify-2fa', verify2FA);

export default router;
