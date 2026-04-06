// routes/simulate.js
const express = require('express');
const router  = express.Router();
const { Resend } = require('resend');
const twilio = require('twilio');

const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ── POST /api/simulate/email ─────────────────────────────────────
router.post('/email', async (req, res) => {
  try {
    const { toEmail, toName, scenario, trackingToken } = req.body;

    if (!toEmail || !toName || !scenario) {
      return res.status(400).json({ error: 'toEmail, toName, scenario required' });
    }

    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
    const FAKE_URL    = process.env.FAKE_PAGES_URL || 'https://cyberaware-fakepages.vercel.app';
    const token       = trackingToken || 'test-token';

    // Tracking pixel + click link
    const openPixel  = `${BACKEND_URL}/track?uid=${token}&event=opened`;
    const clickLink  = `${BACKEND_URL}/track?uid=${token}&event=clicked`;

    // Email templates per scenario
    const templates = {
      c1: {
        subject: 'Action Required: Microsoft 365 Password Expiry',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#0078d4;padding:20px;text-align:center;">
              <h2 style="color:#fff;margin:0;">Microsoft 365</h2>
            </div>
            <div style="padding:24px;background:#f5f5f5;">
              <p>Dear ${toName},</p>
              <p>Your Microsoft 365 password will expire in <strong>24 hours</strong>.</p>
              <p>Click below to update your password and avoid losing access:</p>
              <div style="text-align:center;margin:24px 0;">
                <a href="${clickLink}" style="background:#0078d4;color:#fff;padding:12px 28px;border-radius:4px;text-decoration:none;font-weight:600;">
                  Update Password Now
                </a>
              </div>
              <p style="color:#999;font-size:12px;">Microsoft IT Support Team</p>
            </div>
            <img src="${openPixel}" width="1" height="1" style="display:none"/>
          </div>`
      },
      b1: {
        subject: 'ALERT: Suspicious Activity on Your Account',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#1a75bb;padding:20px;text-align:center;">
              <h2 style="color:#fff;margin:0;">🏦 SecureBank</h2>
            </div>
            <div style="padding:24px;background:#fff0f0;border:1px solid #fcc;">
              <p style="color:#c00;font-weight:600;">⚠️ Suspicious activity detected on your account.</p>
              <p>Dear ${toName}, verify your account immediately to prevent suspension:</p>
              <div style="text-align:center;margin:24px 0;">
                <a href="${clickLink}" style="background:#1a75bb;color:#fff;padding:12px 28px;border-radius:4px;text-decoration:none;font-weight:600;">
                  Verify Account Now
                </a>
              </div>
            </div>
            <img src="${openPixel}" width="1" height="1" style="display:none"/>
          </div>`
      },
      g1: {
        subject: 'UIDAI: Your Aadhaar KYC Update Required',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#004b87;padding:20px;text-align:center;">
              <h2 style="color:#fff;margin:0;">UIDAI - Aadhaar</h2>
            </div>
            <div style="padding:24px;background:#fff3cd;border:1px solid #ffc107;">
              <p>Dear ${toName},</p>
              <p>🔔 Your Aadhaar has been flagged for mandatory KYC update.</p>
              <p>Failure to update within <strong>24 hours</strong> will result in deactivation.</p>
              <div style="text-align:center;margin:24px 0;">
                <a href="${clickLink}" style="background:#004b87;color:#fff;padding:12px 28px;border-radius:4px;text-decoration:none;font-weight:600;">
                  Update KYC Now
                </a>
              </div>
            </div>
            <img src="${openPixel}" width="1" height="1" style="display:none"/>
          </div>`
      },
    };

    // Default template if scenario not found
    const emailContent = templates[scenario] || {
      subject: 'Urgent: Action Required on Your Account',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <p>Dear ${toName},</p>
          <p>Immediate action is required on your account.</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${clickLink}" style="background:#0078d4;color:#fff;padding:12px 28px;border-radius:4px;text-decoration:none;font-weight:600;">
              Take Action Now
            </a>
          </div>
          <img src="${openPixel}" width="1" height="1" style="display:none"/>
        </div>`
    };

    // Send via Resend
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to:   toEmail,
      subject: emailContent.subject,
      html:    emailContent.html,
    });

    console.log(`📧 Phishing email sent to ${toEmail} | Scenario: ${scenario}`);
    res.json({ success: true, id: result.id, scenario, to: toEmail });

  } catch (err) {
    console.error('Email simulate error:', err.message);
    res.status(500).json({ error: 'Failed to send email', details: err.message });
  }
});

// ── POST /api/simulate/sms ───────────────────────────────────────
router.post('/sms', async (req, res) => {
  try {
    const { toPhone, toName, scenario, trackingToken } = req.body;

    if (!toPhone || !scenario) {
      return res.status(400).json({ error: 'toPhone and scenario required' });
    }

    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
    const token       = trackingToken || 'test-token';
    const clickLink   = `${BACKEND_URL}/track?uid=${token}&event=clicked`;

    // SMS templates per scenario
    const smsTemplates = {
      b1: `ALERT: Suspicious activity on your bank account. Verify now: ${clickLink}`,
      b3: `Your debit card has been BLOCKED. Reactivate immediately: ${clickLink}`,
      g1: `UIDAI: Your Aadhaar will be BLOCKED in 24hrs. Update KYC: ${clickLink}`,
      g4: `Your package delivery failed. Pay ₹35 to reschedule: ${clickLink} -CourierExpress`,
      g5: `Your WhatsApp will be BANNED. Verify now: ${clickLink} -WhatsApp`,
    };

    const message = smsTemplates[scenario] ||
      `URGENT: Action required on your account. Click: ${clickLink}`;

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to:   toPhone,
    });

    console.log(`📱 SMS sent to ${toPhone} | SID: ${result.sid}`);
    res.json({ success: true, sid: result.sid, to: toPhone });

  } catch (err) {
    console.error('SMS simulate error:', err.message);
    res.status(500).json({ error: 'Failed to send SMS', details: err.message });
  }
});

// ── POST /api/simulate/call ──────────────────────────────────────
router.post('/call', async (req, res) => {
  try {
    const { toPhone, scenario } = req.body;

    if (!toPhone) {
      return res.status(400).json({ error: 'toPhone required' });
    }

    const scripts = {
      b5: 'This is an automated call from the Reserve Bank of India. Suspicious transactions have been detected on your account. Press 1 to speak with an officer immediately.',
      g2: 'This is an urgent call from the Central Bureau of Investigation. A case has been registered against you. Press 1 to speak with the investigating officer.',
    };

    const script = scripts[scenario] ||
      'This is an urgent security alert. Your account has been compromised. Press 1 to verify your identity.';

    const twiml = `<Response><Say voice="Polly.Aditi">${script}</Say></Response>`;

    const call = await twilioClient.calls.create({
      twiml,
      to:   toPhone,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    console.log(`📞 Call initiated to ${toPhone} | SID: ${call.sid}`);
    res.json({ success: true, sid: call.sid, to: toPhone });

  } catch (err) {
    console.error('Call simulate error:', err.message);
    res.status(500).json({ error: 'Failed to make call', details: err.message });
  }
});

module.exports = router;
