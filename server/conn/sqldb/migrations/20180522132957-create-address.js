const { engine, timestamps, keys } = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('addresses', Object.assign({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    salutation: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    line1: DataTypes.STRING,
    line2: DataTypes.STRING,
    state: DataTypes.STRING,
    city: DataTypes.STRING,
    pincode: DataTypes.STRING,
    email: DataTypes.STRING,
    country_id: keys('countries'),
    phone_code: DataTypes.STRING,
    phone: DataTypes.STRING,
    is_default: DataTypes.BOOLEAN,
    customer_id: keys('users'),
  }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('addresses');
  },
};
