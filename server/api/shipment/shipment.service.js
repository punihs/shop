const debug = require('debug');
const sequelize = require('sequelize');

const {
  Shipment, User, Locker, ShipmentState, Address,
  Package, Country, PhotoRequest, State, PaymentGateway,
} = require('../../conn/sqldb');

const { APPS, GROUPS: { OPS, CUSTOMER } } = require('./../../config/constants');

const log = debug('s-api-shipment-service');
const BUCKETS = require('./../../config/constants/buckets');

const kvmap = (arr, key, value) => arr.reduce((nxt, x) => ({ ...nxt, [x[key]]: x[value] }), {});

exports.index = ({ params, query, user: actingUser }) => {
  log('index', { groupId: actingUser.group_id, app_id: actingUser.app_id });
  const { bucket } = query;
  const IS_CUSTOMER_PAGE = !!params.customerId;
  const BUCKET = BUCKETS.SHIPMENT[actingUser.group_id];
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
    case (actingUser.app_id === APPS.OPS && actingUser.group_id === OPS): {
      if (IS_CUSTOMER_PAGE) options.where.customer_id = params.customerId;
      options.attributes = ['id', 'customer_id', 'created_at', 'final_amount', 'final_weight', 'updated_at',
        'country_id', 'payment_gateway_id', 'tracking_code', 'shipping_carrier', 'tracking_url', 'customer_name'];
      options.include = [{
        where: {},
        model: ShipmentState,
        attributes: ['id', 'state_id', 'created_at'],
        include: [{
          model: State,
          attributes: ['id', 'name'],
        }],
      }, {
        model: Package,
        attributes: ['id'],
      }, {
        model: PaymentGateway,
        attributes: ['id', 'value'],
      }, {
        model: Country,
        attributes: ['id', 'name'],
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
        attributes: ['id', 'city'],
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
