const {
  RATE_TYPES: { FIXED, MULTIPLE }, CONSIGNMENT_TYPES: { DOC, NONDOC },
} = require('../../config/constants');

module.exports = DataTypes => ({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  minimum: DataTypes.DECIMAL(5, 1),
  maximum: DataTypes.DECIMAL(5, 1),
  amount: DataTypes.DOUBLE(8, 2),
  courier: DataTypes.STRING,
  timerange: DataTypes.STRING,
  consignment_type: {
    type: DataTypes.ENUM,
    values: [DOC, NONDOC],
  },
  rate_type: {
    type: DataTypes.ENUM,
    values: [FIXED, MULTIPLE],
  },
});
