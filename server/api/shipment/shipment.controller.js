const debug = require('debug');
const moment = require('moment');
const _ = require('lodash');
const xlsx = require('node-xlsx');
const paytm = require('../../../server/api/paymentGateway/paytm/paytm.controller');
const axis = require('../../../server/api/paymentGateway/axis/axis.controller');
const paypal = require('../../../server/api/paymentGateway/paypal/paypal.controller');

const eventEmitter = require('../../conn/event');
const db = require('../../conn/sqldb');
const shipper = require('../../conn/shipper');

const {
  Country, Shipment, Package, Address, PackageCharge, ShipmentMeta, Notification, ShipmentIssue,
  PackageState, Redemption, Coupon, LoyaltyHistory, User, LoyaltyPoint, Transaction, Locker,
  ShipmentState, Store, ShipmentType, DHLLog,
  PackageItem, PhotoRequest, ShippingRate, PaymentGateway,
} = db;

const {
  TRANSACTION_TYPES: { DEBIT },
  SHIPMENT_STATE_ID_NAMES,
  SHIPMENT_STATE_IDS: {
    CANCELED, DELIVERED, DISPATCHED, SHIPMENT_HANDED, PACKAGING_REQUESTED,
    PAYMENT_COMPLETED, PAYMENT_FAILED, PAYMENT_REQUESTED,
  },
  PACKAGE_STATE_IDS: { READY_TO_SHIP },
  LOYALTY_TYPE: {
    REDEEM,
  },
  PAYMENT_GATEWAY: { WIRE, WALLET, CASH },
} = require('../../config/constants');
const BUCKETS = require('../../config/constants/buckets');

const { ADDED_TO_SHIPMENT } = require('../../config/constants/packageStates');

const log = debug('s.shipment.controller');
const { index } = require('./shipment.service');

exports.index = (req, res, next) => index(req)
  .then((result) => {
    if (req.query.xlsx) {
      const header = [
        'id', 'Store Name', 'Virtual Address Code', 'Status',
      ];
      const excel = xlsx.build([{
        name: 'Shipments',
        data: [header]
          .concat(result
            .Shipments
            .map(({
              id,
              Store: store,
              Customer,
              ShipmentState: shipmentState,
            }) => [
              id, store.name, Customer.virtual_address_code,
              SHIPMENT_STATE_ID_NAMES[shipmentState.state_id],
            ])),
      }]);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats');
      res.setHeader(
        'Content-disposition',
        `attachment; filename=Packages_${moment()
          .format('DD-MM-YYYY')}.xlsx`,
      );

      return res.end(excel, 'binary');
    }
    log({ result });
    return res.json(result);
  })
  .catch(next);

exports.show = async (req, res, next) => {
  log('show', req.query);
  return Shipment
    .findById(req.params.id, {
      attributes: req.query.fl
        ? req.query.fl.split(',')
        : ['id', 'customer_id', 'created_at', 'weight', 'packages_count'],
      include: [{
        model: ShipmentState,
        attributes: ['id', 'state_id'],
        required: false,
      }, {
        model: ShipmentType,
        attributes: ['id', 'name'],
      }, {
        attributes: ['id', 'weight', 'package_state_id', 'price_amount'],
        model: Package,
        include: [{
          model: Store,
          attributes: ['name'],
        }],
      }, {
        model: User,
        as: 'Customer',
        attributes: [
          'id', 'name', 'first_name', 'last_name', 'salutation', 'virtual_address_code',
          'mobile', 'phone', 'phone_code',
        ],
        include: [{
          model: Country,
          attributes: ['id', 'name', 'iso2'],
        }, {
          model: Locker,
          attributes: ['id', 'name', 'short_name', 'allocated_at'],
        }],
      }, {
        model: Country,
        attributes: ['id', 'name', 'iso2', 'iso3'],
      }, {
        model: Address,
        attributes: [
          'id', 'city', 'name', 'salutation', 'first_name', 'last_name', 'mobile', 'phone_code',
          'phone',
        ],
      }],
    })
    .then((shipment) => {
      if (!shipment) return res.status(404).end();

      return res.json({
        ...shipment.toJSON(),
        state_id: shipment.ShipmentState && shipment.ShipmentState.state_id,
      });
    })
    .catch(next);
};

exports.status = async (req, res, next) => Shipment
  .findById(req.params.id, {
    attributes: ['shipping_partner_id', 'tracking_code'],
    raw: true,
  })
  .then((shipment) => {
    log('status:shipment', shipment);
    return shipper[shipment.shipping_partner_id]
      .status(shipment.tracking_code)
      .then((result) => {
        log('result', result);
        return res
          .json({
            shipper: shipment.shipping_partner_id,
            result,
          });
      });
  })
  .catch(next);

exports.unread = async (req, res) => {
  const { id } = req.params;
  const status = await Shipment.update({ admin_read: false }, { where: { id } });
  return res.json(status);
};

exports.update = async (req, res) => {
  const { id } = req.params;

  const optionsMeta = {
    attributes: ['liquid_charge_amount', 'overweight_charge_amount', 'is_liquid'],
    where: { shipment_id: id },
  };

  const shipmentMeta = await ShipmentMeta
    .find(optionsMeta);
  const updateShipment = req.body;
  const updateMeta = {};

  let packageLevelCharges = '';
  log('liquid', shipmentMeta.is_liquid);
  if (shipmentMeta.is_liquid === '1') {
    packageLevelCharges -= shipmentMeta.liquid_charge_amount || 0;
    log('weight', req.body.weight);
    log({ packageLevelCharges });
    if (req.body.weight < 5) {
      updateMeta.liquid_charge_amount = 1392.40;
    } else if (req.body.weight >= 5 && req.body.weight < 10) {
      updateMeta.liquid_charge_amount = 3009.00;
    } else if (req.body.weight >= 10 && req.body.weight < 15) {
      updateMeta.liquid_charge_amount = 5369.00;
    }
    if (req.body.weight >= 15) {
      updateMeta.liquid_charge_amount = 7729.00;
    }
  }
  if (shipmentMeta.overweight === '1') {
    packageLevelCharges -= shipmentMeta.overweight_charge_amount || 0;
    if (req.body.weight > 30) {
      updateMeta.overweight_charge_amount = 2500.00;
    } else {
      updateMeta.overweight = '0';
      updateMeta.overweight_charge_amount = 0;
    }
  } else if (req.body.weight > 30) {
    updateMeta.overweight = '1';
    updateMeta.overweight_charge_amount = 2500.00;
  } else {
    updateMeta.overweight = '0';
    updateMeta.overweight_charge_amount = 0;
  }
  log(JSON.stringify(updateMeta));
  await ShipmentMeta.update(updateMeta, { where: { shipment_id: id } });
  packageLevelCharges = Number(packageLevelCharges);
  packageLevelCharges += Number(updateMeta.liquid_charge_amount) || 0;
  packageLevelCharges += Number(updateMeta.overweight_charge_amount) || 0;
  updateShipment.package_level_charges_amount = packageLevelCharges;

  const subTotalAmount = req.body.sub_total_amount;
  const discountAmount = req.body.discount_amount;
  const pickUpChargeAmount = req.body.pick_up_charge_amount || 0;
  const estimatedAmount =
    (subTotalAmount - discountAmount) + packageLevelCharges + pickUpChargeAmount;
  log(subTotalAmount, discountAmount, packageLevelCharges, pickUpChargeAmount);
  updateShipment.sub_total_amount = subTotalAmount;
  updateShipment.discount_amount = discountAmount;
  updateShipment.estimated_amount = estimatedAmount;
  const status = await Shipment.update(updateShipment, { where: { id } });

  // const status = await Shipment.update(req.body, { where: { id } });
  return res.json(status);
};


