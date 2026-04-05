const express    = require('express');
const router     = express.Router();
const { v4: uuidv4 } = require('uuid');
const db         = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM campaigns ORDER BY created_at DESC');
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const camp = await db.query('SELECT * FROM campaigns WHERE id = $1', [req.params.id]);

    if (!camp.rows.length) return res.status(404).json({ error: 'Not found' });

    const users = await db.query(
      `SELECT cu.*, u.name, u.email, u.dept, u.avatar
       FROM campaign_users cu
       JOIN users u ON u.id = cu.user_id
       WHERE cu.campaign_id = $1`,
      [req.params.id]
    );

    res.json({ ...camp.rows[0], users: users.rows });

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

router.post('/', requireRole('admin', 'trainer'), async (req, res) => {
  try {
    const { name, domain, scenario, channel='Email', difficulty='medium', userIds=[] } = req.body;

    if (!name || !domain || !scenario || userIds.length === 0)
      return res.status(400).json({ error: 'name, domain, scenario, userIds required' });

    const camp = await db.query(
      `INSERT INTO campaigns (name,domain,scenario,channel,difficulty,status,sent,created_by)
       VALUES ($1,$2,$3,$4,$5,'active',$6,$7) RETURNING *`,
      [name, domain, scenario, channel, difficulty, userIds.length, req.user.id]
    );

    const campaign = camp.rows[0];

    for (const userId of userIds) {
      await db.query(
        `INSERT INTO campaign_users (campaign_id, user_id, token)
         VALUES ($1, $2, $3)
         ON CONFLICT (campaign_id, user_id) DO NOTHING`,
        [campaign.id, userId, uuidv4()]
      );
    }

    res.status(201).json(campaign);

  } catch (err) {
    console.error('Create campaign error:', err.message);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

module.exports = router;
