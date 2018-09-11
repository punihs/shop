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

const paymentSuccess = async ({
  shipment, customer, isRetryPayment, isWalletUsed, finalAmount, res, url,
}) => {
  let finalAmt = finalAmount;
  let wallet = shipment.wallet_amount;
  if (isWalletUsed === 1 && isRetryPayment === 1) {
    const customerWalletAmount = customer.wallet_balance_amount;
    finalAmt -= customerWalletAmount;
    wallet = shipment.wallet_amount + customerWalletAmount;

    // - wrong - becuase controller methods will return response
    await transactionCtrl
      .create(customerWalletAmount, customer.id, shipment, DEBIT);
  }

  await Shipment.update({
    payment_gateway_fee_amount: 0,
    final_amount: finalAmt,
    wallet_amount: wallet,
    payment_gateway_id: CARD,
    payment_status: 'success',
    admin_info: 'Payment Successful!',
    admin_read: 'no',
  }, {
    where: {
      id: shipment.id,
    },
  });

  Shipment
    .updateShipmentState({
      db,
      shipment,
      actingUser: customer,
      nextStateId: PAYMENT_COMPLETED,
      comments: 'Axis payment success',
    });

  await Notification.create({
    customer_id: customer.id,
    action_type: 'shipment',
    action_id: shipment.id,
    action_description: 'Shipment Payment Successful - Axis',
  });

  const redemption = await Redemption
    .find({
      attributes: ['id'],
      where: { shipment_order_code: shipment.order_code },
    });
  if (redemption) {
    const promo = await Coupon
      .find({
        where: {
          code: redemption.coupon_code,
          expires_at: {
            $gt: new Date(),
          },
        },
      });

    if (promo) {
      if (promo.cashback_percentage) {
        const totalWalletAmount = customer.wallet_balance_amount
          + (shipment.estimated_amount * (promo.cashback_percentage / 100));
        await User.update({
          wallet_balance_amount: totalWalletAmount,
        }, {
          where: { id: customer.id },
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

  return res.redirect(`${url}?message: 'success'`);
};

exports.complete = async (req, res, next) => {
  const { id } = req.params;
  try {
    const transaction = await Transaction.findById(id, {
      attributes: ['id', 'payment_gateway_id', 'object_id', 'customer_id'],
    });

    const result = JSON.parse(await verify(req.body));
    await transaction.update({
      status: result.status,
      response: JSON.stringify(req.body),
    });

    const customer = await User
      .findById(transaction.customer_id, {
        attributes: ['id', 'wallet_balance_amount'],
      });

    const isWalletUsed = transaction.is_wallet_used;
    const isRetryPayment = transaction.is_retry_payment;

    const shipment = await Shipment
      .findById(transaction.object_id, {
        attributes: ['id', 'final_amount', 'payment_gateway_fee_amount', 'customer_id'],
      });

    const url = `http://${URLS_MEMBER}/locker/request/${shipment.id}/reponse`;

    const AUTHORISED = shipment && shipment.customer_id === customer.id;
    if (!AUTHORISED) {
      log('Unauthorized customer transaction!');
      return res.redirect(`${url}?error=Unauthorized customer transaction!`);
    }

    const finalAmount = shipment.payment_gateway_fee_amount
      ? (shipment.final_amount - shipment.payment_gateway_fee_amount)
      : shipment.final_amount;

    if (!result) {
      const msg = 'Security Error! Please try again after sometime or contact us for support.';
      return res.status(200)
        .redirect(`${url}?error=${msg}`);
    }

    if (result.vpc_TxnResponseCode === '0') {
      return paymentSuccess({
        shipment, customer, isRetryPayment, isWalletUsed, finalAmount, res, url,
      });
    } else if (result.vpc_TxnResponseCode === 'Aborted') {
      this.paymentFailed(shipment, customer);

      const msg = 'Looks like you cancelled the payment. You can try again now or if you faced any issues ' +
        'in completing the payment, please contact us.';

      return res.status(200).redirect(`${url}?error=${msg}`);
    }

    this.paymentFailed(shipment, customer);

    // todo: email sending pending
    // Mail::to($customer->email)->bcc('support@shoppre.com')
    // ->send(new PaymentFailed($shipment));
    const msg = 'Payment transaction failed! You can try again now or if you faced any issues in ' +
      'completing the payment, please contact us.';

    return res
      .redirect(`${url}?error=${msg}`);
  } catch (e) {
    return next(e);
  }
};

exports.paymentFailed = (shipment, customer) => {
  Shipment
    .update({
      payment_gateway_id: CARD,
      payment_status: 'failed',
      admin_info: 'Payment failed!',
      admin_read: 'no',
    }, {
      where: { id: shipment.id },
    });

  Shipment
    .updateShipmentState({
      db,
      shipment,
      actingUser: customer,
      nextStateId: PAYMENT_FAILED,
      comments: 'Axis payment failed',
    });
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