exports.metaUpdate = async (req, res) => {
  // normal update
  // tracking update
  const { id } = req.params;
  const status = await ShipmentMeta.update(req.body, { where: { id } });
  return res.json(status);
};

exports.destroy = async (req, res) => {
  const { id } = req.params;

  const shipment = await Shipment
    .find({
      where: { id },
      include: [{
        model: Package,
        attributes: ['id'],
      }],
    });

  log('shipment id', shipment.status);
  if (![CANCELED, DELIVERED, DISPATCHED].includes(shipment.status)) {
    return res.json({ message: `Can not delete item as it is already ${shipment.status}` });
  }

  await Promise.all(shipment.Packages
    .map(({ id: packageId }) => Package
      .updateState({
        db,
        packageId,
        nextStateId: READY_TO_SHIP,
        actingUser: req.user,
      })));

  await ShipmentMeta
    .destroy({ where: { shipment_id: id } });

  await ShipmentIssue
    .destroy({ where: { shipment_id: id } });

  const status = await Shipment.destroy({ where: { id } });

  return res.json(status);
};

const calcShipping = async (countryId, weight, type) => {
  const docType = weight <= 2 ? type : 'nondoc';
  let rate = '';
  const optionsRate = {
    attributes: ['amount'],
    where: {
      country_id: countryId,
      consignment_type: docType,
      minimum: {
        $lt: weight,
      },
    },
  };
  if (weight <= 300) {
    optionsRate.where.maximum = {
      $gte: weight,
    };
  } else {
    optionsRate.where.max = 0;
  }
  log('optionsRate', JSON.stringify(optionsRate));
  rate = await ShippingRate
    .find(optionsRate);
  log('rate', rate);
  if (rate) {
    const amount = (rate.rate_type === 'fixed') ? rate.amount : rate.amount * weight;
    log('-----------amount', amount);
    return amount;
  }
  return false;
};

const getEstimation = async (packageIds, countryId, userId) => {
  const packages = await Package.findAll({
    include: [{
      attributes: ['storage_amount', 'wrong_address_amount', 'special_handling_amount', 'receive_mail_amount',
        'pickup_amount', 'basic_photo_amount', 'advanced_photo_amount', 'split_package_amount',
        'scan_document_amount'],
      model: PackageCharge,
    }],
    where: {
      customer_id: userId,
      id: packageIds,
    },
  });
  log('packages', JSON.stringify(packages));

  const country = await Country
    .findById(countryId, {
      attributes: ['discount_percentage'],
    });

  const shipping = {
    price: 0,
    weight: 0,
    sub_total_amount: 0,
    estimated: 0,
    level: 0,
    count: packages.length,
  };
  log({ shipping });
  // packages.forEach((p) => {
  let packItem = '';
  // eslint-disable-next-line no-restricted-syntax
  for (packItem of packages) {
    const pack = packItem.toJSON();
    shipping.price += pack.price_amount;
    shipping.weight += pack.weight;

    const packageCharge = pack.PackageCharge || {};
    log({ packageCharge });

    const keys = [
      'storage_amount', 'wrong_address_amount', 'special_handling_amount', 'receive_mail_amount',
      'pickup_amount', 'basic_photo_amount', 'advanced_photo_amount', 'split_package_amount',
      'scan_document_amount',
    ];
    let type = '';
    type = pack.content_type === 1 ? 'doc' : 'nondoc';
    type = type === 'doc' ? 1 : 2;

    shipping.level += keys.reduce((nxt, key) => (nxt + (packageCharge[key] || 0)), 0);
    log('data', countryId, pack.weight, type);

    // eslint-disable-next-line no-await-in-loop
    const shippingCharge = await calcShipping(countryId, pack.weight, type);
    log('shippingCharge', shippingCharge);

    if (shippingCharge) {
      shipping.sub_total_amount = shippingCharge;
      log('shippingCharge', shippingCharge);
    }
  }
  shipping.discount = (country.discount_percentage / 100) * shipping.sub_total_amount;
  let estimated = shipping.sub_total_amount - shipping.discount;
  estimated += shipping.level;
  shipping.estimated = estimated;

  return shipping;
};

const getAddress = (address) => {
  log('getAddress', address.toJSON());
  let toAddress = address.line1;
  if (address.line2) toAddress = `, ${address.line2}`;

  toAddress += `, ${address.city}`;
  toAddress += `, ${address.state}`;
  toAddress += `, ${address.country}`;
  toAddress += ` - ${address.pincode}`;
  return toAddress;
};

const getPackages = (userId, packageIds) => Package
  .findAll({
    attributes: ['id', 'package_state_id'],
    where: {
      customer_id: userId,
      id: packageIds,
    },
    include: [{
      attributes: ['id', 'package_id'],
      model: PackageState,
      where: {
        state_id: READY_TO_SHIP,
      },
    }],
  });

const saveShipment = ({
  userId, address, toAddress, shipping,
}) => {
  const shipment = {};
  shipment.customer_id = userId;
  shipment.full_name = address.first_name;
  shipment.address = toAddress;
  shipment.country = address.country_id;
  shipment.phone = `+${address.code}-${address.phone}`;
  shipment.packages_count = shipping.count;
  shipment.weight = shipping.weight;
  shipment.final_weight = shipping.weight;
  shipment.value_amount = shipping.price;
  shipment.discount_amount = shipping.discount;
  shipment.package_level_charges_amount = shipping.level;
  shipment.sub_total_amount = shipping.sub_total_amount;
  shipment.estimated_amount = shipping.estimated;
  shipment.final_amount = 0;

  shipment.payment_gateway_name = 'pending';
  shipment.payment_status = 'pending';
  shipment.status = 'inreview';

  const orderCode = `${moment().format('YYYYMMDDHHmmss')}-${userId}`;

  shipment.order_code = orderCode;
  log({ shipment });
  // log({ shipment });
  return Shipment
    .create(shipment);
};

