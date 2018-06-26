const { Notification } = require('../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'action_type', 'action_description', 'action_id', 'customer_id', 'solve_status'],
    limit: Number(req.query.limit) || 20,
  };
  if (req.query.action_type) options.where = { action_type: req.query.action_type };

  return Notification
    .findAll(options)
    .then(notification => res.json(notification))
    .catch(next);
};
