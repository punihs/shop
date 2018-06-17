const {
  CONSIGNMENT_TYPES: { DOC, NONDOC }, CONTENT_TYPES: { REGULAR, SPECIAL },
} = require('../../config/constants');

module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  consignment_type: {
    type: DataTypes.ENUM,
    defaultValue: NONDOC,
    values: [DOC, NONDOC],
  },
  reference_code: DataTypes.STRING,
  comments: DataTypes.STRING,
  weight: DataTypes.DECIMAL(15, 2),
  price_amount: DataTypes.STRING,

  content_type: {
    type: DataTypes.ENUM,
    values: [REGULAR, SPECIAL],
    defaultValue: 1,
  },
  is_public: { type: DataTypes.BOOLEAN, defaultValue: false },
  splitting_directions: DataTypes.STRING,
});

