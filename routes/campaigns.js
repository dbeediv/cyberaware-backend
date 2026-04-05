const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const r = await db.query('SELECT * FROM campaigns');
  res.json(r.rows);
});

router.post('/', async (req, res) => {
  const { name, domain, scenario } = req.body;

  const r = await db.query(
    'INSERT INTO campaigns (name, domain, scenario) VALUES ($1,$2,$3) RETURNING *',
    [name, domain, scenario]
  );

  res.json(r.rows[0]);
});

module.exports = router;
