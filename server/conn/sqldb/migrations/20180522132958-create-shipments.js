const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('shipments', Object
    .assign(properties('shipment', DataTypes), {
      created_by: keys('users'),
      customer_id: keys('users'),
      country_id: keys('stores'),
      address_id: keys('addresses'),
      shipment_state_id: keys('shipment_states'),
    }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('shipments');
  },
};
