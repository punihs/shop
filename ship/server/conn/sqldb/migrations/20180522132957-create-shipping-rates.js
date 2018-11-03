
const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('shipping_rates', Object
      .assign(properties('shippingRate', DataTypes), {
        country_id: keys('countries'),
        shipping_partner_id: keys('shipping_partners'),
      }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('shipping_rates');
  },
};

