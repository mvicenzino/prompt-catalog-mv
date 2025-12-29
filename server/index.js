import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import promptRoutes from './routes/prompts.js';
import aiRoutes from './routes/ai.js';
import scraperRoutes from './routes/scraper.js';
import collectionRoutes from './routes/collections.js';
import { initScheduler } from './scrapers/scheduler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: true, // Allow all origins including chrome-extension://
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/collections', collectionRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Only start server if not running in Vercel (serverless)
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);

        // Initialize the prompt scraper scheduler
        initScheduler();

        // Keep process alive just in case
        setInterval(() => { }, 1000 * 60 * 60);
    });
}

export default app;

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
