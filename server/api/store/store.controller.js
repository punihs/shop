const { Store } = require('./../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: req.query.fl
      ? req.query.fl.split(',')
      : ['id', 'name', 'type', 'logo', 'slug'],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };

  return Store
    .findAll(options)
    .then(store => res.json({ store }))
    .catch(next);
};

exports.show = (req, res, next) => {
  const { id } = req.params;
  const options = {
    attributes: req.query.fl
      ? req.query.fl.split(',')
      : ['id', 'name', 'type', 'logo', 'slug'],
  };

  return Store
    .findById(id, options)
    .then(store => res.json(store))
    .catch(next);
};
