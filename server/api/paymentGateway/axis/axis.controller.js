const debug = require('debug');
const rp = require('request-promise');
const _ = require('lodash');

const log = debug('s.axis.controller');
const {
  User, Shipment, DirectPayment,
} = require('../../../conn/sqldb');

exports.create = async (req, res) => {
  const customerId = req.user.id;

  const customer = await User
    .findById(customerId, {
      attributes: ['id', 'wallet_balance_amount', 'virtual_address_code'],
      raw: true,
    });
  log('customer', customer);

  // Todo: remove below three line after completion of testing
  req.user.ship_request_id = 11;
  req.user.is_wallet_used = 1;
  req.user.is_retry_payment = 1;
  log('shipRequestId', req.user.ship_request_id);
  const shipRequestId = req.user.ship_request_id;
  const isWalletUsed = req.user.is_wallet_used;
  const isRetryPayment = req.user.is_retry_payment;

  const shipment = await Shipment
    .findById(shipRequestId, {
      attributes: ['id', 'estimated_amount',
        'order_code', 'final_amount', 'payment_gateway_fee_amount',
        'customer_id', 'order_code', 'wallet_amount', 'loyalty_amount', 'coupon_amount', 'phone'],
    });

  let finalAmount = 0;
  if (!shipment) {
    return res.status(400).json({ message: 'Shipment not found' });
  }

  if (shipment.customer_id !== customerId) {
    return res.status(400).json({ message: 'Unauthorized customer transaction' });
  }

  log('shipment.final_amount ', shipment.final_amount);
  if (shipment.payment_gateway_fee_amount) {
    finalAmount = shipment.final_amount - shipment.payment_gateway_fee_amount || 0;
  } else {
    finalAmount = shipment.final_amount;
  }

  if (isWalletUsed === 1 && isRetryPayment === 1) {
    const customerWalletAmount = customer.wallet_balance_amount || 0;
    finalAmount -= customerWalletAmount;
  }
  const orderInfo = `SHIPMENT#${shipment.order_code}`;
  const MerchTxnRef = `SHIP${shipment.customer_id}`;

  log('before calling cp.shoppre.com/axis');
  const encryptedData = await this.callPHPApi(finalAmount, orderInfo, MerchTxnRef);
  log('***encryptedData', encryptedData);
  return res.json(encryptedData);
};

exports.paymentSubmit = async (req, res, next) => { // - direct payment initiation
  let maxId = '';
  await DirectPayment
    .create(_.omit(req.body, ['_token']))
    .then((directPayment) => { log(directPayment.id); maxId = directPayment.id; })
    .catch(next);
  res.json({ paymentId: maxId });
};

exports.directPaymentInitiate = async (req, res) => {
  const paymentId = req.body.payment_id;
  req.user.payment_id = paymentId;

  const paymentDetail = await DirectPayment
    .findById(paymentId, { attributes: ['id', 'amount'] });

  if (!paymentDetail) {
    return res.status(400).json({ message: 'Unauthorized customer transaction' });
  }
  log('paymentDetail.amount', paymentDetail.amount);

  log('before calling cp.shoppre.com/axis/direct initiatepayment');

  const finalAmount = paymentDetail.amount;
  const orderInfo = `DPAYMENT#${paymentId}`;
  const MerchTxnRef = `SHIP${paymentId}`;

  const encryptedData = await this.callPHPApi(finalAmount, orderInfo, MerchTxnRef);
  log('***encryptedData', encryptedData);
  return res.json(encryptedData);
};

exports.callPHPApi = async (amount, orderInfo, MerchTxnRef) => {
  let encriptValue = '';
  const options = {
    uri: 'https://cp.shoppre.com/axis',
    query: {
      orderInfo,
      amount,
      MerchTxnRef,
    },
  };

  await rp(options)
    .then((encryptedData) => {
      log(encryptedData);
      encriptValue = encryptedData;
    });

  return encriptValue;
};

