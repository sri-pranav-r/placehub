const { Schema, model } = require('mongoose');
const { BRANCHES } = require('./constants');

const studentSchema = new Schema(
  {
    usn: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, match: /^\S+@\S+\.\S+$/ },
    phone: { type: String, trim: true },
    branch: { type: String, required: true, enum: BRANCHES },
    cgpa: { type: Number, required: true, min: 0, max: 10 },
    backlogs: { type: Number, default: 0, min: 0 },
    gradYear: { type: Number, min: 2000, max: 2100 },
    skills: { type: [String], default: [] },
    resumeText: { type: String, maxlength: 10000 },
    // Kept in sync automatically from applications (see Application model hooks)
    placed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Deleting a student removes their applications and login account too
studentSchema.post('findOneAndDelete', async (doc) => {
  if (!doc) return;
  await model('Application').deleteMany({ student: doc._id });
  await model('User').deleteMany({ student: doc._id });
});

module.exports = model('Student', studentSchema);
