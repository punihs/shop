const { Category } = require('./../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: req.query.fl
      ? req.query.fl.split(',')
      : ['id', 'name', 'url_key', 'description', 'return_policy_id', 'return_policy_text'],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };

  return Category
    .findAll(options)
    .then(category => res.json({ category: category }))
    .catch(next);
};
