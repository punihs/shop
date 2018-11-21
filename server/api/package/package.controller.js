const _ = require('lodash');
const debug = require('debug');
const Ajv = require('ajv');

const log = debug('package');

const db = require('../../conn/sqldb');
const { packageCreate } = require('./package.schema');

const {
  Package, PackageItem, User, Follower, PhotoRequest,
  Locker, Store, PackageState, Country, PackageCharge,
} = db;

const {
  PACKAGE_STATE_IDS: {
    READY_TO_SHIP,
    PACKAGE_ITEMS_UPLOAD_PENDING, INCOMING_PACKAGE,
    STANDARD_PHOTO_REQUEST, DAMAGED,
    ADVANCED_PHOTO_REQUEST, IN_REVIEW, AWAITING_VERIFICATION,
  },
  PHOTO_REQUEST_TYPES: { BASIC, ADVANCED },
  PHOTO_REQUEST_STATES: { COMPLETED },
  GROUPS: { OPS, CUSTOMER },
  PACKAGE_TYPES: { INCOMING },
} = require('../../config/constants');

const {
  PACKAGE: { STANDARD_PHOTO, ADVANCED_PHOTO },
} = require('../../config/constants/charges');

const logger = require('../../components/logger');

const { index, updateState } = require('./package.service');

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
          'email', 'phone',
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
  switch (req.user.group_id) {
    case OPS: {
      const allowed = [
        'is_doc',
        'store_id',
        'invoice_code',
        'virtual_address_code',
        'weight',
        'price_amount',
        'customer_id',
        'content_type',
      ];

      const pkg = _.pick(req.body, allowed);
      // internal user
      pkg.created_by = req.user.id;
      pkg.package_type = INCOMING;

      return Package.create(pkg)
        .then(({ id }) => {
          const fs = [req.user.id, req.body.customer_id]
            .map(followerId => ({ user_id: followerId, object_id: id }));

          Follower
            .bulkCreate(fs)
            .catch(err => logger.error('follower creation', req.user, req.body, err));

          const charges = {};
          charges.id = id;
          log('body', JSON.stringify(req.body));
          if (req.body.is_doc === true) {
            charges.receive_mail_amount = 0.00;
          }

          PackageCharge
            .create(charges);

          // if (req.body.is_featured_seller === 1) {
          //   const points = 50;
          //   const options = {
          //     attributes: ['id', 'points', 'total_points'],
          //     where: { customer_id: req.body.customer_id },
          //   };
          //   LoyaltyPoint
          //     .find(options)
          //     .then((loyaltyPoints) => {
          //       let level = '';
          //       if (loyaltyPoints.total_points < 1000) {
          //         level = 1;
          //       } else if (loyaltyPoints >= 1000 && loyaltyPoints.total < 6000) {
          //         level = 2;
          //       } else if (loyaltyPoints.total >= 6000 && loyaltyPoints.total < 26000) {
          //         level = 3;
          //       } else if (loyaltyPoints.total >= 26000) {
          //         level = 4;
          //       }
          //       loyaltyPoints.update({
          //         level,
          //         points: loyaltyPoints.points + points,
          //         total_points: loyaltyPoints.total_points + points,
          //       });
          //
          //       const misclenious = {};
          //       misclenious.customer_id = id;
          //       misclenious.description = 'Featured Seller Shopping Reward';
          //       misclenious.points = points;
          //       misclenious.type = REWARD;
          //       LoyaltyHistory
          //         .create(misclenious);
          //     });
          // }

          return updateState({
            lastStateId: null,
            nextStateId: PACKAGE_ITEMS_UPLOAD_PENDING,
            pkg: { ...pkg, id },
            actingUser: req.user,
          }).then(() => res.status(201).json({ id }));
        })
        .catch(next);
    }
    case CUSTOMER: {
      const IS_OPS = req.user.group_id === OPS;
      const ajv = new Ajv();
      ajv.addSchema(packageCreate, 'PackageCreate');
      const valid = ajv.validate('PackageCreate', req.body);

      if (!valid) {
        log('create', ajv.errorsText());
        return res.status(400).json({ message: ajv.errorsText() });
      }

      const pkg = req.body;
      pkg.created_by = req.user.id;
      pkg.package_type = INCOMING;
      pkg.invoice = pkg.object;

      if (!IS_OPS) pkg.customer_id = req.user.id;

      return Package
        .create(pkg)
        .then((pack) => {
          const { id } = pack;
          const charges = {};
          charges.id = id;
          charges.receive_mail_amount = 0.00;

          PackageCharge
            .create(charges);

          updateState({
            lastStateId: null,
            nextStateId: INCOMING_PACKAGE,
            pkg: { ...pack.toJSON(), ...pack.id },
            actingUser: req.user,
            comments: `Submitted Incoming Alert From ${req.body.store_name}`,
          });

          return res
            .status(201)
            .json({ id });
        });
    }
    default: return next();
  }
};

