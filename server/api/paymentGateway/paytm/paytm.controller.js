const moment = require('moment');
const debug = require('debug');
const checkSum = require('./paytm.checksum');
const transaction = require('../../transaction/transaction.controller');

const log = debug('s.paytm.controller');
const {
  User, Shipment, Notification, Redemption, Coupon,
} = require('../../../conn/sqldb');

const { paytm: { MID, KEY } } = require('../../../config/environment');
const { TRANSACTION_TYPES: { DEBIT } } = require('../../../config/constants');


exports.create = async (req, res) => {
  const customerId = req.user.id;
  const customer = await User
    .findById(customerId, {
      attributes: ['id', 'wallet_balance_amount', 'virtual_address_code'],
      raw: true,
    });
  log('customer', customer);

  // Todo: remove below one line after completion of testing
  req.user.ship_request_id = 11;
  log('shipRequestId', req.user.ship_request_id);
  const shipRequestId = req.user.ship_request_id;
  const isWalletUsed = req.user.is_wallet_used;
  const isRetryPayment = req.user.is_retry_payment;

  const shipment = await Shipment
    .findById(shipRequestId, {
      attributes: ['id', 'package_ids', 'estimated_amount',
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

  const paymentGatewayFee = (3 / 100) * finalAmount;
  finalAmount += Math.round(paymentGatewayFee);
  log('shipment.paymentGatewayFee ', Math.round(paymentGatewayFee));
  log('shipment.final_amount final', finalAmount);

  if (isWalletUsed === 1 && isRetryPayment === 1) {
    const customerWalletAmount = customer.wallet_balance_amount || 0;
    finalAmount -= customerWalletAmount;
  }

  const paramList = {};
  const currentTime = moment().format('HH:mm:ss');
  currentTime.replace(':', '');
  const orderId = `PAY ${customerId}"-"${currentTime}`;
  const customerVirtualCode = customer.virtual_address_code;
  const industryTypeId = 'Retail109';
  const channelId = 'WEB';
  log('paytm.TXN_AMOUNT ', finalAmount);
  const transactionAmount = Math.round(finalAmount);
  log('paytm.round ', finalAmount);

  const phone = shipment.phone.replace('+', '');
  log('phone', phone);
  const emailId = customer.email;

  // Create an array having all required parameters for creating checksum.
  paramList.MID = MID || 'INDLLP22228431438570';
  paramList.ORDER_ID = orderId;
  paramList.CUST_ID = customerVirtualCode;
  paramList.INDUSTRY_TYPE_ID = industryTypeId;
  paramList.CHANNEL_ID = channelId;
  paramList.TXN_AMOUNT = transactionAmount;
  paramList.WEBSITE = 'INDLLPWEB';
  paramList.CALLBACK_URL = 'https://localhost:5000/api/paymentGateways/paytm';

  if (phone) {
    paramList.MOBILE_NO = phone;
  }

  if (emailId) {
    paramList.EMAIL = emailId;
  }

  paramList.ORDER_DETAILS = `SHIPMENT ID  ${shipment.order_code}`;
  log('paramList', paramList);

  const key = KEY || 'r&Xd973ZIk43rWzq';
  const gencheckSum = checkSum.genchecksum(paramList, key, (err, params) => res.json({ params }));
  return gencheckSum;
};

exports.responsePayment = async (req, res) => {
  const customerId = req.user.id;
  const customer = await User
    .findById(customerId, {
      attributes: ['id', 'wallet_balance_amount'],
    });

  // todo: delete this line after done
  req.user.ship_request_id = 11;

  const shipRequestId = req.user.ship_request_id;
  const isWalletUsed = req.user.is_wallet_used;
  const isRetryPayment = req.user.is_retry_payment;
  let resMsg = '';

  const shipment = await Shipment
    .findById(shipRequestId, {
      attributes: ['id', 'final_amount', 'payment_gateway_fee_amount', 'customer_id'],
    });

  log('shipment.customer_id', shipment.customer_id);
  if (!shipment && !shipment.customer_id === customerId) {
    return res.status(400).json({ error: 'Unauthorized customer transaction!' });
  }
  let paytmChecksum = '';
  const paramList = req.body;
  let isValidChecksum = false;
  paytmChecksum = paramList.CHECKSUMHASH ? paramList.CHECKSUMHASH : '';

  isValidChecksum = checkSum.verifychecksum(paramList, 'r&Xd973ZIk43rWzq', paytmChecksum);
  // todo: delete this line after done
  isValidChecksum = true;
  let status = paramList.STATUS;
  log('isValidChecksum', isValidChecksum);
  let finalAmount = '';

  if (isValidChecksum === false) {
    return res.status(400).json({ error: 'Security Error! Payment Transaction checksum mismatched.' });
  }
  log('finalAmount', shipment.final_amount);
  if (shipment.payment_gateway_fee_amount) {
    finalAmount = shipment.final_amount - shipment.payment_gateway_fee_amount || 0;
  } else {
    finalAmount = shipment.final_amount;
  }
  const paymentGatewayFeeAmount = (3 / 100) * finalAmount;
  log('finalAmount', finalAmount);
  finalAmount = Number(finalAmount);
  finalAmount += Number(paymentGatewayFeeAmount);

  log('paymentGatewayFeeAmount', paymentGatewayFeeAmount);

  // todo: delete this line after done
  status = 'TXN_FAILURE';
  if (status === 'TXN_SUCCESS') {
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
    shipmentUpdate.payment_gateway_fee_amount = paymentGatewayFeeAmount;
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
          // $shoppre_balance = ShopperBalance::find($customer->balance->id);
          // $shoppre_balance->amount = $total_wallet_amount;
          // $shoppre_balance->save();

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
  } else if (status === 'TXN_FAILURE') {
    resMsg = req.body.RESPMSG;
    await Shipment
      .update({
        payment_gateway_name: 'paytm',
        payment_status: 'failed',
        admin_info: 'Payment failed',
        admin_read: 'no',
      }, {
        where: { id: shipRequestId },
      });
  } else if (status === 'PENDING' || status === 'OPEN') {
    resMsg = 'Your transaction in pending now. We will inform you once we have received your payment.';
    await Shipment
      .update({
        finalAmount,
        payment_gateway_fee: paymentGatewayFeeAmount,
        payment_gateway_name: 'paytm',
        payment_status: 'pending',
        admin_info: 'Payment status pending!',
        admin_read: 'no',
      }, {
        where: { id: shipRequestId },
      });
  } else {
    resMsg = 'Security Error! Payment Transaction Failed. Try again or contact us for support.';
    await Shipment
      .update({
        payment_gateway_name: 'paytm',
        payment_status: 'failed',
        admin_info: 'Payment failed!',
        admin_read: 'no',
      }, {
        where: { id: shipRequestId },
      });
  }
  const notification = {};
  notification.customer_id = customerId;
  notification.action_type = 'shipment';
  notification.action_id = shipment.id;
  notification.action_description = 'Shipment Payment Failed - PayTm';
  await Notification.create(notification);

  // todo email sending is pending
  // Mail::to($customer->email)->bcc('support@shoppre.com')->send(new PaymentFailed($shipment));

  res.status(200).json({ error: resMsg });
};
