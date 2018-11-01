const properties = require('./loyaltyHistory.property');

module.exports = (sequelize, DataTypes) => {
  const LoyaltyHistory = sequelize.define('LoyaltyHistory', properties(DataTypes), {
    tableName: 'loyalty_history',
    timestamps: true,
    underscored: true,
    paranoid: true,
  });

  LoyaltyHistory.associate = (db) => {
    LoyaltyHistory.belongsTo(db.User, {
      foreignkey: 'customer_id',
      as: 'Customer',
    });
  };

  return LoyaltyHistory;
};
