# CyberAware Backend

## Quick Start (Member 1)

```bash
npm install
# .env is already filled with the Supabase URL
npm run dev
# → http://localhost:3000
```

## Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cyberaware.in","password":"demo123"}'
```

## File Ownership
| File | Owner |
|------|-------|
| server.js, db/, middleware/, routes/auth.js, routes/users.js, routes/campaigns.js | **Member 1** |
| routes/track.js | **Member 2** |
| routes/simulate.js | **Member 3** |
| routes/aiphish.js | **Member 4** |

## API Endpoints
| Method | Route | Auth |
|--------|-------|------|
| POST | /api/auth/login | None |
| POST | /api/auth/register | None |
| GET | /api/users | Admin/Trainer |
| GET | /api/users/me | Any |
| GET | /api/users/:id | Admin/Trainer |
| GET | /api/campaigns | Any |
| GET | /api/campaigns/:id | Any |
| POST | /api/campaigns | Admin/Trainer |
| GET | /track | None |
| POST | /track | None |
| POST | /api/simulate/email | Admin/Trainer |
| POST | /api/simulate/sms | Admin/Trainer |
| POST | /api/simulate/ai-phish | Admin/Trainer |

## Shared .env values for all teammates
```
DATABASE_URL=postgresql://postgres:SuperDivya.5@db.iyxeazbyxbgpvowluhms.supabase.co:6543/postgres
JWT_SECRET=cyberaware2025supersecret
```

## GitHub Workflow
- Member 1 → main branch
- Member 2 → tracking branch
- Member 3 → attacks branch  
- Member 4 → frontend branch
- At end → all merge into main → Member 1 deploys to Render
