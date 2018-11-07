const debug = require('debug');
const paytm = require('../paymentGateway/paytm/paytm.controller');
const axis = require('../paymentGateway/axis/axis.controller');
const paypal = require('../paymentGateway/paypal/paypal.controller');

const {
  Redemption, Coupon, User, PaymentGateway, Transaction,
} = require('../../conn/sqldb');
const transactionController = require('../transaction/transaction.controller');
const { URLS_PARCEL_API } = require('../../config/environment');
const {
  PAYMENT_GATEWAY: {
    WIRE, WALLET, CASH, PAYTM, CARD, PAYPAL,
  },
  REDEMTPION_OBJECT_IDS: {
    SHIPMENT,
  },
} = require('./../../config/constants');
const { URLS_PARCEL } = require('../../config/environment');
const {
  PAYMENT_GATEWAY,
} = require('../../config/constants/charges');

const log = debug('s-api-wallet-service');

const paymentGatewayChargesMap = {
  [CARD]: PAYMENT_GATEWAY.CARD,
  [PAYPAL]: PAYMENT_GATEWAY.PAYPAL,
  [WIRE]: PAYMENT_GATEWAY.WIRE,
  [CASH]: 0,
  [WALLET]: 0,
  [PAYTM]: PAYMENT_GATEWAY.PAYTM,
};


const paymentGatewaysMap = {
  [PAYTM]: paytm,
  [CARD]: axis,
  [PAYPAL]: paypal,
  [WALLET]: {
    create: (req, res, transaction) => {
      res.redirect(`${URLS_PARCEL_API}/api/transactions/${transaction.id}/complete?status=success`);
    },
  },
  [CASH]: {
    create: (req, res) => {
      res.redirect('pending_url');
    },
  },
  [WIRE]: {
    create: (req, res) => {
      res.redirect('pending_url');
    },
  },
};
const initiatePayment = (transaction, req, res) => {
  const gateWayId = Number(transaction.payment_gateway_id);
  const currentGateway = paymentGatewaysMap[gateWayId];
  if (!currentGateway) {
    return res.json({ message: `Payment Gateway: ${gateWayId} not supported` });
  }
  // return currentGateway.create(req, res, transaction);
  log({ message: 'payment.axis.start' });
  switch (Number(transaction.payment_gateway_id)) {
    case CARD: return axis.create(req, res, transaction);
    case PAYPAL: return paypal.create(req, res, transaction);
    default: return res.redirect(`${URLS_PARCEL}/shipRequests?message=Invalid Payment Gateway`);
  }
};


