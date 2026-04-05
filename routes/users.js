const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

const SAFE_COLS = 'id,name,email,role,domain,dept,avatar,score,trend,campaigns,failed,trained,created_at';

router.get('/', requireRole('admin', 'trainer'), async (req, res) => {
  try {
    const r = await db.query(`SELECT ${SAFE_COLS} FROM users ORDER BY created_at DESC`);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const r = await db.query(`SELECT ${SAFE_COLS} FROM users WHERE id = $1`, [req.user.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (req.user.role === 'user' && req.user.id !== req.params.id)
      return res.status(403).json({ error: 'Access denied' });

    const r = await db.query(`SELECT ${SAFE_COLS} FROM users WHERE id = $1`, [req.params.id]);

    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });

    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;
