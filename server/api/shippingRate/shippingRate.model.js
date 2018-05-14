
module.exports = (sequelize, DataTypes) => {
  const ShippingRate = sequelize.define('ShippingRate', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'shipping_rates',
    timestamps: false,
    underscored: true,
  });

  return ShippingRate;
};

