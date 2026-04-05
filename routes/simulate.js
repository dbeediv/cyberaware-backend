// routes/simulate.js
// ── OWNED BY MEMBER 3 — DO NOT EDIT ──────────────────────────────
// Member 3 will implement:
//   POST /api/simulate/email  → sends real phishing email via SendGrid
//   POST /api/simulate/sms    → sends real SMS via Twilio
// ─────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

router.post('/email', (req, res) => {
  res.status(501).json({ message: 'Email simulation — Member 3 implementing this' });
});

router.post('/sms', (req, res) => {
  res.status(501).json({ message: 'SMS simulation — Member 3 implementing this' });
});

module.exports = router;
