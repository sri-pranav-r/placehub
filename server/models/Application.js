const { Schema, model } = require('mongoose');
const { APPLICATION_STATUSES } = require('./constants');

const applicationSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    drive: { type: Schema.Types.ObjectId, ref: 'Drive', required: true },
    status: { type: String, enum: APPLICATION_STATUSES, default: 'applied' },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

// A student can apply to a drive only once
applicationSchema.index({ student: 1, drive: 1 }, { unique: true });

// student.placed = "has at least one offer"
async function syncPlaced(studentId) {
  const hasOffer = await model('Application').exists({ student: studentId, status: 'offered' });
  await model('Student').updateOne({ _id: studentId }, { placed: Boolean(hasOffer) });
}

applicationSchema.post('save', (doc) => syncPlaced(doc.student));
applicationSchema.post('findOneAndUpdate', (doc) => doc && syncPlaced(doc.student));
applicationSchema.post('findOneAndDelete', (doc) => doc && syncPlaced(doc.student));
applicationSchema.post('deleteOne', { document: true, query: false }, (doc) => syncPlaced(doc.student));

// Bulk delete that still keeps student.placed correct
applicationSchema.statics.removeWhere = async function (filter) {
  const studentIds = await this.find(filter).distinct('student');
  await this.deleteMany(filter);
  await Promise.all(studentIds.map(syncPlaced));
};

applicationSchema.statics.syncPlaced = syncPlaced;

module.exports = model('Application', applicationSchema);
