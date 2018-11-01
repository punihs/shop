const properties = require('./transaction.property');

module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define(
    'Transaction',
    properties(DataTypes),
    {
      tableName: 'transactions',
      timestamps: true,
      paranoid: true,
      underscored: true,
      // todo - required in wallet transaction
      // hooks: {
      //   afterCreate(transaction) {
      //     log('action', transaction.toJSON());
      //     const { db } = Transaction;
      //     const user = db.User.build({ id: transaction.customer_id });
      //     const action = Number(transaction.type) === 2 ? 'decrement' : 'increment';
      //     user[action]({ wallet_balance_amount: transaction.amount })
      //       .catch(err => logger.error('hook', err));
      //   },
      // },
    },
  );

  Transaction.associate = (db) => {
    Transaction.db = db;
    Transaction.belongsTo(db.PaymentGateway);
    Transaction.belongsTo(db.User, {
      foreignKey: 'customer_id',
      as: 'Customer',
    });
  };

  return Transaction;
};

