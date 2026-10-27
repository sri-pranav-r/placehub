require('dotenv').config({ override: true }); // values in .env win over inherited env vars
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const connectDB = require('./config/db');
const { requireAuth, requireRole, adminForWrites } = require('./middleware/auth');

// No JWT_SECRET in .env: generate one once and keep it in server/.data (git-ignored),
// so logins survive restarts without any setup step
if (!process.env.JWT_SECRET) {
  const secretFile = path.join(__dirname, '.data', 'jwt-secret');
  if (!fs.existsSync(secretFile)) {
    fs.mkdirSync(path.dirname(secretFile), { recursive: true });
    fs.writeFileSync(secretFile, crypto.randomBytes(32).toString('hex'));
  }
  process.env.JWT_SECRET = fs.readFileSync(secretFile, 'utf8').trim();
  console.log('JWT_SECRET not set in .env - using the generated secret in server/.data/jwt-secret');
}

const app = express();
app.use(express.json({ limit: '1mb' }));

const admin = [requireAuth, requireRole('admin')];

// Public
app.use('/api', require('./routes/public'));
app.use('/api/auth', require('./routes/auth'));

// Student portal
app.use('/api/me', requireAuth, requireRole('student'), require('./routes/me'));

// Admin (placement office). Companies and drives are readable by any logged-in user.
app.use('/api/students', admin, require('./routes/students'));
app.use('/api/companies', requireAuth, adminForWrites, require('./routes/companies'));
app.use('/api/drives', requireAuth, adminForWrites, require('./routes/drives'));
app.use('/api/applications', admin, require('./routes/applications'));
app.use('/api/reports', admin, require('./routes/reports'));
app.use('/api/external', requireAuth, require('./routes/external'));

app.use('/api', (req, res) => res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` }));

// In production, Express also serves the built React app (client/dist)
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => (req.method === 'GET' ? res.sendFile(path.join(clientDist, 'index.html')) : next()));
}

// Express 5 forwards errors from async handlers here automatically
app.use((err, req, res, next) => {
  if (err.status) return res.status(err.status).json({ error: err.message });
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: Object.values(err.errors).map((e) => e.message).join('; ') });
  }
  if (err.name === 'CastError') return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });
  if (err.code === 11000) {
    return res.status(409).json({ error: `Duplicate value for ${Object.keys(err.keyValue).join(', ')}` });
  }
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(async ({ builtIn }) => {
    // Load sample data the first time the built-in database starts (it is empty then).
    // exists() reads real documents; estimatedDocumentCount() can report 0 after a killed restart.
    if (builtIn && !(await require('./models/User').exists({}))) {
      await require('./seed').seed();
    }
    app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  });
