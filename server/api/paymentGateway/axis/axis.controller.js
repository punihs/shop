const debug = require('debug');
const rp = require('request-promise');
// const _ = require('lodash');                this lodash is not used any where so i commented
const transactioCtrl = require('../../transaction/transaction.controller');

const { stringify } = require('querystring');

const { TRANSACTION_TYPES: { DEBIT } } = require('../../../config/constants');
const { URLS_API, AXIS } = require('../../../config/environment');


const log = debug('s.axis.controller');
const {
  User, Shipment, Notification, Redemption, Coupon,
} = require('../../../conn/sqldb');

exports.create = async (req, res, transaction) =>
  // Todo: need to change logic in nodejs
  res.json(`https://cp.shoppre.com/axis/api.php?&${stringify({
    final_amount: transaction.amount,
    payment_id: transaction.id,
    redirect_url: `${URLS_API}/api/transactions/${transaction.id}/complete`,
    ...AXIS,
  })}`);

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
        await transactioCtrl.create(customerWalletAmount, customerId, shipment, DEBIT);
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
