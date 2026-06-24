import express from 'express';
import {
  loginRequest,
  checkLoginStatus,
  emailApprove,
  getPendingLogins,
  approveLogin
} from '../controllers/auth.controller.js';

const router = express.Router();

// User auth routes
router.post('/user/login-request', loginRequest);
router.get('/auth/check-login-status', checkLoginStatus);
router.get('/auth/email-approve', emailApprove);

// Admin dashboard routes for regular users' pending logins
router.get('/admin/pending-logins', getPendingLogins);
router.post('/admin/approve-login', approveLogin);

export default router;
