const { engine, timestamps, keys } = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('package_items', Object.assign({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    price_amount: DataTypes.DOUBLE,
    total_amount: DataTypes.DOUBLE,
    object: DataTypes.STRING,
    price_entered_by: DataTypes.INTEGER,
    package_id: keys('packages'),
    package_item_category_id: keys('package_item_categories'),
  }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('package_items');
  },
};
