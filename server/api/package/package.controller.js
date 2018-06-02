const _ = require('lodash');
const debug = require('debug');
const moment = require('moment');

const log = debug('package');
const {
  Package, Order, PackageItem, PhotoRequest, Transaction, User,
} = require('../../conn/sqldb');
const { index } = require('./package.service');

exports.index = (req, res, next) => index(req)
  .then(packages => res.json(packages))
  .catch(next);


exports.create = async (req, res, next) => {
  const allowed = [
    'type',
    'store_id',
    'reference_code',
    'locker_code',
    'weight',
    'number_of_items',
    'price_amount',
    'customer_id',
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

exports.metaUpdate = async (req, res) => {
  const allowed = [
    'seller',
    'reference_code',
    'type',
    'locker_code',
    'weight',
    'number_of_items',
    'price_amount',
    'customer_id',
    'is_item_damaged',
    'liquid',
    'is_featured_seller',
    'received',
    'status',
    'review',
  ];

  const { id } = req.params;
  const { customerId } = req.user.id;

  const pack = _.pick(req.body, allowed);

  const map = {
    values: 'Package waiting for customer input value action',
    invoice: 'Package under review for customer invoice upload',
    reivew: 'Package is under shoppre review',
    split_done: 'Package Splitted!', // email sedning is pending
    return_done: 'Package Returned to Sender!', // email sedning is pending
  };

  pack.review = map[pack.status] || '';

  switch (pack.status) {
    case 'ship': {
      const itemCount = await PackageItem.find({
        attributes: ['id'],
        where: {
          package_id: id,
        },
      });

      const photoRequest = await PhotoRequest.find({
        attributes: ['id'],
        where: {
          package_id: id,
        },
      });

      if (photoRequest.status === 'pending') {
        return res.status(400).res.json({ message: 'Please check and update the Photo Request Status !' });
      } else if (itemCount !== pack.number_of_items) {
        return res.status(400).res.json({ message: 'please check your items !' });
      }
      break;
    }
    case 'return_done': {
      const walletBalance = await User.find(['id', 'wallet_balance_amount'], { where: { customer_id: customerId } });
      let walletAmount = 0;
      walletAmount = walletBalance.amount - 400;
      await User.Update(
        { wallet_balance_amount: walletAmount },
        { where: { customer_id: customerId } },
      );

      const description = 'Return service fee deducted | Order ID '.concat(id);
      await Transaction.Create({ customer_id: customerId, amount: -400, description });
      break;
    }
    default: {
      log('default');
    }
  }

  const status = await Package.update(pack, { where: { id } });
  return res.status(200).json(status);
};

exports.destroy = async (req, res) =>
  // const { id } = req.params;
  // await PackageItem.destroy({ where: { package_id: id } });
  // await PackageMeta.destroy({ where: { package_id: id } });
  // await PhotoRequest.destroy({ where: { package_id: id } });
  res.status(200).json({ message: 'Deleted successfully' });
exports.unread = async (req, res) => {
  const { id } = req.params;
  const status = await Package.update({ admin_read: false }, { where: { id } });
  return res.json(status);
};
