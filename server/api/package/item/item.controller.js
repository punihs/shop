
const debug = require('debug');

const log = debug('package');

const db = require('../../../conn/sqldb');

const {
  PackageItem,
} = db;

exports.index = (req, res, next) => {
  log('index', req.query);
  return PackageItem
    .findAll({})
    .then(packageComments => res.json(packageComments))
    .catch(next);
};

exports.create = (req, res, next) => {
  log('index', req.query);
  return PackageItem
    .create({
      ...req.body,
      created_by: req.user.id,
    })
    .then(packageItems => res.json(packageItems))
    .catch(next);
};
