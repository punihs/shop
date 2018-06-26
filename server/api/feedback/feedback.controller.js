
const { Feedback } = require('../../conn/sqldb');

exports.create = async (req, res, next) => Feedback
  .create(req.body)
  .then(({ id }) => res.status(201).json({ id }))
  .catch(next);
