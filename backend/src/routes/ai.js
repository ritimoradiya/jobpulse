const express = require('express');
const router = express.Router();

// TODO: Add AI routes
router.get('/', (req, res) => {
  res.json({ message: 'AI routes coming soon' });
});

module.exports = router;
