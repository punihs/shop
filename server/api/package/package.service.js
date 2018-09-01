const debug = require('debug');
const sequelize = require('sequelize');

const {
  Package, Store, User, Locker, PackageState, PackageItem, PhotoRequest,
  State, ShipmentState, Shipment,
} = require('../../conn/sqldb');

const {
  APPS, GROUPS: { CUSTOMER, OPS },
  SHIPMENT_STATE_IDS: { PAYMENT_FAILED, PAYMENT_REQUESTED, PAYMENT_INITIATED },
} = require('./../../config/constants');
const BUCKETS = require('./../../config/constants/buckets');

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
  const options = {
    where: {},
    offset: Number(query.offset) || 0,
    limit: Number(query.limit) || 20,
  };

  switch (true) {
    case (actingUser.app_id === APPS.MEMBER && actingUser.group_id === CUSTOMER): {
      options.attributes = ['id', 'created_at', 'weight', 'price_amount', 'store_id', 'content_type'];
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
        attributes: ['id', 'name', 'price_amount', 'quantity', 'total_amount'],
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
      options.attributes = ['id', 'customer_id', 'created_at', 'weight', 'price_amount', 'store_id'];
      options.include = [{
        where: {},
        model: PackageState,
        attributes: ['id', 'state_id'],
      }, {
        model: Store,
        attributes: ['id', 'name'],
      }];

      if (!IS_CUSTOMER_PAGE) {
        options.include.push({
          model: User,
          as: 'Customer',
          attributes: ['id', 'name', 'virtual_address_code', 'first_name', 'last_name', 'salutation'],
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
  const stateIds = [PAYMENT_FAILED, PAYMENT_REQUESTED, PAYMENT_INITIATED];

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
          include: [{
            model: ShipmentState,
            where: { state_id: stateIds },
          }],
        }),
    ])
    .then(([packages, total, facets, queueCount]) => ({
      packages: packages
        .map(x => (x.PackageState ? ({ ...x.toJSON(), state_id: x.PackageState.state_id }) : x)),
      total,
      facets: {
        state_id: kvmap(facets, 'state_id', 'cnt'),
      },
      queueCount,
    }));
};
