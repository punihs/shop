
module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unsigned: true,
    unique: true,
  },
  discount_amount: DataTypes.DOUBLE(10, 2),
  status: DataTypes.STRING,
  shipment_order_code: DataTypes.STRING,
  coupon_code: DataTypes.STRING,
});

