const { shippingRate } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('shipping_rates', shippingRate, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('shipping_rates', { id: [1] });
  },
};
