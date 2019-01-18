const {
  CONTENT_TYPES: { REGULAR, SPECIAL },
  PACKAGE_TYPES: {
    INCOMING,
    PERSONAL_SHOPPER,
    COD,
  },
} = require('../../config/constants');

module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  is_doc: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  store_name: DataTypes.STRING,
  tracking_code: DataTypes.STRING,
  invoice_code: DataTypes.STRING,
  comments: DataTypes.STRING,
  weight: DataTypes.DECIMAL(15, 2),
  price_amount: DataTypes.DECIMAL(15, 2),

  content_type: {
    type: DataTypes.ENUM,
    values: [REGULAR, SPECIAL],
    defaultValue: 1,
  },
  package_type: {
    type: DataTypes.ENUM,
    values: [INCOMING, PERSONAL_SHOPPER, COD],
  },

  total_quantity: DataTypes.INTEGER,

  personal_shopper_cost: DataTypes.INTEGER,
  delivery_charge: DataTypes.INTEGER,
  sales_tax: DataTypes.INTEGER,
  payment_gateway_fee: DataTypes.INTEGER,

  sub_total: DataTypes.INTEGER,
  amount_paid: DataTypes.INTEGER,
  seller_invoice: DataTypes.STRING,
  wallet: DataTypes.INTEGER,
  promo_code: DataTypes.STRING,
  promo_discount: DataTypes.INTEGER,
  promo_info: DataTypes.STRING,
  if_promo_unavailable: DataTypes.STRING,
  instruction: DataTypes.STRING,
  payment_gateway_name: DataTypes.STRING,
  payment_status: DataTypes.STRING,
  invoice: DataTypes.STRING,
  notes: DataTypes.STRING,
  order_code: DataTypes.STRING,
  buy_if_price_changed: DataTypes.STRING,
});
