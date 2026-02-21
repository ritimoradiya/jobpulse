const express = require('express');
const router = express.Router();

// TODO: Add alert routes
router.get('/', (req, res) => {
  res.json({ message: 'Alerts routes coming soon' });
});

module.exports = router;
