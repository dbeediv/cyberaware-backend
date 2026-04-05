require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5500',
    'http://127.0.0.1:5500',
    /\.vercel\.app$/
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/campaigns', require('./routes/campaigns'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'CyberAware', time: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    name: 'CyberAware API',
    routes: [
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/users',
      'GET /api/users/me',
      'GET /api/campaigns',
      'POST /api/campaigns'
    ]
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ CyberAware backend running on http://localhost:${PORT}`);
});
