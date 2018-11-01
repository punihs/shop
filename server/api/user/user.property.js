
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
  virtual_address_code: {
    type: DataTypes.STRING(10),
    unique: {
      args: true,
      message: 'Locker code already in use!',
    },
  },
  profile_photo_url: DataTypes.STRING,

  phone: DataTypes.STRING,

  secondary_phone: DataTypes.STRING,

  wallet_balance_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  email_verify: {
    type: DataTypes.ENUM,
    values: ['yes', 'no'],
  },
  email_token: DataTypes.STRING,
  remember_token: DataTypes.STRING,
  admin_info: DataTypes.STRING,
  admin_read: {
    type: DataTypes.ENUM,
    values: ['yes', 'no'],
  },
  is_prime: DataTypes.INTEGER,
  is_seller: {
    type: DataTypes.ENUM,
    values: ['0', '1'],
  },
  medium: DataTypes.STRING,
  google_contacts_accessed: DataTypes.BOOLEAN,
  otp: DataTypes.STRING,
  facebook: DataTypes.JSON,
  twitter: DataTypes.JSON,
  google: DataTypes.JSON,
  github: DataTypes.JSON,
});
