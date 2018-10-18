const { PRICE_ENTERER: { SHOPPRE, CUSTOMER } } = require('../../config/constants');

module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  name: DataTypes.STRING,
  quantity: DataTypes.INTEGER,
  price_amount: DataTypes.DOUBLE,
  total_amount: {
    type: DataTypes.DOUBLE,
    defaultValue: 0,
  },
  object: DataTypes.STRING,
  object_advanced: DataTypes.STRING,
  object_invoice: DataTypes.STRING,
  price_entered_by: {
    type: DataTypes.ENUM,
    values: [SHOPPRE, CUSTOMER],
  },
  store_type: DataTypes.STRING,
  url: DataTypes.STRING(10000),
  code: DataTypes.STRING,
  color: DataTypes.STRING,
  size: DataTypes.STRING,
  note: DataTypes.STRING,
  if_item_unavailable: DataTypes.STRING,
  status: DataTypes.STRING,
  is_image_resized: DataTypes.BOOLEAN,
});
