const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/applied — get all applied jobs for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT aj.id, aj.applied_at, j.id as job_id, j.title, j.location, j.url, j.posted_at,
              c.name as company, c.career_url
       FROM applied_jobs aj
       JOIN jobs j ON aj.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE aj.user_id = $1
       ORDER BY aj.applied_at DESC`,
      [req.user.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /applied error:', err);
    res.status(500).json({ error: 'Failed to fetch applied jobs' });
  }
});

// GET /api/applied/ids — just the job IDs the user has applied to (for UI state)
router.get('/ids', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT job_id FROM applied_jobs WHERE user_id = $1',
      [req.user.userId]
    );
    res.json(rows.map(r => r.job_id));
  } catch (err) {
    console.error('GET /applied/ids error:', err);
    res.status(500).json({ error: 'Failed to fetch applied IDs' });
  }
});

// GET /api/applied/breakdown — role category breakdown for analytics
router.get('/breakdown', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT j.title FROM applied_jobs aj
       JOIN jobs j ON aj.job_id = j.id
       WHERE aj.user_id = $1`,
      [req.user.userId]
    );
    res.json({ titles: rows.map(r => r.title) });
  } catch (err) {
    console.error('GET /applied/breakdown error:', err);
    res.status(500).json({ error: 'Failed to fetch breakdown' });
  }
});

// POST /api/applied/:jobId — mark job as applied
router.post('/:jobId', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      `INSERT INTO applied_jobs (user_id, job_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, job_id) DO NOTHING
       RETURNING *`,
      [req.user.userId, req.params.jobId]
    );
    res.status(201).json({ success: true, applied: rows[0] });
  } catch (err) {
    console.error('POST /applied error:', err);
    res.status(500).json({ error: 'Failed to mark as applied' });
  }
});

// DELETE /api/applied/:jobId — unmark applied
router.delete('/:jobId', authenticateToken, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM applied_jobs WHERE user_id = $1 AND job_id = $2',
      [req.user.userId, req.params.jobId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /applied error:', err);
    res.status(500).json({ error: 'Failed to unmark applied' });
  }
});

module.exports = router;