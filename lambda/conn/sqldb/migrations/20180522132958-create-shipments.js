const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('shipments', Object
    .assign(properties('shipment', DataTypes), {
      shipping_partner_id: keys('shipping_partners'),
      payment_gateway_id: keys('payment_gateways'),
      shipment_type_id: keys('shipment_types'),
      created_by: keys('users'),
      customer_id: keys('users'),
      country_id: keys('stores'),
      address_id: keys('addresses'),
      destination_city_id: keys('places'),
      shipment_state_id: keys('shipment_states'),
    }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('shipments');
  },
};
