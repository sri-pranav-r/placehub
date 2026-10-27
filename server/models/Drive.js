const { Schema, model } = require('mongoose');
const { BRANCHES, DRIVE_STATUSES } = require('./constants');

const driveSchema = new Schema(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    role: { type: String, required: true, trim: true },
    packageLPA: { type: Number, min: 0 },
    driveDate: { type: Date },
    // Eligibility criteria
    minCgpa: { type: Number, default: 0, min: 0, max: 10 },
    maxBacklogs: { type: Number, default: 0, min: 0 },
    branches: { type: [{ type: String, enum: BRANCHES }], default: [] }, // empty = all branches
    status: { type: String, enum: DRIVE_STATUSES, default: 'upcoming' },
    source: { type: String, enum: ['manual', 'jsearch'], default: 'manual' },
    applyLink: { type: String, trim: true },
  },
  { timestamps: true }
);

// Returns a list of reasons the student can't apply (empty list = eligible)
driveSchema.methods.ineligibilityReasons = function (student) {
  const reasons = [];
  if (student.cgpa < this.minCgpa) reasons.push(`CGPA ${student.cgpa} is below ${this.minCgpa}`);
  if (student.backlogs > this.maxBacklogs) reasons.push(`${student.backlogs} backlogs (max ${this.maxBacklogs})`);
  if (this.branches.length && !this.branches.includes(student.branch)) {
    reasons.push(`${student.branch} not in ${this.branches.join('/')}`);
  }
  if (this.status === 'completed') reasons.push('drive is already completed');
  return reasons;
};

driveSchema.post('findOneAndDelete', async (doc) => {
  if (doc) await model('Application').removeWhere({ drive: doc._id });
});

module.exports = model('Drive', driveSchema);
