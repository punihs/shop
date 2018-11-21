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

exports.index = (req, res, next) => {
  log('index', req.query);

  return PackageItem
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
    })
    .then(packageItems => res
      .json(packageItems))
    .catch(next);
};

exports.create = (req, res, next) => {
  log('create', req.body);

  return PackageItem
    .create({
      ...req.body,
      package_id: req.params.packageId,
      created_by: req.user.id,
    })
    .then(({ id }) => res
      .json({ id }))
    .catch(next);
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const packageItem = req.body;
    packageItem.total = packageItem.price_amount * packageItem.quantity;

    const status = await PackageItem
      .update(packageItem, { where: { id } });

    res.json(status);
  } catch (e) {
    next(e);
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
  } catch (e) {
    return next(e);
  }
};

exports.image = (req, res, next) => {
  log('index', req.query);

  return PackageItem
    .findById(req.params.id, {
      attributes: ['id', 'object'],
    })
    .then(({ object }) => minio
      .downloadLink({ object })
      .then(url => res.json({ url })))
    .catch(next);
};
