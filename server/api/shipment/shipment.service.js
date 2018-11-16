const debug = require('debug');
const moment = require('moment');
const sequelize = require('sequelize');

const logger = require('../../components/logger');
const hookshot = require('./shipment.hookshot');

const log = debug('s.api.shipment.controller');
const { updateState } = require('../package/package.service');

const {
  Shipment, User, Locker, ShipmentState, Address, ShipmentMeta,
  Package, Country, PhotoRequest, State, INQUEUE,
  PackageItem, PackageCharge, Store,
} = require('../../conn/sqldb');

const {
  APPS, GROUPS: { OPS, CUSTOMER },
  SHIPMENT_STATE_IDS: {
    PAYMENT_COMPLETED, PAYMENT_FAILED, PAYMENT_REQUESTED, SHIPMENT_CANCELLED,
    DISPATCHED, DELIVERED, INTRANSIT, CUSTOM_HOLD, LOST, WRONG_DELIVERY, PAYMENT_CONFIRMED,
  },
  PACKAGE_STATE_IDS: { READY_TO_SHIP, DAMAGED },
} = require('./../../config/constants');

// const {
//   // TRANSACTION_TYPES: { CREDIT },
//   SHIPMENT_STATE_IDS: {
//     INQUEUE, INREVIEW, DISPATCHED, DELIVERED, CANCELED, SHIPMENT_CANCELLED,
//     INTRANSIT, CUSTOM_HOLD, LOST, WRONG_DELIVERY, PAYMENT_CONFIRMED,
//     // SHIPMENT_HANDED,
//   },
// } = require('../../config/constants');

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
        'country_id', 'tracking_code', 'shipping_carrier', 'tracking_url', 'customer_name'];
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

const stateIdcommentMap = {
  [INQUEUE]: 'shipment under queue after payment',
  // [INREVIEW]: 'shipment under review by shoppre',
  [DISPATCHED]: 'Shipment is dispatched',
  [INTRANSIT]: 'intransit',
  [CUSTOM_HOLD]: 'custom_hold',
  [LOST]: 'lost',
  [DELIVERED]: 'Shipment is delivered',
  [DAMAGED]: 'damaged',
  [WRONG_DELIVERY]: 'wrong_delivery',
  [PAYMENT_CONFIRMED]: 'payment confirmed',
};