exports.state = async (req, res, next) => {
  const pkg = await Package
    .findById(req.params.id, { raw: true });

  if ([AWAITING_VERIFICATION, DAMAGED].includes(req.body.state_id)) {
    const packageItemCount = await PackageItem.count({
      where: { package_id: req.params.id },
    });

    if (!packageItemCount) {
      return res.status(400).json({ message: 'Package items is empty!' });
    }
  } else if ([READY_TO_SHIP].includes(req.body.state_id)) {
    const photoRequest = Package.find({
      attributes: ['id'],
      where: { id: req.params.id },
      include: [{
        model: PackageState,
        where: { state_id: [STANDARD_PHOTO_REQUEST, ADVANCED_PHOTO_REQUEST] },
      }],
    });

    if (!photoRequest) {
      return res.status(400).json({ message: 'Please check and update the Photo Request Status !' });
    }

    if (!pkg.weight) {
      return res.status(400).json({ message: 'Please update weight of the package' });
    }

    if (!pkg.price_amount) {
      return res.status(400).json({ message: 'Please update package value' });
    }
  } else if ([STANDARD_PHOTO_REQUEST, ADVANCED_PHOTO_REQUEST].includes(req.body.state_id)) {
    const { id: packageId } = req.params;
    const { type } = req.body;
    const IS_BASIC_PHOTO = type === 'standard_photo';

    const CHARGE = IS_BASIC_PHOTO ? STANDARD_PHOTO : ADVANCED_PHOTO;
    const REVEW_TEXT = IS_BASIC_PHOTO ? 'Basic' : 'Advanced';
    let status = '';

    if (!packageId && !Number(packageId)) {
      return res.status(400).json({ message: 'arg:package_id missing.' });
    }

    const packg = await Package
      .find({
        attributes: ['id'],
        where: { id: packageId },
        include: [{
          model: PackageItem,
          attributes: ['object', 'object_advanced'],
        }],
      });

    if (!packg) return res.status(400).json({ message: 'Package not found.' });

    // Todo: picking only one item
    const photoRequest = await PhotoRequest
      .find({
        attributes: ['id'],
        where: {
          package_id: packageId,
          type: IS_BASIC_PHOTO ? BASIC : ADVANCED,
        },
      });

    if (photoRequest) {
      return res.json({ message: `Already ${REVEW_TEXT} photo requested` });
    }

    PhotoRequest.create({
      package_id: packageId,
      type: IS_BASIC_PHOTO ? BASIC : ADVANCED,
      status: COMPLETED,
      charge_amount: CHARGE,
    });

    PackageCharge
      .upsert({ id: packageId, [`${type}_amount`]: CHARGE });

    if (!IS_BASIC_PHOTO) {
      status = !packg.PackageItems[0].object_advanced
        ? 'pending'
        : 'completed';
    } else {
      status = 'completed';
    }

    if (status === 'completed') {
      return res
        .json({
          error: '0',
          status,
          photos: packg.object,
        });
    }
  }

  return updateState({
    pkg,
    actingUser: req.user,
    nextStateId: req.body.state_id,
    comments: req.body.comments,
  })
    .then(status => res.json(status))
    .catch(next);
};

exports.facets = (req, res, next) => Package
  .findById(req.params.id)
  .then(pkg => updateState({
    pkg,
    actingUser: req.user,
    nextStateId: req.body.state_id,
  })
    .then(status => res.json(status)))
  .catch(next);

exports.update = (req, res, next) => {
  const allowed = [
    'store_id',
    'invoice_code',
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

exports.destroy = async (req, res) => {
  const { id } = req.params;
  await PackageItem
    .destroy({ where: { package_id: id } });
  await PackageCharge
    .destroy({ where: { id } });
  await PhotoRequest
    .destroy({ where: { package_id: id } });
  await Package
    .destroy({ where: { id } });
  res.status(200).json({ message: 'Deleted successfully' });
};

exports.unread = async (req, res) => {
  const { id } = req.params;
  const status = await Package.update({ admin_read: false }, { where: { id } });
  return res.json(status);
};

exports.addNote = async (req, res) => {
  const { id } = req.params;
  await Package
    .update(req.body, { where: { id } });
  return res.json({ message: 'Note updated to your package' });
};


exports.invoice = async (req, res, next) => {
  const { id } = req.params;
  const { object } = req.body;

  try {
    const pkg = await Package
      .findById(id, { attributes: ['id', 'customer_id'] });

    if (!pkg) return res.status(400).end();

    Package
      .update({ invoice: object }, { where: { id } });

    updateState({
      pkg,
      actingUser: req.user,
      nextStateId: IN_REVIEW,
      comments: 'Cusotmer Uploaded Invoice',
    });

    return res.json({ message: 'Invoice updated succesfully' });
  } catch (err) {
    return next(err);
  }
};

exports.damaged = async (req, res) => {
  const { packageIds } = req.query;

  await PackageState
    .findAll({
      attributes: ['id', 'package_id'],
      where: { package_id: packageIds.split(','), state_id: DAMAGED },
    }).then(packageStates =>
      res.json({ packageStates }));
};
