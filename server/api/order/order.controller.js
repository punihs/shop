const moment = require('moment');
const { Order, Store } = require('./../../conn/sqldb');
const minio = require('./../../conn/minio');

const { ORDER_STATES: { RECEIVED } } = require('../../config/constants');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'store_id', 'invoice_code'],
    include: [{
      model: Store,
      attributes: ['id', 'name'],
    }],
    where: {
      customer_id: 942,
    },
    limit: Number(req.query.limit) || 20,
  };

  return Order
    .findAll(options)
    .then(orders => res.json(orders))
    .catch(next);
};

exports.create = async (req, res, next) => {
  const { base64: base64String, filename } = req.body.invoice_file;

  const extension = filename.split('.').pop();
  if (!['txt', 'pdf'].includes(extension)) {
    return res.status(400).end('Invalid File');
  }

  const order = req.body;
  order.status = RECEIVED;

  return Order
    .create(order).then((saved) => {
      const { id } = saved;
      const object = `orders/${id}/${id}_${moment().format('YYYY_MM_DD_h_mm_ss')}.${extension}`;
      return minio
        .base64Upload({
          base64String,
          object,
        })
        .then(() => saved.update({ object }))
        .then(() => res.status(201).json({ id }))
        .catch(next);
    });
};
