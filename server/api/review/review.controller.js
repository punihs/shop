const { Review } = require('./../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'name', 'source_id', 'description', 'rating', 'approved_by', 'is_approved', 'created_at'],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };

  return Review
    .findAll(options)
    .then(review => res.json({ reviews: review }))
    .catch(next);
};
