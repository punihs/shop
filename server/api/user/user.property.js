
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
  email: DataTypes.STRING,
  alternate_email: DataTypes.STRING,
  password: DataTypes.STRING,
  locker_code: DataTypes.STRING,

  phone_code: DataTypes.STRING,
  phone: DataTypes.STRING,

  secondary_phone_code: DataTypes.STRING,
  secondary_phone: DataTypes.STRING,

  wallet_balance_amount: DataTypes.DECIMAL(15, 2),
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
