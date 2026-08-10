// app.js — Pure Express app export (no server.listen, no Socket.io, no DB connect)
// Imported by both server.js (production) and tests (integration testing)
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/upload.js';
import aiRoutes from './routes/aiRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import timingMiddleware from './middleware/timing.js';

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
    'https://creators-platform-client.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. Supertest, curl, mobile apps)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked for origin: ${origin}`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(express.json());
app.use(timingMiddleware);

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is running!' });
});

import sponsorRoutes from './routes/sponsorRoutes.js';

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/sponsorships', sponsorRoutes);
app.use('/api/ai', aiRoutes);

// Note: postRoutes need the Socket.io `io` instance, so they are registered
// in server.js where Socket.io is initialised. Tests for posts will pass a
// mock io if needed — auth tests don't require post routes.

// ── Error Handlers ────────────────────────────────────────────────────────────
// Moved to server.js since postRoutes are added dynamically there

export default app;
