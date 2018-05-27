const { engine, timestamps } = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('countries', Object.assign({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: DataTypes.STRING,
    slug: {
      type: DataTypes.STRING(60),
      unique: true,
    },
    iso2: {
      type: DataTypes.STRING(2),
      unique: true,
    },
    iso3: {
      type: DataTypes.STRING(3),
      unique: true,
    },
    phone_code: DataTypes.INTEGER,
    currency_code: DataTypes.STRING(3),
    capital_city: DataTypes.STRING,
    discount_percentage: DataTypes.INTEGER,
    is_shipping_available: DataTypes.BOOLEAN,
  }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('countries');
  },
};