const saveShipmentMeta = ({ req, sR, packageIds }) => {
  const meta = Object.assign({ shipment_id: sR.id }, req.body);
  meta.repacking_charge_amount = (req.body.repack === true) ? 100.00 : 0;
  meta.sticker_charge_amount = (req.body.sticker === true) ? 0 : 0;
  meta.sticker_charge_amount = 0;

  if (packageIds.length) {
    meta.consolid = '1';
    meta.consolidation_charge_amount = (packageIds.length - 1) * 100.00;
  }

  meta.gift_wrap_charge_amount = (req.body.gift_wrap === true) ? 100.00 : 0;
  meta.gift_note_charge_amount = (req.body.gift_note === true) ? 50.00 : 0;

  meta.extra_packing_charge_amount = (req.body.extra_packing === true) ? 500.00 : 0;

  if (req.body.liquid === true) {
    if (req.weight < 5) {
      meta.body.liquid_charge_amount = 1392.40;
    }
    if (req.body.weight >= 5 && req.body.weight < 10
    ) {
      meta.liquid_charge_amount = 3009.00;
    }
    if (req.body.weight >= 10 && req.body.weight < 15
    ) {
      meta.liquid_charge_amount = 5369.00;
    }
    if (req.body.weight >= 15) {
      meta.liquid_charge_amount = 7729.00;
    }
  }
  meta.proforma_taxid = req.body.invoice_taxid;
  meta.proforma_personal = req.body.invoice_personal;
  meta.invoice_include = req.body.invoice_include;
  meta.max_weight = req.body.max_weight;
  meta.shipment_id = sR.id;
  log({ meta });
  return ShipmentMeta.create(meta);
};

const updateShipment = async ({ sR, shipmentMeta }) => {
  let packageLevelCharges = sR.package_level_charges;

  packageLevelCharges += shipmentMeta.repacking_charge_amount + shipmentMeta.sticker_charge_amount
    + shipmentMeta.extra_packing_charge_amount +
    shipmentMeta.original_ship_box_charge__amount + shipmentMeta.gift_wrap_charge_amount
    + shipmentMeta.gift_note_charge_amount + shipmentMeta.consolidation_charge_amount;

  packageLevelCharges += shipmentMeta.liquid_charge_amount;

  const updateShip = await Shipment.findById(sR.id);

  let { estimated } = updateShip;
  estimated -= sR.package_level_charges;
  estimated += packageLevelCharges;

  updateShip.packageLevelCharges = packageLevelCharges;
  updateShip.estimated = estimated;
  return sR.update(updateShip);
};

const updatePackages = (shipmentId, packageIds, actingUser) => {
  log({ packageIds });
  packageIds.map(id => Package.updateState({
    db,
    nextStateId: ADDED_TO_SHIPMENT,
    pkg: { id },
    actingUser,
  }));
  return Package.update({
    shipment_id: shipmentId,
  }, {
    where: { id: packageIds },
  });
};


exports.create = async (req, res, next) => {
  log('shipment:create', req.body, { customerId: req.user.id });
  try {
    const { id: userId } = req.user;
    const packageIds = req.query.package_ids.split(',');
    const packages = await getPackages(userId, packageIds);

    if (!packages.length) return res.status(400).json({ message: 'No Packages Found.' });
    log('addressid', req.body.address_id);
    const address = await Address.findById(req.body.address_id);

    const toAddress = await getAddress(address);

    const shipping = await getEstimation(packageIds, address.country_id, userId);
    log({ shipping });
    const sR = await saveShipment({
      userId, address, toAddress, shipping,
    });

    const shipmentMeta = await saveShipmentMeta({ req, sR, packageIds });

    const updateShip = await updateShipment({ shipmentMeta, sR });
    log('packageIds', packageIds);
    log('sR', sR.id);
    updatePackages(sR.id, packageIds, req.user);

    await Shipment.updateShipmentState({
      db,
      nextStateId: PACKAGING_REQUESTED,
      shipment: sR,
      actingUser: req.user,
    });

    eventEmitter.emit('shipment:create', {
      userId, sR, packages, address, updateShip,
    });

    return res.status(201).json(sR);
  } catch (e) {
    return next(e);
  }
};


exports.shipQueue = async (req, res) => {
  const options = {
    attributes: [
      'order_code', 'customer_name', 'address',
      'phone', 'packages_count', 'weight', 'estimated_amount',
    ],
    where: { status: ['inqueue', 'inreview', 'received', 'confirmation'] },
  };
  await Shipment
    .find(options)
    .then(shipment =>
      res.json({ shipment }));
};

exports.count = async (req, res) => {
  const buckets = BUCKETS.SHIPMENT;
  return Shipment
    .count({
      where: {
        customer_id: req.user.id,
      },
      include: [{
        model: ShipmentState,
        where: {
          state_id: buckets[req.user.group_id][req.query.bucket || 'IN_QUEUE'],
        },
      }],
    })
    .then(count => res.json(count));
};

exports.history = (req, res, next) => {
  const options = {
    attributes: [
      'order_code', 'customer_name', 'address', 'status', 'tracking_code',
      'dispatch_date', 'shipping_carrier', 'phone', 'packages_count', 'weight',
      'estimated_amount', 'created_at', 'final_amount',
    ],
    where: {
      status: ['dispatched', 'delivered', 'canceled', 'refunded'],
    },
  };

  return Shipment
    .findAll(options)
    .then(shipments => res.json(shipments))
    .catch(next);
};

exports.cancelRequest = async (req, res, next) => {
  const { id: customerId } = req.user;
  const { order_code: orderCode } = req.body;

  return Shipment
    .find({
      attributes: ['id', 'created_at'],
      where: {
        customer_id: customerId,
        status: ['inreview', 'inqueue'],
        order_code: orderCode,
      },
    })
    .then((shipment) => {
      if (!shipment) return res.status(400).json({ message: 'requested shipment not exist' });

      const creationTimeGap = moment(shipment.created_at).diff(moment(), 'hours');

      if (creationTimeGap > 1) {
        const message = 'You can cancel shipment 1 hour from shipment creation. ' +
                      `creationTimeGap: ${creationTimeGap}`;
        return res
          .status(400)
          .json({ message });
      }

      return Promise
        .all([
          Shipment
            .update({
              status: 'canceled',
            }, {
              where: {
                id: shipment.id,
              },
            }),
          Package
            .update({
              status: 'ship',
            }, {
              where: {
                shipment_id: shipment.id,
              },
            }),
          Notification.create({
            customer_id: customerId,
            action_type: 'shipment',
            action_id: shipment.id,
            action_description: `Shipment request cancelled - Order#  ${shipment.order_code}`,
          }),
        ])
        .then(() => res.json({ message: 'Ship request has been cancelled!', shipment }));
    })
    .catch(next);
};

exports.invoice = async (req, res) => {
  const { id } = req.params;
  let packages;
  const shipment = await Shipment
    .find({ where: { order_code: id } });
  if (shipment) {
    packages = await Package
      .findAll({ where: { shipment_id: shipment.id } });
  }
  return res.json({ packages, shipment });
};


const updatePromoStatus = async (shipment) => {
  const couponAppliedStatus = await Redemption
    .find({ where: { shipment_order_code: shipment.order_code } });

  if (couponAppliedStatus) {
    const option = {
      where: {
        code: couponAppliedStatus.coupon_code,
        expires_at: {
          $gt: new Date(),
        },
      },
    };
    const coupon = await Coupon
      .find(option);
    if (coupon) {
      await Redemption
        .update({ status: 'success' }, { where: { shipment_order_code: shipment.order_code } });
    }
  }
};

