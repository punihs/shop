const debug = require('debug');
const moment = require('moment');
const _ = require('lodash');
const xlsx = require('node-xlsx');

const eventEmitter = require('../../conn/event');
const db = require('../../conn/sqldb');
const shipper = require('../../conn/shipper');

const {
  Country, Shipment, Package, Address, PackageCharge, ShipmentMeta, Notification, ShipmentIssue,
  PackageState, Redemption, Coupon, LoyaltyHistory, User, LoyaltyPoint, Transaction, Locker,
  ShipmentState, Store, ShipmentType,
} = db;

const { SHIPPING_RATE } = require('../../config/environment');
const {
  SHIPMENT_STATE_ID_NAMES,
  SHIPMENT_STATE_IDS: {
    CANCELED, DELIVERED, DISPATCHED,
  },
  PACKAGE_STATE_IDS: { SHIP },
  LOYALTY_TYPE: {
    REDEEM,
  },
  PAYMENT_GATEWAY: { WIRE, WALLET, CASH },
} = require('../../config/constants');

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
          'mobile', 'email', 'phone', 'phone_code',
        ],
        include: [{
          model: Country,
          attributes: ['id', 'name', 'iso2'],
        }, {
          model: Locker,
          attributes: ['id', 'name', 'short_name', 'allocated_at'],
        }],
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
  // normal update
  // tracking update
  const { id } = req.params;
  const status = await Shipment.update(req.body, { where: { id } });
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
        nextStateId: SHIP,
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
  const key = `${countryId}-${weight}-${type}`;
  log('calcShipping', key);
  return JSON.parse(SHIPPING_RATE)[key];
};


const getEstimation = async (packageIds, countryId, userId) => {
  const packages = await Package.findAll({
    include: [{
      model: PackageCharge,
    }],
    where: {
      customer_id: userId,
      id: packageIds,
    },
  });

  const country = await Country
    .findById(countryId, {
      attributes: ['discount_percentage'],
    });

  const shipping = {
    price: 0,
    weight: 0,
    sub_total: 0,
    estimated: 0,
    level: 0,
    count: packages.length,
  };

  packages.forEach((p) => {
    const pack = p.toJSON();
    shipping.price += pack.price;
    shipping.weight += pack.weight;

    const packageCharge = pack.PackageCharge || {};

    const keys = [
      'storage_amount', 'wrong_address_amount', 'special_handling_amount', 'receive_mail_amount',
      'pickup_amount', 'basic_photo_amount', 'advanced_photo_amount', 'split_package_amount',
      'scan_document_amount',
    ];

    shipping.level += keys.reduce((nxt, key) => (nxt + (packageCharge[key] || 0)), 0);

    const shippingCharge = calcShipping(countryId, pack.weight, pack.type);

    if (shippingCharge) {
      shipping.sub_total += shippingCharge;
    }
  });

  shipping.discount = (country.discount_percentage / 100) * shipping.sub_total;
  let estimated = shipping.sub_total - shipping.discount;
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
        state_id: SHIP,
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
  shipment.count = shipping.count;
  shipment.weight = shipping.weight;
  shipment.value = shipping.price;
  shipment.discount = shipping.discount;
  shipment.package_level_charges = shipping.level;
  shipment.sub_total = shipping.sub_total;
  shipment.estimated = shipping.estimated;
  shipment.final_amount = 0;

  shipment.payment_gateway_name = 'pending';
  shipment.payment_status = 'pending';
  shipment.status = 'inreview';

  const orderId = `${moment().format('YYYYMMDDHHmmss')}-${userId}`;

  shipment.order_id = orderId;
  return Shipment
    .create(shipment);
};

