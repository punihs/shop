const debug = require('debug');
const moment = require('moment');
const sequelize = require('sequelize');
const request = require('request');
const hookshot = require('./shipment.hookshot');

const log = debug('s.api.shipment.controller');
const { updateState } = require('../package/package.service');
const cashback = require('../shipment/components/cashback');
const transactionCtrl = require('../transaction/transaction.controller');
const {
  SUPPORT_EMAIL_ID, SUPPORT_EMAIL_FIRST_NAME, SUPPORT_EMAIL_LAST_NAME,
} = require('../../config/environment');

const {
  Shipment, User, Locker, ShipmentState, Address, ShipmentMeta,
  Package, Country, PhotoRequest, State, INQUEUE,
  PackageItem, PackageCharge, Store,
} = require('../../conn/sqldb');

const {
  APPS, GROUPS: { OPS, CUSTOMER },
  SHIPMENT_STATE_IDS: {
    PAYMENT_COMPLETED, PAYMENT_FAILED, PAYMENT_REQUESTED, SHIPMENT_CANCELLED, SHIPMENT_DELIVERED,
    DISPATCHED, DELIVERED, INTRANSIT, CUSTOM_HOLD, LOST, SHIPMENT_HANDED, PAYMENT_CONFIRMED,
  },
  PACKAGE_STATE_IDS: { READY_TO_SHIP, DAMAGED },
  PAYMENT_GATEWAY: {
    WIRE, CASH, CARD, PAYTM, PAYPAL, WALLET, RAZOR,
  },
  PAYMENT_GATEWAY_NAMES,
} = require('./../../config/constants');


const BUCKETS = require('./../../config/constants/buckets');

const kvmap = (arr, key, value) => arr.reduce((nxt, x) => ({ ...nxt, [x[key]]: x[value] }), {});

exports.index = async ({
  params, query, user: actingUser, next,
}) => {
  try {
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
        break;
      }
    }

    const states = Object.keys(BUCKET);

    if (query.sid) options.include[0].where.state_id = query.sid.split(',');
    else if (states.includes(bucket) && options.include && options.include.length) {
      options.include[0].where.state_id = BUCKET[bucket];
    }

    const shipments = await Shipment
      .findAll(options);

    const total = await Shipment
      .count({ where: options.where, include: options.include });

    const facets = await ShipmentState
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
      });

    return {
      shipments: shipments
        .map(x => (x.ShipmentState ? ({ ...x.toJSON(), state_id: x.ShipmentState.state_id }) : x)),
      total,
      facets: {
        state_id: kvmap(facets, 'state_id', 'cnt'),
      },
    };
  } catch (err) {
    return next(err);
  }
};


exports.show = async (req, res, next) => {
  try {
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
          'consolidation_charge_amount', 'gift_wrap_charge_amount', 'gift_note_charge_amount', 'insurance_amount', 'other_charge_amount',
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

    let estimated = shipment.estimated_amount;

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
  } catch (err) {
    return next(err);
  }
};

const stateIdcommentMap = {
  [INQUEUE]: 'shipment under queue after payment',
  [DISPATCHED]: 'Shipment is dispatched',
  [INTRANSIT]: 'intransit',
  [CUSTOM_HOLD]: 'custom_hold',
  [LOST]: 'lost',
  [DELIVERED]: 'Shipment is delivered',
  [DAMAGED]: 'damaged',
  [PAYMENT_CONFIRMED]: 'payment confirmed',
};