const updateCustomerWallet = async (shipment, customerId) => {
  const couponAppliedStatus = Redemption
    .find({ where: { shipment_order_code: shipment.order_code } });

  if (couponAppliedStatus) {
    const promo = Coupon
      .find({
        where: {
          code: couponAppliedStatus.coupon_code,
          expires_at: {
            $gt: new Date(),
          },
        },
      });
    if (promo) {
      if (promo.cashback_percentage) {
        const { id } = customerId;
        const user = await User
          .findById(id);
        const totalWalletAmount =
          user.wallet_balance_amount +
          (shipment.estimated_amount * (promo.cashback_percentage / 100));
        await User
          .update({ wallet_balance_amount: totalWalletAmount }, { where: { id } });
        await Redemption
          .update({ status: 'success' }, { where: { shipment_order_code: shipment.order_code } });
      } else if (promo.discount_percentage) {
        await Redemption
          .update({ status: 'success' }, { where: { shipment_order_code: shipment.order_code } });
      }
    }
  }
};

const walletTransaction = async (walletAmount, customer, shipment, type) => {
  const transaction = {};
  transaction.customer_id = customer.id;
  // transaction.wallet_id = $customer->balance->id;
  transaction.amount = walletAmount;
  transaction.type = type;
  transaction.description = `Wallet balance offsetted against shipment cost | Shipment ID ${shipment.order_code}`;
  Transaction.create(transaction);
};


exports.finalShipRequest = async (req, res) => {
  const customerId = req.user.id;
  const payment = {};
  const optionCustomer = {
    attributes: ['id', 'wallet_balance_amount'],
    where: { id: customerId },
  };
  const customer = await User
    .find(optionCustomer);
  const shipmentSave = {};
  const shipRequestId = req.body.shipment_id;
  const shipOptions = {
    attributes: ['id', 'customer_id', 'estimated_amount', 'order_code'],
    where: { id: shipRequestId },
  };
  const shipment = await Shipment
    .find(shipOptions);

  if (!shipment && shipment.customer_id !== customerId) {
    return res.status(400).json({ message: 'shipment not found' });
  }
  payment.coupon = 0;
  payment.loyalty = 0;
  payment.final_amount = shipment.estimated_amount;

  const options = {
    attributes: ['points', 'customer_Id'],
    where: { customer_Id: customerId },
  };
  const points = await LoyaltyPoint
    .find(options);

  let loyaltyPoints = points.points;

  while (loyaltyPoints >= 1000) {
    payment.loyalty += 100;
    loyaltyPoints -= 1000;
  }

  payment.final_amount -= payment.loyalty;

  payment.wallet = 0;
  const isWalletUsed = req.body.wallet;
  if (isWalletUsed === 1) {
    payment.wallet = customer.wallet_balance_amount || 0;
    payment.final_amount -= payment.wallet;
  }

  const redemptionOptions = {
    attributes: ['coupon_code'],
    where: { shipment_order_code: shipment.order_code },
  };

  const couponAppliedStatus = await Redemption
    .find(redemptionOptions);
  let couponAmount = 0;

  if (couponAppliedStatus) {
    const couponOptions = {
      attributes: ['id', 'code', 'cashback_percentage', 'discount_percentage', 'max_cashback_amount'],
      where: {
        code: couponAppliedStatus.coupon_code,
        expires_at: {
          $gt: new Date(),
        },
      },
    };
    const promo = await Coupon
      .find(couponOptions);
    if (promo) {
      if (promo.cashback_percentage) {
        // promo_status = "cashback_success";
        couponAmount = shipment.estimated_amount * (promo.cashback_percentage / 100);
        payment.coupon = couponAmount;
        // coupon_name = couponAppliedStatus.coupon_code;
      } else if (promo.discount_percentage) {
        const estimatedAmount = shipment.estimated_amount -
          shipment.package_level_charges - payment.wallet;
        payment.coupon = estimatedAmount * (promo.discount_percentage / 100);
        // coupon_name = couponAppliedStatus.coupon_code;
        // promo_status = 'discount_success';
        payment.final_amount -= payment.coupon;
      }
    }
  }

  let paymentGatewayName = '';
  const paymentGatewayFee = 0;
  switch (req.body.payment_gateway_name) {
    case 'card':
      paymentGatewayName = 'card';
      break;
    case 'wire':
      paymentGatewayName = 'wire';
      await updatePromoStatus(shipment);
      // Mail::to($customer->email)->send(new PaymentOptionWire($shipment));  // mail send pending
      break;
    case 'cash':
      paymentGatewayName = 'cash';
      await updatePromoStatus(shipment);
      // Mail::to($customer->email)->send(new PaymentOptionCash($shipment));  // mail send pending
      break;
    case 'paypal':
      paymentGatewayName = 'paypal';
      break;
    case 'paytm':
      paymentGatewayName = 'paytm';
      break;
    case 'wallet':
      paymentGatewayName = 'wallet';
      break;
    default: break;
  }

  shipmentSave.coupon_amount = payment.coupon;
  shipmentSave.wallet_amount = payment.wallet;
  shipmentSave.loyalty_amount = payment.loyalty;
  shipmentSave.payment_gateway_fee_amount = paymentGatewayFee;
  shipmentSave.final_amount = payment.final_amount;

  if (paymentGatewayName === 'wire') {
    shipmentSave.payment_gateway_id = WIRE;
    shipmentSave.status = 'inqueue';
    shipmentSave.payment_status = 'pending';

    Shipment
      .updateShipmentState({
        db,
        shipment,
        actingUser: req.user,
        nextStateId: PAYMENT_COMPLETED,
        comments: 'Wire payment selected',
      });

    // if (isWalletUsed === 1) {
    //   await User
    //     .update(
    //       { wallet_balance_amount: 0 },
    //       { where: { id: customerId } },
    //     );
    // }
  } else if (paymentGatewayName === 'cash') {
    shipmentSave.payment_gateway_id = CASH;
    shipmentSave.status = 'inqueue';
    shipmentSave.payment_status = 'pending';

    Shipment
      .updateShipmentState({
        db,
        shipment,
        actingUser: req.user,
        nextStateId: PAYMENT_COMPLETED,
        comments: 'cash payment selected',
      });
    // if (isWalletUsed === 1) {
    //   await User
    //     .update(
    //       { wallet_balance_amount: 0 },
    //       { where: { id: customerId } },
    //     );
    // }
  } else if (paymentGatewayName === 'wallet') {
    log('remainingWalletAmount', WALLET);
    shipmentSave.payment_gateway_id = WALLET;
    shipmentSave.status = 'inqueue';
    shipmentSave.payment_status = 'success';

    const customerTotalWalletAmount = customer.wallet_balance_amount;
    const remainingWalletAmount = customerTotalWalletAmount - payment.final_amount;
    log('remainingWalletAmount', remainingWalletAmount);
    log('customer.wallet_balance_amount', customer.wallet_balance_amount);

    Shipment
      .updateShipmentState({
        db,
        shipment,
        actingUser: req.user,
        nextStateId: PAYMENT_COMPLETED,
        comments: 'Wire payment selected',
      });

    // await User
    //   .update(
    //     { wallet_balance_amount: remainingWalletAmount },
    //     { where: { id: customerId } },
    //   );

    await updateCustomerWallet(shipment, customerId);
    await walletTransaction(payment.final_amount, customer, shipment, DEBIT);
  } else {
    shipmentSave.payment_status = 'pending';
    shipmentSave.status = 'confirmation';
  }
  const shipments = await Shipment
    .update(shipmentSave, { where: { id: shipRequestId } });

  if (shipmentSave.wallet !== 0) {
    log('customer.transaction1', customer.wallet_balance_amount);
    await walletTransaction(shipment.wallet, customer, shipment, DEBIT);
  }

  const notification = {};
  notification.customer_id = customerId;
  notification.action_type = 'shipment';
  notification.action_id = shipment.id;
  notification.action_description = `Customer submitted payment - Order#  ${shipment.order_code}`;
  await Notification.create(notification);
  await LoyaltyPoint
    .update({ ship_request_id: shipment.id }, { where: { customer_id: customerId } });

  if (payment.loyalty >= 100) {
    const hisPoints = payment.loyalty * 10;
    const loyaltyHistory = {};
    loyaltyHistory.customer_id = customerId;
    loyaltyHistory.points = hisPoints;
    loyaltyHistory.redeemed = new Date();
    loyaltyHistory.type = REDEEM;
    await LoyaltyHistory.create(loyaltyHistory);

    const loyaltyOptions = {
      attributes: ['points'],
      where: { customer_id: customerId },
    };

    const loyalty = await LoyaltyPoint
      .find(loyaltyOptions);

    const balance = loyalty.points - hisPoints;

    await LoyaltyPoint
      .update({ points: balance }, { where: { customer_id: customerId } });
  }

  // Mail::to($customer->email)->            // - required
  // bcc('support@shoppre.com')->
  // send(new ShipmentConfirmed(shipments)); // mail pending
  log('shipment', shipments);
  log('ship_request_id', shipment.id);
  req.user.ship_request_id = shipment.id;
  req.user.isWalletUsed = 0;
  req.user.isRetryPayment = 0;

  log('message', paymentGatewayName);
  switch (paymentGatewayName) {
    // eslint-disable-next-line no-case-declarations
    case 'card':
      log({ message: 'payment.axis.start' });
      const encryptedData = axis.create(req, res);
      log('after axis', encryptedData);
      return encryptedData;
    // eslint-disable-next-line no-case-declarations
    case 'paypal':
      log({ message: 'payment.paypal.start' });
      const responsePaypal = paypal.create(req, res);
      return responsePaypal;
    // eslint-disable-next-line no-case-declarations
    case 'paytm':
      log({ message: 'payment.paytm.start' });
      return paytm.create(req, res);
    default: break;
      // return res.redirect(getPaymentURL('shipping.request.response'));
  }
  return res.json({ message: 'success' });
};

