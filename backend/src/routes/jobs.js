const express = require('express');
const router = express.Router();
const pool = require('../db/index');

// GET /api/jobs
router.get('/', async (req, res) => {
  try {
    const {
      company, search, limit = 100, offset = 0,
      location, employment_type, sort = 'newest'
    } = req.query;

    let baseQuery = `
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE 1=1
      AND (j.title NOT LIKE '[TEMPLATE]%' OR j.title IS NULL)
    `;
    const params = [];

    if (company) {
      params.push(`%${company}%`);
      baseQuery += ` AND c.name ILIKE $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      baseQuery += ` AND j.title ILIKE $${params.length}`;
    }

    if (employment_type) {
      params.push(employment_type);
      baseQuery += ` AND j.employment_type ILIKE ${params.length}`;
    }

    // Quick filters
    if (req.query.quick === 'newToday') {
      baseQuery += ` AND j.posted_at >= NOW() - INTERVAL '24 hours'`;
    }
    if (req.query.quick === 'newGrad') {
      baseQuery += ` AND (
        j.title ILIKE '%new grad%' OR j.title ILIKE '%new graduate%' OR
        j.title ILIKE '%entry level%' OR j.title ILIKE '%entry-level%' OR
        j.title ILIKE '%junior%' OR j.title ILIKE '%associate%' OR
        j.title ILIKE '%university grad%' OR j.title ILIKE '%recent grad%'
      )`;
    }
    if (req.query.quick === 'remote') {
      baseQuery += ` AND (
        j.title ILIKE '%remote%' OR j.location ILIKE '%remote%' OR
        j.location ILIKE '%work from home%' OR j.location ILIKE '%anywhere%'
      )`;
    }


    // Location filter — smart matching
    if (location) {
      const loc = location.toLowerCase();
      if (loc === 'united states') {
        baseQuery += ` AND (
          j.location ILIKE 'US, %' OR
          j.location ILIKE '%united states%' OR j.location ILIKE '%usa%' OR
          j.location ILIKE '%us-%' OR j.location ILIKE '%-us%' OR
          j.location ILIKE '%us,%' OR j.location ILIKE '%, us%' OR
          j.location ILIKE '%remote us%' OR j.location ILIKE '%us remote%' OR
          j.location ILIKE '%remote - us%' OR j.location ILIKE '%remote - usa%' OR
          j.location ILIKE '%- usa%' OR LOWER(j.location) = 'us'
        )`;
      } else if (loc === 'united kingdom') {
        baseQuery += ` AND (
          j.location ILIKE '%united kingdom%' OR j.location ILIKE '%london%' OR
          j.location ILIKE '%, uk%' OR j.location ILIKE '%uk,%'
        )`;
      } else if (loc === 'canada') {
        baseQuery += ` AND (
          j.location ILIKE '%canada%' OR j.location ILIKE '%ca-%' OR
          j.location ILIKE '%toronto%' OR j.location ILIKE '%vancouver%'
        )`;
      } else {
        params.push(`%${location}%`);
        baseQuery += ` AND j.location ILIKE $${params.length}`;
      }
    }

    // Total count
    const countResult = await pool.query(`SELECT COUNT(*) ${baseQuery}`, params);
    const total = parseInt(countResult.rows[0].count);

    // Sort order
    const orderBy = sort === 'oldest'
      ? 'j.posted_at ASC NULLS LAST'
      : 'j.posted_at DESC NULLS LAST';

    const dataQuery = `
      SELECT j.id, j.title, j.location, j.url, j.source,
             j.posted_at, j.detected_at, j.employment_type,
             c.name AS company, c.career_url
      ${baseQuery}
      ORDER BY ${orderBy}
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    const result = await pool.query(dataQuery, [...params, limit, offset]);

    res.json({
      success: true,
      total,
      count: result.rows.length,
      offset: parseInt(offset),
      limit: parseInt(limit),
      jobs: result.rows
    });
  } catch (err) {
    console.error('Error fetching jobs:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch jobs' });
  }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, c.name AS company, c.career_url
       FROM jobs j
       JOIN companies c ON j.company_id = c.id
       WHERE j.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, error: 'Job not found' });
    res.json({ success: true, job: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch job' });
  }
});

// POST /api/jobs/scrape — scrape all companies
router.post('/scrape', async (req, res) => {
  try {
    const { runAllScrapers } = require('../cron/scrapeJob');
    const { io } = require('../server');
    res.json({ success: true, message: 'Scraping started...' });
    runAllScrapers(io)
      .then(r => console.log('✅ Manual scrape complete:', r))
      .catch(err => console.error('Scrape error:', err.message));
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to trigger scraper' });
  }
});

// POST /api/jobs/scrape/google — scrape Google only
router.post('/scrape/google', async (req, res) => {
  try {
    const { scrapeGoogleJobs } = require('../scrapers/googleScraper');
    const { saveJobs } = require('../cron/scrapeJob');
    res.json({ success: true, message: 'Google scrape started...' });
    scrapeGoogleJobs()
      .then(jobs => saveJobs(jobs))
      .then(r => console.log('✅ Google scrape complete:', r))
      .catch(e => console.error('❌ Google scrape failed:', e));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;