const debug = require('debug');
const moment = require('moment');
const {
  PackageItem, Package, PackageItemCategory, Notification,
} = require('../../conn/sqldb');
const db = require('../../conn/sqldb');
const minio = require('../../conn/minio');

const packageService = require('../package/package.service');
const {
  PRICE_ENTERER: { SHOPPRE },
  PACKAGE_STATE_IDS: {
    IN_REVIEW,
  },
} = require('../../config/constants');

const log = debug('api-packageItem-controller');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'name'],
    limit: Number(req.query.limit) || 20,
  };

  return PackageItem
    .findAll(options)
    .then(packages => res.json(packages))
    .catch(next);
};


exports.create = async (req, res, next) => {
  const packageItem = req.body;
  const { base64: base64String, filename } = req.body.photo_file;
  const extension = filename.split('.').pop();
  if (!['jpg', 'jpeg', 'png', 'bmp'].includes(extension.toLowerCase())) {
    return res.status(400).end('Invalid File');
  }

  packageItem.created_by = req.user.id;
  packageItem.total_amount = packageItem.price_amount * packageItem.quantity;

  if (packageItem.price) {
    packageItem.price_entered_by = SHOPPRE;
  }

  return PackageItem
    .create(packageItem)
    .then((saved) => {
      const { id } = saved;
      const object = `package_items/${id}/${id}_${moment().format('YYYY_MM_DD_h_mm_ss')}.${extension}`;
      minio
        .base64Upload({
          object,
          base64String,
        })
        .then(() => saved.update({ object }));
      return res.status(201).json({ id });
    })
    .catch(next);
};

exports.show = (req, res, next) => {
  PackageItem
    .find({
      attributes: ['id', 'quantity', 'price_amount', 'total_amount', 'object', 'object_advanced', 'name', 'object_invoice'],
      where: { id: req.params.id },
      include: [{
        model: Package,
        attributes: ['id'],
      }, {
        model: PackageItemCategory,
        attributes: ['id', 'name'],
      }],
    })
    .then(packageitem => res.json(packageitem))
    .catch(next);
};

exports.destroy = async (req, res) => {
  const { id } = req.params;
  const status = await PackageItem.destroy({ where: { id } });
  return res.json(status);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const packageItem = req.body;
  packageItem.total = packageItem.price_amount * packageItem.quantity;
  const status = await PackageItem.update(packageItem, { where: { package_id: id } });
  return res.json(status);
};


exports.values = async (req, res) => {
  const { id } = req.params;
  let totalAmount = null;
  req.body.forEach((x) => {
    totalAmount += x.price_amount * x.quantity;
    PackageItem
      .update(
        {
          price_amount: x.price_amount,
          quantity: x.quantity,
          total_amount: x.price_amount * x.quantity,
        },
        { where: { id: x.id } },
      );
  });

  Notification
    .create({
      customer_id: req.user.id,
      action_type: 'Package',
      action_id: id,
      action_description: `Customer submitted Package Item Values - Order#  ${id}`,
    });

  Package.update({ price_amount: totalAmount }, { where: { id } });

  packageService
    .updateState({
      db,
      pkg: { id },
      actingUser: req.user,
      nextStateId: IN_REVIEW,
      comments: 'Cusotmer Updated/reset the value',
    });
  log('body', req.body);
  return res.json({ message: 'Values updated succesfully' });
};

