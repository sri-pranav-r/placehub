const mongoose = require('mongoose');
const Student = require('../models/Student');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const HttpError = require('./HttpError');

// $lookup (JOIN): every open drive a student is eligible for, with company details.
async function eligibleDrivesFor(studentId) {
  if (!mongoose.isValidObjectId(studentId)) throw new HttpError(400, 'Invalid student id');
  const [result] = await Student.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(String(studentId)) } },
    {
      $lookup: {
        from: 'drives',
        let: { cgpa: '$cgpa', branch: '$branch', backlogs: '$backlogs' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $gte: ['$$cgpa', '$minCgpa'] },
                  { $lte: ['$$backlogs', '$maxBacklogs'] },
                  { $ne: ['$status', 'completed'] },
                  {
                    $or: [
                      { $eq: [{ $size: { $ifNull: ['$branches', []] } }, 0] },
                      { $in: ['$$branch', { $ifNull: ['$branches', []] }] },
                    ],
                  },
                ],
              },
            },
          },
          { $lookup: { from: 'companies', localField: 'company', foreignField: '_id', as: 'company' } },
          { $unwind: '$company' },
          { $sort: { driveDate: 1 } },
        ],
        as: 'eligibleDrives',
      },
    },
    { $lookup: { from: 'applications', localField: '_id', foreignField: 'student', as: 'applications' } },
    {
      $project: {
        usn: 1,
        name: 1,
        branch: 1,
        cgpa: 1,
        backlogs: 1,
        eligibleDrives: 1,
        appliedDriveIds: '$applications.drive',
      },
    },
  ]);
  if (!result) throw new HttpError(404, 'Student not found');
  return result;
}

// Creates an application after checking the drive's eligibility criteria
async function applyToDrive(studentId, driveId, { status, remarks } = {}) {
  const [student, drive] = await Promise.all([Student.findById(studentId), Drive.findById(driveId)]);
  if (!student || !drive) throw new HttpError(404, 'Student or drive not found');

  const reasons = drive.ineligibilityReasons(student);
  if (reasons.length) throw new HttpError(400, `Not eligible: ${reasons.join('; ')}`);

  return Application.create({ student: student._id, drive: drive._id, status, remarks });
}

module.exports = { eligibleDrivesFor, applyToDrive };
