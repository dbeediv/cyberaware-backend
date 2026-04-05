const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const r = await db.query('SELECT * FROM users WHERE email=$1', [email]);
  if (!r.rows.length) return res.status(401).json({ error: 'Invalid' });

  const user = r.rows[0];
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid' });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
  res.json({ token, user });
});

module.exports = router;
