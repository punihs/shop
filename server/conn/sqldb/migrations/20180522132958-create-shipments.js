const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('shipments', Object
    .assign(properties('shipment', DataTypes), {
      country_id: keys('stores'),
      city_id: keys('cities'),
      shipping_partner_id: keys('shipping_partners'),
      payment_gateway_id: keys('payment_gateways'),
      shipment_type_id: keys('shipment_types'),
      created_by: keys('users'),
      customer_id: keys('users'),
    }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('shipments');
  },
};
