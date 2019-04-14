const debug = require('debug');
const rp = require('request-promise');

const log = debug('cash back');

const { URLS_MYACCOUNT } = require('../../config/environment');
const transactionCtrl = require('../transaction/transaction.controller');

exports.create = async (req, res) => {
  const { customer_id: customerID, amount, description } = req.body;

  if (amount !== 0) {
    await transactionCtrl
      .setWallet({
        customer_id: customerID,
        amount,
        description,
      });
  }

  return res.json({ message: 'wellet amount added successfully' });
};

exports.walletShow = async (req, res) => {
  const { customer_id } = req.query;

  const walletAmount = await this.getWallet({ customer_id });

  return res.json(walletAmount);
};


exports.walletUpdate = async (req, res) => {
  const { customer_id, amount } = req.query;
  const status = await this.setWallet({ customer_id, amount });

  return res.json(status);
};

exports.getWallet = async ({ customer_id: customerID }) => {
  const walletAmount = await rp({
    uri: `${URLS_MYACCOUNT}/admin/wallet?user_id=${customerID}`,
    json: true,
  });

  return walletAmount;
};

exports.setWallet = async ({ customer_id, amount, description }) => {
  const status = await rp({
    uri: `${URLS_MYACCOUNT}/admin/walletUpdate`,
    qs: { user_id: customer_id, amount, description },
    json: true,
  });

  log(status);
  return status;
};

exports.loyaltyShow = async (req, res) => {
  const { customer_id } = req.query;

  const { loyalty, history, points } = await this.getLoyalty({ customer_id });

  return res.json({ loyalty, history, points });
};

exports.loyaltyUpdate = async (req, res) => {
  const { customer_id, points } = req.query;

  const status = await this.setLoyalty({ customer_id, points });

  return res.json(status);
};

exports.getLoyalty = async ({ customer_id: customerID }) => {
  const loyalty = await rp({
    uri: `${URLS_MYACCOUNT}/admin/loyalty?user_id=${customerID}`,
    json: true,
  });
  return loyalty;
};

exports.setLoyalty = async ({ customer_id, loyaltyAmount }) => {
  log('trans', { customer_id, loyaltyAmount });

  const status = await rp({
    uri: `${URLS_MYACCOUNT}/admin/loyaltyUpdate`,
    qs: { customer_id, loyaltyAmount },
    json: true,
  });

  log(status);
  return status;
};

exports.addLoyalty = async ({ customer_id, finalAmount }) => {
  const status = await rp({
    uri: `${URLS_MYACCOUNT}/admin/loyaltyCreate`,
    qs: { customer_id, final_amount: finalAmount, info: 'Shipping rewards' },
    json: true,
  });

  log({ status });
  return status;
};
