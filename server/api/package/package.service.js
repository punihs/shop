const debug = require('debug');
const sequelize = require('sequelize');

const {
  Package, Store, User, Locker, PackageState,
} = require('../../conn/sqldb');

const { PACKAGE_STATE_IDS, APPS, GROUPS: { CUSTOMER, OPS } } = require('./../../config/constants');

const log = debug('s-api-package-service');

const buckets = {
  PROCESSING: [1, 2],
  VALUES: [2],
  REVIEW: [3],
  INREVIEW: [5],
  DELIVERED: [4],
  ALL: Object.values(PACKAGE_STATE_IDS),
};

const kvmap = (arr, key, value) => arr.reduce((nxt, x) => ({ ...nxt, [x[key]]: x[value] }), {});

exports.index = ({ query, user: actingUser }) => {
  log('index', { groupId: actingUser.group_id, app_id: actingUser.app_id });
  const { status } = query;
  const options = {
    where: {},
    offset: Number(query.offset) || 0,
    limit: Number(query.limit) || 20,
  };

  switch (true) {
    case (actingUser.app_id === APPS.OPS && actingUser.group_id === OPS): {
      options.attributes = ['id', 'created_at'];
      options.where.customer_id = actingUser.id;
      break;
    }
    case (actingUser.app_id === APPS.MEMBER && actingUser.group_id === CUSTOMER): {
      options.attributes = ['id', 'customer_id', 'created_at'];
      options.where.customer_id = actingUser.id;
      options.include = [{
        where: {},
        model: PackageState,
        attributes: ['id', 'state_id'],
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
      }];
      break;
    }
    default: {
      options.attributes = ['id', 'price_amount', 'weight', 'store_id'];
      options.where = {
        is_public: true,
      };

      options.include = [{
        model: Store,
        attributes: ['id', 'name'],
      }];

      break;
    }
  }

  const states = Object.keys(buckets);
  if (query.sid) options.include[0].where.state_id = query.sid.split(',');
  else if (states.includes(status) && options.include && options.include.length) {
    options.include[0].where.state_id = buckets[status];
  }

  return Promise
    .all([
      Package
        .findAll(options),
      Package
        .count({ where: options.where, include: options.include }),
      PackageState
        .findAll({
          attributes: [[sequelize.fn('count', 1), 'cnt'], 'state_id'],
          where: { state_id: buckets[status] },
          include: [{
            where: options.where,
            model: Package,
            attributes: [],
          }],
          group: ['state_id'],
          raw: true,
        }),
    ])
    .then(([packages, total, facets]) => ({
      packages: packages.map(x => ({ ...x.toJSON(), state_id: x.PackageState.state_id })),
      total,
      facets: {
        state_id: kvmap(facets, 'state_id', 'cnt'),
      },
    }));
};