exports.payRetrySubmit = async (req, res) => {
  const customerId = req.user.id;
  const shipRequestId = req.body.shipment_id;
  log('payRetrySubmit', shipRequestId);
  const shipmentSave = {};
  const payment = {};

  const customer = await User
    .findById(customerId, {
      attributes: ['id', 'wallet_balance_amount'],
      raw: true,
    });

  const shipment = await Shipment
    .findById(shipRequestId, {
      attributes: ['id', 'estimated_amount', 'final_amount',
        'customer_id', 'order_code', 'wallet_amount', 'loyalty_amount', 'coupon_amount',
      ],
    });

  if (shipment && shipment.customer_id === customerId) {
    payment.coupon = 0;
    payment.final_amount = shipment.estimated_amount;
    log('payment.final_amount 1', payment.final_amount);

    let customerWalletAmount = 0;
    req.user.is_wallet_used = 0;
    req.user.is_retry_payment = 0;
    let shipmentWalletAmount = shipment.wallet_amount;
    // if using wallet amount for shipment
    if (req.body.wallet) {
      if (req.body.payment_gateway_name === 'cash' || req.body.payment_gateway_name === 'wire') {
        customerWalletAmount = customer.wallet_balance_amount;
        payment.final_amount -= customerWalletAmount;
        shipmentWalletAmount += customerWalletAmount;
      }
      req.user.is_wallet_used = 1;
      req.user.is_retry_payment = 1;
    }
    // end

    if (req.body.payment_gateway_name === 'wallet') {
      shipmentSave.payment_gateway_id = WALLET;
      shipmentSave.status = 'inqueue';
      shipmentSave.payment_status = 'success';
    }

    shipmentSave.wallet_amount = shipmentWalletAmount;

    shipmentSave.final_amount = payment.final_amount -
      shipment.wallet_amount - shipment.loyalty_amount - shipment.coupon_amount;

    req.user.ship_request_id = shipment.id;

    await Shipment
      .update(shipmentSave, { where: { id: shipRequestId } });
    const savedShipment = await Shipment
      .findById(shipRequestId);
    log('savedShipment123', JSON.stringify(savedShipment));
    if (customerWalletAmount > 0) {
      await walletTransaction(customerWalletAmount, customer, shipment, DEBIT);
    }

    let customerTotalWalletAmount = '';
    let remainingWalletAmount = '';
    let totalShipmentAmount = '';
    let couponAppliedStatus = {};
    let optionCoupon = {};
    let optionRedemption = {};

    const getPaymentURL = () => '/payment.axis.start';

    switch (req.body.payment_gateway_name) {
      case 'card':
        return res.redirect(getPaymentURL('payment.axis.start'));

      case 'wire':
        optionRedemption = {
          attributes: ['coupon_code'],
          where: { shipment_order_code: shipment.order_code },
        };
        couponAppliedStatus = await Redemption
          .find(optionRedemption);

        if (couponAppliedStatus) {
          optionCoupon = {
            where: {
              code: couponAppliedStatus.coupon_code,
              expires_at: {
                gt: new Date(),
              },
            },
          };

          const promo = await Coupon
            .find(optionCoupon);
          if (promo) {
            await Redemption.update({
              status: 'success',
            }, {
              where: { shipment_order_code: shipment.order_code },
            });
          } else {
            await Redemption.update({
              status: 'applied',
            }, {
              where:
                  { shipment_order_code: shipment.order_code },
            });
          }
        }
        // if (req.body.wallet) {
        //   await User.update({ wallet_balance_amount: 0 }, { where: { id: customerId } });
        // }

        await Shipment.update({
          payment_gateway_id: WIRE,
          payment_status: 'pending',
          status: 'inqueue',
        }, {
          where: { id: shipRequestId },
        });
        log('wire', shipRequestId);
        break;
      case 'cash':
        // if (req.body.wallet) {
        //   await User.update({ wallet_balance_amount: 0 }, { where: { id: customerId } });
        // }

        await Shipment.update({
          payment_gateway_id: CASH,
          payment_status: 'inqueue',
          status: 'pending',
        }, {
          where: { id: shipRequestId },
        });
        log('cash', shipRequestId);
        break;

      case 'wallet':
        log('saveshipment', JSON.stringify(savedShipment));
        customerTotalWalletAmount = customer.wallet_balance_amount || 0;
        log('savedShipment.wallet_amount', savedShipment.wallet_amount);
        totalShipmentAmount =
          payment.final_amount - savedShipment.wallet_amount || 0 -
          savedShipment.loyalty_amount || 0 - savedShipment.coupon_amount || 0;
        remainingWalletAmount =
          customerTotalWalletAmount - totalShipmentAmount;
        log('remainingWalletAmount', remainingWalletAmount);
        // await User.update({
        //   wallet_balance_amount: remainingWalletAmount,
        // }, {
        //   where:
        //       {
        //         id: customerId,
        //       },
        // });
        await walletTransaction(payment.final_amount, customer, savedShipment, DEBIT);
        break;
      case 'paypal':
        return res.redirect('payment.paypal.start');
      case 'paytm':
        return res.redirect('payment.paytm.start');
      default:
        return res.redirect('customer.locker');
    }
    log('response', shipRequestId);
    return res.json({ shipRequestId });
  }
  // return res.redirect('shipping.request.response');
  log('response', shipRequestId);
  return res.json({ shipRequestId });
};

