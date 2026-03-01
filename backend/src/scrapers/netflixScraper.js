const https = require('https');
const db = require('../db');

async function fetchPage(start) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      `https://netflix.eightfold.ai/api/apply/v2/jobs?domain=netflix.com&start=${start}&num=10&sort_by=newest`,
      { headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' } },
      res => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => {
          try { resolve(JSON.parse(raw)); }
          catch(e) { reject(e); }
        });
      }
    );
    req.on('error', reject);
  });
}

async function scrapeNetflixJobs() {
  console.log('🔍 Starting Netflix Careers scraper...');
  const jobs = [];

  try {
    const firstPage = await fetchPage(0);
    const total = firstPage?.count || 0;
    console.log(`Total available on Netflix: ${total}`);

    // Fetch ALL pages first to build complete live jobs set
    const allPositions = [...(firstPage?.positions || [])];
    for (let start = 10; start < Math.min(total, 700); start += 10) {
      await new Promise(r => setTimeout(r, 200));
      const page = await fetchPage(start);
      allPositions.push(...(page?.positions || []));
    }

    // Build set of all live IDs
    const liveIds = new Set(allPositions.map(j => `netflix_${j.id}`));

    // Remove closed jobs from DB
    const existing = await db.query(
      `SELECT external_id FROM jobs WHERE source = 'netflix_careers'`
    );
    let deleted = 0;
    for (const row of existing.rows) {
      if (!liveIds.has(row.external_id)) {
        await db.query('DELETE FROM jobs WHERE external_id = $1', [row.external_id]);
        deleted++;
      }
    }
    if (deleted > 0) console.log(`🗑️  Netflix: removed ${deleted} closed jobs`);

    // Add only new jobs
    const existingIds = new Set(existing.rows.map(r => r.external_id));
    for (const job of allPositions) {
      if (!job.name || !job.id) continue;
      const extId = `netflix_${job.id}`;
      if (existingIds.has(extId)) continue;
      jobs.push({
        title: job.name,
        company: 'Netflix',
        location: job.location || '',
        url: job.canonicalPositionUrl || `https://explore.jobs.netflix.net/careers/job/${job.id}`,
        external_id: extId,
        source: 'netflix_careers',
        posted_at: job.t_create ? new Date(job.t_create * 1000) : new Date(),
        scraped_at: new Date()
      });
    }

    console.log(`✅ Found ${jobs.length} new jobs from Netflix`);
  } catch (err) {
    console.error('❌ Netflix scraper error:', err.message);
  }

  return jobs;
}

module.exports = { scrapeNetflixJobs };