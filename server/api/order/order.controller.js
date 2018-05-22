const moment = require('moment');
const { Order, Store } = require('./../../conn/sqldb');
const minio = require('./../../conn/minio');

exports.index = (req, res, next) => {
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
  if (req.body.invoice_file) {
    const { filename } = req.body.invoice_file;

    const extension = filename.split('.').pop();
    if (!['txt', 'pdf'].includes(extension)) return res.status(400).end('Invalid File');
  }


  const order = req.body;

  return Order
    .create(order).then((saved) => {
      const { id } = saved;
      if (req.body.invoice_file) {
        const { base64String, filename } = req.body.invoice_file;

        const extension = filename.split('.').pop();
        const object = `orders/${id - (id % 10000)}/${id}/${id}_${moment().format('YYYY_MM_DD_h_mm_ss')}.${extension}`;
        return minio
          .base64Upload({
            base64String,
            object,
          })
          .then(() => saved.update({ object }));
      }

      return res.status(201).json({ id });
    }).catch(next);
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
  const status = await Order.update(req.body, { where: { id } });
  return res.json(status);
};

