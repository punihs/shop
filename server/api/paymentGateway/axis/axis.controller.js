const debug = require('debug');
const rp = require('request-promise');
const _ = require('lodash');
const transaction = require('../../transaction/transaction.controller');

const { TRANSACTION_TYPES: { DEBIT } } = require('../../../config/constants');

const log = debug('s.axis.controller');
const {
  User, Shipment, Notification, Redemption, Coupon,
} = require('../../../conn/sqldb');

// exports.create = async (req, res) => {
//   const customerId = req.user.id;
//
//   const customer = await User
//     .findById(customerId, {
//       attributes: ['id', 'wallet_balance_amount', 'virtual_address_code'],
//       raw: true,
//     });
//   log('customer', customer);
//
//   // Todo: remove below three line after completion of testing
//   req.user.ship_request_id = 11;
//   req.user.is_wallet_used = 1;
//   req.user.is_retry_payment = 1;
//   log('shipRequestId', req.user.ship_request_id);
//   const shipRequestId = req.user.ship_request_id;
//   const isWalletUsed = req.user.is_wallet_used;
//   const isRetryPayment = req.user.is_retry_payment;
//
//   const shipment = await Shipment
//     .findById(shipRequestId, {
//       attributes: ['id', 'estimated_amount',
//         'order_code', 'final_amount', 'payment_gateway_fee_amount',
//         'customer_id', 'order_code',
//          'wallet_amount', 'loyalty_amount', 'coupon_amount', 'phone'],
//     });
//
//   let finalAmount = 1;
//   if (!shipment) {
//     return res.status(400).json({ message: 'Shipment not found' });
//   }
//
//   if (shipment.customer_id !== customerId) {
//     return res.status(400).json({ message: 'Unauthorized customer transaction' });
//   }
//
//   log('shipment.final_amount ', shipment.final_amount);
//   if (shipment.payment_gateway_fee_amount) {
//     finalAmount = shipment.final_amount - shipment.payment_gateway_fee_amount || 0;
//   } else {
//     finalAmount = shipment.final_amount;
//   }
//
//   if (isWalletUsed === 1 && isRetryPayment === 1) {
//     const customerWalletAmount = customer.wallet_balance_amount || 0;
//     finalAmount -= customerWalletAmount;
//   }
//   const orderInfo = `SHIPMENT#${shipment.order_code}`;
//   const MerchTxnRef = `SHIP${shipment.customer_id}`;
//
//   log('before calling cp.shoppre.com/axis');
//   const encryptedData = await this.callPHPApi(finalAmount, orderInfo, MerchTxnRef);
//   log('***encryptedData', encryptedData);
//   return res.json(encryptedData);
// };
//
// exports.paymentSubmit = async (req, res, next) => { // - direct payment initiation
//   let maxId = '';
//   await DirectPayment
//     .create(_.omit(req.body, ['_token']))
//     .then((directPayment) => { log(directPayment.id); maxId = directPayment.id; })
//     .catch(next);
//   res.json({ paymentId: maxId });
// };
//
// exports.directPaymentInitiate = async (req, res) => {
//   const paymentId = req.body.payment_id;
//   req.user.payment_id = paymentId;
//
//   const paymentDetail = await DirectPayment
//     .findById(paymentId, { attributes: ['id', 'amount'] });
//
//   if (!paymentDetail) {
//     return res.status(400).json({ message: 'Unauthorized customer transaction' });
//   }
//   log('paymentDetail.amount', paymentDetail.amount);
//
//   log('before calling cp.shoppre.com/axis/direct initiatepayment');
//
//   const finalAmount = paymentDetail.amount;
//   const orderInfo = `DPAYMENT#${paymentId}`;
//   const MerchTxnRef = `SHIP${paymentId}`;
//
//   const encryptedData = await this.callPHPApi(finalAmount, orderInfo, MerchTxnRef);
//   log('***encryptedData', encryptedData);
//   return res.json(encryptedData);
// };
//
// exports.callPHPApi = async (amount, orderInfo, MerchTxnRef, redirecturl) => {
//   let encriptValue = '';
//   const options = {
//     uri: 'https://cp.shoppre.com/axis',
//     query: {
//       orderInfo,
//       amount,
//       MerchTxnRef,
//       redirecturl,
//     },
//   };
//
//   await rp(options)
//     .then((encryptedData) => {
//       log(encryptedData);
//       encriptValue = encryptedData;
//     });
//
//   return encriptValue;
// };
//
//
// const callPHPApi = async (amount, orderInfo, MerchTxnRef, redirecturl) => {
//   let encriptValue = '';
//   const options = {
//     uri: 'https://cp.shoppre.com/axis',
//     query: {
//       orderInfo,
//       amount,
//       MerchTxnRef,
//       redirecturl,
//     },
//   };
//
//   await rp(options)
//     .then((encryptedData) => {
//       log(encryptedData);
//       encriptValue = encryptedData;
//     });
//
//   return encriptValue;
// };

