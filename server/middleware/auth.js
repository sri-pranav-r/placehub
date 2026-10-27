const jwt = require('jsonwebtoken');

function signToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Reads "Authorization: Bearer <token>" and puts the payload on req.user
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please log in' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Session expired, please log in again' });
  }
}

const requireRole = (role) => (req, res, next) =>
  req.user?.role === role ? next() : res.status(403).json({ error: 'You do not have access to this' });

// Any logged-in user can read; only admins can create/update/delete
const adminForWrites = (req, res, next) => (req.method === 'GET' ? next() : requireRole('admin')(req, res, next));

module.exports = { signToken, requireAuth, requireRole, adminForWrites };
