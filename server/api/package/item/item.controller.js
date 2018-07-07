
const debug = require('debug');

const log = debug('package');

const db = require('../../../conn/sqldb');

const {
  PackageItem, PackageItemCategory,
} = db;

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
