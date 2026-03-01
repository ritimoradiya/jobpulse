const cron = require('node-cron');
const { scrapeGoogleJobs } = require('../scrapers/googleScraper');
const { scrapeNetflixJobs } = require('../scrapers/netflixScraper');
const { scrapeAirbnbJobs } = require('../scrapers/greenhouseScraper');
const {
  scrapeNvidiaJobs, scrapeSalesforceJobs, scrapeAdobeJobs,
  scrapeFidelityJobs, scrapeAthenaHealthJobs
} = require('../scrapers/workdayScraper');
const { insertNewJobs } = require('../services/diffEngine');

const FAST_SCRAPERS = [
  { name: 'Netflix',       fn: scrapeNetflixJobs },
  { name: 'Airbnb',        fn: scrapeAirbnbJobs },
  { name: 'Nvidia',        fn: scrapeNvidiaJobs },
  { name: 'Salesforce',    fn: scrapeSalesforceJobs },
  { name: 'Adobe',         fn: scrapeAdobeJobs },
  { name: 'Fidelity',      fn: scrapeFidelityJobs },
  { name: 'Athena Health', fn: scrapeAthenaHealthJobs },
];

let isScraping = false;

async function runFastScrapers(io) {
  if (isScraping) {
    console.log(`⏭️  Scrape already in progress, skipping...`);
    return { inserted: 0, skipped: 0 };
  }
  isScraping = true;
  console.log(`🔄 [${new Date().toISOString()}] Running fast scrapers...`);
  const results = { inserted: 0, skipped: 0 };

  for (const scraper of FAST_SCRAPERS) {
    try {
      const jobs = await scraper.fn();
      // Pass io — diffEngine handles both WebSocket emit + alert matching
      const result = await insertNewJobs(jobs, io);
      results.inserted += result.inserted;
      results.skipped += result.skipped;
      if (result.inserted > 0) {
        console.log(`🆕 ${scraper.name} — ${result.inserted} new jobs!`);
      }
    } catch (err) {
      console.error(`❌ ${scraper.name} failed:`, err.message);
    }
  }

  isScraping = false;
  return results;
}

async function runAllScrapers(io) {
  const results = await runFastScrapers(io);
  try {
    const jobs = await scrapeGoogleJobs();
    const result = await insertNewJobs(jobs, io);
    results.inserted += result.inserted;
    if (result.inserted > 0) {
      console.log(`🆕 Google — ${result.inserted} new jobs!`);
    }
  } catch (err) {
    console.error(`❌ Google failed:`, err.message);
  }
  return results;
}

// saveJobs — used by manual scrape routes (no io needed)
async function saveJobs(jobs) {
  if (!jobs || jobs.length === 0) return { inserted: 0, skipped: 0 };
  const result = await insertNewJobs(jobs);
  console.log(`📊 saveJobs: ${result.inserted} inserted, ${result.skipped} skipped`);
  return result;
}

function startCronJobs(io) {
  console.log('⏰ Cron scheduler started');

  // Fast scrapers every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    const result = await runFastScrapers(io);
    if (result.inserted > 0) {
      console.log(`✅ Fast scrape — ${result.inserted} new jobs inserted`);
    }
  });

  // Google every 1 hour (Puppeteer is heavy)
  cron.schedule('0 * * * *', async () => {
    try {
      const jobs = await scrapeGoogleJobs();
      const result = await insertNewJobs(jobs, io);
      if (result.inserted > 0) {
        console.log(`✅ Google — ${result.inserted} new jobs`);
      }
    } catch (err) {
      console.error('❌ Google cron failed:', err.message);
    }
  });
}

module.exports = { startCronJobs, runAllScrapers, saveJobs };