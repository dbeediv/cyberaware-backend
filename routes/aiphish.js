const express = require('express');
const router  = express.Router();
const { OpenAI } = require('openai');
const { authMiddleware, requireRole } = require('../middleware/auth');
const db = require('../db');

router.use(authMiddleware);

router.post('/', requireRole('admin','trainer'), async (req, res) => {
  try {
    const { userId, scenario, campaignId } = req.body;
    if (!userId || !scenario)
      return res.status(400).json({ error: 'userId and scenario required' });

    const user = await db.query(
      'SELECT name, email, dept, domain FROM users WHERE id=$1', [userId]
    );
    if (!user.rows.length)
      return res.status(404).json({ error: 'User not found' });

    const { name, dept, domain } = user.rows[0];

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `You are a security trainer writing a SIMULATED phishing email
for cybersecurity awareness training. NOT a real attack.
Write a realistic phishing email for:
- Recipient name: ${name}
- Department: ${dept}
- Domain: ${domain}
- Scenario: ${scenario}
Return ONLY a JSON object: { "subject": "...", "body": "..." }
Body should be HTML. Include 2-3 subtle red flags a trained eye would catch.`
      }],
      response_format: { type: 'json_object' },
      max_tokens: 600,
    });

    const { subject, body } = JSON.parse(
      completion.choices[0].message.content
    );

    const cu = campaignId ? await db.query(
      'SELECT token FROM campaign_users WHERE campaign_id=$1 AND user_id=$2',
      [campaignId, userId]
    ) : { rows: [] };

    const token = cu.rows[0]?.token;
    const SERVER = process.env.BACKEND_URL || 'http://localhost:3000';
    const trackedBody = token
      ? body + `<img src="${SERVER}/track?uid=${token}&event=opened" width="1"/>`
      : body;

    res.json({ subject, body: trackedBody });

  } catch (err) {
    console.error('AI phish error:', err.message);
    res.status(500).json({ error: 'AI generation failed', details: err.message });
  }
});

module.exports = router;
