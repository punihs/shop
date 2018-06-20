const debug = require('debug');
const moment = require('moment');

const eventEmitter = require('../../conn/event');
const db = require('../../conn/sqldb');

const {
  Country, Shipment, Package, Address, PackageMeta, ShipmentMeta, Notification, ShipmentIssue,
  PackageState, Redemption, Coupon, LoyaltyHistory, User, LoyaltyPoint, Transaction,
} = db;

const { SHIPPING_RATE } = require('../../config/environment');
const {
  SHIPMENT_STATE_IDS: {
    CANCELED, DELIVERED, DISPATCHED,
  },
  PACKAGE_STATE_IDS: { SHIP },
  LOYALTY_TYPE: {
    REDEEM,
  },
  PAYMENT_GATEWAY: { WIRE, WALLET, CASH },
} = require('../../config/constants');

const log = debug('s.shipment.controller');

exports.index = (req, res, next) => {
  const options = {
    limit: Number(req.query.limit) || 20,
    attributes: ['id', 'number_of_packages'],
  };
  if (req.query.customer_id) {
    options.where = { customer_id: req.query.customer_id };
  }
  if (req.query.status) {
    options.where = { status: req.query.status };
  }

  return Shipment
    .findAll(options)
    .then(shipments => res.json(shipments))
    .catch(next);
};

exports.show = (req, res) => Shipment.findById(req.params.id).then(shipment => res.json(shipment));

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
    .findById(id);

  log('shipment id', shipment.status);
  if (![CANCELED, DELIVERED, DISPATCHED].includes(shipment.status)) {
    return res.json({ message: `Can not delete item as it is already ${shipment.status}` });
  }

  await Promise.all(shipment.package_ids.split(',')
    .map(packageId => Package
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
      model: PackageMeta,
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

    const meta = pack.PackageMeta || {};

    const packageLevelCharges = meta.storage + meta.address + meta.handling + meta.pickup
      + meta.doc + meta.liquid + meta.basic_photo + meta.advance_photo
      + meta.split + meta.scan_doc;

    shipping.level += packageLevelCharges;

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
  meta.repack_amt = (req.repack === 1) ? 100.00 : 0;
  meta.sticker_amt = (req.sticker === 1) ? 0 : 0;
  meta.original_amt = 0;

  if (packageIds.length) {
    meta.consolid = '1';
    meta.consolid_amt = (packageIds.length - 1) * 100.00;
  }

  meta.giftwrap_amt = (req.gift_wrap === 1) ? 100.00 : 0;
  meta.giftnote_amt = (req.gift_note === 1) ? 50.00 : 0;

  meta.extrapack_amt = (req.extrapack === 1) ? 500.00 : 0;

  if (req.liquid === '1') {
    if (req.weight < 5) {
      meta.liquid_amt = 1150.00;
    }
    if (req.weight >= 5 && req.weight < 10
    ) {
      meta.liquid_amt = 1650.00;
    }
    if (req.weight >= 10 && req.weight < 15
    ) {
      meta.liquid_amt = 2750.00;
    }
    if (req.weight >= 15) {
      meta.liquid_amt = 3150.00;
    }
  }
  meta.profoma_taxid = req.invoice_taxid;
  meta.profoma_personal = req.invoice_personal;
  meta.invoice_include = req.invoice_include;
  return ShipmentMeta.create(meta);
};

const updateShipment = async ({ sR, shipmentMeta }) => {
  let packageLevelCharges = sR.package_level_charges;

  packageLevelCharges += shipmentMeta.repack_amt + shipmentMeta.sticker_amt
    + shipmentMeta.extrapack_amt + shipmentMeta.original_amt + shipmentMeta.giftwrap_amt
    + shipmentMeta.giftnote_amt + shipmentMeta.consolid_amt;

  packageLevelCharges += shipmentMeta.liquid_amt;

  const updateShip = await Shipment.findById(sR.id);

  let { estimated } = updateShip;
  estimated -= sR.package_level_charges;
  estimated += packageLevelCharges;

  updateShip.packageLevelCharges = packageLevelCharges;
  updateShip.estimated = estimated;
  return sR.update(updateShip);
};

const updatePackages = packageIds => Package.update({
  status: 'processing',
}, {
  where: { id: packageIds },
});


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

    updatePackages(packageIds);

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
      'order_code', 'package_ids', 'customer_name', 'address',
      'phone', 'packages_count', 'weight', 'estimated_amount',
    ],
    where: { status: ['inqueue', 'inreview', 'received', 'confirmation'] },
  };
  await Shipment.find(options)
    .then(shipment =>
      res.status(201).json({ shipment }));
};

