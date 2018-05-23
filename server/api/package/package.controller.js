const _ = require('lodash');
const moment = require('moment');
const { Package, Order } = require('../../conn/sqldb');

const { PACKAGE_STATES } = require('./../../config/constants');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'received_at'],
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

exports.unread = async (req, res) => {
  const { id } = req.params;
  const status = await Package.update({ admin_read: false }, { where: { id } });
  return res.json(status);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const status = await Package.update(req.body, { where: { id } });
  return res.json(status);
};

exports.destroy = async (req, res) => {
  const { id } = req.params;
  const status = await Package.destroy({ where: { id } });
  return res.json(status);
};

exports.create = async (req, res, next) => {
  const allowed = [
    'type',
    'store_id',
    'reference_code',
    'locker_code',
    'weight',
    'number_of_items',
    'price_amount',
  ];

  const pack = _.pick(req.body, allowed);

  // internal user
  pack.created_by = req.user.id;
  pack.order_code = `${moment().format('YYYYMMDDhhmmss')}.${pack.customer_id}`;

  return Package
    .create(pack)
    .then(({ id }) => {
      Order
        .update({ package_id: id }, { where: { id: req.body.order_id } });
      res.status(201).json({ id });
    })
    .catch(next);
};

