
const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('reviews', Object
      .assign(properties('review', DataTypes), {
        customer_id: keys('users'),
        shipment_id: keys('shipments'),
        country_id: keys('countries'),
      }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('reviews');
  },
};
