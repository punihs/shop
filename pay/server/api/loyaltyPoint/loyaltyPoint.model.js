const properties = require('./loyaltyPoint.property');

module.exports = (sequelize, DataTypes) => {
  const LoyaltyPoint = sequelize.define('LoyaltyPoint', properties(DataTypes), {
    tableName: 'loyalty_points',
    timestamps: false,
    underscored: true,
    paranoid: true,
  });

  LoyaltyPoint.associate = (db) => {
    LoyaltyPoint.belongsTo(db.User, {
      foreignKey: 'customer_id',
      as: 'Customer',
    });
  };

  return LoyaltyPoint;
};
