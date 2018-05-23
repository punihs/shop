const { engine, timestamps, keys } = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('orders', Object.assign({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: DataTypes.STRING,
    tracking_code: DataTypes.STRING,
    invoice_code: DataTypes.STRING,
    comments: DataTypes.STRING,
    object: DataTypes.STRING,
    customer_id: keys('users'),
    created_by: keys('users'),
    store_id: keys('stores'),
    package_id: keys('packages'),
  }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('orders');
  },
};
