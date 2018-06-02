const { Source } = require('./../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: req.query.fl
      ? req.query.fl.split(',')
      : ['id', 'name', 'type', 'logo', 'slug'],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };

  return Source
    .findAll(options)
    .then(sources => res.json(sources))
    .catch(next);
};

exports.show = (req, res, next) => {
  const { id } = req.params;
  const options = {
    attributes: req.query.fl
      ? req.query.fl.split(',')
      : ['id', 'name', 'type', 'logo', 'slug'],
  };

  return Source
    .findById(id, options)
    .then(sources => res.json(sources))
    .catch(next);
};
