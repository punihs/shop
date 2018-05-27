const {
  PACKAGE_STATES: {
    PROCESSING,
    VALUES,
    REVIEW,
    DELIVERED,
    SHIP,
    INREVIEW,
  },
  CONSIGNMENT_TYPES: { DOC, NONDOC },
} = require('../../config/constants');

module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  order_code: DataTypes.STRING,
  type: {
    type: DataTypes.ENUM,
    values: [DOC, NONDOC],
  },
  reference_code: DataTypes.STRING,
  locker_code: DataTypes.STRING,
  weight: DataTypes.STRING,
  number_of_items: DataTypes.INTEGER,
  price_amount: DataTypes.STRING,
  received_at: DataTypes.DATE,
  status: {
    type: DataTypes.ENUM,
    values: [
      PROCESSING,
      VALUES,
      REVIEW,
      DELIVERED,
      SHIP,
      INREVIEW,
    ],
  },

  review: DataTypes.STRING,
  return_send: DataTypes.STRING,
  is_liquid: DataTypes.BOOLEAN,
  is_featured_seller: DataTypes.BOOLEAN,
  split_pack: DataTypes.STRING,
  info: DataTypes.STRING,
  admin_read: DataTypes.BOOLEAN,
  admin_info: DataTypes.STRING,
  is_item_damaged: DataTypes.BOOLEAN,
});

