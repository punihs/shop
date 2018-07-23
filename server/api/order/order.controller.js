const debug = require('debug');
const _ = require('lodash');
const Ajv = require('ajv');

const { orderCreate } = require('./order.schema');
const { Package, Store } = require('./../../conn/sqldb');
const minio = require('./../../conn/minio');
const {
  GROUPS: {
    OPS, CUSTOMER,
  },
  PACKAGE_TYPES: {
    INCOMING,
  },
} = require('./../../config/constants');

const log = debug('s.order.controller');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'store_id', 'invoice_code', 'tracking_number'],
    include: [{
      model: Store,
      attributes: ['id', 'name'],
    }],
    where: { package_type: INCOMING },
    order: [['id', 'DESC']],
    limit: Number(req.query.limit) || 20,
  };

  if (req.user.group_id === CUSTOMER) {
    options.where.customer_id = req.user.id;
  }

  return Package
    .findAll(options)
    .then(orders => res.json({ items: orders, total: 10 }))
    .catch(next);
};

exports.show = (req, res, next) => {
  const options = {
    attributes: ['id', 'store_id', 'invoice_code', 'tracking_number'],
    include: [{
      model: Store,
      attributes: ['id', 'name'],
    }],
    where: {
      customer_id: req.user.id,
      package_type: INCOMING,
    },
    limit: Number(req.query.limit) || 20,
  };

  return Package
    .findById(req.params.id, options)
    .then(order => res.json(order))
    .catch(next);
};

exports.create = async (req, res) => {
  const IS_OPS = req.user.group_id === OPS;
  const ajv = new Ajv();
  ajv.addSchema(orderCreate, 'OrderCreate');
  const valid = ajv.validate('OrderCreate', req.body);

  if (!valid) {
    log('create', ajv.errorsText());
    return res.status(400).json({ message: ajv.errorsText() });
  }
  const order = req.body;
  order.created_by = req.user.id;

  if (req.query.type === 'INCOMING') {
    order.package_type = INCOMING;
  }
  if (!IS_OPS) order.customer_id = req.user.id;

  const saved = await Package.create(order);
  const { id } = saved;
  return res.status(201).json({ id });
};

exports.download = (req, res, next) => {
  const { id } = req.params;
  return Package
    .findById(id, {
      attributes: ['object', 'name'],
      include: [{
        model: Store,
        attributes: ['id', 'name'],
      }],
    })
    .then((order) => {
      const { object, Store: store } = order.toJSON();
      const ext = object.split('.').pop();
      return minio.downloadLink({ object, name: `Shoppre-Order-${id}-${store.name}-${order.name}.${ext}` });
    })
    .then(url => res.redirect(url))
    .catch(next);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const order = _.pick(req.body, ['store_id', 'invoice_code', 'tracking_number', 'name', 'invoice', 'comments']);
  const status = await Package
    .update(order, { where: { id, package_type: INCOMING } });

  return res.json(status);
};

