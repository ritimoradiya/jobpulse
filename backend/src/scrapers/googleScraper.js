const puppeteer = require('puppeteer');

const GOOGLE_JOBS_URL = 'https://www.google.com/about/careers/applications/jobs/results?location=United+States&employment_type=FULL_TIME&degree=MASTERS&degree=BACHELORS&jex=ENTRY_LEVEL';

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

  try {
    await page.goto(GOOGLE_JOBS_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('[class*="sMn82b"]', { timeout: 15000 });

    const rawJobs = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="sMn82b"]');
      return Array.from(cards).map(card => {
        const title = card.querySelector('[class*="QJPWVe"]')?.innerText?.trim() || '';
        const location = card.querySelector('[class*="r0wTof"]')?.innerText?.trim() || '';
        const link = card.querySelector('a')?.href || '';
        const jobId = link.match(/jobs\/results\/(\d+)/)?.[1] || '';
        return { title, location, link, jobId };
      });
    });

    for (const job of rawJobs) {
      if (job.title && job.jobId) {
        jobs.push({
          title: job.title,
          company: 'Google',
          location: job.location,
          url: job.link,
          external_id: `google_${job.jobId}`,
          source: 'google_careers',
          scraped_at: new Date()
        });
      }
    }

    console.log(`✅ Scraped ${jobs.length} jobs from Google Careers`);
  } catch (err) {
    console.error('❌ Google scraper error:', err.message);
  } finally {
    await browser.close();
  }

  return jobs;
}

module.exports = { scrapeGoogleJobs };