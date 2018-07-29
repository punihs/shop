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
  is_default: DataTypes.BOOLEAN,
  email: {
    type: DataTypes.STRING(64),
    validate: {
      isEmail: {
        args: true,
        msg: 'Please input a valid email',
      },
      max: {
        args: 64,
        msg: 'Email id must less than 64 characters.',
      },
    },
  },
});
