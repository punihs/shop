const _ = require('lodash');
const { Address } = require('./../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'first_name'],
    where: {
      customer_id: req.user.id,
    },
    limit: Number(req.query.limit) || 20,
  };
  return Address
    .findAll(options)
    .then(address => res.json(address))
    .catch(next);
};

exports.create = async (req, res) => {
  const { id } = await Address.create(Object.assign({}, req.body, {
    customer_id: req.user.id,
  }));

  return res.status(201).json({ id });
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const status = await Address.update(_.omit(req.body, ['customer_id']), { where: { id } });
  return res.json(status);
};

exports.destroy = async (req, res) => {
  const { id } = req.params;
  const status = await Address.destroy({ where: { id } });
  return res.json(status);
};