exports.retryPayment = async (req, res) => {
  const customerId = req.user.id;
  const orderCode = req.query.order_code;
  log({ orderCode });

  const customer = await User
    .findById(customerId, {
      attributes: ['id', 'wallet_balance_amount'],
      raw: true,
    });

  const optionShipment = {
    attributes: ['id', 'package_level_charges_Amount', 'weight', 'pick_up_charge_amount', 'address',
      'discount_amount', 'estimated_amount', 'packages_count', 'sub_total_amount', 'customer_name',
      'value_amount', 'phone', 'is_axis_banned_item', 'order_code', 'wallet_amount', 'payment_gateway_fee_amount',
      'loyalty_amount'],
    where: { customer_id: customerId, order_code: orderCode },
    include: [{
      model: ShipmentState,
      attributes: ['id', 'state_id'],
      where: { state_id: PAYMENT_FAILED },
    }, {
      model: User,
      as: 'Customer',
      attributes: ['id', 'wallet_balance_amount'],
    }, {
      model: ShipmentMeta,
      attributes: ['id', 'repacking_charge_amount', 'sticker_charge_amount', 'extra_packing_charge_amount', 'original_ship_box_charge__amount',
        'consolidation_charge_amount', 'gift_wrap_charge_amount', 'gift_note_charge_amount', 'insurance_amount',
        'liquid_charge_amount', 'overweight_charge_amount', 'shipment_id'],
    }],
  };

  const shipment = await Shipment
    .find(optionShipment);

  if (!shipment) {
    return res.status(400).json({ message: 'shipment not found' });
  }

  const optionPackage = {
    attributes: ['id', 'price_amount', 'weight',
      'reference_code', 'store_id'],
    where: {
      customer_id: customerId,
      shipment_id: shipment.id,
    },
    include: [{
      model: PackageItem,
      attributes: ['name', 'quantity', 'price_amount'],
    }, {
      model: PackageCharge,
      attributes: ['storage_amount', 'receive_mail_amount', 'pickup_amount', 'basic_photo_amount', 'scan_document_amount',
        'wrong_address_amount', 'special_handling_amount', 'advanced_photo_amount', 'split_package_amount'],
    }, {
      model: Store,
      attributes: ['name'],
    }],
  };

  const packages = await Package
    .find(optionPackage);

  const payment = {
    coupon: 0,
    amount: 0,
    paymentGatewayName: 'wire',
    paymentGatewayFee: 0,
  };

  if (shipment.payment_gateway_fee_amount) {
    payment.amount = shipment.estimated_amount -
      shipment.payment_gateway_fee_amount - shipment.wallet_amount;
  } else {
    payment.amount = shipment.estimated_amount - shipment.wallet_amount;
  }
  log('1', payment.amount);
  log('shipment.wallet_amount', shipment.wallet_amount);
  log('est', shipment.estimated_amount, 'pg', shipment.payment_gateway_fee_amount);
  if (req.body.wallet === 1) {
    payment.amount -= customer.wallet_balance_amount;
  }
  payment.wallet = customer.wallet_balance_amount;
  payment.amount -= shipment.loyalty_amount;
  log('2', payment.amount);
  const optionRedemtion = {
    attributes: ['shipment_order_code', 'coupon_code'],
    where: { shipment_order_code: orderCode },
  };

  const couponAppliedStatus = await Redemption
    .find(optionRedemtion);
  let promoStatus = '';
  let couponAmount = 0;
  let couponName = '';
  if (couponAppliedStatus) {
    const couponOptions = {
      attributes: ['id', 'cashback_percentage', 'discount_percentage', 'max_cashback_amount'],
      where: {
        code: couponAppliedStatus.coupon_code,
        expires_at: {
          $gt: new Date(),
        },
      },
    };

    const promo = await Coupon
      .find(couponOptions);

    if (promo) {
      if (promo.cashback_percentage) {
        promoStatus = 'cashback_success';
        couponAmount = shipment.estimated_amount * (promo.cashback_percentage / 100);
        couponName = couponAppliedStatus.coupon_code;
        payment.coupon = 0;
      } else if (promo.discount_percentage) {
        const estimatedAmount = shipment.estimated_amount -
          shipment.package_level_charges - payment.wallet;
        payment.coupon = estimatedAmount * (promo.discount_percentage / 100);
        couponName = couponAppliedStatus.coupon_code;
        promoStatus = 'discount_success';
      }
      payment.amount -= payment.coupon;
      log('3', payment.amount);
    } else {
      promoStatus = 'promo_expired';
    }
  }
  log('gateway:', req.query.payment_gateway_name);
  switch (req.query.payment_gateway_name) {
    case 'card':
      payment.paymentGatewayName = 'card';
      break;
    case 'wire':
      payment.paymentGatewayName = 'wire';
      break;
    case 'cash':
      payment.paymentGatewayName = 'cash';
      break;
    case 'wallet':
      payment.paymentGatewayName = 'wallet';
      break;
    case 'paypal':
      payment.paymentGatewayName = 'paypal';
      payment.paymentGatewayFee = (10 / 100) * payment.amount;
      payment.amount += payment.paymentGatewayFee;
      log('4', payment.amount);
      break;
    case 'paytm':
      payment.paymentGatewayName = 'paytm';
      payment.paymentGatewayFee = (3 / 100) * payment.amount;
      payment.amount += payment.paymentGatewayFee;
      log('5', payment.amount);
      break;
    default:
      payment.paymentGatewayName = 'wire';
      break;
  }

  const optionsPaymentGateway = {
    attributes: ['id', 'name', 'description', 'value'],
    limit: 20,
  };
  const paymentGateway = await PaymentGateway
    .findAll(optionsPaymentGateway);
  log(JSON.stringify(paymentGateway));
  log({ payment });

  return res.json({
    shipment,
    packages,
    payment,
    promoStatus,
    couponAmount,
    couponName,
    paymentGateway,
    wallet_amount: customer.wallet_balance_amount,
  });
};

