const _ = require('lodash');
const { Order, Store } = require('./../../conn/sqldb');
const minio = require('./../../conn/minio');
const logger = require('./../../components/logger');
const { GROUPS: { OPS, CUSTOMER } } = require('./../../config/constants');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'store_id', 'invoice_code', 'tracking_code', 'package_id', 'name'],
    include: [{
      model: Store,
      attributes: ['id', 'name'],
    }],
    where: { },
    limit: Number(req.query.limit) || 20,
  };

  if (req.user.group_id === CUSTOMER) {
    options.where.customer_id = req.user.id;
  }

  return Order
    .findAll(options)
    .then(orders => res.json({ items: orders, total: 10 }))
    .catch(next);
};

exports.show = (req, res, next) => {
  const options = {
    attributes: ['id', 'store_id', 'invoice_code', 'tracking_code', 'name'],
    include: [{
      model: Store,
      attributes: ['id', 'name'],
    }],
    where: {
      customer_id: req.user.id,
    },
    limit: Number(req.query.limit) || 20,
  };

  return Order
    .findById(req.params.id, options)
    .then(order => res.json(order))
    .catch(next);
};

exports.create = async (req, res, next) => {
  const IS_OPS = req.user.group_id === OPS;

  try {
    const { invoice_file: invoiceFile } = req.body;

    if (invoiceFile && !['txt', 'pdf'].includes(invoiceFile.filename.split('.').pop())) {
      return res.status(400).end('Invalid File');
    }

    const order = req.body;
    order.created_by = req.user.id;

    if (!IS_OPS) order.customer_id = req.user.id;

    const saved = await Order.create(order);
    const { id } = saved;

    if (req.body.invoice_file) {
      minio
        .base64UploadCustom('orders', id, invoiceFile)
        .then(({ object }) => saved.update({ object }))
        .catch(err => logger.error('order.express', err, req.user, req.body));
    }

    return res.status(201).json({ id });
  } catch (e) {
    return next(e);
  }
};

exports.download = (req, res, next) => {
  const { id } = req.params;
  return Order
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
  const order = _.pick(req.body, ['store_id', 'invoice_code', 'tracking_code', 'name']);
  const { invoice_file: invoiceFile } = req.body;

  if (invoiceFile && !['txt', 'pdf'].includes(invoiceFile.filename.split('.').pop())) {
    return res.status(400).end('Invalid File');
  }

  const { object } = invoiceFile
    ? await minio
      .base64UploadCustom('orders', id, invoiceFile)
    : {};

  if (invoiceFile) order.object = object;

  const status = await Order
    .update(order, { where: { id: req.body.order_id } });

  return res.json(status);
};

