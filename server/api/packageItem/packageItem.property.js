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
  total_amount: DataTypes.DOUBLE,
  object: DataTypes.STRING,
  price_entered_by: {
    type: DataTypes.ENUM,
    values: [SHOPPRE, CUSTOMER],
  },
  is_image_resized: DataTypes.BOOLEAN,
});
