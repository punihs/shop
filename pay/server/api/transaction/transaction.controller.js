const sequelize = require('sequelize');
const rp = require('request-promise');
const debug = require('debug');
const connection = require('paypal-rest-sdk');

const transactionCtrl = require('../transaction/transaction.controller');

const log = debug('s.transaction.controller');

const {
  Transaction, User, Redemption, Coupon,
} = require('../../conn/sqldb');

const {
  TRANSACTION_TYPES: { CREDIT, DEBIT },
  PAYMENT_GATEWAY: {
    CARD, PAYPAL, CASH, WIRE,
  },
} = require('../../config/constants');

const { URLS_MEMBER, URLS_PF_API } = require('../../config/environment');

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

exports.success = async ({
  transaction, customer, isRetryPayment, isWalletUsed, finalAmount, res,
  paymentGatewayId, apiCBUrl,
}) => {
  let finalAmt = finalAmount;
  let wallet = transaction.wallet_amount;
  if (isWalletUsed === 1 && isRetryPayment === 1) {
    const customerWalletAmount = customer.wallet_balance_amount;
    finalAmt -= customerWalletAmount;
    wallet = transaction.wallet_amount + customerWalletAmount;

    // - wrong - becuase controller methods will return response
    await transactionCtrl
      .create(customerWalletAmount, customer.id, transaction, DEBIT);
  }

  let paymentStatus = '';
  if (paymentGatewayId === CASH || paymentGatewayId === WIRE) {
    paymentStatus = 'pending';
  } else {
    paymentStatus = 'success';
  }

  await Transaction.update({
    final_amount: finalAmt,
    wallet_amount: wallet,
    payment_gateway_id: paymentGatewayId,
    payment_status: paymentStatus,
    admin_info: `Payment ${paymentStatus}!`,
    admin_read: 'no',
  }, {
    where: {
      id: transaction.id,
    },
  });

  const redemption = await Redemption
    .find({
      attributes: ['id'],
      where: { object_id: transaction.object_id },
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
          + (transaction.final_amount * (promo.cashback_percentage / 100));
        await User.update({
          wallet_balance_amount: totalWalletAmount,
        }, {
          where: { id: customer.id },
        });

        await Redemption.update({
          status: 'success',
        }, {
          where: { object_id: transaction.object_id },
        });
      } else if (promo.discount_percentage) {
        await Redemption.update({
          status: 'success',
        }, {
          where: { object_id: transaction.object_id },
        });
      }
    }
  }
  // todo: don't delete
  // ShopperBalance::where('customer_id', $customer_id)->update(['amount' => 0]);
  const pgAmount = transaction.payment_gateway_fee_amount;
  const query = `&transaction_id=${transaction.id}&paymentStatus=${paymentStatus}&pg=${paymentGatewayId}`;
  return res
    .redirect(`${apiCBUrl}${query}&status=6&amount=${finalAmt}&pgAmount=${pgAmount}`);
};


exports.paymentFailed = (transaction, customer, paymentGatewayId) => {
  Transaction
    .update({
      payment_gateway_id: paymentGatewayId,
      payment_status: 'failed',
      admin_info: 'Payment failed!',
      admin_read: 'no',
    }, {
      where: { id: transaction.id },
    });
};

exports.updateCardTransaction = async ({
  transaction,
  url,
  apiCBUrl,
  customer,
  isRetryPayment,
  isWalletUsed,
  finalAmount,
  req,
  res,
}) => {
  if (req.query.error) {
    this.paymentFailed(transaction, customer, CARD);
    return res.redirect(`${apiCBUrl}&status=1`);
  }

  const result = JSON.parse(await verify(req.body));

  await transaction.update({
    status: result.status,
    response: JSON.stringify(req.body),
  });

  if (!result) return res.redirect(`${apiCBUrl}&status=2`);

  if (result.vpc_TxnResponseCode === '0') {
    return this.success({
      transaction,
      customer,
      isRetryPayment,
      isWalletUsed,
      finalAmount,
      res,
      url,
      paymentGatewayId: transaction.payment_gateway_id,
      apiCBUrl,
    });
  } else if (result.vpc_TxnResponseCode === 'Aborted') {
    this.paymentFailed(transaction, customer, CARD);

    return res.redirect(`${apiCBUrl}&status=1`);
  }

  this.paymentFailed(transaction, customer, CARD);

  // todo: email sending pending
  // Mail::to($customer->email)->bcc('support@shoppre.com')
  // ->send(new PaymentFailed($shipment));
  return res.redirect(`${apiCBUrl}&status=3`);
};

exports.updatePaypalTransaction = async (
  transaction, url, apiCBUrl, customer,
  isRetryPayment, isWalletUsed, finalAmount, req, res,
) => {
  if (req.query.status === 'failed') {
    log('apiCBUrl', apiCBUrl);
    this.paymentFailed(transaction, customer, transaction.payment_gateway_id);
    return res.redirect(`${apiCBUrl}&status=4`);
  }
  if (transaction && customer.id !== transaction.customer_id) {
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
        log('approved');
        return this.success({
          transaction,
          customer,
          isRetryPayment,
          isWalletUsed,
          finalAmount,
          res,
          url,
          paymentGatewayId: transaction.payment_gateway_id,
          apiCBUrl,
        });
      }
      // Mail::to($customer->email)
      // ->bcc('support@shoppre.com')->send(new PaymentFailed($shipment));
      // this.paypalFailed(shipment, customer, url);
      this.paymentFailed(transaction, customer, PAYPAL);
      return res.redirect(`${apiCBUrl}&status=4`);
    }
  });
};

exports.complete = async (req, res, next) => {
  log('complete');
  const { id } = req.params;
  try {
    const transaction = await Transaction.findById(id, {
      attributes: [
        'id', 'payment_gateway_id', 'object_id', 'customer_id', 'amount', 'final_amount',
        'payment_gateway_fee_amount',
      ],
    });

    const customer = await User
      .findById(transaction.customer_id, {
        attributes: ['id', 'wallet_balance_amount'],
      });

    const isWalletUsed = transaction.is_wallet_used;
    const isRetryPayment = transaction.is_retry_payment;

    const { object_id: objectId } = transaction;
    const url = `${URLS_MEMBER}/shipRequests/${objectId}/response`;

    const apiCBUrl = `${URLS_PF_API}/api/public/shipments/${objectId}/response?uid=${customer.id}`;

    const AUTHORISED = transaction && transaction.customer_id === customer.id;
    if (!AUTHORISED) {
      log('Unauthorized customer transaction!');
      return res.redirect(`${url}?error=Unauthorized customer transaction!`);
    }

    const finalAmount = transaction.payment_gateway_fee_amount
      ? (transaction.final_amount - transaction.payment_gateway_fee_amount)
      : transaction.final_amount;
    switch (transaction.payment_gateway_id) {
      case CARD:
        return this.updateCardTransaction({
          transaction,
          url,
          apiCBUrl,
          customer,
          isRetryPayment,
          isWalletUsed,
          finalAmount,
          req,
          res,
        });

      case PAYPAL:
        return this.updatePaypalTransaction(
          transaction, url, apiCBUrl, customer,
          isRetryPayment, isWalletUsed, finalAmount, req, res,
        );

      default: return res.redirect(`${url}?status=5`);
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
