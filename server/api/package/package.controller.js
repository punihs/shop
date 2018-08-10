const _ = require('lodash');
const debug = require('debug');
const moment = require('moment');
const xlsx = require('node-xlsx');

const log = debug('package');

const db = require('../../conn/sqldb');

const {
  Package, Order, PackageItem, User, Follower,
  Locker, Store, PackageState, Country,
} = db;

const {
  PACKAGE_STATE_ID_NAMES,
  PACKAGE_STATE_IDS: { PACKAGE_ITEMS_UPLOAD_PENDING },
  PACKAGE_TYPES: { INCOMING },
} = require('../../config/constants');
const logger = require('../../components/logger');

const { index } = require('./package.service');

exports.indexPublic = (req, res, next) => {
  log('indexPublic', req.query);
  if (req.query.public !== 'true') return next();
  const limit = Number(req.query.limit) || 20;

  const options = {
    where: {},
    attributes: ['id', 'price_amount', 'weight', 'store_id'],
    offset: Number(req.query.offset) || 0,
    limit: (limit && limit > 20) ? 20 : limit,
    raw: true,
  };

  return Package
    .findAll(options)
    .then(packages => res
      .json({ items: packages }))
    .catch(next);
};

exports.index = (req, res, next) => index(req)
  .then((result) => {
    log('testing all the requirements');
    if (req.query.xlsx) {
      const header = [
        'id', 'Store Name', 'Virtual Address Code', 'Status',
      ];
      log('testing index');
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
        attributes: [
          'id', 'name', 'first_name', 'last_name', 'salutation', 'virtual_address_code',
          'mobile', 'email', 'phone', 'phone_code',
        ],
        include: [{
          model: Country,
          attributes: ['id', 'name', 'iso2'],
        }, {
          model: Locker,
          attributes: ['id', 'name', 'short_name', 'allocated_at'],
        }],
      }],
    })
    .then((pkg) => {
      if (!pkg) return res.status(404).end();
      return res.json({ ...pkg.toJSON(), state_id: pkg.PackageState.state_id });
    })
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
        const fs = [req.user.id, req.body.customer_id]
          .map(followerId => ({ user_id: followerId, object_id: id }));

        Follower
          .bulkCreate(fs)
          .catch(err => logger.error('follower creation', req.user, req.body, err));

        if (req.body.order_id) {
          Order
            .update({ package_id: id }, { where: { id: req.body.order_id } })
            .catch(err => logger.error('order', req.body, err));
        }

        return Package.updateState({
          db,
          nextStateId: PACKAGE_ITEMS_UPLOAD_PENDING,
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

exports.count = (req, res, next) => {
  const { customerId } = req.user.id;
  const options = {
    attributes: ['id'],
    where: { customer_id: customerId, package_type: INCOMING },
    include: [{
      model: PackageState,
      where: { state_id: 5 },
    }],
  };
  const readyToShipCount = Package
    .count(options);

  const optionInReview = {
    attributes: ['id'],
    where: { customer_id: customerId, package_type: INCOMING },
    include: [{
      model: PackageState,
      where: { state_id: 4 },
    }],
  };
  const inReviewCount = Package
    .count(optionInReview)
    .catch(next);

  const optionActionRequired = {
    attributes: ['id'],
    where: { customer_id: customerId, package_type: INCOMING },
    include: [{
      model: PackageState,
      where: { state_id: 3 },
    }],
  };
  const actionRequiredCount = Package
    .count(optionActionRequired)
    .catch(next);

  const optionAll = {
    attributes: ['id'],
    where: { customer_id: customerId, package_type: INCOMING },
    include: [{
      model: PackageState,
      where: { state_id: [3, 4, 5] },
    }],
  };
  const allCount = Package
    .count(optionAll)
    .catch(next);

  return res.json({
    readyToShipCount, inReviewCount, actionRequiredCount, allCount,
  });
};

exports.addNote = async (req, res) => {
  const { id } = req.params;
  await Package
    .update(req.body, { where: { id } });
  return res.json({ message: 'Note updated to your package' });
};

