const sequelize = require('sequelize');

const { Transaction, User } = require('../../conn/sqldb');
const { TRANSACTION_TYPES: { CREDIT } } = require('../../config/constants');

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

