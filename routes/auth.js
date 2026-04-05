const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../db');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: 'Invalid email or password' });

    const user  = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...safeUser } = user;

    res.json({ token, user: safeUser });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role='user', domain='corporate', dept='' } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email, and password required' });

    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const result = await db.query(
      `INSERT INTO users (name, email, password, role, domain, dept, avatar)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, email.toLowerCase(), hashed, role, domain, dept, avatar]
    );

    const user  = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...safeUser } = user;

    res.status(201).json({ token, user: safeUser });

  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
