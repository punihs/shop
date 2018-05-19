const { SHIPMENT_COUPON_STATES: { PENDING, SUCCESS } } = require('../../config/constants');

module.exports = (sequelize, DataTypes) => {
  const ShipmentCoupon = sequelize.define('ShipmentCoupon', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM,
      values: [PENDING, SUCCESS],
    },
  }, {
    tableName: 'shipment_coupons',
    timestamps: true,
    underscored: true,
  });

  return ShipmentCoupon;
};

