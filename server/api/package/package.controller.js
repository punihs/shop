const moment = require('moment');
const { Package } = require('./../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'received'],
    where: {
      customer_id: req.user.id,
    },
    limit: Number(req.query.limit) || 20,
  };

  const states = ['processing', 'values', 'review', 'delivered', 'ship'];
  if (states.includes(req.query.status)) options.where.status = req.query.status;

  return Package
    .findAll(options)
    .then(packages => res.json(packages))
    .catch(next);
};

exports.create = (req, res, next) => {
  const pack = req.body;
  pack.customer_id = 2319;
  pack.order_id = `${moment().format('YYYYMMDDhhmmss')}.${pack.customer_id}`;
  pack.status = 'inreveiw';
  return Package
    .create(pack)
    .then(({ id }) => res.status(201).json({ id }))
    .catch(next);
};
