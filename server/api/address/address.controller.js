const debug = require('debug');
const _ = require('lodash');
const { Address, Country } = require('./../../conn/sqldb');
const { GROUPS: { CUSTOMER } } = require('./../../config/constants');

const { ajv, transform } = require('./../../components/ajv');

const log = debug('s.api.address.controller');

exports.index = (req, res, next) => {
  const options = {
    attributes: req.query.fl
      ? req.query.fl.split(',')
      : [
        'id', 'customer_id', 'country_id', 'first_name', 'last_name', 'salutation',
        'line1', 'line2', 'state', 'city', 'pincode', 'phone_code', 'phone', 'is_default',
      ],
    where: {},
    include: [{
      model: Country,
      attributes: ['iso2', 'name'],
    }],
    order: [['is_default', 'DESC'], ['created_at', 'DESC']],
    limit: Number(req.query.limit) || 20,
  };

  if (req.user.group_id === CUSTOMER) {
    options.where.customer_id = req.user.id;
  }

  return Address
    .findAll(options)
    .then(address => res.json(address))
    .catch(next);
};

exports.show = (req, res, next) => {
  const options = {
    attributes: req.query.fl
      ? req.query.fl.split(',')
      : [
        'id', 'customer_id', 'country_id', 'first_name', 'last_name', 'salutation',
        'line1', 'line2', 'state', 'city', 'pincode', 'phone_code', 'phone', 'is_default',
      ],
    where: { },
    include: [{
      model: Country,
      attributes: ['name'],
    }],
  };

  if (req.user.group_id === CUSTOMER) {
    options.where.customer_id = req.user.id;
  }

  return Address
    .find(options)
    .then(address => res.json(address))
    .catch(next);
};

exports.create = (req, res, next) => {
  log('create', req.body);
  const valid = ajv.validate('createAddress', req.body);

  if (!valid) return res.status(400).json(transform(ajv));

  const { is_default: isDefault } = req.body;

  let promise = Promise.resolve();

  if (isDefault) {
    const where = {
      is_default: true,
      customer_id: req.user.id,
    };

    promise = Address
      .count({ where })
      .then((found) => {
        if (!found) return Promise.resolve();
        return Address.update({ is_default: false }, { where });
      });
  }

  return promise
    .then(() => Address
      .create(Object.assign({}, req.body, {
        customer_id: req.user.id,
      }))
      .then(({ id }) => res.status(201).json({ id })))
    .catch(next);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const status = await Address.update(_.omit(req.body, ['customer_id']), { where: { id } });
  return res.json(status);
};

exports.metaupdate = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;
  await Address.update({ is_default: '0' }, { where: { customer_id: customerId } });
  await Address.update({ is_default: '1' }, { where: { id } });
  return res.status(200).json({ id });
};

exports.destroy = async (req, res) => {
  const { id } = req.params;
  const status = await Address.destroy({ where: { id } });
  return res.json(status);
};

