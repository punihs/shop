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
    CUSTOMER_INPUT,
    UPLOAD_INVOICE_REQUESTED,
  },
  PHOTO_REQUEST_TYPES: { STANDARD, ADVANCED },
  PHOTO_REQUEST_STATES: { COMPLETED },
  GROUPS: { OPS, CUSTOMER },
  PACKAGE_TYPES: { INCOMING, PERSONAL_SHOPPER, COD },
} = require('../../config/constants');
const {
  PACKAGE: { STANDARD_PHOTO, ADVANCED_PHOTO },
} = require('../../config/constants/charges');
const { packageCreate } = require('./package.schema');

const db = require('../../conn/sqldb');

const { index, updateState, updatePackageOptions } = require('./package.service');
const { getPersonalShopperItems } = require('../package/item/item.service');

const {
  Package, PackageItem, User, Follower, PhotoRequest,
  Locker, Store, PackageState, Country, PackageCharge,
} = db;
const log = debug('package');

exports.index = async (req, res, next) => {
  try {
    const result = await index(req, next);

    log('testing all the requirements');

    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
};

exports.show = async (req, res, next) => {
  try {
    const { type } = req.query;
    const { id } = req.params;

    const options = {
      where: {},
    };

    if (type !== 'ps') {
      options.where.id = id;
    } else {
      options.where.order_code = id;
    }

    const pkg = await Package
      .findOne({
        attributes: req.query.fl
          ? req.query.fl.split(',')
          : ['id', 'customer_id', 'created_at', 'weight', 'content_type', 'store_id', 'price_amount',
            'personal_shopper_cost', 'delivery_charge', 'sales_tax', 'payment_gateway_fee', 'sub_total', 'transaction_id', 'buy_if_price_changed'],
        where: options.where,
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
      });

    if (!pkg) return res.status(404).end();

    return res.json({
      ...pkg.toJSON(),
      state_id: pkg.PackageState.state_id,
    });
  } catch (err) {
    return next(err);
  }
};

const addFollowers = async ({ userIds, objectId, next }) => {
  try {
    const followers = userIds
      .map(followerId => ({
        user_id: followerId,
        object_id: objectId,
      }));

    return await Follower
      .bulkCreate(followers);
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  log('create', req.body);

  switch (req.user.group_id) {
    case OPS: {
      try {
        const allowed = [
          'is_doc',
          'store_id',
          'invoice_code',
          'virtual_address_code',
          'weight',
          'price_amount',
          'customer_id',
          'content_type',
          'total_quantity',
        ];
        req.body.total_quantity = 0;

        const pkg = _.pick(req.body, allowed);

        // - Internal user
        pkg.created_by = req.user.id;
        pkg.package_type = INCOMING;

        const { id } = await Package
          .create(pkg);

        // - Async Todo: need to move to socket server
        await addFollowers({
          objectId: id,
          userIds: [
            req.user.id,
            req.body.customer_id,
          ],
          next,
        });

        const charges = { id };

        log('body', JSON.stringify(req.body));
        if (req.body.is_doc === true) {
          charges.receive_mail_amount = 0.00;
        }

        // - todo: now await and catch together
        await PackageCharge
          .create(charges);

        await updateState({
          lastStateId: null,
          nextStateId: PACKAGE_ITEMS_UPLOAD_PENDING,
          pkg: { ...pkg, id },
          actingUser: req.user,
          next,
        });

        return res
          .status(201)
          .json({ id });
      } catch (e) {
        return next(e);
      }
    }
    case CUSTOMER: {
      try {
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
        pkg.total_quantity = 0;

        if (!IS_OPS) pkg.customer_id = req.user.id;

        const pack = await Package
          .create(pkg);

        const { id } = pack;
        const charges = {
          id,
          receive_mail_amount: 0.00,
        };

        await PackageCharge
          .create(charges);

        await updateState({
          lastStateId: null,
          nextStateId: INCOMING_PACKAGE,
          pkg: { ...pack.toJSON(), ...pack.id },
          actingUser: req.user,
          comments: `Submitted Incoming Alert From ${req.body.store_name}`,
          next,
        });

        return res.status(201).json({ id });
      } catch (err) {
        return next(err);
      }
    }
    default: return next();
  }
};

exports.state = async (req, res, next) => {
  try {
    const stateId = Number(req.body.state_id);

    const pkg = await Package
      .findById(req.params.id, {
        raw: true,
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

    if ([READY_TO_SHIP, CUSTOMER_INPUT, UPLOAD_INVOICE_REQUESTED].includes(stateId)) {
      if (!pkg.weight) {
        return res.status(400).json({ message: 'Please update weight of the package' });
      }
    } else if ([READY_TO_SHIP].includes(stateId)) {
      if (!pkg.price_amount) {
        return res.status(400).json({ message: 'Please update package value' });
      }
    } else if ([STANDARD_PHOTO_REQUEST, ADVANCED_PHOTO_REQUEST].includes(stateId)) {
      const { id: packageId } = req.params;
      const { type } = req.body;
      const IS_STANDARD_PHOTO = type === 'standard_photo';

      const CHARGE = IS_STANDARD_PHOTO ? STANDARD_PHOTO : ADVANCED_PHOTO;
      const REVEW_TEXT = IS_STANDARD_PHOTO ? 'Standard' : 'Advanced';
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
            type: IS_STANDARD_PHOTO ? STANDARD : ADVANCED,
          },
        });

      if (photoRequest) {
        return res.json({ message: `Already ${REVEW_TEXT} photo requested` });
      }

      await PhotoRequest.create({
        package_id: packageId,
        type: IS_STANDARD_PHOTO ? STANDARD : ADVANCED,
        status: COMPLETED,
        charge_amount: CHARGE,
      });

      await PackageCharge
        .upsert({ id: packageId, [`${type}_amount`]: CHARGE });

      if (!IS_STANDARD_PHOTO) {
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
      next,
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
    'notes',
    'seller_invoice',
    'amount_paid',
  ];

  const { id: customerId } = req.user;

  try {
    const { type, shopperType } = req.query;
    const { id } = req.params;
    const body = req.body;

    const packageType = shopperType === 'cod' ? COD : PERSONAL_SHOPPER;

    const options = {
      where: {},
    };

    if (type === 'psCustomerSide') {
      const status = await updatePackageOptions(body);
      const packageItems = await getPersonalShopperItems(customerId, packageType);

      return res.json(packageItems);
    }

    if (type !== 'ps') {
      options.where.id = id;
    } else {
      options.where.order_code = id;
    }

    const pkg = _.pick(req.body, allowed);
    pkg.updated_by = customerId;

    await Package
      .update(pkg, { where: options.where });

    return res.json({ id });
  } catch (e) {
    return next(e);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const { id } = req.params;

    await PackageItem
      .destroy({ where: { package_id: id } });

    await PackageCharge
      .destroy({ where: { id } });

    await PhotoRequest
      .destroy({ where: { package_id: id } });

    await Package
      .destroy({ where: { id } });

    return res.json({ message: 'Deleted successfully' });
  } catch (err) {
    return next(err);
  }
};

exports.invoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { object } = req.body;

    const pkg = await Package
      .findById(id, { attributes: ['id', 'customer_id'] });

    if (!pkg) return res.status(400).end();

    await Package
      .update({ invoice: object }, { where: { id } });

    await updateState({
      pkg,
      actingUser: req.user,
      nextStateId: IN_REVIEW,
      comments: 'Cusotmer Uploaded Invoice',
      next,
    });

    return res.json({ message: 'Invoice updated succesfully' });
  } catch (err) {
    return next(err);
  }
};

exports.damaged = async (req, res, next) => {
  try {
    const { packageIds } = req.query;

    const packageStates = await PackageState
      .findAll({
        attributes: ['id', 'package_id'],
        where: { package_id: packageIds.split(','), state_id: DAMAGED },
      });

    return res.status(201).json({ packageStates });
  } catch (err) {
    return next();
  }
};
