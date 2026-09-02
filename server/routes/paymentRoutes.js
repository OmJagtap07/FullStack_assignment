import express from 'express';
import { createCheckoutSession } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/checkout', protect, createCheckoutSession);

export default router;