exports.confirmShipment = async (req, res) => {
  const customerId = req.user.id;
  const orderCode = req.query.order_code;
  const customer = User
    .findById(customerId, {
      attributes: ['id', 'wallet_balance_amount'],
    });

  const optionsShipment = {
    attributes: ['id', 'package_level_charges_Amount', 'weight', 'pick_up_charge_amount', 'address',
      'discount_amount', 'estimated_amount', 'packages_count', 'sub_total_amount', 'customer_name',
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
      where: { state_id: PAYMENT_REQUESTED },
    }],
  };

  const shipment = await Shipment
    .find(optionsShipment);

  if (!shipment) {
    return res.status(400).json({ message: 'shipment not found' });
  }

  const optionsPackage = {
    attributes: ['id', 'price_amount', 'weight',
      'reference_code', 'store_id'],
    where: {
      customer_id: customerId,
      shipment_id: shipment.id,
    },
    include: [{
      model: PackageItem,
      attributes: ['name', 'quantity', 'price_amount'],
    }, {
      model: PackageCharge,
      attributes: ['storage_amount', 'receive_mail_amount', 'pickup_amount', 'basic_photo_amount', 'scan_document_amount',
        'wrong_address_amount', 'special_handling_amount', 'advanced_photo_amount', 'split_package_amount'],
    }, {
      model: Store,
      attributes: ['name'],
    }],
  };
  const packages = await Package
    .findAll(optionsPackage);

  const payment = {
    wallet: 0,
    coupon: 0,
    loyalty: 0,
    amount: 0,
    payment_gateway_name: 'wire',
    payment_gateway_fee: 0,
  };

  payment.amount = shipment.estimated_amount;
  if (customer.wallet_balance_amount < 0 || req.query.wallet === 1) {
    payment.wallet = customer.wallet_balance_amount;
    payment.amount -= payment.wallet;
  }

  const optionRedemption = {
    attributes: ['id', 'coupon_code'],
    where: { shipment_order_code: orderCode },
  };
  const couponAppliedStatus = await Redemption
    .find(optionRedemption);

  let promoStatus = '';
  let couponAmount = 0;
  let couponName = '';

  if (couponAppliedStatus) {
    const option = {
      attributes: ['max_cashback_amount', 'cashback_percentage', 'discount_percentage'],
      where: {
        code: couponAppliedStatus.coupon_code,
        expires_at: {
          $gt: new Date(),
        },
      },
    };

    const promo = await Coupon
      .find(option);

    if (promo) {
      if (promo.cashback_percentage) {
        promoStatus = 'cashback_success';
        const estimated = shipment.estimated_amount -
          shipment.package_level_charges_amount - payment.wallet;
        const totalCouponAmount = estimated * (promo.cashback_percentage / 100);
        const maxCouponAmount = promo.max_cashback_amount;
        if (totalCouponAmount <= maxCouponAmount) {
          couponAmount = totalCouponAmount;
        } else {
          couponAmount = maxCouponAmount;
        }
        couponName = couponAppliedStatus.coupon_code;
      } else if (promo.discount_percentage) {
        const estimated = shipment.estimated_amount -
          shipment.package_level_charges_amount - payment.wallet;
        const discountAmount = estimated * (promo.discount_percentage / 100);
        const maxCouponAmount = promo.max_cashback_amount;
        if (discountAmount <= maxCouponAmount) {
          payment.coupon = discountAmount;
        } else {
          payment.coupon = maxCouponAmount;
        }
        couponName = couponAppliedStatus.coupon_code;
        promoStatus = 'discount_success';
      }
      payment.amount -= payment.coupon;
    } else {
      promoStatus = 'promo_expired';
    }
  }
  const option = {
    attributes: ['points'],
    where: { customer_id: customerId },
  };
  const points = await LoyaltyPoint
    .find(option);

  let rewards = 0;
  let loyaltyPoints = points.points;
  while (loyaltyPoints >= 1000) {
    rewards += 100;
    loyaltyPoints -= 1000;
  }

  payment.loyalty = rewards;
  payment.amount -= payment.loyalty;

  switch (req.query.payment_gateway_name) {
    case 'card':
      payment.payment_gateway_name = 'card';
      break;
    case 'wire':
      payment.payment_gateway_name = 'wire';
      break;
    case 'cash':
      payment.payment_gateway_name = 'cash';
      break;
    case 'wallet':
      payment.payment_gateway_name = 'wallet';
      break;
    case 'paypal':
      payment.payment_gateway_name = 'paypal';
      payment.payment_gateway_fee = (10 / 100) * payment.amount;
      payment.amount += payment.payment_gateway_fee;
      break;
    case 'paytm':
      payment.payment_gateway_name = 'paytm';
      payment.payment_gateway_fee = (3 / 100) * payment.amount;
      payment.amount += payment.payment_gateway_fee;
      break;
    default:
      payment.payment_gateway_name = 'wire';
      break;
  }

  const optionsPaymentGateway = {
    attributes: ['id', 'name', 'description', 'value'],
    limit: 20,
  };
  const paymentGateway = await PaymentGateway
    .findAll(optionsPaymentGateway);
  log('payment gateway', JSON.stringify(payment));
  return res.json({
    shipment,
    packages,
    payment,
    promoStatus,
    couponAmount,
    couponName,
    paymentGateway,
    walletAmount: customer.wallet_balance_amount,
  });
};

exports.createShipment = async (req, res, IsShippingAddress) => {
  const customerId = req.user.id;
  log('createShipment.customerId', customerId);
  log('req.user.package_ids', req.query.packageIds);

  if (!req.user.package_ids) {
    log('createshipments-package-ids', req.user.ids);
    res.status(400).json({ message: 'package is not found' });
  }
  log('req.query;', req.query);

  const { packageIds } = req.query;
  const { IS_LIQUID } = req.user;
  const optionPackage = {
    attributes: ['id', 'weight', 'reference_code', 'price_amount'],
    where: { customer_id: customerId, id: packageIds.split(',') },
    include: [{
      model: PackageCharge,
      attributes: ['storage_amount', 'wrong_address_amount', 'special_handling_amount',
        'receive_mail_amount', 'pickup_amount', 'basic_photo_amount',
        'advanced_photo_amount', 'split_package_amount', 'scan_document_amount'],
    }, {
      model: Store,
      attributes: ['name'],
    }, {
      model: PackageItem,
      attributes: ['name', 'quantity', 'price_amount'],
    }, {
      model: PhotoRequest,
      attributes: ['status', 'package_id'],
    }],
  };

  const packages = await Package
    .findAll(optionPackage);

  let consolidationChargesAmount = 0;
  if (!packages) {
    res.redirect('customer.locker').status(400).json({ message: 'package not found' });
  }
  log('packageIds.split ', packageIds.split(',').length);
  if (packageIds.split(',').length > 1) {
    consolidationChargesAmount = (packageIds.split(',').length - 1) * 100.00;
  }
  const shipmentMeta = {
    storage_amount: 0,
    photo_amount: 0,
    pickup_amount: 0,
    special_handling_amount: 0,
    receive_mail_amount: 0,
    split_package_amount: 0,
    wrong_address_amount: 0,
    consolidation_charge_amount: consolidationChargesAmount,
    optsAmount: 0,
    scan_document_amount: 0,
  };
  log({ shipmentMeta });
  let pack = '';
  log('packages123 ', JSON.stringify(packages));
  // eslint-disable-next-line no-restricted-syntax
  for (pack of packages) {
    shipmentMeta.storage_amount += pack.PackageCharge.storage_amount || 0;
    shipmentMeta.photo_amount +=
      pack.PackageCharge.basic_photo_amount || 0
      + pack.PackageCharge.advanced_photo_amount || 0;
    shipmentMeta.pickup_amount += pack.PackageCharge.pickup_amount || 0;
    shipmentMeta.special_handling_amount += pack.PackageCharge.special_handling_amount || 0;
    shipmentMeta.receive_mail_amount += pack.PackageCharge.receive_mail_amount || 0;
    shipmentMeta.split_package_amount += pack.PackageCharge.split_package_amount || 0;
    shipmentMeta.wrong_address_amount += pack.PackageCharge.wrong_address_amount || 0;
    shipmentMeta.scan_document_amount += pack.PackageCharge.scan_document_amount || 0;
    log('adding package charges', shipmentMeta);
  }
  log('charges', shipmentMeta);

  const optionsCustomer = {
    attributes: ['id', 'salutation', 'first_name', 'last_name', 'email',
      'virtual_address_code', 'wallet_balance_amount'],
    where: { id: customerId },
    include: [{
      model: Address,
      attributes: ['id', 'salutation', 'first_name',
        'last_name', 'line1', 'line2', 'state', 'customer_id', 'is_default'],
    }],
    limit: Number(req.query.limit) || 20,
  };

  const customer = await User
    .find(optionsCustomer);

  log(JSON.stringify(shipmentMeta));
  return res.json({
    customer, packages, shipmentMeta, IS_LIQUID, IsShippingAddress,
  });
};

