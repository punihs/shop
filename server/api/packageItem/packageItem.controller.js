const debug = require('debug');
const moment = require('moment');
const {
  PackageItem, Package, PackageItemCategory,
} = require('../../conn/sqldb');
const minio = require('../../conn/minio');

const packageService = require('../package/package.service');
const {
  PRICE_ENTERER: { SHOPPRE },
  PACKAGE_STATE_IDS: {
    IN_REVIEW,
  },
} = require('../../config/constants');

const log = debug('api-packageItem-controller');

exports.index = async (req, res, next) => {
  try {
    const options = {
      attributes: ['id', 'name'],
      limit: Number(req.query.limit) || 20,
    };

    const packageItems = await PackageItem
      .findAll(options);

    return res.json(packageItems);
  } catch (err) {
    return next(err);
  }
};


exports.create = async (req, res, next) => {
  try {
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

    const item = await PackageItem
      .create(packageItem);

    const object = `package_items/${item.id}/${item.id}_${moment().format('YYYY_MM_DD_h_mm_ss')}.${extension}`;

    await minio
      .base64Upload({
        object,
        base64String,
      });

    await item.update({ object });

    return res.status(201).json({ item });
  } catch (err) {
    return next(err);
  }
};

exports.show = async (req, res, next) => {
  try {
    const packageItem = await PackageItem
      .find({
        attributes: ['id', 'quantity', 'price_amount', 'total_amount', 'object', 'object_advanced',
          'name', 'object_invoice', 'object_ecommerce', 'ecommerce_link'],
        where: { id: req.params.id },
        include: [{
          model: Package,
          attributes: ['id'],
        }, {
          model: PackageItemCategory,
          attributes: ['id', 'name'],
        }],
      });

    return res.json(packageItem);
  } catch (err) {
    return next(err);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const { id } = req.params;

    const status = await PackageItem.destroy({ where: { id } });

    return res.json(status);
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const packageItem = req.body;
    packageItem.total = packageItem.price_amount * packageItem.quantity;

    const status = await PackageItem.update(packageItem, { where: { package_id: id } });

    return res.json(status);
  } catch (err) {
    return next(err);
  }
};


exports.values = async (req, res, next) => {
  try {
    const { id } = req.params;
    let totalAmount = null;
    await req.body.forEach((x) => {
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

    await Promise.all([
      Package.update({ price_amount: totalAmount }, { where: { id } }),
      packageService
        .updateState({
          pkg: { id },
          actingUser: req.user,
          nextStateId: IN_REVIEW,
          comments: 'Cusotmer Updated/reset the value',
        }),
    ]);

    log('body', req.body);

    return res.json({ message: 'Values updated succesfully' });
  } catch (err) {
    return next(err);
  }
};

