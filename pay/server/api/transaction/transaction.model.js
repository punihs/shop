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