const FREE_STORAGE_LIMIT_DAYS = 20;
const PACKAGE_CHARGES = {
  DAILY_AFTER_LIMITED_DAYS: 100,
};
const SPECIAL = '2';
const NORMAL = '1';

exports.redirectShipment = async (req, res) => {
  const customerId = req.user.id;
  const { packageIds } = req.query;
  log({ packageIds });
  const packages = await Package
    .findAll({
      attributes: ['id', 'content_type', 'created_at'],
      where: {
        id: packageIds.split(','),
        customer_id: customerId,
      },
      include: [{
        model: PackageState,
        attributes: [],
        where: {
          state_id: READY_TO_SHIP,
        },
      }],
    });

  if (!packages.length) return res.status(400).json({ error: 'package not found' });

  const contentTypesMap = {
    [NORMAL]: [],
    [SPECIAL]: [],
  };

  const contentTypes = _.uniq(packages.map((pack) => {
    // - Information of multiple types of content - for Bad Request
    contentTypesMap[pack.content_type].push(pack);

    // Validate packages belongs to only one content type is request
    return pack.content_type;
  }));

  if (contentTypes.length !== 1) {
    log('Packages containing special items must be chosen and shipped separately.');
    log('contentTypess', (contentTypes));
    log('length', (contentTypes.length));
    return res
      .status(400)
      .json({
        message: 'Packages containing special items must be chosen and shipped separately.',
        contentTypesMap,
      });
  }

  packages.map((pack) => {
    // - Calculate Package Charges if exceed  minimum storage limit days
    const expiryDate = moment(pack.created_at).add(20, 'days');
    const today = moment();

    if (!today.isAfter(expiryDate)) return Promise.resolve();

    const totalDaysInStorage = today.diff(pack.created_at, 'days');
    const extraDays = totalDaysInStorage - FREE_STORAGE_LIMIT_DAYS;
    const storageCharge = extraDays * PACKAGE_CHARGES.DAILY_AFTER_LIMITED_DAYS;
    return PackageCharge
      .update(
        { storage_amount: storageCharge },
        { where: { id: pack.id } },
      );
  });

  const IS_LIQUID = !!contentTypesMap[SPECIAL].length;

  let address = '';
  let IsShippingAddress = true;
  log({ customerId });
  if (req.body.addressId) {
    address = await Address
      .findById(req.body.addressId);
    if (address) {
      const optionAddress = {
        attributes: ['id'],
        where: { customer_id: customerId, is_default: 1 },
      };
      address = await Address
        .find(optionAddress);
      if (address) {
        log('redirectShipment.Ship request required address to proceed!');
        // return res.status(400).redirect('customer.address')
        // .json({ message: 'Ship request required address to proceed!' });
        IsShippingAddress = false;
      }
    }
  } else {
    const optionAddress = {
      attributes: ['id'],
      where: { customer_id: customerId, is_default: 1 },
    };
    log('redirectShipment.testing break point address');
    address = await Address
      .find(optionAddress);
    if (!address) {
      log('redirectShipment.Ship request required address to proceed!');
      // return res.status(400).json({ message: 'Ship request required address to proceed!' });
      IsShippingAddress = false;
    }
  }
  log('redirectShipment.testing break point');

  req.user.package_ids = packageIds;
  req.user.IS_LIQUID = IS_LIQUID;
  req.user.address = address;

  const result = await this.createShipment(req, res, IsShippingAddress);
  return result;
};

exports.state = async (req, res, next) => Shipment
  .findById(req.params.id)
  .then((shipment) => {
    log({ shipment });
    if (SHIPMENT_HANDED === req.body.state_id) {
      if (!shipment.dispatch_date || !shipment.shipping_carrier || !shipment.number_of_packages ||
        !shipment.weight_by_shipping_partner ||
        !shipment.value_by_shipping_partner || !shipment.tracking_code) {
        log('You must update Shipment Tracking Information to send dispatch notification!');
        return res.json({
          error: 'You must update Shipment Tracking Information to send dispatch notification!',
        });
      }
    }

    return Shipment
      .updateShipmentState({
        db,
        shipment,
        actingUser: req.user,
        nextStateId: req.body.state_id,
        comments: req.body.comments,
      })
      .then(status => res.json(status));
  })
  .catch(next);

const models = {
  1: DHLLog,
};

exports.updateShipmetStatus = () => {
  const DISPATCHED_TO_DELIVERED = [18, 19, 21, 20, 23, 26, 24, 25, 28, 27, 29, 30, 31, 36];

  return Shipment
    .findAll({
      attributes: [
        'id', 'tracking_code', 'shipping_partner_id',
      ],
      include: [{
        model: ShipmentState,
        attributes: ['id', 'state_id'],
        where: { state_id: DISPATCHED_TO_DELIVERED },
      }],
    })
    .then((shipments) => {
      log('shipments', shipments.length);
      return Promise
        .all(shipments
          .map((shipment) => {
            log('shipment', shipment.toJSON());
            return shipper[shipment.shipping_partner_id]
              .lastStatus(shipment.tracking_code)
              .then(({ customPayload }) => models[shipment.shipping_partner_id]
                .create({
                  shipment_id: shipment.id,
                  ...customPayload,
                }));
          }));
    });
};

exports.response = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;
  const options = {
    attributes: ['id', 'value_amount', 'address', 'customer_id', 'weight',
      'order_code', 'final_amount', 'package_level_charges_amount', 'customer_name', 'phone'],
    where: { id },
    include: [{
      model: User,
      as: 'Customer',
      attributes: ['id', 'email'],
    }, {
      model: PaymentGateway,
      attributes: ['id', 'name', 'value'],
    }],
  };
  const shipment = await Shipment
    .find(options);
  log({ shipment });
  if (shipment && shipment.customer_id === customerId) {
    // return res.json({ shipment });
    return res.json({ shipment });
  }
  return res.status(404).json({ message: 'shipment not found' });
};

