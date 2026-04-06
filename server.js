// server.js — CyberAware Backend Entry Point
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const app     = express();

// ── Middleware ────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5500',
    'http://127.0.0.1:5500',
    /\.vercel\.app$/,
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().slice(11,19)}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────

// Member 1 — Auth + Users + Campaigns
app.use('/api/auth',            require('./routes/auth'));
app.use('/api/users',           require('./routes/users'));
app.use('/api/campaigns',       require('./routes/campaigns'));

// Member 2 — Tracking engine
app.use('/track',      require('./routes/tracking'));
app.use('/api/events', require('./routes/events'));

// Member 4 — AI phishing (must be BEFORE /api/simulate to avoid route conflict)
app.use('/api/simulate/ai-phish', require('./routes/aiphish'));

// Member 3 — Real attacks (email + SMS)
app.use('/api/simulate',        require('./routes/simulate'));

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'CyberAware', time: new Date().toISOString() });
});

// ── Root — API info ───────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name: 'CyberAware API',
    version: '1.0.0',
    endpoints: [
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET  /api/users',
      'GET  /api/users/me',
      'GET  /api/users/:id',
      'GET  /api/campaigns',
      'GET  /api/campaigns/:id',
      'POST /api/campaigns',
      'GET  /track',
      'POST /track',
      'POST /api/simulate/email',
      'POST /api/simulate/sms',
      'POST /api/simulate/ai-phish',
      'GET  /health',
    ],
  });
});

// ── 404 ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ── Global error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ CyberAware backend running → http://localhost:${PORT}\n`);
});
