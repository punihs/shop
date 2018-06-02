const { engine, timestamps, keys } = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('reviews', Object.assign({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: DataTypes.STRING,
    source_id: DataTypes.INTEGER,
    description: DataTypes.STRING(10000),
    rating: DataTypes.INTEGER,
    is_approved: DataTypes.BOOLEAN,
    approved_by: DataTypes.INTEGER,
    customer_id: keys('users'),
    shipment_id: keys('shipments'),
  }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('reviews');
  },
};
