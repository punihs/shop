const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('package_items', {
    ...properties('packageItem', DataTypes),
    created_by: keys('users'),
    package_id: keys('packages'),
    package_item_category_id: keys('package_item_categories'),
    ...timestamps(3, DataTypes),
  }, engine),
  down(queryInterface) {
    return queryInterface.dropTable('package_items');
  },
};
