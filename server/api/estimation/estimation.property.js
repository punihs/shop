const {
  CONSIGNMENT_TYPES: { DOC, NONDOC },
} = require('../../config/constants');

module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unsigned: true,
    unique: true,
  },
  amount: DataTypes.INTEGER,
  consignment_type: {
    type: DataTypes.ENUM,
    values: [DOC, NONDOC],
  },
  weight: DataTypes.INTEGER,
  slug: DataTypes.STRING,
});

