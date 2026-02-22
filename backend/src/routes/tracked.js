const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');

// GET /api/tracked — get all saved jobs for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT t.id, t.job_id, t.tracked_at,
              j.title, j.location, j.url, j.source, j.posted_at,
              c.name AS company
       FROM user_job_tracks t
       JOIN jobs j ON j.id = t.job_id
       LEFT JOIN companies c ON c.id = j.company_id
       WHERE t.user_id = $1
       ORDER BY t.tracked_at DESC`,
      [req.user.userId]
    );
    res.json({ tracked: result.rows });
  } catch (err) {
    console.error('Get tracked error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/tracked — save a job
router.post('/', authenticateToken, async (req, res) => {
  const { job_id } = req.body;
  if (!job_id) return res.status(400).json({ message: 'job_id required' });
  try {
    const existing = await db.query(
      'SELECT id FROM user_job_tracks WHERE user_id = $1 AND job_id = $2',
      [req.user.userId, job_id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Job already saved' });
    }
    const result = await db.query(
      'INSERT INTO user_job_tracks (user_id, job_id) VALUES ($1, $2) RETURNING *',
      [req.user.userId, job_id]
    );
    res.status(201).json({ tracked: result.rows[0] });
  } catch (err) {
    console.error('Save job error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/tracked/:jobId — remove a saved job
router.delete('/:jobId', authenticateToken, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM user_job_tracks WHERE user_id = $1 AND job_id = $2',
      [req.user.userId, req.params.jobId]
    );
    res.json({ message: 'Job removed from saved' });
  } catch (err) {
    console.error('Remove tracked error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;