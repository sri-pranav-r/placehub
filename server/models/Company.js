const { Schema, model } = require('mongoose');

const companySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    sector: { type: String, trim: true },
    location: { type: String, trim: true },
    website: { type: String, trim: true },
    hrEmail: { type: String, lowercase: true, trim: true },
  },
  { timestamps: true }
);

// Deleting a company removes its drives and every application to those drives
companySchema.post('findOneAndDelete', async (doc) => {
  if (!doc) return;
  const Drive = model('Drive');
  const driveIds = await Drive.find({ company: doc._id }).distinct('_id');
  await model('Application').removeWhere({ drive: { $in: driveIds } });
  await Drive.deleteMany({ company: doc._id });
});

module.exports = model('Company', companySchema);
