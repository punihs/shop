const { Review } = require('./../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'person', 'source', 'review', 'rating', 'approve'],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };

  return Review
    .findAll(options)
    .then(review => res.json(review))
    .catch(next);
};
