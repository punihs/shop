const debug = require('debug');

const minio = require('../../../conn/minio');
const {
  PackageItem, PackageItemCategory, Package, PackageState,
} = require('../../../conn/sqldb');

const {
  PACKAGE_STATE_IDS: {
    READY_TO_SHIP, ADDED_SHIPMENT,
  },
} = require('../../../config/constants');

const log = debug('package');

exports.index = async (req, res, next) => {
  try {
    log('index', req.query);

    const packageItems = await PackageItem
      .findAll({
        where: { package_id: req.params.packageId },
        attributes: [
          'id', 'name', 'quantity', 'price_amount', 'total_amount', 'object',
          'object_invoice',
        ],
        include: [{
          model: PackageItemCategory,
          attributes: ['name'],
        }],
        order: [['id', 'desc']],
        limit: Number(req.query.limit) || 20,
      });
    return res.json(packageItems);
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    log('create', req.body);

    const pkgItem = await PackageItem
      .create({
        ...req.body,
        package_id: req.params.packageId,
        created_by: req.user.id,
      });

    return res.json(pkgItem.id);
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const packageItem = req.body;
    packageItem.total = packageItem.price_amount * packageItem.quantity;

    const status = await PackageItem
      .update(packageItem, { where: { id } });

    return res.json(status);
  } catch (err) {
    return next(err);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const { packageId, id } = req.params;

    const pkg = await Package
      .find({
        attributes: ['id'],
        where: { id: packageId },
        include: [{
          model: PackageItem,
          attributes: ['id'],
          where: { id },
        }, {
          model: PackageState,
          attributes: ['id'],
          where: { state_id: [READY_TO_SHIP, ADDED_SHIPMENT] },
        }],
      });

    if (pkg) {
      return res
        .status(403)
        .json({
          message: `Package Item ${id} can not delete after ready to ship`,
        });
    }

    await PackageItem
      .destroy({
        where: {
          id,
          package_id: packageId,
        },
      });

    return res.json({ message: `#${id} Package Item deleted sucessfully` });
  } catch (err) {
    return next(err);
  }
};

exports.image = async (req, res, next) => {
  try {
    log('index', req.query);

    const object = await PackageItem
      .findById(req.params.id, {
        attributes: ['id', 'object'],
      });

    const url = await minio
      .downloadLink({ object });

    return res.json({ url });
  } catch (err) {
    return next(err);
  }
};
