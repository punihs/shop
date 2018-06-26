const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('packages', Object
      .assign(properties('package', DataTypes), {
        store_id: keys('stores'),
        shipment_id: keys('shipments'),
        created_by: keys('users'),
        customer_id: keys('users'),
        package_state_id: keys('package_states'),
      }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('packages');
  },
};
