const express = require('express');
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const { eligibleDrivesFor } = require('../services/placement');

const router = express.Router();
const db = () => mongoose.connection.db;

// Quick counts for the dashboard cards
router.get('/overview', async (req, res) => {
  const [students, placed, companies, drives, applications, offers, topDrive, byStatus, upcoming] = await Promise.all([
    Student.countDocuments(),
    Student.countDocuments({ placed: true }),
    Company.countDocuments(),
    Drive.countDocuments(),
    Application.countDocuments(),
    Application.countDocuments({ status: 'offered' }),
    Drive.findOne({ packageLPA: { $ne: null } }).sort({ packageLPA: -1 }).populate('company', 'name'),
    Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Drive.find({ status: { $ne: 'completed' } }).sort({ driveDate: 1 }).limit(5).populate('company', 'name'),
  ]);
  res.json({
    students,
    placed,
    companies,
    drives,
    applications,
    offers,
    highestPackage: topDrive ? { lpa: topDrive.packageLPA, company: topDrive.company?.name } : null,
    statusCounts: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    upcomingDrives: upcoming,
  });
});

// $lookup (JOIN): every open drive a student is eligible for, with company details.
// GET /api/reports/eligible/:studentId
router.get('/eligible/:studentId', async (req, res) => {
  res.json(await eligibleDrivesFor(req.params.studentId));
});

// $merge: company-wise placement stats -> "placementstats" collection.
// Joins applications -> drives -> companies, groups per company and upserts the result.
router.post('/company-stats/refresh', async (req, res) => {
  const runId = new mongoose.Types.ObjectId().toString();
  await Application.aggregate([
    { $lookup: { from: 'drives', localField: 'drive', foreignField: '_id', as: 'drive' } },
    { $unwind: '$drive' },
    {
      $group: {
        _id: '$drive.company',
        totalApplications: { $sum: 1 },
        offers: { $sum: { $cond: [{ $eq: ['$status', 'offered'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        offeredPackages: { $push: { $cond: [{ $eq: ['$status', 'offered'] }, '$drive.packageLPA', null] } },
        drives: { $addToSet: '$drive._id' },
      },
    },
    { $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'company' } },
    { $unwind: '$company' },
    {
      $project: {
        companyName: '$company.name',
        sector: '$company.sector',
        totalApplications: 1,
        offers: 1,
        rejected: 1,
        driveCount: { $size: '$drives' },
        avgPackageLPA: { $round: [{ $avg: '$offeredPackages' }, 2] },
        maxPackageLPA: { $max: '$offeredPackages' },
        conversionRate: {
          $round: [{ $multiply: [{ $divide: ['$offers', '$totalApplications'] }, 100] }, 1],
        },
        refreshedAt: '$$NOW',
        runId: { $literal: runId },
      },
    },
    { $merge: { into: 'placementstats', on: '_id', whenMatched: 'replace', whenNotMatched: 'insert' } },
  ]);
  // Companies that no longer have applications weren't touched by this run - drop them
  await db().collection('placementstats').deleteMany({ runId: { $ne: runId } });
  res.json(await db().collection('placementstats').find().sort({ offers: -1, companyName: 1 }).toArray());
});

router.get('/company-stats', async (req, res) => {
  res.json(await db().collection('placementstats').find().sort({ offers: -1, companyName: 1 }).toArray());
});

// $merge: branch-wise summary -> "branchstats" collection.
router.post('/branch-stats/refresh', async (req, res) => {
  const runId = new mongoose.Types.ObjectId().toString();
  await Student.aggregate([
    {
      $group: {
        _id: '$branch',
        totalStudents: { $sum: 1 },
        placed: { $sum: { $cond: ['$placed', 1, 0] } },
        avgCgpa: { $avg: '$cgpa' },
      },
    },
    {
      $project: {
        branch: '$_id',
        totalStudents: 1,
        placed: 1,
        avgCgpa: { $round: ['$avgCgpa', 2] },
        placementPct: { $round: [{ $multiply: [{ $divide: ['$placed', '$totalStudents'] }, 100] }, 1] },
        refreshedAt: '$$NOW',
        runId: { $literal: runId },
      },
    },
    { $merge: { into: 'branchstats', on: '_id', whenMatched: 'replace', whenNotMatched: 'insert' } },
  ]);
  await db().collection('branchstats').deleteMany({ runId: { $ne: runId } });
  res.json(await db().collection('branchstats').find().sort({ placementPct: -1 }).toArray());
});

router.get('/branch-stats', async (req, res) => {
  res.json(await db().collection('branchstats').find().sort({ placementPct: -1 }).toArray());
});

// Possible duplicate students = same email registered under different USNs.
// Feed these into POST /api/students/merge.
router.get('/duplicates', async (req, res) => {
  res.json(
    await Student.aggregate([
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: '$email',
          count: { $sum: 1 },
          students: { $push: { _id: '$_id', usn: '$usn', name: '$name', createdAt: '$createdAt' } },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ])
  );
});

module.exports = router;
