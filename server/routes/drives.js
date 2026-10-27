const crudRouter = require('./crud');
const Drive = require('../models/Drive');

module.exports = crudRouter(Drive, {
  populate: { path: 'company', select: 'name sector location' },
  sort: { driveDate: 1 },
});
