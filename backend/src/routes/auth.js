const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/index');

// ─── Auth middleware ───────────────────────────────────────────────────────────
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, error: 'All fields required' });

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ success: false, error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3) RETURNING id, name, email, created_at`,
      [name, email, hashedPassword]
    );
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email and password required' });

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword)
      return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

// PUT /api/auth/update-email
router.put('/update-email', authenticate, async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    if (!newEmail || !password)
      return res.status(400).json({ error: 'New email and current password required' });

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Incorrect password' });

    const exists = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [newEmail, req.user.userId]);
    if (exists.rows.length > 0)
      return res.status(400).json({ error: 'Email already in use' });

    await pool.query('UPDATE users SET email = $1 WHERE id = $2', [newEmail, req.user.userId]);
    res.json({ success: true, message: 'Email updated' });
  } catch (err) {
    console.error('Update email error:', err.message);
    res.status(500).json({ error: 'Failed to update email' });
  }
});

// PUT /api/auth/update-password
router.put('/update-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Both current and new password required' });

    if (newPassword.length < 6)
      return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    const user = result.rows[0];

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Incorrect current password' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashed, req.user.userId]);
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.error('Update password error:', err.message);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// DELETE /api/auth/delete-account
router.delete('/delete-account', authenticate, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required to delete account' });

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Incorrect password' });

    await pool.query('DELETE FROM users WHERE id = $1', [req.user.userId]);
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    console.error('Delete account error:', err.message);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;