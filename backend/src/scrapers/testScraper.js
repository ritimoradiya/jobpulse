const { scrapeGoogleJobs } = require('./googleScraper');
const { insertNewJobs } = require('../services/diffEngine');

async function test() {
  console.log('🚀 Running scraper test...\n');
  const jobs = await scrapeGoogleJobs();

  if (jobs.length === 0) {
    console.log('⚠️  No jobs returned. Google may have changed their HTML.');
    return;
  }

  console.log('\n📋 Sample job:');
  console.log(JSON.stringify(jobs[0], null, 2));

  console.log('\n💾 Inserting into database...');
  const result = await insertNewJobs(jobs);
  console.log(`\n✅ Done! Inserted: ${result.inserted}, Skipped: ${result.skipped}`);
  process.exit(0);
}

test().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});