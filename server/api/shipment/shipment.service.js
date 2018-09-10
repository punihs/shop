const debug = require('debug');
const sequelize = require('sequelize');

const {
  Shipment, User, Locker, ShipmentState, Address,
  Package, Country, PhotoRequest,
} = require('../../conn/sqldb');

const { APPS, GROUPS: { OPS, CUSTOMER } } = require('./../../config/constants');

const log = debug('s-api-shipment-service');
const BUCKETS = require('./../../config/constants/buckets');

const kvmap = (arr, key, value) => arr.reduce((nxt, x) => ({ ...nxt, [x[key]]: x[value] }), {});

exports.index = ({ params, query, user: actingUser }) => {
  log('index', { groupId: actingUser.group_id, app_id: actingUser.app_id });
  const { bucket } = query;
  const BUCKET = BUCKETS.SHIPMENT[actingUser.group_id];
  const options = {
    where: {},
    offset: Number(query.offset) || 0,
    limit: Number(query.limit) || 20,
  };
  switch (true) {
    case (actingUser.app_id === APPS.OPS && actingUser.group_id === OPS): {
      options.attributes = ['id', 'customer_id', 'created_at', 'final_amount'];
      options.include = [{
        where: {},
        model: ShipmentState,
        attributes: ['id', 'state_id'],
      }, {
        model: User,
        as: 'Customer',
        attributes: ['id', 'name', 'virtual_address_code', 'first_name',
          'last_name', 'salutation', 'profile_photo_url'],
        include: [{
          model: Locker,
          attributes: ['id', 'short_name', 'name'],
        }],
      }];
      break;
    }
    case (actingUser.app_id === APPS.MEMBER && actingUser.group_id === CUSTOMER): {
      if (params.shipmentId) options.where.shipment_id = params.shipmentId;
      options.attributes = ['id', 'customer_id', 'created_at', 'final_amount', 'address_id', 'country_id'];
      options.include = [{
        where: {},
        model: ShipmentState,
        attributes: ['id', 'state_id'],
      }, {
        model: Package,
        attributes: ['id'],
      }, {
        model: PhotoRequest,
        attributes: ['id', 'type', 'status'],
      }, {
        model: Address,
        attibutes: ['id', 'city'],
      }, {
        model: Country,
        attributes: ['id', 'name', 'iso2', 'iso3'],
      }, {
        model: User,
        as: 'Customer',
        attributes: ['id', 'name', 'virtual_address_code', 'first_name',
          'last_name', 'salutation', 'profile_photo_url'],
        include: [{
          model: Locker,
          attributes: ['id', 'short_name', 'name'],
        }],
      }];
      break;
    }
    default: {
      options.attributes = ['id', 'final_amount', 'weight', 'customer_id'];
      // options.include = [{
      //   model: Store,
      //   attributes: ['id', 'name'],
      // }];

      break;
    }
  }

  const states = Object.keys(BUCKET);
  if (query.sid) options.include[0].where.state_id = query.sid.split(',');
  else if (states.includes(bucket) && options.include && options.include.length) {
    options.include[0].where.state_id = BUCKET[bucket];
  }

  return Promise
    .all([
      Shipment
        .findAll(options),
      Shipment
        .count({ where: options.where, include: options.include }),
      ShipmentState
        .findAll({
          attributes: [[sequelize.fn('count', 1), 'cnt'], 'state_id'],
          where: { state_id: BUCKET[bucket] },
          include: [{
            where: options.where,
            model: Shipment,
            attributes: [],
          }],
          group: ['state_id'],
          raw: true,
        }),
    ])
    .then(([shipments, total, facets]) => ({
      shipments: shipments
        .map(x => (x.ShipmentState ? ({ ...x.toJSON(), state_id: x.ShipmentState.state_id }) : x)),
      total,
      facets: {
        state_id: kvmap(facets, 'state_id', 'cnt'),
      },
    }));
};
