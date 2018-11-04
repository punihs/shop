const rp = require('request-promise');
const debug = require('debug');
const connection = require('paypal-rest-sdk');

const log = debug('s.paypal.controller');

const {
  PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_MODE, URLS_PAY_API,
} = require('../../../config/environment');

connection.configure({
  mode: PAYPAL_MODE,
  client_id: PAYPAL_CLIENT_ID,
  client_secret: PAYPAL_SECRET,
});

const createPayment = {
  intent: 'sale',
  payer: {
    payment_method: 'paypal',
  },
  redirect_urls: {
    return_url: '',
    cancel_url: '',
  },
  transactions: [{
    item_list: {
      items: [{
        name: 'x',
        sku: 'x',
        price: 0,
        currency: 'USD',
        quantity: 1,
      }],
    },
    amount: {
      currency: 'USD',
      total: 0,
    },
    description: 'Shoppre Shipment Payment',
  }],
};

exports.currencyConversion = rupees => rp('http://free.currencyconverterapi.com/api/v3/convert?q=USD_INR&compact=ultra')
  .then((response) => {
    const conversion = JSON.parse(response);
    const dollars = Math.round(rupees / conversion.USD_INR, 2);
    return dollars;
  });

exports.create = async (req, res, transaction) => {
  const amount = await this.currencyConversion(transaction.amount);
  log({ amount });
  createPayment.transactions[0].item_list.items[0].price = amount;
  createPayment.transactions[0].amount.total = amount;
  createPayment.redirect_urls.return_url = `${URLS_PAY_API}/api/transactions/${transaction.id}/complete?status=success`;
  createPayment.redirect_urls.cancel_url = `${URLS_PAY_API}/api/transactions/${transaction.id}/complete?status=failed`;

  connection.payment.create(createPayment, (error, payment) => {
    if (error) return Promise.reject(error);
    return res.json({
      url: payment
        .links
        .filter(x => (x.rel === 'approval_url'))[0].href,
    });
  });
};

