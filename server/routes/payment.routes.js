import express from 'express';
import { createPaymentLink, getPaymentInfo } from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/create-payment-link', createPaymentLink);
router.get('/payment-info/:orderCode', getPaymentInfo);

export default router;
