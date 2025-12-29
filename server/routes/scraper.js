import express from 'express';
import { authenticateToken, requireAuth } from '../middleware/auth.js';
import { runAllScrapers, getScraperStatus, scrapeReddit } from '../scrapers/scheduler.js';

const router = express.Router();

// Get scraper status
router.get('/status', authenticateToken, requireAuth, async (req, res) => {
    try {
        const status = getScraperStatus();
        res.json(status);
    } catch (err) {
        console.error('Error getting scraper status:', err);
        res.status(500).json({ message: 'Failed to get scraper status' });
    }
});

// Manually trigger all scrapers
router.post('/run', authenticateToken, requireAuth, async (req, res) => {
    try {
        // Run in background so request doesn't timeout
        res.json({ message: 'Scraper started', status: 'running' });

        // Run scrapers after response
        setImmediate(async () => {
            try {
                await runAllScrapers();
            } catch (err) {
                console.error('Scraper run error:', err);
            }
        });
    } catch (err) {
        console.error('Error starting scraper:', err);
        res.status(500).json({ message: 'Failed to start scraper' });
    }
});

// Manually trigger Reddit scraper only
router.post('/run/reddit', authenticateToken, requireAuth, async (req, res) => {
    try {
        res.json({ message: 'Reddit scraper started', status: 'running' });

        setImmediate(async () => {
            try {
                await scrapeReddit();
            } catch (err) {
                console.error('Reddit scraper error:', err);
            }
        });
    } catch (err) {
        console.error('Error starting Reddit scraper:', err);
        res.status(500).json({ message: 'Failed to start Reddit scraper' });
    }
});

export default router;
