const moment = require('moment');
const { Package } = require('./../../conn/sqldb');
const { PACKAGE_STATES } = require('./../../config/constants');

const { INREVIEW } = PACKAGE_STATES;

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'received'],
    where: {
      customer_id: req.user.id,
    },
    limit: Number(req.query.limit) || 20,
  };

  const states = Object.values(PACKAGE_STATES);
  if (states.includes(req.query.status)) options.where.status = req.query.status;

  return Package
    .findAll(options)
    .then(packages => res.json(packages))
    .catch(next);
};

exports.create = (req, res, next) => {
  const pack = req.body;
  pack.created_by = req.user.id;
  pack.order_id = `${moment().format('YYYYMMDDhhmmss')}.${pack.customer_id}`;
  pack.status = INREVIEW;
  return Package
    .create(pack)
    .then(({ id }) => res.status(201).json({ id }))
    .catch(next);
};
