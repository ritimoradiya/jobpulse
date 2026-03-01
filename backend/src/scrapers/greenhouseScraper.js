const https = require('https');
const db = require('../db');

async function scrapeGreenhouseJobs(company, boardToken) {
  console.log(`🔍 Starting ${company} Careers scraper (Greenhouse)...`);
  const jobs = [];

  try {
    const data = await new Promise((resolve, reject) => {
      https.get(
        `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs`,
        { headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' } },
        res => {
          let raw = '';
          res.on('data', c => raw += c);
          res.on('end', () => {
            try { resolve(JSON.parse(raw)); }
            catch(e) { reject(e); }
          });
        }
      ).on('error', reject);
    });

    const positions = data?.jobs || [];

    // Build set of live job IDs from API
    const liveIds = new Set(positions.map(j => `${boardToken}_${j.id}`));

    // Remove closed jobs from DB
    const existing = await db.query(
      'SELECT external_id FROM jobs WHERE source = $1',
      [`${boardToken}_careers`]
    );
    let deleted = 0;
    for (const row of existing.rows) {
      if (!liveIds.has(row.external_id)) {
        await db.query('DELETE FROM jobs WHERE external_id = $1', [row.external_id]);
        deleted++;
      }
    }
    if (deleted > 0) console.log(`🗑️  ${company}: removed ${deleted} closed jobs`);

    // Add only new jobs
    const existingIds = new Set(existing.rows.map(r => r.external_id));
    for (const job of positions) {
      if (!job.title || !job.id) continue;
      const extId = `${boardToken}_${job.id}`;
      if (existingIds.has(extId)) continue;
      jobs.push({
        title: job.title,
        company,
        location: job.location?.name || '',
        url: job.absolute_url || `https://boards.greenhouse.io/${boardToken}/jobs/${job.id}`,
        external_id: extId,
        source: `${boardToken}_careers`,
        posted_at: job.first_published ? new Date(job.first_published) : new Date(job.updated_at),
        scraped_at: new Date()
      });
    }

    console.log(`✅ Found ${jobs.length} new jobs from ${company}`);
  } catch (err) {
    console.error(`❌ ${company} scraper error:`, err.message);
  }

  return jobs;
}

async function scrapeAnthropicJobs()  { return scrapeGreenhouseJobs('Anthropic',  'anthropic'); }
async function scrapeStripeJobs()     { return scrapeGreenhouseJobs('Stripe',     'stripe'); }
async function scrapeAirbnbJobs()     { return scrapeGreenhouseJobs('Airbnb',     'airbnb'); }
async function scrapeDatabricksJobs() { return scrapeGreenhouseJobs('Databricks', 'databricks'); }
async function scrapeLyftJobs()       { return scrapeGreenhouseJobs('Lyft',       'lyft'); }
async function scrapeInstacartJobs()  { return scrapeGreenhouseJobs('Instacart',  'instacart'); }
async function scrapeRedditJobs()     { return scrapeGreenhouseJobs('Reddit',     'reddit'); }
async function scrapeRobinhoodJobs()  { return scrapeGreenhouseJobs('Robinhood',  'robinhood'); }
async function scrapePinterestJobs()  { return scrapeGreenhouseJobs('Pinterest',  'pinterest'); }

module.exports = {
  scrapeAnthropicJobs, scrapeStripeJobs, scrapeAirbnbJobs,
  scrapeDatabricksJobs, scrapeLyftJobs, scrapeInstacartJobs,
  scrapeRedditJobs, scrapeRobinhoodJobs, scrapePinterestJobs,
};