const {
  CONTENT_TYPES: { REGULAR, SPECIAL }, PACKAGE_TYPES: {
    NORMAL,
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
  reference_code: DataTypes.STRING,
  comments: DataTypes.STRING,
  weight: DataTypes.DECIMAL(15, 2),
  price_amount: DataTypes.DECIMAL(15, 2),

  content_type: {
    type: DataTypes.ENUM,
    values: [REGULAR, SPECIAL],
    defaultValue: 1,
  },
  is_public: { type: DataTypes.BOOLEAN, defaultValue: false },
  splitting_directions: DataTypes.STRING,
  package_type: {
    type: DataTypes.ENUM,
    values: [NORMAL, INCOMING, PERSONAL_SHOPPER, COD],
  },
  invoice: DataTypes.STRING,
  invoice_code: DataTypes.STRING,
  notes: DataTypes.STRING,
  tracking_number: DataTypes.STRING,
});

