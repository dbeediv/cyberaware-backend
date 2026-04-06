const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { getScoreDelta } = require('../utils/scoring');

// GET /track?uid=xxx&event=opened|clicked
router.get('/', async (req, res) => {
  try {
    const { uid, event } = req.query;
    if (!uid || !event)
      return res.status(400).json({ error: 'uid and event are required' });

    const delta = getScoreDelta(event);

    // Log event
    await db.query(
      `INSERT INTO events (token, user_id, event_type)
       VALUES ($1, $2, $3)`,
      [uid, uid, event]
    );

    // Update user score
    if (delta !== 0) {
      await db.query(
        `UPDATE users
         SET score = GREATEST(0, LEAST(100, score + $1)),
             trend = trend + $1
         WHERE id = $2`,
        [delta, uid]
      );
    }

    // Update campaign counter
    if (event === 'clicked') {
      await db.query(
        `UPDATE campaigns SET clicked = clicked + 1
         WHERE id = (SELECT campaign_id FROM campaign_users WHERE user_id = $1 LIMIT 1)`,
        [uid]
      );
    }

    res.json({ success: true, event, delta });
  } catch (err) {
    console.error('Track error:', err.message);
    res.status(500).json({ error: 'Tracking failed' });
  }
});

// POST /track — submitted, reported, training
router.post('/', async (req, res) => {
  try {
    const { uid, event } = req.body;
    if (!uid || !event)
      return res.status(400).json({ error: 'uid and event are required' });

    const delta = getScoreDelta(event);

    await db.query(
      `INSERT INTO events (token, user_id, event_type) VALUES ($1, $2, $3)`,
      [uid, uid, event]
    );

    if (delta !== 0) {
      await db.query(
        `UPDATE users
         SET score = GREATEST(0, LEAST(100, score + $1)),
             trend = trend + $1
         WHERE id = $2`,
        [delta, uid]
      );
    }

    if (event === 'submitted') {
      await db.query(`UPDATE users SET failed = failed + 1 WHERE id = $1`, [uid]);
    }
    if (event === 'training') {
      await db.query(`UPDATE users SET trained = trained + 1 WHERE id = $1`, [uid]);
    }

    res.json({ success: true, event, delta });
  } catch (err) {
    console.error('Track POST error:', err.message);
    res.status(500).json({ error: 'Tracking failed' });
  }
});

module.exports = router;
