const cron = require('node-cron');
const { scrapeGoogleJobs } = require('../scrapers/googleScraper');
const { insertNewJobs } = require('../services/diffEngine');

// Run every 6 hours: 0 */6 * * *
function startCronJobs() {
  console.log('⏰ Cron scheduler started');

  cron.schedule('0 */6 * * *', async () => {
    console.log(`🔄 [${new Date().toISOString()}] Running scheduled scrape...`);
    try {
      const jobs = await scrapeGoogleJobs();
      const result = await insertNewJobs(jobs);
      console.log(`✅ Scheduled scrape complete — inserted: ${result.inserted}, skipped: ${result.skipped}`);
    } catch (err) {
      console.error('❌ Scheduled scrape failed:', err.message);
    }
  });
}

module.exports = { startCronJobs };