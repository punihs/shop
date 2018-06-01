const { Place } = require('./../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: req.query.fl
      ? req.query.fl.split(',')
      : ['id', 'name', 'slug', 'type'],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };

  return Place
    .findAll(options)
    .then(city => res.json({ city }))
    .catch(next);
};

exports.show = (req, res, next) => {
  const { id } = req.params;
  const options = {
    attributes: req.query.fl
      ? req.query.fl.split(',')
      : ['id', 'name', 'slug', 'type'],
  };

  return Place
    .findById(id, options)
    .then(place => res.json(place))
    .catch(next);
};
