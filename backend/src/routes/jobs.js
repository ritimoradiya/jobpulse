const express = require('express');
const router = express.Router();
const pool = require('../db/index');

// GET /api/jobs - Get all scraped jobs with filters
router.get('/', async (req, res) => {
  try {
    const { company, location, search, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT j.id, j.title, j.location, j.url, j.source, j.posted_at, j.detected_at,
             c.name AS company, c.career_url
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (company) {
      params.push(`%${company}%`);
      query += ` AND c.name ILIKE $${params.length}`;
    }
    if (location) {
      params.push(`%${location}%`);
      query += ` AND j.location ILIKE $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND j.title ILIKE $${params.length}`;
    }

    query += ` ORDER BY j.detected_at DESC`;
    params.push(limit);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      jobs: result.rows
    });
  } catch (err) {
    console.error('Error fetching jobs:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch jobs' });
  }
});

// GET /api/jobs/:id - Get single job
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, c.name AS company, c.career_url
       FROM jobs j
       JOIN companies c ON j.company_id = c.id
       WHERE j.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.json({ success: true, job: result.rows[0] });
  } catch (err) {
    console.error('Error fetching job:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch job' });
  }
});

// POST /api/jobs/scrape - Trigger scraper manually
router.post('/scrape', async (req, res) => {
  try {
    const { scrapeGoogleJobs } = require('../scrapers/googleScraper');
    const { insertNewJobs } = require('../services/diffEngine');

    res.json({ success: true, message: 'Scraping started...' });

    // Run in background
    scrapeGoogleJobs()
      .then(jobs => insertNewJobs(jobs))
      .then(result => console.log(`✅ Manual scrape complete:`, result))
      .catch(err => console.error('Scrape error:', err.message));
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to trigger scraper' });
  }
});

module.exports = router;