const puppeteer = require('puppeteer');
const db = require('../db');

const GOOGLE_JOBS_URL = 'https://www.google.com/about/careers/applications/jobs/results?sort_by=date&employment_type=FULL_TIME';

async function scrapeGoogleJobs() {
  console.log('🔍 Starting Google Careers scraper...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  const jobs = [];

  // Get existing Google job IDs to avoid re-scraping
  const existing = await db.query(
    `SELECT external_id FROM jobs WHERE source = 'google_careers'`
  );
  const existingIds = new Set(existing.rows.map(r => r.external_id));
  console.log(`Existing Google jobs in DB: ${existingIds.size}`);

  try {
    let pageNum = 1;
    let hasMore = true;
    let consecutiveDuplicatePages = 0;

    while (hasMore && pageNum <= 300) {
      const url = pageNum === 1
        ? GOOGLE_JOBS_URL
        : `${GOOGLE_JOBS_URL}&page=${pageNum}`;

      console.log(`Scraping page ${pageNum}...`);

      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await page.waitForSelector('[class*="sMn82b"]', { timeout: 15000 });
      } catch {
        console.log(`Page ${pageNum}: no results, stopping`);
        break;
      }

      const rawJobs = await page.evaluate(() => {
        const cards = document.querySelectorAll('[class*="sMn82b"]');
        return Array.from(cards).map(card => {
          const title = card.querySelector('[class*="QJPWVe"]')?.innerText?.trim() || '';
          const location = card.querySelector('[class*="r0wTof"]')?.innerText?.trim() || '';
          const link = card.querySelector('a')?.href || '';
          const jobId = link.match(/jobs\/results\/(\d+)/)?.[1] || '';
          // Try to get posted date from the card
          const dateText = card.querySelector('[class*="SuWscb"]')?.innerText?.trim() || '';
          return { title, location, link, jobId, dateText };
        });
      });

      if (rawJobs.length === 0) {
        hasMore = false;
        break;
      }

      let newOnThisPage = 0;
      for (const job of rawJobs) {
        if (!job.title || !job.jobId) continue;
        const extId = `google_${job.jobId}`;
        if (existingIds.has(extId)) continue; // skip duplicates, don't stop
        jobs.push({
          title: job.title,
          company: 'Google',
          location: job.location,
          url: job.link,
          external_id: extId,
          source: 'google_careers',
          posted_at: new Date(), // Google doesn't expose dates in list view
          scraped_at: new Date()
        });
        existingIds.add(extId); // prevent duplicates within same run
        newOnThisPage++;
      }

      console.log(`  Page ${pageNum}: ${newOnThisPage} new jobs`);

      // Stop if 25 consecutive pages have no new jobs
      if (newOnThisPage === 0) {
        consecutiveDuplicatePages++;
        if (consecutiveDuplicatePages >= 25) {
          console.log('25 consecutive pages with no new jobs, stopping');
          break;
        }
      } else {
        consecutiveDuplicatePages = 0;
      }

      pageNum++;
      await new Promise(r => setTimeout(r, 1500)); // polite delay
    }

    console.log(`✅ Scraped ${jobs.length} new jobs from Google Careers`);
  } catch (err) {
    console.error('❌ Google scraper error:', err.message);
  } finally {
    await browser.close();
  }

  return jobs;
}

module.exports = { scrapeGoogleJobs };