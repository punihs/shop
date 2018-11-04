
module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  salutation: DataTypes.STRING,
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  email: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: {
      args: true,
      message: 'Email address already in use!',
    },
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
  alternate_email: DataTypes.STRING,
  profile_photo_url: DataTypes.STRING,

  phone: DataTypes.STRING,

  secondary_phone: DataTypes.STRING,

  wallet_balance_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
});
