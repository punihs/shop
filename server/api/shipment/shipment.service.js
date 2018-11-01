const debug = require('debug');
const sequelize = require('sequelize');

const {
  Shipment, User, Locker, ShipmentState, Address, ShipmentMeta,
  Package, Country, PhotoRequest, State,
  PackageItem, PackageCharge, Store,
} = require('../../conn/sqldb');

const {
  APPS, GROUPS: { OPS, CUSTOMER },
  SHIPMENT_STATE_IDS: {
    PAYMENT_COMPLETED, PAYMENT_FAILED, PAYMENT_REQUESTED,
  },
} = require('./../../config/constants');

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
      },
      //   {
      //   model: PaymentGateway,
      //   attributes: ['id', 'value'],
      // }
      {
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


exports.show = async (req, res) => {
  const customerId = req.user.id;
  const { orderCode } = req.params;

  const optionsShipment = {
    attributes: ['id', 'package_level_charges_amount', 'weight', 'final_weight', 'pick_up_charge_amount', 'address',
      'discount_amount', 'estimated_amount', 'packages_count', 'sub_total_amount', 'customer_name', 'customer_id',
      'value_amount', 'phone', 'is_axis_banned_item', 'order_code', 'shipment_state_id'],
    where: {
      customer_id: customerId,
      order_code: orderCode,
    },
    include: [{
      model: ShipmentMeta,
      attributes: ['id', 'repacking_charge_amount', 'sticker_charge_amount', 'extra_packing_charge_amount', 'original_ship_box_charge__amount',
        'consolidation_charge_amount', 'gift_wrap_charge_amount', 'gift_note_charge_amount', 'insurance_amount',
        'liquid_charge_amount', 'overweight_charge_amount', 'shipment_id'],
    }, {
      model: User,
      as: 'Customer',
      attributes: ['wallet_balance_amount'],
    }, {
      model: ShipmentState,
      attributes: ['id', 'shipment_id'],
      where: { state_id: [PAYMENT_REQUESTED, PAYMENT_FAILED, PAYMENT_COMPLETED] },
    }],
  };

  const shipment = await Shipment
    .find(optionsShipment);

  if (!shipment) {
    return res.status(400).json({ message: 'shipment not found' });
  }

  const optionsPackage = {
    attributes: ['id', 'price_amount', 'weight',
      'invoice_code', 'store_id'],
    where: {
      customer_id: customerId,
      shipment_id: shipment.id,
    },
    include: [{
      model: PackageItem,
      attributes: ['name', 'quantity', 'price_amount', 'object_advanced', 'object'],
    }, {
      model: PackageCharge,
      attributes: ['storage_amount', 'receive_mail_amount', 'pickup_amount', 'standard_photo_amount', 'scan_document_amount',
        'wrong_address_amount', 'special_handling_amount', 'advanced_photo_amount', 'split_package_amount'],
    }, {
      model: Store,
      attributes: ['name'],
    }, {
      model: PhotoRequest,
      attributes: ['id', 'type', 'status'],
    }],
  };
  const packages = await Package
    .findAll(optionsPackage);

  // const amount = shipment.estimated_amount;
  const estimated = shipment.estimated_amount;
  // const estimated = shipment.estimated_amount - shipment.package_level_charges_amount;
  const paymentGatewayId = req.query.payment_gateway_id ?
    Number(req.query.payment_gateway_id) : null;

  const payment = {
    amount: estimated,
    payment_gateway_id: paymentGatewayId,
  };

  return res.json({
    shipment,
    packages,
    payment,
  });
  // getWallet({ estimated });
};
