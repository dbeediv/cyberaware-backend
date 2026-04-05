// routes/track.js
// ── OWNED BY MEMBER 2 — DO NOT EDIT ──────────────────────────────
// Member 2 will implement:
//   GET  /track?uid=xxx&event=opened
//   GET  /track?uid=xxx&event=clicked
//   POST /track?uid=xxx&event=submitted
//   POST /track?uid=xxx&event=reported
//   GET  /api/events/live
// ─────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

router.get('/', (req, res) => {
  res.status(501).json({ message: 'Tracking engine — Member 2 implementing this' });
});

router.post('/', (req, res) => {
  res.status(501).json({ message: 'Tracking engine — Member 2 implementing this' });
});

module.exports = router;
