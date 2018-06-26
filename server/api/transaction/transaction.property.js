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
  customer_id: DataTypes.INTEGER,
  amount: DataTypes.DECIMAL(15, 2),
  type: {
    type: DataTypes.ENUM,
    values: [
      CREDIT,
      DEBIT,
    ],
  },
  description: DataTypes.STRING,
});

