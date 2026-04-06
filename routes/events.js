const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/events/live — returns last 10 events
router.get('/live', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.*, u.name, u.email, u.avatar
       FROM events e
       LEFT JOIN users u ON u.id = e.user_id
       ORDER BY e.created_at DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Events error:', err.message);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

module.exports = router;
