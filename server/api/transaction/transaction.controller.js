const sequelize = require('sequelize');
const rp = require('request-promise');
const debug = require('debug');
const connection = require('paypal-rest-sdk');

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
    CARD, PAYPAL,
  },
  SHIPMENT_STATE_IDS: {
    PAYMENT_COMPLETED, PAYMENT_FAILED,
  },

} = require('../../config/constants');

const { URLS_MEMBER } = require('../../config/environment');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'customer_id', 'amount', 'description', 'created_at'],
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
  transaction.type = transaction.amount < 0 ? DEBIT : CREDIT;

  transaction.customer_id = customerId;
  await Transaction
    .create(transaction)
    .then(({ id }) => res.json({ id }))
    .catch(next);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const transaction = req.body;

  const customerId = req.body.customer_id;
  const { amount } = req.body;
  let { type } = req.body;
  const option = {
    attributes: ['wallet_balance_amount'],
    where: { id: customerId },
  };
  const historyTran = await Transaction
    .find({
      attributes: ['amount'],
      where: { id },
    });
  const status = await Transaction.update(transaction, { where: { id } });
  await User
    .update({
      wallet_balance_amount: sequelize
        .literal(`wallet_balance_amount - ${historyTran.amount}`),
    }, option);
  type = transaction.amount < 0 ? DEBIT : CREDIT;
  await User
    .update({
      wallet_balance_amount: sequelize
        .literal(`wallet_balance_amount ${type === CREDIT ? '+' : '-'} ${amount}`),
    }, option);
  return res.json(status);
};

exports.destroy = async (req, res) => {
  const { id } = req.params;
  const customerId = req.query.customer_id;
  const { amount } = req.query;
  const { type } = req.query;
  const option = {
    attributes: ['wallet_balance_amount'],
    where: { id: customerId },
  };
  const status = await Transaction.destroy({
    paranoid: true,
    where: { id },
  });
  await User
    .update({
      wallet_balance_amount: sequelize
        .literal(`wallet_balance_amount ${type === CREDIT ? '+' : '-'} ${amount}`),
    }, option);
  return res.json(status);
};

const verify = body => rp({
  method: 'POST',
  url: 'https://cp.shoppre.com/axis/api-success.php',
  form: body,
});

