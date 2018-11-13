const debug = require('debug');
const sequelize = require('sequelize');

const {
  APPS, GROUPS: { CUSTOMER, OPS },
  SHIPMENT_STATE_IDS: {
    PAYMENT_FAILED, PAYMENT_REQUESTED, PAYMENT_INITIATED,
    PAYMENT_COMPLETED, PAYMENT_CONFIRMED, PACKAGING_REQUESTED, UPSTREAM_SHIPMENT_REQUEST_CREATED,
  },
  PACKAGE_STATE_IDS: {
    PACKAGE_ITEMS_UPLOAD_PENDING, SPLIT_PACKAGE_PROCESSED, AWAITING_VERIFICATION, IN_REVIEW,
    READY_TO_SHIP, ADDED_SHIPMENT,
  },
} = require('./../../config/constants');
const {
  PACKAGE: {
    SPLIT_PACKAGE,
    // RETURN,
  },
} = require('../../config/constants/charges');
const BUCKETS = require('./../../config/constants/buckets');

const logger = require('../../components/logger');

const {
  Package, Store, User, Locker, PackageState, PackageItem, PhotoRequest,
  State, ShipmentState, Shipment,
} = require('../../conn/sqldb');

const hookshot = require('./package.hookshot');

const stateIdcommentMap = {
  [PACKAGE_ITEMS_UPLOAD_PENDING]: 'Package Recieved',
  [SPLIT_PACKAGE_PROCESSED]: 'Package Splitted!', // email sending is pending
};


const log = debug('s-api-package-service');

const kvmap = (arr, key, value) => arr.reduce((nxt, x) => ({ ...nxt, [x[key]]: x[value] }), {});

