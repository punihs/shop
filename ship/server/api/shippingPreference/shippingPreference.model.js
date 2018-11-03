const properties = require('./shippingPreference.property');

module.exports = (sequelize, DataTypes) => {
  const ShippingPreference = sequelize.define('ShippingPreference', properties(DataTypes), {
    tableName: 'shipping_preferences',
    timestamps: true,
    underscored: true,
  });

  ShippingPreference.associate = (db) => {
    ShippingPreference.belongsTo(db.User, {
      foreignKey: 'customer_id',
    });
  };

  return ShippingPreference;
};

