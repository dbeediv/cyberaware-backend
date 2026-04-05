const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const r = await db.query('SELECT * FROM users');
  res.json(r.rows);
});

router.get('/me', async (req, res) => {
  const r = await db.query('SELECT * FROM users WHERE id=$1', [req.user.id]);
  res.json(r.rows[0]);
});

module.exports = router;