exports.index = ({ query, params, user: actingUser }) => {
  log('index', { groupId: actingUser.group_id, app_id: actingUser.app_id });
  log({ BUCKETS });

  // - Locker Page or Member Dashboard
  const IS_CUSTOMER_PAGE = !!params.customerId;
  const BUCKET = BUCKETS.PACKAGE[actingUser.group_id];
  log({ BUCKET });
  log({ actingUser });
  const { bucket } = query;
  let orderSort = '';
  if (query.sort) {
    const [field, order] = query.sort.split(' ');
    log({ field, order });
    if (field && order) {
      orderSort = [[field, order]];
    } else {
      orderSort = [['id', 'desc']];
    }
  } else {
    orderSort = [['id', 'desc']];
  }

  const options = {
    where: {},
    order: orderSort,
    offset: Number(query.offset) || 0,
    limit: Number(query.limit) || 20,
  };

  switch (true) {
    case (actingUser.app_id === APPS.MEMBER && actingUser.group_id === CUSTOMER): {
      options.attributes = ['id', 'created_at', 'weight', 'price_amount',
        'store_id', 'content_type', 'invoice_code', 'notes'];
      options.where.customer_id = actingUser.id;
      options.include = [{
        where: {},
        model: PackageState,
        attributes: ['id', 'state_id'],
        include: [{
          model: State,
          attributes: ['id', 'name'],
        }],
      }, {
        model: PackageItem,
        attributes: ['id', 'name', 'price_amount',
          'quantity', 'total_amount', 'object', 'object_advanced'],
      }, {
        model: Store,
        attributes: ['id', 'name'],
      }, {
        model: PhotoRequest,
        attributes: ['id', 'status', 'type'],
        // where: { status: COMPLETED },
      }];
      break;
    }
    case (actingUser.app_id === APPS.OPS && actingUser.group_id === OPS): {
      if (IS_CUSTOMER_PAGE) options.where.customer_id = params.customerId;
      options.attributes = ['id', 'customer_id', 'created_at', 'weight', 'price_amount', 'store_id', 'invoice_code',
        'content_type', 'updated_at'];
      options.include = [{
        where: {},
        model: PackageState,
        attributes: ['id', 'state_id'],
      }, {
        model: PackageItem,
        attributes: ['id', 'name', 'price_amount',
          'quantity', 'total_amount', 'object', 'object_advanced'],
      }, {
        model: Store,
        attributes: ['id', 'name'],
      }];

      if (!IS_CUSTOMER_PAGE) {
        options.include.push({
          model: User,
          as: 'Customer',
          attributes: ['id', 'name', 'virtual_address_code', 'first_name', 'last_name', 'salutation', 'profile_photo_url'],
          include: [{
            model: Locker,
            attributes: ['id', 'short_name', 'name'],
          }],
        });
      }
      break;
    }
    default:
      options.attributes = ['id', 'customer_id', 'created_at', 'weight', 'price_amount'];
  }

  const states = Object.keys(BUCKET);

  // - filters
  if (query.sid) {
    options.include[0].where.state_id = query.sid.split(',');
  } else if (states.includes(bucket) && options.include && options.include.length) {
    const AWAITING_VERIFICATION = 2;

    // - uploaded person can't do verification
    if (bucket === 'TASKS') {
      options.include[0].where = {
        $or: {
          state_id: BUCKET[bucket].filter(x => (x !== AWAITING_VERIFICATION)),
          $and: {
            state_id: AWAITING_VERIFICATION,
            $not: { user_id: actingUser.id },
          },
        },
      };
    } else if (bucket === 'FEEDBACK') {
      options.include[0].where = {
        $or: {
          state_id: BUCKET[bucket].filter(x => (x !== AWAITING_VERIFICATION)),
          $and: {
            state_id: AWAITING_VERIFICATION,
            user_id: actingUser.id,
          },
        },
      };
    } else {
      options.include[0].where.state_id = BUCKET[bucket];
    }
  }
  const stateIds = [
    PAYMENT_FAILED, PAYMENT_REQUESTED, PAYMENT_INITIATED,
    PAYMENT_COMPLETED, PAYMENT_CONFIRMED, PACKAGING_REQUESTED, UPSTREAM_SHIPMENT_REQUEST_CREATED,
  ];

  return Promise
    .all([
      Package
        .findAll(options),
      Package
        .count({ where: options.where, include: options.include }),
      !options.include
        ? Promise.resolve([])
        : PackageState
          .findAll({
            attributes: [[sequelize.fn('count', 1), 'cnt'], 'state_id'],
            where: { state_id: BUCKET[bucket] },
            include: [{
              where: options.where,
              model: Package,
              attributes: [],
            }],
            group: ['state_id'],
            raw: true,
          }),
      Shipment
        .count({
          where: { customer_id: actingUser.id },
          include: [{
            model: ShipmentState,
            where: { state_id: stateIds },
          }],
        }),
      Shipment
        .count({
          where: { customer_id: actingUser.id },
          include: [{
            model: ShipmentState,
            where: { state_id: [PAYMENT_REQUESTED, PAYMENT_INITIATED] },
          }],
        }),
      Package
        .findAll({
          attributes: ['id', 'package_state_id'],
          where: {
            customer_id: actingUser.id,
          },
        })
        .then(packages => PackageState
          .findAll({
            attributes: [[sequelize.fn('count', 1), 'cnt'], 'state_id'],
            where: {
              id: packages.map(x => x.package_state_id),
            },
            group: ['state_id'],
            raw: true,
          }))
        .then((packageStateGroups) => {
          // converting array to map for speedup
          const stateIdCountMap = kvmap(packageStateGroups, 'state_id', 'cnt');

          // grouping based on buckets
          const facets = Object
            .keys(BUCKET)
            .reduce((nxt, buck) => {
              const aggregate = BUCKET[buck]
                .reduce((nxty, stateId) => (nxty + (stateIdCountMap[stateId] || 0)), 0);

              return { ...nxt, [buck]: aggregate };
            }, {});
          return facets;
        }),

    ])
    .then(([packages, total, facets, queueCount, paymentCount, newfacets]) => ({
      packages: packages
        .map(x => (x.PackageState ? ({ ...x.toJSON(), state_id: x.PackageState.state_id }) : x)),
      total,
      facets: newfacets,
      oldfacets: facets,
      queueCount,
      paymentCount,
    }));
};
exports.updateState = ({
  db,
  lastStateId,
  nextStateId,
  pkg,
  actingUser,
  comments = null,
}) => {
  log('updateState', nextStateId, pkg, comments);
  const options = {
    package_id: pkg.id,
    user_id: actingUser.id,
    state_id: nextStateId,
  };
  if (stateIdcommentMap[nextStateId]) options.comments = stateIdcommentMap[nextStateId];
  if (comments) options.comments = comments || stateIdcommentMap[nextStateId];

  return db.PackageState
    .create(options)
    .then((packageState) => {
      switch (nextStateId) {
        case READY_TO_SHIP: {
          log('state changed', READY_TO_SHIP);
          // - Todo: check number of items validation
          // else if (itemCount !== pack.number_of_items) {
          //   return res.status(400).res.json({ message: 'please check your items !' });
          // }
          break;
        }
        case SPLIT_PACKAGE_PROCESSED: {
          db.PackageCharge
            .update(
              { split_package_amount: SPLIT_PACKAGE },
              { where: { id: pkg.id } },
            );
          break;
        }
        case PACKAGE_ITEMS_UPLOAD_PENDING: {
          log({ PACKAGE_ITEMS_UPLOAD_PENDING });
          db.Locker
            .allocation({ customerId: pkg.customer_id });
          break;
        }
        // case RETURN_PICKUP_DONE: {
        //   const transaction = {};
        //   const customerId = actingUser.id;
        //   transaction.type = DEBIT;
        //   transaction.customer_id = customerId;
        //   transaction.amount = RETURN;
        //   db.Transaction
        //     .create(transaction);
        //   break;
        // }
        default: {
          log('state changed default');
        }
      }

      if (!([IN_REVIEW, AWAITING_VERIFICATION, ADDED_SHIPMENT].includes(nextStateId))) {
        hookshot
          .stateChange({
            nextStateId,
            lastStateId,
            pkg,
            actingUser,
          })
          .catch(err => logger.error('statechange notification', nextStateId, pkg, err));
      }

      return db.Package
        .update({
          package_state_id: packageState.id,
        }, {
          where: { id: pkg.id },
        });
    });
};
