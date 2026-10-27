const crudRouter = require('./crud');
const Student = require('../models/Student');
const Application = require('../models/Application');
const User = require('../models/User');
const { STATUS_RANK } = require('../models/constants');

module.exports = crudRouter(Student, {
  sort: { usn: 1 },
  extend(router) {
    // MERGE two duplicate student records into one.
    // POST /api/students/merge  { keepId, removeId }
    //  - blank fields on the kept record are filled from the duplicate
    //  - skills are combined (union)
    //  - the duplicate's applications move to the kept record; if both applied
    //    to the same drive, the more advanced status wins
    //  - the duplicate is deleted
    router.post('/merge', async (req, res) => {
      const { keepId, removeId } = req.body;
      if (!keepId || !removeId || keepId === removeId) {
        return res.status(400).json({ error: 'Pick two different students (keepId and removeId)' });
      }
      const [keep, dup] = await Promise.all([Student.findById(keepId), Student.findById(removeId)]);
      if (!keep || !dup) return res.status(404).json({ error: 'Student not found' });

      for (const field of ['phone', 'gradYear', 'resumeText']) {
        if (!keep[field] && dup[field]) keep[field] = dup[field];
      }
      keep.skills = [...new Set([...keep.skills, ...dup.skills].map((s) => s.trim()).filter(Boolean))];

      const keepApps = new Map(
        (await Application.find({ student: keep._id })).map((app) => [String(app.drive), app])
      );
      let moved = 0;
      let combined = 0;
      for (const app of await Application.find({ student: dup._id })) {
        const existing = keepApps.get(String(app.drive));
        if (existing) {
          if (STATUS_RANK[app.status] > STATUS_RANK[existing.status]) {
            existing.status = app.status;
            await existing.save();
          }
          await app.deleteOne();
          combined++;
        } else {
          app.student = keep._id;
          await app.save();
          moved++;
        }
      }

      // Login accounts: the duplicate's account moves over if the kept record has none
      const dupUser = await User.findOne({ student: dup._id });
      if (dupUser) {
        if (await User.exists({ student: keep._id })) await dupUser.deleteOne();
        else {
          dupUser.student = keep._id;
          await dupUser.save();
        }
      }

      keep.placed = Boolean(await Application.exists({ student: keep._id, status: 'offered' }));
      await keep.save();
      await Student.deleteOne({ _id: dup._id });

      res.json({
        message: `Merged ${dup.usn} into ${keep.usn}`,
        applicationsMoved: moved,
        applicationsCombined: combined,
        student: keep,
      });
    });
  },
});
