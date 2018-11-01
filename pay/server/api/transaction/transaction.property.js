const {
  TRANSACTION_TYPES: {
    CREDIT,
    DEBIT,
  },
} = require('../../config/constants');

module.exports = DataTypes => ({
  id: {
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  amount: DataTypes.DECIMAL(15, 2),
  type: {
    type: DataTypes.ENUM,
    values: [
      CREDIT,
      DEBIT,
    ],
  },
  description: DataTypes.STRING,
  object_id: DataTypes.INTEGER,
  object_name: DataTypes.STRING,
  status: DataTypes.STRING,
  final_amount: DataTypes.INTEGER,
  cashback_amount: DataTypes.INTEGER,
  coupon_amount: DataTypes.INTEGER,
  wallet_amount: DataTypes.INTEGER,
  loyalty_amount: DataTypes.INTEGER,
  payment_gateway_fee_amount: DataTypes.INTEGER,
  payment_status: DataTypes.STRING,
  response: DataTypes.STRING(2000),
});

