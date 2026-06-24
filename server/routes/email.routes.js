import express from 'express';
import { sendOtp, sendCertificate, sendAdminEmail } from '../controllers/email.controller.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/send-certificate', sendCertificate);
router.post('/send-admin-email', sendAdminEmail);

export default router;
