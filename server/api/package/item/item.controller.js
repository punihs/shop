
const debug = require('debug');

const log = debug('package');

const db = require('../../../conn/sqldb');
const minio = require('../../../conn/minio');

const {
  PackageItem, PackageItemCategory, Package, PackageState,
} = db;

const {
  PACKAGE_STATE_IDS: {
    READY_TO_SHIP, ADDED_SHIPMENT,
  },
} = require('../../../config/constants');

exports.index = (req, res, next) => {
  log('index', req.query);

  return PackageItem
    .findAll({
      where: { package_id: req.params.packageId },
      attributes: ['id', 'name', 'quantity', 'price_amount', 'total_amount', 'object'],
      limit: Number(req.query.limit) || 20,
      include: [{
        model: PackageItemCategory,
        attributes: ['name'],
      }],
      order: [['id', 'desc']],
    })
    .then(packageItems => res.json(packageItems))
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
    .then(({ id }) => res.json({ id }))
    .catch(next);
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

exports.update = async (req, res) => {
  const { id } = req.params;
  const packageItem = req.body;
  packageItem.total = packageItem.price_amount * packageItem.quantity;
  const status = await PackageItem.update(packageItem, { where: { id } });
  return res.json(status);
};

exports.destroy = async (req, res, next) => {
  const { id } = req.params;
  const { packageId } = req.params;

  const pkg = Package
    .find({
      attributes: ['id'],
      where: { id: packageId },
      include: [{
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

  return PackageItem
    .destroy({
      where: {
        id,
        package_id: packageId,
      },
    })
    .then(status => res
      .json({ message: `Package Item ${id} deleted sucessfully`, status }))
    .catch(next);
};


exports.createItem = (req, res, next) => {
  PackageItemCategory
    .create(req.body)
    .then(itemCategory =>
      res.json({ package_item_category_id: itemCategory.id, name: itemCategory.name }))
    .catch(next);
};
