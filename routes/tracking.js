const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { getScoreDelta } = require('../utils/scoring');

// GET /track?uid=xxx&event=opened|clicked
router.get('/', async (req, res) => {
  try {
    const { uid, event } = req.query;
    if (!uid || !event)
      return res.status(400).json({ error: 'uid and event required' });

    // Look up the real user_id from campaign_users token
    const cu = await db.query(
      'SELECT user_id, campaign_id FROM campaign_users WHERE token = $1',
      [uid]
    );

    const userId     = cu.rows.length ? cu.rows[0].user_id     : uid;
    const campaignId = cu.rows.length ? cu.rows[0].campaign_id : null;

    const delta = getScoreDelta(event);

    await db.query(
      `INSERT INTO events (token, user_id, campaign_id, event_type)
       VALUES ($1, $2, $3, $4)`,
      [uid, userId, campaignId, event]
    );

    if (delta !== 0) {
      await db.query(
        `UPDATE users
         SET score = GREATEST(0, LEAST(100, score + $1)),
             trend = trend + $1
         WHERE id = $2`,
        [delta, userId]
      );
    }

    if (event === 'clicked' && campaignId) {
      await db.query(
        'UPDATE campaigns SET clicked = clicked + 1 WHERE id = $1',
        [campaignId]
      );
    }

    res.json({ success: true, event, delta });
  } catch (err) {
    console.error('Track GET error:', err.message);
    res.status(500).json({ error: 'Tracking failed' });
  }
});

// POST /track — submitted, reported, training
router.post('/', async (req, res) => {
  try {
    const { uid, event } = req.body;
    if (!uid || !event)
      return res.status(400).json({ error: 'uid and event required' });

    const cu = await db.query(
      'SELECT user_id, campaign_id FROM campaign_users WHERE token = $1',
      [uid]
    );

    const userId     = cu.rows.length ? cu.rows[0].user_id     : uid;
    const campaignId = cu.rows.length ? cu.rows[0].campaign_id : null;

    const delta = getScoreDelta(event);

    await db.query(
      `INSERT INTO events (token, user_id, campaign_id, event_type)
       VALUES ($1, $2, $3, $4)`,
      [uid, userId, campaignId, event]
    );

    if (delta !== 0) {
      await db.query(
        `UPDATE users
         SET score = GREATEST(0, LEAST(100, score + $1)),
             trend = trend + $1
         WHERE id = $2`,
        [delta, userId]
      );
    }

    if (event === 'submitted' && campaignId) {
      await db.query(
        'UPDATE campaigns SET submitted = submitted + 1 WHERE id = $1',
        [campaignId]
      );
      await db.query(
        'UPDATE users SET failed = failed + 1 WHERE id = $1',
        [userId]
      );
    }

    if (event === 'reported' && campaignId) {
      await db.query(
        'UPDATE campaigns SET reported = reported + 1 WHERE id = $1',
        [campaignId]
      );
    }

    if (event === 'training') {
      await db.query(
        'UPDATE users SET trained = trained + 1 WHERE id = $1',
        [userId]
      );
    }

    res.json({ success: true, event, delta });
  } catch (err) {
    console.error('Track POST error:', err.message);
    res.status(500).json({ error: 'Tracking failed' });
  }
});

module.exports = router;
