const debug = require('debug');
const _ = require('lodash');
const Ajv = require('ajv');

const { orderCreate } = require('./order.schema');
const { Package, Store } = require('./../../conn/sqldb');
const db = require('../../conn/sqldb');
const minio = require('./../../conn/minio');
const {
  GROUPS: {
    OPS, CUSTOMER,
  },
  PACKAGE_TYPES: {
    INCOMING,
  },
  PACKAGE_STATE_IDS: { PACKAGE_ITEMS_UPLOAD_PENDING },
} = require('./../../config/constants');

const log = debug('s.order.controller');


exports.index = (req, res, next) => {
  switch (req.user.group_id) {
    case OPS: {
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

      // - Quick package addition
      if (req.body.customer_id) {
        options.where.customer_id = req.body.customer_id;
      }

      return Package
        .findAll(options)
        .then(orders => res.json({ items: orders, total: 10 }))
        .catch(next);
    }
    default: return next();
  }
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

exports.create = async (req, res, next) => {
  switch (req.user.group_id) {
    case CUSTOMER: {
      const IS_OPS = req.user.group_id === OPS;
      const ajv = new Ajv();
      ajv.addSchema(orderCreate, 'OrderCreate');
      const valid = ajv.validate('OrderCreate', req.body);

      if (!valid) {
        log('create', ajv.errorsText());
        return res.status(400).json({ message: ajv.errorsText() });
      }

      const pkg = req.body;
      pkg.created_by = req.user.id;
      pkg.package_type = INCOMING;
      pkg.invoice = pkg.object;

      if (!IS_OPS) pkg.customer_id = req.user.id;

      return Package
        .create(pkg)
        .then((pack) => {
          Package.updateState({
            db,
            lastStateId: null,
            nextStateId: PACKAGE_ITEMS_UPLOAD_PENDING,
            pkg: { ...pack.toJSON(), ...pack.id },
            actingUser: req.user,
          });

          const { id } = pack;
          return res
            .status(201)
            .json({ id });
        });
    }
    default: return next();
  }
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