exports.show = async (req, res, next) => {
  const customerId = req.user.id;
  const { estimated: estimatedAmount, object_id: objectId } = req.query;
  try {
    const customer = await User
      .findById(customerId, {
        attributes: ['id', 'wallet_balance_amount'],
      });

    const payment = {
      wallet: 0,
      coupon: 0,
      loyalty: 0,
      amount: 0,
      payment_gateway_id: CARD,
      payment_gateway_fee: 0,
    };

    if (customer.wallet_balance_amount < 0 || req.query.wallet === '1') {
      log('wallet123123', customer.wallet_balance_amount);
      payment.wallet = customer.wallet_balance_amount;
      // - todo need to remove zero after wallet implementation
      payment.wallet = 0;
      payment.amount -= payment.wallet;
    }


    log('wallet outside1', customer.wallet_balance_amount);
    log('req.query.wallet1', req.query.wallet);

    const couponAppliedStatus = await Redemption
      .find({
        attributes: ['id', 'coupon_code'],
        where: { object_id: objectId, object_type_id: SHIPMENT },
      });

    let promoStatus = '';
    let couponAmount = 0;
    let couponName = '';

    if (couponAppliedStatus) {
      const promo = await Coupon
        .find({
          attributes: ['max_cashback_amount', 'cashback_percentage', 'discount_percentage'],
          where: {
            code: couponAppliedStatus.coupon_code,
            expires_at: {
              $gt: new Date(),
            },
          },
        });

      if (promo) {
        if (promo.cashback_percentage) {
          promoStatus = 'cashback_success';
          const estimated = estimatedAmount - payment.wallet;
          const totalCouponAmount = estimated * (promo.cashback_percentage / 100);
          const maxCouponAmount = promo.max_cashback_amount;
          if (totalCouponAmount <= maxCouponAmount) {
            couponAmount = totalCouponAmount;
          } else {
            couponAmount = maxCouponAmount;
          }
          couponName = couponAppliedStatus.coupon_code;
        } else if (promo.discount_percentage) {
          const estimated = estimatedAmount - payment.wallet;
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
    // - todo Loyalty required for next iteration.
    // const option = {
    //   attributes: ['points'],
    //   where: { customer_id: customerId },
    // };
    // const points = await LoyaltyPoint
    //   .find(option);
    //
    // let rewards = 0;
    // let loyaltyPoints = points.points;
    // while (loyaltyPoints >= 1000) {
    //   rewards += 100;
    //   loyaltyPoints -= 1000;
    // }
    //
    // payment.loyalty = rewards;
    payment.amount -= payment.loyalty || 0;
    switch (Number(req.query.payment_gateway_id)) {
      case CARD:
        payment.payment_gateway_id = CARD;
        payment.payment_gateway_fee = payment.amount *
          (paymentGatewayChargesMap[CARD] / 100);
        payment.amount += payment.payment_gateway_fee;
        break;
      case WIRE:
        payment.payment_gateway_id = WIRE;
        break;
      case CASH:
        payment.payment_gateway_id = CASH;
        break;
      case WALLET:
        payment.payment_gateway_id = WALLET;
        break;
      case PAYPAL:
        payment.payment_gateway_id = PAYPAL;
        payment.payment_gateway_fee = payment.amount *
          (paymentGatewayChargesMap[PAYPAL] / 100);
        payment.amount += payment.payment_gateway_fee;
        break;
      case PAYTM:
        payment.payment_gateway_id = PAYTM;
        payment.payment_gateway_fee = payment.amount *
          (paymentGatewayChargesMap[PAYTM] / 100);
        payment.amount += payment.payment_gateway_fee;
        break;
      default:
        payment.payment_gateway_id = null;
        break;
    }

    const paymentGateways = await PaymentGateway
      .findAll({
        attributes: ['id', 'name', 'description', 'value'],
        limit: 20,
      });

    log('payment gateway', JSON.stringify(payment));
    res.json({
      payment,
      promoStatus,
      couponAmount,
      couponName,
      paymentGateways,
      walletAmount: customer.wallet_balance_amount,
    });
  } catch (e) {
    next(e);
  }
};

const calculateDiscountsAndDeductions = async ({
  query, customerId, objectId, estimated,
}) => {
  const customer = await User
    .find({
      attributes: ['id', 'wallet_balance_amount'],
      where: { id: customerId },
    });
  const amountAgainstLoyaltyPoints = 0;

  let amountFromWallet = 0;
  if (query.is_wallet === 'true') {
    amountFromWallet = customer.wallet_balance_amount || 0;
  }

  const redemption = await Redemption
    .find({
      attributes: ['coupon_code'],
      where: { object_id: objectId, object_type_id: SHIPMENT },
    });

  let amountFromFlatDiscount = 0;
  let amountForCashback = 0;

  if (redemption) {
    const coupon = await Coupon
      .find({
        attributes: ['id', 'code', 'cashback_percentage', 'discount_percentage', 'max_cashback_amount'],
        where: {
          code: redemption.coupon_code,
          expires_at: {
            $gt: new Date(),
          },
        },
      });

    if (coupon) {
      if (coupon.cashback_percentage) { // given as cashback in wallet
        const couponAmount = estimated * (coupon.cashback_percentage / 100);
        amountForCashback = couponAmount;
      } else if (coupon.discount_percentage) {
        const shipmentCharge = estimated;
        // todo: - payment.wallet
        amountFromFlatDiscount = shipmentCharge * (coupon.discount_percentage / 100);
      }
    }
  }
  log('customer.wallet_balance_amount', customer.wallet_balance_amount);
  log({ amountAgainstLoyaltyPoints });
  log({ amountFromWallet });
  log({ amountFromFlatDiscount });
  log({ amountForCashback });

  return {
    amountInWallet: customer.wallet_balance_amount,
    amountAgainstLoyaltyPoints,
    amountFromWallet,
    amountFromFlatDiscount,
    amountForCashback,
  };
};
exports.create = async (req, res) => {
  const {
    uid: customerId,
    payment_gateway_id: paymentGatewayId,
    object_id: objectId,
    estimated: finalAmountWithPGFee,
    is_wallet: isWallet,
    paymentGatewayFeeAmount,
  } = req.query;
  const IS_WALLET = isWallet === '1';

  // - http://pay.shoppre.test/api/transactions/create?object_id=2&estimated=5&uid=647&payment_gateway_id=3&is_wallet=0
  // - Todo: cron for adding cashback to wallet as soon as delivered
  const {
    amountInWallet,
    amountAgainstLoyaltyPoints,
    amountFromWallet,
    amountFromFlatDiscount,
    amountForCashback,
  } = await calculateDiscountsAndDeductions({
    query: req.query, customerId, objectId, finalAmountWithPGFee,
  });
  log({ paymentGatewayId });

  const discount = amountAgainstLoyaltyPoints + amountFromFlatDiscount;

  const finalAmount = finalAmountWithPGFee - discount;
  // commented since PG is calculated from front end
  // const paymentGatewayFeeAmount = finalAmountWithoutPGFee *
  //   (paymentGatewayChargesMap[Number(paymentGatewayId)] / 100);
  // const finalAmount = finalAmountWithoutPGFee + paymentGatewayFeeAmount;
  // const finalAmount = finalAmountWithoutPGFee;
  log({ finalAmount, discount });
  if (IS_WALLET && amountInWallet < finalAmount) {
    await Transaction.create({
      object_name: 'shipment',
      object_id: objectId,
      payment_gateway_id: WALLET,
      amount: amountFromWallet,
      customer_id: req.query.id,
      final_amount: finalAmount,
      cashback_amount: amountForCashback,
      coupon_amount: amountFromFlatDiscount,
      wallet_amount: amountFromWallet,
      loyalty_amount: amountAgainstLoyaltyPoints,
      payment_gateway_fee_amount: paymentGatewayFeeAmount,
      payment_status: 'success',
    });
  }

  // - todo move payment success to completion controller method

  // [WALLET]: 'success',
  // - todo: add cashback amount

  // - todo: cron to add cashback amount
  // await updateCustomerWallet(shipment, customerId);

  // - Process Payment
  if (paymentGatewayId === WALLET && amountInWallet < finalAmount) {
    const msg = 'Insufficient funds in wallet.';
    return res
      .status(400)
      .json({
        message: `${msg} Required: ${finalAmount}, Balance in wallet: ${amountInWallet}`,
      });
  }

  log('shipment.wallet_amount', amountFromWallet);

  const transaction = await Transaction.create({
    object_name: 'shipment',
    object_id: objectId,
    payment_gateway_id: paymentGatewayId,
    amount: finalAmount,
    customer_id: customerId,
    final_amount: finalAmount,
    cashback_amount: amountForCashback,
    coupon_amount: amountFromFlatDiscount,
    wallet_amount: amountFromWallet,
    loyalty_amount: amountAgainstLoyaltyPoints,
    payment_gateway_fee_amount: paymentGatewayFeeAmount,
    payment_status: 'pending',
  });

  switch (Number(paymentGatewayId)) {
    case WIRE:
    case CASH:
    case WALLET: {
      const customer = await User
        .findById(transaction.customer_id, {
          attributes: ['id', 'wallet_balance_amount'],
        });
      const apiCBUrl = `${URLS_PARCEL_API}/api/public/shipments/${objectId}/response?uid=${customer.id}`;
      return transactionController.success({
        transaction,
        customer,
        isRetryPayment: 0,
        isWalletUsed: req.body.is_wallet,
        finalAmount,
        res,
        paymentGatewayId,
        apiCBUrl,
      });
    }

    default: return initiatePayment(transaction, req, res);
  }
};
