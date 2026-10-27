const crudRouter = require('./crud');
const Application = require('../models/Application');
const { applyToDrive } = require('../services/placement');

module.exports = crudRouter(Application, {
  populate: [
    { path: 'student', select: 'usn name branch cgpa' },
    { path: 'drive', select: 'role packageLPA driveDate', populate: { path: 'company', select: 'name' } },
  ],
  extend(router) {
    // Create = apply. Checks the drive's eligibility criteria first.
    router.post('/', async (req, res) => {
      const { student, drive, status, remarks } = req.body;
      res.status(201).json(await applyToDrive(student, drive, { status, remarks }));
    });
  },
});