exports.history = async (req, res) => {
  const options = {
    attributes: [
      'order_code', 'package_ids', 'customer_name', 'address', 'status', 'tracking_code', 'dispatch_date',
      'shipping_carrier', 'tracking_url',
      'phone', 'packages_count', 'weight', 'estimated_amount', 'created_at', 'final_amount',
    ],
    where: { status: ['dispatched', 'delivered', 'canceled', 'refunded'] },
  };
  await Shipment.find(options)
    .then(shipmentHistory =>
      res.status(201).json({ shipmentHistory }));
};

exports.cancelRequest = async (req, res) => {
  const cutomerId = req.body.cutomer_id;
  const orderCode = req.body.order_code;
  const options = {
    attributes: ['id', 'created_at', 'package_ids'],
    where: { customer_id: cutomerId, status: ['inreview', 'inqueue'], order_code: orderCode },
  };

  const shipment = await Shipment
    .find(options);

  if (moment(shipment.created_at).diff(moment(), 'hours') <= 1) {
    await Shipment
      .update({ status: 'canceled' }, { where: { id: shipment.id } });
    await Package
      .update({ status: 'ship' }, { where: { id: [shipment.package_ids.split((','))] } });

    const notification = {};
    notification.customer_id = cutomerId;
    notification.action_type = 'shipment';
    notification.action_id = shipment.id;
    notification.action_description = `Shipment request cancelled - Order#  ${shipment.order_code}`;
    await Notification.create(notification)
      .then(() => res.status(201).json({ message: 'Ship request has been cancelled!', shipment }));
  }
};

exports.invoice = async (req, res) => {
  const { id } = req.params;
  let packages;
  const shipment = await Shipment
    .find({ where: { order_code: id } });
  if (shipment) {
    packages = await Package
      .findAll({ where: { id: shipment.package_ids.split(',') } });
  }
  return res.status(201).json({ packages, shipment });
};


const updatePromoStatus = async (shipment) => {
  const couponAppliedStatus = await Redemption
    .find({ where: { shipment_order_code: shipment.order_code } });

  if (couponAppliedStatus) {
    const option = {
      where: {
        code: couponAppliedStatus.coupon_code,
        expires_at: {
          gt: new Date(),
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
  const shipRequestId = req.body.ship_request_id;
  const shipOptions = {
    attributes: ['id', 'package_ids', 'customer_id', 'estimated_amount', 'order_code'],
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
  // const options = {
  //   attributes: ['points', 'customer_Id'],
  //   where: { customer_Id: customerId },
  // };
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
    attributes: ['id', 'code'],
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
        payment.coupon = estimatedAmount * (promo.discount / 100);
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
  const shipRequestId = req.body.ship_request_id;
  log('payRetrySubmit', shipRequestId);
  const shipmentSave = {};
  
  const shipment = await Shipment
    .findById(shipRequestId, {
      attributes: ['id', 'package_ids', 'estimated_amount',
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
  
}

exports.retryPayment = async (req, res) => {
  const customerId = req.user.id;
  const orderCode = req.query.order_code;


  const customer = await User
    .findById(customerId, {
      attributes: ['id', 'wallet_balance_amount'],
      raw: true,
    });

  const payment = {};

const optionShipment = {
    attributes: ['id', 'estimated_amount', 'payment_gateway_fee_amount', 'package_ids'],
    where: { customer_id: customerId, order_code: orderCode, payment_status: ['failed', 'pending'] },
  };

  const shipment = await Shipment
    .find(optionShipment);

  if (!shipment) {
    return res.status(400).json({ message: 'shipment not found' });
  }

  const optionPackage = {
    attributes: ['id'],
    where: { customer_id: customerId, id: shipment.package_ids.split(',') },
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
