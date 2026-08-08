import express from 'express';
import { protect } from '../middleware/auth.js';
import { seedSponsorships, getDeals } from '../controllers/sponsorController.js';

const router = express.Router();

// GET all deals for the platform (using SQL JOIN)
router.get('/', protect, getDeals);

// POST seed data (using protect just to get the user email)
router.post('/seed', protect, seedSponsorships);

export default router;
