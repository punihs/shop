const {
  PHOTO_REQUEST_STATES: { PENDING, COMPLETED },
  PHOTO_REQUEST_TYPES: { BASIC, ADVANCED },
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
  type: {
    type: DataTypes.ENUM,
    values: [BASIC, ADVANCED],
  },
  status: {
    type: DataTypes.ENUM,
    values: [PENDING, COMPLETED],
  },
  description: DataTypes.STRING,
  charge_amount: DataTypes.DOUBLE(10, 2),
});

