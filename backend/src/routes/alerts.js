const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/alerts — fetch user's alerts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /alerts error:', err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// POST /api/alerts — create alert
router.post('/', authenticateToken, async (req, res) => {
  const { email, companies, keywords } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  if (!companies?.length && !keywords?.length)
    return res.status(400).json({ error: 'Provide at least one company or keyword' });

  try {
    const { rows } = await db.query(
      `INSERT INTO alerts (user_id, email, companies, keywords)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.userId, email, companies || [], keywords || []]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /alerts error:', err);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// DELETE /api/alerts/:id — delete alert
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { rowCount } = await db.query(
      'DELETE FROM alerts WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );
    if (!rowCount) return res.status(404).json({ error: 'Alert not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /alerts error:', err);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

// PATCH /api/alerts/:id/toggle — enable/disable
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      `UPDATE alerts SET is_active = NOT is_active
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.user.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Alert not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /alerts toggle error:', err);
    res.status(500).json({ error: 'Failed to toggle alert' });
  }
});

module.exports = router;