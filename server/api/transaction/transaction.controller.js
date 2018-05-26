const { Transaction } = require('../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'customer_id', 'amount', 'description'],
    limit: Number(req.query.limit) || 20,
  };
  if (req.query.customer_id) options.where = { customer_id: req.query.customer_id };

  return Transaction
    .findAll(options)
    .then(transaction => res.json(transaction))
    .catch(next);
};

exports.create = async (req, res, next) => {
  const transaction = req.body;
  return Transaction
    .create(transaction)
    .then(({ id }) => res.json({ id }))
    .catch(next);
};

exports.destroy = (req, res, next) => {
  const { id } = req.params;
  Transaction
    .destroy({
      where: { id },
    })
    .then(deleted => res.json(deleted))
    .catch(next);
};
