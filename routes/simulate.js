const express = require('express');
const router = express.Router();
const { Resend } = require('resend');
const twilio = require('twilio');

const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

// ─────────────────────────────────────────
// EMAIL SCENARIOS
// ─────────────────────────────────────────

const emailScenarios = {

  'm365': (name, uid, cid) => ({
    subject: 'Action Required: Your Microsoft 365 Session Has Expired',
    html: `
      <img src="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=opened" width="1" height="1"/>
      <div style="font-family:Arial;max-width:600px;margin:auto">
        <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" width="120"/>
        <h2>Your session has expired</h2>
        <p>Dear ${name},</p>
        <p>We detected unusual activity on your Microsoft 365 account. 
        Your session has been locked for security reasons.</p>
        <a href="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=clicked"
           style="background:#0078d4;color:white;padding:12px 24px;
                  text-decoration:none;border-radius:4px;display:inline-block">
          Verify Account Now
        </a>
      </div>`
  }),

  'ceo-payment': (name, uid, cid) => ({
    subject: 'Urgent — Vendor Payment Approval Needed',
    html: `
      <img src="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=opened" width="1" height="1"/>
      <div style="font-family:Arial;max-width:600px;margin:auto">
        <p>Hi ${name},</p>
        <p>I need you to process an urgent vendor payment of ₹4,50,000 before EOD.</p>
        <a href="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=clicked"
           style="background:#d32f2f;color:white;padding:12px 24px;
                  text-decoration:none;border-radius:4px;display:inline-block">
          View Invoice & Approve
        </a>
        <p>Thanks,<br/>Rajesh Kumar<br/>CEO</p>
      </div>`
  }),

  'it-reset': (name, uid, cid) => ({
    subject: 'IT Alert: Your Password Expires in 2 Hours',
    html: `
      <img src="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=opened" width="1" height="1"/>
      <div style="font-family:Arial;max-width:600px;margin:auto">
        <h2 style="color:#d32f2f">⚠️ Password Expiry Warning</h2>
        <p>Dear ${name}, your password expires in 2 hours.</p>
        <a href="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=clicked"
           style="background:#1976d2;color:white;padding:12px 24px;
                  text-decoration:none;border-radius:4px;display:inline-block">
          Reset Password Now
        </a>
      </div>`
  }),

  'hr-bonus': (name, uid, cid) => ({
    subject: 'Confidential: Your Salary Revision Letter — Q1 2025',
    html: `
      <img src="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=opened" width="1" height="1"/>
      <div style="font-family:Arial;max-width:600px;margin:auto">
        <h2>🎉 Salary Revision Notice</h2>
        <p>Dear ${name}, your salary revision for Q1 2025 has been approved.</p>
        <a href="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=clicked"
           style="background:#388e3c;color:white;padding:12px 24px;
                  text-decoration:none;border-radius:4px;display:inline-block">
          View My Salary Revision
        </a>
      </div>`
  }),

  'kyc-block': (name, uid, cid) => ({
    subject: 'URGENT: Your Bank Account Will Be Blocked in 24 Hours',
    html: `
      <img src="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=opened" width="1" height="1"/>
      <div style="font-family:Arial;max-width:600px;margin:auto">
        <h2 style="color:#d32f2f">🚨 Account Blocking Notice</h2>
        <p>Dear ${name}, your KYC is incomplete. Account blocks in 24 hours.</p>
        <a href="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=clicked"
           style="background:#d32f2f;color:white;padding:12px 24px;
                  text-decoration:none;border-radius:4px;display:inline-block">
          Update KYC Now
        </a>
      </div>`
  }),

  'card-blocked': (name, uid, cid) => ({
    subject: 'Alert: Your Debit Card Has Been Temporarily Blocked',
    html: `
      <img src="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=opened" width="1" height="1"/>
      <div style="font-family:Arial;max-width:600px;margin:auto">
        <h2 style="color:#d32f2f">Card Blocked Alert</h2>
        <p>Dear ${name}, your debit card has been blocked due to suspicious activity.</p>
        <a href="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=clicked"
           style="background:#1565c0;color:white;padding:12px 24px;
                  text-decoration:none;border-radius:4px;display:inline-block">
          Unblock My Card
        </a>
      </div>`
  }),

  'money-mistake': (name, uid, cid) => ({
    subject: 'Important: ₹50,000 Credited to Your Account by Mistake',
    html: `
      <img src="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=opened" width="1" height="1"/>
      <div style="font-family:Arial;max-width:600px;margin:auto">
        <h2>Transaction Alert</h2>
        <p>Dear ${name}, ₹50,000 was credited to your account by mistake. 
        Return within 48 hours to avoid legal action.</p>
        <a href="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=clicked"
           style="background:#f57c00;color:white;padding:12px 24px;
                  text-decoration:none;border-radius:4px;display:inline-block">
          Return Amount
        </a>
      </div>`
  }),

  'aadhaar-kyc': (name, uid, cid) => ({
    subject: 'URGENT: Your Aadhaar Linked Mobile Will Be Deactivated',
    html: `
      <img src="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=opened" width="1" height="1"/>
      <div style="font-family:Arial;max-width:600px;margin:auto">
        <h2 style="color:#d32f2f">UIDAI Notice</h2>
        <p>Dear ${name}, your Aadhaar KYC is pending. Mobile deactivates in 24 hours.</p>
        <a href="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=clicked"
           style="background:#1a237e;color:white;padding:12px 24px;
                  text-decoration:none;border-radius:4px;display:inline-block">
          Update Aadhaar KYC Now
        </a>
      </div>`
  }),

  'exam-result': (name, uid, cid) => ({
    subject: 'Your Exam Result Has Been Published — View Now',
    html: `
      <img src="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=opened" width="1" height="1"/>
      <div style="font-family:Arial;max-width:600px;margin:auto">
        <h2>📋 Exam Result Notification</h2>
        <p>Dear ${name}, your result has been published. Login to view marks.</p>
        <a href="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=clicked"
           style="background:#1b5e20;color:white;padding:12px 24px;
                  text-decoration:none;border-radius:4px;display:inline-block">
          View My Result
        </a>
      </div>`
  }),

  'courier': (name, uid, cid) => ({
    subject: 'Delivery Failed: Action Required for Your Package',
    html: `
      <img src="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=opened" width="1" height="1"/>
      <div style="font-family:Arial;max-width:600px;margin:auto">
        <h2>📦 Delivery Attempt Failed</h2>
        <p>Dear ${name}, pay customs fee ₹25 to reschedule your delivery.</p>
        <a href="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=clicked"
           style="background:#e65100;color:white;padding:12px 24px;
                  text-decoration:none;border-radius:4px;display:inline-block">
          Pay ₹25 & Reschedule
        </a>
      </div>`
  }),

  'whatsapp-ban': (name, uid, cid) => ({
    subject: 'Your WhatsApp Account Will Be Banned in 12 Hours',
    html: `
      <img src="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=opened" width="1" height="1"/>
      <div style="font-family:Arial;max-width:600px;margin:auto">
        <h2 style="color:#25D366">WhatsApp Security Alert</h2>
        <p>Dear ${name}, your account is flagged. Banned in 12 hours unless verified.</p>
        <a href="${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=clicked"
           style="background:#25D366;color:white;padding:12px 24px;
                  text-decoration:none;border-radius:4px;display:inline-block">
          Verify My Account
        </a>
      </div>`
  })
};

