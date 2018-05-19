const { Address } = require('../../conn/sqldb');

exports.index = (req, res) => {
  const address = Address.findAll({
    attributes: ['id'],
    limit: Number(req.query.limit) || 20,
    customer_id: req.user.id,
  });

  return res.json(address);
};

exports.create = (req, res) => {
  const { line1 } = req.body;
  const address = Address.create(Object.assign({
    customer_id: req.user.id,
    line1,
  }));

  return res.status(201).json(address);
};
