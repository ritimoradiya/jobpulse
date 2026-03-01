const express = require('express');
const router = express.Router();
const { matchResume, categorizeRoles } = require('../services/aiService');

// POST /api/ai/match
router.post('/match', async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        error: 'Both resumeText and jobDescription are required'
      });
    }

    if (resumeText.trim().length < 50) {
      return res.status(400).json({ error: 'Resume text is too short' });
    }

    if (jobDescription.trim().length < 50) {
      return res.status(400).json({ error: 'Job description is too short' });
    }

    const result = await matchResume(resumeText, jobDescription);
    res.json(result);
  } catch (err) {
    console.error('AI match error:', err.message);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

// POST /api/ai/categorize-roles
router.post('/categorize-roles', async (req, res) => {
  try {
    const { titles } = req.body;
    if (!titles || !Array.isArray(titles) || titles.length === 0)
      return res.status(400).json({ error: 'titles array is required' });
    const categories = await categorizeRoles(titles);
    res.json({ categories });
  } catch (err) {
    console.error('Categorize roles error:', err.message);
    res.status(500).json({ error: 'Failed to categorize roles' });
  }
});

module.exports = router;