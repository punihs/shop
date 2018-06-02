const { engine, timestamps, keys } = require('../helper.js');

module.exports = {
  up(queryInterface, DataTypes) {
    return queryInterface.createTable('users', Object.assign({
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      salutation: DataTypes.STRING,
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING(64),
        unique: true,
      },
      password: DataTypes.STRING,
      locker_code: {
        type: DataTypes.STRING(20),
        unique: true,
      },
      country_code: DataTypes.STRING,
      phone: DataTypes.STRING,
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
      group_id: keys('groups'),
      country_id: keys('countries'),
      referred_by: keys('users'),
    }, timestamps(3, DataTypes)), engine);
  },
  down(queryInterface) {
    return queryInterface.dropTable('users');
  },
};
