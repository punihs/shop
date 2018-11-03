
const properties = require('./shippingRate.property');

module.exports = (sequelize, DataTypes) => {
  const ShippingRate = sequelize.define(
    'ShippingRate',
    properties(DataTypes),
    {
      tableName: 'shipping_rates',
      timestamps: true,
      underscored: true,
    },
  );

  ShippingRate.associate = (db) => {
    ShippingRate.belongsTo(db.ShippingPartner);
    ShippingRate.belongsTo(db.Country);
  };
  return ShippingRate;
};