exports.updateShipmentState = async ({
  db,
  nextStateId,
  shipment,
  actingUser,
  comments = null,
}) => {
  log('updateShipmentState', nextStateId);
  log('shp', shipment);
  const options = {
    shipment_id: shipment.id,
    user_id: actingUser.id,
    state_id: nextStateId,
  };
  log({ options });
  if (stateIdcommentMap[nextStateId]) options.comments = stateIdcommentMap[nextStateId];
  if (comments) options.comments = comments || stateIdcommentMap[nextStateId];


  const shipmentState = await db.ShipmentState
    .create(options);
  switch (nextStateId) {
    case PAYMENT_CONFIRMED: {
      // - todo required for next iteration

      // const optionsLoyalty = {
      //   attributes: ['id', 'total_points', 'points', 'level'],
      //   where: { customer_Id: shipment.customer_id },
      // };
      // const loyaltyId = await db.LoyaltyPoint
      //   .find(optionsLoyalty);
      // log('loyaltyId', loyaltyId);
      // const loyalty = {};
      // let points = {};
      // log('level', loyaltyId.level);
      // if (loyaltyId.shipment_id !== 1) {
      //   if (loyaltyId.level === 1) {
      //     points = ((5 / 100) * shipment.final_amount);
      //   } else if (loyaltyId.level === 2) {
      //     points = ((8 / 100) * shipment.final_amount);
      //   } else if (loyaltyId.level === 3) {
      //     points = ((10 / 100) * shipment.final_amount);
      //   } else if (loyaltyId.level === 4) {
      //     points = ((12 / 100) * shipment.final_amount);
      //   }
      //   log('final amount', shipment.final_amount);
      //   log('level', loyaltyId.level);
      //   loyalty.points = loyaltyId.points + points;
      //   loyalty.total_points = loyaltyId.points + points;
      //
      //   if (loyaltyId.total_points < 1000) {
      //     loyaltyId.level = 1;
      //   } else if (loyaltyId.total_points >= 1000 && loyaltyId.total_points < 6000) {
      //     loyalty.level = 2;
      //   } else if (loyaltyId.total >= 6000 && loyaltyId.total < 26000) {
      //     loyalty.level = 3;
      //   } else if (loyaltyId.total >= 26000) {
      //     loyalty.level = 4;
      //   }
      //   loyalty.shipment_id = shipment.id;
      //   log({ loyalty });
      //   await db.LoyaltyPoint.update(loyalty, { where: { id: loyaltyId.id } });
      //
      //   const misclenious = {};
      //   misclenious.customer_id = shipment.customer_id;
      //   misclenious.description = 'Shipping Reward';
      //   misclenious.points = points;
      //   misclenious.type = REWARD;
      //   await db.LoyaltyHistory.create(misclenious);
      // }
      if (!shipment.tracking) {
        const tracking = {};
        tracking.dispatch_date = moment();
        tracking.number_of_packages = shipment.packages_count;
        tracking.weight_by_shipping_partner = shipment.final_weight;
        tracking.value_by_shipping_partner = shipment.value_amount;
        tracking.payment_status = 'success';
        await db.Shipment.update(tracking, { where: { id: shipment.id } });
      }

      shipment.getPackages()
        .then(packageItems => hookshot
          .stateChange({
            db,
            nextStateId,
            shipment,
            actingUser,
            packageItems,
          }))
        .catch(err => logger.error('statechange notification', nextStateId, shipment, err));

      break;
    }
    // case SHIPMENT_HANDED: {
    // log('state changed - shipment handed to partner', SHIPMENT_HANDED);
    // if (shipment.tracking_code) {
    // - Todo:  add this code before creating state
    // const tracking = shipment.tracking_code;
    // if (!shipment.dispatch_date || !shipment.shipping_carrier
    // || !shipment.number_of_packages ||
    //   !shipment.weight_by_shipping_partner ||
    //   !shipment.value_by_shipping_partner || !shipment.tracking_code) {
    //   return res.json({ error:
    // 'You must update Shipment Tracking Information to send dispatch notification!' });
    // }
    // $shpmnt->shipping_status = 'dispatched';

    // const couponAppliedStatus = await db.Redemption
    //   .update({ status: 'success' }, { where: { shipment_order_code: shipment.order_code } });
    //
    // let promo = '';
    // if (couponAppliedStatus) {
    //   promo = await db.Coupon
    //     .find(
    //       { attributes: ['id', 'cashback_percentage', 'max_cashback_amount'] },
    //       { where: { code: couponAppliedStatus.coupon_code } },
    //     );
    //
    //   if (promo) {
    //     // const optionCashBack = {
    //     //   attributes: ['wallet_balance_amount'],
    //     //   where: { id: actingUser.id },
    //     // }
    //     if (promo.cashback_percentage) {
    //       // await db.User(optionCashBack)
    //       //   .then(total_wallet_amount => {
    //       const cashbackAmount =
    //           shipment.estimated_amount * (promo.cashback_percentage / 100);
    //       const maxCouponAmount = promo.max_cashback_amount || 0;
    //       let totalCashbackAmount = 0;
    //       if (cashbackAmount <= maxCouponAmount) {
    //         totalCashbackAmount = cashbackAmount;
    //       } else {
    //         totalCashbackAmount = maxCouponAmount;
    //       }
    //       const transaction = {};
    //       transaction.customer_id = actingUser.customer_id;
    //       transaction.amount = totalCashbackAmount;
    //       transaction.type = CREDIT;
    //       transaction.description =
    // `Wallet transactions for coupon code | Shipment ID  ${shipment.order_code}`;
    //       // });
    //     }
    //   }
    // }
    // if(!in_array('ship_dispatched', $shipmails)){
    //   $this->mailerShipping($shipRqst->id, 'ship_dispatched');
    // }
    // } else {
    // return redirect()->back()->with('error',
    // 'You must update Shipment Tracking Information to send dispatch notification!');
    // }


    //   break;
    // }
    case SHIPMENT_CANCELLED: {
      log('state changed CANCELLED', SHIPMENT_CANCELLED);

      const packages = db.Package
        .findAll({
          attributes: ['id'],
          where: {
            shipment_id: shipment.id,
          },
        });

      if (packages) {
        packages.map(pkg => updateState({
          db,
          pkg,
          actingUser,
          nextStateId: READY_TO_SHIP,
        }));
      }

      db.Package.update(
        { shipment_id: null },
        {
          where: { shipment_id: shipment.id },
        },
      );

      // Mail::to($customer->email)->send(new ShipmentCancelled($packages, $shipRqst));
      break;
    }
    case INQUEUE: {
      shipment.getPackages()
        .then(packages => hookshot
          .stateChange({
            db,
            nextStateId,
            shipment,
            actingUser,
            packages,
          }))
        .catch(err => logger.error('statechange notification', nextStateId, shipment, err));
      break;
    }
    default: {
      log('state changed default');
    }
  }
  hookshot
    .stateChange({
      db,
      nextStateId,
      shipment,
      actingUser,
      packages: [],
    });

  log('shipmentState', shipmentState.id);
  return db.Shipment
    .update({
      shipment_state_id: shipmentState.id,
    }, {
      where: { id: shipment.id },
    });
};
