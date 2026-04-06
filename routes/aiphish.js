const express = require('express');
const router  = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name required' });
    }

    // Placeholder — OpenAI will be added when API key is ready
    const message = `Hi ${name}, your account needs urgent verification. Click here to continue.`;

    res.json({
      status: 'success',
      message,
      note: 'AI generation placeholder — OpenAI key needed'
    });

  } catch (err) {
    console.error('AI simulate error:', err.message);
    res.status(500).json({ error: 'AI simulation failed' });
  }
});

module.exports = router;