const saveShipmentMeta = ({ req, sR, packageIds }) => {
  const meta = Object.assign({ shipment_id: sR.id }, req.body);
  meta.repacking_charge_amount = (req.repack === 1) ? 100.00 : 0;
  meta.sticker_charge_amount = (req.sticker === 1) ? 0 : 0;
  meta.sticker_charge_amount = 0;

  if (packageIds.length) {
    meta.consolid = '1';
    meta.consolidation_charge_amount = (packageIds.length - 1) * 100.00;
  }

  meta.gift_wrap_charge_amount = (req.gift_wrap === 1) ? 100.00 : 0;
  meta.gift_note_charge_amount = (req.gift_note === 1) ? 50.00 : 0;

  meta.extra_packing_charge_amount = (req.extra_packing === 1) ? 500.00 : 0;

  if (req.liquid === '1') {
    if (req.weight < 5) {
      meta.liquid_charge_amount = 1150.00;
    }
    if (req.weight >= 5 && req.weight < 10
    ) {
      meta.liquid_charge_amount = 1650.00;
    }
    if (req.weight >= 10 && req.weight < 15
    ) {
      meta.liquid_charge_amount = 2750.00;
    }
    if (req.weight >= 15) {
      meta.liquid_charge_amount = 3150.00;
    }
  }
  meta.proforma_taxid = req.invoice_taxid;
  meta.proforma_personal = req.invoice_personal;
  meta.invoice_include = req.invoice_include;
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
    const { package_ids: packageIds } = req.body;
    const packages = await getPackages(userId, packageIds);

    if (!packages.length) return res.status(400).json({ message: 'No Packages Found.' });

    const address = await Address.findById(req.body.address_id);

    const toAddress = await getAddress(address);

    const shipping = await getEstimation(packageIds, address.country_id, userId);

    const sR = await saveShipment({
      userId, address, toAddress, shipping,
    });

    const shipmentMeta = await saveShipmentMeta({ req, sR, packageIds });

    const updateShip = await updateShipment({ shipmentMeta, sR });

    updatePackages(sR.id, packageIds);

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

const walletTransaction = async (walletAmount, customer, shipment) => {
  const transaction = {};
  transaction.customer_id = customer.id;
  // transaction.wallet_id = $customer->balance->id;
  transaction.amount = walletAmount;
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
    payment.wallet = customer.wallet_balance_amount;
    payment.final_amount -= payment.wallet;
  }

  const redemptionOptions = {
    attributes: ['coupon_code'],
    where: { shipment_order_code: shipment.order_code },
  };

  const couponAppliedStatus = await Redemption
    .find(redemptionOptions);
  // let promo_status = '';
  let couponAmount = 0;
  // let coupon_name = '';

  const couponOptions = {
    attributes: ['id', 'code', 'cashback_percentage', 'discount_percentage'],
    where: {
      code: couponAppliedStatus.coupon_code,
      expires_at: {
        $gt: new Date(),
      },
    },
  };

  if (couponAppliedStatus) {
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
    if (isWalletUsed === 1) {
      await User
        .update(
          { wallet_balance_amount: 0 },
          { where: { id: customerId } },
        );
    }
  } else if (paymentGatewayName === 'cash') {
    shipmentSave.payment_gateway_id = CASH;
    shipmentSave.status = 'inqueue';
    shipmentSave.payment_status = 'pending';
    if (isWalletUsed === 1) {
      await User
        .update(
          { wallet_balance_amount: 0 },
          { where: { id: customerId } },
        );
    }
  } else if (paymentGatewayName === 'wallet') {
    log('remainingWalletAmount', WALLET);
    shipmentSave.payment_gateway_id = WALLET;
    shipmentSave.status = 'inqueue';
    shipmentSave.payment_status = 'success';
    const customerTotalWalletAmount = customer.wallet_balance_amount;
    const remainingWalletAmount = customerTotalWalletAmount - payment.final_amount;
    log('remainingWalletAmount', remainingWalletAmount);

    await User
      .update(
        { wallet_balance_amount: remainingWalletAmount },
        { where: { id: customerId } },
      );

    await updateCustomerWallet(shipment, customerId);
    await walletTransaction(payment.final_amount, customer, shipment);
  } else {
    shipmentSave.payment_status = 'pending';
    shipmentSave.status = 'confirmation';
  }
  const shipments = await Shipment
    .update(shipmentSave, { where: { id: shipRequestId } });

  if (shipmentSave.wallet !== 0) {
    await walletTransaction(shipment.wallet, customer, shipment);
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

  // const getPaymentURL = () => '/payment.axis.start';
  // switch (paymentGatewayName) {
  //   case 'card':
  //     return res.redirect(getPaymentURL('payment.axis.start'));
  //   case 'paypal':
  //     return res.redirect(getPaymentURL('payment.paypal.start'));
  //   case 'paytm':
  //     return res.redirect(getPaymentURL('payment.paytm.start'));
  //   default:
  //     return res.redirect(getPaymentURL('shipping.request.response'));
  // }
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
      attributes: ['id', 'estimated_amount',
        'customer_id', 'order_code', 'wallet_amount', 'loyalty_amount', 'coupon_amount',
      ],
    });

  if (shipment && shipment.customer_id === customerId) {
    payment.coupon = 0;
    payment.final_amount = 0;

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
      req.user.is_retry_payment = 0;
    }
    // end

    if (req.body.payment_gateway_name === 'wallet') {
      shipmentSave.payment_gateway_id = WALLET;
      shipmentSave.status = 'inqueue';
      shipmentSave.payment_status = 'success';
    }

    shipmentSave.wallet = shipmentWalletAmount;

    shipmentSave.final_amount = payment.final_amount -
      shipment.wallet_amount - shipment.loyalty_amount - shipment.coupon_amount;

    req.user.ship_request_id = shipment.id;
    const savedShipment = await Shipment
      .update(shipmentSave, { where: { id: shipRequestId } });

    if (customerWalletAmount > 0) {
      await walletTransaction(customerWalletAmount, customer, shipment);
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
        if (req.body.wallet) {
          await User.update({ wallet_balance_amount: 0 }, { where: { id: customerId } });
        }

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
        if (req.body.wallet) {
          await User.update({ wallet_balance_amount: 0 }, { where: { id: customerId } });
        }

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
        customerTotalWalletAmount = customer.wallet_balance_amount || 0;
        log('savedShipment.wallet_amount', savedShipment.wallet_amount || 0);
        totalShipmentAmount =
          payment.final_amount - savedShipment.wallet_amount || 0 -
          savedShipment.loyalty_amount || 0 - savedShipment.coupon_amount || 0;
        remainingWalletAmount =
          customerTotalWalletAmount - totalShipmentAmount;
        log('remainingWalletAmount', remainingWalletAmount);
        await User.update({
          wallet_balance_amount: remainingWalletAmount,
        }, {
          where:
              {
                id: customerId,
              },
        });
        await walletTransaction(payment.final_amount, customer, savedShipment);
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

  const customer = await User
    .findById(customerId, {
      attributes: ['id', 'wallet_balance_amount'],
      raw: true,
    });

  const optionShipment = {
    attributes: ['id', 'estimated_amount', 'payment_gateway_fee_amount'],
    where: { customer_id: customerId, order_code: orderCode, payment_status: ['failed', 'pending'] },
  };

  const shipment = await Shipment
    .find(optionShipment);

  if (!shipment) {
    return res.status(400).json({ message: 'shipment not found' });
  }

  const optionPackage = {
    attributes: ['id'],
    where: { customer_id: customerId, shipment_id: shipment.id },
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

  if (req.body.wallet === 1) {
    payment.amount -= customer.wallet_balance_amount;
  }
  payment.wallet = customer.wallet_balance_amount;
  payment.amount -= shipment.loyalty_amount;

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
    } else {
      promoStatus = 'promo_expired';
    }
  }
  switch (req.body.payment_gateway_name) {
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
      break;
    case 'paytm':
      payment.paymentGatewayName = 'paytm';
      payment.paymentGatewayFee = (3 / 100) * payment.amount;
      payment.amount += payment.paymentGatewayFee;
      break;
    default:
      payment.paymentGatewayName = 'wire';
      break;
  }

  return res.json({
    shipment,
    packages,
    payment,
    promoStatus,
    couponAmount,
    couponName,
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
    attributes: ['id', 'estimated_amount', 'package_level_charges_Amount'],
    where: {
      customer_id: customerId,
      order_code: orderCode,
      status: 'confirmation',
    },
  };

  const shipment = await Shipment
    .find(optionsShipment);

  if (!shipment) {
    return res.status(400).json({ message: 'shipment not found' });
  }

  const optionsPackage = {
    attributes: ['id', 'price_amount', 'weight', 'order_code'],
    where: {
      customer_id: customerId,
      shipment_id: shipment.id,
    },
  };
  const packages = await Package
    .find(optionsPackage);

  const payment = {
    wallet: 0,
    coupon: 0,
    loyalty: 0,
    amount: 0,
    payment_gateway_name: 'wire',
    payment_gateway_fee: 0,
  };

  payment.amount = shipment.estimated_amount;
  if (customer.wallet_balance_amount < 0) {
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

  switch (req.body.payment_gateway_name) {
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

  return res.json({
    shipment,
    packages,
    payment,
    promoStatus,
    couponAmount,
    couponName,
    walletAmount: customer.wallet_balance_amount,
  });
};

exports.createShipment = async (req, res) => {
  const customerId = req.user.id;
  log('createShipment.customerId', customerId);

  if (!req.user.package_ids) {
    log('createshipments-package-ids', req.user.package_ids);
    res.status(400).json({ message: 'package is not found' });
  }

  log('createshipments-package-ids', req.user.package_ids);
  const packageIds = req.user.package_ids;
  const { options } = req.user;
  const optionPackage = {
    attributes: ['id'],
    where: { customer_id: customerId, id: packageIds },
    include: [{
      model: PackageCharge,
      attributes: ['storage_amount', 'wrong_address_amount', 'special_handling_amount',
        'receive_mail_amount', 'pickup_amount', 'basic_photo_amount',
        'advanced_photo_amount', 'split_package_amount', 'scan_document_amount'],
    }],
  };

  const packages = await Package
    .findAll(optionPackage);

  let consolidationChargesAmount = 0;
  if (!packages) {
    res.redirect('customer.locker').status(400).json({ message: 'package not found' });
  }
  log('packageIds.split ', packageIds.length);
  if (packageIds.length > 1) {
    consolidationChargesAmount = (packageIds.length - 1) * 100.00;
  }
  const charges = {
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

  let pack = '';
  // eslint-disable-next-line no-restricted-syntax
  for (pack of packages) {
    charges.storage_amount += pack.storage_amount || 0;
    charges.photo_amount += pack.basic_photo_amount || 0 + pack.advanced_photo_amount || 0;
    charges.pickup_amount += pack.pickup_amount || 0;
    charges.special_handling_amount += pack.special_handling_amount || 0;
    charges.doc += pack.doc || 0;
    charges.split_package_amount += pack.split_package_amount || 0;
    charges.wrong_address_amount += pack.wrong_address_amount || 0;
    charges.scan_document_amount += pack.scan_document_amount || 0;
    log('adding package charges', charges);
  }
  log('charges', charges);

  let extrapackAmount = 0;
  if (options.extra_packing === 1) {
    extrapackAmount = 500.00;
  }
  const repackAmount = (options.repack === 1) ? 100.00 : 0;
  const stickerAmount = (options.sticker === 1) ? 0.00 : 0;
  const originalAmount = 0;
  const giftwrapAmount = (options.gift_wrap === 1) ? 100.00 : 0;
  const giftnoteAmount = (options.gift_note === 1) ? 50.00 : 0;

  charges.optsAmount = repackAmount + stickerAmount +
    extrapackAmount + originalAmount + giftwrapAmount + giftnoteAmount;

  const addresses = Address
    .find(
      { attributes: ['salutation', 'first_name', 'last_name', 'line1', 'line2', 'state'] },
      { where: { customer_id: customerId } },
    );

  const customer = User
    .find(
      { attributes: ['salutation', 'first_name', 'last_name', 'email', 'virtual_address_code', 'phone_code'] },
      { where: { id: customerId } },
    );

  const optionCountrty = {
    attributes: req.query.fl
      ? req.query.fl.split(',')
      : ['id', 'name', 'slug', 'phone_code'],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };

  const countries = Country
    .find(optionCountrty);

  res.json(packages, addresses, options, charges, customer, countries);
};

exports.redirectShipment = async (req, res) => {
  const customerId = req.user.id;
  const packageIds = req.body.package_ids;
  log('redirectShipment.packageIds', packageIds);
  const option = {
    attributes: ['id', 'content_type', 'created_at'],
    where: {
      id: packageIds,
      customer_id: customerId,
    },
    include: [{
      model: PackageState,
      attributes: [],
      where: {
        state_id: SHIP,
      },
    }],
  };
  log('redirectShipment.packageIds', packageIds);
  const checkLiquid = [];

  const packages = await Package
    .findAll(option);

  log('redirectShipment.packages length', Package.length);

  if (!packages.length) {
    return res.status(200).json({ message: 'package not found' });
  }

  let pack = '';
  // eslint-disable-next-line no-restricted-syntax
  for (pack of packages) {
    checkLiquid[pack.id] = (pack.content_type === '2') ? '1' : '0';
    const expireDate = moment(pack.created_at, 'DD-MM-YYYY').add(20, 'days');
    log('redirectShipment.checkLiquid[pack.id]', checkLiquid[pack.id]);

    if (moment() > expireDate) {
      const todayDate = moment();
      const interval = todayDate.diff(pack.created_at, 'days');
      log('redirectShipment.interval', interval);
      log('redirectShipment.today date', moment());
      log('redirectShipment.expireDate date', expireDate);
      log('redirectShipment.created_at date', pack.created_at);
      const storageCharge = (interval - 20) * 100;

      PackageCharge
        .update(
          { storage_amount: storageCharge },
          { where: { id: pack.id } },
        );

      log('redirectShipment.PackageCharge', checkLiquid[pack.id]);
    }
  }

  log('redirectShipment.checkLiquid-test', checkLiquid);

  const arrayIntersect = _.intersection(checkLiquid, ['1', '0']);
  log('redirectShipment.arrayIntersect', arrayIntersect);
  let liquid = '';

  if (arrayIntersect.length === 2) {
    log('redirectShipment.Packages containing special items must be chosen and shipped separately');
    return res.json({ error: 'Packages containing special items must be chosen and shipped separately' });
  }

  liquid = checkLiquid.includes('1') ? '1' : '0';
  log('redirectShipment.liquid', liquid);

  const options = {
    repack: req.body.repack,
    sticker: req.body.sticker,
    extra_packing: req.body.extra_packing,
    orginal_box: req.body.orginal_box,
    gift_wrap: req.body.gift_wrap,
    gift_note: req.body.gift_note,
    giftnote_txt: req.body.giftnote_txt,
    liquid,
    max_weight: req.body.max_weight,
    invoice_taxid: req.body.tax_id,
    mark_personal_use: req.body.mark_personal_use,
    invoice_include: req.body.invoice_include,
  };

  let address = '';
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
        return res.redirect('customer.address').json({ error: 'Ship request required address to proceed!' });
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
      return res.json({ error: 'Ship request required address to proceed!' });
    }
  }
  log('redirectShipment.testing break point');

  req.user.package_ids = packageIds;
  req.user.options = options;
  req.user.address = address;

  const result = await this.createShipment(req, res);
  return result;
};

exports.state = async (req, res, next) => {
  return Shipment
    .findById(req.params.id)
    .then((shpmnt) => {
      console.log({ shpmnt });
      if (!shpmnt.dispatch_date || !shpmnt.shipping_carrier || !shpmnt.number_of_packages ||
        !shpmnt.weight_by_shipping_partner ||
        !shpmnt.value_by_shipping_partner || !shpmnt.tracking_code) {
        console.log('You must update Shipment Tracking Information to send dispatch notification!');
        return res.json({
          error: 'You must update Shipment Tracking Information to send dispatch notification!',
        });
      }

      return Shipment
        .updateShipmentState({
          db,
          shpmnt,
          actingUser: req.user,
          nextStateId: req.body.state_id,
          comments: req.body.comments,
        })
        .then(status => res.json(status));
    })
.catch(next);
};
