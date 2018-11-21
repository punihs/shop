const _ = require('lodash');
const debug = require('debug');
const Ajv = require('ajv');

const {
  PACKAGE_STATE_IDS: {
    READY_TO_SHIP,
    PACKAGE_ITEMS_UPLOAD_PENDING,
    INCOMING_PACKAGE,
    STANDARD_PHOTO_REQUEST,
    ADVANCED_PHOTO_REQUEST,
    AWAITING_VERIFICATION,
    DAMAGED,
    IN_REVIEW,
  },
  PHOTO_REQUEST_TYPES: { BASIC, ADVANCED },
  PHOTO_REQUEST_STATES: { COMPLETED },
  GROUPS: { OPS, CUSTOMER },
  PACKAGE_TYPES: { INCOMING },
} = require('../../config/constants');
const {
  PACKAGE: { STANDARD_PHOTO, ADVANCED_PHOTO },
} = require('../../config/constants/charges');
const { packageCreate } = require('./package.schema');

const logger = require('../../components/logger');

const db = require('../../conn/sqldb');

const { index, updateState } = require('./package.service');

const {
  Package, PackageItem, User, Follower, PhotoRequest,
  Locker, Store, PackageState, Country, PackageCharge,
} = db;
const log = debug('package');

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
      return res.json({
        ...pkg.toJSON(),
        state_id: pkg.PackageState.state_id,
      });
    })
    .catch(next);
};

const addFollowers = ({ userIds, objectId }) => {
  const followers = userIds
    .map(followerId => ({
      user_id: followerId,
      object_id: objectId,
    }));

  Follower
    .bulkCreate(followers)
    .catch(err => logger
      .error({
        t: 'follower creation',
        e: err,
      }));
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

      // - Internal user
      pkg.created_by = req.user.id;
      pkg.package_type = INCOMING;

      try {
        const { id } = await Package
          .create(pkg);

        // - Async Todo: need to move to socket server
        addFollowers({
          objectId: id,
          userIds: [
            req.user.id,
            req.body.customer_id,
          ],
        });

        const charges = { id };

        log('body', JSON.stringify(req.body));
        if (req.body.is_doc === true) {
          charges.receive_mail_amount = 0.00;
        }

        // - todo: now await and catch together
        await PackageCharge
          .create(charges)
          .catch(e => logger.error({ e, b: req.body }));

        await updateState({
          lastStateId: null,
          nextStateId: PACKAGE_ITEMS_UPLOAD_PENDING,
          pkg: { ...pkg, id },
          actingUser: req.user,
        });

        return res
          .status(201)
          .json({ id });
      } catch (e) {
        return next(e);
      }
    }
    case CUSTOMER: {
      const IS_OPS = req.user.group_id === OPS;

      // - Validating input
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
          const charges = {
            id,
            receive_mail_amount: 0.00,
          };

          PackageCharge
            .create(charges);

          return Package
            .updateState({
              lastStateId: null,
              nextStateId: INCOMING_PACKAGE,
              pkg: { ...pack.toJSON(), ...pack.id },
              actingUser: req.user,
              comments: `Submitted Incoming Alert From ${req.body.store_name}`,
            })
            .then(() => res
              .status(201)
              .json({ id }));
        });
    }
    default: return next();
  }
};

exports.state = async (req, res, next) => {
  try {
    const stateId = Number(req.body.state_id);
    const pkg = await Package
      .findById(req.params.id, {
        attributes: ['id', 'weight', 'price_amount'],
      });

    if ([AWAITING_VERIFICATION, DAMAGED].includes(stateId)) {
      const packageItemCount = await PackageItem
        .count({
          where: { package_id: req.params.id },
        });

      if (!packageItemCount) {
        return res.status(400).json({ message: 'Package items is empty!' });
      }
    }

    if ([READY_TO_SHIP].includes(stateId)) {
      const photoRequest = Package
        .find({
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

    const status = await updateState({
      pkg,
      actingUser: req.user,
      nextStateId: stateId,
      comments: req.body.comments || req.body.message2 || req.body.message1,
    });

    return res.json(status);
  } catch (e) {
    return next(e);
  }
};

exports.update = async (req, res, next) => {
  const allowed = [
    'store_id',
    'invoice_code',
    'weight',
    'price_amount',
    'customer_id',
    'is_doc',
    'content_type',
  ];

  try {
    const { id } = req.params;
    const { id: customerId } = req.user;

    const pkg = _.pick(req.body, allowed);
    pkg.updated_by = customerId;

    await Package
      .update(pkg, { where: { id } });

    return res.json({ id });
  } catch (e) {
    return next(e);
  }
};

exports.destroy = async (req, res, next) => {
  const { id } = req.params;

  try {
    await PackageItem
      .destroy({ where: { package_id: id } });

    await PackageCharge
      .destroy({ where: { id } });

    await PhotoRequest
      .destroy({ where: { package_id: id } });

    await Package
      .destroy({ where: { id } });

    res.status(200).json({ message: 'Deleted successfully' });
  } catch (e) {
    next(e);
  }
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
