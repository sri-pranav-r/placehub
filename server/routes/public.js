const express = require('express');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const { BRANCHES, APPLICATION_STATUSES, DRIVE_STATUSES } = require('../models/constants');

// Endpoints that don't need a login (landing page + registration form)
const router = express.Router();

router.get('/meta', (req, res) =>
  res.json({ branches: BRANCHES, applicationStatuses: APPLICATION_STATUSES, driveStatuses: DRIVE_STATUSES })
);

// Aggregate numbers only - no personal data
router.get('/public/stats', async (req, res) => {
  const [students, placed, offers, topDrive, recruiters, upcomingDrives] = await Promise.all([
    Student.countDocuments(),
    Student.countDocuments({ placed: true }),
    Application.countDocuments({ status: 'offered' }),
    Drive.findOne({ packageLPA: { $ne: null } }).sort({ packageLPA: -1 }),
    Company.find().sort({ name: 1 }).limit(12).select('name sector'),
    Drive.find({ status: { $ne: 'completed' } })
      .sort({ driveDate: 1 })
      .limit(5)
      .select('role packageLPA driveDate status company')
      .populate('company', 'name'),
  ]);
  res.json({
    students,
    placementPct: students ? Math.round((placed / students) * 100) : 0,
    offers,
    highestPackage: topDrive?.packageLPA ?? null,
    recruiters,
    upcomingDrives,
  });
});

module.exports = router;
