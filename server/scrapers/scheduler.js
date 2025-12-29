import cron from 'node-cron';
import { scrapeReddit } from './reddit.js';

// Store last run results
let lastRunResults = {
    reddit: null,
    lastRun: null,
    nextRun: null
};

// Calculate next run time
function getNextRun(cronExpression) {
    // Simple calculation for weekly schedule
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
    nextSunday.setHours(2, 0, 0, 0);
    if (nextSunday <= now) {
        nextSunday.setDate(nextSunday.getDate() + 7);
    }
    return nextSunday.toISOString();
}

// Run all scrapers
export async function runAllScrapers() {
    console.log('='.repeat(50));
    console.log('Starting scheduled scrape:', new Date().toISOString());
    console.log('='.repeat(50));

    const results = {
        reddit: null,
        startTime: new Date().toISOString(),
        endTime: null
    };

    try {
        // Run Reddit scraper
        results.reddit = await scrapeReddit();
    } catch (err) {
        console.error('Reddit scraper error:', err);
        results.reddit = { error: err.message };
    }

    results.endTime = new Date().toISOString();

    // Update last run results
    lastRunResults = {
        ...results,
        lastRun: results.startTime,
        nextRun: getNextRun()
    };

    console.log('='.repeat(50));
    console.log('Scrape complete:', results);
    console.log('='.repeat(50));

    return results;
}

// Initialize scheduler
export function initScheduler() {
    // Run every Sunday at 2:00 AM
    // Cron format: minute hour day-of-month month day-of-week
    const schedule = '0 2 * * 0';

    console.log('Initializing prompt scraper scheduler...');
    console.log(`Schedule: Every Sunday at 2:00 AM (${schedule})`);

    cron.schedule(schedule, async () => {
        console.log('Scheduled scrape triggered');
        await runAllScrapers();
    }, {
        scheduled: true,
        timezone: 'America/Los_Angeles' // Adjust to your timezone
    });

    lastRunResults.nextRun = getNextRun();
    console.log(`Next scheduled run: ${lastRunResults.nextRun}`);
}

// Get status
export function getScraperStatus() {
    return {
        ...lastRunResults,
        isScheduled: true,
        schedule: 'Every Sunday at 2:00 AM PT'
    };
}

// Export for manual runs
export { scrapeReddit };
