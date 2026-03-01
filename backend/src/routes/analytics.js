const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/analytics/summary
router.get('/summary', async (req, res) => {
  try {
    const totalJobs = await db.query('SELECT COUNT(*) FROM jobs');
    const newToday = await db.query(`
      SELECT COUNT(*) FROM jobs 
      WHERE DATE(detected_at) = CURRENT_DATE
    `);
    const byCompany = await db.query(`
      SELECT c.name as company, COUNT(*) as count 
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      GROUP BY c.name 
      ORDER BY count DESC
    `);
    const companies = await db.query('SELECT COUNT(DISTINCT company_id) FROM jobs');

    res.json({
      totalJobs: parseInt(totalJobs.rows[0].count),
      newToday: parseInt(newToday.rows[0].count),
      totalCompanies: parseInt(companies.rows[0].count),
      byCompany: byCompany.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// GET /api/analytics/trends
router.get('/trends', async (req, res) => {
  try {
    const perDay = await db.query(`
      SELECT 
        DATE(detected_at) as date,
        COUNT(*) as count
      FROM jobs
      WHERE detected_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(detected_at)
      ORDER BY date ASC
    `);

    const byCompany = await db.query(`
      SELECT c.name as company, COUNT(*) as count
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      GROUP BY c.name
      ORDER BY count DESC
    `);

    res.json({
      perDay: perDay.rows,
      byCompany: byCompany.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// GET /api/analytics/locations
router.get('/locations', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT DISTINCT location FROM jobs
      WHERE location IS NOT NULL AND location != ''
    `);

    const countryMap = {
      'united states': 'United States',
      'usa': 'United States',
      ' us': 'United States',
      'us-remote': 'United States',
      'canada': 'Canada',
      'ca-remote': 'Canada',
      'united kingdom': 'United Kingdom',
      'germany': 'Germany',
      'india': 'India',
      'australia': 'Australia',
      'singapore': 'Singapore',
      'japan': 'Japan',
      'france': 'France',
      'spain': 'Spain',
      'netherlands': 'Netherlands',
      'brazil': 'Brazil',
      'ireland': 'Ireland',
      'poland': 'Poland',
      'romania': 'Romania',
      'korea': 'South Korea',
      'mexico': 'Mexico',
      'colombia': 'Colombia',
      'argentina': 'Argentina',
      'sweden': 'Sweden',
      'denmark': 'Denmark',
      'norway': 'Norway',
      'finland': 'Finland',
      'portugal': 'Portugal',
      'italy': 'Italy',
      'switzerland': 'Switzerland',
      'china': 'China',
    };

    const countries = new Set();
    for (const row of result.rows) {
      const loc = row.location.toLowerCase();
      for (const [key, value] of Object.entries(countryMap)) {
        if (loc.includes(key)) {
          countries.add(value);
          break;
        }
      }
    }

    res.json({ locations: Array.from(countries).sort() });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// GET /api/analytics/my-activity — user's saved + applied stats
router.get('/my-activity', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const savedTotal = await db.query(
      'SELECT COUNT(*) FROM user_job_tracks WHERE user_id = $1',
      [userId]
    );

    const appliedTotal = await db.query(
      'SELECT COUNT(*) FROM applied_jobs WHERE user_id = $1',
      [userId]
    );

    const alertsTotal = await db.query(
      'SELECT COUNT(*) FROM alerts WHERE user_id = $1 AND is_active = true',
      [userId]
    );

    const appliedPerDay = await db.query(
      `SELECT DATE(applied_at) as date, COUNT(*) as count
       FROM applied_jobs
       WHERE user_id = $1 AND applied_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(applied_at)
       ORDER BY date ASC`,
      [userId]
    );

    const savedPerDay = await db.query(
      `SELECT DATE(tracked_at) as date, COUNT(*) as count
       FROM user_job_tracks
       WHERE user_id = $1 AND tracked_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(tracked_at)
       ORDER BY date ASC`,
      [userId]
    );

    res.json({
      totalSaved: parseInt(savedTotal.rows[0].count),
      totalApplied: parseInt(appliedTotal.rows[0].count),
      activeAlerts: parseInt(alertsTotal.rows[0].count),
      appliedPerDay: appliedPerDay.rows,
      savedPerDay: savedPerDay.rows,
    });
  } catch (err) {
    console.error('GET /analytics/my-activity error:', err.message);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

module.exports = router;