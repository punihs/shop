const _ = require('lodash');
const debug = require('debug');
const moment = require('moment');
const xlsx = require('node-xlsx');

const log = debug('package');

const db = require('../../conn/sqldb');

const {
  Package, Order, PackageItem, User,
  Locker, Store, PackageState,
} = db;

const {
  PACKAGE_STATE_ID_NAMES,
  PACKAGE_STATE_IDS: { CREATED },
} = require('../../config/constants');
const logger = require('../../components/logger');

const { index } = require('./package.service');

exports.index = (req, res, next) => index(req)
  .then((result) => {
    if (req.query.xlsx) {
      const header = [
        'id', 'Store Name', 'Virtual Address Code', 'Status',
      ];
      const excel = xlsx.build([{
        name: 'Packages',
        data: [header]
          .concat(result
            .packages
            .map(({
              id,
              Store: store,
              Customer,
              PackageState: packageState,
            }) => [
              id, store.name, Customer.virtual_address_code,
              PACKAGE_STATE_ID_NAMES[packageState.state_id],
            ])),
      }]);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats');
      res.setHeader(
        'Content-disposition',
        `attachment; filename=Packages_${moment()
          .format('DD-MM-YYYY')}.xlsx`,
      );

      return res.end(excel, 'binary');
    }
    return res.json(result);
  })
  .catch(next);

exports.show = async (req, res, next) => {
  log('show', req.query);
  return Package
    .findById(req.params.id, {
      attributes: req.query.fl
        ? req.query.fl.split(',')
        : ['id', 'customer_id', 'created_at', 'weight', 'content_type'],
      include: [{
        model: PackageState,
        attributes: ['id', 'state_id'],
      }, {
        model: PackageItem,
        attributes: ['id'],
      }, {
        model: Store,
        attributes: ['id', 'name'],
      }, {
        model: User,
        as: 'Customer',
        attributes: ['id', 'name', 'virtual_address_code', 'first_name', 'last_name', 'salutation'],
        include: [{
          model: Locker,
          attributes: ['id', 'short_name', 'name'],
        }],
      }],
    })
    .then(pkg => res.json({ ...pkg.toJSON(), state_id: pkg.PackageState.state_id }))
    .catch(next);
};

exports.create = async (req, res, next) => {
  log('create', req.body);
  const allowed = [
    'is_doc',
    'store_id',
    'reference_code',
    'virtual_address_code',
    'weight',
    'price_amount',
    'customer_id',
    'content_type',
  ];

  const pkg = _.pick(req.body, allowed);
  // internal user
  pkg.created_by = req.user.id;

  return Locker
    .allocation({ customerId: pkg.customer_id })
    .then(locker => Package.create(pkg)
      .then(({ id }) => {
        if (req.body.order_id) {
          Order
            .update({ package_id: id }, { where: { id: req.body.order_id } })
            .catch(err => logger.error('order', req.body, err));
        }

        return Package.updateState({
          db,
          nextStateId: CREATED,
          pkg: { ...pkg, id },
          actingUser: req.user,
        }).then(() => res.status(201).json({ id, Locker: locker }));
      }))
    .catch(next);
};

exports.state = (req, res, next) => Package
  .findById(req.params.id)
  .then(pkg => Package
    .updateState({
      db,
      pkg,
      actingUser: req.user,
      nextStateId: req.body.state_id,
      comments: req.body.comments,
    })
    .then(status => res.json(status)))
  .catch(next);

exports.facets = (req, res, next) => Package
  .findById(req.params.id)
  .then(pkg => Package
    .updateState({
      db,
      pkg,
      actingUser: req.user,
      nextStateId: req.body.state_id,
    })
    .then(status => res.json(status)))
  .catch(next);

exports.update = (req, res, next) => {
  const allowed = [
    'store_id',
    'reference_code',
    'weight',
    'price_amount',
    'customer_id',
    'is_doc',
    'content_type',
  ];

  const { id } = req.params;
  const { customerId } = req.user.id;

  const pack = _.pick(req.body, allowed);
  pack.updated_by = customerId;

  return Package
    .update(pack, { where: { id } })
    .then(() => res.json({ id }))
    .catch(next);
};

exports.destroy = async (req, res) =>
  // const { id } = req.params;
  // await PackageItem.destroy({ where: { package_id: id } });
  // await PackageCharge.destroy({ where: { id: id } });
  // await PhotoRequest.destroy({ where: { package_id: id } });
  res.status(200).json({ message: 'Deleted successfully' });
exports.unread = async (req, res) => {
  const { id } = req.params;
  const status = await Package.update({ admin_read: false }, { where: { id } });
  return res.json(status);
};
