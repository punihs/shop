const { engine, timestamps, keys } = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('reviews', Object.assign({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    person: DataTypes.STRING,
    source: DataTypes.STRING,
    review: DataTypes.STRING(10000),
    rating: DataTypes.INTEGER,
    approve: DataTypes.BOOLEAN,
    shipment_id: keys('shipments'),
    country_id: keys('countries'),
  }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('reviews');
  },
};