exports.create = async (req, res) => {
  const customerId = req.user.id;

  const customer = await User
    .findById(customerId, {
      attributes: ['id', 'wallet_balance_amount', 'virtual_address_code'],
      raw: true,
    });
  log('customer', customer);

  // Todo: remove below three line after completion of testing
  // req.user.ship_request_id = 11;
  // req.user.is_wallet_used = 1;
  // req.user.is_retry_payment = 1;
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

  let finalAmount = 1;
  if (!shipment) {
    return res.status(400).json({ message: 'Shipment not found' });
  }

  if (shipment.customer_id !== customerId) {
    return res.status(400).json({ message: 'Unauthorized customer transaction' });
  }
  log('finalAmount ', finalAmount);

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
  // const orderInfo = `SHIPMENT#${shipment.order_code}`;
  // const MerchTxnRef = `SHIP${shipment.customer_id}`;
  //
  // // const redirecturl = `https://myaccount.shoppre.com/complete?orderInfo=${orderInfo}`;
  // const redirecturl = `https://api.shoppre.test/api/paymentgateway/sucess?statuscomplete?orderInfo=${orderInfo}`;
  //
  // const amount = 1;
  // const encryptedData = await callPHPApi(amount, orderInfo, MerchTxnRef, redirecturl);
  // log('***encryptedData', encryptedData);
  // return res.render('axis', {encryptedData, vpc_MerchantId: '13I000000000978'});
  // return res.json({ encryptedData, vpc_MerchantId: '13I000000000978' });
  return res.json('https://cp.shoppre.com/axis/api.php?final_amount=1');
};

const verify = body => rp({
  method: 'POST',
  url: 'https://cp.shoppre.com/axis/api-success.php',
  body,
});

