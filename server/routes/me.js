const express = require('express');
const User = require('../models/User');
const Student = require('../models/Student');
const Application = require('../models/Application');
const { eligibleDrivesFor, applyToDrive } = require('../services/placement');
const { reviewResume } = require('../services/gemini');

// Student portal: everything here acts on the logged-in student's own record.
const router = express.Router();

router.use(async (req, res, next) => {
  const user = await User.findById(req.user.sub);
  if (!user?.student) return res.status(404).json({ error: 'No student profile linked to this account' });
  req.studentId = user.student;
  next();
});

router.get('/', async (req, res) => {
  res.json(await Student.findById(req.studentId));
});

// Students can edit contact details, skills and resume. CGPA, backlogs and branch
// are verified data, so only the placement office (admin) can change them.
router.put('/', async (req, res) => {
  const { phone, skills, resumeText } = req.body;
  const student = await Student.findByIdAndUpdate(
    req.studentId,
    { phone, skills, resumeText },
    { new: true, runValidators: true } // undefined fields are skipped, not cleared
  );
  res.json(student);
});

router.get('/eligible', async (req, res) => {
  res.json(await eligibleDrivesFor(req.studentId));
});

router.get('/applications', async (req, res) => {
  res.json(
    await Application.find({ student: req.studentId })
      .populate({ path: 'drive', populate: { path: 'company', select: 'name location website' } })
      .sort({ createdAt: -1 })
  );
});

router.post('/applications', async (req, res) => {
  res.status(201).json(await applyToDrive(req.studentId, req.body.drive));
});

// Withdraw: only while the application is still at "applied"
router.delete('/applications/:id', async (req, res) => {
  const app = await Application.findOne({ _id: req.params.id, student: req.studentId });
  if (!app) return res.status(404).json({ error: 'Application not found' });
  if (app.status !== 'applied') {
    return res.status(400).json({ error: `Can't withdraw once the status is "${app.status}"` });
  }
  await app.deleteOne();
  res.json({ deleted: true, id: app._id });
});

router.post('/resume-review', async (req, res) => {
  const student = await Student.findById(req.studentId);
  res.json(await reviewResume(student, req.body?.driveId));
});

module.exports = router;
