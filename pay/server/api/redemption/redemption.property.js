
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
  object_type_id: DataTypes.INTEGER, // 1 - IPFS
  object_id: DataTypes.INTEGER,
  coupon_code: DataTypes.STRING,
});

