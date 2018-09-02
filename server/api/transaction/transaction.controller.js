const sequelize = require('sequelize');
const rp = require('request-promise');
const debug = require('debug');

const transactionCtrl = require('../transaction/transaction.controller');

const log = debug('s.transaction.controller');

const {
  Transaction, User, Shipment,
  Notification, Redemption, Coupon,
} = require('../../conn/sqldb');
const db = require('../../conn/sqldb');
const {
  TRANSACTION_TYPES: { CREDIT, DEBIT },
  PAYMENT_GATEWAY: {
    CARD,
  },
  SHIPMENT_STATE_IDS: {
    PAYMENT_COMPLETED, PAYMENT_FAILED,
  },

} = require('../../config/constants');

const { URLS_MEMBER } = require('../../config/environment');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'customer_id', 'amount', 'description'],
    limit: Number(req.query.limit) || 20,
  };
  if (req.query.customer_id) options.where = { customer_id: req.query.customer_id };

  return Transaction
    .findAll(options)
    .then(transaction => res.json(transaction))
    .catch(next);
};

exports.create = async (req, res, next) => {
  const transaction = req.body;
  const customerId = req.body.customer_id;
  const option = {
    attributes: ['wallet_balance_amount'],
    where: { id: customerId },
  };
  await Transaction
    .create(transaction);
  const { type, amount } = transaction;
  await User
    .update({
      wallet_balance_amount: sequelize
        .literal(`wallet_balance_amount ${type === CREDIT ? '+' : '-'} ${amount}`),
    }, option)
    .then(({ id }) => res.json({ id }))
    .catch(next);
};

const verify = body => rp({
  method: 'POST',
  url: 'https://cp.shoppre.com/axis/api-success.php',
  form: body,
});

exports.complete = async (req, res, next) => {
  const { id } = req.params;
  log('body', JSON.stringify(req.body));
  log('body', (req.body));
  try {
    const transaction = await Transaction.findById(id, {
      attributes: ['id', 'payment_gateway_id', 'object_id', 'customer_id'],
    });
    const result = await verify(req.body);
    log(result);

    await transaction.update({
      status: result.status,
      response: JSON.stringify(req.body),
    });

    const customerId = transaction.customer_id;
    const customer = await User
      .findById(customerId, {
        attributes: ['id', 'wallet_balance_amount'],
      });

    const shipRequestId = transaction.object_id;
    const isWalletUsed = transaction.is_wallet_used;
    const isRetryPayment = transaction.is_retry_payment;

    const shipment = await Shipment
      .findById(shipRequestId, {
        attributes: ['id', 'final_amount', 'payment_gateway_fee_amount', 'customer_id'],
      });
    log('shipment', JSON.stringify(shipment));
    log('shipment.customer_id', shipment.customer_id);
    if (!shipment && !shipment.customer_id === customerId) {
      log('Unauthorized customer transaction!');
      return res.status(400).json({ error: 'Unauthorized customer transaction!' });
    }

    let finalAmount = 0;
    log({ finalAmount });
    log({ customerId });

    if (shipment && shipment.customer_id === customerId) {
      if (shipment.payment_gateway_fee_amount) {
        finalAmount = shipment.final_amount - shipment.payment_gateway_fee_amount;
      } else {
        finalAmount = shipment.final_amount;
      }
      log('result', JSON.stringify(result));
      if (result) {
        log('code', result.vpc_TxnResponseCode);
        if (result.vpc_TxnResponseCode === '0') {
          let wallet = shipment.wallet_amount;
          if (isWalletUsed === 1 && isRetryPayment === 1) {
            const customerWalletAmount = customer.wallet_balance_amount;
            log('customer.wallet_balance_amount', customer.wallet_balance_amount);
            finalAmount -= customerWalletAmount;
            log('shipment.wallet_amount', shipment.wallet_amount);
            wallet = shipment.wallet_amount + customerWalletAmount;
            await transactionCtrl.create(customerWalletAmount, customerId, shipment, DEBIT);
          }
          const shipmentUpdate = {};
          shipmentUpdate.payment_gateway_fee_amount = 0;
          shipmentUpdate.final_amount = finalAmount;
          shipmentUpdate.wallet_amount = wallet;
          shipmentUpdate.payment_gateway_id = CARD;
          shipmentUpdate.payment_status = 'success';
          shipmentUpdate.admin_info = 'Payment Successful!';
          shipmentUpdate.admin_read = 'no';
          await Shipment.update(shipmentUpdate, { where: { id: shipRequestId } });

          Shipment
            .updateShipmentState({
              db,
              shipment,
              actingUser: customer,
              nextStateId: PAYMENT_COMPLETED,
              comments: 'Axis payment success',
            });
          const notification = {};
          notification.customer_id = customerId;
          notification.action_type = 'shipment';
          notification.action_id = shipmentUpdate.id;
          notification.action_description = 'Shipment Payment Successful - Axis';
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

          return res.status(302).redirect(`http://${URLS_MEMBER}/locker/request/${shipment.id}/reponse?message: 'success'`);
        } else if (result.vpc_TxnResponseCode === 'Aborted') {
          await Shipment
            .update({
              payment_gateway_name: CARD,
              payment_status: 'failed',
              admin_info: 'Payment failed',
              admin_read: 'no',
            }, {
              where: { id: shipRequestId },
            });
          Shipment
            .updateShipmentState({
              db,
              shipment,
              actingUser: customer,
              nextStateId: PAYMENT_FAILED,
              comments: 'Axis payment failed',
            });
          return res.status(200).redirect(`http://${URLS_MEMBER}/locker/request/${shipment.id}/reponse?error: 'Looks like you cancelled the payment. You can try again now or if you faced any issues in completing the payment, please contact us.'`);
        }
        log('Aborted');
        await Shipment
          .update({
            payment_gateway_id: CARD,
            payment_status: 'failed',
            admin_info: 'Payment failed!',
            admin_read: 'no',
          }, {
            where: { id: shipRequestId },
          });
        Shipment
          .updateShipmentState({
            db,
            shipment,
            actingUser: customer,
            nextStateId: PAYMENT_FAILED,
            comments: 'Axis payment failed',
          });

        // todo: email sending pending
        // Mail::to($customer->email)->bcc('support@shoppre.com')
        // ->send(new PaymentFailed($shipment));
        return res.status(200)
          .redirect(`${URLS_MEMBER}/locker/request/${shipment.id}/reponse?error: 'Payment transaction failed! You can try again now or if you faced any issues in completing the payment, please contact us.'`);
      }
      return res.status(200)
        .redirect(`http://${URLS_MEMBER}/locker/request/${shipment.id}/reponse?error: 'Security Error! Please try again after sometime or contact us for support.'`);
    }
    return res.status(200)
      .redirect(`http://${URLS_MEMBER}/locker/request/${shipment.id}/reponse?error: 'Unauthorized customer transaction!'`);
  } catch (e) {
    return next(e);
  }
};

exports.WalletTransaction = async (walletAmount, customerId, shipment, transactionType) => {
  const transaction = {};
  transaction.customer_id = customerId;
  transaction.amount = walletAmount;
  transaction.type = transactionType;
  transaction.description = `Wallet balance offsetted against shipment cost | Shipment ID  ${shipment.order_code}`;

  await Transaction
    .create(transaction);
};

