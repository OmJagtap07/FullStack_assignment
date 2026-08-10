import express from 'express';
import { generatePost } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Using the protect middleware to ensure only logged-in users can generate content
router.post('/generate', protect, generatePost);

export default router;