// ─────────────────────────────────────────
// SMS SCENARIOS
// ─────────────────────────────────────────

const smsScenarios = {
  'otp-harvest': (uid, cid) =>
    `SBI ALERT: Your account OTP is expiring. Verify now: ${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=clicked`,
  'card-blocked-sms': (uid, cid) =>
    `ALERT: Your SBI Debit Card is BLOCKED. Unblock: ${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=clicked`,
  'aadhaar-sms': (uid, cid) =>
    `UIDAI: Aadhaar KYC pending. Mobile deactivates in 24hrs: ${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=clicked`,
  'courier-sms': (uid, cid) =>
    `FedEx: Delivery failed. Pay ₹25 customs: ${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=clicked`,
  'whatsapp-sms': (uid, cid) =>
    `WhatsApp: Account flagged for ban. Verify: ${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=clicked`,
  'slack-otp': (uid, cid) =>
    `Slack: OTP requested for your account. Confirm: ${SERVER_URL}/track?uid=${uid}&cid=${cid}&event=clicked`
};

// ─────────────────────────────────────────
// VOICE SCENARIOS
// ─────────────────────────────────────────

const voiceScenarios = {
  'rbi-call': () => `
    <Response>
      <Say voice="alice" language="en-IN">
        This is an automated call from Reserve Bank of India Compliance Department.
        Suspicious transactions detected on your account.
        Your account will be frozen in 2 hours.
        Press 1 to speak to our officer immediately.
      </Say>
    </Response>`,
  'cbi-call': () => `
    <Response>
      <Say voice="alice" language="en-IN">
        This is Central Bureau of Investigation Cyber Crime Division.
        A case has been registered against your Aadhaar number.
        Press 1 to speak to the investigating officer.
      </Say>
    </Response>`
};

// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────

// Send phishing email
router.post('/email', async (req, res) => {
  const { userId, campaignId, scenario, targetEmail, targetName } = req.body;
  const scenarioFn = emailScenarios[scenario];
  if (!scenarioFn) return res.status(400).json({ error: 'Unknown scenario' });
  const { subject, html } = scenarioFn(targetName, userId, campaignId);
  try {
    await resend.emails.send({
      from: 'CyberAware <onboarding@resend.dev>',
      to: targetEmail,
      subject,
      html
    });
    res.json({ success: true, message: `Email sent to ${targetEmail}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send phishing SMS
router.post('/sms', async (req, res) => {
  const { userId, campaignId, scenario, targetPhone } = req.body;
  const scenarioFn = smsScenarios[scenario];
  if (!scenarioFn) return res.status(400).json({ error: 'Unknown scenario' });
  const body = scenarioFn(userId, campaignId);
  try {
    await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE,
      to: targetPhone
    });
    res.json({ success: true, message: `SMS sent to ${targetPhone}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger voice call
router.post('/call', async (req, res) => {
  const { scenario, targetPhone } = req.body;
  const scenarioFn = voiceScenarios[scenario];
  if (!scenarioFn) return res.status(400).json({ error: 'Unknown scenario' });
  try {
    await twilioClient.calls.create({
      twiml: scenarioFn(),
      from: process.env.TWILIO_PHONE,
      to: targetPhone
    });
    res.json({ success: true, message: `Call initiated to ${targetPhone}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;