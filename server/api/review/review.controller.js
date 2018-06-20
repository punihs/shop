const { Review } = require('./../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'name', 'source_id', 'description', 'rating', 'approved_by', 'is_approved'],
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