exports.updateShipmentState = async ({
  nextStateId,
  shipment: current,
  actingUser,
  comments = null,
  next,
}) => {
  try {
    log('updateShipmentState', nextStateId);
    let paymentGatewayID = 0;

    const shipment = current;
    log('shp', shipment);

    const options = {
      shipment_id: shipment.id,
      user_id: actingUser.id,
      state_id: nextStateId,
    };

    log({ options });

    if (stateIdcommentMap[nextStateId]) options.comments = stateIdcommentMap[nextStateId];

    if (comments) options.comments = comments || stateIdcommentMap[nextStateId];

    const shipmentState = await ShipmentState
      .create(options);

    switch (nextStateId) {
      case PAYMENT_CONFIRMED: {
        const {
          payment_gateway_id,
          final_amount: finalAmount,
          loyalty_amount: loyaltyAmount,
          wallet_amount: walletAmount,
        } = await this.transaction(shipment);

        paymentGatewayID = payment_gateway_id;

        log({ payment_gateway_id, finalAmount, loyaltyAmount });

        if (paymentGatewayID == CASH || paymentGatewayID == WIRE) {
          if (walletAmount < 0) {
            await transactionCtrl.setWallet({
              customer_id: shipment.customer_id,
              amount: -walletAmount,
              description: `Wallet Amount deducted for shipment ${shipment.id}`,
            });
          }
        }

        await transactionCtrl
          .addLoyalty({
            customer_id: shipment.customer_id,
            finalAmount,
          });

        if (!shipment.tracking) {
          const tracking = {};
          tracking.number_of_packages = shipment.packages_count;
          tracking.weight_by_shipping_partner = shipment.final_weight;
          tracking.value_by_shipping_partner = shipment.value_amount;
          tracking.payment_status = 'success';

          await Shipment.update(tracking, { where: { id: shipment.id } });
        }
        break;
      }
      case SHIPMENT_CANCELLED: {
        log('state changed CANCELLED', SHIPMENT_CANCELLED);

        const packages = await Package
          .findAll({
            attributes: ['id'],
            where: {
              shipment_id: shipment.id,
            },
          });

        if (packages) {
          packages.map(pkg => updateState({
            pkg,
            actingUser,
            nextStateId: READY_TO_SHIP,
          }));
        }

        Package.update(
          { shipment_id: null },
          {
            where: { shipment_id: shipment.id },
          },
        );
        break;
      } case SHIPMENT_HANDED: {
        const {
          payment_gateway_id,
          cashback_amount: cashbackAmount,
          loyalty_amount: loyaltyAmount,
        } = await this.transaction(shipment);

        log({ cashbackAmount, loyaltyAmount });

        log({ paymentGatewayID });

        paymentGatewayID = payment_gateway_id;

        log('state changed SHIPMENT_HANDED', SHIPMENT_HANDED);
        log({ cashbackAmount });

        if (cashbackAmount > 0) {
          await transactionCtrl
            .setWallet({
              customer_id: shipment.customer_id,
              amount: cashbackAmount,
              description: `CashBack for Shipment id ${shipment.id}`,
            });
        }

        if (paymentGatewayID === CASH ||
          paymentGatewayID === WIRE) {
          if (loyaltyAmount > 0) {
            await transactionCtrl
              .setLoyalty({
                customer_id: shipment.customer_id,
                loyaltyAmount,
              });
          }
        }
        await Shipment.update(
          { dispatch_date: moment() },
          { where: { id: shipment.id } },
        );

        const shipmentDispacthed = await Shipment
          .find({
            attributes: ['country_id', 'dispatch_date', 'tracking_code'],
            where: { id: shipment.id },
            include: [{
              model: User,
              as: 'Customer',
              attributes: ['first_name', 'last_name', 'email'],
            }, {
              model: Country,
              attributes: ['name'],
            }],
          });

        this.asanaTask(shipmentDispacthed);
        break;
      }
      default: {
        log('state changed default');
      }
    }

    let gateway = null;

    if (Number(nextStateId) === Number(SHIPMENT_DELIVERED)) {
      shipment.delivered_date = moment();
    }

    switch (Number(paymentGatewayID)) {
      case CASH: {
        gateway = PAYMENT_GATEWAY_NAMES.CASH; break;
      }
      case CARD: {
        gateway = PAYMENT_GATEWAY_NAMES.CARD; break;
      }
      case WIRE: {
        gateway = PAYMENT_GATEWAY_NAMES.WIRE; break;
      }
      case PAYPAL: {
        gateway = PAYMENT_GATEWAY_NAMES.PAYPAL; break;
      }
      case PAYTM: {
        gateway = PAYMENT_GATEWAY_NAMES.PAYTM; break;
      }
      case WALLET: {
        gateway = PAYMENT_GATEWAY_NAMES.WALLET; break;
      }
      case RAZOR: {
        gateway = PAYMENT_GATEWAY_NAMES.RAZOR; break;
      }
      default: {
        gateway = null; break;
      }
    }

    const paymentGateway = {
      name: gateway,
    };

    const { address } = shipment;
    log('gateway', [gateway]);

    const IS_CUSTOMER = actingUser.group_id === CUSTOMER;
    let opsUser = null;

    if (IS_CUSTOMER) {
      opsUser = {
        first_name: SUPPORT_EMAIL_FIRST_NAME,
        last_name: SUPPORT_EMAIL_LAST_NAME,
        email: SUPPORT_EMAIL_ID,
      };
    } else {
      opsUser = actingUser;
    }

    hookshot
      .stateChange({
        nextStateId,
        shipment,
        actingUser: opsUser,
        packages: [],
        gateway,
        paymentGateway,
        address,
        next,
      });

    log('shipmentState', shipmentState.id);

    return Shipment
      .update({
        shipment_state_id: shipmentState.id,
      }, {
        where: { id: shipment.id },
      });
  } catch (err) {
    return next();
  }
};

exports.asanaTask = (shipment) => {
  const bearer = '0/ba27afb04779fc44282d1f5c2f97b866';
  const name = `${shipment.Customer.first_name} to ${shipment.Country.name}`;
  const notes = `Dispatch date ${shipment.dispatch_date},\nTracking ID= ${shipment.tracking_code} `;

  const options = {
    method: 'POST',
    url: 'https://app.asana.com/api/1.0/tasks',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'postman-token': '3da371ea-f20d-3bde-ee75-7e6e7a107407',
      'cache-control': 'no-cache',
      authorization: `Bearer ${bearer}`,
    },
    form: {
      notes: notes,
      projects: '1109255069338501',
      name: name,
      workspace: '413352110377780',
    },
  };

  request(options, (error, response, body) => {
    if (error) throw new Error(error);

    log(body);
  });
}

exports.transaction = async (shipment) => {
  const transaction = await cashback
    .transaction({
      object_id: shipment.order_code,
      customer_id: shipment.customer_id,
      transactionId: shipment.transaction_id,
    });

  return transaction;
};
