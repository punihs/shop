const debug = require('debug');
const properties = require('./transaction.property');
const logger = require('./../../components/logger');

const log = debug('s-api-transaction-model');

module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define(
    'Transaction',
    properties(DataTypes),
    {
      tableName: 'transactions',
      timestamps: true,
      paranoid: true,
      underscored: true,
      hooks: {
        afterCreate(transaction) {
          log('action', transaction.toJSON());
          const { db } = Transaction;
          const user = db.User.build({ id: transaction.customer_id });
          const action = Number(transaction.type) === 2 ? 'decrement' : 'increment';
          user[action]({ wallet_balance_amount: transaction.amount })
            .catch(err => logger.error('hook', err));
        },
      },
    },
  );

  Transaction.associate = (db) => {
    Transaction.db = db;
    Transaction.belongsTo(db.PaymentGateway);
    Transaction.belongsTo(db.Shipment, {
      foreignKey: 'object_id',
    });
    Transaction.belongsTo(db.User, {
      foreignKey: 'customer_id',
      as: 'Customer',
    });
  };

  return Transaction;
};

