const express = require('express');

// Builds the standard 5 CRUD endpoints for a Mongoose model:
//   GET /        list (query params matching schema fields act as filters)
//   GET /:id     read one
//   POST /       create
//   PUT /:id     update
//   DELETE /:id  delete
// `extend(router)` runs first, so custom routes there take priority.
module.exports = function crudRouter(Model, { populate = '', sort = { createdAt: -1 }, extend } = {}) {
  const router = express.Router();
  const name = Model.modelName;

  if (extend) extend(router);

  router.get('/', async (req, res) => {
    const filter = Object.fromEntries(
      Object.entries(req.query).filter(([key, value]) => Model.schema.path(key) && value !== '')
    );
    res.json(await Model.find(filter).populate(populate).sort(sort));
  });

  router.get('/:id', async (req, res) => {
    const doc = await Model.findById(req.params.id).populate(populate);
    if (!doc) return res.status(404).json({ error: `${name} not found` });
    res.json(doc);
  });

  router.post('/', async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json(doc);
  });

  router.put('/:id', async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: `${name} not found` });
    res.json(doc);
  });

  router.delete('/:id', async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: `${name} not found` });
    res.json({ deleted: true, id: doc._id });
  });

  return router;
};
