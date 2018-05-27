const {
  PHOTO_REQUEST_STATES: { PENDING, COMPLETED },
  PHOTO_REQUEST_TYPES: { STANDARD, ADVANCED },
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
    values: [STANDARD, ADVANCED],
  },
  status: {
    type: DataTypes.ENUM,
    values: [PENDING, COMPLETED],
  },
  description: DataTypes.STRING,
});