exports.reponse = async (req, res) => {
  let result = '';
  log(req.body, req.query);
  verify(req.body)
    .then((response) => {
      result = response;
    })
    .catch((err) => {
      res.status(500).json(err);
    });
  const customerId = req.user.id;
  const customer = await User
    .findById(customerId, {
      attributes: ['id', 'wallet_balance_amount'],
    });

  // todo: delete this line after done
  log('ship-id', req.user.ship_request_id);
  const shipRequestId = req.user.ship_request_id;
  const isWalletUsed = req.user.is_wallet_used;
  const isRetryPayment = req.user.is_retry_payment;

  const shipment = await Shipment
    .findById(shipRequestId, {
      attributes: ['id', 'final_amount', 'payment_gateway_fee_amount', 'customer_id'],
    });

  log('shipment.customer_id', shipment.customer_id);
  if (!shipment && !shipment.customer_id === customerId) {
    return res.status(400).json({ error: 'Unauthorized customer transaction!' });
  }
  let finalAmount = 0;
  if (shipment && shipment.customer_id === customerId) {
    if (shipment.payment_gateway_fee) {
      finalAmount = shipment.final_amount - shipment.payment_gateway_fee_amount;
    } else {
      finalAmount = shipment.final_amount;
    }
    if (result.vpc_TxnResponseCode === '0') {
      let wallet = shipment.wallet_amount;
      if (isWalletUsed === 1 && isRetryPayment === 1) {
        const customerWalletAmount = customer.wallet_balance_amount;
        log('customer.wallet_balance_amount', customer.wallet_balance_amount);
        finalAmount -= customerWalletAmount;
        log('shipment.wallet_amount', shipment.wallet_amount);
        wallet = shipment.wallet_amount + customerWalletAmount;
        // ShopperBalance::where('customer_id', $customer_id)->update(['amount' => 0]);
        await transaction.create(customerWalletAmount, customerId, shipment, DEBIT);
      }
      // ShipRequest::where('id', $ship_request_id)
      const shipmentUpdate = {};
      shipmentUpdate.payment_gateway_fee_amount = 0;
      shipmentUpdate.status = 'inqueue';
      shipmentUpdate.final_amount = finalAmount;
      shipmentUpdate.wallet_amount = wallet;
      shipmentUpdate.payment_gateway_name = 'paytm';
      shipmentUpdate.payment_status = 'success';
      shipmentUpdate.admin_info = 'Payment Successful!';
      shipmentUpdate.admin_read = 'no';
      log('shipmentUpdate', shipmentUpdate);
      await Shipment.update(shipmentUpdate, { where: { id: shipRequestId } });

      const notification = {};
      notification.customer_id = customerId;
      notification.action_type = 'shipment';
      notification.action_id = shipmentUpdate.id;
      notification.action_description = 'Shipment Payment Successful - PayTm';
      await Notification.create(notification);

      const options = {
        attributes: ['id'],
        where: { shipment_order_code: shipmentUpdate.order_code },
      };

      const couponAppliedStatus = await Redemption
        .find(options);
      if (couponAppliedStatus) {
        const optionCoupon = {
          where: {
            code: couponAppliedStatus.coupon_code,
            expires_at: {
              $gt: new Date(),
            },
          },
        };

        const promo = await Coupon
          .find(optionCoupon);

        let totalWalletAmount = '';

        if (promo) {
          if (promo.cashback_percentage) {
            totalWalletAmount = customer.wallet_balance_amount
              + (shipment.estimated_amount * (promo.cashback_percentage / 100));
            await User.update({
              wallet_balance_amount: totalWalletAmount,
            }, {
              where: { id: customerId },
            });

            await Redemption.update({
              status: 'success',
            }, {
              where: { shipment_order_code: shipment.order_code },
            });
          } else if (promo.discount_percentage) {
            await Redemption.update({
              status: 'success',
            }, {
              where: { shipment_order_code: shipment.order_code },
            });
          }
        }
      }
      // todo: don't delete
      // ShopperBalance::where('customer_id', $customer_id)->update(['amount' => 0]);

      return res.json({ message: 'success' });
    } else if (result.vpc_TxnResponseCode === 'Aborted') {
      await Shipment
        .update({
          payment_gateway_name: 'card',
          payment_status: 'failed',
          admin_info: 'Payment failed',
          admin_read: 'no',
        }, {
          where: { id: shipRequestId },
        });

      res.json({ error: 'Looks like you cancelled the payment. You can try again now or if you faced any issues in completing the payment, please contact us.' });
    } else {
      res.json({ error: 'Security Error! Payment Transaction Failed. Try again or contact us for support.' });
      await Shipment
        .update({
          payment_gateway_name: 'card',
          payment_status: 'failed',
          admin_info: 'Payment failed!',
          admin_read: 'no',
        }, {
          where: { id: shipRequestId },
        });

      // Mail::to($customer->email)->bcc('support@shoppre.com')->send(new PaymentFailed($shipment));

      return res.json({ error: 'Payment transaction failed! You can try again now or if you faced any issues in completing the payment, please contact us.' });
    }
  }
  return res.status(400).json({ error: 'Unauthorized customer transaction!' });
};
