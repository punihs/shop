const { SALUTATIONS } = require('./../../config/constants');

module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  salutation: {
    type: DataTypes.ENUM,
    values: Object.values(SALUTATIONS),
  },
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  line1: DataTypes.STRING,
  line2: DataTypes.STRING,
  state: DataTypes.STRING,
  city: DataTypes.STRING,
  pincode: DataTypes.STRING,
  phone_code: DataTypes.STRING,
  phone: DataTypes.STRING,
  email: DataTypes.STRING,
  is_default: DataTypes.BOOLEAN,
});
