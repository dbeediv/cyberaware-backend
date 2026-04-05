-- ═══════════════════════════════════════════════════════
-- CyberAware — Run this ONCE in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- TABLE 1: Users
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'user',
  domain     TEXT NOT NULL DEFAULT 'corporate',
  dept       TEXT DEFAULT '',
  avatar     TEXT DEFAULT '',
  score      INT  DEFAULT 75,
  trend      INT  DEFAULT 0,
  campaigns  INT  DEFAULT 0,
  failed     INT  DEFAULT 0,
  trained    INT  DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 2: Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  domain      TEXT NOT NULL,
  scenario    TEXT NOT NULL,
  channel     TEXT NOT NULL DEFAULT 'Email',
  difficulty  TEXT NOT NULL DEFAULT 'medium',
  status      TEXT NOT NULL DEFAULT 'scheduled',
  sent        INT  DEFAULT 0,
  clicked     INT  DEFAULT 0,
  submitted   INT  DEFAULT 0,
  reported    INT  DEFAULT 0,
  progress    INT  DEFAULT 0,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  launched_at TIMESTAMPTZ
);

-- TABLE 3: Campaign Users (one row per user per campaign)
CREATE TABLE IF NOT EXISTS campaign_users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES users(id)     ON DELETE CASCADE,
  token        TEXT UNIQUE NOT NULL,
  status       TEXT DEFAULT 'sent',
  opened_at    TIMESTAMPTZ,
  clicked_at   TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  reported_at  TIMESTAMPTZ,
  trained_at   TIMESTAMPTZ,
  UNIQUE(campaign_id, user_id)
);

-- TABLE 4: Events (detailed tracking log)
CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token       TEXT NOT NULL,
  campaign_id UUID REFERENCES campaigns(id),
  user_id     UUID REFERENCES users(id),
  event_type  TEXT NOT NULL,
  ip_address  TEXT,
  user_agent  TEXT,
  metadata    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Seed demo users (all passwords = "demo123") ──────────────────
-- Hash is bcrypt of "demo123" with 10 rounds
INSERT INTO users (name, email, password, role, domain, dept, avatar, score, trend)
VALUES
  ('Admin User',    'admin@cyberaware.in',   '$2a$10$XcmE.gHa9ixPSn2J.4oV0OqNHgE6x3mKlbPFN3lzO2YJoqNw3YHKe', 'admin',   'corporate', 'Security Team',  'AD', 85,  5),
  ('Trainer Kumar', 'trainer@cyberaware.in', '$2a$10$XcmE.gHa9ixPSn2J.4oV0OqNHgE6x3mKlbPFN3lzO2YJoqNw3YHKe', 'trainer', 'corporate', 'L&D Team',       'TK', 80,  8),
  ('Priya Sharma',  'priya@corp.in',         '$2a$10$XcmE.gHa9ixPSn2J.4oV0OqNHgE6x3mKlbPFN3lzO2YJoqNw3YHKe', 'user',    'corporate', 'Finance',        'PS', 42, -12),
  ('Rahul Verma',   'rahul@corp.in',         '$2a$10$XcmE.gHa9ixPSn2J.4oV0OqNHgE6x3mKlbPFN3lzO2YJoqNw3YHKe', 'user',    'corporate', 'Engineering',    'RV', 78,  18),
  ('Anita Singh',   'anita@corp.in',         '$2a$10$XcmE.gHa9ixPSn2J.4oV0OqNHgE6x3mKlbPFN3lzO2YJoqNw3YHKe', 'user',    'corporate', 'HR',             'AS', 31,  -8),
  ('Vikram Nair',   'vikram@bank.in',        '$2a$10$XcmE.gHa9ixPSn2J.4oV0OqNHgE6x3mKlbPFN3lzO2YJoqNw3YHKe', 'user',    'banks',     'Operations',     'VN', 65,   5),
  ('Sneha Iyer',    'sneha@bank.in',         '$2a$10$XcmE.gHa9ixPSn2J.4oV0OqNHgE6x3mKlbPFN3lzO2YJoqNw3YHKe', 'user',    'banks',     'Customer Care',  'SI', 29, -15),
  ('Arjun Gupta',   'arjun@edu.in',          '$2a$10$XcmE.gHa9ixPSn2J.4oV0OqNHgE6x3mKlbPFN3lzO2YJoqNw3YHKe', 'user',    'general',   'Student',        'AG', 55,  10)
ON CONFLICT (email) DO NOTHING;
