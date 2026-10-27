const crudRouter = require('./crud');
const Company = require('../models/Company');

module.exports = crudRouter(Company, { sort: { name: 1 } });