const paymentSuccess = async ({
  shipment, customer, isRetryPayment, isWalletUsed, finalAmount, res, url, paymentGatewayId,
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
    final_amount: finalAmt,
    wallet_amount: wallet,
    payment_gateway_id: paymentGatewayId,
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
      comments: 'payment success',
    });

  await Notification.create({
    customer_id: customer.id,
    action_type: 'shipment',
    action_id: shipment.id,
    action_description: 'Shipment Payment Successful',
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

  return res.redirect(`${url}?message=success`);
};

exports.paymentFailed = (shipment, customer, paymentGatewayId) => {
  Shipment
    .update({
      payment_gateway_id: paymentGatewayId,
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
      comments: 'payment failed',
    });
};

exports.updateCardTransaction = async (transaction, url, failedURL, shipment, customer,
  isRetryPayment, isWalletUsed, finalAmount, req, res) => {
  if (req.query.error) {
    this.paymentFailed(shipment, customer, CARD);
    const msg = 'Looks like you cancelled the payment. You can try again now or if you ' +
      'faced any issues in completing the payment, please contact us.';
    return res.status(200).redirect(`${failedURL}?error='failed'&message=${msg}`);
  }
  const result = JSON.parse(await verify(req.body));
  await transaction.update({
    status: result.status,
    response: JSON.stringify(req.body),
  });
  if (!result) {
    const msg = 'Security Error! Please try again after sometime or contact us for support.';
    return res.status(200).redirect(`${failedURL}?error='failed'&message=${msg}`);
  }

  if (result.vpc_TxnResponseCode === '0') {
    return paymentSuccess({
      shipment, customer, isRetryPayment, isWalletUsed, finalAmount, res, url, CARD,
    });
  } else if (result.vpc_TxnResponseCode === 'Aborted') {
    this.paymentFailed(shipment, customer, CARD);

    const msg = 'Looks like you cancelled the payment. You can try again now or if you faced any issues ' +
      'in completing the payment, please contact us.';

    return res.status(200).redirect(`${failedURL}?error='failed'&message=${msg}`);
  }

  this.paymentFailed(shipment, customer, CARD);

  // todo: email sending pending
  // Mail::to($customer->email)->bcc('support@shoppre.com')
  // ->send(new PaymentFailed($shipment));
  const msg = 'Payment transaction failed! You can try again now or if you faced any issues in ' +
    'completing the payment, please contact us.';

  return res.status(200).redirect(`${failedURL}?error='failed'&message=${msg}`);
};

exports.updatePaypalTransaction = async (transaction, url, failedURL,
  shipment, customer, isRetryPayment, isWalletUsed, finalAmount, req, res,
) => {
  if (req.query.status === 'failed') {
    this.paymentFailed(shipment, customer, PAYPAL);
    return res.status(200).redirect(`${failedURL}?error='failed'&message=Unexpected error occurred and payment has been failed`);
  }
  if (shipment && shipment.customer_id !== transaction.customer_id) {
    return res.status(400).json({ error: 'Unauthorized customer transaction!' });
  }
  const amount = await this.currencyConversion(transaction.amount);

  const { paymentId, payment } = this.paymentDetails(req);
  payment.transactions[0].amount.total = amount;

  return connection.payment.execute(paymentId, payment, (err, paymentStatus) => {
    if (err) {
      throw err;
    } else {
      const result = paymentStatus;
      if (result.state === 'approved') {
        return paymentSuccess({
          shipment, customer, isRetryPayment, isWalletUsed, finalAmount, res, url, PAYPAL,
        });
      }
      // Mail::to($customer->email)
      // ->bcc('support@shoppre.com')->send(new PaymentFailed($shipment));
      // this.paypalFailed(shipment, customer, url);
      this.paymentFailed(shipment, customer, PAYPAL);
      return res.status(200).redirect(`${failedURL}?message=Unexpected error occurred and payment has been failed`);
    }
  });
};

exports.complete = async (req, res, next) => {
  const { id } = req.params;
  console.log('error', JSON.stringify(req.query));
  console.log('id', id);
  try {
    const transaction = await Transaction.findById(id, {
      attributes: ['id', 'payment_gateway_id', 'object_id', 'customer_id', 'amount'],
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

    const url = `${URLS_MEMBER}/locker/request/${shipment.id}/reponse`;
    const failedURL = `${URLS_MEMBER}/locker/shipmentQueue`;

    const AUTHORISED = shipment && shipment.customer_id === customer.id;
    if (!AUTHORISED) {
      log('Unauthorized customer transaction!');
      return res.redirect(`${url}?error=Unauthorized customer transaction!`);
    }

    const finalAmount = shipment.payment_gateway_fee_amount
      ? (shipment.final_amount - shipment.payment_gateway_fee_amount)
      : shipment.final_amount;
    switch (transaction.payment_gateway_id) {
      case CARD:
        return this.updateCardTransaction(
          transaction, url, failedURL, shipment, customer,
          isRetryPayment, isWalletUsed, finalAmount, req, res,
        );

      case PAYPAL:
        return this.updatePaypalTransaction(
          transaction, url, failedURL, shipment, customer,
          isRetryPayment, isWalletUsed, finalAmount, req, res,
        );

      default: return res.status(200).redirect(`${url}?message=invalid payment gateway`);
    }
  } catch (e) {
    return next(e);
  }
};

exports.paymentDetails = (req) => {
  const { PayerID: payerId } = req.query;
  const { paymentId } = req.query;
  const payment = {
    payer_id: payerId,
    transactions: [{
      amount: {
        currency: 'USD',
        total: 0.00,
      },
    }],
  };
  return { paymentId, payment };
};

exports.currencyConversion = rupees => rp('http://free.currencyconverterapi.com/api/v3/convert?q=USD_INR&compact=ultra')
  .then((response) => {
    const conversion = JSON.parse(response);
    const dollars = Math.round(rupees / conversion.USD_INR, 2);
    return dollars;
  });

exports.WalletTransaction = async (walletAmount, customerId, shipment, transactionType) => {
  const transaction = {};
  transaction.customer_id = customerId;
  transaction.amount = walletAmount;
  transaction.type = transactionType;
  transaction.description = `Wallet balance offsetted against shipment cost | Shipment ID  ${shipment.order_code}`;

  await Transaction
    .create(transaction);
};
