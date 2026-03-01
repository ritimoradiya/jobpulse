const https = require('https');
const db = require('../db');

const COMPANIES = [
  {
    name: 'Nvidia',
    id: 7932,
    tenant: 'nvidia',
    instance: 'nvidia.wd5.myworkdayjobs.com',
    site: 'NVIDIAExternalCareerSite',
    source: 'nvidia_workday'
  },
  {
    name: 'Salesforce',
    id: 7933,
    tenant: 'salesforce',
    instance: 'salesforce.wd12.myworkdayjobs.com',
    site: 'External_Career_Site',
    source: 'salesforce_workday'
  },
  {
    name: 'Adobe',
    id: 7934,
    tenant: 'adobe',
    instance: 'adobe.wd5.myworkdayjobs.com',
    site: 'external_experienced',
    source: 'adobe_workday'
  },
  {
    name: 'Fidelity',
    id: 7935,
    tenant: 'fmr',
    instance: 'fmr.wd1.myworkdayjobs.com',
    site: 'FidelityCareers',
    source: 'fidelity_workday'
  },
  {
    name: 'Athena Health',
    id: 7936,
    tenant: 'athenahealth',
    instance: 'athenahealth.wd1.myworkdayjobs.com',
    site: 'External',
    source: 'athenahealth_workday'
  },
];

const FULLTIME_IDS = {
  nvidia_workday:       '5509c0b5959810ac0029943377d47364',
  salesforce_workday:   '0e28126347c3100fe3b402cf26290000',
  adobe_workday:        '262714769a02100a80d2a64ac4e040c0',
  fidelity_workday:     '06f28e2f28c601248ec56b994b994d00',
  athenahealth_workday: 'af49756b96e74bd4a07069630ba8e465',
};

function parsePostedOn(postedOn) {
  if (!postedOn) return new Date();
  const text = postedOn.toLowerCase();
  if (text.includes('today')) return new Date();
  if (text.includes('yesterday')) {
    const d = new Date(); d.setDate(d.getDate() - 1); return d;
  }
  if (text.includes('30+')) {
    const d = new Date(); d.setDate(d.getDate() - 31); return d;
  }
  const daysMatch = text.match(/(\d+)\s+day/);
  if (daysMatch) {
    const d = new Date(); d.setDate(d.getDate() - parseInt(daysMatch[1])); return d;
  }
  return new Date();
}

function makeRequest(company, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const options = {
      hostname: company.instance,
      path: `/wday/cxs/${company.tenant}/${company.site}/jobs`,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0'
      }
    };
    const req = https.request(options, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch(e) { reject(new Error(`JSON parse failed: ${raw.slice(0, 100)}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Request timeout')); });
    req.write(postData);
    req.end();
  });
}

// Retry wrapper for flaky Workday responses
async function makeRequestWithRetry(company, body, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await makeRequest(company, body);
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`   Retry ${i + 1} for offset ${body.offset}...`);
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

// Build a stable external_id from a job posting
function getExternalId(source, job) {
  // Prefer externalPath as it's most stable, fall back to bulletFields
  const path = job.externalPath || job.bulletFields?.[0] || '';
  return `${source}_${path}`;
}

async function scrapeWorkdayCompany(company) {
  console.log(`🔍 Scraping ${company.name} (Workday)...`);
  const jobs = [];

  try {
    const fullTimeId = FULLTIME_IDS[company.source];
    const filter = fullTimeId ? { appliedFacets: { timeType: [fullTimeId] } } : {};

    // First request — get total count
    const firstPage = await makeRequestWithRetry(company, { limit: 20, offset: 0, ...filter });
    const total = firstPage?.total || 0;
    console.log(`   Total full-time jobs: ${total}`);

    if (total === 0) {
      console.log(`   ⚠️  No jobs returned for ${company.name}, skipping`);
      return jobs;
    }

    const allPostings = [...(firstPage?.jobPostings || [])];
    const pageSize = 20;

    // Fetch remaining pages with retries
    for (let offset = pageSize; offset < total; offset += pageSize) {
      await new Promise(r => setTimeout(r, 300));
      try {
        const page = await makeRequestWithRetry(company, { limit: pageSize, offset, ...filter });
        const postings = page?.jobPostings || [];
        allPostings.push(...postings);

        // If Workday returns fewer than expected, stop early
        if (postings.length === 0) {
          console.log(`   Stopped at offset ${offset} — no more results`);
          break;
        }
      } catch (err) {
        console.error(`   ❌ Failed at offset ${offset}: ${err.message}`);
        // Continue to next page instead of aborting entire scrape
      }
    }

    console.log(`   Fetched ${allPostings.length} total postings`);

    // Remove jobs older than 60 days (expired postings)
    const expired = await db.query(
      `DELETE FROM jobs WHERE source = $1 AND posted_at < NOW() - INTERVAL '60 days' RETURNING id`,
      [company.source]
    );
    if (expired.rowCount > 0) console.log(`🗑️  ${company.name}: removed ${expired.rowCount} expired jobs (60+ days)`);

    // Deduplicate by externalPath
    const seenPaths = new Set();
    const uniquePostings = allPostings.filter(job => {
      const path = job.externalPath;
      if (!path || seenPaths.has(path)) return false;
      seenPaths.add(path);
      return true;
    });

    // Insert only new jobs — no deletes based on API response (Workday rotates)
    const existing = await db.query('SELECT external_id FROM jobs WHERE source = $1', [company.source]);
    const existingIds = new Set(existing.rows.map(r => r.external_id));
    for (const job of uniquePostings) {
      if (!job.title || !job.externalPath) continue;
      const extId = getExternalId(company.source, job);
      if (existingIds.has(extId)) continue;

      jobs.push({
        title: job.title,
        company_id: company.id,
        location: job.locationsText || '',
        url: `https://${company.instance}/en-US/${company.site}${job.externalPath}`,
        external_id: extId,
        source: company.source,
        posted_at: parsePostedOn(job.postedOn),
        detected_at: new Date()
      });
    }

    console.log(`✅ ${company.name}: ${jobs.length} new jobs found`);
  } catch (err) {
    console.error(`❌ ${company.name} scraper error:`, err.message);
  }

  return jobs;
}

async function scrapeAllWorkdayJobs() {
  const allJobs = [];
  for (const company of COMPANIES) {
    const jobs = await scrapeWorkdayCompany(company);
    allJobs.push(...jobs);
    await new Promise(r => setTimeout(r, 500));
  }
  return allJobs;
}

async function scrapeNvidiaJobs()       { return scrapeWorkdayCompany(COMPANIES[0]); }
async function scrapeSalesforceJobs()   { return scrapeWorkdayCompany(COMPANIES[1]); }
async function scrapeAdobeJobs()        { return scrapeWorkdayCompany(COMPANIES[2]); }
async function scrapeFidelityJobs()     { return scrapeWorkdayCompany(COMPANIES[3]); }
async function scrapeAthenaHealthJobs() { return scrapeWorkdayCompany(COMPANIES[4]); }

module.exports = {
  scrapeAllWorkdayJobs,
  scrapeNvidiaJobs,
  scrapeSalesforceJobs,
  scrapeAdobeJobs,
  scrapeFidelityJobs,
  scrapeAthenaHealthJobs,
};