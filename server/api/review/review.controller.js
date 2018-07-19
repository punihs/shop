const { Review, Country } = require('./../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'name', 'source_id', 'description', 'rating', 'approved_by', 'is_approved', 'created_at'],
    include: [{
      model: Country,
      attributes: ['name', 'flag'],
    }],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };

  return Review
    .findAll(options)
    .then(review => res.json(review))
    .catch(next);
};

exports.show = (req, res, next) => {
  const { id } = req.params;
  const options = {
    attributes: [
      'id', 'name', 'source_id', 'description', 'rating',
      'approved_by', 'is_approved', 'created_at',
    ],
    include: [{
      model: Country,
      attributes: ['id', 'name', 'flag'],
    }],
    where: { id },
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,

  };

  return Review
    .findAll(options)
    .then(review => res.json(review))
    .catch(next);
};

exports.create = async (req, res, next) => Review
  .create(req.body)
  .then(({ id }) => res.status(201).json({ id }))
  .catch(next);
