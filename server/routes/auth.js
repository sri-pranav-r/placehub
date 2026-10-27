const express = require('express');
const User = require('../models/User');
const Student = require('../models/Student');
const { signToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role, student: user.student });

// Student self-registration. If the placement office already added this USN,
// the account is linked to that record (emails must match).
router.post('/register', async (req, res) => {
  const { name, email, password, usn, branch, cgpa, backlogs, gradYear, phone, acceptTerms } = req.body;
  if (acceptTerms !== true) {
    return res.status(400).json({ error: 'You need to accept the Terms and Privacy Policy to create an account' });
  }
  if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (!email) return res.status(400).json({ error: 'Email is required' });
  if (await User.exists({ email: email.toLowerCase().trim() })) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  let student = usn ? await Student.findOne({ usn: String(usn).toUpperCase().trim() }) : null;
  let created = false;
  if (student) {
    if (student.email !== email.toLowerCase().trim()) {
      return res.status(409).json({ error: 'This USN is registered with a different email. Contact the placement office.' });
    }
    if (await User.exists({ student: student._id })) {
      return res.status(409).json({ error: 'This USN already has an account' });
    }
  } else {
    student = await Student.create({ usn, name, email, phone, branch, cgpa, backlogs, gradYear });
    created = true;
  }

  const user = new User({ name: student.name, email, role: 'student', student: student._id, acceptedTermsAt: new Date() });
  await user.setPassword(password);
  try {
    await user.save();
  } catch (err) {
    if (created) await Student.deleteOne({ _id: student._id });
    throw err;
  }
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = email ? await User.findOne({ email: String(email).toLowerCase().trim() }).select('+passwordHash') : null;
  if (!user || !(await user.checkPassword(password || ''))) {
    return res.status(401).json({ error: 'Wrong email or password' });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) return res.status(401).json({ error: 'Account no longer exists' });
  res.json(publicUser(user));
});

module.exports = router;
